import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatTime } from "@/lib/format";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") ?? "today";

  const today = new Date("2026-04-05");

  const validPeriods = ["today", "week", "month"] as const;
  const selectedPeriod = validPeriods.includes(period as (typeof validPeriods)[number])
    ? (period as (typeof validPeriods)[number])
    : "today";

  const entries = await prisma.rankingEntry.findMany({
    where: { period: selectedPeriod, periodDate: today },
    orderBy: { rank: "asc" },
    include: { user: true },
  });

  return NextResponse.json(
    entries.map((e: any) => ({
      rank: e.rank,
      previousRank: e.previousRank ?? undefined,
      name: e.user.name,
      initials: e.user.initials,
      points: e.points,
      time: formatTime(e.timeTaken),
      avatar: e.user.avatar,
      challengesSolved: e.challengesSolved ?? undefined,
    }))
  );
}
