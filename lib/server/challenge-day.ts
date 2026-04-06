import { prisma } from "@/lib/prisma";
import { startOfUtcDay } from "@/lib/server/ranking-period";

/**
 * Prefer the challenge whose `date` is on the current UTC calendar day;
 * otherwise the latest active challenge (e.g. fresh seed / dev).
 */
export async function findDailyChallengeForApp() {
  const dayStart = startOfUtcDay(new Date());
  const dayEnd = new Date(dayStart);
  dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);

  const forToday = await prisma.challenge.findFirst({
    where: { date: { gte: dayStart, lt: dayEnd } },
    orderBy: { date: "desc" },
    include: { category: true },
  });

  if (forToday) return forToday;

  return prisma.challenge.findFirst({
    where: { isActive: true },
    orderBy: { date: "desc" },
    include: { category: true },
  });
}
