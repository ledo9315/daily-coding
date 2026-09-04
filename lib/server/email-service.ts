import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import {
  emailTranslator,
  renderEmail,
  type EmailContent,
} from "@/lib/server/email-template";
import { localeFromRequestScope } from "@/lib/server/request-locale";
import type { AppLocale } from "@/lib/locale";
import { localizedPath } from "@/lib/site";
import {
  NOTIFICATION_MESSAGE_KEYS,
  type NotificationKindId,
} from "@/lib/notification-view";

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
 * The language a mail is written in belongs to its recipient, not to the request that
 * triggered it: an activity mail is sent while a third party clicks, and the recipient
 * may not even be online. `User.locale` is therefore the first source (E6).
 *
 * The request scope is the fallback, and it is the right one twice over - the deletion
 * mail goes out after the row is gone, and a mail to an address without an account has
 * no row to read. Outside a request it degrades to the default locale on its own.
 */
async function localeOf(recipient: string): Promise<AppLocale> {
  const user = await prisma.user
    .findUnique({ where: { email: recipient }, select: { locale: true } })
    .catch(() => null);
  return localeFromRequestScope(user?.locale);
}

/**
 * `renderEmail` escapes every piece of content, so names from the registration form are
 * safe to pass through here. They used to be interpolated into the HTML raw (#105).
 */
async function send(
  to: string,
  locale: AppLocale,
  subject: string,
  content: EmailContent,
  /** `List-Unsubscribe` goes here: a header, not body copy, is what an inbox reads. */
  headers?: Record<string, string>
): Promise<void> {
  const { html, text } = renderEmail(content, locale);
  await getResend().emails.send({ from: getFrom(), to, subject, html, text, headers });
}

export async function sendVerificationEmail(to: string, token: string): Promise<void> {
  const locale = await localeOf(to);
  const t = emailTranslator(locale);
  const url = `${getAppUrl()}/auth/verify-email?token=${token}`;
  await send(to, locale, t("verification.subject"), {
    heading: t("verification.heading"),
    lines: [t("verification.line")],
    action: { label: t("verification.action"), url },
    footer: t("verification.footer"),
  });
}

export async function sendPasswordResetEmail(to: string, token: string): Promise<void> {
  const locale = await localeOf(to);
  const t = emailTranslator(locale);
  const url = `${getAppUrl()}/auth/reset-password?token=${token}`;
  await send(to, locale, t("passwordReset.subject"), {
    heading: t("passwordReset.heading"),
    lines: [t("passwordReset.line")],
    action: { label: t("passwordReset.action"), url },
    footer: t("passwordReset.footer"),
  });
}

export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  const locale = await localeOf(to);
  const t = emailTranslator(locale);
  await send(to, locale, t("welcome.subject"), {
    heading: t("welcome.heading", { name }),
    lines: [t("welcome.lineOne"), t("welcome.lineTwo")],
    action: {
      label: t("welcome.action"),
      // The task page has one URL per language since #287; a German reader must not be
      // sent to the English one by their own welcome mail.
      url: `${getAppUrl()}${localizedPath("/challenge", locale)}`,
    },
    footer: t("welcome.footer"),
  });
}

export async function sendAccountDeletionEmail(to: string, name: string): Promise<void> {
  const locale = await localeOf(to);
  const t = emailTranslator(locale);
  await send(to, locale, t("accountDeletion.subject"), {
    heading: t("accountDeletion.heading"),
    lines: [
      t("accountDeletion.lineOne", {
        name: name || t("accountDeletion.namelessGreeting"),
      }),
      t("accountDeletion.lineTwo"),
    ],
    footer: t("accountDeletion.footer"),
  });
}

export async function sendSolutionActivityEmail(
  to: string,
  activity: {
    actorName: string;
    kind: NotificationKindId;
    challengeTitle: string;
    /** App-relative link to the solution; the absolute URL is built here. */
    path: string;
  }
): Promise<void> {
  const locale = await localeOf(to);
  const t = emailTranslator(locale);
  await send(to, locale, t("solutionActivity.subject"), {
    heading: t("solutionActivity.heading"),
    lines: [
      t(NOTIFICATION_MESSAGE_KEYS[activity.kind], {
        actor: activity.actorName,
        challenge: activity.challengeTitle,
      }),
    ],
    action: { label: t("solutionActivity.action"), url: `${getAppUrl()}${activity.path}` },
    footer: t("solutionActivity.footer"),
  });
}

export interface DailyReminderRecipient {
  email: string;
  locale: AppLocale;
  /** Days in a row so far. `0` changes what the mail has to say, not whether it is sent. */
  streak: number;
  /** App-relative and signed; the absolute URL is built here, as for the activity mail. */
  unsubscribePath: string;
}

export interface DailyReminderChallenge {
  title: string;
  difficulty: "easy" | "medium" | "hard";
  points: number;
}

/**
 * The one mail nobody asked for by clicking (#288), which is why it carries an unsubscribe
 * in two places: the header every inbox understands, and a link the reader can see.
 *
 * The locale is passed in rather than looked up by address like the other senders - the
 * caller selected these rows and already holds it, and a run of a few hundred recipients
 * should not spend a query per mail to learn what it knows.
 */
export async function sendDailyReminderEmail(
  recipient: DailyReminderRecipient,
  challenge: DailyReminderChallenge
): Promise<void> {
  const { locale } = recipient;
  const t = emailTranslator(locale);
  const unsubscribeUrl = `${getAppUrl()}${recipient.unsubscribePath}`;

  await send(
    recipient.email,
    locale,
    t("dailyReminder.subject", { title: challenge.title }),
    {
      heading: t("dailyReminder.heading"),
      lines: [
        t("dailyReminder.task", {
          title: challenge.title,
          difficulty: t(`dailyReminder.difficulty.${challenge.difficulty}`),
          points: challenge.points,
        }),
        recipient.streak > 0
          ? t("dailyReminder.streak", { days: recipient.streak })
          : t("dailyReminder.noStreak"),
      ],
      action: {
        label: t("dailyReminder.action"),
        url: `${getAppUrl()}${localizedPath("/challenge", locale)}`,
      },
      footer: t("dailyReminder.footer"),
      unsubscribe: {
        label: t("dailyReminder.unsubscribe"),
        url: unsubscribeUrl,
      },
    },
    { "List-Unsubscribe": `<${unsubscribeUrl}>` }
  );
}
