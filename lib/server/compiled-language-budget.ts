import { isTypedLanguage, type CodeLanguageId } from "@/lib/challenge-languages";
import { checkRateLimit } from "@/lib/server/rate-limiter";

/**
 * Runs per minute the sandbox accepts for all compiled languages together, across every
 * user and both endpoints. Sized from the load test of 2026-09-05 on the 4-core host: Java
 * peaks at about three executions a second, and 50 simultaneous Java jobs starved each
 * other into the 15 s timeout. A run is a probe plus five parallel cases, so 30 runs a
 * minute keep the host near what it can actually finish.
 */
export const COMPILED_RUNS_PER_MINUTE = 30;

/** One key for all of them: they share the same CPU, so a Java burst is also a Rust budget. */
const BUCKET_KEY = "challenge-compiled:global";

/**
 * Whether the sandbox has room for one more run in a compiled language. Interpreted
 * languages always pass - JavaScript and Python cost the host a few milliseconds each and
 * the per-IP and per-user limits are enough for them.
 */
export async function reserveCompiledLanguageRun(language: CodeLanguageId): Promise<boolean> {
  if (!isTypedLanguage(language)) return true;
  return checkRateLimit(BUCKET_KEY, COMPILED_RUNS_PER_MINUTE, 60_000);
}
