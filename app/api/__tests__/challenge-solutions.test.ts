import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextResponse } from "next/server";
import { GET as getChallengeSolutionsHandler } from "../challenge/[id]/solutions/route";

// ─── Mocks ───────────────────────────────────────────────────────────────────

const mockFindMany = vi.fn();
const mockGetSessionUserId = vi.fn();
const mockHasSolvedChallenge = vi.fn();
const mockGetLifetimePointsByUserIds = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    submission: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
    },
  },
}));

vi.mock("@/lib/auth-session", () => ({
  getSessionUserId: () => mockGetSessionUserId(),
}));

vi.mock("@/lib/server/solution-access", () => ({
  hasSolvedChallenge: (...args: unknown[]) => mockHasSolvedChallenge(...args),
}));

vi.mock("@/lib/server/user-points", () => ({
  getLifetimePointsByUserIds: (...args: unknown[]) =>
    mockGetLifetimePointsByUserIds(...args),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockGetSessionUserId.mockResolvedValue({ userId: "user-me" });
  mockHasSolvedChallenge.mockResolvedValue(true);
  mockGetLifetimePointsByUserIds.mockResolvedValue(new Map());
  mockFindMany.mockResolvedValue([]);
});

const params = Promise.resolve({ id: "challenge-1" });

function call(url = "http://localhost/api/challenge/challenge-1/solutions") {
  return getChallengeSolutionsHandler(new Request(url), { params });
}

const createdAt = new Date("2026-08-01T10:00:00.000Z");

const makeRow = (
  overrides: Partial<{
    id: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
  }> = {},
) => ({
  id: "sub-1",
  userId: "user-alice",
  code: "print(1)",
  language: "python",
  createdAt,
  updatedAt: createdAt,
  user: { name: "Alice Müller", initials: "AM", avatar: "🐱" },
  ...overrides,
});

// ─── /api/challenge/[id]/solutions ───────────────────────────────────────────

describe("GET /api/challenge/[id]/solutions", () => {
  it("returns 401 without a session", async () => {
    mockGetSessionUserId.mockResolvedValue({
      error: NextResponse.json({ error: "Nicht authentifiziert." }, { status: 401 }),
    });
    const res = await call();
    expect(res.status).toBe(401);
    expect(mockFindMany).not.toHaveBeenCalled();
  });

  it("returns 403 when the user has not solved the challenge themselves", async () => {
    mockHasSolvedChallenge.mockResolvedValue(false);
    const res = await call();
    expect(res.status).toBe(403);
    expect((await res.json()).error).toContain("Löse die Challenge zuerst");
    expect(mockFindMany).not.toHaveBeenCalled();
  });

  it("excludes the own submission and filters by challenge and completed status", async () => {
    await call();
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          challengeId: "challenge-1",
          status: "completed",
          userId: { not: "user-me" },
        },
      }),
    );
  });

  it("orders by createdAt, not updatedAt, so rows do not move while paginating", async () => {
    await call();
    const args = mockFindMany.mock.calls[0][0] as { orderBy: unknown };
    expect(args.orderBy).toEqual([{ createdAt: "desc" }, { id: "desc" }]);
  });

  it("maps a row to the solution shape with the level from lifetime points", async () => {
    mockFindMany.mockResolvedValue([makeRow()]);
    mockGetLifetimePointsByUserIds.mockResolvedValue(
      new Map([["user-alice", 700]]),
    );
    const json = await (await call()).json();
    expect(json.solutions).toEqual([
      {
        id: "sub-1",
        user: { name: "Alice Müller", initials: "AM", avatar: "🐱", level: 4 },
        language: "python",
        code: "print(1)",
        createdAt: createdAt.toISOString(),
        revised: false,
      },
    ]);
    expect(json.nextCursor).toBeNull();
  });

  it("marks a solution as revised when updatedAt differs from createdAt", async () => {
    mockFindMany.mockResolvedValue([
      makeRow({ updatedAt: new Date("2026-08-02T10:00:00.000Z") }),
    ]);
    const json = await (await call()).json();
    expect(json.solutions[0].revised).toBe(true);
  });

  it("uses default limit 10 plus one row to detect the next page", async () => {
    await call();
    expect(mockFindMany).toHaveBeenCalledWith(expect.objectContaining({ take: 11 }));
  });

  it("caps the limit at 50", async () => {
    await call("http://localhost/api/challenge/challenge-1/solutions?limit=500");
    expect(mockFindMany).toHaveBeenCalledWith(expect.objectContaining({ take: 51 }));
  });

  it("passes cursor and skip when the cursor query param is set", async () => {
    await call("http://localhost/api/challenge/challenge-1/solutions?cursor=sub-old");
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ cursor: { id: "sub-old" }, skip: 1 }),
    );
  });

  it("sets nextCursor when more rows exist than the limit", async () => {
    mockFindMany.mockResolvedValue(
      Array.from({ length: 11 }, (_, i) =>
        makeRow({ id: `sub-${i}`, userId: `user-${i}` }),
      ),
    );
    const json = await (await call()).json();
    expect(json.solutions).toHaveLength(10);
    expect(json.nextCursor).toBe("sub-9");
  });

  it("returns an empty page when nobody else has solved the challenge", async () => {
    const json = await (await call()).json();
    expect(json).toEqual({ solutions: [], nextCursor: null });
  });
});

/**
 * #122: `include: { user: true }` loads the whole user row — `passwordHash`, `email`,
 * `nameKey` — into a handler that hands out foreign submissions. This pins the narrower
 * query so a later `...submission.user` spread cannot turn it into a leak.
 */
describe("the solutions query", () => {
  it("selects only the three user fields the response uses", async () => {
    await call();
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

  it("never asks the database for the password hash, the email or the name key", async () => {
    await call();
    const serialised = JSON.stringify(mockFindMany.mock.calls[0][0]);
    expect(serialised).not.toContain("passwordHash");
    expect(serialised).not.toContain("email");
    expect(serialised).not.toContain("nameKey");
  });
});
