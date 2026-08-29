import { describe, it, expect, vi, beforeEach } from "vitest";
import { hasSolvedChallenge } from "../solution-access";

const mockFindFirst = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    submission: {
      findFirst: (...args: unknown[]) => mockFindFirst(...args),
    },
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("hasSolvedChallenge", () => {
  it("returns false without any submission", async () => {
    mockFindFirst.mockResolvedValue(null);

    await expect(hasSolvedChallenge("user-1", "ch-1")).resolves.toBe(false);
  });

  it("returns true for a completed submission", async () => {
    mockFindFirst.mockResolvedValue({ id: "sub-1" });

    await expect(hasSolvedChallenge("user-1", "ch-1")).resolves.toBe(true);
  });

  it("does not count failed submissions", async () => {
    // A failed row exists, but the query filters it out, so Prisma answers null.
    mockFindFirst.mockResolvedValue(null);

    await expect(hasSolvedChallenge("user-1", "ch-1")).resolves.toBe(false);
    expect(mockFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: "completed" }),
      }),
    );
  });

  it("scopes the query to the user and the challenge", async () => {
    mockFindFirst.mockResolvedValue(null);

    await hasSolvedChallenge("user-1", "ch-1");

    expect(mockFindFirst).toHaveBeenCalledWith({
      where: { userId: "user-1", challengeId: "ch-1", status: "completed" },
      select: { id: true },
    });
  });
});
