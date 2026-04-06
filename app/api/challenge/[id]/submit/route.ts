import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { ChallengeTestCase } from "@/lib/api";
import { CURRENT_USER_ID } from "@/lib/server/app-config";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: challengeId } = await params;
  const body = await request.json();
  const code: string = body.code ?? "";

  const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } });
  if (!challenge) {
    return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
  }

  // Stub: simulate test execution
  const testResults: ChallengeTestCase[] = [
    { id: 1, name: "Test Case 1: Einfaches Array", status: "passed", time: "12ms" },
    { id: 2, name: "Test Case 2: Leeres Array", status: "passed", time: "8ms" },
    { id: 3, name: "Test Case 3: Negative Zahlen", status: "passed", time: "10ms" },
    { id: 4, name: "Test Case 4: Großes Array", status: "passed", time: "45ms" },
    { id: 5, name: "Test Case 5: Edge Cases", status: "passed", time: "5ms" },
  ];

  await prisma.submission.create({
    data: {
      userId: CURRENT_USER_ID,
      challengeId,
      code,
      status: "completed",
      testResults: testResults as unknown as Parameters<typeof prisma.submission.create>[0]["data"]["testResults"],
    },
  });

  return NextResponse.json({ success: true, testCases: testResults });
}
