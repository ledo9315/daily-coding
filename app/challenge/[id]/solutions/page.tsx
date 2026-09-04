export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { CodeBlock } from "@/components/code-block";
import { Header } from "@/components/header";
import { DifficultyBadge } from "@/components/difficulty-badge";
import { PointsChip } from "@/components/points-chip";
import type { TestCase } from "@/components/test-results";
import { ChallengePanels } from "@/components/challenge-result/challenge-panels";
import { ResultEffects } from "@/components/challenge-result/result-effects";
import { SolutionList } from "@/components/challenge-result/solution-list";
import { PageAmbience } from "@/components/page-ambience";
import { languageLabel, type CodeLanguageId } from "@/lib/challenge-languages";
import { formatDate } from "@/lib/format";
import { challengeResultPath } from "@/lib/navigation";
import { localizedPath } from "@/lib/site";
import { prisma } from "@/lib/prisma";
import { getOwnChallengeResult } from "@/lib/server/challenge-result";

// Overrides the title of app/challenge/layout.tsx - and its alternates, which name the
// public task page and would otherwise be inherited as this page's canonical.
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("challenge");
  return {
    title: t("meta.solutions"),
    alternates: { canonical: null, languages: {} },
  };
}

type PageProps = { params: Promise<{ id: string }> };

export default async function ChallengeResultPage({ params }: PageProps) {
  const { id } = await params;
  const t = await getTranslations("challenge");
  const locale = await getLocale();
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=${encodeURIComponent(challengeResultPath(id))}`);
  }

  const result = await getOwnChallengeResult(session.user.id, id);
  if (!result) notFound();

  const { submission, challenge } = result;
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
      <PageAmbience />

      <Header />
      <ResultEffects submissionId={submission.id} />

      <main className="relative mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="font-pixel text-xl uppercase leading-tight tracking-tight sm:text-2xl">
              {challenge.title}
            </h1>
            <p className="mt-2 text-lg uppercase tracking-wide text-muted-foreground">
              {challenge.category}
            </p>
          </div>

          {/* Difficulty and points travel together: both answer "what is this task worth". */}
          <div className="flex flex-wrap items-center gap-3 sm:shrink-0">
            <DifficultyBadge difficulty={challenge.difficulty} size="lg" />
            <PointsChip points={challenge.points} variant="highlight" size="lg" />
          </div>
        </div>

        {/*
          One line in the voice of a test runner, which is where the reader just came from.
          It replaces the two stat cards that stood here: the points are already in the chip
          above, and a streak is a property of the account, not of this solution.
        */}
        <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 border-l-4 border-primary bg-primary/[0.06] py-2 pl-3 font-code text-sm text-muted-foreground">
          <span className="font-bold text-primary">
            {languageLabel(submission.language as CodeLanguageId)}
          </span>
          <span aria-hidden className="text-border">
            |
          </span>
          <span>
            {t("result.solvedOn", { date: formatDate(submission.createdAt, locale) })}
          </span>
          {revised && (
            <>
              <span aria-hidden className="text-border">
                |
              </span>
              <span>{t("result.laterRevised")}</span>
            </>
          )}
        </p>

        <ChallengePanels description={challenge.description} testResults={testCases} />

        <section className="mt-10">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-pixel text-sm uppercase tracking-wide sm:text-base">
              {t("result.yourCode")}
            </h2>
            {isTodaysChallenge && (
              /* Not the shadcn ghost button: its hover is `accent`, which in this palette is
                 amber, and amber behind green text is unreadable. */
              <Link
                href={localizedPath("/challenge", locale)}
                className="border-2 border-primary/40 bg-primary/10 px-3 py-1.5 text-base uppercase tracking-wider text-primary transition-colors hover:border-primary hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {t("result.improveSolution")}
              </Link>
            )}
          </div>
          <CodeBlock
            code={submission.code}
            language={submission.language}
            className="max-h-[32rem]"
          />
        </section>

        <SolutionList
          challengeId={challenge.id}
          ownCode={submission.code}
          ownLanguage={submission.language as CodeLanguageId}
        />
      </main>
    </div>
  );
}
