import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatTime } from "@/lib/format";
import { calculateLevel } from "@/lib/level";
import { getPeriodDateForRanking } from "@/lib/server/ranking-period";
import { getLifetimePointsByUserIds } from "@/lib/server/user-points";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") ?? "today";

  const validPeriods = ["today", "week", "month"] as const;
  const selectedPeriod = validPeriods.includes(period as (typeof validPeriods)[number])
    ? (period as (typeof validPeriods)[number])
    : "today";

  const periodDate = getPeriodDateForRanking(selectedPeriod);

  const entries = await prisma.rankingEntry.findMany({
    where: { period: selectedPeriod, periodDate },
    orderBy: { rank: "asc" },
    include: { user: true },
  });

  const userIds = entries.map((e) => e.userId);
  const lifetimePoints = await getLifetimePointsByUserIds(userIds);

  return NextResponse.json(
    entries.map((e) => ({
      rank: e.rank,
      previousRank: e.previousRank ?? undefined,
      name: e.user.name,
      initials: e.user.initials,
      points: e.points,
      time: formatTime(e.timeTaken),
      avatar: e.user.avatar,
      challengesSolved: e.challengesSolved ?? undefined,
      level: calculateLevel(lifetimePoints.get(e.userId) ?? 0),
    }))
  );
}
