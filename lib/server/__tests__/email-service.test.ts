import { describe, it, expect, vi, beforeEach } from "vitest";

// Set env BEFORE any imports
process.env.RESEND_API_KEY = "re_test";
process.env.APP_URL = "https://app.example.com";
process.env.EMAIL_FROM = "noreply@example.com";

const mockSend = vi.fn();

vi.mock("resend", () => ({
  Resend: class {
    emails = {
      send: (...a: unknown[]) => mockSend(...a),
    };
  },
}));

import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
} from "@/lib/server/email-service";

beforeEach(() => vi.clearAllMocks());

describe("sendVerificationEmail", () => {
  it("calls resend.emails.send with correct to, subject, and verification link", async () => {
    mockSend.mockResolvedValueOnce({ data: { id: "e1" }, error: null });
    await sendVerificationEmail("user@test.com", "abc123");
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "user@test.com",
        subject: expect.stringContaining("bestätigen"),
        html: expect.stringContaining("https://app.example.com/auth/verify-email?token=abc123"),
      })
    );
  });
});

describe("sendPasswordResetEmail", () => {
  it("calls resend.emails.send with correct to, subject, and reset link", async () => {
    mockSend.mockResolvedValueOnce({ data: { id: "e2" }, error: null });
    await sendPasswordResetEmail("user@test.com", "xyz789");
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "user@test.com",
        subject: expect.stringContaining("Passwort"),
        html: expect.stringContaining("https://app.example.com/auth/reset-password?token=xyz789"),
      })
    );
  });
});

describe("sendWelcomeEmail", () => {
  it("calls resend.emails.send with correct to and name in body", async () => {
    mockSend.mockResolvedValueOnce({ data: { id: "e3" }, error: null });
    await sendWelcomeEmail("user@test.com", "Max");
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "user@test.com",
        html: expect.stringContaining("Max"),
      })
    );
  });
});
