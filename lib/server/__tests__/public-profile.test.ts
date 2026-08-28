import { describe, it, expect, vi, beforeEach } from "vitest";
import { getPublicProfile } from "../public-profile";

const mockUserFindUnique = vi.fn();
const mockSubmissionFindMany = vi.fn();
const mockSubmissionCount = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => mockUserFindUnique(...args),
    },
    submission: {
      findMany: (...args: unknown[]) => mockSubmissionFindMany(...args),
      count: (...args: unknown[]) => mockSubmissionCount(...args),
    },
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockSubmissionFindMany.mockResolvedValue([
    { userId: "user-1", challenge: { points: 300 } },
  ]);
  mockSubmissionCount.mockResolvedValue(7);
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
    email: "leak@example.com",
    passwordHash: "$2b$10$abc",
    role: "admin",
  };
}

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
        "avatar",
        "initials",
        "level",
        "name",
        "streak",
        "streakRecord",
        "totalSolved",
      ].sort()
    );
    expect(result).toEqual({
      name: "Anna Schmidt",
      initials: "AS",
      avatar: "🐱",
      level: 3,
      streak: 4,
      streakRecord: 9,
      totalSolved: 7,
    });
  });

  it("selects no sensitive columns from the user table", async () => {
    mockUserFindUnique.mockResolvedValue(makeUserRow());

    await getPublicProfile("anna schmidt");

    const select = mockUserFindUnique.mock.calls[0][0].select;
    expect(select).not.toHaveProperty("email");
    expect(select).not.toHaveProperty("passwordHash");
    expect(select).not.toHaveProperty("role");
  });

  it("returns null for an unknown handle without further queries", async () => {
    mockUserFindUnique.mockResolvedValue(null);

    expect(await getPublicProfile("nobody")).toBeNull();
    expect(mockSubmissionFindMany).not.toHaveBeenCalled();
    expect(mockSubmissionCount).not.toHaveBeenCalled();
  });

  it("normalises case and whitespace of the handle to the name key", async () => {
    mockUserFindUnique.mockResolvedValue(makeUserRow());

    for (const handle of ["Anna Schmidt", "anna schmidt", "  ANNA   SCHMIDT  "]) {
      await getPublicProfile(handle);
    }

    for (const call of mockUserFindUnique.mock.calls) {
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
