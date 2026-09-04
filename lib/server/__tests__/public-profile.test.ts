import { describe, it, expect, vi, beforeEach } from "vitest";
import { getPublicProfile } from "../public-profile";

const mockUserFindUnique = vi.fn();
const mockSubmissionFindMany = vi.fn();
const mockSubmissionGroupBy = vi.fn();
const mockCommentFindMany = vi.fn();
const mockSolutionVoteFindMany = vi.fn();
const mockAchievementDefFindMany = vi.fn();
const mockUserAchievementFindMany = vi.fn();

// `loadAchievementFacts` shares this client, hence the groupBy, comment and vote methods.
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => mockUserFindUnique(...args),
    },
    submission: {
      findMany: (...args: unknown[]) => mockSubmissionFindMany(...args),
      groupBy: (...args: unknown[]) => mockSubmissionGroupBy(...args),
    },
    comment: {
      findMany: (...args: unknown[]) => mockCommentFindMany(...args),
    },
    solutionVote: {
      findMany: (...args: unknown[]) => mockSolutionVoteFindMany(...args),
    },
    achievementDef: {
      findMany: (...args: unknown[]) => mockAchievementDefFindMany(...args),
    },
    userAchievement: {
      findMany: (...args: unknown[]) => mockUserAchievementFindMany(...args),
    },
  },
}));

/** A row in the shape `loadAchievementFacts` selects. */
const solved = (points: number, iso: string) => ({
  createdAt: new Date(iso),
  language: "javascript",
  code: "return 1;",
  codeHash: `hash-${iso}`,
  submissionDay: new Date(iso.slice(0, 10)),
  challenge: { id: `ch-${iso}`, points, difficulty: "easy" },
});

beforeEach(() => {
  vi.clearAllMocks();
  // Oldest first: the loader orders nothing, so the last solve has to be picked out.
  mockSubmissionFindMany.mockResolvedValue([
    solved(100, "2026-08-13T09:00:00Z"),
    solved(200, "2026-08-14T09:00:00Z"),
  ]);
  mockSubmissionGroupBy.mockResolvedValue([]);
  mockCommentFindMany.mockResolvedValue([]);
  mockSolutionVoteFindMany.mockResolvedValue([]);
  mockAchievementDefFindMany.mockResolvedValue([
    { id: "ach-a", title: "Erster Schritt", description: "…", iconKey: "Check", rarity: "common" },
    { id: "ach-b", title: "Unaufhaltsam", description: "…", iconKey: "Zap", rarity: "epic" },
  ]);
  mockUserAchievementFindMany.mockResolvedValue([
    { achievementId: "ach-a", unlockedAt: new Date("2026-08-13T09:00:00Z") },
  ]);
});

/** A row carrying the secrets the query must never hand out. */
function makeUserRow() {
  return {
    id: "user-1",
    name: "Anna Schmidt",
    initials: "AS",
    avatar: "🐱",
    streak: 4,
    streakRecord: 9,
    createdAt: new Date("2026-03-15T10:00:00Z"),
    email: "leak@example.com",
    passwordHash: "$2b$10$abc",
    role: "admin",
  };
}

/** The lookups by handle; the facts loader also reads the user table, by id. */
const handleLookups = () =>
  mockUserFindUnique.mock.calls.filter((call) => "nameKey" in call[0].where);

