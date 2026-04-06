import { describe, it, expect, vi, beforeEach } from "vitest";
import { utcDaysInMonth } from "@/lib/monthly-challenge-goal";
import { GET as getUserStatsHandler } from "../user/stats/route";
import { GET as getUserProfileHandler } from "../user/profile/route";

// ─── Auth session mock ────────────────────────────────────────────────────────

vi.mock("@/lib/auth-session", () => ({
  getSessionUserId: vi.fn().mockResolvedValue({ userId: "user-max" }),
}));

// ─── Prisma mock ─────────────────────────────────────────────────────────────

const mockUserFindUnique = vi.fn();
const mockRankingFindUnique = vi.fn();
const mockSubmissionFindMany = vi.fn();
const mockAchievementDefFindMany = vi.fn();
const mockUserAchievementFindMany = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => mockUserFindUnique(...args),
    },
    rankingEntry: {
      findUnique: (...args: unknown[]) => mockRankingFindUnique(...args),
    },
    submission: {
      findMany: (...args: unknown[]) => mockSubmissionFindMany(...args),
    },
    achievementDef: {
      findMany: (...args: unknown[]) => mockAchievementDefFindMany(...args),
    },
    userAchievement: {
      findMany: (...args: unknown[]) => mockUserAchievementFindMany(...args),
    },
  },
}));

