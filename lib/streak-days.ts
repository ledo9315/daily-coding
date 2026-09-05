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

/**
 * The last `days` UTC days ending at `dayStartUtc` (inclusive), oldest first, each true
 * when it carries a completed submission.
 *
 * Unlike the streak this does not stop at the first gap - a week with a hole in it is
 * exactly what the shared result is meant to show.
 */
export function completedWeekStrip(
  dayStartUtc: Date,
  completedDays: Set<string>,
  days: number
): boolean[] {
  const cursor = new Date(dayStartUtc);
  cursor.setUTCDate(cursor.getUTCDate() - (days - 1));

  const strip: boolean[] = [];
  for (let i = 0; i < days; i += 1) {
    strip.push(completedDays.has(utcDayKey(cursor)));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return strip;
}
