import { describe, it, expect, vi, beforeEach } from "vitest";

// Set env BEFORE any imports
process.env.RESEND_API_KEY = "re_test";
process.env.APP_URL = "https://app.example.com";
process.env.EMAIL_FROM = "noreply@example.com";

const mockSend = vi.fn();
const mockFindUnique = vi.fn();

vi.mock("resend", () => ({
  Resend: class {
    emails = {
      send: (...a: unknown[]) => mockSend(...a),
    };
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: { user: { findUnique: (...a: unknown[]) => mockFindUnique(...a) } },
}));

/**
 * The real one reads `cookies()`, which throws outside a request. The double keeps the one
 * rule that matters here: the account row wins, and without it the mail is German.
 */
vi.mock("@/lib/server/request-locale", () => ({
  localeFromRequestScope: async (user?: string | null) => (user === "en" ? "en" : "de"),
}));

import de from "@/messages/de/email.json";
import en from "@/messages/en/email.json";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendAccountDeletionEmail,
  sendSolutionActivityEmail,
} from "@/lib/server/email-service";

beforeEach(() => {
  vi.clearAllMocks();
  mockFindUnique.mockResolvedValue({ locale: "de" });
});

describe("sendVerificationEmail", () => {
  it("calls resend.emails.send with correct to, subject, and verification link", async () => {
    mockSend.mockResolvedValueOnce({ data: { id: "e1" }, error: null });
    await sendVerificationEmail("user@test.com", "abc123");
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "user@test.com",
        subject: de.verification.subject,
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
        subject: de.passwordReset.subject,
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

/** #105: design, a plain-text part, and an escaped name. */
describe("every mail", () => {
  it("sends a plain-text part alongside the HTML", async () => {
    mockSend.mockResolvedValue({ data: { id: "e4" }, error: null });
    await sendVerificationEmail("user@test.com", "tok");
    const sent = mockSend.mock.calls[0][0] as { text: string; html: string };
    // HTML-only mail is filtered as spam far more often.
    expect(sent.text).toContain("https://app.example.com/auth/verify-email?token=tok");
    expect(sent.text).not.toContain("<");
  });

  it("uses the project palette in the HTML part", async () => {
    mockSend.mockResolvedValue({ data: { id: "e5" }, error: null });
    await sendPasswordResetEmail("user@test.com", "tok");
    const sent = mockSend.mock.calls[0][0] as { html: string };
    expect(sent.html).toContain("#0d1117");
    expect(sent.html).toContain("#c4fe4d");
  });

  it("escapes a name that contains markup instead of sending it as a link", async () => {
    mockSend.mockResolvedValue({ data: { id: "e6" }, error: null });
    await sendWelcomeEmail("user@test.com", '<a href="http://phish.example">Konto</a>');
    const sent = mockSend.mock.calls[0][0] as { html: string };
    /**
     * The mail carries two anchors, the button and the fallback address below it, and
     * both must point at the action URL. A name from the registration form may not add
     * a third: that is the phishing link no client filters, because it strips scripts,
     * not anchors.
     */
    expect(sent.html).not.toContain('href="http://phish.example"');
    expect(sent.html).toContain("&lt;a href=");
    const hrefs = [...sent.html.matchAll(/href="([^"]*)"/g)].map((m) => m[1]);
    expect(new Set(hrefs)).toEqual(new Set(["https://app.example.com/de/challenge"]));
  });

  it("escapes the name in the deletion mail too", async () => {
    mockSend.mockResolvedValue({ data: { id: "e7" }, error: null });
    await sendAccountDeletionEmail("user@test.com", "<b>Max</b>");
    const sent = mockSend.mock.calls[0][0] as { html: string; subject: string };
    expect(sent.html).not.toContain("<b>Max</b>");
    expect(sent.subject).toBe(de.accountDeletion.subject);
  });
});

describe("sendSolutionActivityEmail", () => {
  it("links to the solution the activity happened at", async () => {
    mockSend.mockResolvedValueOnce({ data: { id: "e5" }, error: null });
    await sendSolutionActivityEmail("author@test.com", {
      actorName: "Watson",
      kind: "clever",
      challengeTitle: "Two Sum",
      path: "/challenge/chal-1/solutions?solution=abc",
    });
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "author@test.com",
        html: expect.stringContaining(
          "https://app.example.com/challenge/chal-1/solutions?solution=abc"
        ),
      })
    );
    expect(mockSend.mock.calls[0][0].text).toContain("Watson");
  });

  it("names actor, kind and challenge in the recipient's language", async () => {
    mockFindUnique.mockResolvedValue({ locale: "en" });
    mockSend.mockResolvedValueOnce({ data: { id: "e8" }, error: null });
    await sendSolutionActivityEmail("author@test.com", {
      actorName: "Watson",
      kind: "best_practices",
      challengeTitle: "Two Sum",
      path: "/challenge/chal-1/solutions?solution=abc",
    });
    const sent = mockSend.mock.calls[0][0] as { text: string };
    expect(sent.text).toContain('Watson thinks your solution to "Two Sum" is exemplary.');
  });
});

/**
 * The mail leaves without a request of its own, so nothing but the account row says which
 * language it should be written in.
 */
describe("recipient locale", () => {
  it("writes the mail in the language of the recipient's account", async () => {
    mockFindUnique.mockResolvedValue({ locale: "en" });
    mockSend.mockResolvedValueOnce({ data: { id: "e9" }, error: null });
    await sendVerificationEmail("user@test.com", "tok");
    const sent = mockSend.mock.calls[0][0] as { subject: string; html: string; text: string };
    expect(sent.subject).toBe(en.verification.subject);
    expect(sent.html).toContain('lang="en"');
    expect(sent.text).toContain(en.verification.line);
    expect(sent.text).not.toContain(de.verification.line);
  });

  it("looks the account up by the address it is sending to", async () => {
    mockSend.mockResolvedValueOnce({ data: { id: "e10" }, error: null });
    await sendVerificationEmail("user@test.com", "tok");
    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { email: "user@test.com" },
      select: { locale: true },
    });
  });

  /** The deletion mail is sent after the row is gone, and it may not throw there. */
  it("falls back to German when there is no account row left", async () => {
    mockFindUnique.mockResolvedValue(null);
    mockSend.mockResolvedValueOnce({ data: { id: "e11" }, error: null });
    await sendAccountDeletionEmail("user@test.com", "Max");
    const sent = mockSend.mock.calls[0][0] as { subject: string };
    expect(sent.subject).toBe(de.accountDeletion.subject);
  });
});
