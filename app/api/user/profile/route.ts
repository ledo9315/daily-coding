import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateLevel, nextLevelThreshold } from "@/lib/level";
import { formatTime, formatDate } from "@/lib/format";

const CURRENT_USER_ID = "user-max";

export async function GET() {
  const today = new Date("2026-04-05");

  const [user, todayRank, completedSubmissions, unlockedBadges] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: CURRENT_USER_ID },
      include: {
        achievements: { include: { achievement: true }, orderBy: { createdAt: "asc" } },
        submissions: {
          orderBy: { createdAt: "desc" },
          take: 10,
          include: { challenge: true },
        },
      },
    }),
    prisma.rankingEntry.findUnique({
      where: { userId_period_periodDate: { userId: CURRENT_USER_ID, period: "today", periodDate: today } },
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

  return NextResponse.json({
    id: user.id,
    name: user.name.toUpperCase(),
    initials: user.initials,
    avatar: user.avatar,
    stats: {
      rank: todayRank ? `#${todayRank.rank}` : "#-",
      points: points.toLocaleString("de-DE"),
      streak: user.streak,
      streakRecord: user.streakRecord,
      totalSolved,
      level,
      levelMax: nextLevelThreshold(level),
      badges: unlockedBadges,
      badgesTotal: 6,
    },
    achievements: user.achievements.map((a: any) => ({
      id: a.achievementId,
      title: a.achievement.title,
      description: a.achievement.description,
      iconKey: a.achievement.iconKey,
      unlocked: a.unlockedAt !== null,
      rarity: a.achievement.rarity,
      unlockedAt: a.unlockedAt ? formatDate(a.unlockedAt) : undefined,
    })),
    challengeHistory: user.submissions.map((s: any) => ({
      id: s.id,
      title: s.challenge.title,
      date: formatDate(s.createdAt),
      difficulty: s.challenge.difficulty,
      status: s.status,
      points: s.challenge.points,
      time: formatTime(s.timeTaken),
      rank: s.rank ?? undefined,
    })),
  });
}
