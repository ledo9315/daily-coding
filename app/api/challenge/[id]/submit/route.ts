import { NextRequest, NextResponse } from "next/server";
import { CodeLanguage } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth-session";
import { parseCodeLanguage, normalizeSupportedLanguages } from "@/lib/challenge-languages";
import { runChallengeTests } from "@/lib/server/challenge-execution";
import { findTodaySubmission, utcDayRange } from "@/lib/server/challenge-day";
import { computeConsecutiveStreakDays } from "@/lib/server/streak";

const MAX_SOLVE_DURATION_SECONDS = 7 * 24 * 3600;

/**
 * Lösezeit aus dem serverseitigen Startzeitpunkt (`ChallengeStart`, gesetzt beim
 * ersten Abruf der Challenge). Bewusst NICHT aus dem Request-Body: die Zeit
 * entscheidet über die Platzierung in der Rangliste, ein Client-Wert wäre frei
 * wählbar. Ohne Startzeitpunkt (z. B. Abgabe ohne vorherigen Abruf) → null,
 * dann greift die Sandbox-Laufzeit als Näherung.
 */
async function serverSolveDurationSeconds(
  userId: string,
  challengeId: string
): Promise<number | null> {
  const start = await prisma.challengeStart.findUnique({
    where: { userId_challengeId: { userId, challengeId } },
    select: { startedAt: true },
  });
  if (!start) return null;
  // Startzeitpunkt aus einem Vortag ignorieren — sonst landet eine Lösezeit von
  // vielen Stunden als Sortierschlüssel in der Rangliste (#68).
  if (start.startedAt < utcDayRange().gte) return null;
  const seconds = Math.floor((Date.now() - start.startedAt.getTime()) / 1000);
  if (seconds < 0) return null;
  return Math.min(Math.max(1, seconds), MAX_SOLVE_DURATION_SECONDS);
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

  const { testCases: testResults, runtimeOk, totalDurationMs } = await runChallengeTests(
    challenge,
    code,
    language,
    "submit"
  );

  const solveSeconds = await serverSolveDurationSeconds(userId, challengeId);
  const executionSeconds =
    totalDurationMs > 0 ? Math.max(1, Math.ceil(totalDurationMs / 1000)) : null;

  /** Rangliste: Wandzeit seit dem serverseitigen Start; sonst Sandbox-Summe. */
  const timeTakenSeconds = solveSeconds ?? executionSeconds;

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

  let celebration:
    | {
        timeTakenSeconds: number;
        streak: number;
        streakRecord: number;
        avgSolveTimeTodaySeconds: number | null;
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

    const today = utcDayRange();
    const [avgAgg, completionsToday] = await Promise.all([
      prisma.submission.aggregate({
        where: {
          challengeId,
          status: "completed",
          createdAt: today,
          timeTaken: { not: null },
        },
        _avg: { timeTaken: true },
      }),
      prisma.submission.count({
        where: {
          challengeId,
          status: "completed",
          createdAt: today,
        },
      }),
    ]);

    const avg = avgAgg._avg.timeTaken;
    celebration = {
      timeTakenSeconds: timeTakenSeconds ?? 0,
      streak: updated.streak,
      streakRecord: updated.streakRecord,
      avgSolveTimeTodaySeconds: avg != null ? Math.round(avg) : null,
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
