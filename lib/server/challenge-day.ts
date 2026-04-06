import { prisma } from "@/lib/prisma";
import { startOfUtcDay } from "@/lib/server/ranking-period";

/**
 * Challenge für „heute“: zuerst Eintrag mit `date` am aktuellen UTC-Tag,
 * sonst Fallback auf die zuletzt aktive Challenge (z. B. frischer Seed / Dev).
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
