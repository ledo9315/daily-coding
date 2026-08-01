import { prisma } from "@/lib/prisma";
import { calculateLevel, nextLevelThreshold } from "@/lib/level";
import type { RankingEntry, TodayChallenge, UserStats } from "@/lib/api";
import {
  findDailyChallengeForApp,
  findTodaySubmission,
  publicSubmissionStatus,
} from "@/lib/server/challenge-day";
import { getLiveRanking } from "@/lib/server/ranking-live";
import {
  getAllTimeRankNumber,
  getLifetimePointsByUserIds,
} from "@/lib/server/user-points";
import { buildUserAchievementsView } from "@/lib/server/achievements";
import { countSubmissionsInUtcMonth, utcDaysInMonth } from "@/lib/monthly-challenge-goal";

function percentageDelta(current: number, previous: number): number {
  if (previous <= 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

export async function getTodayChallengeSummary(
  userId?: string
): Promise<TodayChallenge | null> {
  const challenge = await findDailyChallengeForApp();

  if (!challenge) return null;

  const todaySubmission = userId
    ? await findTodaySubmission(userId, challenge.id)
    : null;

  return {
    title: challenge.title.toUpperCase(),
    description: challenge.description,
    difficulty: challenge.difficulty,
    points: challenge.points,
    category: challenge.category.name.toUpperCase(),
    todayStatus: todaySubmission
      ? publicSubmissionStatus(todaySubmission.status)
      : null,
  };
}

/**
 * Top five of the running week. Used to be the daily ranking; that one is gone together
 * with the solve-time measurement (#91), and the week is the shortest period left.
 */
export async function getDashboardRankingPreviewData(): Promise<{
  week: RankingEntry[];
}> {
  const rows = await getLiveRanking("week");
  const top = rows.slice(0, 5);
  const userIds = top.map((e) => e.userId);
  const lifetimePoints = await getLifetimePointsByUserIds(userIds);

  return {
    week: top.map((e) => ({
      rank: e.rank,
      name: e.user.name,
      initials: e.user.initials,
      points: e.points,
      challengesSolved: e.challengesSolved,
      avatar: e.user.avatar,
      level: calculateLevel(lifetimePoints.get(e.userId) ?? 0),
    })),
  };
}

export async function getUserStatsData(
  userId: string
): Promise<UserStats | null> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;

  const resolvedUserId = user.id;

  const weeklyRankingEntries = await prisma.rankingEntry.findMany({
    where: { userId: resolvedUserId, period: "week" },
    orderBy: { periodDate: "desc" },
    take: 2,
    select: { rank: true },
  });

  const [allTimeRank, completedSubmissions, achievementDefs, userAchievements, totalUsers] =
    await Promise.all([
      getAllTimeRankNumber(resolvedUserId),
      prisma.submission.findMany({
        where: { userId: resolvedUserId, status: "completed" },
        include: { challenge: { select: { points: true, difficulty: true } } },
      }),
      prisma.achievementDef.findMany({ orderBy: { id: "asc" } }),
      prisma.userAchievement.findMany({ where: { userId: resolvedUserId } }),
      prisma.user.count(),
    ]);

  const { unlockedCount: unlockedBadges } = buildUserAchievementsView(
    achievementDefs,
    userAchievements,
    completedSubmissions,
    user.streakRecord
  );

  const points = completedSubmissions.reduce((sum, s) => sum + s.challenge.points, 0);
  const totalSolved = completedSubmissions.length;
  const level = calculateLevel(points);
  const monthlyChallengesSolved = countSubmissionsInUtcMonth(completedSubmissions);

  const now = new Date();
  const currentMonth = now.getUTCMonth();
  const currentYear = now.getUTCFullYear();
  const previousMonthDate = new Date(Date.UTC(currentYear, currentMonth - 1, 1));
  const previousMonth = previousMonthDate.getUTCMonth();
  const previousMonthYear = previousMonthDate.getUTCFullYear();

  const currentMonthPoints = completedSubmissions
    .filter(
      (s) =>
        s.createdAt.getUTCFullYear() === currentYear &&
        s.createdAt.getUTCMonth() === currentMonth
    )
    .reduce((sum, s) => sum + s.challenge.points, 0);

  const previousMonthPoints = completedSubmissions
    .filter(
      (s) =>
        s.createdAt.getUTCFullYear() === previousMonthYear &&
        s.createdAt.getUTCMonth() === previousMonth
    )
    .reduce((sum, s) => sum + s.challenge.points, 0);

  const currentWeekRank = weeklyRankingEntries[0]?.rank;
  const previousWeekRank = weeklyRankingEntries[1]?.rank;
  const rankTrendPercent =
    typeof currentWeekRank === "number" && typeof previousWeekRank === "number"
      ? percentageDelta(previousWeekRank, currentWeekRank)
      : 0;
  const rankTrendPlaces =
    typeof currentWeekRank === "number" && typeof previousWeekRank === "number"
      ? previousWeekRank - currentWeekRank
      : 0;
  const pointsTrendPercent = percentageDelta(currentMonthPoints, previousMonthPoints);

  return {
    rank: `#${allTimeRank}`,
    points: points.toLocaleString("de-DE"),
    rankTrendPercent,
    rankTrendPlaces,
    pointsTrendPercent,
    streak: user.streak,
    streakRecord: user.streakRecord,
    totalSolved,
    totalUsers,
    level,
    levelMax: nextLevelThreshold(level),
    badges: unlockedBadges,
    badgesTotal: achievementDefs.length,
    monthlyChallengesSolved,
    monthlyChallengeGoal: utcDaysInMonth(),
  };
}
