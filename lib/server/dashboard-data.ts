import { prisma } from "@/lib/prisma";
import { formatTime } from "@/lib/format";
import { calculateLevel, nextLevelThreshold } from "@/lib/level";
import type { RankingEntry, TodayChallenge, UserStats } from "@/lib/api";
import { CURRENT_USER_ID } from "@/lib/server/app-config";
import { findDailyChallengeForApp } from "@/lib/server/challenge-day";
import { getPeriodDateForRanking } from "@/lib/server/ranking-period";
import { getLifetimePointsByUserIds } from "@/lib/server/user-points";

export async function getTodayChallengeSummary(): Promise<TodayChallenge | null> {
  const challenge = await findDailyChallengeForApp();

  if (!challenge) return null;

  return {
    title: challenge.title.toUpperCase(),
    description: challenge.description,
    difficulty: challenge.difficulty,
    points: challenge.points,
    category: challenge.category.name.toUpperCase(),
  };
}

export async function getDashboardRankingPreviewData(): Promise<{
  today: RankingEntry[];
}> {
  const periodDate = getPeriodDateForRanking("today");
  const todayEntries = await prisma.rankingEntry.findMany({
    where: { period: "today", periodDate },
    orderBy: { rank: "asc" },
    take: 5,
    include: { user: true },
  });

  const userIds = todayEntries.map((e) => e.userId);
  const lifetimePoints = await getLifetimePointsByUserIds(userIds);

  return {
    today: todayEntries.map((e) => ({
      rank: e.rank,
      name: e.user.name,
      initials: e.user.initials,
      points: e.points,
      time: formatTime(e.timeTaken),
      avatar: e.user.avatar,
      level: calculateLevel(lifetimePoints.get(e.userId) ?? 0),
    })),
  };
}

export async function getUserStatsData(): Promise<UserStats> {
  const [user, todayRank, completedSubmissions, unlockedBadges] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: CURRENT_USER_ID } }),
    prisma.rankingEntry.findUnique({
      where: {
        userId_period_periodDate: {
          userId: CURRENT_USER_ID,
          period: "today",
          periodDate: getPeriodDateForRanking("today"),
        },
      },
    }),
    prisma.submission.findMany({
      where: { userId: CURRENT_USER_ID, status: "completed" },
      include: { challenge: { select: { points: true } } },
    }),
    prisma.userAchievement.count({
      where: { userId: CURRENT_USER_ID, unlockedAt: { not: null } },
    }),
  ]);

  const points = completedSubmissions.reduce((sum, s) => sum + s.challenge.points, 0);
  const totalSolved = completedSubmissions.length;
  const level = calculateLevel(points);

  return {
    rank: todayRank ? `#${todayRank.rank}` : "#-",
    points: points.toLocaleString("de-DE"),
    streak: user.streak,
    streakRecord: user.streakRecord,
    totalSolved,
    level,
    levelMax: nextLevelThreshold(level),
    badges: unlockedBadges,
    badgesTotal: 6,
  };
}
