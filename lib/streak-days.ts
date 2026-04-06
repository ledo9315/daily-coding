/** YYYY-MM-DD in UTC für einen Zeitpunkt (für Mengen-Vergleiche). */
export function utcDayKey(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Anzahl aufeinanderfolgender UTC-Tage endend bei `dayStartUtc`, an denen ein Eintrag in
 * `completedDays` liegt (Menge von `utcDayKey`).
 */
export function consecutiveStreakFromCompletedDaySet(
  dayStartUtc: Date,
  completedDays: Set<string>
): number {
  let streak = 0;
  const cursor = new Date(dayStartUtc);
  while (completedDays.has(utcDayKey(cursor))) {
    streak++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}
