import { NextResponse } from "next/server";
import type { UserProfile } from "@/lib/api";

const profile: UserProfile = {
  id: "current-user",
  name: "MAX MUSTERMANN",
  initials: "MM",
  avatar: "/user/minipix4.png",
  team: "Team Frontend",
  role: "Senior Developer",
  stats: {
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
  },
  achievements: [
    { id: "1", title: "Erste Schritte", description: "Erste Challenge abgeschlossen", iconKey: "Check", unlocked: true, rarity: "common", unlockedAt: "15.01.2026" },
    { id: "2", title: "Wochenend-Krieger", description: "7 Tage Streak erreicht", iconKey: "CalendarWeek", unlocked: true, rarity: "rare", unlockedAt: "22.01.2026" },
    { id: "3", title: "Blitzschnell", description: "Challenge in unter 3 Minuten gelöst", iconKey: "Clock", unlocked: true, rarity: "rare", unlockedAt: "25.01.2026" },
    { id: "4", title: "Code-Meister", description: "10 schwere Challenges gelöst", iconKey: "Trophy", unlocked: true, rarity: "epic", unlockedAt: "28.01.2026" },
    { id: "5", title: "Unaufhaltsam", description: "30 Tage Streak erreicht", iconKey: "Zap", unlocked: false, rarity: "legendary" },
    { id: "6", title: "Perfektionist", description: "20 Challenges ohne Fehler", iconKey: "Bullseye", unlocked: false, rarity: "epic" },
  ],
  challengeHistory: [
    { id: "1", title: "Array Manipulation", date: "Heute", difficulty: "medium", status: "completed", points: 150, time: "5:23", rank: 8 },
    { id: "2", title: "String Parsing", date: "Gestern", difficulty: "easy", status: "completed", points: 100, time: "3:12", rank: 3 },
    { id: "3", title: "Binary Tree Traversal", date: "29.01.2026", difficulty: "hard", status: "failed", points: 200, time: "15:00" },
    { id: "4", title: "Hash Map Implementation", date: "28.01.2026", difficulty: "medium", status: "completed", points: 150, time: "8:45", rank: 12 },
    { id: "5", title: "Recursion Basics", date: "27.01.2026", difficulty: "easy", status: "completed", points: 100, time: "4:30", rank: 5 },
  ],
};

export async function GET() {
  return NextResponse.json(profile);
}
