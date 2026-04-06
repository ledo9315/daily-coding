import type { RankingPeriod } from "@/lib/generated/prisma/enums";

/** UTC-Mitternacht für den Kalendertag von `d` (reine Datumsgrenze, konsistent mit Seed). */
export function startOfUtcDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

/** Montag 00:00 UTC der ISO-Woche, die `d` enthält. */
export function startOfUtcWeek(d: Date): Date {
  const date = startOfUtcDay(d);
  const day = date.getUTCDay(); // 0 So … 6 Sa
  const delta = day === 0 ? -6 : 1 - day;
  date.setUTCDate(date.getUTCDate() + delta);
  return date;
}

/** Erster Tag des UTC-Kalendermonats. */
export function startOfUtcMonth(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}

/**
 * `periodDate` für RankingEntry-Abfragen — muss exakt zum Seed und zur DB passen.
 */
export function getPeriodDateForRanking(
  period: RankingPeriod,
  now: Date = new Date()
): Date {
  switch (period) {
    case "today":
      return startOfUtcDay(now);
    case "week":
      return startOfUtcWeek(now);
    case "month":
      return startOfUtcMonth(now);
  }
}
