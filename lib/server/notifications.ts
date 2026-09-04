import { prisma } from "@/lib/prisma";
import type { NotificationKind } from "@/lib/generated/prisma/client";
import { checkRateLimit } from "@/lib/server/rate-limiter";
import { sendSolutionActivityEmail } from "@/lib/server/email-service";
import { localizeChallengeTitle } from "@/lib/server/content-translations";
import { solutionLink } from "@/lib/notification-view";

/**
 * Mails per recipient and hour. A vote is a single click and the button toggles, so without
 * a ceiling one person tapping around a card turns into a full inbox. Above the limit the
 * bell still shows everything - only the mail is dropped.
 */
const EMAILS_PER_HOUR = 5;

interface Activity {
  challengeId: string;
  codeHash: string;
  /** Who commented or voted; never notified about their own action. */
  actorId: string;
  kind: NotificationKind;
}

/**
 * Everyone who wrote this exact code, minus the actor.
 *
 * Not the owner of the commented submission: the thread hangs on the *oldest* row of a code
 * group, so with identical solutions that row belongs to someone else and everybody after
 * them would hear nothing.
 */
async function recipientsOf({ challengeId, codeHash, actorId }: Activity) {
  const rows = await prisma.submission.findMany({
    where: { challengeId, codeHash, status: "completed", userId: { not: actorId } },
    distinct: ["userId"],
    select: {
      user: {
        select: {
          id: true,
          email: true,
          notifyByEmail: true,
          emailVerified: true,
          locale: true,
        },
      },
    },
  });
  return rows.map((row) => row.user);
}

/**
 * Record the activity and mail it out.
 *
 * Awaited by its callers inside a try/catch rather than left running after the response:
 * a serverless instance is frozen once the response is written, and a detached promise is
 * simply lost there.
 *
 * ponytail: `waitUntil()` from @vercel/functions would take the mail off the request path
 * if the added latency ever shows up.
 */
export async function notifySolutionActivity(activity: Activity): Promise<void> {
  const { challengeId, codeHash, actorId, kind } = activity;

  const recipients = await recipientsOf(activity);
  if (recipients.length === 0) return;

  await prisma.notification.createMany({
    data: recipients.map((recipient) => ({
      userId: recipient.id,
      actorId,
      kind,
      challengeId,
      codeHash,
    })),
  });

  const mailable = recipients.filter((r) => r.notifyByEmail && r.emailVerified);
  if (mailable.length === 0) return;

  const [actor, challenge] = await Promise.all([
    prisma.user.findUnique({ where: { id: actorId }, select: { name: true } }),
    prisma.challenge.findUnique({ where: { id: challengeId }, select: { title: true } }),
  ]);
  if (!actor || !challenge) return;

  // The mail is written in the recipient's language (E6), so the title is looked up per
  // locale rather than per recipient - two mailable languages, at most two lookups.
  const titleByLocale = new Map<string, string>();
  for (const locale of new Set(mailable.map((recipient) => recipient.locale))) {
    titleByLocale.set(
      locale,
      await localizeChallengeTitle(challengeId, challenge.title, locale)
    );
  }

  for (const recipient of mailable) {
    if (!(await checkRateLimit(`notify-email:${recipient.id}`, EMAILS_PER_HOUR, 3_600_000))) {
      continue;
    }
    await sendSolutionActivityEmail(recipient.email, {
      actorName: actor.name,
      kind,
      challengeTitle: titleByLocale.get(recipient.locale) ?? challenge.title,
      path: solutionLink(challengeId, codeHash),
    });
  }
}

/**
 * Take back what a withdrawn vote announced.
 *
 * Only the unread ones: a notification that was read has already been seen, and making it
 * vanish from the list afterwards reads as a bug rather than as a correction.
 */
export async function forgetSolutionVote(activity: Activity): Promise<void> {
  const { challengeId, codeHash, actorId, kind } = activity;
  await prisma.notification.deleteMany({
    where: { challengeId, codeHash, actorId, kind, readAt: null },
  });
}
