import { prisma } from "@/lib/prisma";
import { startOfUtcDay } from "@/lib/server/ranking-period";
import {
  utcDayKey,
  consecutiveStreakFromCompletedDaySet,
} from "@/lib/streak-days";

export { utcDayKey, consecutiveStreakFromCompletedDaySet } from "@/lib/streak-days";

const LOOKBACK_DAYS = 400;

/**
 * The UTC days with at least one completed submission, as `utcDayKey` values.
 *
 * No upper bound on the range: every caller walks backwards from its own reference day,
 * so rows after it are read and ignored rather than filtered - which keeps the streak and
 * the shared week strip on one query instead of two with different windows.
 */
export async function completedDayKeys(
  userId: string,
  asOf: Date = new Date()
): Promise<Set<string>> {
  const oldest = startOfUtcDay(asOf);
  oldest.setUTCDate(oldest.getUTCDate() - LOOKBACK_DAYS);

  const rows = await prisma.submission.findMany({
    where: {
      userId,
      status: "completed",
      createdAt: { gte: oldest },
    },
    select: { createdAt: true },
  });

  return new Set(rows.map((row) => utcDayKey(row.createdAt)));
}

/**
 * Current streak length: consecutive UTC calendar days with at least one completed
 * submission (`status === completed`), walking back from `asOf`.
 */
export async function computeConsecutiveStreakDays(
  userId: string,
  asOf: Date = new Date()
): Promise<number> {
  return consecutiveStreakFromCompletedDaySet(
    startOfUtcDay(asOf),
    await completedDayKeys(userId, asOf)
  );
}
