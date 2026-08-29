import { prisma } from "@/lib/prisma";

/**
 * Whether the user has solved this challenge and may therefore see the solutions of others.
 *
 * The page that renders them is not a security boundary - it only decides what to show.
 * Every route that hands out foreign solutions or their discussions has to ask this itself.
 */
export async function hasSolvedChallenge(userId: string, challengeId: string): Promise<boolean> {
  const solved = await prisma.submission.findFirst({
    where: { userId, challengeId, status: "completed" },
    select: { id: true },
  });

  return solved !== null;
}
