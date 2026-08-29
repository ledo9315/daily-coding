import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextResponse } from "next/server";
import { POST as voteHandler } from "../challenge/[id]/votes/route";

// ─── Mocks ───────────────────────────────────────────────────────────────────

const mockSubmissionFindFirst = vi.fn();
const mockVoteDeleteMany = vi.fn();
const mockVoteCreate = vi.fn();
const mockVoteGroupBy = vi.fn();
const mockVoteFindMany = vi.fn();
const mockGetSessionUserId = vi.fn();
const mockHasSolvedChallenge = vi.fn();
const mockCheckRateLimit = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    submission: {
      findFirst: (...args: unknown[]) => mockSubmissionFindFirst(...args),
    },
    solutionVote: {
      deleteMany: (...args: unknown[]) => mockVoteDeleteMany(...args),
      create: (...args: unknown[]) => mockVoteCreate(...args),
      groupBy: (...args: unknown[]) => mockVoteGroupBy(...args),
      findMany: (...args: unknown[]) => mockVoteFindMany(...args),
    },
  },
}));

vi.mock("@/lib/auth-session", () => ({
  getSessionUserId: () => mockGetSessionUserId(),
}));

vi.mock("@/lib/server/solution-access", () => ({
  hasSolvedChallenge: (...args: unknown[]) => mockHasSolvedChallenge(...args),
}));

vi.mock("@/lib/server/rate-limiter", () => ({
  checkRateLimit: (...args: unknown[]) => mockCheckRateLimit(...args),
}));

const HASH = "a".repeat(64);

/** The own-row check runs before the existence check; both use `submission.findFirst`. */
type Row = { id: string } | null;

function submissionAnswers({ own = null as Row, any = { id: "sub-1" } as Row } = {}) {
  mockSubmissionFindFirst.mockImplementation((args: { where: { userId?: string } }) =>
    Promise.resolve(args.where.userId ? own : any),
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mockGetSessionUserId.mockResolvedValue({ userId: "user-me" });
  mockHasSolvedChallenge.mockResolvedValue(true);
  mockCheckRateLimit.mockResolvedValue(true);
  mockVoteDeleteMany.mockResolvedValue({ count: 0 });
  mockVoteCreate.mockResolvedValue({});
  mockVoteGroupBy.mockResolvedValue([]);
  mockVoteFindMany.mockResolvedValue([]);
  submissionAnswers();
});

const params = Promise.resolve({ id: "challenge-1" });

function call(body: unknown = { codeHash: HASH, kind: "clever" }) {
  return voteHandler(
    new Request("http://localhost/api/challenge/challenge-1/votes", {
      method: "POST",
      body: JSON.stringify(body),
    }),
    { params },
  );
}

// ─── POST /api/challenge/[id]/votes ──────────────────────────────────────────

describe("POST /api/challenge/[id]/votes", () => {
  it("returns 401 without a session", async () => {
    mockGetSessionUserId.mockResolvedValue({
      error: NextResponse.json({ error: "Nicht authentifiziert." }, { status: 401 }),
    });
    expect((await call()).status).toBe(401);
    expect(mockVoteDeleteMany).not.toHaveBeenCalled();
  });

  it("returns 429 when the rate limit is exhausted", async () => {
    mockCheckRateLimit.mockResolvedValue(false);
    expect((await call()).status).toBe(429);
    expect(mockVoteDeleteMany).not.toHaveBeenCalled();
  });

  it("limits votes per user and minute", async () => {
    await call();
    expect(mockCheckRateLimit).toHaveBeenCalledWith("solution-vote:user-me", 30, 60_000);
  });

  it.each([
    ["an unknown kind", { codeHash: HASH, kind: "funny" }],
    ["a missing kind", { codeHash: HASH }],
    ["a hash that is not a sha-256", { codeHash: "nope", kind: "clever" }],
    ["a missing hash", { kind: "clever" }],
  ])("returns 400 for %s", async (_label, body) => {
    expect((await call(body)).status).toBe(400);
    expect(mockVoteDeleteMany).not.toHaveBeenCalled();
  });

  it("returns 403 when the user has not solved the challenge", async () => {
    mockHasSolvedChallenge.mockResolvedValue(false);
    const res = await call();
    expect(res.status).toBe(403);
    expect(mockVoteDeleteMany).not.toHaveBeenCalled();
  });

  it("refuses a vote on the own solution server-side", async () => {
    submissionAnswers({ own: { id: "sub-mine" } });
    const res = await call();
    expect(res.status).toBe(403);
    expect((await res.json()).error).toContain("eigene Lösung");
    expect(mockVoteDeleteMany).not.toHaveBeenCalled();
  });

  it("returns 404 when no solution carries that hash", async () => {
    submissionAnswers({ any: null });
    expect((await call()).status).toBe(404);
    expect(mockVoteDeleteMany).not.toHaveBeenCalled();
  });

  it("casts a vote keyed by challenge, code hash, user and kind", async () => {
    await call();
    expect(mockVoteCreate).toHaveBeenCalledWith({
      data: {
        challengeId: "challenge-1",
        codeHash: HASH,
        userId: "user-me",
        kind: "clever",
      },
    });
  });

  it("takes the vote back when it was already there", async () => {
    mockVoteDeleteMany.mockResolvedValue({ count: 1 });
    await call();
    expect(mockVoteCreate).not.toHaveBeenCalled();
  });

  it("answers with the fresh tallies so the card needs no second call", async () => {
    mockVoteGroupBy.mockResolvedValue([{ kind: "clever", _count: { _all: 5 } }]);
    mockVoteFindMany.mockResolvedValue([{ kind: "clever" }]);
    const json = await (await call()).json();
    expect(json).toEqual({
      votes: { best_practices: 0, clever: 5 },
      myVotes: { best_practices: false, clever: true },
    });
  });

  /**
   * #200 lets a re-submission overwrite the row of the day. A vote tied to that row would
   * follow the author to code the voter never saw, so it hangs on the hash of the code -
   * and nothing in the write may name a submission.
   */
  it("keys the vote by the code, never by the submission row", async () => {
    await call();
    const { data } = mockVoteCreate.mock.calls[0][0] as { data: Record<string, unknown> };
    expect(data).not.toHaveProperty("submissionId");
    expect(data.codeHash).toBe(HASH);
  });

  it("keeps both kinds independent", async () => {
    await call({ codeHash: HASH, kind: "best_practices" });
    expect(mockVoteDeleteMany).toHaveBeenCalledWith({
      where: {
        challengeId: "challenge-1",
        codeHash: HASH,
        userId: "user-me",
        kind: "best_practices",
      },
    });
  });
});
