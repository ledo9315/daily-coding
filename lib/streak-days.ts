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
/** Alle `utcDayKey`-Tage der laufenden Serie rückwärts ab `dayStartUtc` (inkl. Starttag). */
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
