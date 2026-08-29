import { prisma } from "@/lib/prisma";
import type { SolutionVoteKind } from "@/lib/generated/prisma/client";

export const SOLUTION_VOTE_KINDS = ["best_practices", "clever"] as const;

export type VoteCounts = Record<SolutionVoteKind, number>;
export type VoteState = Record<SolutionVoteKind, boolean>;

export function parseVoteKind(raw: unknown): SolutionVoteKind | null {
  return SOLUTION_VOTE_KINDS.includes(raw as SolutionVoteKind)
    ? (raw as SolutionVoteKind)
    : null;
}

function emptyCounts(): VoteCounts {
  return { best_practices: 0, clever: 0 };
}

function emptyState(): VoteState {
  return { best_practices: false, clever: false };
}

function toCounts(rows: { kind: SolutionVoteKind; _count: { _all: number } }[]): VoteCounts {
  const counts = emptyCounts();
  for (const row of rows) counts[row.kind] = row._count._all;
  return counts;
}

function toState(rows: { kind: SolutionVoteKind }[]): VoteState {
  const state = emptyState();
  for (const row of rows) state[row.kind] = true;
  return state;
}

/**
 * Every vote of one challenge in two queries, keyed by code hash.
 *
 * The whole challenge rather than the current page: sorting by votes has to compare groups
 * the page has not reached yet, and asking per group would be one round trip per card.
 */
export async function loadChallengeVotes(challengeId: string, userId: string) {
  const [counts, mine] = await Promise.all([
    prisma.solutionVote.groupBy({
      by: ["codeHash", "kind"],
      where: { challengeId },
      _count: { _all: true },
    }),
    prisma.solutionVote.findMany({
      where: { challengeId, userId },
      select: { codeHash: true, kind: true },
    }),
  ]);

  const countsByHash = new Map<string, VoteCounts>();
  for (const row of counts) {
    const bucket = countsByHash.get(row.codeHash) ?? emptyCounts();
    bucket[row.kind] = row._count._all;
    countsByHash.set(row.codeHash, bucket);
  }

  const stateByHash = new Map<string, VoteState>();
  for (const row of mine) {
    const bucket = stateByHash.get(row.codeHash) ?? emptyState();
    bucket[row.kind] = true;
    stateByHash.set(row.codeHash, bucket);
  }

  return {
    countsOf: (codeHash: string): VoteCounts => countsByHash.get(codeHash) ?? emptyCounts(),
    stateOf: (codeHash: string): VoteState => stateByHash.get(codeHash) ?? emptyState(),
  };
}

/** The tallies of a single solution, for the answer of the vote route. */
export async function readSolutionVotes(
  challengeId: string,
  codeHash: string,
  userId: string
): Promise<{ votes: VoteCounts; myVotes: VoteState }> {
  const [counts, mine] = await Promise.all([
    prisma.solutionVote.groupBy({
      by: ["kind"],
      where: { challengeId, codeHash },
      _count: { _all: true },
    }),
    prisma.solutionVote.findMany({
      where: { challengeId, codeHash, userId },
      select: { kind: true },
    }),
  ]);

  return { votes: toCounts(counts), myVotes: toState(mine) };
}
