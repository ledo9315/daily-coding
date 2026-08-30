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

/** German sentence for one notification, built at read time from the actor's current name. */
export function notificationText(
  kind: NotificationKindId,
  actorName: string,
  challengeTitle: string
): string {
  const solution = `deine Lösung zu „${challengeTitle}“`;
  switch (kind) {
    case "comment":
      return `${actorName} hat ${solution} kommentiert.`;
    case "best_practices":
      return `${actorName} findet ${solution} vorbildlich.`;
    case "clever":
      return `${actorName} findet ${solution} clever.`;
  }
}
