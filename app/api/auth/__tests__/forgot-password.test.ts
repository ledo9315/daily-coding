import { describe, it, expect, vi, beforeEach } from "vitest";

/** Route handlers translate themselves; `next-intl/server` throws outside react-server. */
vi.mock("next-intl/server", async () =>
  (await import("@/app/api/__tests__/api-translations-mock")).apiTranslationsMock()
);

const mockFindUnique = vi.fn();
const mockCreatePasswordResetToken = vi.fn();
const mockSendPasswordResetEmail = vi.fn();
const mockCheckRateLimit = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: { user: { findUnique: (...a: unknown[]) => mockFindUnique(...a) } },
}));
vi.mock("@/lib/server/auth-service", () => ({
  createPasswordResetToken: (...a: unknown[]) => mockCreatePasswordResetToken(...a),
}));
vi.mock("@/lib/server/email-service", () => ({
  sendPasswordResetEmail: (...a: unknown[]) => mockSendPasswordResetEmail(...a),
}));
vi.mock("@/lib/server/rate-limiter", () => ({
  checkRateLimit: (...a: unknown[]) => mockCheckRateLimit(...a),
}));

import { POST } from "@/app/api/auth/forgot-password/route";
import { NextRequest } from "next/server";

function makeRequest(body: object) {
  return new NextRequest("http://localhost/api/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockCheckRateLimit.mockResolvedValue(true);
});

describe("POST /api/auth/forgot-password", () => {
  it("returns 400 for missing email", async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
  });

  it("returns 429 when rate limit exceeded", async () => {
    mockCheckRateLimit.mockResolvedValueOnce(false);
    const res = await POST(makeRequest({ email: "a@b.de" }));
    expect(res.status).toBe(429);
  });

  it("returns 200 even when user is not found (no enumeration)", async () => {
    mockFindUnique.mockResolvedValueOnce(null);
    const res = await POST(makeRequest({ email: "nobody@b.de" }));
    expect(res.status).toBe(200);
    expect(mockCreatePasswordResetToken).not.toHaveBeenCalled();
  });

  it("sends reset email when user exists", async () => {
    mockFindUnique.mockResolvedValueOnce({ id: "u1", email: "a@b.de" });
    mockCreatePasswordResetToken.mockResolvedValueOnce("resettoken");
    mockSendPasswordResetEmail.mockResolvedValueOnce(undefined);

    const res = await POST(makeRequest({ email: "a@b.de" }));
    expect(res.status).toBe(200);
    expect(mockSendPasswordResetEmail).toHaveBeenCalledWith("a@b.de", "resettoken");
  });
});
