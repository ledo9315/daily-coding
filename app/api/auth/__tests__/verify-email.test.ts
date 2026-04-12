import { describe, it, expect, vi, beforeEach } from "vitest";

const mockVerifyEmailToken = vi.fn();

vi.mock("@/lib/server/auth-service", () => ({
  verifyEmailToken: (...a: unknown[]) => mockVerifyEmailToken(...a),
}));

import { GET } from "@/app/api/auth/verify-email/route";
import { NextRequest } from "next/server";

beforeEach(() => vi.clearAllMocks());

describe("GET /api/auth/verify-email", () => {
  it("returns 400 when token is missing", async () => {
    const req = new NextRequest("http://localhost/api/auth/verify-email");
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 when token is invalid", async () => {
    mockVerifyEmailToken.mockResolvedValueOnce({ error: "Token ungültig." });
    const req = new NextRequest("http://localhost/api/auth/verify-email?token=bad");
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it("returns 200 when token is valid", async () => {
    mockVerifyEmailToken.mockResolvedValueOnce({ success: true });
    const req = new NextRequest("http://localhost/api/auth/verify-email?token=good");
    const res = await GET(req);
    expect(res.status).toBe(200);
  });
});
