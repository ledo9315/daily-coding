import { prisma } from "@/lib/prisma";
import { calculateLevel, nextLevelThreshold } from "@/lib/level";
import { formatDate } from "@/lib/format";
import type { UserProfile } from "@/lib/api";
import { getAllTimeRankNumber } from "@/lib/server/user-points";
import { buildUserAchievementsView } from "@/lib/server/achievements";
import { countSubmissionsInUtcMonth, utcDaysInMonth } from "@/lib/monthly-challenge-goal";
import { buildMonthlyActivityGrid } from "@/lib/monthly-activity";
import { utcDayKey } from "@/lib/streak-days";

export async function getUserProfileData(
  userId: string
): Promise<UserProfile | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      submissions: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { challenge: true },
      },
    },
  });
  if (!user) return null;

  const resolvedUserId = user.id;

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

  const points = completedSubmissions.reduce((sum, s) => sum + s.challenge.points, 0);
  const totalSolved = completedSubmissions.length;
  const level = calculateLevel(points);
  const now = new Date();
  const monthlyChallengesSolved = countSubmissionsInUtcMonth(completedSubmissions, now);

  const allCompletedDayKeys = new Set<string>();
  for (const s of completedSubmissions) {
    allCompletedDayKeys.add(utcDayKey(s.createdAt));
  }
  const monthlyActivity = buildMonthlyActivityGrid(now, allCompletedDayKeys);

  const { achievements, unlockedCount: unlockedBadges } = buildUserAchievementsView(
    achievementDefs,
    userAchievements,
    completedSubmissions,
    user.streakRecord
  );

  return {
    id: user.id,
    name: user.name.toUpperCase(),
    initials: user.initials,
    avatar: user.avatar,
    role: "",
    stats: {
      rank: `#${allTimeRank}`,
      points: points.toLocaleString("de-DE"),
      rankTrendPercent: 0,
      rankTrendPlaces: 0,
      pointsTrendPercent: 0,
      streak: user.streak,
      streakRecord: user.streakRecord,
      totalSolved,
      totalUsers,
      level,
      levelMax: nextLevelThreshold(level),
      badges: unlockedBadges,
      badgesTotal: achievementDefs.length,
      monthlyChallengesSolved,
      monthlyChallengeGoal: utcDaysInMonth(now),
    },
    achievements,
    challengeHistory: user.submissions.map((s) => ({
      id: s.id,
      challengeId: s.challengeId,
      title: s.challenge.title,
      date: formatDate(s.createdAt),
      difficulty: s.challenge.difficulty,
      status:
        s.status === "completed" || s.status === "failed" || s.status === "skipped"
          ? s.status
          : "skipped",
      points: s.challenge.points,
      rank: s.rank ?? undefined,
    })),
    monthlyActivity,
  };
}
