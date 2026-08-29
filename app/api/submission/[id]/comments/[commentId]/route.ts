import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth-session";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  const { id: submissionId, commentId } = await params;

  const session = await getSessionUserId();
  if (session.error) return session.error;
  const { userId } = session;

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { id: true, userId: true, submissionId: true },
  });

  /**
   * The comment must belong to the submission from the path — otherwise any submission
   * the caller may read would serve as a door to a foreign comment id.
   */
  if (!comment || comment.submissionId !== submissionId) {
    return NextResponse.json({ error: "Kommentar nicht gefunden." }, { status: 404 });
  }

  /** Author only: owning the submission grants no moderation rights over foreign comments. */
  if (comment.userId !== userId) {
    return NextResponse.json(
      { error: "Du kannst nur eigene Kommentare löschen." },
      { status: 403 }
    );
  }

  await prisma.comment.delete({ where: { id: comment.id } });

  return NextResponse.json({ success: true });
}
