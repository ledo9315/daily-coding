import { prisma } from "@/lib/prisma";
import { findDailyChallengeForApp } from "@/lib/server/challenge-day";
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

/** One API row — today ranks by fastest time, week/month by number of daily challenges solved (points = sum). */
export type LiveRankingRow = {
  userId: string;
  rank: number;
  user: LiveRankingUser;
  /** "today" only: best solve time in seconds. */
  timeSeconds: number | null;
  /** Today: points of the daily challenge. Week/month: sum of challenge points across the daily challenges solved in the period. */
  points: number;
  /** Week/month only: number of distinct daily challenges with a "completed" submission. */
  challengesSolved?: number;
};

export async function getLiveRanking(
  period: "today" | "week" | "month",
  now: Date = new Date()
): Promise<LiveRankingRow[]> {
  switch (period) {
    case "today":
      return getTodayLiveRanking();
    case "week":
      return getWeekLiveRanking(now);
    case "month":
      return getMonthLiveRanking(now);
  }
}

/**
 * The user's place in today's speed ranking (one daily challenge per day).
 * `null` when there is no completed submission for the current daily challenge.
 */
export async function getTodayRankNumber(userId: string): Promise<number | null> {
  const rows = await getTodayLiveRanking();
  const row = rows.find((r) => r.userId === userId);
  return row ? row.rank : null;
}

async function getTodayLiveRanking(): Promise<LiveRankingRow[]> {
  const challenge = await findDailyChallengeForApp();
  if (!challenge) return [];

  const submissions = await prisma.submission.findMany({
    where: {
      challengeId: challenge.id,
      status: "completed",
    },
    include: { user: true },
    orderBy: { createdAt: "asc" },
  });

  const bestByUser = new Map<
    string,
    { time: number | null; user: (typeof submissions)[0]["user"] }
  >();

  for (const s of submissions) {
    const prev = bestByUser.get(s.userId);
    const t = s.timeTaken;
    if (!prev) {
      bestByUser.set(s.userId, { time: t, user: s.user });
      continue;
    }
    if (prev.time == null && t == null) continue;
    if (prev.time == null) {
      bestByUser.set(s.userId, { time: t, user: s.user });
      continue;
    }
    if (t == null) continue;
    if (t < prev.time) bestByUser.set(s.userId, { time: t, user: s.user });
  }

  const sorted = [...bestByUser.entries()]
    .map(([uid, { time, user }]) => ({
      userId: uid,
      user,
      timeSeconds: time,
      sortKey: time == null ? Number.POSITIVE_INFINITY : time,
    }))
    .sort(
      (a, b) =>
        a.sortKey - b.sortKey || a.userId.localeCompare(b.userId)
    );

  return sorted.map((r, i) => ({
    userId: r.userId,
    rank: i + 1,
    user: {
      id: r.user.id,
      name: r.user.name,
      initials: r.user.initials,
      avatar: r.user.avatar,
    },
    timeSeconds: r.timeSeconds,
    points: challenge.points,
  }));
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
 * Week/month: sorted by the **number** of daily challenges solved (`challenge.date`
 * within the period), ties broken by the **sum of challenge points**, then by
 * `userId` for a stable order.
 */
async function aggregatePeriodByDailyChallenges(
  periodStart: Date,
  periodEnd: Date
): Promise<LiveRankingRow[]> {
  const submissions = await prisma.submission.findMany({
    where: {
      status: "completed",
      challenge: {
        date: {
          gte: periodStart,
          lt: periodEnd,
        },
      },
    },
    include: {
      user: true,
      challenge: { select: { id: true, points: true, date: true } },
    },
  });

  const perUser = new Map<
    string,
    {
      user: (typeof submissions)[0]["user"];
      challengePoints: Map<string, number>;
    }
  >();

  for (const s of submissions) {
    if (!s.challenge.date) continue;
    let entry = perUser.get(s.userId);
    if (!entry) {
      entry = { user: s.user, challengePoints: new Map() };
      perUser.set(s.userId, entry);
    }
    entry.challengePoints.set(s.challengeId, s.challenge.points);
  }

  const rows = [...perUser.entries()].map(([userId, { user, challengePoints }]) => {
    const challengesSolved = challengePoints.size;
    const points = [...challengePoints.values()].reduce((a, b) => a + b, 0);
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
    timeSeconds: null,
    points: r.points,
    challengesSolved: r.challengesSolved,
  }));
}
