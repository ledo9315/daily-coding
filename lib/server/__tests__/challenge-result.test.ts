import { describe, it, expect, vi, beforeEach } from "vitest";
import { getOwnChallengeResult } from "../challenge-result";

const mockSubmissionFindFirst = vi.fn();
const mockUserFindUnique = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    submission: {
      findFirst: (...args: unknown[]) => mockSubmissionFindFirst(...args),
    },
    user: {
      findUnique: (...args: unknown[]) => mockUserFindUnique(...args),
    },
  },
}));

const newest = {
  id: "sub-new",
  code: "const a = 1;",
  language: "javascript",
  testResults: [{ name: "Beispiel 1", status: "passed" }],
  createdAt: new Date("2026-08-20T09:00:00Z"),
  updatedAt: new Date("2026-08-20T09:00:00Z"),
  challenge: {
    id: "ch-1",
    title: "Zwei Summen",
    description: "Finde zwei Zahlen …",
    difficulty: "easy",
    points: 100,
    category: { name: "Arrays" },
  },
};

beforeEach(() => {
  vi.clearAllMocks();
  mockSubmissionFindFirst.mockResolvedValue(newest);
  mockUserFindUnique.mockResolvedValue({ streak: 4, streakRecord: 9 });
});

describe("getOwnChallengeResult", () => {
  it("returns submission, challenge and streaks of the own solution", async () => {
    const result = await getOwnChallengeResult("user-1", "ch-1");

    expect(result).toMatchObject({
      submission: { id: "sub-new", code: "const a = 1;", language: "javascript" },
      challenge: {
        id: "ch-1",
        title: "Zwei Summen",
        difficulty: "easy",
        points: 100,
        category: "Arrays",
      },
      streak: 4,
      streakRecord: 9,
    });
  });

  it("returns null without touching the user table when nothing was solved", async () => {
    mockSubmissionFindFirst.mockResolvedValue(null);

    expect(await getOwnChallengeResult("user-1", "ch-1")).toBeNull();
    expect(mockUserFindUnique).not.toHaveBeenCalled();
  });

  it("asks for the newest completed submission of that user", async () => {
    await getOwnChallengeResult("user-1", "ch-1");

    const args = mockSubmissionFindFirst.mock.calls[0][0];
    expect(args.where).toEqual({ userId: "user-1", challengeId: "ch-1", status: "completed" });
    expect(args.orderBy).toEqual({ createdAt: "desc" });
  });

  /**
   * Reading the challenge by its URL id would expose inactive drafts, so it may only be
   * reachable through the relation of the user's own submission.
   */
  it("reads the challenge nested in the submission query, never with include", async () => {
    await getOwnChallengeResult("user-1", "ch-1");

    const args = mockSubmissionFindFirst.mock.calls[0][0];
    expect(args).not.toHaveProperty("include");
    expect(args.select.challenge.select.title).toBe(true);
    expect(args.select.challenge.select.category.select.name).toBe(true);
    expect(args.select.challenge).not.toHaveProperty("include");
  });

  it("selects no private user columns for the streaks", async () => {
    await getOwnChallengeResult("user-1", "ch-1");

    const select = mockUserFindUnique.mock.calls[0][0].select;
    expect(Object.keys(select).sort()).toEqual(["streak", "streakRecord"]);
  });
});

/**
 * #224 puts the task description on the result page. It is read through the user's own
 * submission, so the rule that keeps an unsolved challenge unreadable lives here rather
 * than in the page that renders it.
 */
describe("the description of the challenge", () => {
  it("comes along with the own solution", async () => {
    const result = await getOwnChallengeResult("user-1", "ch-1");
    expect(result?.challenge.description).toBe("Finde zwei Zahlen …");
  });

  it("is read through the own submission, never by a lookup on the URL id", async () => {
    await getOwnChallengeResult("user-1", "ch-1");
    const args = mockSubmissionFindFirst.mock.calls[0][0] as {
      where: Record<string, unknown>;
    };
    expect(args.where).toEqual({ userId: "user-1", challengeId: "ch-1", status: "completed" });
  });

  it("stays unreachable without a completed submission of the user", async () => {
    mockSubmissionFindFirst.mockResolvedValue(null);
    expect(await getOwnChallengeResult("user-1", "ch-1")).toBeNull();
  });
});
