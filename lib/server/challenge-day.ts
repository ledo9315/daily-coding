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
      testResults: true,
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
 * Position im Rotations-Pool, abgeleitet vom UTC-Kalendertag. Deterministisch:
 * derselbe Tag ergibt immer dieselbe Aufgabe — auch über mehrere Requests und
 * Serverinstanzen hinweg (kein Zufall, kein Serverzustand).
 */
export function rotationIndexForUtcDay(now: Date, poolSize: number): number {
  if (poolSize <= 0) return 0;
  const utcDayNumber = Math.floor(now.getTime() / 86_400_000);
  return ((utcDayNumber % poolSize) + poolSize) % poolSize;
}

/**
 * Aufgabe des Tages.
 *
 * 1. Ist für den heutigen UTC-Tag ein `date` gesetzt, gewinnt diese Challenge —
 *    manuelle Planung über das Admin bleibt vorrangig.
 * 2. Sonst wird deterministisch aus dem Pool aktiver Aufgaben rotiert. Ohne
 *    diesen Schritt lieferte die App dauerhaft dieselbe Aufgabe, weil der Seed
 *    nur Daten in der Vergangenheit setzt (#67).
 *
 * ponytail: bei N Aufgaben wiederholt sich der Zyklus nach N Tagen — bewusst
 * akzeptiert, besser als Stillstand. Abhilfe ist mehr Inhalt, nicht mehr Code.
 */
export async function findDailyChallengeForApp() {
  const forToday = await prisma.challenge.findFirst({
    where: { date: utcDayRange() },
    orderBy: { date: "desc" },
    include: { category: true },
  });

  if (forToday) return forToday;

  // Stabile Reihenfolge: sonst hängt die Rotation von der Laune der DB ab.
  const pool = await prisma.challenge.findMany({
    where: { isActive: true },
    orderBy: [{ date: "asc" }, { id: "asc" }],
    include: { category: true },
  });

  if (pool.length === 0) return null;

  return pool[rotationIndexForUtcDay(new Date(), pool.length)];
}
