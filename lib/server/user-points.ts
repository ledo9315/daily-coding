import { prisma } from "@/lib/prisma";

/**
 * Place in the all-time ranking: lifetime points across all completed submissions,
 * highest first. Replaces the position in today's speed ranking that "your rank" used
 * to show on the dashboard and in the profile (#91).
 *
 * Competition ranking - a tie shares a place and the next distinct total skips ahead
 * (200, 200, 100 gives places 1, 1, 3). Everyone gets a place, including someone with
 * no points at all: "#14 of 14" tells you more than a dash.
 *
 * ponytail: sums in JS over all completed submissions instead of aggregating in SQL,
 * because the points live on `Challenge` and Prisma cannot sum a joined column. Fine at
 * this size; move to a raw query or a stored total if the submission table ever grows
 * past a few thousand rows.
 */
export async function getAllTimeRankNumber(userId: string): Promise<number> {
  const rows = await prisma.submission.findMany({
    where: { status: "completed" },
    select: { userId: true, challenge: { select: { points: true } } },
  });

  const totals = new Map<string, number>();
  for (const row of rows) {
    totals.set(row.userId, (totals.get(row.userId) ?? 0) + row.challenge.points);
  }

  const own = totals.get(userId) ?? 0;
  let ahead = 0;
  for (const [id, total] of totals) {
    if (id !== userId && total > own) ahead++;
  }
  return ahead + 1;
}

/** Lifetime sum of challenge points across a user's completed submissions. */
export async function getLifetimePointsByUserIds(
  userIds: string[]
): Promise<Map<string, number>> {
  if (userIds.length === 0) return new Map();

  const rows = await prisma.submission.findMany({
    where: { userId: { in: userIds }, status: "completed" },
    select: { userId: true, challenge: { select: { points: true } } },
  });

  const map = new Map<string, number>();
  for (const r of rows) {
    map.set(r.userId, (map.get(r.userId) ?? 0) + r.challenge.points);
  }
  return map;
}
