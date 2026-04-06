import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { findDailyChallengeForApp } from "@/lib/server/challenge-day";
import {
  normalizeStarterCodes,
  normalizeSupportedLanguages,
} from "@/lib/challenge-languages";
import { stripTestCaseSecretsForClient } from "@/lib/server/public-challenge";
import { startOfUtcDay } from "@/lib/server/ranking-period";

export async function GET() {
  const challenge = await findDailyChallengeForApp();

  if (!challenge) {
    return NextResponse.json({ error: "No active challenge" }, { status: 404 });
  }

  const supportedLanguages = normalizeSupportedLanguages(
    challenge.supportedLanguages as unknown as string[]
  );
  const starterCodes = normalizeStarterCodes(
    challenge.starterCodes,
    supportedLanguages,
    challenge.starterCode
  );
  const defaultLanguage = supportedLanguages[0];

  const session = await auth();
  const userId = session?.user?.id;

  let todaySubmission: {
    status: "completed" | "failed" | "pending";
    submittedAt: string;
  } | null = null;

  if (userId) {
    const dayStart = startOfUtcDay(new Date());
    const dayEnd = new Date(dayStart);
    dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);

    const sub = await prisma.submission.findFirst({
      where: {
        userId,
        challengeId: challenge.id,
        createdAt: { gte: dayStart, lt: dayEnd },
      },
      select: { status: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });

    if (sub) {
      const submittedAt = sub.createdAt.toISOString();
      if (sub.status === "completed") {
        todaySubmission = { status: "completed", submittedAt };
      } else if (sub.status === "failed") {
        todaySubmission = { status: "failed", submittedAt };
      } else {
        todaySubmission = { status: "pending", submittedAt };
      }
    }
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
    testCases: stripTestCaseSecretsForClient(challenge.testCases),
    supportedLanguages,
    defaultLanguage,
    starterCodes,
    /** @deprecated Use starterCodes + defaultLanguage */
    starterCode: starterCodes[defaultLanguage] ?? "",
    /** Eingeloggt: Abgabe heute (UTC) für diese Challenge, sonst null. */
    todaySubmission,
  });
}
