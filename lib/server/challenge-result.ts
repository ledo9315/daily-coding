import { prisma } from "@/lib/prisma";

/**
 * The result page for the user's own solution of a challenge.
 *
 * Returns null when the user has no completed submission for this challenge.
 */
export async function getOwnChallengeResult(userId: string, challengeId: string) {
  // The challenge is read through the relation of the user's own submission, never by a
  // separate lookup on the URL id: without a solved submission there is nothing to join to,
  // so guessing ids cannot reveal challenges that were never live — admin drafts included.
  const submission = await prisma.submission.findFirst({
    where: { userId, challengeId, status: "completed" },
    // The ring repeats, so the same user can have several completed rows here.
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      code: true,
      language: true,
      testResults: true,
      createdAt: true,
      updatedAt: true,
      challenge: {
        select: {
          id: true,
          title: true,
          difficulty: true,
          points: true,
          category: { select: { name: true } },
        },
      },
    },
  });

  if (!submission) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { streak: true, streakRecord: true },
  });

  const { challenge, ...rest } = submission;

  return {
    submission: rest,
    challenge: {
      id: challenge.id,
      title: challenge.title,
      difficulty: challenge.difficulty,
      points: challenge.points,
      category: challenge.category.name,
    },
    streak: user?.streak ?? 0,
    streakRecord: user?.streakRecord ?? 0,
  };
}
