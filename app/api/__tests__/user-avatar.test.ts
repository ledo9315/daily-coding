import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextResponse } from "next/server";
import { PATCH as patchAvatar } from "../user/avatar/route";
import { USER_AVATAR_PATHS } from "@/lib/user-avatars";

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

import { getSessionUserId } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";

/**
 * Taken from the list rather than written out: the literal used here was
 * "/user/minipix4.png", and replacing the avatar set left the test asserting on a path
 * the API rightly rejects (#99).
 */
const allowed = USER_AVATAR_PATHS[0];

const mockGetSession = vi.mocked(getSessionUserId);
const mockFindUnique = vi.mocked(prisma.user.findUnique);
const mockUpdate = vi.mocked(prisma.user.update);

describe("PATCH /api/user/avatar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSession.mockResolvedValue({ userId: "u-1", userEmail: null });
    mockFindUnique.mockResolvedValue({ id: "u-1" } as never);
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetSession.mockResolvedValueOnce({
      error: NextResponse.json({ error: "Nicht authentifiziert." }, { status: 401 }),
    });
    const res = await patchAvatar(
      new Request("http://localhost/api/user/avatar", {
        method: "PATCH",
        body: JSON.stringify({ avatar: allowed }),
      })
    );
    expect(res.status).toBe(401);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("returns 400 for unknown avatar path", async () => {
    const res = await patchAvatar(
      new Request("http://localhost/api/user/avatar", {
        method: "PATCH",
        body: JSON.stringify({ avatar: "/user/hacker.png" }),
      })
    );
    expect(res.status).toBe(400);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("updates user when path is allowed", async () => {
    mockUpdate.mockResolvedValueOnce({} as never);
    const res = await patchAvatar(
      new Request("http://localhost/api/user/avatar", {
        method: "PATCH",
        body: JSON.stringify({ avatar: allowed }),
      })
    );
    expect(res.status).toBe(200);
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: "u-1" },
      data: { avatar: allowed },
    });
    const json = await res.json();
    expect(json).toEqual({ avatar: allowed });
  });
});
