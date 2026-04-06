import { utcDayKey } from "@/lib/streak-days";

const PREFIX = "dcc:solveStart:";

/** sessionStorage key: challenge id + UTC calendar day (fresh timer the next day). */
export function solveTimerStorageKey(challengeId: string, now: Date = new Date()): string {
  return `${PREFIX}${challengeId}:${utcDayKey(now)}`;
}

/** Records start time if none exists yet for today (UTC). */
export function ensureSolveStart(challengeId: string): void {
  if (typeof window === "undefined") return;
  const key = solveTimerStorageKey(challengeId);
  if (sessionStorage.getItem(key) == null) {
    sessionStorage.setItem(key, String(Date.now()));
  }
}

/** Wall-clock seconds since ensureSolveStart, or undefined if no start timestamp. */
export function getSolveDurationSeconds(challengeId: string): number | undefined {
  if (typeof window === "undefined") return undefined;
  const key = solveTimerStorageKey(challengeId);
  const raw = sessionStorage.getItem(key);
  if (raw == null) return undefined;
  const start = parseInt(raw, 10);
  if (!Number.isFinite(start)) return undefined;
  return Math.max(0, Math.floor((Date.now() - start) / 1000));
}

export function clearSolveTimer(challengeId: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(solveTimerStorageKey(challengeId));
}
