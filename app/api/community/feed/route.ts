import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

  const now = new Date();
  const formatTime = (date: Date) => {
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
        level: s.user.level,
      },
      action: "hat die Challenge gelöst",
      challenge: s.challenge.title,
      points: s.challenge.points,
      time: formatTime(s.createdAt),
    }))
  );
}
