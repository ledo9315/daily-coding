import type { AppLocale } from "@/lib/locale";
import { prisma } from "@/lib/prisma";
import { startOfUtcDay } from "@/lib/server/ranking-period";
import { resolveRingIndex, type RingEntry } from "@/lib/server/challenge-ring";
import { localizeChallenge } from "@/lib/server/content-translations";

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
 * The single source for "already submitted today?" - used by the submit lock,
 * the challenge API and the dashboard card. The check used to be copied into two
 * routes.
 */
export async function findTodaySubmission(userId: string, challengeId?: string) {
  return prisma.submission.findFirst({
    where: {
      userId,
      ...(challengeId ? { challengeId } : {}),
      createdAt: utcDayRange(),
    },
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
 * The active pool in ring order. `position` first, `id` as the tie-break, matching
 * `compareRingEntries` - the admin list and the daily must agree on the order.
 *
 * Two columns, not the row: resolving the ring needs an order and an id, and nothing
 * else. It used to select everything, which meant every landing page pulled the hints,
 * examples, test cases and starter code of *every* active challenge out of the database
 * to decide which single one is today's. Sentry measured it at 95 ms average and made
 * `GET /` the slowest transaction in the app by a factor of three.
 */
export async function findRingPool(): Promise<RingEntry[]> {
  return prisma.challenge.findMany({
    where: { isActive: true },
    orderBy: [{ position: "asc" }, { id: "asc" }],
    select: { id: true, position: true },
  });
}

/**
 * The one challenge the ring points at, with everything a reader needs. `null` when the
 * row disappeared between the two queries, which only a deletion in that window can do;
 * every caller already handles an empty day.
 */
function loadRingChallenge(id: string) {
  return prisma.challenge.findUnique({ where: { id }, include: { category: true } });
}

/**
 * The challenge of the day: wherever the ring currently stands.
 *
 * Replaces the old two-step rule (a `date` on today wins, otherwise `dayNumber % poolSize`).
 * That formula moved every time the pool grew or shrank, which was invisible while the order
 * itself was invisible. Now the order is `position`, editable in the admin panel, and the
 * pointer lives in `RotationState`.
 *
 * The pointer advances here, on the first request of a new UTC day, rather than in a scheduled
 * job: one moving part fewer, and a day without traffic costs nothing because the catch-up is
 * computed from the number of days elapsed.
 *
 * ponytail: with N challenges the ring repeats after N days - accepted on purpose, better than
 * standing still. The cure is more content, not more code.
 *
 * Returns the row as it stands in the database, so in the content language. Callers that
 * render it for a reader want `findDailyChallengeForApp`; the daily reminder wants this
 * one, because it writes to recipients in two languages and there is no request to read
 * a locale from (#288).
 */
export async function findDailyChallengeRow() {
  const ring = await findRingPool();
  if (ring.length === 0) return null;

  const state = await prisma.rotationState.findUnique({ where: { id: "current" } });
  const now = new Date();

  if (!state) {
    // First run, or a database that predates the ring.
    const first = ring[0];
    await prisma.rotationState.create({
      data: {
        id: "current",
        challengeId: first.id,
        position: first.position,
        day: startOfUtcDay(now),
      },
    });
    return loadRingChallenge(first.id);
  }

  const { index, changed } = resolveRingIndex(ring, state, now);
  const current = ring[index];

  if (changed) {
    // Concurrent requests on the first hit of a new day compute the same target from the same
    // stored state, so the second write is a no-op rather than a double advance.
    await prisma.rotationState.update({
      where: { id: "current" },
      data: {
        challengeId: current.id,
        position: current.position,
        day: startOfUtcDay(now),
      },
    });
  }

  return loadRingChallenge(current.id);
}

/**
 * The challenge of the day, ready to be read.
 *
 * Translated at the exit, not per caller: the daily route, the dashboard card and the
 * landing badge all read the challenge through here. The ring itself has no language -
 * which challenge is live must not depend on who is asking.
 */
export async function findDailyChallengeForApp(
  /**
   * The language to render the task in. Passed by the routes that answer the challenge
   * page: that page is fixed to a language by its URL, and a route handler cannot see one
   * (#287). Omitted elsewhere, where the request decides.
   */
  locale?: AppLocale
) {
  const current = await findDailyChallengeRow();
  return current ? localizeChallenge(current, locale) : null;
}
