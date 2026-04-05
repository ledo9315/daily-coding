import { NextResponse } from "next/server";
import type { RankingEntry } from "@/lib/api";

const todayPreview: RankingEntry[] = [
  { rank: 1, name: "Anna Schmidt", initials: "AS", points: 150, time: "4:23", avatar: "/user/chibi1.png", level: 15 },
  { rank: 2, name: "Tom Weber", initials: "TW", points: 145, time: "5:12", avatar: "/user/chibi2.png", level: 14 },
  { rank: 3, name: "Lisa Müller", initials: "LM", points: 140, time: "5:45", avatar: "/user/chibi3.png", level: 13 },
  { rank: 4, name: "Jan Becker", initials: "JB", points: 130, time: "6:02", avatar: "/user/minipix2.png", level: 12 },
  { rank: 5, name: "Sarah Klein", initials: "SK", points: 125, time: "6:30", avatar: "/user/minipix4.png", level: 11 },
];

const teamPreview: RankingEntry[] = [
  { rank: 1, name: "Team Frontend", initials: "TF", points: 2450, avatar: "/user/pony2.png", level: 25 },
  { rank: 2, name: "Team Backend", initials: "TB", points: 2280, avatar: "/user/minipix2.png", level: 23 },
  { rank: 3, name: "Team DevOps", initials: "TD", points: 2150, avatar: "/user/pony3.png", level: 21 },
  { rank: 4, name: "Team Mobile", initials: "TM", points: 1980, avatar: "/user/minipix4.png", level: 20 },
  { rank: 5, name: "Team QA", initials: "TQ", points: 1850, avatar: "/user/minipix5.png", level: 18 },
];

export async function GET() {
  return NextResponse.json({ today: todayPreview, team: teamPreview });
}
