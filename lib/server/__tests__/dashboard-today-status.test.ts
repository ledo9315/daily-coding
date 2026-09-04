import { describe, it, expect, vi, beforeEach } from "vitest";

const mockChallengeFindFirst = vi.fn();
const mockChallengeFindMany = vi.fn();
const mockSubmissionFindFirst = vi.fn();

/** The ring stands on `ch-1`, on the day the test runs: the pointer must not advance here. */
const startOfTodayUtc = () => {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
};
const rotationState = {
  id: "current",
  challengeId: "ch-1",
  position: 0,
  get day() {
    return startOfTodayUtc();
  },
};

/**
 * This test is about the query logic, not about language. Stubbed rather than taught to the
 * prisma mock: the German columns are the source, so a request in any other language now
 * reaches for a translation row - a lookup that has nothing to do with what is asserted here.
 */
vi.mock("@/lib/server/content-translations", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/server/content-translations")>();
  return {
    ...actual,
    localizeChallenge: async <T,>(challenge: T) => challenge,
    localizeChallengeTitles: async () => new Map<string, string>(),
    localizeChallengeTitle: async (_id: string, title: string) => title,
    localizeAchievements: async <T,>(defs: T) => defs,
    // Reaches for the mocked prisma, so the catalogue still comes from the fixture.
    findLocalizedAchievementDefs: async () =>
      (await import("@/lib/prisma")).prisma.achievementDef.findMany({
        orderBy: { id: "asc" },
      }),
  };
});

vi.mock("@/lib/prisma", () => ({
  prisma: {
    challenge: {
      findFirst: (...args: unknown[]) => mockChallengeFindFirst(...args),
      findMany: (...args: unknown[]) => mockChallengeFindMany(...args),
    },
    // The daily comes from the ring now: pool plus pointer, no date lookup.
    rotationState: {
      findUnique: () => Promise.resolve(rotationState),
      update: () => Promise.resolve(rotationState),
      create: () => Promise.resolve(rotationState),
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
  mockChallengeFindMany.mockResolvedValue([{ ...challenge, position: 0, isActive: true }]);
  mockSubmissionFindFirst.mockResolvedValue(null);
});

/**
 * #35: the dashboard needs to know whether today's challenge was already submitted -
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
