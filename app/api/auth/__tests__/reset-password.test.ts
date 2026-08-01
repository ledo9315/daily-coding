import { describe, it, expect, vi, beforeEach } from "vitest";

const mockConsumePasswordResetToken = vi.fn();
const mockCheckRateLimit = vi.fn();

vi.mock("@/lib/server/auth-service", () => ({
  consumePasswordResetToken: (...a: unknown[]) => mockConsumePasswordResetToken(...a),
}));
vi.mock("bcryptjs", () => ({
  default: { hash: vi.fn().mockResolvedValue("newhash") },
}));
vi.mock("@/lib/server/rate-limiter", () => ({
  checkRateLimit: (...a: unknown[]) => mockCheckRateLimit(...a),
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

beforeEach(() => {
  vi.clearAllMocks();
  mockCheckRateLimit.mockResolvedValue(true);
});

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
    mockConsumePasswordResetToken.mockResolvedValueOnce({ error: "Token ungültig." });
    const res = await POST(makeRequest({ token: "bad", password: "newpassword1" }));
    expect(res.status).toBe(400);
  });

  it("rate-limits expensive password hashing by client", async () => {
    mockCheckRateLimit.mockResolvedValueOnce(false);

    const res = await POST(
      makeRequest({ token: "bad", password: "newpassword1" })
    );

    expect(res.status).toBe(429);
    expect(mockConsumePasswordResetToken).not.toHaveBeenCalled();
  });

  it("atomically consumes the token with the new password hash", async () => {
    mockConsumePasswordResetToken.mockResolvedValueOnce({ success: true });

    const res = await POST(makeRequest({ token: "good", password: "newpassword1" }));
    expect(res.status).toBe(200);
    expect(mockConsumePasswordResetToken).toHaveBeenCalledWith("good", "newhash");
  });
});
