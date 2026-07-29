import { prisma } from "@/lib/prisma";
import { startOfUtcDay } from "@/lib/server/ranking-period";

/** Start und Ende (exklusiv) des laufenden UTC-Kalendertags. */
export function utcDayRange(now: Date = new Date()): { gte: Date; lt: Date } {
  const gte = startOfUtcDay(now);
  const lt = new Date(gte);
  lt.setUTCDate(lt.getUTCDate() + 1);
  return { gte, lt };
}

/**
 * Neueste Abgabe des laufenden UTC-Tags für diese Challenge, sonst null.
 *
 * Einzige Quelle für „heute schon abgegeben?" — genutzt von der Submit-Sperre,
 * der Challenge-API und der Karte auf der Startseite. Vorher lag die Prüfung
 * doppelt kopiert in zwei Routen.
 */
export async function findTodaySubmission(userId: string, challengeId: string) {
  return prisma.submission.findFirst({
    where: { userId, challengeId, createdAt: utcDayRange() },
    select: {
      id: true,
      status: true,
      createdAt: true,
      code: true,
      language: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

/** Nach außen sichtbarer Abgabestatus; `skipped` gilt als offen. */
export function publicSubmissionStatus(
  status: "pending" | "completed" | "failed" | "skipped"
): "pending" | "completed" | "failed" {
  if (status === "completed") return "completed";
  if (status === "failed") return "failed";
  return "pending";
}

/**
 * Prefer the challenge whose `date` is on the current UTC calendar day;
 * otherwise the latest active challenge (e.g. fresh seed / dev).
 */
export async function findDailyChallengeForApp() {
  const forToday = await prisma.challenge.findFirst({
    where: { date: utcDayRange() },
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
