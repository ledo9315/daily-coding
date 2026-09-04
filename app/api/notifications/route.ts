import { NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth-session";
import { localizeChallengeTitles } from "@/lib/server/content-translations";
import { NOTIFICATION_MESSAGE_KEYS, solutionLink } from "@/lib/notification-view";

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

  // The sentence is assembled here rather than in the bell: the mail needs the same
  // wording, and one key set keeps the two from drifting - hence the `email` namespace.
  const t = await getTranslations("email");
  const titles = await localizeChallengeTitles(rows.map((row) => row.challengeId));

  return NextResponse.json({
    items: rows.map((row) => ({
      id: row.id,
      kind: row.kind,
      text: t(NOTIFICATION_MESSAGE_KEYS[row.kind], {
        actor: row.actor.name,
        challenge: titles.get(row.challengeId) ?? row.challenge.title,
      }),
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
