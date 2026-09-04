import { describe, it, expect, vi, beforeEach } from "vitest";

/** Route handlers translate themselves; `next-intl/server` throws outside react-server. */
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
      href: `/challenge/chal-1/loesungen?loesung=${HASH}`,
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
  it("reads the current setting", async () => {
    mockUserFindUnique.mockResolvedValue({ notifyByEmail: false });

    expect(await (await settingHandler()).json()).toEqual({ notifyByEmail: false });
  });

  it("stores a new setting", async () => {
    mockUserUpdate.mockResolvedValue({});

    const response = await patchSettingHandler(patchRequest({ notifyByEmail: false }));

    expect(response.status).toBe(200);
    expect(mockUserUpdate).toHaveBeenCalledWith({
      where: { id: "user-me" },
      data: { notifyByEmail: false },
    });
  });

  it("refuses anything that is not a boolean", async () => {
    const response = await patchSettingHandler(patchRequest({ notifyByEmail: "ja" }));

    expect(response.status).toBe(400);
    expect(mockUserUpdate).not.toHaveBeenCalled();
  });
});
