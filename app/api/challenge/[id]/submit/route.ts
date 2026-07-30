import { NextRequest, NextResponse } from "next/server";
import { CodeLanguage } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth-session";
import { parseCodeLanguage, normalizeSupportedLanguages } from "@/lib/challenge-languages";
import { runChallengeTests } from "@/lib/server/challenge-execution";
import { findTodaySubmission, utcDayRange } from "@/lib/server/challenge-day";
import { computeConsecutiveStreakDays } from "@/lib/server/streak";

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
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const code: string = typeof body.code === "string" ? body.code : "";

  const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } });
  if (!challenge) {
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

  const alreadyToday = await findTodaySubmission(userId, challengeId);

  if (alreadyToday) {
    return NextResponse.json(
      {
        error:
          "Du hast diese Challenge heute (UTC) bereits abgegeben. Eine erneute Abgabe ist erst morgen möglich.",
      },
      { status: 409 },
    );
  }

  const { testCases: testResults, runtimeOk } = await runChallengeTests(
    challenge,
    code,
    language,
    "submit"
  );

  await prisma.submission.create({
    data: {
      userId,
      challengeId,
      code,
      language: language as CodeLanguage,
      status: runtimeOk ? "completed" : "failed",
      testResults: testResults as unknown as Parameters<typeof prisma.submission.create>[0]["data"]["testResults"],
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
    testCases: testResults,
    language,
    ...(celebration ? { celebration } : {}),
  });
}
