import { NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth-session";
import { checkRateLimit } from "@/lib/server/rate-limiter";
import { hasSolvedChallenge } from "@/lib/server/solution-access";
import { parseVoteKind, readSolutionVotes } from "@/lib/server/solution-votes";
import { forgetSolutionVote, notifySolutionActivity } from "@/lib/server/notifications";
import { persistAchievementUnlocks } from "@/lib/server/achievement-unlocks";

/** Toggles one vote. POST rather than PUT/DELETE: the client never knows the current state. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const t = await getTranslations("api");
  const { id: challengeId } = await params;

  const session = await getSessionUserId();
  if (session.error) return session.error;
  const { userId } = session;

  if (!(await checkRateLimit(`solution-vote:${userId}`, 30, 60_000))) {
    return NextResponse.json(
      { error: t("votes.tooManyVotes") },
      { status: 429 }
    );
  }

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const codeHash = typeof body.codeHash === "string" ? body.codeHash : "";
  const kind = parseVoteKind(body.kind);
  if (!/^[0-9a-f]{64}$/.test(codeHash) || !kind) {
    return NextResponse.json({ error: t("votes.invalidVote") }, { status: 400 });
  }

  if (!(await hasSolvedChallenge(userId, challengeId))) {
    return NextResponse.json(
      { error: t("votes.solveFirstToVote") },
      { status: 403 }
    );
  }

  // Refused on the server, not just hidden in the UI: the button is a POST anyone can send.
  const ownRow = await prisma.submission.findFirst({
    where: { userId, challengeId, codeHash, status: "completed" },
    select: { id: true },
  });
  if (ownRow) {
    return NextResponse.json(
      { error: t("votes.ownSolution") },
      { status: 403 }
    );
  }

  const solution = await prisma.submission.findFirst({
    where: { challengeId, codeHash, status: "completed" },
    select: { id: true },
  });
  if (!solution) {
    return NextResponse.json({ error: t("votes.solutionNotFound") }, { status: 404 });
  }

  // Delete first: a hit means the vote was there and is now taken back, a miss means it was
  // not. One round trip either way, and the unique key keeps a double click from doubling.
  const removed = await prisma.solutionVote.deleteMany({
    where: { challengeId, codeHash, userId, kind },
  });
  if (removed.count === 0) {
    await prisma.solutionVote.create({ data: { challengeId, codeHash, userId, kind } });
  }

  // The vote itself is cast at this point; a failing notification or mail must not turn
  // that into an error the voter sees.
  try {
    const activity = { challengeId, codeHash, actorId: userId, kind };
    if (removed.count === 0) {
      await notifySolutionActivity(activity);
    } else {
      await forgetSolutionVote(activity);
    }
  } catch {
    /* Notification is a side effect of the vote, not part of it. */
  }

  // „Vorbild" and „Trickreich" count votes the *authors* received, so the unlock is frozen
  // for them, not the voter. Only on a cast vote: a retracted one leaves a frozen unlock
  // in place by design (#205).
  if (removed.count === 0) {
    try {
      const authors = await prisma.submission.findMany({
        where: { challengeId, codeHash, status: "completed" },
        select: { userId: true },
        distinct: ["userId"],
      });
      for (const author of authors) {
        await persistAchievementUnlocks(prisma, author.userId);
      }
    } catch {
      /* The vote is cast; a failing unlock write must not undo it. */
    }
  }

  const tallies = await readSolutionVotes(challengeId, codeHash, userId);
  return NextResponse.json(tallies);
}
