import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET as getUserStatsHandler } from "../user/stats/route";
import { GET as getUserProfileHandler } from "../user/profile/route";

// ─── Prisma mock ─────────────────────────────────────────────────────────────

const mockFindUniqueOrThrow = vi.fn();
const mockFindUnique = vi.fn();
const mockSubmissionFindMany = vi.fn();
const mockUserAchievementCount = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUniqueOrThrow: (...args: unknown[]) => mockFindUniqueOrThrow(...args),
    },
    rankingEntry: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
    },
    submission: {
      findMany: (...args: unknown[]) => mockSubmissionFindMany(...args),
    },
    userAchievement: {
      count: (...args: unknown[]) => mockUserAchievementCount(...args),
    },
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  // Sane defaults so tests don't fail on unrelated mocks
  mockSubmissionFindMany.mockResolvedValue([]);
  mockUserAchievementCount.mockResolvedValue(0);
});

// ─── shared test data ─────────────────────────────────────────────────────────

const baseUser = {
  id: "user-max",
  name: "Max Mustermann",
  initials: "MM",
  avatar: "🦊",
  streak: 7,
  streakRecord: 14,
  achievements: [],
  submissions: [],
};

// ─── /api/user/stats ──────────────────────────────────────────────────────────

describe("GET /api/user/stats", () => {
  it("returns 200 with user stats", async () => {
    mockFindUniqueOrThrow.mockResolvedValueOnce(baseUser);
    mockFindUnique.mockResolvedValueOnce({ rank: 2 });
    mockSubmissionFindMany.mockResolvedValueOnce([
      { challenge: { points: 100 } },
      { challenge: { points: 150 } },
      { challenge: { points: 200 } },
    ]);
    mockUserAchievementCount.mockResolvedValueOnce(3);
    const res = await getUserStatsHandler();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toMatchObject({
      streak: 7,
      streakRecord: 14,
      totalSolved: 3,
      badges: 3,
      badgesTotal: 6,
    });
    expect(json.level).toBeGreaterThanOrEqual(1);
    expect(json.levelMax).toBeGreaterThan(0);
  });

  it("includes rank from today's ranking entry", async () => {
    mockFindUniqueOrThrow.mockResolvedValueOnce(baseUser);
    mockFindUnique.mockResolvedValueOnce({ rank: 3 });
    const res = await getUserStatsHandler();
    const json = await res.json();
    expect(json.rank).toBe("#3");
  });

  it("returns #- rank when no ranking entry exists for today", async () => {
    mockFindUniqueOrThrow.mockResolvedValueOnce(baseUser);
    mockFindUnique.mockResolvedValueOnce(null);
    const res = await getUserStatsHandler();
    const json = await res.json();
    expect(json.rank).toBe("#-");
  });

  it("calculates points from completed submissions and formats with de-DE locale", async () => {
    mockFindUniqueOrThrow.mockResolvedValueOnce(baseUser);
    mockFindUnique.mockResolvedValueOnce(null);
    mockSubmissionFindMany.mockResolvedValueOnce([
      { challenge: { points: 1000 } },
      { challenge: { points: 500 } },
    ]);
    const res = await getUserStatsHandler();
    const json = await res.json();
    expect(json.points).toBe("1.500");
  });

  it("returns totalSolved equal to number of completed submissions", async () => {
    mockFindUniqueOrThrow.mockResolvedValueOnce(baseUser);
    mockFindUnique.mockResolvedValueOnce(null);
    mockSubmissionFindMany.mockResolvedValueOnce([
      { challenge: { points: 100 } },
      { challenge: { points: 100 } },
      { challenge: { points: 100 } },
    ]);
    const res = await getUserStatsHandler();
    const json = await res.json();
    expect(json.totalSolved).toBe(3);
  });

  it("returns points=0 and totalSolved=0 when no submissions", async () => {
    mockFindUniqueOrThrow.mockResolvedValueOnce(baseUser);
    mockFindUnique.mockResolvedValueOnce(null);
    mockSubmissionFindMany.mockResolvedValueOnce([]);
    const res = await getUserStatsHandler();
    const json = await res.json();
    expect(json.points).toBe("0");
    expect(json.totalSolved).toBe(0);
  });

  it("always returns badgesTotal=6", async () => {
    mockFindUniqueOrThrow.mockResolvedValueOnce(baseUser);
    mockFindUnique.mockResolvedValueOnce(null);
    const res = await getUserStatsHandler();
    const json = await res.json();
    expect(json.badgesTotal).toBe(6);
  });

  it("does not include teamRank or teamName in response", async () => {
    mockFindUniqueOrThrow.mockResolvedValueOnce(baseUser);
    mockFindUnique.mockResolvedValueOnce(null);
    const res = await getUserStatsHandler();
    const json = await res.json();
    expect(json).not.toHaveProperty("teamRank");
    expect(json).not.toHaveProperty("teamName");
  });

  it("only calls findUnique once (for ranking, no team query)", async () => {
    mockFindUniqueOrThrow.mockResolvedValueOnce(baseUser);
    mockFindUnique.mockResolvedValueOnce(null);
    await getUserStatsHandler();
    expect(mockFindUnique).toHaveBeenCalledTimes(1);
  });
});

// ─── /api/user/profile ───────────────────────────────────────────────────────

