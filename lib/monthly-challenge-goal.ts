/**
 * Monatsziel: Anzahl erfolgreich abgeschlossener Challenges im **laufenden UTC-Kalendermonat**
 * im Verhältnis zu diesem festen Ziel (Gamification-Fortschrittsbalken).
 */
export const MONTHLY_CHALLENGE_GOAL = 30;

/** Zählt Einträge, deren `createdAt` in den UTC-Monat von `now` fällt. */
export function countSubmissionsInUtcMonth(
  submissions: { createdAt: Date }[],
  now: Date = new Date()
): number {
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();
  const start = new Date(Date.UTC(y, m, 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(y, m + 1, 1, 0, 0, 0, 0));
  return submissions.filter((s) => s.createdAt >= start && s.createdAt < end).length;
}
