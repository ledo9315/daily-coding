import { NextRequest, NextResponse } from "next/server";
import { formatTime } from "@/lib/format";
import { calculateLevel } from "@/lib/level";
import { getLiveRanking } from "@/lib/server/ranking-live";
import { getLifetimePointsByUserIds } from "@/lib/server/user-points";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") ?? "today";

  const validPeriods = ["today", "week", "month"] as const;
  const selectedPeriod = validPeriods.includes(period as (typeof validPeriods)[number])
    ? (period as (typeof validPeriods)[number])
    : "today";

  const entries = await getLiveRanking(selectedPeriod);
  const userIds = entries.map((e) => e.userId);
  const lifetimePoints = await getLifetimePointsByUserIds(userIds);

  return NextResponse.json(
    entries.map((e) => {
      const level = calculateLevel(lifetimePoints.get(e.userId) ?? 0);
      return {
        rank: e.rank,
        name: e.user.name,
        initials: e.user.initials,
        points: e.points,
        avatar: e.user.avatar,
        level,
        ...(selectedPeriod === "today" ? { time: formatTime(e.timeSeconds) } : {}),
        ...(e.challengesSolved !== undefined
          ? { challengesSolved: e.challengesSolved }
          : {}),
      };
    })
  );
}
