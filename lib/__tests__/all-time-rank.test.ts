import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSubmissionFindMany = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    submission: { findMany: (...args: unknown[]) => mockSubmissionFindMany(...args) },
  },
}));

import { getAllTimeRankNumber } from "@/lib/server/user-points";

/**
 * #91: "Dein Rang" on the dashboard and in the profile used to show the position in
 * today's speed ranking, which is going away together with the solve timer. It now
 * ranks by lifetime points across all completed submissions.
 */
describe("getAllTimeRankNumber", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /** Every row is one completed submission, contributing its challenge's points. */
  function submissions(rows: Array<[userId: string, points: number]>) {
    mockSubmissionFindMany.mockResolvedValue(
      rows.map(([userId, points]) => ({ userId, challenge: { points } })),
    );
  }

  it("ranks the highest lifetime total first", async () => {
    submissions([
      ["a", 100],
      ["b", 300],
      ["c", 200],
    ]);

    await expect(getAllTimeRankNumber("b")).resolves.toBe(1);
    await expect(getAllTimeRankNumber("c")).resolves.toBe(2);
    await expect(getAllTimeRankNumber("a")).resolves.toBe(3);
  });

  it("sums several submissions per user", async () => {
    submissions([
      ["a", 100],
      ["a", 100],
      ["a", 100],
      ["b", 250],
    ]);

    await expect(getAllTimeRankNumber("a")).resolves.toBe(1);
    await expect(getAllTimeRankNumber("b")).resolves.toBe(2);
  });

  it("lets a tie share the same place", async () => {
    submissions([
      ["a", 200],
      ["b", 200],
      ["c", 100],
    ]);

    await expect(getAllTimeRankNumber("a")).resolves.toBe(1);
    await expect(getAllTimeRankNumber("b")).resolves.toBe(1);
    await expect(getAllTimeRankNumber("c")).resolves.toBe(3);
  });

  it("gives a user without points a place instead of nothing", async () => {
    submissions([["a", 100]]);

    await expect(getAllTimeRankNumber("newcomer")).resolves.toBe(2);
  });

  it("returns rank 1 when nobody has scored yet", async () => {
    submissions([]);

    await expect(getAllTimeRankNumber("anyone")).resolves.toBe(1);
  });

  it("counts only completed submissions", async () => {
    submissions([["a", 100]]);

    await getAllTimeRankNumber("a");

    expect(mockSubmissionFindMany.mock.calls[0][0].where).toEqual({ status: "completed" });
  });
});
