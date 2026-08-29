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
  const makeSubmission = (
    overrides: Partial<{
      id: string;
      userId: string;
      createdAt: Date;
      status: string;
    }> = {},
  ) => ({
    id: "sub-1",
    userId: "user-alice",
    status: "completed",
    createdAt: new Date(Date.now() - 5 * 60 * 1000), // 5 min ago
    user: {
      name: "Alice Müller",
      initials: "AM",
      avatar: "🐱",
      email: "alice@example.com",
    },
    challenge: { title: "Two Sum", points: 200 },
    ...overrides,
  });

  /** Chronological submissions for lifetime points and level-up; ids must match the page row. */
  function withLifetimePoints(submission: ReturnType<typeof makeSubmission>) {
    mockFindMany
      .mockResolvedValueOnce([submission])
      .mockResolvedValueOnce([
        {
          id: "sub-p1",
          userId: submission.userId,
          challenge: { points: 300 },
        },
        {
          id: "sub-p2",
          userId: submission.userId,
          challenge: { points: 300 },
        },
        {
          id: submission.id,
          userId: submission.userId,
          challenge: { points: submission.challenge.points },
        },
      ]);
  }

  it("returns 200 with feed items", async () => {
    withLifetimePoints(makeSubmission());
    const res = await getCommunityFeedHandler(
      new Request("http://localhost/api/community/feed"),
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.items).toHaveLength(1);
    expect(json.nextCursor).toBeNull();
  });

  it("maps submission fields to feed item structure", async () => {
    withLifetimePoints(makeSubmission());
    const res = await getCommunityFeedHandler(
      new Request("http://localhost/api/community/feed"),
    );
    const json = await res.json();
    expect(json.items[0]).toMatchObject({
      id: "sub-1",
      kind: "challenge-solved",
      user: { name: "Alice Müller", initials: "AM", level: 4 },
      username: "@Alice Müller",
      action: "hat die Challenge gelöst",
      challenge: "Two Sum",
      points: 200,
      levelUp: { previousLevel: 3, newLevel: 4 },
    });
    expect(json.items[0].createdAt).toBeDefined();
  });

  it("queries only completed submissions", async () => {
    mockFindMany.mockResolvedValueOnce([]);
    await getCommunityFeedHandler(
      new Request("http://localhost/api/community/feed"),
    );
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: "completed" },
      }),
    );
  });

  it("uses default limit 15 plus one row to detect next page", async () => {
    mockFindMany.mockResolvedValueOnce([]);
    await getCommunityFeedHandler(
      new Request("http://localhost/api/community/feed"),
    );
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 16 }),
    );
  });

  it("passes cursor and skip when cursor query param is set", async () => {
    mockFindMany.mockResolvedValueOnce([]);
    await getCommunityFeedHandler(
      new Request("http://localhost/api/community/feed?cursor=sub-old"),
    );
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        cursor: { id: "sub-old" },
        skip: 1,
      }),
    );
  });

  it("formats time as 'vor N Minuten' for recent submissions", async () => {
    withLifetimePoints(
      makeSubmission({ createdAt: new Date(Date.now() - 10 * 60 * 1000) }),
    );
    const res = await getCommunityFeedHandler(
      new Request("http://localhost/api/community/feed"),
    );
    const json = await res.json();
    expect(json.items[0].time).toBe("vor 10 Minuten");
  });

  it("formats time as 'vor N Stunden' for hours-old submissions", async () => {
    withLifetimePoints(
      makeSubmission({ createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000) }),
    );
    const res = await getCommunityFeedHandler(
      new Request("http://localhost/api/community/feed"),
    );
    const json = await res.json();
    expect(json.items[0].time).toBe("vor 3 Stunden");
  });

  it("uses singular 'Stunde' for exactly 1 hour ago", async () => {
    withLifetimePoints(
      makeSubmission({ createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000) }),
    );
    const res = await getCommunityFeedHandler(
      new Request("http://localhost/api/community/feed"),
    );
    const json = await res.json();
    expect(json.items[0].time).toBe("vor 1 Stunde");
  });

  it("formats time as 'vor N Tagen' for day-old submissions", async () => {
    withLifetimePoints(
      makeSubmission({
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      }),
    );
    const res = await getCommunityFeedHandler(
      new Request("http://localhost/api/community/feed"),
    );
    const json = await res.json();
    expect(json.items[0].time).toBe("vor 2 Tagen");
  });

  it("returns empty items when no completed submissions exist", async () => {
    mockFindMany.mockResolvedValueOnce([]);
    const res = await getCommunityFeedHandler(
      new Request("http://localhost/api/community/feed"),
    );
    const json = await res.json();
    expect(json).toEqual({ items: [], nextCursor: null });
  });

  it("sets nextCursor when more rows exist than limit", async () => {
    const rows = Array.from({ length: 16 }, (_, i) =>
      makeSubmission({
        id: `sub-${i}`,
        userId: `user-${i}`,
        createdAt: new Date(Date.now() - i * 60000),
      }),
    );
    mockFindMany
      .mockResolvedValueOnce(rows)
      .mockResolvedValueOnce(
        rows.slice(0, 15).map((r) => ({
          id: r.id,
          userId: r.userId,
          challenge: { points: 100 },
        })),
      );
    const res = await getCommunityFeedHandler(
      new Request("http://localhost/api/community/feed?limit=15"),
    );
    const json = await res.json();
    expect(json.items).toHaveLength(15);
    expect(json.nextCursor).toBe("sub-14");
  });
});

/**
 * #122: the route used `include: { user: true }`, which loads the whole user row -
 * `passwordHash`, `email`, `nameKey` - into a handler that answers a public feed. The
 * response was always built from an explicit object, so nothing leaked; this pins the
 * narrower query so a later `...submission.user` spread cannot turn it into a leak.
 */
describe("the feed query", () => {
  it("selects only the three user fields the response uses", async () => {
    mockFindMany.mockResolvedValueOnce([]);
    await getCommunityFeedHandler(
      new Request("http://localhost/api/community/feed") as never,
    );

    const args = mockFindMany.mock.calls[0][0] as {
      include?: unknown;
      select?: { user?: { select?: Record<string, boolean> } };
    };
    expect(args.include).toBeUndefined();
    expect(Object.keys(args.select?.user?.select ?? {}).sort()).toEqual([
      "avatar",
      "initials",
      "name",
    ]);
  });

  it("never asks the database for the password hash or the email", async () => {
    mockFindMany.mockResolvedValueOnce([]);
    await getCommunityFeedHandler(
      new Request("http://localhost/api/community/feed") as never,
    );
    const serialised = JSON.stringify(mockFindMany.mock.calls[0][0]);
    expect(serialised).not.toContain("passwordHash");
    expect(serialised).not.toContain("email");
  });
});
