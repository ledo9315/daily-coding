import { describe, it, expect, vi, beforeEach } from "vitest";

process.env.RESEND_API_KEY = "re_test";
process.env.APP_URL = "https://app.example.com";
process.env.EMAIL_FROM = "noreply@example.com";

const mockSend = vi.fn();
const mockFindUnique = vi.fn();

vi.mock("resend", () => ({
  Resend: class {
    emails = { send: (...a: unknown[]) => mockSend(...a) };
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: { user: { findUnique: (...a: unknown[]) => mockFindUnique(...a) } },
}));

import de from "@/messages/de/email.json";
import en from "@/messages/en/email.json";
import {
  sendAccountDeletionEmail,
  sendPasswordResetEmail,
  sendSolutionActivityEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
} from "@/lib/server/email-service";

/**
 * The whole resolution chain, not a stub of it.
 *
 * `email-service.test.ts` replaces `localeFromRequestScope` to isolate the mail templates;
 * that leaves the part between `User.locale` and the subject line untested - `localeOf`,
 * `localeFromRequestScope` and `resolveLocale` all run for real here. A mail is sent
 * outside a request, so `cookies()` throws and the chain falls through to the account
 * value, which is the leg that decides the language (E6).
 *
 * This is what an English account must not lose: every one of the five mails, subject and
 * body, in English - and German for an account that never chose.
 */
const subjectOf = () => (mockSend.mock.calls[0][0] as { subject: string }).subject;
const sentMail = () =>
  mockSend.mock.calls[0][0] as { subject: string; html: string; text: string };

const ACTIVITY = {
  actorName: "Watson",
  kind: "clever" as const,
  challengeTitle: "Two Sum",
  path: "/challenge/chal-1/loesungen?loesung=abc",
};

const send = {
  verification: () => sendVerificationEmail("user@test.com", "tok"),
  passwordReset: () => sendPasswordResetEmail("user@test.com", "tok"),
  welcome: () => sendWelcomeEmail("user@test.com", "Max"),
  accountDeletion: () => sendAccountDeletionEmail("user@test.com", "Max"),
  solutionActivity: () => sendSolutionActivityEmail("user@test.com", ACTIVITY),
};

beforeEach(() => {
  vi.clearAllMocks();
  mockSend.mockResolvedValue({ data: { id: "e1" }, error: null });
});

describe("the locale chain behind an outgoing mail", () => {
  const mails = Object.keys(send) as (keyof typeof send)[];

  it.each(mails)("writes the %s subject in English for an English account", async (mail) => {
    mockFindUnique.mockResolvedValue({ locale: "en" });

    await send[mail]();

    expect(subjectOf()).toBe(en[mail].subject);
    expect(subjectOf()).not.toBe(de[mail].subject);
  });

  it.each(mails)("writes the %s subject in German for a German account", async (mail) => {
    mockFindUnique.mockResolvedValue({ locale: "de" });

    await send[mail]();

    expect(subjectOf()).toBe(de[mail].subject);
  });

  it("marks the document language and the body, not just the subject", async () => {
    mockFindUnique.mockResolvedValue({ locale: "en" });

    await send.welcome();

    const sent = sentMail();
    expect(sent.html).toContain('lang="en"');
    expect(sent.text).toContain(en.welcome.lineOne);
    expect(sent.text).toContain(en.layout.tagline);
    expect(sent.text).not.toContain(de.welcome.lineOne);
  });

  /** No account row and no request: the chain has nothing left but the default (E1). */
  it("falls back to the default locale when nothing in the chain answers", async () => {
    mockFindUnique.mockResolvedValue(null);

    await send.accountDeletion();

    expect(subjectOf()).toBe(en.accountDeletion.subject);
  });

  /** A value the enum does not know must not reach `Intl` or the message lookup. */
  it("ignores an unknown account locale instead of trusting it", async () => {
    mockFindUnique.mockResolvedValue({ locale: "fr" });

    await send.verification();

    expect(subjectOf()).toBe(en.verification.subject);
  });
});
