import { NextRequest, NextResponse } from "next/server";
import type { ChallengeTestCase } from "@/lib/api";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await params; // consume params — stub endpoint ignores challengeId and code

  // Stub: simulate test execution results
  const testCases: ChallengeTestCase[] = [
    { id: 1, name: "Test Case 1: Einfaches Array", status: "passed", time: "12ms" },
    { id: 2, name: "Test Case 2: Leeres Array", status: "passed", time: "8ms" },
    {
      id: 3,
      name: "Test Case 3: Negative Zahlen",
      status: "failed",
      input: "[-1, -2, -3]",
      expected: "[-1, -3, -6]",
      actual: "[-1, -2, -3]",
      time: "10ms",
    },
    { id: 4, name: "Test Case 4: Großes Array", status: "passed", time: "45ms" },
    { id: 5, name: "Test Case 5: Edge Cases", status: "pending" },
  ];

  return NextResponse.json({ testCases });
}
