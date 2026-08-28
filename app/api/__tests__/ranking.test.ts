import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET as getRankingHandler } from "../ranking/route";
import { GET as getRankingPreviewHandler } from "../ranking/preview/route";

const mockGetLiveRanking = vi.fn();
const mockGetLifetimePointsByUserIds = vi.fn();

vi.mock("@/lib/server/ranking-live", () => ({
  getLiveRanking: (...args: unknown[]) => mockGetLiveRanking(...args),
}));

vi.mock("@/lib/server/user-points", () => ({
  getLifetimePointsByUserIds: (...args: unknown[]) =>
    mockGetLifetimePointsByUserIds(...args),
}));

/** Prevents `lib/prisma` (server-only) from being pulled in via `dashboard-data` in the preview handler. */
vi.mock("@/lib/prisma", () => ({
  prisma: {},
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockGetLifetimePointsByUserIds.mockResolvedValue(new Map([["user-1", 0]]));
});

// ─── /api/ranking ─────────────────────────────────────────────────────────────

describe("GET /api/ranking", () => {
  function makeRequest(period?: string) {
    const url = period
      ? `http://localhost/api/ranking?period=${period}`
      : "http://localhost/api/ranking";
    return new NextRequest(url);
  }

  const liveRow = (overrides = {}) => ({
    userId: "user-1",
    rank: 1,
    user: { id: "user-1", name: "Alice", initials: "AL", avatar: "🐱" },
    points: 500,
    challengesSolved: 3,
    ...overrides,
  });

  it("returns 200 with mapped ranking entries for period=week", async () => {
    mockGetLiveRanking.mockResolvedValueOnce([liveRow()]);
    const res = await getRankingHandler(makeRequest("week"));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveLength(1);
    expect(json[0]).toMatchObject({
      rank: 1,
      name: "Alice",
      points: 500,
      challengesSolved: 3,
    });
    expect(json[0]).toHaveProperty("level", 1);
    expect(mockGetLiveRanking).toHaveBeenCalledWith("week");
  });

  // #91: "today" is gone as a period. An absent, legacy or invalid value must not error.
  it("defaults to period=week when param is absent", async () => {
    mockGetLiveRanking.mockResolvedValueOnce([]);
    const res = await getRankingHandler(makeRequest());
    expect(res.status).toBe(200);
    expect(mockGetLiveRanking).toHaveBeenCalledWith("week");
  });

  it("falls back to week for the retired today period", async () => {
    mockGetLiveRanking.mockResolvedValueOnce([]);
    const res = await getRankingHandler(makeRequest("today"));
    expect(res.status).toBe(200);
    expect(mockGetLiveRanking).toHaveBeenCalledWith("week");
  });

  it("uses period=week when specified", async () => {
    mockGetLiveRanking.mockResolvedValueOnce([
      liveRow({
        points: 1200,
        challengesSolved: 5,
      }),
    ]);
    await getRankingHandler(makeRequest("week"));
    expect(mockGetLiveRanking).toHaveBeenCalledWith("week");
  });

  it("uses period=month when specified", async () => {
    mockGetLiveRanking.mockResolvedValueOnce([]);
    await getRankingHandler(makeRequest("month"));
    expect(mockGetLiveRanking).toHaveBeenCalledWith("month");
  });

  it("uses period=all when specified", async () => {
    mockGetLiveRanking.mockResolvedValueOnce([]);
    await getRankingHandler(makeRequest("all"));
    expect(mockGetLiveRanking).toHaveBeenCalledWith("all");
  });

  it("falls back to week for an invalid period", async () => {
    mockGetLiveRanking.mockResolvedValueOnce([]);
    await getRankingHandler(makeRequest("invalid"));
    expect(mockGetLiveRanking).toHaveBeenCalledWith("week");
  });

  it("omits time for week and month responses", async () => {
    mockGetLiveRanking.mockResolvedValueOnce([
      liveRow({ challengesSolved: 3 }),
    ]);
    const resWeek = await getRankingHandler(makeRequest("week"));
    expect((await resWeek.json())[0]).not.toHaveProperty("time");
  });

  it("includes challengesSolved for week/month when present", async () => {
    mockGetLiveRanking.mockResolvedValueOnce([
      liveRow({ challengesSolved: 4, points: 800 }),
    ]);
    const res = await getRankingHandler(makeRequest("month"));
    const row = (await res.json())[0];
    expect(row.challengesSolved).toBe(4);
    expect(row).not.toHaveProperty("time");
  });

  it("returns empty array when no entries exist", async () => {
    mockGetLiveRanking.mockResolvedValueOnce([]);
    const res = await getRankingHandler(makeRequest("month"));
    const json = await res.json();
    expect(json).toEqual([]);
  });

  it("does not handle team period (falls back to week)", async () => {
    mockGetLiveRanking.mockResolvedValueOnce([]);
    await getRankingHandler(makeRequest("team"));
    expect(mockGetLiveRanking).toHaveBeenCalledWith("week");
  });
});

// ─── /api/ranking/preview ─────────────────────────────────────────────────────

describe("GET /api/ranking/preview", () => {
  const previewLiveRow = () => ({
    userId: "user-bob",
    rank: 1,
    user: { id: "user-bob", name: "Bob", initials: "BO", avatar: "🐶" },
    points: 300,
    challengesSolved: 2,
  });

  it("returns 200 with the week preview", async () => {
    mockGetLiveRanking.mockResolvedValueOnce([previewLiveRow()]);
    mockGetLifetimePointsByUserIds.mockResolvedValueOnce(new Map([["user-bob", 0]]));
    const res = await getRankingPreviewHandler();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty("week");
    expect(json.week).toHaveLength(1);
    expect(json.week[0]).toMatchObject({
      rank: 1,
      name: "Bob",
      points: 300,
      challengesSolved: 2,
    });
    expect(json.week[0]).toHaveProperty("level", 1);
  });

  it("does not include a team property", async () => {
    mockGetLiveRanking.mockResolvedValueOnce([previewLiveRow()]);
    const res = await getRankingPreviewHandler();
    const json = await res.json();
    expect(json).not.toHaveProperty("team");
  });

  it("returns at most 5 entries when more exist", async () => {
    const six = Array.from({ length: 6 }, (_, i) => ({
      userId: `u-${i}`,
      rank: i + 1,
      user: {
        id: `u-${i}`,
        name: `User ${i}`,
        initials: "U",
        avatar: "🐱",
      },
      points: 50,
    }));
    mockGetLiveRanking.mockResolvedValueOnce(six);
    mockGetLifetimePointsByUserIds.mockResolvedValue(new Map());
    const res = await getRankingPreviewHandler();
    const json = await res.json();
    expect(json.week).toHaveLength(5);
  });

  it("returns an empty week array when no entries exist", async () => {
    mockGetLiveRanking.mockResolvedValueOnce([]);
    const res = await getRankingPreviewHandler();
    const json = await res.json();
    expect(json.week).toEqual([]);
  });

  it("queries live ranking + lifetime points", async () => {
    mockGetLiveRanking.mockResolvedValueOnce([]);
    await getRankingPreviewHandler();
    expect(mockGetLiveRanking).toHaveBeenCalledWith("week");
    expect(mockGetLifetimePointsByUserIds).toHaveBeenCalled();
  });
});
