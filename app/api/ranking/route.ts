import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") ?? "today";

  const today = new Date("2026-04-05");

  if (period === "team") {
    const entries = await prisma.rankingEntry.findMany({
      where: { period: "team", periodDate: today, teamId: { not: null } },
      orderBy: { rank: "asc" },
      include: { team: true },
    });

    return NextResponse.json(
      entries.map((e) => ({
        rank: e.rank,
        previousRank: e.previousRank ?? undefined,
        name: e.team!.name,
        initials: e.team!.initials,
        points: e.points,
        avatar: e.team!.avatar,
        level: e.team!.level,
        challengesSolved: e.challengesSolved ?? undefined,
      }))
    );
  }

  const validPeriods = ["today", "week", "month"] as const;
  const selectedPeriod = validPeriods.includes(period as (typeof validPeriods)[number])
    ? (period as (typeof validPeriods)[number])
    : "today";

  const entries = await prisma.rankingEntry.findMany({
    where: { period: selectedPeriod, periodDate: today, userId: { not: null } },
    orderBy: { rank: "asc" },
    include: { user: true },
  });

  return NextResponse.json(
    entries.map((e) => ({
      rank: e.rank,
      previousRank: e.previousRank ?? undefined,
      name: e.user!.name,
      initials: e.user!.initials,
      points: e.points,
      time: e.timeTaken ?? undefined,
      team: e.user!.teamId ?? undefined,
      avatar: e.user!.avatar,
      level: e.user!.level,
      challengesSolved: e.challengesSolved ?? undefined,
    }))
  );
}
