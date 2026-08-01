import type { CodeLanguageId } from "@/lib/challenge-languages";

/** Locally: docker compose serves Piston on port 2000. The public EMKC API is whitelist-only, so it is no longer the default. */
const DEFAULT_PISTON_ORIGIN = "http://127.0.0.1:2000";

type PistonRuntimeInfo = {
  language: string;
  version: string;
  runtime?: string;
  aliases?: string[];
};

type PistonExecuteBody = {
  language: string;
  version: string;
  files: { name?: string; content: string }[];
  stdin?: string;
  run_timeout?: number;
  run_cpu_time?: number;
};

/**
 * Extra CPU budget for Java, in milliseconds — nothing for the other languages.
 *
 * javac plus JVM startup measured 2500-3100 ms on an empty program, right at Piston's 3000 ms
 * default, so submissions were killed at random with SIGKILL and no output at all. The container
 * must allow the higher ceiling too (PISTON_RUN_CPU_TIME in docker-compose.yml), otherwise
 * Piston answers HTTP 400.
 *
 * The interpreted languages send no limit at all rather than Piston's own default: a host
 * rejects any request above its configured ceiling, and a value that merely *equals* it would
 * make every submission depend on how that comparison is meant. Omitting the field keeps their
 * behaviour identical on every host.
 */
function runBudgetMs(language: CodeLanguageId): number | undefined {
  return language === "java" ? 15_000 : undefined;
}

type PistonExecuteResponse = {
  compile?: { stdout: string; stderr: string; code: number; output?: string };
  run?: {
    stdout: string;
    stderr: string;
    code: number;
    signal: string | null;
    output?: string;
    /** Piston's own verdict, e.g. "Time limit exceeded". The only trace a SIGKILL leaves. */
    message?: string | null;
  };
};

const runtimeCache = new Map<string, PistonRuntimeInfo[]>();

/**
 * Optional bearer token for a hardened, publicly reachable Piston endpoint,
 * where a reverse proxy requires the header. Without PISTON_API_TOKEN no auth
 * headers are sent, which is the local development case.
 */
