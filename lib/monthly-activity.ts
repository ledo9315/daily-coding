import { utcDayKey, currentStreakDayKeys } from "@/lib/streak-days";
import { startOfUtcDay } from "@/lib/server/ranking-period";
import { utcDaysInMonth } from "@/lib/monthly-challenge-goal";

export type MonthlyActivityDayCell = {
  day: number | null;
  completed: boolean;
  /** Part of the current streak (consecutive UTC days with a completion). */
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
 * Calendar grid for the UTC month of `now`: Mon–Sun columns, filler cells at the
 * start of the month, one cell per calendar day. The streak follows the same
 * UTC-day rules as the rest of the app.
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
