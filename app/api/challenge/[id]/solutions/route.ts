import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth-session";
import { calculateLevel } from "@/lib/level";
import { hasSolvedChallenge } from "@/lib/server/solution-access";
import { getLifetimePointsByUserIds } from "@/lib/server/user-points";

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;
/** Authors listed by name on a card; everyone beyond that is summed up as "+N". */
const AUTHORS_SHOWN = 5;

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
  const sort = searchParams.get("sort") === "oldest" ? "oldest" : "newest";
  const filter = searchParams.get("filter") === "mine" ? "mine" : "all";

  // The user's own solutions are part of the list and marked there (#224). The result page
  // still shows the own submission above it, because that card carries points, streak and
  // test results a solution card does not.
  const ownRows = await prisma.submission.findMany({
    where: { userId, challengeId, status: "completed", codeHash: { not: null } },
    select: { codeHash: true },
  });
  const ownHashes = new Set(ownRows.map((row) => row.codeHash as string));

  const scope = {
    challengeId,
    status: "completed" as const,
    /**
     * `not: null` skips rows written before the column existed —
     * scripts/backfill-submission-code-hash.ts fills them.
     */
    codeHash: filter === "mine" ? { in: [...ownHashes] } : { not: null },
  };

  const groups = await prisma.submission.groupBy({
    by: ["codeHash"],
    where: scope,
    _count: { _all: true },
    _min: { createdAt: true },
  });

  /**
   * Sorted and paged in memory rather than by the database.
   *
   * The sort key is an aggregate over the group, and a keyset predicate on an aggregate plus
   * a tie-break is not expressible through Prisma's `having`. Doing it here keeps the cursor
   * pointing at a *group* instead of at an offset, so a submission arriving between two pages
   * can neither duplicate a group nor push one out of the list unseen.
   *
   * ponytail: fine while a challenge has a few thousand distinct solutions; beyond that this
   * wants a keyset query over the aggregate in raw SQL.
   */
  const direction = sort === "oldest" ? -1 : 1;
  const sorted = groups
    .filter((group): group is typeof group & { codeHash: string } => group.codeHash !== null)
    .sort((a, b) => {
      const byAge = (b._min.createdAt?.getTime() ?? 0) - (a._min.createdAt?.getTime() ?? 0);
      // The tie-break flips with the direction as well: only a totally ordered list lets a
      // cursor mean the same thing on the way back.
      const byHash = a.codeHash < b.codeHash ? 1 : a.codeHash > b.codeHash ? -1 : 0;
      return (byAge || byHash) * direction;
    });

  const start = cursor ? sorted.findIndex((group) => group.codeHash === cursor) + 1 : 0;
  // A cursor whose group is gone ends the list instead of restarting it — `findIndex`
  // returns -1 there, and serving page one again would read as an endless feed.
  const page = cursor && start === 0 ? [] : sorted.slice(start, start + limit);
  const nextCursor =
    page.length > 0 && start + page.length < sorted.length
      ? page[page.length - 1].codeHash
      : null;

  // One indexed lookup per group on the page, capped by `limit`. A single query cannot bound
  // the rows per group, and an unbounded one would pull every copy of a popular solution.
  const rowsByGroup = await Promise.all(
    page.map((group) =>
      prisma.submission.findMany({
        where: { ...scope, codeHash: group.codeHash },
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        take: AUTHORS_SHOWN,
        select: {
          id: true,
          userId: true,
          code: true,
          language: true,
          createdAt: true,
          updatedAt: true,
          user: { select: { name: true, initials: true, avatar: true } },
        },
      })
    )
  );

  const lifetimePoints = await getLifetimePointsByUserIds([
    ...new Set(rowsByGroup.flat().map((row) => row.userId)),
  ]);

  const solutionGroups = page.flatMap((group, index) => {
    const rows = rowsByGroup[index];
    const [representative] = rows;
    if (!representative) return [];

    return [
      {
        codeHash: group.codeHash,
        // The oldest row of the group carries the code shown and the comment thread.
        submissionId: representative.id,
        language: representative.language,
        code: representative.code,
        createdAt: (group._min.createdAt ?? representative.createdAt).toISOString(),
        revised: representative.updatedAt.getTime() !== representative.createdAt.getTime(),
        authors: rows.map((row) => ({
          name: row.user.name,
          initials: row.user.initials,
          avatar: row.user.avatar,
          level: calculateLevel(lifetimePoints.get(row.userId) ?? 0),
        })),
        submissionCount: group._count._all,
        own: ownHashes.has(group.codeHash),
      },
    ];
  });

  return NextResponse.json({ groups: solutionGroups, nextCursor });
}
