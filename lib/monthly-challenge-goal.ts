/** Anzahl Kalendertage im UTC-Monat von `now` (für den Monats-Fortschrittsbalken). */
export function utcDaysInMonth(now: Date = new Date()): number {
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();
  return new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
}

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
