/** Number of calendar days in the UTC month of `now` (max of the monthly progress bar). */
export function utcDaysInMonth(now: Date = new Date()): number {
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();
  return new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
}

/** Counts entries whose `createdAt` falls into the UTC month of `now`. */
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
