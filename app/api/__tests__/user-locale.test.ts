import { describe, it, expect, vi, beforeEach } from "vitest";

/** Route handlers translate themselves; `next-intl/server` throws outside react-server. */
vi.mock("next-intl/server", async () =>
  (await import("@/app/api/__tests__/api-translations-mock")).apiTranslationsMock()
);

import { NextResponse } from "next/server";

const mockUserUpdate = vi.fn();
const mockGetSessionUserId = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      update: (...a: unknown[]) => mockUserUpdate(...a),
    },
  },
}));

vi.mock("@/lib/auth-session", () => ({
  getSessionUserId: () => mockGetSessionUserId(),
}));

import { PATCH as patchLocale } from "../user/locale/route";

function patchRequest(body: unknown): Request {
  return new Request("http://localhost/api/user/locale", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockGetSessionUserId.mockResolvedValue({ userId: "user-me" });
  mockUserUpdate.mockResolvedValue({});
});

describe("PATCH /api/user/locale", () => {
  it("stores the new locale and echoes it back", async () => {
    const response = await patchLocale(patchRequest({ locale: "en" }));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ locale: "en" });
    expect(mockUserUpdate).toHaveBeenCalledWith({
      where: { id: "user-me" },
      data: { locale: "en" },
    });
  });

  it("sets the NEXT_LOCALE cookie, without which server components keep the old language", async () => {
    const response = await patchLocale(patchRequest({ locale: "en" }));

    expect(response.cookies.get("NEXT_LOCALE")).toMatchObject({
      value: "en",
      path: "/",
      sameSite: "lax",
      httpOnly: false,
    });
  });

  it("refuses a locale the app does not have", async () => {
    const response = await patchLocale(patchRequest({ locale: "fr" }));

    expect(response.status).toBe(400);
    expect(mockUserUpdate).not.toHaveBeenCalled();
  });

  it("refuses a body without a locale", async () => {
    const response = await patchLocale(patchRequest({}));

    expect(response.status).toBe(400);
    expect(mockUserUpdate).not.toHaveBeenCalled();
  });

  it("rejects an anonymous caller", async () => {
    mockGetSessionUserId.mockResolvedValue({
      error: NextResponse.json({ error: "Nicht authentifiziert." }, { status: 401 }),
    });

    const response = await patchLocale(patchRequest({ locale: "en" }));

    expect(response.status).toBe(401);
    expect(mockUserUpdate).not.toHaveBeenCalled();
  });
});
