import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSubmissionFindFirst = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    submission: {
      findFirst: (...args: unknown[]) => mockSubmissionFindFirst(...args),
    },
    challenge: { findFirst: vi.fn() },
  },
}));

import { findTodaySubmission } from "@/lib/server/challenge-day";

beforeEach(() => {
  vi.clearAllMocks();
  mockSubmissionFindFirst.mockResolvedValue(null);
});

/**
 * #35: the check "submitted for this challenge today (UTC)?" was copied into both
 * the submit and the daily route. The helper is now the single source - for the
 * submit lock, the daily response and the dashboard card.
 */
describe("findTodaySubmission", () => {
  it("limits the query to the current UTC day", async () => {
    await findTodaySubmission("user-1", "ch-1");
    const where = mockSubmissionFindFirst.mock.calls[0][0].where;
    expect(where.userId).toBe("user-1");
    expect(where.challengeId).toBe("ch-1");

    const { gte, lt } = where.createdAt;
    expect(gte.getUTCHours()).toBe(0);
    expect(gte.getUTCMinutes()).toBe(0);
    expect(gte.getUTCSeconds()).toBe(0);
    expect(lt.getTime() - gte.getTime()).toBe(24 * 60 * 60 * 1000);
  });

  it("returns the newest submission of the day", async () => {
    mockSubmissionFindFirst.mockResolvedValueOnce({
      id: "sub-1",
      status: "completed",
      createdAt: new Date(),
      code: "x",
      language: "javascript",
    });
    const found = await findTodaySubmission("user-1", "ch-1");
    expect(found?.id).toBe("sub-1");
    expect(mockSubmissionFindFirst.mock.calls[0][0].orderBy).toEqual({
      createdAt: "desc",
    });
  });

  // #60: without testResults the page shows the empty template ("0/5 passed") next
  // to "successfully submitted" after a reload.
  it("includes the stored test results", async () => {
    await findTodaySubmission("user-1", "ch-1");
    expect(mockSubmissionFindFirst.mock.calls[0][0].select.testResults).toBe(true);
  });

  it("returns null when nothing was submitted today", async () => {
    expect(await findTodaySubmission("user-1", "ch-1")).toBeNull();
  });
});
