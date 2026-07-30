import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  findDailyChallengeForApp,
  findTodaySubmission,
  publicSubmissionStatus,
  utcDayRange,
} from "@/lib/server/challenge-day";
import {
  normalizeStarterCodes,
  normalizeSupportedLanguages,
} from "@/lib/challenge-languages";
import { stripTestCaseSecretsForClient } from "@/lib/server/public-challenge";

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

  let startedAt: string | null = null;
  let todaySubmission: {
    status: "completed" | "failed" | "pending";
    submittedAt: string;
    code: string;
    language: string;
    /** Graded test cases of the submission; null for legacy rows without stored results. */
    testResults: unknown;
  } | null = null;

  if (userId) {
    // Start of work — scoped **per UTC day**. Within the day, polling and reloads
    // leave it untouched; if it comes from an earlier day (the same challenge
    // returns in the rotation cycle), it is renewed.
    const existingStart = await prisma.challengeStart.findUnique({
      where: { userId_challengeId: { userId, challengeId: challenge.id } },
      select: { startedAt: true },
    });
    const start =
      existingStart && existingStart.startedAt >= utcDayRange().gte
        ? existingStart
        : await prisma.challengeStart.upsert({
            where: { userId_challengeId: { userId, challengeId: challenge.id } },
            create: { userId, challengeId: challenge.id },
            update: { startedAt: new Date() },
            select: { startedAt: true },
          });
    startedAt = start.startedAt.toISOString();

    const sub = await findTodaySubmission(userId, challenge.id);

    if (sub) {
      const submittedAt = sub.createdAt.toISOString();
      todaySubmission = {
        status: publicSubmissionStatus(sub.status),
        submittedAt,
        code: sub.code,
        language: sub.language,
        testResults: Array.isArray(sub.testResults) ? sub.testResults : null,
      };
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
    /** When signed in: today's (UTC) submission for this challenge, else null. */
    todaySubmission,
    /** Server-side start of work (ISO), else null. */
    startedAt,
  });
}
