import { prisma } from "@/lib/prisma";
import { isValidReminderToken } from "@/lib/server/reminder-token";

/** What a click on the link in a reminder mail did. */
export type ReminderLinkOutcome = "done" | "resumed" | "invalid";

/**
 * Applies a signed reminder link (#288).
 *
 * Separate from the page that renders the answer so the decision can be tested without a
 * request: a wrong signature, a stale user id and a real click are three outcomes, and
 * only the last one may touch a row.
 *
 * `invalid` covers both a broken signature and a deleted account. Telling them apart in
 * the answer would turn the page into a way of asking whether an id still exists.
 */
export async function applyReminderLink(
  userId: string,
  token: string,
  resume: boolean
): Promise<ReminderLinkOutcome> {
  if (userId === "" || token === "" || !isValidReminderToken(userId, token)) {
    return "invalid";
  }

  const user = await prisma.user
    .update({
      where: { id: userId },
      data: { notifyDailyReminder: resume },
      select: { id: true },
    })
    .catch(() => null);

  if (!user) return "invalid";
  return resume ? "resumed" : "done";
}
