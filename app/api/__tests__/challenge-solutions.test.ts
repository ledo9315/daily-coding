import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextResponse } from "next/server";
import { GET as getChallengeSolutionsHandler } from "../challenge/[id]/solutions/route";

// ─── Mocks ───────────────────────────────────────────────────────────────────

const mockFindMany = vi.fn();
const mockGroupBy = vi.fn();
const mockGetSessionUserId = vi.fn();
const mockHasSolvedChallenge = vi.fn();
const mockGetLifetimePointsByUserIds = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    submission: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
      groupBy: (...args: unknown[]) => mockGroupBy(...args),
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

const createdAt = new Date("2026-08-01T10:00:00.000Z");

const makeGroup = (
  overrides: Partial<{ codeHash: string; count: number; firstAt: Date }> = {},
) => {
  const { codeHash = "hash-a", count = 1, firstAt = createdAt } = overrides;
  return { codeHash, _count: { _all: count }, _min: { createdAt: firstAt } };
};

const makeRow = (
  overrides: Partial<{
    id: string;
    userId: string;
    codeHash: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
  }> = {},
) => ({
  id: overrides.id ?? "sub-1",
  userId: overrides.userId ?? "user-alice",
  code: "print(1)",
  language: "python",
  createdAt: overrides.createdAt ?? createdAt,
  updatedAt: overrides.updatedAt ?? overrides.createdAt ?? createdAt,
  user: {
    name: overrides.name ?? "Alice Müller",
    initials: "AM",
    avatar: "🐱",
  },
});

/** The route asks `submission.findMany` two different questions; `select` tells them apart. */
let ownHashRows: { codeHash: string }[] = [];
let groupRows: ReturnType<typeof makeRow>[] = [];

beforeEach(() => {
  vi.clearAllMocks();
  mockGetSessionUserId.mockResolvedValue({ userId: "user-me" });
  mockHasSolvedChallenge.mockResolvedValue(true);
  mockGetLifetimePointsByUserIds.mockResolvedValue(new Map());
  mockGroupBy.mockResolvedValue([]);
  ownHashRows = [];
  groupRows = [makeRow()];
  mockFindMany.mockImplementation((args: { select?: Record<string, unknown> }) =>
    Promise.resolve(args?.select?.code ? groupRows : ownHashRows),
  );
});

const params = Promise.resolve({ id: "challenge-1" });

function call(url = "http://localhost/api/challenge/challenge-1/solutions") {
  return getChallengeSolutionsHandler(new Request(url), { params });
}

// ─── /api/challenge/[id]/solutions ───────────────────────────────────────────

