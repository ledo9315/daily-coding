import { describe, it, expect, vi, beforeEach } from "vitest";

const mockValidatePasswordResetToken = vi.fn();
const mockMarkPasswordResetTokenUsed = vi.fn();
const mockUpdate = vi.fn();

vi.mock("@/lib/server/auth-service", () => ({
  validatePasswordResetToken: (...a: unknown[]) => mockValidatePasswordResetToken(...a),
  markPasswordResetTokenUsed: (...a: unknown[]) => mockMarkPasswordResetTokenUsed(...a),
}));
vi.mock("@/lib/prisma", () => ({
  prisma: { user: { update: (...a: unknown[]) => mockUpdate(...a) } },
}));
vi.mock("bcryptjs", () => ({
  default: { hash: vi.fn().mockResolvedValue("newhash") },
}));

import { POST } from "@/app/api/auth/reset-password/route";
import { NextRequest } from "next/server";

function makeRequest(body: object) {
  return new NextRequest("http://localhost/api/auth/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => vi.clearAllMocks());

describe("POST /api/auth/reset-password", () => {
  it("returns 400 for missing fields", async () => {
    const res = await POST(makeRequest({ token: "t" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for password shorter than 8 chars", async () => {
    const res = await POST(makeRequest({ token: "t", password: "short" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when token is invalid", async () => {
    mockValidatePasswordResetToken.mockResolvedValueOnce({ error: "Token ungültig." });
    const res = await POST(makeRequest({ token: "bad", password: "newpassword1" }));
    expect(res.status).toBe(400);
  });

  it("updates password hash and marks token used on success", async () => {
    mockValidatePasswordResetToken.mockResolvedValueOnce({ userId: "u1" });
    mockMarkPasswordResetTokenUsed.mockResolvedValueOnce(undefined);
    mockUpdate.mockResolvedValueOnce({});

    const res = await POST(makeRequest({ token: "good", password: "newpassword1" }));
    expect(res.status).toBe(200);
    expect(mockMarkPasswordResetTokenUsed).toHaveBeenCalledWith("good");
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: "u1" },
      data: { passwordHash: "newhash" },
    });
  });
});
