import { utcDayKey, currentStreakDayKeys } from "@/lib/streak-days";
import { startOfUtcDay } from "@/lib/server/ranking-period";
import { utcDaysInMonth } from "@/lib/monthly-challenge-goal";

export type MonthlyActivityDayCell = {
  day: number | null;
  completed: boolean;
  /** Liegt in der aktuellen Gewinnserie (aufeinanderfolgende UTC-Tage mit Abschluss). */
  inStreak: boolean;
};

export type MonthlyActivity = {
  year: number;
  month: number;
  daysInMonth: number;
  cells: MonthlyActivityDayCell[];
  currentStreak: number;
  completedDaysInMonthCount: number;
};

/**
 * Kalenderraster für den UTC-Monat von `now`: Mo–So-Spalten, Füllzellen am Monatsanfang,
 * ein Kästchen pro Kalendertag. Streak kommt aus denselben UTC-Tag-Regeln wie im Rest der App.
 */
export function buildMonthlyActivityGrid(
  now: Date,
  allCompletedDayKeys: Set<string>
): MonthlyActivity {
  const streakKeys = currentStreakDayKeys(startOfUtcDay(now), allCompletedDayKeys);
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();
  const dim = utcDaysInMonth(now);
  const firstDow = new Date(Date.UTC(y, m, 1)).getUTCDay();
  const pad = (firstDow + 6) % 7;

  let completedDaysInMonthCount = 0;
  const cells: MonthlyActivityDayCell[] = [];

  for (let i = 0; i < pad; i++) {
    cells.push({ day: null, completed: false, inStreak: false });
  }

  for (let d = 1; d <= dim; d++) {
    const key = utcDayKey(new Date(Date.UTC(y, m, d)));
    const completed = allCompletedDayKeys.has(key);
    const inStreak = streakKeys.has(key);
    if (completed) completedDaysInMonthCount++;
    cells.push({ day: d, completed, inStreak });
  }

  return {
    year: y,
    month: m + 1,
    daysInMonth: dim,
    cells,
    currentStreak: streakKeys.size,
    completedDaysInMonthCount,
  };
}
