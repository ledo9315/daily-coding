import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// "current user" is Max Mustermann (id: user-max)
const CURRENT_USER_ID = "user-max";

export async function GET() {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: CURRENT_USER_ID },
  });

  const today = new Date("2026-04-05");
  const todayRank = await prisma.rankingEntry.findUnique({
    where: { userId_period_periodDate: { userId: CURRENT_USER_ID, period: "today", periodDate: today } },
  });

  return NextResponse.json({
    rank: todayRank ? `#${todayRank.rank}` : "#-",
    points: user.points.toLocaleString("de-DE"),
    streak: user.streak,
    streakRecord: user.streakRecord,
    totalSolved: user.totalSolved,
    level: user.level,
    levelMax: 3000,
    badges: user.badges,
    badgesTotal: 6,
  });
}