describe("GET /api/challenge/[id]/solutions", () => {
  it("returns 401 without a session", async () => {
    mockGetSessionUserId.mockResolvedValue({
      error: NextResponse.json({ error: "Nicht authentifiziert." }, { status: 401 }),
    });
    const res = await call();
    expect(res.status).toBe(401);
    expect(mockGroupBy).not.toHaveBeenCalled();
  });

  it("returns 403 when the user has not solved the challenge themselves", async () => {
    mockHasSolvedChallenge.mockResolvedValue(false);
    const res = await call();
    expect(res.status).toBe(403);
    expect((await res.json()).error).toContain("Löse die Challenge zuerst");
    expect(mockGroupBy).not.toHaveBeenCalled();
  });

  it("groups by codeHash over every hashed row of the challenge", async () => {
    await call();
    expect(mockGroupBy).toHaveBeenCalledWith(
      expect.objectContaining({
        by: ["codeHash"],
        where: {
          challengeId: "challenge-1",
          status: "completed",
          codeHash: { not: null },
        },
      }),
    );
  });

  it("returns an empty page when nobody has solved the challenge", async () => {
    const json = await (await call()).json();
    expect(json).toEqual({ groups: [], nextCursor: null });
    // Only the lookup of the own hashes, no per-group query.
    expect(mockFindMany).toHaveBeenCalledTimes(1);
  });

  it("maps a group to one card with its authors and the total submission count", async () => {
    mockGroupBy.mockResolvedValue([makeGroup({ count: 12 })]);
    groupRows = [
      makeRow({ id: "sub-1", userId: "user-alice" }),
      makeRow({ id: "sub-2", userId: "user-bob", name: "Bob Bauer" }),
    ];
    mockGetLifetimePointsByUserIds.mockResolvedValue(new Map([["user-alice", 700]]));

    const json = await (await call()).json();
    expect(json.groups).toEqual([
      {
        codeHash: "hash-a",
        submissionId: "sub-1",
        language: "python",
        code: "print(1)",
        createdAt: createdAt.toISOString(),
        revised: false,
        authors: [
          { name: "Alice Müller", initials: "AM", avatar: "🐱", level: 4 },
          { name: "Bob Bauer", initials: "AM", avatar: "🐱", level: 1 },
        ],
        submissionCount: 12,
        own: false,
      },
    ]);
    expect(json.nextCursor).toBeNull();
  });

  it("takes the code and the comment thread from the oldest row of the group", async () => {
    mockGroupBy.mockResolvedValue([makeGroup()]);
    await call();
    const args = mockFindMany.mock.calls[1][0] as { orderBy: unknown; take: number };
    expect(args.orderBy).toEqual([{ createdAt: "asc" }, { id: "asc" }]);
    expect(args.take).toBe(5);
  });

  it("marks a single-row group as revised when updatedAt differs from createdAt", async () => {
    mockGroupBy.mockResolvedValue([makeGroup()]);
    groupRows = [makeRow({ updatedAt: new Date("2026-08-02T10:00:00.000Z") })];
    const json = await (await call()).json();
    expect(json.groups[0].revised).toBe(true);
  });

  it("orders groups by their oldest submission, newest group first", async () => {
    mockGroupBy.mockResolvedValue([
      makeGroup({ codeHash: "hash-old", firstAt: new Date("2026-07-01T00:00:00.000Z") }),
      makeGroup({ codeHash: "hash-new", firstAt: new Date("2026-08-20T00:00:00.000Z") }),
    ]);
    const json = await (await call()).json();
    expect(json.groups.map((g: { codeHash: string }) => g.codeHash)).toEqual([
      "hash-new",
      "hash-old",
    ]);
  });

  it("breaks a tie on the timestamp by codeHash so the order is total", async () => {
    mockGroupBy.mockResolvedValue([
      makeGroup({ codeHash: "hash-a" }),
      makeGroup({ codeHash: "hash-b" }),
    ]);
    const json = await (await call()).json();
    expect(json.groups.map((g: { codeHash: string }) => g.codeHash)).toEqual([
      "hash-b",
      "hash-a",
    ]);
  });
});

// ─── Sorting and filtering ───────────────────────────────────────────────────

describe("sorting and filtering the groups", () => {
  const older = makeGroup({
    codeHash: "hash-old",
    firstAt: new Date("2026-07-01T00:00:00.000Z"),
  });
  const newer = makeGroup({
    codeHash: "hash-new",
    firstAt: new Date("2026-08-20T00:00:00.000Z"),
  });

  const hashes = (json: { groups: { codeHash: string }[] }) =>
    json.groups.map((group) => group.codeHash);

  it("puts the oldest group first when sort=oldest", async () => {
    mockGroupBy.mockResolvedValue([newer, older]);
    const json = await (
      await call("http://localhost/api/challenge/challenge-1/solutions?sort=oldest")
    ).json();
    expect(hashes(json)).toEqual(["hash-old", "hash-new"]);
  });

  it("falls back to newest for an unknown sort value", async () => {
    mockGroupBy.mockResolvedValue([older, newer]);
    const json = await (
      await call("http://localhost/api/challenge/challenge-1/solutions?sort=beliebt")
    ).json();
    expect(hashes(json)).toEqual(["hash-new", "hash-old"]);
  });

  it("flips the tie-break with the direction so the order stays total", async () => {
    mockGroupBy.mockResolvedValue([makeGroup({ codeHash: "hash-a" }), makeGroup({ codeHash: "hash-b" })]);
    const json = await (
      await call("http://localhost/api/challenge/challenge-1/solutions?sort=oldest")
    ).json();
    expect(hashes(json)).toEqual(["hash-a", "hash-b"]);
  });

  it("restricts the query to the own hashes when filter=mine", async () => {
    ownHashRows = [{ codeHash: "hash-mine" }];
    await call("http://localhost/api/challenge/challenge-1/solutions?filter=mine");
    expect(mockGroupBy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ codeHash: { in: ["hash-mine"] } }),
      }),
    );
  });

  it("finds nothing for filter=mine when the user has no hashed solution", async () => {
    await call("http://localhost/api/challenge/challenge-1/solutions?filter=mine");
    expect(mockGroupBy).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ codeHash: { in: [] } }) }),
    );
  });

  it("marks the group the own solution belongs to", async () => {
    ownHashRows = [{ codeHash: "hash-a" }];
    mockGroupBy.mockResolvedValue([
      makeGroup({ codeHash: "hash-a" }),
      makeGroup({ codeHash: "hash-b" }),
    ]);

    const json = await (await call()).json();
    expect(
      json.groups.map((group: { codeHash: string; own: boolean }) => [group.codeHash, group.own]),
    ).toEqual([
      ["hash-b", false],
      ["hash-a", true],
    ]);
  });
});

