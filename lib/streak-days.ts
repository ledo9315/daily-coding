/** YYYY-MM-DD in UTC for a point in time (used as a set key). */
export function utcDayKey(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Number of consecutive UTC days ending at `dayStartUtc` that have an entry in
 * `completedDays` (a set of `utcDayKey` values).
 */
/** All `utcDayKey` days of the running streak, walking back from `dayStartUtc` (inclusive). */
export function currentStreakDayKeys(
  dayStartUtc: Date,
  completedDays: Set<string>
): Set<string> {
  const keys = new Set<string>();
  const cursor = new Date(dayStartUtc);
  while (completedDays.has(utcDayKey(cursor))) {
    keys.add(utcDayKey(cursor));
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return keys;
}

export function consecutiveStreakFromCompletedDaySet(
  dayStartUtc: Date,
  completedDays: Set<string>
): number {
  return currentStreakDayKeys(dayStartUtc, completedDays).size;
}
