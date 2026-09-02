import { describe, it, expect, vi, beforeEach } from "vitest";
import type { PrismaClient } from "@/lib/generated/prisma/client";
import { loadAchievementFacts } from "../achievement-facts";

const mockSubmissionFindMany = vi.fn();
const mockSubmissionGroupBy = vi.fn();
const mockUserFindUnique = vi.fn();
const mockCommentFindMany = vi.fn();
const mockSolutionVoteFindMany = vi.fn();

const client = {
  submission: { findMany: mockSubmissionFindMany, groupBy: mockSubmissionGroupBy },
  user: { findUnique: mockUserFindUnique },
  comment: { findMany: mockCommentFindMany },
  solutionVote: { findMany: mockSolutionVoteFindMany },
} as unknown as PrismaClient;

type Row = {
  createdAt: Date;
  language: string;
  code: string;
  codeHash: string | null;
  submissionDay: Date;
  challenge: { id: string; difficulty: string; points: number };
};

function row(overrides: Partial<Row> = {}): Row {
  return {
    createdAt: new Date("2026-08-14T09:00:00Z"),
    language: "javascript",
    code: "return 1;",
    codeHash: "hash-a",
    submissionDay: new Date("2026-08-14T00:00:00Z"),
    challenge: { id: "ch-1", difficulty: "easy", points: 100 },
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockSubmissionFindMany.mockResolvedValue([]);
  mockSubmissionGroupBy.mockResolvedValue([]);
  mockUserFindUnique.mockResolvedValue({ streakRecord: 5 });
  mockCommentFindMany.mockResolvedValue([]);
  mockSolutionVoteFindMany.mockResolvedValue([]);
});

describe("loadAchievementFacts", () => {
  it("maps completed submissions to FactSubmission without the hash or the day", async () => {
    mockSubmissionFindMany.mockResolvedValue([row()]);

    const facts = await loadAchievementFacts(client, "user-1");

    expect(facts.completed).toEqual([
      {
        createdAt: new Date("2026-08-14T09:00:00Z"),
        language: "javascript",
        code: "return 1;",
        challenge: { id: "ch-1", difficulty: "easy", points: 100 },
      },
    ]);
    expect(facts.completed[0]).not.toHaveProperty("codeHash");
    expect(facts.completed[0]).not.toHaveProperty("submissionDay");
    expect(mockSubmissionFindMany.mock.calls[0][0].where).toEqual({
      userId: "user-1",
      status: "completed",
    });
  });

  it("reads streakRecord and the user's comments", async () => {
    mockCommentFindMany.mockResolvedValue([{ createdAt: new Date("2026-08-01T10:00:00Z") }]);

    const facts = await loadAchievementFacts(client, "user-1");

    expect(facts.streakRecord).toBe(5);
    expect(facts.comments).toEqual([{ createdAt: new Date("2026-08-01T10:00:00Z") }]);
    expect(mockCommentFindMany.mock.calls[0][0].where).toEqual({ userId: "user-1" });
  });

  it("defaults streakRecord to 0 when the user row is missing", async () => {
    mockUserFindUnique.mockResolvedValue(null);

    const facts = await loadAchievementFacts(client, "user-1");

    expect(facts.streakRecord).toBe(0);
  });

  it("runs neither the vote query nor the groupBy without completed submissions", async () => {
    const facts = await loadAchievementFacts(client, "user-1");

    expect(mockSolutionVoteFindMany).not.toHaveBeenCalled();
    expect(mockSubmissionGroupBy).not.toHaveBeenCalled();
    expect(facts.votesReceived).toEqual([]);
    expect(facts.earliestCompletionByDay.size).toBe(0);
  });

  it("asks for votes on every distinct solution once, excluding the user's own votes", async () => {
    mockSubmissionFindMany.mockResolvedValue([
      row({ challenge: { id: "ch-1", difficulty: "easy", points: 100 }, codeHash: "hash-a" }),
      row({
        challenge: { id: "ch-1", difficulty: "easy", points: 100 },
        codeHash: "hash-a",
        submissionDay: new Date("2026-08-15T00:00:00Z"),
      }),
      row({
        challenge: { id: "ch-2", difficulty: "hard", points: 300 },
        codeHash: "hash-b",
        submissionDay: new Date("2026-08-16T00:00:00Z"),
      }),
    ]);
    mockSolutionVoteFindMany.mockResolvedValue([
      { kind: "clever", createdAt: new Date("2026-08-17T10:00:00Z") },
    ]);

    const facts = await loadAchievementFacts(client, "user-1");

    const where = mockSolutionVoteFindMany.mock.calls[0][0].where;
    expect(where.userId).toEqual({ not: "user-1" });
    expect(where.OR).toEqual([
      { challengeId: "ch-1", codeHash: "hash-a" },
      { challengeId: "ch-2", codeHash: "hash-b" },
    ]);
    expect(mockSolutionVoteFindMany.mock.calls[0][0].select).toEqual({
      kind: true,
      createdAt: true,
    });
    expect(facts.votesReceived).toEqual([
      { kind: "clever", createdAt: new Date("2026-08-17T10:00:00Z") },
    ]);
  });

  it("skips rows without a codeHash when building the solution pairs", async () => {
    mockSubmissionFindMany.mockResolvedValue([row({ codeHash: null })]);

    await loadAchievementFacts(client, "user-1");

    expect(mockSolutionVoteFindMany).not.toHaveBeenCalled();
  });

  it("asks for the UTC midnight of createdAt, so a legacy row cannot match only itself", async () => {
    // Legacy rows carry their createdAt as submissionDay; grouping by that value would make
    // the row the sole member of its group and the solve the "first" of its day.
    mockSubmissionFindMany.mockResolvedValue([
      row({
        createdAt: new Date("2026-03-10T14:00:00Z"),
        submissionDay: new Date("2026-03-10T14:00:00Z"),
      }),
    ]);

    await loadAchievementFacts(client, "user-1");

    const call = mockSubmissionGroupBy.mock.calls[0][0];
    expect(call.where.submissionDay.in).toEqual([new Date("2026-03-10T00:00:00Z")]);
  });

  it("keys the earliest completion of each day by utcDayKey", async () => {
    const day1 = new Date("2026-08-14T00:00:00Z");
    const day2 = new Date("2026-08-15T00:00:00Z");
    mockSubmissionFindMany.mockResolvedValue([
      row({ submissionDay: day1 }),
      row({ submissionDay: day1, codeHash: "hash-b" }),
      row({ submissionDay: day2, createdAt: new Date("2026-08-15T12:00:00Z") }),
    ]);
    mockSubmissionGroupBy.mockResolvedValue([
      { submissionDay: day1, _min: { createdAt: new Date("2026-08-14T06:30:00Z") } },
      { submissionDay: day2, _min: { createdAt: new Date("2026-08-15T07:45:00Z") } },
    ]);

    const facts = await loadAchievementFacts(client, "user-1");

    const call = mockSubmissionGroupBy.mock.calls[0][0];
    expect(call.by).toEqual(["submissionDay"]);
    expect(call.where.status).toBe("completed");
    // Two rows share day1 - the day list carries it once.
    expect(call.where.submissionDay.in).toEqual([day1, day2]);
    expect(call._min).toEqual({ createdAt: true });
    expect([...facts.earliestCompletionByDay.entries()]).toEqual([
      ["2026-08-14", new Date("2026-08-14T06:30:00Z")],
      ["2026-08-15", new Date("2026-08-15T07:45:00Z")],
    ]);
  });
});
