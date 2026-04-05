import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const CURRENT_USER_ID = "user-max";

export async function GET() {
  const today = new Date("2026-04-05");

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: CURRENT_USER_ID },
    include: {
      achievements: { orderBy: { createdAt: "asc" } },
      submissions: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { challenge: true },
      },
    },
  });

  const todayRank = await prisma.rankingEntry.findUnique({
    where: { userId_period_periodDate: { userId: CURRENT_USER_ID, period: "today", periodDate: today } },
  });

  const formatTime = (seconds: number | null) => {
    if (!seconds) return "-";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  return NextResponse.json({
    id: user.id,
    name: user.name.toUpperCase(),
    initials: user.initials,
    avatar: user.avatar,
    role: user.role,
    stats: {
      rank: todayRank ? `#${todayRank.rank}` : "#-",
      points: user.points.toLocaleString("de-DE"),
      streak: user.streak,
      streakRecord: user.streakRecord,
      totalSolved: user.totalSolved,
      level: user.level,
      levelMax: 3000,
      badges: user.badges,
      badgesTotal: 6,
    },
    achievements: user.achievements.map((a: any) => ({
      id: a.id,
      title: a.title,
      description: a.description,
      iconKey: a.iconKey,
      unlocked: a.unlocked,
      rarity: a.rarity,
      unlockedAt: a.unlockedAt ? formatDate(a.unlockedAt) : undefined,
    })),
    challengeHistory: user.submissions.map((s: any) => ({
      id: s.id,
      title: s.challenge.title,
      date: formatDate(s.createdAt),
      difficulty: s.challenge.difficulty,
      status: s.status,
      points: s.challenge.points,
      time: formatTime(s.timeTaken),
      rank: s.rank ?? undefined,
    })),
  });
}
