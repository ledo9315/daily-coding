import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateLevel } from "@/lib/level";
import { computeLevelUpBySubmissionId } from "@/lib/server/community-feed-level";

const DEFAULT_LIMIT = 15;
const MAX_LIMIT = 50;

function parseLimit(rawLimit: string | null): number {
  if (!rawLimit) return DEFAULT_LIMIT;
  const parsedLimit = Number.parseInt(rawLimit, 10);
  if (!Number.isFinite(parsedLimit) || parsedLimit < 1) return DEFAULT_LIMIT;
  return Math.min(MAX_LIMIT, Math.floor(parsedLimit));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor")?.trim() || undefined;
  const limit = parseLimit(searchParams.get("limit"));
  const take = limit + 1;

  const submissions = await prisma.submission.findMany({
    where: { status: "completed" },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    /**
     * `select`, not `include: { user: true }`. The response only ever contained name,
     * initials and avatar, but the whole row — `passwordHash`, `email`, `nameKey` — was
     * being loaded into the memory of a route that answers a feed. Nothing leaked; the
     * point is that what is never loaded cannot be handed out by a later change (#122).
     */
    select: {
      id: true,
      userId: true,
      createdAt: true,
      user: { select: { name: true, initials: true, avatar: true } },
      challenge: { select: { title: true, points: true } },
    },
  });

  const hasMore = submissions.length > limit;
  const page = hasMore ? submissions.slice(0, limit) : submissions;
  const nextCursor = hasMore && page.length > 0 ? page[page.length - 1].id : null;

  const userIds = [...new Set(page.map((submission) => submission.userId))];

  const orderedSubmissions =
    userIds.length === 0
      ? []
      : await prisma.submission.findMany({
          where: { userId: { in: userIds }, status: "completed" },
          orderBy: [{ createdAt: "asc" }, { id: "asc" }],
          select: {
            id: true,
            userId: true,
            challenge: { select: { points: true } },
          },
        });

  const lifetimePoints = new Map<string, number>();
  for (const submission of orderedSubmissions) {
    lifetimePoints.set(
      submission.userId,
      (lifetimePoints.get(submission.userId) ?? 0) + submission.challenge.points,
    );
  }

  const levelUpMap = computeLevelUpBySubmissionId(
    page.map((submission) => ({
      id: submission.id,
      userId: submission.userId,
      challenge: { points: submission.challenge.points },
    })),
    orderedSubmissions,
  );

  const now = new Date();
  const formatRelativeTime = (date: Date) => {
    const elapsedMs = now.getTime() - date.getTime();
    const elapsedMinutes = Math.floor(elapsedMs / 60000);
    if (elapsedMinutes < 60) return `vor ${elapsedMinutes} Minuten`;
    const elapsedHours = Math.floor(elapsedMinutes / 60);
    if (elapsedHours < 24)
      return `vor ${elapsedHours} Stunde${elapsedHours > 1 ? "n" : ""}`;
    return `vor ${Math.floor(elapsedHours / 24)} Tagen`;
  };

  const items = page.map((submission) => {
    const levelUp = levelUpMap.get(submission.id);
    return {
      id: submission.id,
      kind: "challenge-solved" as const,
      user: {
        name: submission.user.name,
        initials: submission.user.initials,
        avatar: submission.user.avatar,
        level: calculateLevel(lifetimePoints.get(submission.userId) ?? 0),
      },
      username: `@${submission.user.name}`,
      action: "hat die Challenge gelöst",
      challenge: submission.challenge.title,
      points: submission.challenge.points,
      time: formatRelativeTime(submission.createdAt),
      createdAt: submission.createdAt.toISOString(),
      ...(levelUp
        ? {
            levelUp: {
              previousLevel: levelUp.previousLevel,
              newLevel: levelUp.newLevel,
            },
          }
        : {}),
    };
  });

  return NextResponse.json({ items, nextCursor });
}
