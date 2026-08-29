import { Resend } from "resend";
import { renderEmail, type EmailContent } from "@/lib/server/email-template";

function getResend(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }
  return new Resend(apiKey);
}

function getFrom(): string {
  return process.env.EMAIL_FROM ?? "noreply@example.com";
}

function getAppUrl(): string {
  return process.env.APP_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";
}

/**
 * `renderEmail` escapes every piece of content, so names from the registration form are
 * safe to pass through here. They used to be interpolated into the HTML raw (#105).
 */
async function send(to: string, subject: string, content: EmailContent): Promise<void> {
  const { html, text } = renderEmail(content);
  await getResend().emails.send({ from: getFrom(), to, subject, html, text });
}

export async function sendVerificationEmail(to: string, token: string): Promise<void> {
  const url = `${getAppUrl()}/auth/verify-email?token=${token}`;
  await send(to, "E-Mail Adresse bestätigen – Daily Coding", {
    heading: "E-Mail bestätigen",
    lines: [
      "Fast fertig. Bestätige deine Adresse, dann kannst du mit der ersten Challenge anfangen.",
    ],
    action: { label: "Adresse bestätigen", url },
    footer: "Dieser Link ist 24 Stunden gültig.",
  });
}

export async function sendPasswordResetEmail(to: string, token: string): Promise<void> {
  const url = `${getAppUrl()}/auth/reset-password?token=${token}`;
  await send(to, "Passwort zurücksetzen – Daily Coding", {
    heading: "Passwort zurücksetzen",
    lines: ["Du kannst hier ein neues Passwort für dein Konto setzen."],
    action: { label: "Neues Passwort setzen", url },
    footer:
      "Dieser Link ist 1 Stunde gültig. Wenn du kein Zurücksetzen beantragt hast, ignoriere diese E-Mail. Dein Passwort bleibt unverändert.",
  });
}

export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  await send(to, "Willkommen bei Daily Coding!", {
    heading: `Willkommen, ${name}`,
    lines: [
      "Jeden Tag wartet eine neue Coding-Challenge auf dich, in deiner Sprache.",
      "Löse sie, sammle Punkte und halte deine Serie am Leben.",
    ],
    action: { label: "Zur heutigen Challenge", url: `${getAppUrl()}/challenge` },
    footer: "Viel Erfolg.",
  });
}

export async function sendAccountDeletionEmail(to: string, name: string): Promise<void> {
  await send(to, "Konto gelöscht – Daily Coding", {
    heading: "Konto gelöscht",
    lines: [
      `Hallo ${name || "und tschüss"}, dein Daily-Coding-Konto wurde gelöscht.`,
      "Deine Abgaben und dein Punktestand sind damit entfernt.",
    ],
    footer:
      "Wenn du das nicht selbst veranlasst hast, melde dich bitte sofort bei uns. Diese Adresse kann jederzeit für ein neues Konto verwendet werden.",
  });
}
