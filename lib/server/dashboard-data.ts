import { prisma } from "@/lib/prisma";
import { formatTime } from "@/lib/format";
import { calculateLevel, nextLevelThreshold } from "@/lib/level";
import type { RankingEntry, TodayChallenge, UserStats } from "@/lib/api";
import { findDailyChallengeForApp } from "@/lib/server/challenge-day";
import { getLiveRanking, getTodayRankNumber } from "@/lib/server/ranking-live";
import { getLifetimePointsByUserIds } from "@/lib/server/user-points";
import { buildUserAchievementsView } from "@/lib/server/achievements";
import { countSubmissionsInUtcMonth, utcDaysInMonth } from "@/lib/monthly-challenge-goal";

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
  const rows = await getLiveRanking("today");
  const top = rows.slice(0, 5);
  const userIds = top.map((e) => e.userId);
  const lifetimePoints = await getLifetimePointsByUserIds(userIds);

  return {
    today: top.map((e) => ({
      rank: e.rank,
      name: e.user.name,
      initials: e.user.initials,
      points: e.points,
      time: formatTime(e.timeSeconds),
      avatar: e.user.avatar,
      level: calculateLevel(lifetimePoints.get(e.userId) ?? 0),
    })),
  };
}

export async function getUserStatsData(userId: string): Promise<UserStats | null> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;

  const [todayRankNum, completedSubmissions, achievementDefs, userAchievements] =
    await Promise.all([
      getTodayRankNumber(userId),
      prisma.submission.findMany({
        where: { userId: userId, status: "completed" },
        include: { challenge: { select: { points: true } } },
      }),
      prisma.achievementDef.findMany({ orderBy: { id: "asc" } }),
      prisma.userAchievement.findMany({ where: { userId } }),
    ]);

  const { unlockedCount: unlockedBadges } = buildUserAchievementsView(
    achievementDefs,
    userAchievements,
    completedSubmissions
  );

  const points = completedSubmissions.reduce((sum, s) => sum + s.challenge.points, 0);
  const totalSolved = completedSubmissions.length;
  const level = calculateLevel(points);
  const monthlyChallengesSolved = countSubmissionsInUtcMonth(completedSubmissions);

  return {
    rank: todayRankNum != null ? `#${todayRankNum}` : "#-",
    points: points.toLocaleString("de-DE"),
    streak: user.streak,
    streakRecord: user.streakRecord,
    totalSolved,
    level,
    levelMax: nextLevelThreshold(level),
    badges: unlockedBadges,
    badgesTotal: achievementDefs.length,
    monthlyChallengesSolved,
    monthlyChallengeGoal: utcDaysInMonth(),
  };
}
