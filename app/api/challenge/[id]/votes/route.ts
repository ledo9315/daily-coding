import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth-session";
import { checkRateLimit } from "@/lib/server/rate-limiter";
import { hasSolvedChallenge } from "@/lib/server/solution-access";
import { parseVoteKind, readSolutionVotes } from "@/lib/server/solution-votes";
import { forgetSolutionVote, notifySolutionActivity } from "@/lib/server/notifications";

/** Toggles one vote. POST rather than PUT/DELETE: the client never knows the current state. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: challengeId } = await params;

  const session = await getSessionUserId();
  if (session.error) return session.error;
  const { userId } = session;

  if (!(await checkRateLimit(`solution-vote:${userId}`, 30, 60_000))) {
    return NextResponse.json(
      { error: "Zu viele Bewertungen. Bitte kurz warten." },
      { status: 429 }
    );
  }

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const codeHash = typeof body.codeHash === "string" ? body.codeHash : "";
  const kind = parseVoteKind(body.kind);
  if (!/^[0-9a-f]{64}$/.test(codeHash) || !kind) {
    return NextResponse.json({ error: "Ungültige Bewertung." }, { status: 400 });
  }

  if (!(await hasSolvedChallenge(userId, challengeId))) {
    return NextResponse.json(
      { error: "Löse die Challenge zuerst selbst, um Lösungen zu bewerten." },
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
      { error: "Die eigene Lösung kannst du nicht bewerten." },
      { status: 403 }
    );
  }

  const solution = await prisma.submission.findFirst({
    where: { challengeId, codeHash, status: "completed" },
    select: { id: true },
  });
  if (!solution) {
    return NextResponse.json({ error: "Lösung nicht gefunden." }, { status: 404 });
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

  const tallies = await readSolutionVotes(challengeId, codeHash, userId);
  return NextResponse.json(tallies);
}
