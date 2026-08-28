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

  const alreadyToday = await findTodaySubmission(userId);

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
  await prisma.submission.upsert({
    where: { userId_submissionDay: { userId, submissionDay } },
    create: {
      userId,
      challengeId,
      code,
      language: language as CodeLanguage,
      status,
      submissionDay,
      testResults: storedResults,
    },
    update: {
      challengeId,
      code,
      language: language as CodeLanguage,
      status,
      testResults: storedResults,
    },
  });

  let celebration:
    | {
        streak: number;
        streakRecord: number;
        completionsToday: number;
      }
    | undefined;

  if (runtimeOk) {
    const newStreak = await computeConsecutiveStreakDays(userId);
    const u = await prisma.user.findUnique({
      where: { id: userId },
      select: { streakRecord: true },
    });
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        streak: newStreak,
        streakRecord: Math.max(u?.streakRecord ?? 0, newStreak),
      },
      select: { streak: true, streakRecord: true },
    });

    // After the streak update, because two of the rules read `streakRecord`. Freezes what
    // has been reached so a later re-submission cannot recompute it away (#205).
    await persistAchievementUnlocks(prisma, userId);

    const completionsToday = await prisma.submission.count({
      where: { challengeId, status: "completed", createdAt: utcDayRange() },
    });

    celebration = {
      streak: updated.streak,
      streakRecord: updated.streakRecord,
      completionsToday,
    };
  }

  return NextResponse.json({
    success: runtimeOk,
    // The stored status, which a failed retry on an already solved day leaves at
    // "completed" — the panel would otherwise claim a failure until the next reload.
    status,
    testCases: testResults,
    language,
    ...(compileError ? { compileError } : {}),
    ...(celebration ? { celebration } : {}),
  });
}
