import { NextRequest, NextResponse } from "next/server";
import type { RankingEntry } from "@/lib/api";

const todayRanking: RankingEntry[] = [
  { rank: 1, previousRank: 1, name: "Anna Schmidt", initials: "AS", points: 150, time: "4:23", team: "Frontend", avatar: "/user/chibi1.png", level: 15 },
  { rank: 2, previousRank: 4, name: "Tom Weber", initials: "TW", points: 145, time: "5:12", team: "Backend", avatar: "/user/chibi2.png", level: 14 },
  { rank: 3, previousRank: 2, name: "Lisa Müller", initials: "LM", points: 140, time: "5:45", team: "Frontend", avatar: "/user/chibi3.png", level: 13 },
  { rank: 4, previousRank: 3, name: "Jan Becker", initials: "JB", points: 130, time: "6:02", team: "DevOps", avatar: "/user/minipix2.png", level: 12 },
  { rank: 5, previousRank: 7, name: "Sarah Klein", initials: "SK", points: 125, time: "6:30", team: "Mobile", avatar: "/user/minipix4.png", level: 11 },
  { rank: 6, previousRank: 5, name: "Max Mustermann", initials: "MM", points: 120, time: "7:15", team: "Frontend", avatar: "/user/minipix5.png", level: 12 },
  { rank: 7, previousRank: 8, name: "Julia Fischer", initials: "JF", points: 115, time: "7:45", team: "Backend", avatar: "/user/minipix6.png", level: 10 },
  { rank: 8, previousRank: 6, name: "Peter Hoffmann", initials: "PH", points: 110, time: "8:20", team: "QA", avatar: "/user/pony2.png", level: 9 },
  { rank: 9, previousRank: 9, name: "Maria Wagner", initials: "MW", points: 105, time: "8:55", team: "DevOps", avatar: "/user/pony3.png", level: 9 },
  { rank: 10, previousRank: 12, name: "David Schulz", initials: "DS", points: 100, time: "9:30", team: "Mobile", avatar: "/user/pony4.png", level: 8 },
];

const weeklyRanking: RankingEntry[] = [
  { rank: 1, previousRank: 2, name: "Tom Weber", initials: "TW", points: 890, challengesSolved: 7, team: "Backend", avatar: "/user/chibi2.png", level: 14 },
  { rank: 2, previousRank: 1, name: "Anna Schmidt", initials: "AS", points: 875, challengesSolved: 7, team: "Frontend", avatar: "/user/chibi1.png", level: 15 },
  { rank: 3, previousRank: 3, name: "Lisa Müller", initials: "LM", points: 820, challengesSolved: 6, team: "Frontend", avatar: "/user/chibi3.png", level: 13 },
  { rank: 4, previousRank: 5, name: "Max Mustermann", initials: "MM", points: 780, challengesSolved: 6, team: "Frontend", avatar: "/user/minipix5.png", level: 12 },
  { rank: 5, previousRank: 4, name: "Jan Becker", initials: "JB", points: 750, challengesSolved: 5, team: "DevOps", avatar: "/user/minipix2.png", level: 12 },
  { rank: 6, previousRank: 6, name: "Sarah Klein", initials: "SK", points: 720, challengesSolved: 5, team: "Mobile", avatar: "/user/minipix4.png", level: 11 },
  { rank: 7, previousRank: 9, name: "Julia Fischer", initials: "JF", points: 690, challengesSolved: 5, team: "Backend", avatar: "/user/minipix6.png", level: 10 },
  { rank: 8, previousRank: 7, name: "Peter Hoffmann", initials: "PH", points: 660, challengesSolved: 4, team: "QA", avatar: "/user/pony2.png", level: 9 },
  { rank: 9, previousRank: 8, name: "Maria Wagner", initials: "MW", points: 630, challengesSolved: 4, team: "DevOps", avatar: "/user/pony3.png", level: 9 },
  { rank: 10, previousRank: 10, name: "David Schulz", initials: "DS", points: 600, challengesSolved: 4, team: "Mobile", avatar: "/user/pony4.png", level: 8 },
];

const monthlyRanking: RankingEntry[] = [
  { rank: 1, previousRank: 1, name: "Anna Schmidt", initials: "AS", points: 3450, challengesSolved: 28, team: "Frontend", avatar: "/user/chibi1.png", level: 15 },
  { rank: 2, previousRank: 3, name: "Tom Weber", initials: "TW", points: 3280, challengesSolved: 27, team: "Backend", avatar: "/user/chibi2.png", level: 14 },
  { rank: 3, previousRank: 2, name: "Lisa Müller", initials: "LM", points: 3100, challengesSolved: 26, team: "Frontend", avatar: "/user/chibi3.png", level: 13 },
  { rank: 4, previousRank: 4, name: "Max Mustermann", initials: "MM", points: 2950, challengesSolved: 24, team: "Frontend", avatar: "/user/minipix5.png", level: 12 },
  { rank: 5, previousRank: 6, name: "Jan Becker", initials: "JB", points: 2800, challengesSolved: 23, team: "DevOps", avatar: "/user/minipix2.png", level: 12 },
  { rank: 6, previousRank: 5, name: "Sarah Klein", initials: "SK", points: 2650, challengesSolved: 22, team: "Mobile", avatar: "/user/minipix4.png", level: 11 },
  { rank: 7, previousRank: 7, name: "Julia Fischer", initials: "JF", points: 2500, challengesSolved: 21, team: "Backend", avatar: "/user/minipix6.png", level: 10 },
  { rank: 8, previousRank: 8, name: "Peter Hoffmann", initials: "PH", points: 2350, challengesSolved: 20, team: "QA", avatar: "/user/pony2.png", level: 9 },
  { rank: 9, previousRank: 10, name: "Maria Wagner", initials: "MW", points: 2200, challengesSolved: 19, team: "DevOps", avatar: "/user/pony3.png", level: 9 },
  { rank: 10, previousRank: 9, name: "David Schulz", initials: "DS", points: 2050, challengesSolved: 18, team: "Mobile", avatar: "/user/pony4.png", level: 8 },
];

const teamRanking: RankingEntry[] = [
  { rank: 1, previousRank: 1, name: "Team Frontend", initials: "TF", points: 9500, challengesSolved: 78, avatar: "/user/pony2.png", level: 25 },
  { rank: 2, previousRank: 2, name: "Team Backend", initials: "TB", points: 8780, challengesSolved: 72, avatar: "/user/minipix2.png", level: 23 },
  { rank: 3, previousRank: 4, name: "Team DevOps", initials: "TD", points: 7650, challengesSolved: 65, avatar: "/user/pony3.png", level: 21 },
  { rank: 4, previousRank: 3, name: "Team Mobile", initials: "TM", points: 7200, challengesSolved: 60, avatar: "/user/minipix4.png", level: 20 },
  { rank: 5, previousRank: 5, name: "Team QA", initials: "TQ", points: 5800, challengesSolved: 48, avatar: "/user/minipix5.png", level: 18 },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") ?? "today";

  const data: Record<string, RankingEntry[]> = {
    today: todayRanking,
    week: weeklyRanking,
    month: monthlyRanking,
    team: teamRanking,
  };

  return NextResponse.json(data[period] ?? todayRanking);
}
