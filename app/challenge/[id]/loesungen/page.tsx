export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Zap } from "@nsmr/pixelart-react";
import { auth } from "@/auth";
import { Header } from "@/components/header";
import { DifficultyBadge } from "@/components/difficulty-badge";
import { PixelStar, PointsChip } from "@/components/points-chip";
import { StatsCard } from "@/components/stats-card";
import { TestResults, type TestCase } from "@/components/test-results";
import { ChallengePanels } from "@/components/challenge-result/challenge-panels";
import { ResultEffects } from "@/components/challenge-result/result-effects";
import { SolutionList } from "@/components/challenge-result/solution-list";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AnimatedFlickeringGrid } from "@/components/ui/animated-flickering-grid";
import { languageLabel, type CodeLanguageId } from "@/lib/challenge-languages";
import { formatDate } from "@/lib/format";
import { challengeResultPath } from "@/lib/navigation";
import { prisma } from "@/lib/prisma";
import { getOwnChallengeResult } from "@/lib/server/challenge-result";

// Overrides the "Aufgabe" title of app/challenge/layout.tsx.
export const metadata: Metadata = { title: "Lösungen" };

type PageProps = { params: Promise<{ id: string }> };

export default async function ChallengeResultPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=${encodeURIComponent(challengeResultPath(id))}`);
  }

  const result = await getOwnChallengeResult(session.user.id, id);
  if (!result) notFound();

  const { submission, challenge, streak, streakRecord } = result;
  const testCases = Array.isArray(submission.testResults)
    ? (submission.testResults as unknown as TestCase[])
    : [];

  // Reading the ring instead of findDailyChallengeForApp(): that call advances the ring as a
  // side effect, and opening a result page must never move the day forward.
  const rotation = await prisma.rotationState.findUnique({
    where: { id: "current" },
    select: { challengeId: true },
  });
  const isTodaysChallenge = rotation?.challengeId === challenge.id;

  const revised = submission.updatedAt.getTime() !== submission.createdAt.getTime();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <AnimatedFlickeringGrid
        className="absolute inset-x-0 top-0 z-0 h-[300px] mask-[radial-gradient(300px_circle_at_top,white,transparent)]"
        squareSize={6}
        gridGap={1}
        color="#A371F7"
        maxOpacity={0.2}
        flickerChance={0.1}
      />

      <Header />
      <ResultEffects submissionId={submission.id} />

      <main className="relative mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-pixel text-2xl uppercase tracking-tight">
                {challenge.title}
              </h1>
              <DifficultyBadge difficulty={challenge.difficulty} size="sm" />
            </div>
            <p className="text-muted-foreground uppercase tracking-wide">
              {challenge.category}
            </p>
            <p className="mt-1 text-xs text-muted-foreground/80">
              Gelöst am {formatDate(submission.createdAt)}
              {revised ? " · überarbeitet" : ""}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <PointsChip points={challenge.points} variant="highlight" size="lg" />
          </div>
        </div>

        <ChallengePanels
          description={challenge.description}
          testCases={challenge.testCases}
        />

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <StatsCard title="PUNKTE" value={challenge.points} icon={PixelStar} />
          <StatsCard
            title="STREAK"
            value={streak}
            description={`Rekord: ${streakRecord}`}
            icon={Zap}
          />
        </div>

        <Card className="mt-6">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-pixel text-sm uppercase tracking-wide">Dein Code</h2>
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              {languageLabel(submission.language as CodeLanguageId)}
            </span>
          </div>
          <pre className="max-h-[32rem] overflow-auto border border-border bg-background p-4 font-code text-xs leading-relaxed sm:text-sm">
            <code>{submission.code}</code>
          </pre>
        </Card>

        {testCases.length > 0 && <TestResults testCases={testCases} className="mt-6" />}

        <SolutionList challengeId={challenge.id} />

        {isTodaysChallenge && (
          <div className="mt-6">
            <Button asChild className="pixel-btn w-full rounded-none sm:w-fit">
              <Link href="/challenge">Lösung verbessern</Link>
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
