import { NextRequest, NextResponse } from "next/server";
import { calculateLevel } from "@/lib/level";
import { getLiveRanking } from "@/lib/server/ranking-live";
import { getLifetimePointsByUserIds } from "@/lib/server/user-points";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  // "today" is no longer a period (#91). An unknown or legacy value falls back to the
  // week rather than erroring, so an old bookmark or a cached client still gets a list.
  const period = searchParams.get("period") ?? "week";

  const validPeriods = ["week", "month", "all"] as const;
  const selectedPeriod = validPeriods.includes(period as (typeof validPeriods)[number])
    ? (period as (typeof validPeriods)[number])
    : "week";

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
        challengesSolved: e.challengesSolved,
      };
    })
  );
}
