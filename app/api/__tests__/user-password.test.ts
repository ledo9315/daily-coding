import { describe, it, expect, vi, beforeEach } from "vitest";

/** Route handlers translate themselves; `next-intl/server` throws outside react-server. */
vi.mock("next-intl/server", async () =>
  (await import("@/app/api/__tests__/api-translations-mock")).apiTranslationsMock()
);

import { NextResponse } from "next/server";
import { PATCH } from "../user/password/route";

vi.mock("@/lib/auth-session", () => ({
  getSessionUserId: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("bcryptjs", () => ({
  default: {
    compare: vi.fn(),
    hash: vi.fn().mockResolvedValue("new-hash"),
  },
}));

import bcrypt from "bcryptjs";
import { getSessionUserId } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";

const mockGetSession = vi.mocked(getSessionUserId);
const mockFindUnique = vi.mocked(prisma.user.findUnique);
const mockUpdate = vi.mocked(prisma.user.update);
const mockCompare = vi.mocked(bcrypt.compare);

function makeRequest(body: object) {
  return new Request("http://localhost/api/user/password", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("PATCH /api/user/password", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSession.mockResolvedValue({ userId: "u-1" });
    mockFindUnique.mockResolvedValue({ id: "u-1", passwordHash: "old-hash" } as never);
    mockCompare.mockResolvedValue(true as never);
    mockUpdate.mockResolvedValue({} as never);
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetSession.mockResolvedValueOnce({
      error: NextResponse.json({ error: "Nicht authentifiziert." }, { status: 401 }),
    });

    const res = await PATCH(makeRequest({ currentPassword: "x", newPassword: "newpassword1" }));
    expect(res.status).toBe(401);
  });

  it("returns 400 when new password is too short", async () => {
    const res = await PATCH(makeRequest({ currentPassword: "x", newPassword: "short" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when current password is wrong", async () => {
    mockCompare.mockResolvedValueOnce(false as never);

    const res = await PATCH(
      makeRequest({ currentPassword: "wrong", newPassword: "newpassword1" })
    );
    expect(res.status).toBe(400);
  });

  it("updates password when current password is valid", async () => {
    const res = await PATCH(
      makeRequest({ currentPassword: "oldpassword", newPassword: "newpassword1" })
    );

    expect(res.status).toBe(200);
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: "u-1" },
      data: { passwordHash: "new-hash" },
    });
  });

  it("allows setting first password for oauth user without current password", async () => {
    mockFindUnique.mockResolvedValueOnce({ id: "u-1", passwordHash: null } as never);

    const res = await PATCH(makeRequest({ newPassword: "newpassword1" }));

    expect(res.status).toBe(200);
    expect(mockCompare).not.toHaveBeenCalled();
    expect(mockUpdate).toHaveBeenCalled();
  });
});
