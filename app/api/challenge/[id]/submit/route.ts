import { NextRequest, NextResponse } from "next/server";
import { CodeLanguage } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth-session";
import { parseCodeLanguage, normalizeSupportedLanguages } from "@/lib/challenge-languages";
import { runChallengeTests } from "@/lib/server/challenge-execution";
import { startOfUtcDay } from "@/lib/server/ranking-period";
import { computeConsecutiveStreakDays } from "@/lib/server/streak";

const MAX_SOLVE_DURATION_SECONDS = 7 * 24 * 3600;

function parseSolveDurationSeconds(body: Record<string, unknown>): number | null {
  const v = body.solveDurationSeconds;
  if (typeof v !== "number" || !Number.isFinite(v)) return null;
  const s = Math.floor(v);
  if (s < 0) return null;
  return Math.min(s, MAX_SOLVE_DURATION_SECONDS);
}

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

  const dayStart = startOfUtcDay(new Date());
  const dayEnd = new Date(dayStart);
  dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);

  const alreadyToday = await prisma.submission.findFirst({
    where: {
      userId,
      challengeId,
      createdAt: { gte: dayStart, lt: dayEnd },
    },
    select: { id: true },
  });

  if (alreadyToday) {
    return NextResponse.json(
      {
        error:
          "Du hast diese Challenge heute (UTC) bereits abgegeben. Eine erneute Abgabe ist erst morgen möglich.",
      },
      { status: 409 },
    );
  }

  const { testCases: testResults, runtimeOk, totalDurationMs } = await runChallengeTests(
    challenge,
    code,
    language,
    "submit"
  );

  const clientSolveSeconds = parseSolveDurationSeconds(body);
  const executionSeconds =
    totalDurationMs > 0 ? Math.max(1, Math.ceil(totalDurationMs / 1000)) : null;

  /** Anzeige: bevorzugt Wandzeit seit Challenge-Start (Client); sonst Sandbox-Summe. */
  let timeTakenSeconds: number | null = null;
  if (clientSolveSeconds != null) {
    timeTakenSeconds = clientSolveSeconds === 0 ? 1 : clientSolveSeconds;
  } else if (executionSeconds != null) {
    timeTakenSeconds = executionSeconds;
  }

  await prisma.submission.create({
    data: {
      userId,
      challengeId,
      code,
      language: language as CodeLanguage,
      status: runtimeOk ? "completed" : "failed",
      timeTaken: timeTakenSeconds,
      testResults: testResults as unknown as Parameters<typeof prisma.submission.create>[0]["data"]["testResults"],
    },
  });

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
  }

  return NextResponse.json({
    success: runtimeOk,
    testCases: testResults,
    language,
  });
}
