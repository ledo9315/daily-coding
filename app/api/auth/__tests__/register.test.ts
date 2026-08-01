import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFindUnique = vi.fn();
const mockCreate = vi.fn();
const mockSendVerificationEmail = vi.fn();
const mockCreateEmailVerificationToken = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: (...a: unknown[]) => mockFindUnique(...a),
      create: (...a: unknown[]) => mockCreate(...a),
    },
  },
}));

vi.mock("bcryptjs", () => ({
  default: { hash: vi.fn().mockResolvedValue("hashed") },
}));

vi.mock("@/lib/server/auth-service", () => ({
  createEmailVerificationToken: (...a: unknown[]) =>
    mockCreateEmailVerificationToken(...a),
}));

vi.mock("@/lib/server/email-service", () => ({
  sendVerificationEmail: (...a: unknown[]) => mockSendVerificationEmail(...a),
}));

import { POST } from "@/app/api/auth/register/route";
import { NextRequest } from "next/server";

function makeRequest(body: object) {
  return new NextRequest("http://localhost/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => vi.clearAllMocks());

describe("POST /api/auth/register", () => {
  it("returns 400 when fields are missing", async () => {
    const res = await POST(makeRequest({ email: "a@b.de" }));
    expect(res.status).toBe(400);
  });

  it("returns 409 when email already exists", async () => {
    mockFindUnique.mockResolvedValueOnce({ id: "existing" });
    const res = await POST(makeRequest({ email: "a@b.de", password: "secret1234", name: "Anna" }));
    expect(res.status).toBe(409);
  });

  it.each([".", "---", "🎮", "A"])(
    "returns 400 without querying the database for invalid name %s",
    async (name) => {
      const res = await POST(makeRequest({ email: "a@b.de", password: "secret1234", name }));

      expect(res.status).toBe(400);
      expect(await res.json()).toEqual({
        error: "Name muss mindestens zwei Buchstaben oder Zahlen enthalten.",
      });
      expect(mockFindUnique).not.toHaveBeenCalled();
      expect(mockCreate).not.toHaveBeenCalled();
    }
  );

  it("creates user and sends verification email on success", async () => {
    mockFindUnique.mockResolvedValueOnce(null);
    mockCreate.mockResolvedValueOnce({ id: "new-user" });
    mockCreateEmailVerificationToken.mockResolvedValueOnce("tok123");
    mockSendVerificationEmail.mockResolvedValueOnce(undefined);

    const res = await POST(
      makeRequest({ email: "new@b.de", password: "secret1234", name: "New User" })
    );
    expect(res.status).toBe(201);
    expect(mockCreateEmailVerificationToken).toHaveBeenCalledWith("new-user");
    expect(mockSendVerificationEmail).toHaveBeenCalledWith("new@b.de", "tok123");

    const body = (await res.json()) as { success: boolean; verificationEmailSent: boolean };
    expect(body).toEqual({ success: true, verificationEmailSent: true });
  });

  it("returns success but marks verification email as failed when sending throws", async () => {
    mockFindUnique.mockResolvedValueOnce(null);
    mockCreate.mockResolvedValueOnce({ id: "new-user" });
    mockCreateEmailVerificationToken.mockResolvedValueOnce("tok123");
    mockSendVerificationEmail.mockRejectedValueOnce(new Error("resend failure"));

    const res = await POST(
      makeRequest({ email: "new@b.de", password: "secret1234", name: "New User" })
    );

    expect(res.status).toBe(201);
    const body = (await res.json()) as { success: boolean; verificationEmailSent: boolean };
    expect(body).toEqual({ success: true, verificationEmailSent: false });
  });
});
