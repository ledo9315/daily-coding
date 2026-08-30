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
  sendAccountDeletionEmail,
  sendSolutionActivityEmail,
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
    expect(new Set(hrefs)).toEqual(new Set(["https://app.example.com/challenge"]));
  });

  it("escapes the name in the deletion mail too", async () => {
    mockSend.mockResolvedValue({ data: { id: "e7" }, error: null });
    await sendAccountDeletionEmail("user@test.com", "<b>Max</b>");
    const sent = mockSend.mock.calls[0][0] as { html: string; subject: string };
    expect(sent.html).not.toContain("<b>Max</b>");
    expect(sent.subject).toContain("gelöscht");
  });
});

describe("sendSolutionActivityEmail", () => {
  it("links to the solution the activity happened at", async () => {
    mockSend.mockResolvedValueOnce({ data: { id: "e5" }, error: null });
    await sendSolutionActivityEmail("author@test.com", {
      actorName: "Watson",
      kind: "clever",
      challengeTitle: "Two Sum",
      path: "/challenge/chal-1/loesungen?loesung=abc",
    });
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "author@test.com",
        html: expect.stringContaining(
          "https://app.example.com/challenge/chal-1/loesungen?loesung=abc"
        ),
      })
    );
    expect(mockSend.mock.calls[0][0].text).toContain("Watson");
  });
});
