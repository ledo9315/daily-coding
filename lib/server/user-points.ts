import { prisma } from "@/lib/prisma";

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
