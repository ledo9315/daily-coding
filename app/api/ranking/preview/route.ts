import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const today = new Date("2026-04-05");

  const todayEntries = await prisma.rankingEntry.findMany({
    where: { period: "today", periodDate: today, userId: { not: null } },
    orderBy: { rank: "asc" },
    take: 5,
    include: { user: true },
  });

  return NextResponse.json({
    today: todayEntries.map((e) => ({
      rank: e.rank,
      name: e.user!.name,
      initials: e.user!.initials,
      points: e.points,
      time: e.timeTaken ?? undefined,
      avatar: e.user!.avatar,
      level: e.user!.level,
    })),
  });
}
