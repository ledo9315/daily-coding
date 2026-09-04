import { prisma } from "@/lib/prisma";
import { isAppLocale, type AppLocale } from "@/lib/locale";
import { findDailyChallengeRow, utcDayRange } from "@/lib/server/challenge-day";
import { localizeChallenge } from "@/lib/server/content-translations";
import { sendDailyReminderEmail } from "@/lib/server/email-service";
import { unsubscribePath } from "@/lib/server/reminder-token";

/**
 * How long an account may stay quiet before the reminder stops chasing it. Someone who has
 * not opened the site in a month is not going to be brought back by the thirty-first mail,
 * and every one of those lands in a spam folder that the mails to everyone else share.
 */
export const REMINDER_INACTIVE_AFTER_DAYS = 30;

const DAY_MS = 24 * 60 * 60 * 1000;

/** Resend's free tier allows two requests a second. */
const DEFAULT_PAUSE_MS = 600;

export interface DailyReminderRun {
  sent: number;
  failed: number;
}

export interface DailyReminderOptions {
  now?: Date;
  /** Pause between two sends; `0` in tests, which have no rate limit to respect. */
  pauseMs?: number;
}

/**
 * Everyone who should hear from us today: a confirmed address, the reminder still on,
 * today's challenge still open, no reminder sent yet today, and some sign of life within
 * the last month - either a submission or a registration recent enough to count.
 *
 * All five conditions in one query rather than in a loop: the point of the last one is to
 * keep dead accounts out of the send list, and filtering afterwards would already have
 * loaded them.
 */
async function findRecipients(now: Date) {
  const today = utcDayRange(now);
  const activeSince = new Date(now.getTime() - REMINDER_INACTIVE_AFTER_DAYS * DAY_MS);

  return prisma.user.findMany({
    where: {
      emailVerified: true,
      notifyDailyReminder: true,
      OR: [{ dailyReminderSentAt: null }, { dailyReminderSentAt: { lt: today.gte } }],
      submissions: { none: { createdAt: today } },
      AND: [
        {
          OR: [
            { createdAt: { gte: activeSince } },
            { submissions: { some: { createdAt: { gte: activeSince } } } },
          ],
        },
      ],
    },
    select: { id: true, email: true, locale: true, streak: true },
    orderBy: { createdAt: "asc" },
  });
}

/**
 * One run of the daily reminder.
 *
 * Sequential on purpose. The recipients are few enough that wall-clock time does not
 * matter, and a burst would run into the mail provider's rate limit, where the failure
 * looks like a bug in the selection rather than like too many requests.
 *
 * A failed mail is counted and skipped, never rethrown: one bad address must not cost
 * everyone behind it their reminder. The timestamp is written after the send, so a run
 * that dies halfway leaves the rest of the list eligible for the next one.
 */
export async function runDailyReminder(
  { now = new Date(), pauseMs = DEFAULT_PAUSE_MS }: DailyReminderOptions = {}
): Promise<DailyReminderRun> {
  const challenge = await findDailyChallengeRow();
  if (!challenge) return { sent: 0, failed: 0 };

  const recipients = await findRecipients(now);

  // Two languages, so at most two lookups - not one per recipient.
  const byLocale = new Map<AppLocale, typeof challenge>();
  const localized = async (locale: AppLocale) => {
    const cached = byLocale.get(locale);
    if (cached) return cached;
    const fresh = await localizeChallenge(challenge, locale);
    byLocale.set(locale, fresh);
    return fresh;
  };

  let sent = 0;
  let failed = 0;

  for (const [index, recipient] of recipients.entries()) {
    const locale: AppLocale = isAppLocale(recipient.locale) ? recipient.locale : "de";
    try {
      const task = await localized(locale);
      await sendDailyReminderEmail(
        {
          email: recipient.email,
          locale,
          streak: recipient.streak,
          unsubscribePath: unsubscribePath(recipient.id),
        },
        {
          title: task.title,
          difficulty: task.difficulty,
          points: task.points,
        }
      );
      await prisma.user.update({
        where: { id: recipient.id },
        data: { dailyReminderSentAt: now },
      });
      sent += 1;
    } catch (error) {
      failed += 1;
      console.error(`[daily-reminder] ${recipient.id}`, error);
    }

    if (pauseMs > 0 && index < recipients.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, pauseMs));
    }
  }

  return { sent, failed };
}