describe("GET /api/user/profile", () => {
  const submission = {
    id: "sub-1",
    status: "completed",
    timeTaken: 185,
    rank: 2,
    createdAt: new Date("2026-03-15T10:00:00Z"),
    challenge: {
      title: "Two Sum",
      difficulty: "medium",
      points: 200,
    },
  };

  const achievement = {
    userId: "user-max",
    achievementId: "ach-1",
    unlockedAt: new Date("2026-01-01T00:00:00Z"),
    createdAt: new Date(),
    achievement: {
      id: "ach-1",
      title: "First Blood",
      description: "Solve your first challenge",
      iconKey: "sword",
      rarity: "common",
      createdAt: new Date(),
    },
  };

  it("returns 200 with user profile", async () => {
    mockFindUniqueOrThrow.mockResolvedValueOnce({ ...baseUser, achievements: [], submissions: [] });
    mockFindUnique.mockResolvedValueOnce(null);
    const res = await getUserProfileHandler();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty("id");
    expect(json).toHaveProperty("stats");
    expect(json).toHaveProperty("achievements");
    expect(json).toHaveProperty("challengeHistory");
  });

  it("uppercases the user name", async () => {
    mockFindUniqueOrThrow.mockResolvedValueOnce({ ...baseUser, achievements: [], submissions: [] });
    mockFindUnique.mockResolvedValueOnce(null);
    const res = await getUserProfileHandler();
    const json = await res.json();
    expect(json.name).toBe("MAX MUSTERMANN");
  });

  it("does not include team in response", async () => {
    mockFindUniqueOrThrow.mockResolvedValueOnce({ ...baseUser, achievements: [], submissions: [] });
    mockFindUnique.mockResolvedValueOnce(null);
    const res = await getUserProfileHandler();
    const json = await res.json();
    expect(json).not.toHaveProperty("team");
    expect(json.stats).not.toHaveProperty("teamRank");
    expect(json.stats).not.toHaveProperty("teamName");
  });

  it("maps achievement fields correctly", async () => {
    mockFindUniqueOrThrow.mockResolvedValueOnce({ ...baseUser, achievements: [achievement], submissions: [] });
    mockFindUnique.mockResolvedValueOnce(null);
    const res = await getUserProfileHandler();
    const json = await res.json();
    expect(json.achievements).toHaveLength(1);
    expect(json.achievements[0]).toMatchObject({
      id: "ach-1",
      title: "First Blood",
      unlocked: true,
      rarity: "common",
    });
    expect(json.achievements[0].unlockedAt).toBeDefined();
  });

  it("maps submission history correctly", async () => {
    mockFindUniqueOrThrow.mockResolvedValueOnce({ ...baseUser, achievements: [], submissions: [submission] });
    mockFindUnique.mockResolvedValueOnce(null);
    const res = await getUserProfileHandler();
    const json = await res.json();
    expect(json.challengeHistory).toHaveLength(1);
    expect(json.challengeHistory[0]).toMatchObject({
      id: "sub-1",
      title: "Two Sum",
      status: "completed",
      points: 200,
      rank: 2,
    });
  });

  it("formats timeTaken as M:SS string", async () => {
    mockFindUniqueOrThrow.mockResolvedValueOnce({
      ...baseUser,
      achievements: [],
      submissions: [{ ...submission, timeTaken: 185 }],
    });
    mockFindUnique.mockResolvedValueOnce(null);
    const res = await getUserProfileHandler();
    const json = await res.json();
    expect(json.challengeHistory[0].time).toBe("3:05");
  });

  it("formats null timeTaken as '-'", async () => {
    mockFindUniqueOrThrow.mockResolvedValueOnce({
      ...baseUser,
      achievements: [],
      submissions: [{ ...submission, timeTaken: null }],
    });
    mockFindUnique.mockResolvedValueOnce(null);
    const res = await getUserProfileHandler();
    const json = await res.json();
    expect(json.challengeHistory[0].time).toBe("-");
  });

  it("returns #- rank in stats when no today ranking entry", async () => {
    mockFindUniqueOrThrow.mockResolvedValueOnce({ ...baseUser, achievements: [], submissions: [] });
    mockFindUnique.mockResolvedValueOnce(null);
    const res = await getUserProfileHandler();
    const json = await res.json();
    expect(json.stats.rank).toBe("#-");
  });

  it("calculates points and totalSolved live from submissions", async () => {
    mockFindUniqueOrThrow.mockResolvedValueOnce({ ...baseUser, achievements: [], submissions: [] });
    mockFindUnique.mockResolvedValueOnce(null);
    mockSubmissionFindMany.mockResolvedValueOnce([
      { challenge: { points: 150 } },
      { challenge: { points: 100 } },
    ]);
    const res = await getUserProfileHandler();
    const json = await res.json();
    expect(json.stats.totalSolved).toBe(2);
    expect(json.stats.points).toBe("250");
  });

  it("calculates badges live from unlocked achievements", async () => {
    mockFindUniqueOrThrow.mockResolvedValueOnce({ ...baseUser, achievements: [], submissions: [] });
    mockFindUnique.mockResolvedValueOnce(null);
    mockUserAchievementCount.mockResolvedValueOnce(4);
    const res = await getUserProfileHandler();
    const json = await res.json();
    expect(json.stats.badges).toBe(4);
  });
});