describe("getPublicProfile", () => {
  it("returns only the public fields and leaks no credentials", async () => {
    mockUserFindUnique.mockResolvedValue(makeUserRow());

    const result = await getPublicProfile("anna schmidt");

    expect(result).not.toBeNull();
    const serialised = JSON.stringify(result);
    expect(serialised).not.toContain("leak@example.com");
    expect(serialised).not.toContain("$2b$10$abc");
    expect(serialised).not.toContain("admin");
    expect(Object.keys(result!).sort()).toEqual(
      [
        "achievements",
        "avatar",
        "badgesTotal",
        "initials",
        "lastSolvedAt",
        "level",
        "memberSince",
        "monthlyActivity",
        "name",
        "points",
        "streak",
        "streakRecord",
        "totalSolved",
      ].sort()
    );
    expect(result).toMatchObject({
      name: "Anna Schmidt",
      initials: "AS",
      avatar: "🐱",
      points: 300,
      level: 3,
      streak: 4,
      streakRecord: 9,
      totalSolved: 2,
    });
  });

  /**
   * Both come back as `Date`, not as a formatted string: the page picks the format for the
   * reader's locale, and a query function has no locale to pick it with.
   */
  it("reports when the account joined and when it last solved something", async () => {
    mockUserFindUnique.mockResolvedValue(makeUserRow());

    const result = await getPublicProfile("anna schmidt");

    expect(result!.memberSince).toEqual(new Date("2026-03-15T10:00:00Z"));
    // The newest submission, not the first row returned.
    expect(result!.lastSolvedAt).toEqual(new Date("2026-08-14T09:00:00Z"));
  });

  it("leaves the last solve empty for an account that never finished one", async () => {
    mockUserFindUnique.mockResolvedValue(makeUserRow());
    mockSubmissionFindMany.mockResolvedValue([]);

    const result = await getPublicProfile("anna schmidt");

    expect(result!.lastSolvedAt).toBeNull();
    expect(result!.totalSolved).toBe(0);
    expect(result!.points).toBe(0);
  });

  /**
   * A stranger has no use for someone else's progress bars, and the challenge history -
   * the one block carrying failed and skipped attempts - stays off this page entirely.
   */
  it("hands out unlocked badges only", async () => {
    mockUserFindUnique.mockResolvedValue(makeUserRow());

    const result = await getPublicProfile("anna schmidt");

    expect(result!.achievements.map((a) => a.id)).toEqual(["ach-a"]);
    expect(result!.badgesTotal).toBe(2);
  });

  it("selects no sensitive columns from the user table", async () => {
    mockUserFindUnique.mockResolvedValue(makeUserRow());

    await getPublicProfile("anna schmidt");

    for (const call of mockUserFindUnique.mock.calls) {
      const select = call[0].select;
      expect(select).not.toHaveProperty("email");
      expect(select).not.toHaveProperty("passwordHash");
      expect(select).not.toHaveProperty("role");
    }
  });

  it("returns null for an unknown handle without further queries", async () => {
    mockUserFindUnique.mockResolvedValue(null);

    expect(await getPublicProfile("nobody")).toBeNull();
    expect(mockUserFindUnique).toHaveBeenCalledTimes(1);
    expect(mockSubmissionFindMany).not.toHaveBeenCalled();
    expect(mockCommentFindMany).not.toHaveBeenCalled();
    expect(mockAchievementDefFindMany).not.toHaveBeenCalled();
  });

  it("normalises case and whitespace of the handle to the name key", async () => {
    mockUserFindUnique.mockResolvedValue(makeUserRow());

    for (const handle of ["Anna Schmidt", "anna schmidt", "  ANNA   SCHMIDT  "]) {
      await getPublicProfile(handle);
    }

    const lookups = handleLookups();
    expect(lookups).toHaveLength(3);
    for (const call of lookups) {
      expect(call[0].where.nameKey).toBe("anna schmidt");
    }
  });

  it("decodes the percent-encoded segment Next passes to the page", async () => {
    mockUserFindUnique.mockResolvedValue(null);

    await getPublicProfile("anna%20schmidt");

    expect(mockUserFindUnique.mock.calls[0][0].where.nameKey).toBe("anna schmidt");
  });

  it("falls back to the raw handle when it is not a valid escape sequence", async () => {
    mockUserFindUnique.mockResolvedValue(null);

    await getPublicProfile("50% coder");

    expect(mockUserFindUnique.mock.calls[0][0].where.nameKey).toBe("50% coder");
  });
});
