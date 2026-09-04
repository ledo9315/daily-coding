import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFindMany = vi.fn();
const mockStateFind = vi.fn();
const mockStateUpdate = vi.fn();
const mockStateCreate = vi.fn();

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
      findFirst: vi.fn(),
      findMany: (...args: unknown[]) => mockFindMany(...args),
    },
    rotationState: {
      findUnique: (...args: unknown[]) => mockStateFind(...args),
      update: (...args: unknown[]) => mockStateUpdate(...args),
      create: (...args: unknown[]) => mockStateCreate(...args),
    },
    submission: { findFirst: vi.fn() },
  },
}));

import { findDailyChallengeForApp } from "@/lib/server/challenge-day";

/**
 * #67: without rotation the app served the same challenge forever. The rotation used to be
 * `dayNumber % poolSize` over an order nobody could see; it is now an explicit `position` plus a
 * stored pointer, so the admin panel can show and change what runs tomorrow.
 */
describe("findDailyChallengeForApp", () => {
  const pool = Array.from({ length: 15 }, (_, i) => ({
    id: `ch-${i}`,
    title: `Aufgabe ${i}`,
    isActive: true,
    position: i,
  }));

  const startOfToday = () => {
    const d = new Date();
    d.setUTCHours(0, 0, 0, 0);
    return d;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockFindMany.mockResolvedValue(pool);
    mockStateFind.mockResolvedValue({
      id: "current",
      challengeId: "ch-3",
      position: 3,
      day: startOfToday(),
    });
  });

  it("serves whatever the ring points at", async () => {
    expect((await findDailyChallengeForApp())?.id).toBe("ch-3");
  });

  it("does not touch the pointer twice on the same day", async () => {
    await findDailyChallengeForApp();
    expect(mockStateUpdate).not.toHaveBeenCalled();
  });

  it("advances one step on the first request of a new day and stores it", async () => {
    const yesterday = new Date(startOfToday().getTime() - 86_400_000);
    mockStateFind.mockResolvedValue({
      id: "current",
      challengeId: "ch-3",
      position: 3,
      day: yesterday,
    });

    expect((await findDailyChallengeForApp())?.id).toBe("ch-4");
    expect(mockStateUpdate).toHaveBeenCalledTimes(1);
    expect(mockStateUpdate.mock.calls[0][0].data).toMatchObject({
      challengeId: "ch-4",
      position: 4,
    });
  });

  it("queries the pool in ring order", async () => {
    await findDailyChallengeForApp();
    expect(mockFindMany.mock.calls[0][0].orderBy).toEqual([
      { position: "asc" },
      { id: "asc" },
    ]);
    expect(mockFindMany.mock.calls[0][0].where).toEqual({ isActive: true });
  });

  it("starts the ring when no pointer exists yet", async () => {
    // A database that predates the ring, or one whose row was wiped.
    mockStateFind.mockResolvedValue(null);
    expect((await findDailyChallengeForApp())?.id).toBe("ch-0");
    expect(mockStateCreate).toHaveBeenCalledTimes(1);
  });

  it("returns null for an empty pool instead of throwing", async () => {
    mockFindMany.mockResolvedValueOnce([]);
    expect(await findDailyChallengeForApp()).toBeNull();
    expect(mockStateFind).not.toHaveBeenCalled();
  });
});
