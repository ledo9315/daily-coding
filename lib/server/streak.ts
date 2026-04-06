import { prisma } from "@/lib/prisma";
import { startOfUtcDay } from "@/lib/server/ranking-period";
import {
  utcDayKey,
  consecutiveStreakFromCompletedDaySet,
} from "@/lib/streak-days";

export { utcDayKey, consecutiveStreakFromCompletedDaySet } from "@/lib/streak-days";

const LOOKBACK_DAYS = 400;

/**
 * Längste aktuelle Streak: aufeinanderfolgende UTC-Kalendertage mit mindestens einer
 * abgeschlossenen Submission (`status === completed`), rückwärts ab `asOf`.
 */
export async function computeConsecutiveStreakDays(
  userId: string,
  asOf: Date = new Date()
): Promise<number> {
  const dayStart = startOfUtcDay(asOf);
  const oldest = new Date(dayStart);
  oldest.setUTCDate(oldest.getUTCDate() - LOOKBACK_DAYS);

  const rows = await prisma.submission.findMany({
    where: {
      userId,
      status: "completed",
      createdAt: { gte: oldest },
    },
    select: { createdAt: true },
  });

  const completedDays = new Set<string>();
  for (const r of rows) {
    completedDays.add(utcDayKey(r.createdAt));
  }

  return consecutiveStreakFromCompletedDaySet(dayStart, completedDays);
}
