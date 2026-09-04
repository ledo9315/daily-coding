import { describe, it, expect, vi, beforeEach } from "vitest";

/** Route handlers translate themselves; `next-intl/server` throws outside react-server. */
vi.mock("next-intl/server", async () =>
  (await import("@/app/api/__tests__/api-translations-mock")).apiTranslationsMock()
);

import { NextResponse } from "next/server";
import { DELETE } from "../user/account/route";

vi.mock("@/lib/auth-session", () => ({
  getSessionUserId: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: vi.fn().mockResolvedValue([]),
    user: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      delete: vi.fn(),
    },
    rankingEntry: { deleteMany: vi.fn() },
    userAchievement: { deleteMany: vi.fn() },
    submission: { deleteMany: vi.fn() },
    emailVerificationToken: { deleteMany: vi.fn() },
    passwordResetToken: { deleteMany: vi.fn() },
    account: { findFirst: vi.fn(), deleteMany: vi.fn() },
  },
}));

vi.mock("bcryptjs", () => ({
  default: {
    compare: vi.fn(),
  },
}));

const mockSendAccountDeletionEmail = vi.fn();

vi.mock("@/lib/server/email-service", () => ({
  sendAccountDeletionEmail: (...a: unknown[]) => mockSendAccountDeletionEmail(...a),
}));

import bcrypt from "bcryptjs";
import { getSessionUserId } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";

const mockGetSession = vi.mocked(getSessionUserId);
const mockFindUnique = vi.mocked(prisma.user.findUnique);
const mockAccountFindFirst = vi.mocked(prisma.account.findFirst);
const mockDeleteUser = vi.mocked(prisma.user.delete);
const mockCompare = vi.mocked(bcrypt.compare);

function makeRequest(body: object) {
  return new Request("http://localhost/api/user/account", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("DELETE /api/user/account", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSession.mockResolvedValue({ userId: "u-1" });
    mockFindUnique.mockResolvedValue({
      id: "u-1",
      passwordHash: "old-hash",
      email: "u1@example.com",
      name: "User One",
    } as never);
    mockAccountFindFirst.mockResolvedValue(null);
    mockCompare.mockResolvedValue(true as never);
    mockDeleteUser.mockResolvedValue({} as never);
    mockSendAccountDeletionEmail.mockResolvedValue(undefined);
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetSession.mockResolvedValueOnce({
      error: NextResponse.json({ error: "Nicht authentifiziert." }, { status: 401 }),
    });
    const res = await DELETE(
      makeRequest({ confirmText: "KONTO LÖSCHEN", currentPassword: "x" })
    );
    expect(res.status).toBe(401);
  });

  it("returns 400 when confirmation text is invalid", async () => {
    const res = await DELETE(makeRequest({ confirmText: "falsch", currentPassword: "x" }));
    expect(res.status).toBe(400);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("names the phrase of the caller's language in the rejection", async () => {
    const res = await DELETE(makeRequest({ confirmText: "falsch", currentPassword: "x" }));
    const json = await res.json();
    expect(json.error).toBe("Bitte bestätige mit KONTO LÖSCHEN.");
  });

  /** Someone who switches the language with the phrase already typed must not be stuck. */
  it("accepts the confirmation phrase of the other language", async () => {
    const res = await DELETE(
      makeRequest({ confirmText: "DELETE ACCOUNT", currentPassword: "oldpassword" })
    );

    expect(res.status).toBe(200);
    expect(mockDeleteUser).toHaveBeenCalledWith({ where: { id: "u-1" } });
  });

  it("ignores whitespace around the confirmation phrase", async () => {
    const res = await DELETE(
      makeRequest({ confirmText: "  KONTO LÖSCHEN  ", currentPassword: "oldpassword" })
    );

    expect(res.status).toBe(200);
  });

  it("keeps the comparison case-sensitive", async () => {
    const res = await DELETE(
      makeRequest({ confirmText: "konto löschen", currentPassword: "oldpassword" })
    );

    expect(res.status).toBe(400);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("returns 400 when current password is wrong", async () => {
    mockCompare.mockResolvedValueOnce(false as never);

    const res = await DELETE(
      makeRequest({ confirmText: "KONTO LÖSCHEN", currentPassword: "wrong" })
    );
    expect(res.status).toBe(400);
  });

  it("deletes account and dependent records when data is valid", async () => {
    const res = await DELETE(
      makeRequest({ confirmText: "KONTO LÖSCHEN", currentPassword: "oldpassword" })
    );

    expect(res.status).toBe(200);
    expect(prisma.rankingEntry.deleteMany).toHaveBeenCalledWith({ where: { userId: "u-1" } });
    expect(prisma.userAchievement.deleteMany).toHaveBeenCalledWith({ where: { userId: "u-1" } });
    expect(prisma.submission.deleteMany).toHaveBeenCalledWith({ where: { userId: "u-1" } });
    expect(prisma.emailVerificationToken.deleteMany).toHaveBeenCalledWith({ where: { userId: "u-1" } });
    expect(prisma.passwordResetToken.deleteMany).toHaveBeenCalledWith({ where: { userId: "u-1" } });
    expect(prisma.account.deleteMany).toHaveBeenCalledWith({ where: { userId: "u-1" } });
    expect(mockDeleteUser).toHaveBeenCalledWith({ where: { id: "u-1" } });
    expect(mockSendAccountDeletionEmail).toHaveBeenCalledWith("u1@example.com", "User One");
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });

  it("still requires the password when an account also has OAuth linked", async () => {
    const res = await DELETE(makeRequest({ confirmText: "KONTO LÖSCHEN" }));

    expect(res.status).toBe(400);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("allows deleting oauth-only user without password", async () => {
    mockFindUnique.mockResolvedValueOnce({
      id: "u-1",
      passwordHash: null,
      email: "u1@example.com",
      name: "User One",
    } as never);
    const res = await DELETE(makeRequest({ confirmText: "KONTO LÖSCHEN" }));

    expect(res.status).toBe(200);
    expect(mockCompare).not.toHaveBeenCalled();
    expect(mockDeleteUser).toHaveBeenCalled();
  });

  it("still deletes account when deletion email sending fails", async () => {
    mockSendAccountDeletionEmail.mockRejectedValueOnce(new Error("mail-failed"));

    const res = await DELETE(
      makeRequest({ confirmText: "KONTO LÖSCHEN", currentPassword: "oldpassword" })
    );

    expect(res.status).toBe(200);
    expect(mockDeleteUser).toHaveBeenCalledWith({ where: { id: "u-1" } });
  });
});
