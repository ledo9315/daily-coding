import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET as getUserStatsHandler } from "../user/stats/route";
import { GET as getUserProfileHandler } from "../user/profile/route";

// ─── Prisma mock ─────────────────────────────────────────────────────────────

const mockFindUniqueOrThrow = vi.fn();
const mockFindUnique = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUniqueOrThrow: (...args: unknown[]) => mockFindUniqueOrThrow(...args),
    },
    rankingEntry: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
    },
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── shared test data ─────────────────────────────────────────────────────────

const baseUser = {
  id: "user-max",
  name: "Max Mustermann",
  initials: "MM",
  avatar: "🦊",
  role: "Senior Developer",
  points: 1500,
  streak: 7,
  streakRecord: 14,
  totalSolved: 42,
  level: 5,
  badges: 3,
  achievements: [],
  submissions: [],
};

// ─── /api/user/stats ─────────────────────────────────────────────────────────

describe("GET /api/user/stats", () => {
  it("returns 200 with user stats", async () => {
    mockFindUniqueOrThrow.mockResolvedValueOnce(baseUser);
    mockFindUnique.mockResolvedValueOnce({ rank: 2 });
    const res = await getUserStatsHandler();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toMatchObject({
      streak: 7,
      streakRecord: 14,
      totalSolved: 42,
      level: 5,
      levelMax: 3000,
      badges: 3,
      badgesTotal: 6,
    });
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

  it("formats points with de-DE locale (dots as thousands separators)", async () => {
    mockFindUniqueOrThrow.mockResolvedValueOnce({ ...baseUser, points: 1500 });
    mockFindUnique.mockResolvedValueOnce(null);
    const res = await getUserStatsHandler();
    const json = await res.json();
    // de-DE locale formats 1500 as "1.500"
    expect(json.points).toBe("1.500");
  });

  it("always returns badgesTotal=6", async () => {
    mockFindUniqueOrThrow.mockResolvedValueOnce(baseUser);
    mockFindUnique.mockResolvedValueOnce(null);
    const res = await getUserStatsHandler();
    const json = await res.json();
    expect(json.badgesTotal).toBe(6);
  });
});

// ─── /api/user/profile ────────────────────────────────────────────────────────

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
    id: "ach-1",
    title: "First Blood",
    description: "Solve your first challenge",
    iconKey: "sword",
    unlocked: true,
    rarity: "common",
    unlockedAt: new Date("2026-01-01T00:00:00Z"),
  };

  it("returns 200 with user profile", async () => {
    mockFindUniqueOrThrow.mockResolvedValueOnce({
      ...baseUser,
      achievements: [],
      submissions: [],
    });
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
    mockFindUniqueOrThrow.mockResolvedValueOnce({
      ...baseUser,
      name: "Max Mustermann",
      achievements: [],
      submissions: [],
    });
    mockFindUnique.mockResolvedValueOnce(null);
    const res = await getUserProfileHandler();
    const json = await res.json();
    expect(json.name).toBe("MAX MUSTERMANN");
  });

  it("maps achievement fields correctly", async () => {
    mockFindUniqueOrThrow.mockResolvedValueOnce({
      ...baseUser,
      achievements: [achievement],
      submissions: [],
    });
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
    mockFindUniqueOrThrow.mockResolvedValueOnce({
      ...baseUser,
      achievements: [],
      submissions: [submission],
    });
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
      submissions: [{ ...submission, timeTaken: 185 }], // 3 min 5 sec
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
    mockFindUniqueOrThrow.mockResolvedValueOnce({
      ...baseUser,
      achievements: [],
      submissions: [],
    });
    mockFindUnique.mockResolvedValueOnce(null);
    const res = await getUserProfileHandler();
    const json = await res.json();
    expect(json.stats.rank).toBe("#-");
  });
});