function pistonAuthHeaders(): Record<string, string> {
  const token = process.env.PISTON_API_TOKEN;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Self-hosted: PISTON_API_URL is the origin, e.g. http://127.0.0.1:2000 -> /api/v2/runtimes
 * Legacy (EMKC): …/api/v2/piston -> …/runtimes below that prefix
 */
export function pistonHttpEndpoints(rawBase: string): {
  runtimes: string;
  execute: string;
} {
  const base = rawBase.trim().replace(/\/+$/u, "");
  const legacyEmkcStyle = /\/api\/v2\/piston$/u.test(base);
  const apiV2Root = legacyEmkcStyle ? base : `${base}/api/v2`;
  return {
    runtimes: `${apiV2Root}/runtimes`,
    execute: `${apiV2Root}/execute`,
  };
}

export async function fetchPistonRuntimes(
  runtimesUrl: string
): Promise<PistonRuntimeInfo[]> {
  const hit = runtimeCache.get(runtimesUrl);
  if (hit && hit.length > 0) return hit;
  const res = await fetch(runtimesUrl, {
    headers: pistonAuthHeaders(),
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Piston runtimes: HTTP ${res.status} ${text.slice(0, 200)}`);
  }
  const list = (await res.json()) as PistonRuntimeInfo[];
  // Never cache an empty list — it would stay empty forever after `pnpm piston:install`.
  if (list.length > 0) runtimeCache.set(runtimesUrl, list);
  return list;
}

/** For tests, or after the Piston URL changes */
export function clearPistonRuntimeCache(): void {
  runtimeCache.clear();
}

function pickVersion(
  runtimes: PistonRuntimeInfo[],
  language: CodeLanguageId
): PistonRuntimeInfo {
  if (language === "javascript") {
    const node = runtimes.find(
      (r) => r.language === "javascript" && r.runtime === "node"
    );
    if (node) return node;
  }
  if (language === "typescript") {
    const ts5 = runtimes.find(
      (r) => r.language === "typescript" && r.version.startsWith("5.")
    );
    if (ts5) return ts5;
  }
  if (language === "python") {
    const py = runtimes.find(
      (r) => r.language === "python" && !r.language.includes("2")
    );
    if (py) return py;
  }
  if (language === "php") {
    const ph = runtimes.find((r) => r.language === "php");
    if (ph) return ph;
  }
  if (language === "java") {
    const jv = runtimes.find((r) => r.language === "java");
    if (jv) return jv;
  }
  const fallback = runtimes.find((r) => r.language === language);
  if (!fallback) {
    throw new Error(`Piston: no runtime for ${language}`);
  }
  return fallback;
}

function fileForLanguage(language: CodeLanguageId, code: string) {
  switch (language) {
    case "typescript":
      return { name: "main.ts", content: code };
    case "python":
      return { name: "main.py", content: code };
    case "php":
      return { name: "main.php", content: code };
    /*
      No extension on purpose. Piston appends `.java` itself, so a file called `Main.java` is
      compiled as `Main.java.java` and every error message names a file the user never saw —
      the same trap as `main.ts.ts`. Handing over `Main` yields plain `Main.java:12: error: …`.
    */
    case "java":
      return { name: "Main", content: code };
    default:
      return { name: "main.js", content: code };
  }
}

/**
 * Java has no compile stage in Piston: javac runs inside the run step, so a rejected program
 * comes back as exit 1 with an empty stdout and `error: compilation failed` on stderr. Without
 * this the caller would treat a compiler message as the program's output and run it once per
 * test case.
 */
function javaCompileFailure(stderr: string, stdout: string): boolean {
  return stdout.trim().length === 0 && /^error: compilation failed$/mu.test(stderr);
}

export type PistonRunResult = {
  ok: boolean;
  exitCode: number;
  stdout: string;
  stderr: string;
  compileStderr: string;
  /**
   * The program never ran: the compiler rejected it. Callers must not present the output as a
   * test result — it is not what the program produced, it is why it produced nothing.
   */
  compileFailed: boolean;
  /** Everything the compiler said. tsc writes its errors to stdout, not stderr. */
  compileOutput: string;
  durationMs: number;
};

export async function executeWithPiston(
  language: CodeLanguageId,
  code: string,
  stdin = ""
): Promise<PistonRunResult> {
  const origin = (
    process.env.PISTON_API_URL ?? DEFAULT_PISTON_ORIGIN
  ).replace(/\/+$/u, "");
  const { runtimes: runtimesUrl, execute: executeUrl } =
    pistonHttpEndpoints(origin);
  const runtimes = await fetchPistonRuntimes(runtimesUrl);
  if (runtimes.length === 0) {
    return {
      ok: false,
      exitCode: -1,
      stdout: "",
      stderr:
        "Piston meldet keine Laufzeiten. Nach Start des Containers: pnpm piston:install (javascript, typescript, python, php).",
      compileStderr: "",
      compileFailed: false,
      compileOutput: "",
      durationMs: 0,
    };
  }
  const rt = pickVersion(runtimes, language);

  const budget = runBudgetMs(language);
  const body: PistonExecuteBody = {
    language: rt.language,
    version: rt.version,
    files: [fileForLanguage(language, code)],
    stdin,
    ...(budget ? { run_timeout: budget, run_cpu_time: budget } : {}),
  };

  const t0 = Date.now();
  const res = await fetch(executeUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...pistonAuthHeaders() },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(20_000),
  });
  const durationMs = Date.now() - t0;

  if (!res.ok) {
    const text = await res.text();
    return {
      ok: false,
      exitCode: -1,
      stdout: "",
      stderr: `Piston HTTP ${res.status}: ${text.slice(0, 500)}`,
      compileStderr: "",
      compileFailed: false,
      compileOutput: "",
      durationMs,
    };
  }

  const data = (await res.json()) as PistonExecuteResponse;
  const run = data.run;
  const runFail = !run || run.code !== 0;

  const stdout = run?.stdout ?? "";
  /*
    A program killed for exceeding its budget writes nothing at all — no stdout, no stderr, exit
    code null. Without Piston's message the user was told "Exit -1" and had no way to tell a
    timeout from a crash.
  */
  const stderrRun =
    run?.stderr ||
    (runFail && run?.message ? `${run.message}${run.signal ? ` (${run.signal})` : ""}` : "");

  const compileFail =
    (data.compile && data.compile.code !== 0) ||
    (language === "java" && runFail && javaCompileFailure(stderrRun, stdout));
  const compileStderr = data.compile?.stderr ?? "";
  const compileOut = data.compile?.stdout ?? "";

  const exitCode = run?.code ?? data.compile?.code ?? -1;
  const ok = !compileFail && !runFail;

  const stderr = [compileStderr && `Compile:\n${compileStderr}`, stderrRun && `Run:\n${stderrRun}`]
    .filter(Boolean)
    .join("\n\n");

  return {
    ok,
    exitCode,
    stdout: compileOut + stdout,
    stderr: stderr || (compileFail ? compileStderr : stderrRun),
    compileStderr,
    compileFailed: Boolean(compileFail),
    // Java's compiler writes into the run step, so its message lives in stderrRun — the joined
    // `stderr` above would hand the caller a block labelled "Run:" for a compile error.
    compileOutput:
      language === "java" && compileFail
        ? stderrRun.trim()
        : [compileOut, compileStderr].filter(Boolean).join("\n").trim(),
    durationMs,
  };
}
