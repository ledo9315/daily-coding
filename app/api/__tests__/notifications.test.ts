import { describe, it, expect, vi, beforeEach } from "vitest";

/** Route handlers translate themselves; `next-intl/server` throws outside react-server. */
/**
 * This test is about the query logic, not about language. Stubbed rather than taught to the
 * prisma mock: the German columns are the source, so a request in any other language now
 * reaches for a translation row - a lookup that has nothing to do with what is asserted here.
 */
vi.mock("@/lib/server/content-translations", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/server/content-translations")>();
  return {
    ...actual,
    localizeChallenge: async <T,>(challenge: T) => challenge,
    localizeChallengeTitles: async () => new Map<string, string>(),
    localizeChallengeTitle: async (_id: string, title: string) => title,
    localizeAchievements: async <T,>(defs: T) => defs,
    // Reaches for the mocked prisma, so the catalogue still comes from the fixture.
    findLocalizedAchievementDefs: async () =>
      (await import("@/lib/prisma")).prisma.achievementDef.findMany({
        orderBy: { id: "asc" },
      }),
  };
});

vi.mock("next-intl/server", async () =>
  (await import("@/app/api/__tests__/api-translations-mock")).apiTranslationsMock()
);

import { NextResponse } from "next/server";

const mockFindMany = vi.fn();
const mockCount = vi.fn();
const mockUpdateMany = vi.fn();
const mockUserFindUnique = vi.fn();
const mockUserUpdate = vi.fn();
const mockGetSessionUserId = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    notification: {
      findMany: (...a: unknown[]) => mockFindMany(...a),
      count: (...a: unknown[]) => mockCount(...a),
      updateMany: (...a: unknown[]) => mockUpdateMany(...a),
    },
    user: {
      findUnique: (...a: unknown[]) => mockUserFindUnique(...a),
      update: (...a: unknown[]) => mockUserUpdate(...a),
    },
  },
}));

vi.mock("@/lib/auth-session", () => ({
  getSessionUserId: () => mockGetSessionUserId(),
}));

import { GET as listHandler } from "../notifications/route";
import { POST as readHandler } from "../notifications/read/route";
import {
  GET as settingHandler,
  PATCH as patchSettingHandler,
} from "../user/notifications/route";

const HASH = "c".repeat(64);

function listRequest(query = ""): Request {
  return new Request(`http://localhost/api/notifications${query}`);
}

function patchRequest(body: unknown): Request {
  return new Request("http://localhost/api/user/notifications", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockGetSessionUserId.mockResolvedValue({ userId: "user-me" });
  mockFindMany.mockResolvedValue([]);
  mockCount.mockResolvedValue(0);
  mockUpdateMany.mockResolvedValue({ count: 0 });
});

describe("GET /api/notifications", () => {
  it("rejects an anonymous caller", async () => {
    mockGetSessionUserId.mockResolvedValue({
      error: NextResponse.json({ error: "Nicht authentifiziert." }, { status: 401 }),
    });

    expect((await listHandler(listRequest())).status).toBe(401);
  });

  it("returns the sentence, the deep link and the unread count", async () => {
    mockFindMany.mockResolvedValue([
      {
        id: "n1",
        kind: "clever",
        challengeId: "chal-1",
        codeHash: HASH,
        readAt: null,
        createdAt: new Date("2026-08-30T10:00:00Z"),
        actor: { name: "Watson", initials: "WA", avatar: "/a.png" },
        challenge: { title: "Two Sum" },
      },
    ]);
    mockCount.mockResolvedValue(3);

    const body = await (await listHandler(listRequest())).json();

    expect(body.unreadCount).toBe(3);
    expect(body.items[0]).toMatchObject({
      id: "n1",
      href: `/challenge/chal-1/solutions?solution=${HASH}`,
      read: false,
    });
    expect(body.items[0].text).toContain("Watson");
    expect(body.items[0].text).toContain("Two Sum");
  });

  it("caps the page size", async () => {
    await listHandler(listRequest("?limit=999"));

    expect(mockFindMany).toHaveBeenCalledWith(expect.objectContaining({ take: 50 }));
  });
});

describe("POST /api/notifications/read", () => {
  it("marks every unread notification of the caller as read", async () => {
    mockUpdateMany.mockResolvedValue({ count: 2 });

    const body = await (await readHandler()).json();

    expect(mockUpdateMany).toHaveBeenCalledWith({
      where: { userId: "user-me", readAt: null },
      data: { readAt: expect.any(Date) },
    });
    expect(body).toEqual({ read: 2 });
  });
});

describe("/api/user/notifications", () => {
  it("reads both settings", async () => {
    mockUserFindUnique.mockResolvedValue({
      notifyByEmail: false,
      notifyDailyReminder: true,
    });

    expect(await (await settingHandler()).json()).toEqual({
      notifyByEmail: false,
      notifyDailyReminder: true,
    });
  });

  /** The panel writes the switch that moved, so the body carries one key, not both. */
  it.each(["notifyByEmail", "notifyDailyReminder"] as const)(
    "stores %s on its own",
    async (setting) => {
      mockUserUpdate.mockResolvedValue({});

      const response = await patchSettingHandler(patchRequest({ [setting]: false }));

      expect(response.status).toBe(200);
      expect(mockUserUpdate).toHaveBeenCalledWith({
        where: { id: "user-me" },
        data: { [setting]: false },
        select: { notifyByEmail: true, notifyDailyReminder: true },
      });
    }
  );

  it("refuses anything that is not a boolean", async () => {
    const response = await patchSettingHandler(patchRequest({ notifyByEmail: "ja" }));

    expect(response.status).toBe(400);
    expect(mockUserUpdate).not.toHaveBeenCalled();
  });

  it("refuses a body that names no setting at all", async () => {
    const response = await patchSettingHandler(patchRequest({ somethingElse: true }));

    expect(response.status).toBe(400);
    expect(mockUserUpdate).not.toHaveBeenCalled();
  });
});
