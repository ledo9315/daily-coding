import { prisma } from "@/lib/prisma";
import { startOfUtcDay } from "@/lib/server/ranking-period";

/** Start and end (exclusive) of the running UTC calendar day. */
export function utcDayRange(now: Date = new Date()): { gte: Date; lt: Date } {
  const gte = startOfUtcDay(now);
  const lt = new Date(gte);
  lt.setUTCDate(lt.getUTCDate() + 1);
  return { gte, lt };
}

/**
 * Latest submission for this challenge on the running UTC day, otherwise null.
 *
 * The single source for "already submitted today?" — used by the submit lock,
 * the challenge API and the dashboard card. The check used to be copied into two
 * routes.
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

/** Submission status exposed to clients; `skipped` counts as still open. */
export function publicSubmissionStatus(
  status: "pending" | "completed" | "failed" | "skipped"
): "pending" | "completed" | "failed" {
  if (status === "completed") return "completed";
  if (status === "failed") return "failed";
  return "pending";
}

/**
 * Position in the rotation pool, derived from the UTC calendar day. Deterministic:
 * the same day always yields the same challenge — across requests and across
 * server instances, with no randomness and no server-side state.
 */
export function rotationIndexForUtcDay(now: Date, poolSize: number): number {
  if (poolSize <= 0) return 0;
  const utcDayNumber = Math.floor(now.getTime() / 86_400_000);
  return ((utcDayNumber % poolSize) + poolSize) % poolSize;
}

/**
 * The challenge of the day.
 *
 * 1. If a `date` falls on the current UTC day, that challenge wins — manual
 *    scheduling through the admin panel keeps priority.
 * 2. Otherwise rotate deterministically through the pool of active challenges.
 *    Without this step the app served the same challenge forever, because the
 *    seed only sets dates in the past (#67).
 *
 * ponytail: with N challenges the cycle repeats after N days — accepted on
 * purpose, better than standing still. The cure is more content, not more code.
 */
export async function findDailyChallengeForApp() {
  const forToday = await prisma.challenge.findFirst({
    where: { date: utcDayRange() },
    orderBy: { date: "desc" },
    include: { category: true },
  });

  if (forToday) return forToday;

  // Stable order: otherwise the rotation depends on whatever order the DB returns.
  const pool = await prisma.challenge.findMany({
    where: { isActive: true },
    orderBy: [{ date: "asc" }, { id: "asc" }],
    include: { category: true },
  });

  if (pool.length === 0) return null;

  return pool[rotationIndexForUtcDay(new Date(), pool.length)];
}
