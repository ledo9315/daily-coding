import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateLevel } from "@/lib/level";
import { computeLevelUpBySubmissionId } from "@/lib/server/community-feed-level";

const DEFAULT_LIMIT = 15;
const MAX_LIMIT = 50;

function parseLimit(raw: string | null): number {
  if (!raw) return DEFAULT_LIMIT;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) return DEFAULT_LIMIT;
  return Math.min(MAX_LIMIT, Math.floor(n));
}

function emailToUsername(email: string): string {
  const local = email.split("@")[0]?.trim();
  if (!local) return "@user";
  return `@${local}`;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor")?.trim() || undefined;
  const limit = parseLimit(searchParams.get("limit"));
  const take = limit + 1;

  const submissions = await prisma.submission.findMany({
    where: { status: "completed" },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    include: {
      user: true,
      challenge: { select: { title: true, points: true } },
    },
  });

  const hasMore = submissions.length > limit;
  const page = hasMore ? submissions.slice(0, limit) : submissions;
  const nextCursor = hasMore && page.length > 0 ? page[page.length - 1].id : null;

  const userIds = [...new Set(page.map((s) => s.userId))];

  const orderedSubs =
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
  for (const r of orderedSubs) {
    lifetimePoints.set(
      r.userId,
      (lifetimePoints.get(r.userId) ?? 0) + r.challenge.points,
    );
  }

  const levelUpMap = computeLevelUpBySubmissionId(
    page.map((s) => ({
      id: s.id,
      userId: s.userId,
      challenge: { points: s.challenge.points },
    })),
    orderedSubs,
  );

  const now = new Date();
  const formatRelativeTime = (date: Date) => {
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 60) return `vor ${diffMin} Minuten`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `vor ${diffH} Stunde${diffH > 1 ? "n" : ""}`;
    return `vor ${Math.floor(diffH / 24)} Tagen`;
  };

  const items = page.map((s) => {
    const lu = levelUpMap.get(s.id);
    return {
      id: s.id,
      kind: "challenge-solved" as const,
      user: {
        name: s.user.name,
        initials: s.user.initials,
        avatar: s.user.avatar,
        level: calculateLevel(lifetimePoints.get(s.userId) ?? 0),
      },
      username: emailToUsername(s.user.email),
      action: "hat die Challenge gelöst",
      challenge: s.challenge.title,
      points: s.challenge.points,
      time: formatRelativeTime(s.createdAt),
      createdAt: s.createdAt.toISOString(),
      ...(lu
        ? {
            levelUp: {
              previousLevel: lu.previousLevel,
              newLevel: lu.newLevel,
            },
          }
        : {}),
    };
  });

  return NextResponse.json({ items, nextCursor });
}
