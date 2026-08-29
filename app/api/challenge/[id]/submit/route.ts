import { NextRequest, NextResponse } from "next/server";
import { CodeLanguage } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth-session";
import { parseCodeLanguage, normalizeSupportedLanguages } from "@/lib/challenge-languages";
import { runChallengeTests } from "@/lib/server/challenge-execution";
import {
  findDailyChallengeForApp,
  findTodaySubmission,
  utcDayRange,
} from "@/lib/server/challenge-day";
import { computeConsecutiveStreakDays } from "@/lib/server/streak";
import { persistAchievementUnlocks } from "@/lib/server/achievement-unlocks";
import { checkRateLimit } from "@/lib/server/rate-limiter";
import { codeHash } from "@/lib/server/code-hash";
import {
  codeExceedsLimit,
  MAX_CHALLENGE_REQUEST_BYTES,
  requestBodyExceedsLimit,
} from "@/lib/server/request-security";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await getSessionUserId();
  if (result.error) return result.error;
  const { userId } = result;

  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });
  if (!dbUser) {
    return NextResponse.json(
      {
        error:
          "Dein Login passt nicht zur Datenbank (z. B. nach migrate/seed). Bitte abmelden und erneut anmelden.",
      },
      { status: 401 }
    );
  }

  const { id: challengeId } = await params;
  if (requestBodyExceedsLimit(request, MAX_CHALLENGE_REQUEST_BYTES)) {
    return NextResponse.json({ error: "Code ist zu lang." }, { status: 413 });
  }

  if (!(await checkRateLimit(`challenge-submit:${userId}`, 5, 60_000))) {
    return NextResponse.json({ error: "Zu viele Abgaben. Bitte kurz warten." }, { status: 429 });
  }

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const code: string = typeof body.code === "string" ? body.code : "";
  if (codeExceedsLimit(code)) {
    return NextResponse.json({ error: "Code ist zu lang." }, { status: 413 });
  }

  const challenge = await findDailyChallengeForApp();
  if (!challenge || challenge.id !== challengeId) {
    return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
  }

  const allowed = normalizeSupportedLanguages(
    challenge.supportedLanguages as unknown as string[]
  );
  const language = parseCodeLanguage(body.language, allowed);
  if (!language) {
    return NextResponse.json(
      { error: "Ungültige oder nicht unterstützte Sprache für diese Challenge." },
      { status: 400 }
    );
  }

  // Scoped to this challenge, not just to the day: the ring can move on within a UTC day
  // when the live challenge is deactivated, and an unscoped row would let the "stays
  // passed" rule below carry a solve over to a challenge that was never solved.
  const alreadyToday = await findTodaySubmission(userId, challengeId);

  const { testCases: testResults, runtimeOk, compileError } = await runChallengeTests(
    challenge,
    code,
    language,
    "submit"
  );

  // Once passed, it stays passed: rewriting a green solution and breaking it must not
  // cost the points and the streak that were already earned today.
  const status = runtimeOk || alreadyToday?.status === "completed" ? "completed" : "failed";
  const submissionDay = utcDayRange().gte;
  const storedResults = testResults as unknown as Parameters<
    typeof prisma.submission.create
  >[0]["data"]["testResults"];

  // A re-submission overwrites today's row rather than adding one (#200). The day keeps
  // exactly one submission, so points, level and streak still count it once.
  const submission = await prisma.submission.upsert({
    where: { userId_submissionDay: { userId, submissionDay } },
    create: {
      userId,
      challengeId,
      code,
      codeHash: codeHash(code),
      language: language as CodeLanguage,
      status,
      submissionDay,
      testResults: storedResults,
    },
    update: {
      challengeId,
      code,
      codeHash: codeHash(code),
      language: language as CodeLanguage,
      status,
      testResults: storedResults,
    },
    select: { id: true },
  });

  let unlockedAchievements: { id: string; title: string; description: string }[] = [];

  if (runtimeOk) {
    const newStreak = await computeConsecutiveStreakDays(userId);
    const u = await prisma.user.findUnique({
      where: { id: userId },
      select: { streakRecord: true },
    });
    await prisma.user.update({
      where: { id: userId },
      data: {
        streak: newStreak,
        streakRecord: Math.max(u?.streakRecord ?? 0, newStreak),
      },
    });

    // After the streak update, because two of the rules read `streakRecord`. Freezes what
    // has been reached so a later re-submission cannot recompute it away (#205).
    const unlockedIds = await persistAchievementUnlocks(prisma, userId);
    if (unlockedIds.length > 0) {
      unlockedAchievements = await prisma.achievementDef.findMany({
        where: { id: { in: unlockedIds } },
        select: { id: true, title: true, description: true },
      });
    }
  }

  return NextResponse.json({
    success: runtimeOk,
    // The stored status, which a failed retry on an already solved day leaves at
    // "completed" — the panel would otherwise claim a failure until the next reload.
    status,
    submissionId: submission.id,
    // Decided here rather than on the client so a reload between two attempts cannot
    // make a retry look like the first solve of the day.
    firstSolveToday: runtimeOk && alreadyToday?.status !== "completed",
    unlockedAchievements,
    testCases: testResults,
    language,
    ...(compileError ? { compileError } : {}),
  });
}
