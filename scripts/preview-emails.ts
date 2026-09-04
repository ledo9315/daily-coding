/**
 * Renders every mail in every language into one HTML file for review in a browser.
 * Sends nothing.
 *
 * Run: pnpm tsx scripts/preview-emails.ts && open .email-preview.html
 *
 * The copy is pulled out of `messages/<locale>/email.json` through the same translator
 * `email-service.ts` uses, so the preview cannot drift from what is actually sent - it
 * used to hold a second, German-only copy of every subject and line. Only the sample
 * values are made up here.
 *
 * The output is gitignored: it is a look at the templates, not an artefact. What the
 * preview cannot show is how Gmail or Outlook rewrite the markup; for that a real send
 * to a test address is the only check.
 */
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { emailTranslator, renderEmail, type EmailContent } from "../lib/server/email-template";
import { LOCALES } from "../lib/locale";

const APP = "https://app.example.com";
const NAME = "Lisa Müller";
const ACTOR = "Watson";
const CHALLENGE = "Two Sum";

type Translate = ReturnType<typeof emailTranslator>;

function mailsFor(t: Translate): { subject: string; content: EmailContent }[] {
  return [
    {
      subject: t("verification.subject"),
      content: {
        heading: t("verification.heading"),
        lines: [t("verification.line")],
        action: {
          label: t("verification.action"),
          url: `${APP}/auth/verify-email?token=demo`,
        },
        footer: t("verification.footer"),
      },
    },
    {
      subject: t("passwordReset.subject"),
      content: {
        heading: t("passwordReset.heading"),
        lines: [t("passwordReset.line")],
        action: {
          label: t("passwordReset.action"),
          url: `${APP}/auth/reset-password?token=demo`,
        },
        footer: t("passwordReset.footer"),
      },
    },
    {
      subject: t("welcome.subject"),
      content: {
        heading: t("welcome.heading", { name: NAME }),
        lines: [t("welcome.lineOne"), t("welcome.lineTwo")],
        action: { label: t("welcome.action"), url: `${APP}/challenge` },
        footer: t("welcome.footer"),
      },
    },
    {
      subject: t("accountDeletion.subject"),
      content: {
        heading: t("accountDeletion.heading"),
        lines: [
          t("accountDeletion.lineOne", { name: NAME }),
          t("accountDeletion.lineTwo"),
        ],
        footer: t("accountDeletion.footer"),
      },
    },
    {
      subject: t("solutionActivity.subject"),
      content: {
        heading: t("solutionActivity.heading"),
        lines: [t("solutionActivity.comment", { actor: ACTOR, challenge: CHALLENGE })],
        action: {
          label: t("solutionActivity.action"),
          url: `${APP}/challenge/demo/solutions?loesung=demo`,
        },
        footer: t("solutionActivity.footer"),
      },
    },
    {
      subject: t("dailyReminder.subject", { title: CHALLENGE }),
      content: {
        heading: t("dailyReminder.heading"),
        lines: [
          t("dailyReminder.task", {
            title: CHALLENGE,
            difficulty: t("dailyReminder.difficulty.medium"),
            points: 30,
          }),
          t("dailyReminder.streak", { days: 12 }),
        ],
        action: { label: t("dailyReminder.action"), url: `${APP}/challenge` },
        footer: t("dailyReminder.footer"),
        unsubscribe: {
          label: t("dailyReminder.unsubscribe"),
          url: `${APP}/unsubscribe?u=demo&t=demo`,
        },
      },
    },
    {
      // The same mail for someone without a streak: it is a different sentence, not a
      // missing one, and it is the version a new reader gets.
      subject: t("dailyReminder.subject", { title: CHALLENGE }),
      content: {
        heading: t("dailyReminder.heading"),
        lines: [
          t("dailyReminder.task", {
            title: CHALLENGE,
            difficulty: t("dailyReminder.difficulty.easy"),
            points: 10,
          }),
          t("dailyReminder.noStreak"),
        ],
        action: { label: t("dailyReminder.action"), url: `${APP}/challenge` },
        footer: t("dailyReminder.footer"),
        unsubscribe: {
          label: t("dailyReminder.unsubscribe"),
          url: `${APP}/unsubscribe?u=demo&t=demo`,
        },
      },
    },
  ];
}

const escape = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;");

const groups = LOCALES.map((locale) => {
  const t = emailTranslator(locale);
  const sections = mailsFor(t)
    .map(({ subject, content }) => {
      const { html, text } = renderEmail(content, locale);
      return `<section>
  <h2>${escape(subject)}</h2>
  <iframe srcdoc="${html.replace(/"/g, "&quot;")}" title="${escape(subject)}"></iframe>
  <details><summary>Plain-text version</summary><pre>${escape(text)}</pre></details>
</section>`;
    })
    .join("\n");
  return `<h1>&gt;_ ${locale.toUpperCase()}</h1>${sections}`;
}).join("\n");

const page = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Email preview</title>
<style>
  body { margin:0; padding:32px; background:#0d1117; color:#e6edf3; font-family:'Courier New',monospace; }
  h1 { font-size:20px; letter-spacing:2px; margin-top:48px; }
  section { margin-bottom:40px; }
  h2 { font-size:14px; color:#8b949e; font-weight:normal; }
  iframe { width:100%; max-width:640px; height:520px; border:2px solid #30363d; background:#0d1117; }
  pre { max-width:640px; padding:16px; border:2px solid #30363d; white-space:pre-wrap; font-size:13px; }
  summary { cursor:pointer; color:#c4fe4d; font-size:13px; margin-top:8px; }
</style></head>
<body>${groups}</body></html>`;

const out = resolve(process.cwd(), ".email-preview.html");
writeFileSync(out, page);
console.log(out);
