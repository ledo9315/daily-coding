import { prisma } from "@/lib/prisma";
import {
  startOfUtcMonth,
  startOfUtcWeek,
} from "@/lib/server/ranking-period";

function endExclusiveUtcWeek(weekStart: Date): Date {
  const d = new Date(weekStart);
  d.setUTCDate(d.getUTCDate() + 7);
  return d;
}

function endExclusiveUtcMonth(monthStart: Date): Date {
  const d = new Date(monthStart);
  d.setUTCMonth(d.getUTCMonth() + 1);
  return d;
}

export type LiveRankingUser = {
  id: string;
  name: string;
  initials: string;
  avatar: string;
};

/** One API row — ranked by the number of daily challenges solved, points as the sum. */
export type LiveRankingRow = {
  userId: string;
  rank: number;
  user: LiveRankingUser;
  /** Sum of challenge points across the daily challenges solved in the period. */
  points: number;
  /** Number of distinct daily challenges with a "completed" submission. */
  challengesSolved: number;
};

export async function getLiveRanking(
  period: "week" | "month",
  now: Date = new Date()
): Promise<LiveRankingRow[]> {
  return period === "week" ? getWeekLiveRanking(now) : getMonthLiveRanking(now);
}

async function getWeekLiveRanking(now: Date): Promise<LiveRankingRow[]> {
  const weekStart = startOfUtcWeek(now);
  const weekEnd = endExclusiveUtcWeek(weekStart);
  return aggregatePeriodByDailyChallenges(weekStart, weekEnd);
}

async function getMonthLiveRanking(now: Date): Promise<LiveRankingRow[]> {
  const monthStart = startOfUtcMonth(now);
  const monthEnd = endExclusiveUtcMonth(monthStart);
  return aggregatePeriodByDailyChallenges(monthStart, monthEnd);
}

/**
 * Week/month: sorted by the **number** of successful daily submissions in the period,
 * ties broken by the **sum of challenge points**, then by
 * `userId` for a stable order.
 */
async function aggregatePeriodByDailyChallenges(
  periodStart: Date,
  periodEnd: Date
): Promise<LiveRankingRow[]> {
  const submissions = await prisma.submission.findMany({
    where: {
      status: "completed",
      createdAt: { gte: periodStart, lt: periodEnd },
    },
    include: {
      user: true,
      challenge: { select: { id: true, points: true } },
    },
  });

  const perUser = new Map<
    string,
    {
      user: (typeof submissions)[0]["user"];
      dayPoints: Map<string, number>;
    }
  >();

  for (const s of submissions) {
    let entry = perUser.get(s.userId);
    if (!entry) {
      entry = { user: s.user, dayPoints: new Map() };
      perUser.set(s.userId, entry);
    }
    const day = s.createdAt.toISOString().slice(0, 10);
    entry.dayPoints.set(day, Math.max(entry.dayPoints.get(day) ?? 0, s.challenge.points));
  }

  const rows = [...perUser.entries()].map(([userId, { user, dayPoints }]) => {
    const challengesSolved = dayPoints.size;
    const points = [...dayPoints.values()].reduce((a, b) => a + b, 0);
    return { userId, user, challengesSolved, points };
  });

  rows.sort(
    (a, b) =>
      b.challengesSolved - a.challengesSolved ||
      b.points - a.points ||
      a.userId.localeCompare(b.userId)
  );

  return rows.map((r, i) => ({
    userId: r.userId,
    rank: i + 1,
    user: {
      id: r.user.id,
      name: r.user.name,
      initials: r.user.initials,
      avatar: r.user.avatar,
    },
    points: r.points,
    challengesSolved: r.challengesSolved,
  }));
}
