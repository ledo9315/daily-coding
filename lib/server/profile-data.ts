import { prisma } from "@/lib/prisma";
import { calculateLevel, nextLevelThreshold } from "@/lib/level";
import { formatTime, formatDate } from "@/lib/format";
import type { UserProfile } from "@/lib/api";
import { getPeriodDateForRanking } from "@/lib/server/ranking-period";
import { buildUserAchievementsView } from "@/lib/server/achievements";
import { MONTHLY_CHALLENGE_GOAL, countSubmissionsInUtcMonth } from "@/lib/monthly-challenge-goal";

export async function getUserProfileData(userId: string): Promise<UserProfile | null> {
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

  const [todayRank, completedSubmissions, achievementDefs, userAchievements] =
    await Promise.all([
      prisma.rankingEntry.findUnique({
        where: {
          userId_period_periodDate: {
            userId: userId,
            period: "today",
            periodDate: getPeriodDateForRanking("today"),
          },
        },
      }),
      prisma.submission.findMany({
        where: { userId: userId, status: "completed" },
        include: { challenge: { select: { points: true } } },
      }),
      prisma.achievementDef.findMany({ orderBy: { id: "asc" } }),
      prisma.userAchievement.findMany({ where: { userId } }),
    ]);

  const points = completedSubmissions.reduce((sum, s) => sum + s.challenge.points, 0);
  const totalSolved = completedSubmissions.length;
  const level = calculateLevel(points);
  const monthlyChallengesSolved = countSubmissionsInUtcMonth(completedSubmissions);

  const { achievements, unlockedCount: unlockedBadges } = buildUserAchievementsView(
    achievementDefs,
    userAchievements,
    completedSubmissions
  );

  return {
    id: user.id,
    name: user.name.toUpperCase(),
    initials: user.initials,
    avatar: user.avatar,
    role: "",
    stats: {
      rank: todayRank ? `#${todayRank.rank}` : "#-",
      points: points.toLocaleString("de-DE"),
      streak: user.streak,
      streakRecord: user.streakRecord,
      totalSolved,
      level,
      levelMax: nextLevelThreshold(level),
      badges: unlockedBadges,
      badgesTotal: achievementDefs.length,
      monthlyChallengesSolved,
      monthlyChallengeGoal: MONTHLY_CHALLENGE_GOAL,
    },
    achievements,
    challengeHistory: user.submissions.map((s) => ({
      id: s.id,
      title: s.challenge.title,
      date: formatDate(s.createdAt),
      difficulty: s.challenge.difficulty,
      status:
        s.status === "completed" || s.status === "failed" || s.status === "skipped"
          ? s.status
          : "skipped",
      points: s.challenge.points,
      time: formatTime(s.timeTaken),
      rank: s.rank ?? undefined,
    })),
  };
}
