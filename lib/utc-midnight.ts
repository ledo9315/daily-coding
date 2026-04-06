/**
 * Millisekunden bis zur nächsten UTC-Kalendermitternacht (00:00:00.000 UTC).
 * Entspricht dem Tageswechsel für Daily-Challenge / Submissions im Projekt.
 */
export function getMsUntilNextUtcMidnight(now: Date = new Date()): number {
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();
  const d = now.getUTCDate();
  const nextUtcMidnight = new Date(Date.UTC(y, m, d + 1, 0, 0, 0, 0));
  return Math.max(0, nextUtcMidnight.getTime() - now.getTime());
}
