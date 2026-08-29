import type { RankingPeriod } from "@/lib/generated/prisma/enums";

/** UTC midnight for the calendar day of `d` - a pure date boundary, consistent with the seed. */
export function startOfUtcDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

/** Monday 00:00 UTC of the ISO week containing `d`. */
export function startOfUtcWeek(d: Date): Date {
  const date = startOfUtcDay(d);
  const day = date.getUTCDay(); // 0 So … 6 Sa
  const delta = day === 0 ? -6 : 1 - day;
  date.setUTCDate(date.getUTCDate() + delta);
  return date;
}

/** First day of the UTC calendar month. */
export function startOfUtcMonth(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}

/**
 * `periodDate` for RankingEntry queries - must match the seed and the DB exactly.
 */
export function getPeriodDateForRanking(
  period: RankingPeriod,
  now: Date = new Date()
): Date {
  switch (period) {
    case "week":
      return startOfUtcWeek(now);
    case "month":
      return startOfUtcMonth(now);
  }
}
