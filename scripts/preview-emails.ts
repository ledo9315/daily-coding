/**
 * Renders all four mails into one HTML file for review in a browser. Sends nothing.
 *
 * Run: pnpm tsx scripts/preview-emails.ts && open .email-preview.html
 *
 * The output is gitignored — it is a look at the templates, not an artefact. What the
 * preview cannot show is how Gmail or Outlook rewrite the markup; for that a real send
 * to a test address is the only check.
 */
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { renderEmail, type EmailContent } from "../lib/server/email-template";

const APP = "https://app.example.com";

const MAILS: { subject: string; content: EmailContent }[] = [
  {
    subject: "E-Mail Adresse bestätigen – Daily Coding",
    content: {
      heading: "E-Mail bestätigen",
      lines: [
        "Fast fertig. Bestätige deine Adresse, dann kannst du mit der ersten Challenge anfangen.",
      ],
      action: { label: "Adresse bestätigen", url: `${APP}/auth/verify-email?token=demo` },
      footer: "Dieser Link ist 24 Stunden gültig.",
    },
  },
  {
    subject: "Passwort zurücksetzen – Daily Coding",
    content: {
      heading: "Passwort zurücksetzen",
      lines: ["Du kannst hier ein neues Passwort für dein Konto setzen."],
      action: { label: "Neues Passwort setzen", url: `${APP}/auth/reset-password?token=demo` },
      footer:
        "Dieser Link ist 1 Stunde gültig. Wenn du kein Zurücksetzen beantragt hast, ignoriere diese E-Mail — dein Passwort bleibt unverändert.",
    },
  },
  {
    subject: "Willkommen bei Daily Coding!",
    content: {
      heading: "Willkommen, Lisa Müller",
      lines: [
        "Jeden Tag wartet eine neue Coding-Challenge auf dich — in JavaScript, TypeScript, Python oder PHP.",
        "Löse sie, sammle Punkte und halte deine Serie am Leben.",
      ],
      action: { label: "Zur heutigen Challenge", url: `${APP}/challenge` },
      footer: "Viel Erfolg.",
    },
  },
  {
    subject: "Konto gelöscht – Daily Coding",
    content: {
      heading: "Konto gelöscht",
      lines: [
        "Hallo Lisa Müller, dein Daily-Coding-Konto wurde gelöscht.",
        "Deine Abgaben und dein Punktestand sind damit entfernt.",
      ],
      footer:
        "Wenn du das nicht selbst veranlasst hast, melde dich bitte sofort bei uns. Diese Adresse kann jederzeit für ein neues Konto verwendet werden.",
    },
  },
];

const sections = MAILS.map(({ subject, content }) => {
  const { html, text } = renderEmail(content);
  return `<section>
  <h2>${subject}</h2>
  <iframe srcdoc="${html.replace(/"/g, "&quot;")}" title="${subject}"></iframe>
  <details><summary>Nur-Text-Fassung</summary><pre>${text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")}</pre></details>
</section>`;
}).join("\n");

const page = `<!doctype html>
<html lang="de"><head><meta charset="utf-8"><title>E-Mail-Vorschau</title>
<style>
  body { margin:0; padding:32px; background:#0d1117; color:#e6edf3; font-family:'Courier New',monospace; }
  h1 { font-size:20px; letter-spacing:2px; }
  section { margin-bottom:40px; }
  h2 { font-size:14px; color:#8b949e; font-weight:normal; }
  iframe { width:100%; max-width:640px; height:520px; border:2px solid #30363d; background:#0d1117; }
  pre { max-width:640px; padding:16px; border:2px solid #30363d; white-space:pre-wrap; font-size:13px; }
  summary { cursor:pointer; color:#c4fe4d; font-size:13px; margin-top:8px; }
</style></head>
<body><h1>&gt;_ E-MAIL-VORSCHAU</h1>${sections}</body></html>`;

const out = resolve(process.cwd(), ".email-preview.html");
writeFileSync(out, page);
console.log(out);
