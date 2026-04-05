import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const challenge = await prisma.challenge.findFirst({
    where: { isActive: true },
    orderBy: { date: "desc" },
  });

  if (!challenge) {
    return NextResponse.json({ error: "No active challenge" }, { status: 404 });
  }

  return NextResponse.json({
    title: challenge.title.toUpperCase(),
    description: challenge.description,
    difficulty: challenge.difficulty,
    points: challenge.points,
    category: challenge.category.split(" •")[0].toUpperCase(),
  });
}