/** Six global achievement definitions (matches seed). */
const sixAchievementDefs = [1, 2, 3, 4, 5, 6].map((n) => ({
  id: `ach-${n}`,
  title: `Achievement ${n}`,
  description: "desc",
  iconKey: "Check",
  rarity: "common" as const,
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockSubmissionFindMany.mockResolvedValue([]);
  mockAchievementDefFindMany.mockResolvedValue(sixAchievementDefs);
  mockUserAchievementFindMany.mockResolvedValue([]);
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
  it("returns 401 when user id is not in database", async () => {
    mockUserFindUnique.mockResolvedValueOnce(null);
    const res = await getUserStatsHandler();
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json).toHaveProperty("error");
  });

  it("returns 200 with user stats", async () => {
    mockUserFindUnique.mockResolvedValueOnce(baseUser);
    mockRankingFindUnique.mockResolvedValueOnce({ rank: 2 });
    mockSubmissionFindMany.mockResolvedValueOnce([
      { challenge: { points: 100 }, createdAt: new Date() },
      { challenge: { points: 150 }, createdAt: new Date() },
      { challenge: { points: 200 }, createdAt: new Date() },
    ]);
    mockUserAchievementFindMany.mockResolvedValueOnce([
      { achievementId: "ach-1", unlockedAt: new Date() },
      { achievementId: "ach-2", unlockedAt: new Date() },
      { achievementId: "ach-3", unlockedAt: new Date() },
    ]);
    const res = await getUserStatsHandler();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toMatchObject({
      streak: 7,
      streakRecord: 14,
      totalSolved: 3,
      badges: 3,
      badgesTotal: 6,
      monthlyChallengesSolved: 3,
      monthlyChallengeGoal: utcDaysInMonth(),
    });
    expect(json.level).toBeGreaterThanOrEqual(1);
    expect(json.levelMax).toBeGreaterThan(0);
  });

  it("includes rank from today's ranking entry", async () => {
    mockUserFindUnique.mockResolvedValueOnce(baseUser);
    mockRankingFindUnique.mockResolvedValueOnce({ rank: 3 });
    const res = await getUserStatsHandler();
    const json = await res.json();
    expect(json.rank).toBe("#3");
  });

  it("returns #- rank when no ranking entry exists for today", async () => {
    mockUserFindUnique.mockResolvedValueOnce(baseUser);
    mockRankingFindUnique.mockResolvedValueOnce(null);
    const res = await getUserStatsHandler();
    const json = await res.json();
    expect(json.rank).toBe("#-");
  });

  it("calculates points from completed submissions and formats with de-DE locale", async () => {
    mockUserFindUnique.mockResolvedValueOnce(baseUser);
    mockRankingFindUnique.mockResolvedValueOnce(null);
    mockSubmissionFindMany.mockResolvedValueOnce([
      { challenge: { points: 1000 }, createdAt: new Date() },
      { challenge: { points: 500 }, createdAt: new Date() },
    ]);
    const res = await getUserStatsHandler();
    const json = await res.json();
    expect(json.points).toBe("1.500");
  });

  it("returns totalSolved equal to number of completed submissions", async () => {
    mockUserFindUnique.mockResolvedValueOnce(baseUser);
    mockRankingFindUnique.mockResolvedValueOnce(null);
    mockSubmissionFindMany.mockResolvedValueOnce([
      { challenge: { points: 100 }, createdAt: new Date() },
      { challenge: { points: 100 }, createdAt: new Date() },
      { challenge: { points: 100 }, createdAt: new Date() },
    ]);
    const res = await getUserStatsHandler();
    const json = await res.json();
    expect(json.totalSolved).toBe(3);
  });

  it("returns points=0 and totalSolved=0 when no submissions", async () => {
    mockUserFindUnique.mockResolvedValueOnce(baseUser);
    mockRankingFindUnique.mockResolvedValueOnce(null);
    mockSubmissionFindMany.mockResolvedValueOnce([]);
    const res = await getUserStatsHandler();
    const json = await res.json();
    expect(json.points).toBe("0");
    expect(json.totalSolved).toBe(0);
    expect(json.monthlyChallengesSolved).toBe(0);
    expect(json.monthlyChallengeGoal).toBe(utcDaysInMonth());
  });

  it("sets badgesTotal from the number of achievement definitions", async () => {
    mockUserFindUnique.mockResolvedValueOnce(baseUser);
    mockRankingFindUnique.mockResolvedValueOnce(null);
    const res = await getUserStatsHandler();
    const json = await res.json();
    expect(json.badgesTotal).toBe(6);
  });

  it("does not include teamRank or teamName in response", async () => {
    mockUserFindUnique.mockResolvedValueOnce(baseUser);
    mockRankingFindUnique.mockResolvedValueOnce(null);
    const res = await getUserStatsHandler();
    const json = await res.json();
    expect(json).not.toHaveProperty("teamRank");
    expect(json).not.toHaveProperty("teamName");
  });

  it("loading user, ranking, submissions, and achievements", async () => {
    mockUserFindUnique.mockResolvedValueOnce(baseUser);
    mockRankingFindUnique.mockResolvedValueOnce(null);
    await getUserStatsHandler();
    expect(mockUserFindUnique).toHaveBeenCalledTimes(1);
    expect(mockRankingFindUnique).toHaveBeenCalledTimes(1);
    expect(mockSubmissionFindMany).toHaveBeenCalledTimes(1);
    expect(mockAchievementDefFindMany).toHaveBeenCalledTimes(1);
    expect(mockUserAchievementFindMany).toHaveBeenCalledTimes(1);
  });
});

// ─── /api/user/profile ───────────────────────────────────────────────────────

