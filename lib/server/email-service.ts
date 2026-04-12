import { Resend } from "resend";

function getResend(): Resend {
  return new Resend(process.env.RESEND_API_KEY);
}

function getFrom(): string {
  return process.env.EMAIL_FROM ?? "noreply@example.com";
}

function getAppUrl(): string {
  return process.env.APP_URL ?? "http://localhost:3000";
}

export async function sendVerificationEmail(to: string, token: string): Promise<void> {
  const url = `${getAppUrl()}/auth/verify-email?token=${token}`;
  const resend = getResend();
  await resend.emails.send({
    from: getFrom(),
    to,
    subject: "E-Mail Adresse bestätigen – Daily Dev",
    html: `<p>Klicke auf den folgenden Link um deine E-Mail zu bestätigen:</p>
<p><a href="${url}">${url}</a></p>
<p>Dieser Link ist 24 Stunden gültig.</p>`,
  });
}

export async function sendPasswordResetEmail(to: string, token: string): Promise<void> {
  const url = `${getAppUrl()}/auth/reset-password?token=${token}`;
  const resend = getResend();
  await resend.emails.send({
    from: getFrom(),
    to,
    subject: "Passwort zurücksetzen – Daily Dev",
    html: `<p>Klicke auf den folgenden Link um dein Passwort zurückzusetzen:</p>
<p><a href="${url}">${url}</a></p>
<p>Dieser Link ist 1 Stunde gültig. Wenn du kein Zurücksetzen beantragt hast, ignoriere diese E-Mail.</p>`,
  });
}

export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  const resend = getResend();
  await resend.emails.send({
    from: getFrom(),
    to,
    subject: "Willkommen bei Daily Dev!",
    html: `<p>Hey ${name},</p>
<p>willkommen bei Daily Dev! Löse täglich Coding-Challenges und steige im Ranking auf.</p>`,
  });
}