// ─── Pagination over groups ──────────────────────────────────────────────────

/**
 * The cursor names a group, not an offset. That is the point: submissions arriving between
 * two pages shift every offset, and a group would then be served twice or skipped entirely.
 */
describe("paging through the groups", () => {
  const twelveGroups = Array.from({ length: 12 }, (_, i) =>
    makeGroup({
      codeHash: `hash-${String(i).padStart(2, "0")}`,
      firstAt: new Date(2026, 0, 1 + i),
    }),
  );

  it("serves the default page size and points the cursor at the last group", async () => {
    mockGroupBy.mockResolvedValue(twelveGroups);
    const json = await (await call()).json();
    expect(json.groups).toHaveLength(10);
    expect(json.nextCursor).toBe("hash-02");
  });

  it("continues after the cursor group without repeating it", async () => {
    mockGroupBy.mockResolvedValue(twelveGroups);
    const json = await (
      await call("http://localhost/api/challenge/challenge-1/solutions?cursor=hash-02")
    ).json();
    expect(json.groups.map((g: { codeHash: string }) => g.codeHash)).toEqual([
      "hash-01",
      "hash-00",
    ]);
    expect(json.nextCursor).toBeNull();
  });

  it("does not lose a group when a new one appears before the second page", async () => {
    mockGroupBy.mockResolvedValue(twelveGroups);
    const first = await (await call()).json();

    mockGroupBy.mockResolvedValue([
      makeGroup({ codeHash: "hash-fresh", firstAt: new Date(2027, 0, 1) }),
      ...twelveGroups,
    ]);
    const second = await (
      await call(
        `http://localhost/api/challenge/challenge-1/solutions?cursor=${first.nextCursor}`,
      )
    ).json();

    const seen = [...first.groups, ...second.groups].map(
      (g: { codeHash: string }) => g.codeHash,
    );
    expect(new Set(seen).size).toBe(seen.length);
    expect(seen).toContain("hash-00");
  });

  it("ends the list when the cursor group is gone instead of restarting it", async () => {
    mockGroupBy.mockResolvedValue(twelveGroups);
    const json = await (
      await call("http://localhost/api/challenge/challenge-1/solutions?cursor=hash-gone")
    ).json();
    expect(json).toEqual({ groups: [], nextCursor: null });
  });

  it("caps the limit at 50", async () => {
    mockGroupBy.mockResolvedValue(twelveGroups);
    const json = await (
      await call("http://localhost/api/challenge/challenge-1/solutions?limit=500")
    ).json();
    expect(json.groups).toHaveLength(12);
  });
});

/**
 * #122: `include: { user: true }` loads the whole user row — `passwordHash`, `email`,
 * `nameKey` — into a handler that hands out foreign submissions. This pins the narrower
 * query so a later `...submission.user` spread cannot turn it into a leak.
 */
describe("the solutions query", () => {
  beforeEach(() => {
    mockGroupBy.mockResolvedValue([makeGroup()]);
  });

  it("selects only the three user fields the response uses", async () => {
    await call();
    const args = mockFindMany.mock.calls[1][0] as {
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
    const serialised = JSON.stringify(mockFindMany.mock.calls[1][0]);
    expect(serialised).not.toContain("passwordHash");
    expect(serialised).not.toContain("email");
    expect(serialised).not.toContain("nameKey");
  });
});
