import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth-session";
import { calculateLevel } from "@/lib/level";
import { hasSolvedChallenge } from "@/lib/server/solution-access";
import { getLifetimePointsByUserIds } from "@/lib/server/user-points";

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

function parseLimit(rawLimit: string | null): number {
  if (!rawLimit) return DEFAULT_LIMIT;
  const parsedLimit = Number.parseInt(rawLimit, 10);
  if (!Number.isFinite(parsedLimit) || parsedLimit < 1) return DEFAULT_LIMIT;
  return Math.min(MAX_LIMIT, Math.floor(parsedLimit));
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: challengeId } = await params;

  const session = await getSessionUserId();
  if (session.error) return session.error;
  const { userId } = session;

  if (!(await hasSolvedChallenge(userId, challengeId))) {
    return NextResponse.json(
      { error: "Löse die Challenge zuerst selbst, um fremde Lösungen zu sehen." },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor")?.trim() || undefined;
  const limit = parseLimit(searchParams.get("limit"));

  const submissions = await prisma.submission.findMany({
    /** Own row is rendered separately above the list and must not appear in it twice. */
    where: { challengeId, status: "completed", userId: { not: userId } },
    /**
     * Ordered and paginated by `createdAt`, never `updatedAt`: the upsert from #200 moves
     * `updatedAt` on every re-submission, so rows would jump between pages while reading.
     */
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: limit + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    select: {
      id: true,
      userId: true,
      code: true,
      language: true,
      createdAt: true,
      updatedAt: true,
      user: { select: { name: true, initials: true, avatar: true } },
    },
  });

  const hasMore = submissions.length > limit;
  const page = hasMore ? submissions.slice(0, limit) : submissions;
  const nextCursor = hasMore && page.length > 0 ? page[page.length - 1].id : null;

  const lifetimePoints = await getLifetimePointsByUserIds([
    ...new Set(page.map((submission) => submission.userId)),
  ]);

  const solutions = page.map((submission) => ({
    id: submission.id,
    user: {
      name: submission.user.name,
      initials: submission.user.initials,
      avatar: submission.user.avatar,
      level: calculateLevel(lifetimePoints.get(submission.userId) ?? 0),
    },
    language: submission.language,
    code: submission.code,
    createdAt: submission.createdAt.toISOString(),
    revised: submission.updatedAt.getTime() !== submission.createdAt.getTime(),
  }));

  return NextResponse.json({ solutions, nextCursor });
}
