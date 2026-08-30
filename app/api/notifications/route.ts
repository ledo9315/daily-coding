import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth-session";
import { notificationText, solutionLink } from "@/lib/notification-view";

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

function parseLimit(raw: string | null): number {
  if (!raw) return DEFAULT_LIMIT;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return DEFAULT_LIMIT;
  return Math.min(MAX_LIMIT, Math.floor(parsed));
}

export async function GET(request: Request) {
  const session = await getSessionUserId();
  if (session.error) return session.error;
  const { userId } = session;

  const limit = parseLimit(new URL(request.url).searchParams.get("limit"));

  const [rows, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit,
      select: {
        id: true,
        kind: true,
        challengeId: true,
        codeHash: true,
        readAt: true,
        createdAt: true,
        actor: { select: { name: true, initials: true, avatar: true } },
        challenge: { select: { title: true } },
      },
    }),
    prisma.notification.count({ where: { userId, readAt: null } }),
  ]);

  return NextResponse.json({
    // The sentence is assembled here rather than in the bell: the mail needs the same
    // wording, and one source keeps the two from drifting.
    items: rows.map((row) => ({
      id: row.id,
      kind: row.kind,
      text: notificationText(row.kind, row.actor.name, row.challenge.title),
      actor: {
        name: row.actor.name,
        initials: row.actor.initials,
        avatar: row.actor.avatar,
      },
      href: solutionLink(row.challengeId, row.codeHash),
      read: row.readAt !== null,
      createdAt: row.createdAt.toISOString(),
    })),
    unreadCount,
  });
}
