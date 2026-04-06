import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateLevel, nextLevelThreshold } from "@/lib/level";

const CURRENT_USER_ID = "user-max";

export async function GET() {
  const today = new Date("2026-04-05");

  const [user, todayRank, completedSubmissions, unlockedBadges] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: CURRENT_USER_ID } }),
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
    rank: todayRank ? `#${todayRank.rank}` : "#-",
    points: points.toLocaleString("de-DE"),
    streak: user.streak,
    streakRecord: user.streakRecord,
    totalSolved,
    level,
    levelMax: nextLevelThreshold(level),
    badges: unlockedBadges,
    badgesTotal: 6,
  });
}
