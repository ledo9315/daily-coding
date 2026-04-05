import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET as getRankingHandler } from "../ranking/route";
import { GET as getRankingPreviewHandler } from "../ranking/preview/route";

// ─── Prisma mock ─────────────────────────────────────────────────────────────

const mockFindMany = vi.fn();
vi.mock("@/lib/prisma", () => ({
  prisma: {
    rankingEntry: { findMany: (...args: unknown[]) => mockFindMany(...args) },
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── /api/ranking ─────────────────────────────────────────────────────────────

describe("GET /api/ranking", () => {
  function makeRequest(period?: string) {
    const url = period
      ? `http://localhost/api/ranking?period=${period}`
      : "http://localhost/api/ranking";
    return new NextRequest(url);
  }

  const dbEntry = (overrides = {}) => ({
    rank: 1,
    previousRank: null,
    points: 500,
    timeTaken: "3:42",
    challengesSolved: 1,
    user: { name: "Alice", initials: "AL", avatar: "🐱", level: 5 },
    ...overrides,
  });

  it("returns 200 with mapped ranking entries for period=today", async () => {
    mockFindMany.mockResolvedValueOnce([dbEntry()]);
    const res = await getRankingHandler(makeRequest("today"));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveLength(1);
    expect(json[0]).toMatchObject({ rank: 1, name: "Alice", points: 500, time: "3:42" });
  });

  it("defaults to period=today when param is absent", async () => {
    mockFindMany.mockResolvedValueOnce([]);
    const res = await getRankingHandler(makeRequest());
    expect(res.status).toBe(200);
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ period: "today" }) })
    );
  });

  it("uses period=week when specified", async () => {
    mockFindMany.mockResolvedValueOnce([]);
    await getRankingHandler(makeRequest("week"));
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ period: "week" }) })
    );
  });

  it("falls back to today for an invalid period", async () => {
    mockFindMany.mockResolvedValueOnce([]);
    await getRankingHandler(makeRequest("invalid"));
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ period: "today" }) })
    );
  });

  it("omits undefined optional fields from the response", async () => {
    mockFindMany.mockResolvedValueOnce([dbEntry({ previousRank: null, timeTaken: null, challengesSolved: null })]);
    const res = await getRankingHandler(makeRequest("today"));
    const json = await res.json();
    expect(json[0].previousRank).toBeUndefined();
    expect(json[0].time).toBeUndefined();
    expect(json[0].challengesSolved).toBeUndefined();
  });

  it("returns empty array when no entries exist", async () => {
    mockFindMany.mockResolvedValueOnce([]);
    const res = await getRankingHandler(makeRequest("month"));
    const json = await res.json();
    expect(json).toEqual([]);
  });
});

// ─── /api/ranking/preview ─────────────────────────────────────────────────────

describe("GET /api/ranking/preview", () => {
  const dbEntry = () => ({
    rank: 1,
    points: 300,
    timeTaken: "2:00",
    user: { name: "Bob", initials: "BO", avatar: "🐶", level: 3 },
  });

  it("returns 200 with today preview", async () => {
    mockFindMany.mockResolvedValueOnce([dbEntry()]);
    const res = await getRankingPreviewHandler();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty("today");
    expect(json.today).toHaveLength(1);
    expect(json.today[0]).toMatchObject({ rank: 1, name: "Bob", points: 300 });
  });

  it("queries with take: 5", async () => {
    mockFindMany.mockResolvedValueOnce([]);
    await getRankingPreviewHandler();
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 5 })
    );
  });

  it("returns empty today array when no entries", async () => {
    mockFindMany.mockResolvedValueOnce([]);
    const res = await getRankingPreviewHandler();
    const json = await res.json();
    expect(json.today).toEqual([]);
  });
});
