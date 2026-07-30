import { describe, it, expect, vi, beforeEach } from "vitest";

const mockChallengeFindFirst = vi.fn();
const mockSubmissionFindFirst = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    challenge: {
      findFirst: (...args: unknown[]) => mockChallengeFindFirst(...args),
    },
    submission: {
      findFirst: (...args: unknown[]) => mockSubmissionFindFirst(...args),
    },
  },
}));

import { getTodayChallengeSummary } from "@/lib/server/dashboard-data";

const challenge = {
  id: "ch-1",
  title: "Array Manipulation",
  description: "Kumulative Summe",
  difficulty: "medium" as const,
  points: 150,
  category: { name: "Algorithmen" },
};

beforeEach(() => {
  vi.clearAllMocks();
  mockChallengeFindFirst.mockResolvedValue(challenge);
  mockSubmissionFindFirst.mockResolvedValue(null);
});

/**
 * #35: the dashboard needs to know whether today's challenge was already submitted —
 * otherwise the button promises "start challenge" while the next page refuses.
 */
describe("getTodayChallengeSummary", () => {
  it("reports no status without a user", async () => {
    const summary = await getTodayChallengeSummary();
    expect(summary?.todayStatus).toBeNull();
    expect(mockSubmissionFindFirst).not.toHaveBeenCalled();
  });

  it("reports completed when today's submission passed", async () => {
    mockSubmissionFindFirst.mockResolvedValueOnce({
      id: "sub-1",
      status: "completed",
      createdAt: new Date(),
    });
    const summary = await getTodayChallengeSummary("user-1");
    expect(summary?.todayStatus).toBe("completed");
  });

  it("reports failed when today's submission did not pass", async () => {
    mockSubmissionFindFirst.mockResolvedValueOnce({
      id: "sub-1",
      status: "failed",
      createdAt: new Date(),
    });
    const summary = await getTodayChallengeSummary("user-1");
    expect(summary?.todayStatus).toBe("failed");
  });

  it("reports no status when the user has not submitted today", async () => {
    const summary = await getTodayChallengeSummary("user-1");
    expect(summary?.todayStatus).toBeNull();
  });
});
