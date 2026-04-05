import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET as getCommunityFeedHandler } from "../community/feed/route";

// ─── Prisma mock ─────────────────────────────────────────────────────────────

const mockFindMany = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    submission: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
    },
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── /api/community/feed ─────────────────────────────────────────────────────

describe("GET /api/community/feed", () => {
  const makeSubmission = (overrides: Partial<{
    id: string;
    createdAt: Date;
    status: string;
  }> = {}) => ({
    id: "sub-1",
    status: "completed",
    createdAt: new Date(Date.now() - 5 * 60 * 1000), // 5 min ago
    user: {
      name: "Alice Müller",
      initials: "AM",
      avatar: "🐱",
      level: 4,
    },
    challenge: { title: "Two Sum", points: 200 },
    ...overrides,
  });

  it("returns 200 with feed items", async () => {
    mockFindMany.mockResolvedValueOnce([makeSubmission()]);
    const res = await getCommunityFeedHandler();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(Array.isArray(json)).toBe(true);
    expect(json).toHaveLength(1);
  });

  it("maps submission fields to feed item structure", async () => {
    mockFindMany.mockResolvedValueOnce([makeSubmission()]);
    const res = await getCommunityFeedHandler();
    const json = await res.json();
    expect(json[0]).toMatchObject({
      id: "sub-1",
      user: { name: "Alice Müller", initials: "AM", level: 4 },
      action: "hat die Challenge gelöst",
      challenge: "Two Sum",
      points: 200,
    });
  });

  it("queries only completed submissions", async () => {
    mockFindMany.mockResolvedValueOnce([]);
    await getCommunityFeedHandler();
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: "completed" },
      })
    );
  });

  it("takes at most 10 submissions", async () => {
    mockFindMany.mockResolvedValueOnce([]);
    await getCommunityFeedHandler();
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 10 })
    );
  });

  it("formats time as 'vor N Minuten' for recent submissions", async () => {
    mockFindMany.mockResolvedValueOnce([
      makeSubmission({ createdAt: new Date(Date.now() - 10 * 60 * 1000) }), // 10 min ago
    ]);
    const res = await getCommunityFeedHandler();
    const json = await res.json();
    expect(json[0].time).toBe("vor 10 Minuten");
  });

  it("formats time as 'vor N Stunden' for hours-old submissions", async () => {
    mockFindMany.mockResolvedValueOnce([
      makeSubmission({ createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000) }), // 3h ago
    ]);
    const res = await getCommunityFeedHandler();
    const json = await res.json();
    expect(json[0].time).toBe("vor 3 Stunden");
  });

  it("uses singular 'Stunde' for exactly 1 hour ago", async () => {
    mockFindMany.mockResolvedValueOnce([
      makeSubmission({ createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000) }),
    ]);
    const res = await getCommunityFeedHandler();
    const json = await res.json();
    expect(json[0].time).toBe("vor 1 Stunde");
  });

  it("formats time as 'vor N Tagen' for day-old submissions", async () => {
    mockFindMany.mockResolvedValueOnce([
      makeSubmission({ createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) }), // 2 days ago
    ]);
    const res = await getCommunityFeedHandler();
    const json = await res.json();
    expect(json[0].time).toBe("vor 2 Tagen");
  });

  it("returns empty array when no completed submissions exist", async () => {
    mockFindMany.mockResolvedValueOnce([]);
    const res = await getCommunityFeedHandler();
    const json = await res.json();
    expect(json).toEqual([]);
  });
});
