/**
 * Everything the achievement rules read about one user, loaded in one place.
 *
 * Until #271 the rules took the completed submissions and `streakRecord` as two
 * parameters, and each of the four callers (profile, dashboard, public profile, unlock
 * persistence) ran its own copy of the queries. The new rules need comments, received
 * votes and a cross-user "first of the day" lookup on top, so the queries move behind
 * `loadAchievementFacts` and the rules take this one object.
 */

import type { PrismaClient } from "@/lib/generated/prisma/client";
import { utcDayKey } from "@/lib/streak-days";
import { startOfUtcDay } from "@/lib/server/ranking-period";

/** One completed submission, with the challenge fields the rules and the callers read. */
export type FactSubmission = {
  createdAt: Date;
  language: string | null;
  code: string;
  challenge: { id: string; difficulty: string; points: number };
};

export type AchievementFacts = {
  /** Every submission with status `completed`, in no particular order. */
  completed: FactSubmission[];
  streakRecord: number;
  /** Creation dates of the comments the user wrote. */
  comments: { createdAt: Date }[];
  /** Votes other users cast on the user's solutions; the user's own votes are excluded. */
  votesReceived: { kind: "best_practices" | "clever"; createdAt: Date }[];
  /**
   * For every UTC day (`utcDayKey`) the user completed a challenge on: the `createdAt`
   * of the earliest completed submission of *anyone* that day. „Früher Vogel" compares
   * the user's own submission against it.
   */
  earliestCompletionByDay: Map<string, Date>;
};

/**
 * Loads the facts for one user. Takes the client as a parameter rather than importing it,
 * like `persistAchievementUnlocks`: `lib/prisma` is `server-only` and the backfill script
 * needs this module too.
 */
export async function loadAchievementFacts(
  client: PrismaClient,
  userId: string
): Promise<AchievementFacts> {
  const [rows, user, comments] = await Promise.all([
    client.submission.findMany({
      where: { userId, status: "completed" },
      select: {
        createdAt: true,
        language: true,
        code: true,
        codeHash: true,
        challenge: { select: { id: true, difficulty: true, points: true } },
      },
    }),
    client.user.findUnique({ where: { id: userId }, select: { streakRecord: true } }),
    client.comment.findMany({ where: { userId }, select: { createdAt: true } }),
  ]);

  const solutionPairs = new Map<string, { challengeId: string; codeHash: string }>();
  const days = new Map<number, Date>();
  for (const row of rows) {
    if (row.codeHash !== null) {
      solutionPairs.set(`${row.challenge.id}\u0000${row.codeHash}`, {
        challengeId: row.challenge.id,
        codeHash: row.codeHash,
      });
    }
    // Keyed by the day of `createdAt`, not by `submissionDay`: legacy rows (and the seed)
    // carry a non-midnight `submissionDay` that would group only with itself and make the
    // solve look like the first of its day. Post-#200 rows have both equal.
    const day = startOfUtcDay(row.createdAt);
    days.set(day.getTime(), day);
  }

  const [votesReceived, earliest] = await Promise.all([
    solutionPairs.size === 0
      ? []
      : client.solutionVote.findMany({
          // Identical solutions share a codeHash (#223), so a vote on the group counts for
          // every author of it - intended.
          where: { userId: { not: userId }, OR: [...solutionPairs.values()] },
          select: { kind: true, createdAt: true },
        }),
    days.size === 0
      ? []
      : client.submission.groupBy({
          by: ["submissionDay"],
          where: { status: "completed", submissionDay: { in: [...days.values()] } },
          _min: { createdAt: true },
        }),
  ]);

  const earliestCompletionByDay = new Map<string, Date>();
  for (const group of earliest) {
    if (group._min.createdAt) {
      earliestCompletionByDay.set(utcDayKey(group.submissionDay), group._min.createdAt);
    }
  }

  return {
    completed: rows.map((row) => ({
      createdAt: row.createdAt,
      language: row.language,
      code: row.code,
      challenge: row.challenge,
    })),
    streakRecord: user?.streakRecord ?? 0,
    comments,
    votesReceived,
    earliestCompletionByDay,
  };
}
