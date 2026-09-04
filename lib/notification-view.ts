/** Mirrors the Prisma enum; spelled out so this file stays importable from the client. */
export type NotificationKindId = "comment" | "best_practices" | "clever";

/**
 * Link into the community list, read by the bell, the mails and the list itself.
 *
 * The target is the code hash rather than a submission id: identical solutions share one
 * card, and that card is what a comment or a vote belongs to.
 */
export function solutionLink(challengeId: string, codeHash: string): string {
  return `/challenge/${challengeId}/loesungen?loesung=${codeHash}`;
}

/**
 * One message key per notification kind, in the `email` namespace.
 *
 * The bell and the activity mail say the same sentence, and one key set is what keeps the
 * two from drifting - which is why the bell reads its text out of the mail namespace rather
 * than keeping a second copy under `api`. Both resolve it with the locale of the person who
 * receives it: the mail from `User.locale`, the bell from the request.
 */
export const NOTIFICATION_MESSAGE_KEYS = {
  comment: "solutionActivity.comment",
  best_practices: "solutionActivity.bestPractices",
  clever: "solutionActivity.clever",
} as const satisfies Record<NotificationKindId, string>;