describe("GET /api/user/profile", () => {
  it("returns 401 when user id is not in database", async () => {
    mockUserFindUnique.mockResolvedValueOnce(null);
    const res = await getUserProfileHandler();
    expect(res.status).toBe(401);
  });

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

  it("returns 200 with user profile", async () => {
    mockUserFindUnique.mockResolvedValueOnce({ ...baseUser, achievements: [], submissions: [] });
    mockRankingFindUnique.mockResolvedValueOnce(null);
    const res = await getUserProfileHandler();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty("id");
    expect(json).toHaveProperty("stats");
    expect(json).toHaveProperty("achievements");
    expect(json).toHaveProperty("challengeHistory");
    expect(json).toHaveProperty("monthlyActivity");
    expect(json.monthlyActivity.daysInMonth).toBe(utcDaysInMonth());
  });

  it("uppercases the user name", async () => {
    mockUserFindUnique.mockResolvedValueOnce({ ...baseUser, achievements: [], submissions: [] });
    mockRankingFindUnique.mockResolvedValueOnce(null);
    const res = await getUserProfileHandler();
    const json = await res.json();
    expect(json.name).toBe("MAX MUSTERMANN");
  });

  it("does not include team in response", async () => {
    mockUserFindUnique.mockResolvedValueOnce({ ...baseUser, achievements: [], submissions: [] });
    mockRankingFindUnique.mockResolvedValueOnce(null);
    const res = await getUserProfileHandler();
    const json = await res.json();
    expect(json).not.toHaveProperty("team");
    expect(json.stats).not.toHaveProperty("teamRank");
    expect(json.stats).not.toHaveProperty("teamName");
  });

  it("maps achievement fields correctly", async () => {
    mockUserFindUnique.mockResolvedValueOnce({ ...baseUser, achievements: [], submissions: [] });
    mockRankingFindUnique.mockResolvedValueOnce(null);
    mockAchievementDefFindMany.mockResolvedValueOnce([
      {
        id: "ach-1",
        title: "First Blood",
        description: "Solve your first challenge",
        iconKey: "sword",
        rarity: "common",
      },
    ]);
    mockUserAchievementFindMany.mockResolvedValueOnce([
      { achievementId: "ach-1", unlockedAt: new Date("2026-01-01T00:00:00Z") },
    ]);
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
    mockUserFindUnique.mockResolvedValueOnce({ ...baseUser, achievements: [], submissions: [submission] });
    mockRankingFindUnique.mockResolvedValueOnce(null);
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
    mockUserFindUnique.mockResolvedValueOnce({
      ...baseUser,
      achievements: [],
      submissions: [{ ...submission, timeTaken: 185 }],
    });
    mockRankingFindUnique.mockResolvedValueOnce(null);
    const res = await getUserProfileHandler();
    const json = await res.json();
    expect(json.challengeHistory[0].time).toBe("3:05");
  });

  it("formats null timeTaken as '-'", async () => {
    mockUserFindUnique.mockResolvedValueOnce({
      ...baseUser,
      achievements: [],
      submissions: [{ ...submission, timeTaken: null }],
    });
    mockRankingFindUnique.mockResolvedValueOnce(null);
    const res = await getUserProfileHandler();
    const json = await res.json();
    expect(json.challengeHistory[0].time).toBe("-");
  });

  it("returns #- rank in stats when no today ranking entry", async () => {
    mockUserFindUnique.mockResolvedValueOnce({ ...baseUser, achievements: [], submissions: [] });
    mockRankingFindUnique.mockResolvedValueOnce(null);
    const res = await getUserProfileHandler();
    const json = await res.json();
    expect(json.stats.rank).toBe("#-");
  });

  it("calculates points and totalSolved live from submissions", async () => {
    mockUserFindUnique.mockResolvedValueOnce({ ...baseUser, achievements: [], submissions: [] });
    mockRankingFindUnique.mockResolvedValueOnce(null);
    mockSubmissionFindMany.mockResolvedValueOnce([
      { challenge: { points: 150 }, createdAt: new Date() },
      { challenge: { points: 100 }, createdAt: new Date() },
    ]);
    const res = await getUserProfileHandler();
    const json = await res.json();
    expect(json.stats.totalSolved).toBe(2);
    expect(json.stats.points).toBe("250");
    expect(json.stats.monthlyChallengesSolved).toBe(2);
    expect(json.stats.monthlyChallengeGoal).toBe(utcDaysInMonth());
  });

  it("calculates badges live from unlocked achievements", async () => {
    mockUserFindUnique.mockResolvedValueOnce({ ...baseUser, achievements: [], submissions: [] });
    mockRankingFindUnique.mockResolvedValueOnce(null);
    mockUserAchievementFindMany.mockResolvedValueOnce([
      { achievementId: "ach-1", unlockedAt: new Date() },
      { achievementId: "ach-2", unlockedAt: new Date() },
      { achievementId: "ach-3", unlockedAt: new Date() },
      { achievementId: "ach-4", unlockedAt: new Date() },
    ]);
    const res = await getUserProfileHandler();
    const json = await res.json();
    expect(json.stats.badges).toBe(4);
  });
});
