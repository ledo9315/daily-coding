import { NextResponse } from "next/server";
import { findDailyChallengeForApp } from "@/lib/server/challenge-day";

export async function GET() {
  const challenge = await findDailyChallengeForApp();

  if (!challenge) {
    return NextResponse.json({ error: "No active challenge" }, { status: 404 });
  }

  return NextResponse.json({
    id: challenge.id,
    title: challenge.title,
    description: challenge.description,
    difficulty: challenge.difficulty,
    points: challenge.points,
    category: challenge.category.name,
    hint: challenge.hint ?? "",
    examples: challenge.examples,
    testCases: challenge.testCases,
    starterCode: challenge.starterCode ?? "",
  });
}
