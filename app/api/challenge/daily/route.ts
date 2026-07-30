import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  findDailyChallengeForApp,
  findTodaySubmission,
  publicSubmissionStatus,
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
  } | null = null;

  if (userId) {
    // Startzeit der Bearbeitung: nur beim ersten Abruf, spätere Aufrufe (Polling,
    // Reload) lassen sie unverändert — `skipDuplicates` gegen den Primärschlüssel.
    await prisma.challengeStart.createMany({
      data: [{ userId, challengeId: challenge.id }],
      skipDuplicates: true,
    });
    const start = await prisma.challengeStart.findUnique({
      where: { userId_challengeId: { userId, challengeId: challenge.id } },
      select: { startedAt: true },
    });
    startedAt = start?.startedAt.toISOString() ?? null;

    const sub = await findTodaySubmission(userId, challenge.id);

    if (sub) {
      const submittedAt = sub.createdAt.toISOString();
      todaySubmission = {
        status: publicSubmissionStatus(sub.status),
        submittedAt,
        code: sub.code,
        language: sub.language,
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
    /** Eingeloggt: Abgabe heute (UTC) für diese Challenge, sonst null. */
    todaySubmission,
    /** Serverseitiger Start der Bearbeitung (ISO), sonst null. */
    startedAt,
  });
}
