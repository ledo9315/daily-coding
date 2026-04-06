import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const challenge = await prisma.challenge.findFirst({
    where: { isActive: true },
    orderBy: { date: "desc" },
    include: { category: true },
  });

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
