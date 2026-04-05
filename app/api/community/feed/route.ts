import { NextResponse } from "next/server";
import type { CommunityFeedItem } from "@/lib/api";

const feed: CommunityFeedItem[] = [
  {
    id: "1",
    user: { name: "Anna Schmidt", initials: "AS", avatar: "/user/chibi1.png", level: 15 },
    action: "hat die Challenge gelöst",
    challenge: "Array Manipulation",
    points: 150,
    time: "vor 5 Minuten",
  },
  {
    id: "2",
    user: { name: "Tom Weber", initials: "TW", avatar: "/user/chibi2.png", level: 14 },
    action: "hat einen neuen Streak-Rekord erreicht",
    time: "vor 12 Minuten",
  },
  {
    id: "3",
    user: { name: "Lisa Müller", initials: "LM", avatar: "/user/chibi3.png", level: 13 },
    action: "hat die Challenge gelöst",
    challenge: "Binary Search",
    points: 120,
    time: "vor 28 Minuten",
  },
  {
    id: "4",
    user: { name: "Jan Becker", initials: "JB", avatar: "/user/minipix2.png", level: 12 },
    action: "hat ein Achievement freigeschaltet",
    time: "vor 45 Minuten",
  },
  {
    id: "5",
    user: { name: "Sarah Klein", initials: "SK", avatar: "/user/minipix4.png", level: 11 },
    action: "hat die Challenge gelöst",
    challenge: "String Reversal",
    points: 100,
    time: "vor 1 Stunde",
  },
];

export async function GET() {
  return NextResponse.json(feed);
}
