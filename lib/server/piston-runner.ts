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
};

type PistonExecuteResponse = {
  compile?: { stdout: string; stderr: string; code: number; output?: string };
  run?: {
    stdout: string;
    stderr: string;
    code: number;
    signal: string | null;
    output?: string;
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
    default:
      return { name: "main.js", content: code };
  }
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

  const body: PistonExecuteBody = {
    language: rt.language,
    version: rt.version,
    files: [fileForLanguage(language, code)],
    stdin,
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
  const compileFail = data.compile && data.compile.code !== 0;
  const run = data.run;
  const runFail = !run || run.code !== 0;

  const stdout = run?.stdout ?? "";
  const stderrRun = run?.stderr ?? "";
  const compileStderr = data.compile?.stderr ?? "";
  const compileOut = data.compile?.stdout ?? "";

  const exitCode = run?.code ?? (compileFail ? data.compile!.code : -1);
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
    compileOutput: [compileOut, compileStderr].filter(Boolean).join("\n").trim(),
    durationMs,
  };
}
