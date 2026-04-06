import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateLevel } from "@/lib/level";
import { getLifetimePointsByUserIds } from "@/lib/server/user-points";

export async function GET() {
  const submissions = await prisma.submission.findMany({
    where: { status: "completed" },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: {
      user: true,
      challenge: { select: { title: true, points: true } },
    },
  });

  const userIds = [...new Set(submissions.map((s) => s.userId))];
  const lifetimePoints = await getLifetimePointsByUserIds(userIds);

  const now = new Date();
  const formatRelativeTime = (date: Date) => {
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 60) return `vor ${diffMin} Minuten`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `vor ${diffH} Stunde${diffH > 1 ? "n" : ""}`;
    return `vor ${Math.floor(diffH / 24)} Tagen`;
  };

  return NextResponse.json(
    submissions.map((s) => ({
      id: s.id,
      user: {
        name: s.user.name,
        initials: s.user.initials,
        avatar: s.user.avatar,
        level: calculateLevel(lifetimePoints.get(s.userId) ?? 0),
      },
      action: "hat die Challenge gelöst",
      challenge: s.challenge.title,
      points: s.challenge.points,
      time: formatRelativeTime(s.createdAt),
    }))
  );
}
