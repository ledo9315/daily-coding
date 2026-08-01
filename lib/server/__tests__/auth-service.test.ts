import { describe, it, expect, vi, beforeEach } from "vitest";

const mockCreate = vi.fn();
const mockDeleteMany = vi.fn();
const mockFindUnique = vi.fn();
const mockDelete = vi.fn();
const mockUpdate = vi.fn();
const mockUpdateMany = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    emailVerificationToken: {
      create: (...a: unknown[]) => mockCreate(...a),
      deleteMany: (...a: unknown[]) => mockDeleteMany(...a),
      findUnique: (...a: unknown[]) => mockFindUnique(...a),
      delete: (...a: unknown[]) => mockDelete(...a),
    },
    passwordResetToken: {
      create: (...a: unknown[]) => mockCreate(...a),
      deleteMany: (...a: unknown[]) => mockDeleteMany(...a),
      findUnique: (...a: unknown[]) => mockFindUnique(...a),
      update: (...a: unknown[]) => mockUpdate(...a),
      updateMany: (...a: unknown[]) => mockUpdateMany(...a),
    },
    user: {
      update: (...a: unknown[]) => mockUpdate(...a),
    },
    $transaction: (callback: (tx: unknown) => unknown) =>
      callback({
        passwordResetToken: {
          findUnique: (...a: unknown[]) => mockFindUnique(...a),
          updateMany: (...a: unknown[]) => mockUpdateMany(...a),
        },
        user: { update: (...a: unknown[]) => mockUpdate(...a) },
      }),
  },
}));

import {
  createEmailVerificationToken,
  verifyEmailToken,
  createPasswordResetToken,
  consumePasswordResetToken,
} from "@/lib/server/auth-service";

beforeEach(() => vi.clearAllMocks());

describe("createEmailVerificationToken", () => {
  it("deletes old tokens, creates new one, returns hex string", async () => {
    mockDeleteMany.mockResolvedValueOnce({ count: 0 });
    mockCreate.mockResolvedValueOnce({});
    const token = await createEmailVerificationToken("user-1");
    expect(typeof token).toBe("string");
    expect(token).toHaveLength(64); // 32 bytes = 64 hex chars
    expect(mockDeleteMany).toHaveBeenCalledWith({ where: { userId: "user-1" } });
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: "user-1", token }),
      })
    );
  });
});

describe("verifyEmailToken", () => {
  it("returns error when token not found", async () => {
    mockFindUnique.mockResolvedValueOnce(null);
    const result = await verifyEmailToken("bad-token");
    expect(result).toEqual({ error: "Token ungültig." });
  });

  it("returns error and deletes when token is expired", async () => {
    mockFindUnique.mockResolvedValueOnce({
      token: "t",
      userId: "u1",
      expiresAt: new Date(Date.now() - 1000),
    });
    mockDelete.mockResolvedValueOnce({});
    const result = await verifyEmailToken("t");
    expect(result).toEqual({ error: "Token abgelaufen." });
    expect(mockDelete).toHaveBeenCalledWith({ where: { token: "t" } });
  });

  it("sets emailVerified and deletes token on success", async () => {
    mockFindUnique.mockResolvedValueOnce({
      token: "t",
      userId: "u1",
      expiresAt: new Date(Date.now() + 60_000),
    });
    mockUpdate.mockResolvedValueOnce({});
    mockDelete.mockResolvedValueOnce({});
    const result = await verifyEmailToken("t");
    expect(result).toEqual({ success: true, userId: "u1" });
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: "u1" },
      data: { emailVerified: true },
    });
    expect(mockDelete).toHaveBeenCalledWith({ where: { token: "t" } });
  });
});

describe("createPasswordResetToken", () => {
  it("deletes old tokens, creates new one, returns hex string", async () => {
    mockDeleteMany.mockResolvedValueOnce({ count: 0 });
    mockCreate.mockResolvedValueOnce({});
    const token = await createPasswordResetToken("user-2");
    expect(typeof token).toBe("string");
    expect(token).toHaveLength(64);
    expect(mockDeleteMany).toHaveBeenCalledWith({ where: { userId: "user-2" } });
  });
});

describe("consumePasswordResetToken", () => {
  it("returns error when token not found", async () => {
    mockFindUnique.mockResolvedValueOnce(null);
    expect(await consumePasswordResetToken("x", "hash")).toEqual({ error: "Token ungültig." });
  });

  it("returns error when token already used", async () => {
    mockFindUnique.mockResolvedValueOnce({
      token: "t",
      userId: "u1",
      used: true,
      expiresAt: new Date(Date.now() + 60_000),
    });
    expect(await consumePasswordResetToken("t", "hash")).toEqual({
      error: "Token wurde bereits verwendet.",
    });
  });

  it("returns error when token expired", async () => {
    mockFindUnique.mockResolvedValueOnce({
      token: "t",
      userId: "u1",
      used: false,
      expiresAt: new Date(Date.now() - 1000),
    });
    expect(await consumePasswordResetToken("t", "hash")).toEqual({ error: "Token abgelaufen." });
  });

  it("claims the token conditionally and updates the password in one transaction", async () => {
    mockFindUnique.mockResolvedValueOnce({
      token: "t",
      userId: "u1",
      used: false,
      expiresAt: new Date(Date.now() + 60_000),
    });
    mockUpdateMany.mockResolvedValueOnce({ count: 1 });
    mockUpdate.mockResolvedValueOnce({});

    expect(await consumePasswordResetToken("t", "new-hash")).toEqual({ success: true });
    expect(mockUpdateMany).toHaveBeenCalledWith({
      where: { token: "t", used: false, expiresAt: { gte: expect.any(Date) } },
      data: { used: true },
    });
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: "u1" },
      data: { passwordHash: "new-hash" },
    });
  });

  it("rejects a concurrent second consumer", async () => {
    mockFindUnique.mockResolvedValueOnce({
      token: "t",
      userId: "u1",
      used: false,
      expiresAt: new Date(Date.now() + 60_000),
    });
    mockUpdateMany.mockResolvedValueOnce({ count: 0 });

    expect(await consumePasswordResetToken("t", "hash")).toEqual({
      error: "Token wurde bereits verwendet.",
    });
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});
