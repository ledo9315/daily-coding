import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth-session";
import { normalizeCommentBody } from "@/lib/comment-policy";
import { checkRateLimit } from "@/lib/server/rate-limiter";
import { hasSolvedChallenge } from "@/lib/server/solution-access";
import { getLifetimePointsByUserIds } from "@/lib/server/user-points";
import { calculateLevel } from "@/lib/level";

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

const commentSelect = {
  id: true,
  userId: true,
  body: true,
  createdAt: true,
  user: { select: { name: true, initials: true, avatar: true } },
} as const;

type CommentRow = {
  id: string;
  userId: string;
  body: string;
  createdAt: Date;
  user: { name: string; initials: string; avatar: string };
};

/** `userId` is only used to derive `own` and must never reach the client. */
function toComment(comment: CommentRow, userId: string, level: number) {
  return {
    id: comment.id,
    author: {
      name: comment.user.name,
      initials: comment.user.initials,
      avatar: comment.user.avatar,
      level,
    },
    body: comment.body,
    createdAt: comment.createdAt.toISOString(),
    own: comment.userId === userId,
  };
}

/** One query for the whole page, so a thread of ten does not become ten point lookups. */
async function levelsOf(userIds: string[]): Promise<Map<string, number>> {
  const points = await getLifetimePointsByUserIds([...new Set(userIds)]);
  return new Map(userIds.map((id) => [id, calculateLevel(points.get(id) ?? 0)]));
}

function parseLimit(rawLimit: string | null): number {
  if (!rawLimit) return DEFAULT_LIMIT;
  const parsedLimit = Number.parseInt(rawLimit, 10);
  if (!Number.isFinite(parsedLimit) || parsedLimit < 1) return DEFAULT_LIMIT;
  return Math.min(MAX_LIMIT, Math.floor(parsedLimit));
}

/**
 * Resolve the submission and the caller's right to see its discussion.
 *
 * The same gate as the solutions route, deliberately repeated here: a comment thread
 * discusses the solution, so reading it without having solved the challenge would hand
 * out what the gate on the solutions protects.
 */
async function authorize(submissionId: string): Promise<
  | { error: NextResponse; userId?: never; challengeId?: never }
  | { error?: never; userId: string; challengeId: string }
> {
  const session = await getSessionUserId();
  if (session.error) return { error: session.error };
  const { userId } = session;

  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    select: { id: true, userId: true, challengeId: true, status: true },
  });

  if (!submission || submission.status !== "completed") {
    return {
      error: NextResponse.json(
        { error: "Einreichung nicht gefunden." },
        { status: 404 }
      ),
    };
  }

  if (!(await hasSolvedChallenge(userId, submission.challengeId))) {
    return {
      error: NextResponse.json(
        { error: "Löse die Challenge zuerst selbst, um die Diskussion zu sehen." },
        { status: 403 }
      ),
    };
  }

  return { userId, challengeId: submission.challengeId };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: submissionId } = await params;

  const access = await authorize(submissionId);
  if (access.error) return access.error;
  const { userId } = access;

  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor")?.trim() || undefined;
  const limit = parseLimit(searchParams.get("limit"));

  const rows = await prisma.comment.findMany({
    where: { submissionId },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: limit + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    select: commentSelect,
  });

  const hasMore = rows.length > limit;
  const page = hasMore ? rows.slice(0, limit) : rows;
  const nextCursor = hasMore && page.length > 0 ? page[page.length - 1].id : null;

  const levels = await levelsOf(page.map((row) => row.userId));

  return NextResponse.json({
    comments: page.map((row) => toComment(row, userId, levels.get(row.userId) ?? 1)),
    nextCursor,
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: submissionId } = await params;

  const access = await authorize(submissionId);
  if (access.error) return access.error;
  const { userId } = access;

  if (!(await checkRateLimit(`comment-create:${userId}`, 10, 60_000))) {
    return NextResponse.json(
      { error: "Zu viele Kommentare. Bitte warte einen Moment." },
      { status: 429 }
    );
  }

  const payload = await request.json().catch(() => null);
  const normalized = normalizeCommentBody(
    (payload as { body?: unknown } | null)?.body
  );
  if ("error" in normalized) {
    return NextResponse.json({ error: normalized.error }, { status: 400 });
  }

  const created = await prisma.comment.create({
    data: { submissionId, userId, body: normalized.body },
    select: commentSelect,
  });

  const levels = await levelsOf([userId]);

  return NextResponse.json(toComment(created, userId, levels.get(userId) ?? 1), {
    status: 201,
  });
}
