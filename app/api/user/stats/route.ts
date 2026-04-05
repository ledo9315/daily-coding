import { NextResponse } from "next/server";
import type { UserStats } from "@/lib/api";

const stats: UserStats = {
  rank: "#12",
  points: "2.450",
  streak: 12,
  streakRecord: 28,
  teamRank: "#2",
  teamName: "Team Frontend",
  totalSolved: 47,
  level: 12,
  levelMax: 3000,
  badges: 4,
  badgesTotal: 6,
};

export async function GET() {
  return NextResponse.json(stats);
}
