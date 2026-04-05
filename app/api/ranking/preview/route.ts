import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const today = new Date("2026-04-05");

  const [todayEntries, teamEntries] = await Promise.all([
    prisma.rankingEntry.findMany({
      where: { period: "today", periodDate: today, userId: { not: null } },
      orderBy: { rank: "asc" },
      take: 5,
      include: { user: true },
    }),
    prisma.rankingEntry.findMany({
      where: { period: "team", periodDate: today, teamId: { not: null } },
      orderBy: { rank: "asc" },
      take: 5,
      include: { team: true },
    }),
  ]);

  return NextResponse.json({
    today: todayEntries.map((e: any) => ({
      rank: e.rank,
      name: e.user!.name,
      initials: e.user!.initials,
      points: e.points,
      time: e.timeTaken ?? undefined,
      avatar: e.user!.avatar,
      level: e.user!.level,
    })),
    team: teamEntries.map((e: any) => ({
      rank: e.rank,
      name: e.team!.name,
      initials: e.team!.initials,
      points: e.points,
      avatar: e.team!.avatar,
      level: e.team!.level,
    })),
  });
}
