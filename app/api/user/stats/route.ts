import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// "current user" is Max Mustermann (id: user-max)
const CURRENT_USER_ID = "user-max";

export async function GET() {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: CURRENT_USER_ID },
    include: { team: true },
  });

  const today = new Date("2026-04-05");
  const todayRank = await prisma.rankingEntry.findUnique({
    where: { userId_period_periodDate: { userId: CURRENT_USER_ID, period: "today", periodDate: today } },
  });
  const teamRank = user.teamId
    ? await prisma.rankingEntry.findUnique({
        where: { teamId_period_periodDate: { teamId: user.teamId, period: "team", periodDate: today } },
      })
    : null;

  return NextResponse.json({
    rank: todayRank ? `#${todayRank.rank}` : "#-",
    points: user.points.toLocaleString("de-DE"),
    streak: user.streak,
    streakRecord: user.streakRecord,
    teamRank: teamRank ? `#${teamRank.rank}` : "#-",
    teamName: user.team?.name ?? "",
    totalSolved: user.totalSolved,
    level: user.level,
    levelMax: 3000,
    badges: user.badges,
    badgesTotal: 6,
  });
}
