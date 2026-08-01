import { LANGUAGES, pistonLanguageName, type CodeLanguageId } from "@/lib/challenge-languages";

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
 * Extra CPU budget for the languages Piston compiles inside the run step — nothing for the rest.
 *
 * The compiler's own cost counts against the program's budget there. javac plus JVM startup
 * measured 2500-3100 ms and the Go toolchain about 1700 ms, against Piston's 3000 ms default:
 * submissions were killed with SIGKILL and no output at all. The container must allow the higher
 * ceiling too (PISTON_RUN_CPU_TIME in docker-compose.yml), otherwise Piston answers HTTP 400.
 *
 * The rest send no limit at all rather than Piston's own default: a host rejects any request
 * above its configured ceiling, and a value that merely *equals* it would make every submission
 * depend on how that comparison is meant. Omitting the field keeps them identical on every host.
 */
function runBudgetMs(language: CodeLanguageId): number | undefined {
  return LANGUAGES[language].compiledInRunStep ? 15_000 : undefined;
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

function compareVersionsDesc(a: string, b: string): number {
  const pa = a.split(".").map((x) => parseInt(x, 10) || 0);
  const pb = b.split(".").map((x) => parseInt(x, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pb[i] ?? 0) - (pa[i] ?? 0);
    if (d !== 0) return d;
  }
  return 0;
}

function pickVersion(
  runtimes: PistonRuntimeInfo[],
  language: CodeLanguageId
): PistonRuntimeInfo {
  /*
    Node ships twice in Piston, under the same language name and two runtimes; the others differ
    only by version, and Piston keeps the outdated ones around — Ruby 2.5 next to 3.0, TypeScript
    4.2 next to 5.0. Picking the first match would be a coin flip.
  */
  const name = pistonLanguageName(language);
  if (language === "javascript") {
    const node = runtimes.find((r) => r.language === name && r.runtime === "node");
    if (node) return node;
  }
  const prefix = LANGUAGES[language].versionPrefix;
  const candidates = runtimes
    .filter((r) => r.language === name && (!prefix || r.version.startsWith(prefix)))
    .sort((a, b) => compareVersionsDesc(a.version, b.version));

  // The newest matching one, not the first: a host can carry Python 3.10 and 3.12 side by side.
  const best = candidates[0] ?? runtimes.find((r) => r.language === name);
  if (!best) {
    throw new Error(`Piston: no runtime for ${name}`);
  }
  return best;
}

function fileForLanguage(language: CodeLanguageId, code: string) {
  return { name: LANGUAGES[language].pistonFile, content: code };
}

/**
 * Java and Go have no compile stage in Piston — the compiler runs inside the run step, so a
 * rejected program looks like a failed run. Without this the caller would treat a compiler
 * message as the program's output and run the same broken program once per test case.
 *
 * Empty stdout is the shared half of the test: a program that printed something has run, whatever
 * it said afterwards. The language-specific half is the pattern in the registry.
 */
function compileFailedInRunStep(
  language: CodeLanguageId,
  stderr: string,
  stdout: string
): boolean {
  const pattern = LANGUAGES[language].compileFailure;
  if (!pattern) return false;
  return stdout.trim().length === 0 && pattern.test(stderr);
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
    (runFail && compileFailedInRunStep(language, stderrRun, stdout));
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
    /*
      When the compiler ran inside the run step its message lives in stderrRun — the joined
      `stderr` above would hand the caller a block labelled "Run:" for a compile error.
    */
    compileOutput:
      compileFail && LANGUAGES[language].compiledInRunStep
        ? stderrRun.trim()
        : [compileOut, compileStderr].filter(Boolean).join("\n").trim(),
    durationMs,
  };
}
