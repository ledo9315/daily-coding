"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight, Check, Close } from "@nsmr/pixelart-react";
import { Header } from "@/components/header";
import { PageAmbience } from "@/components/page-ambience";
import { DifficultyBadge } from "@/components/difficulty-badge";
import { PointsChip } from "@/components/points-chip";
import { TestResults, type TestCase } from "@/components/test-results";
import { FullscreenConfetti } from "@/components/fullscreen-confetti";
import { Button } from "@/components/ui/button";
import { languageLabel } from "@/lib/challenge-languages";
import {
  readGuestResult,
  takeGuestArrival,
  type GuestResultHandover,
} from "@/lib/guest-result-handover";
import { cn } from "@/lib/utils";

/**
 * What a guest sees after handing in the daily challenge.
 *
 * Deliberately *not* `/challenge/<id>/solutions`: that page is the signed-in result, it
 * loads a submission row that a guest does not have, and it shows other people's answers,
 * their comments and their votes - community content that an account pays for. The proxy
 * shuts everything under `/challenge/` for exactly that reason, so this lives beside it
 * rather than below it.
 *
 * Everything here comes out of `sessionStorage`; the page makes no request and reads no
 * database. Without a payload there is nothing to show, which is the honest state after a
 * direct hit on the URL.
 */
export function GuestResult() {
  /**
   * Read after mount, not during render: the server has no `sessionStorage`, and reading
   * it in the body would make the first client render disagree with the markup it
   * hydrates. `undefined` is "not looked yet", `null` is "looked, nothing there".
   */
  const [result, setResult] = useState<GuestResultHandover | null | undefined>();
  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => {
    const stored = readGuestResult(window.sessionStorage);
    /**
     * Read in the same breath, so the marker is spent whether or not it is used: someone
     * who fails, reloads, then solves it would otherwise inherit the earlier arrival.
     * Only a pass is worth confetti - firing it over a red result would be mockery.
     */
    const arrived = takeGuestArrival(window.sessionStorage);

    setResult(stored);
    setCelebrate(arrived && stored?.passed === true);
  }, []);

  if (result === undefined) return null;
  return <GuestResultView result={result} celebrate={celebrate} />;
}

/**
 * The page itself, with the payload handed in rather than read. Split off so a test can
 * render it: what matters about this page is as much what it does *not* contain as what
 * it does, and that is only checkable on real markup.
 */
export function GuestResultView({
  result,
  celebrate = false,
}: {
  result: GuestResultHandover | null;
  celebrate?: boolean;
}) {
  const t = useTranslations("challenge");

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <PageAmbience />
      <FullscreenConfetti active={celebrate} />
      <Header />

      <main className="relative mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {result === null ? (
          <div className="space-y-6">
            <h1 className="font-pixel text-xl uppercase tracking-tight">
              {t("guestResult.title")}
            </h1>
            <p className="text-muted-foreground">{t("guestResult.empty")}</p>
            <Button asChild size="lg" className="gap-2 rounded-none">
              <Link href="/challenge">
                <ArrowRight className="h-4 w-4" fill="currentColor" />
                {t("guestResult.emptyAction")}
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h1 className="font-pixel text-xl uppercase leading-tight tracking-tight sm:text-2xl">
                  {result.title}
                </h1>
                <p className="mt-2 text-lg uppercase tracking-wide text-muted-foreground">
                  {result.category}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 sm:shrink-0">
                <DifficultyBadge difficulty={result.difficulty} size="lg" />
                <PointsChip points={result.points} variant="highlight" size="lg" />
              </div>
            </div>

            {/* The verdict first and large: it is the one thing the reader came for. */}
            <div
              className={cn(
                "flex items-start gap-3 border-l-4 p-4",
                result.passed
                  ? "border-primary bg-primary/[0.06]"
                  : "border-destructive bg-destructive/[0.06]"
              )}
            >
              {result.passed ? (
                <Check className="mt-1 h-5 w-5 shrink-0 text-primary" fill="currentColor" />
              ) : (
                <Close
                  className="mt-1 h-5 w-5 shrink-0 text-destructive"
                  fill="currentColor"
                />
              )}
              <div className="min-w-0">
                <p
                  className={cn(
                    "font-pixel text-base uppercase tracking-tight",
                    result.passed ? "text-primary" : "text-destructive"
                  )}
                >
                  {result.passed
                    ? t("guestResult.passedHeadline")
                    : t("guestResult.failedHeadline")}
                </p>
                <p className="mt-1 text-muted-foreground">
                  {result.passed
                    ? t("guestResult.passedBody")
                    : t("guestResult.failedBody")}
                </p>
                <p className="mt-2 font-code text-sm font-bold text-muted-foreground">
                  {languageLabel(result.language)}
                </p>
              </div>
            </div>

            {result.compileError ? (
              <div className="border-2 border-destructive/60 bg-destructive/10 p-4">
                <p className="font-sans text-sm uppercase tracking-wide text-destructive">
                  {t("compileError.title")}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("compileError.body")}
                </p>
                <pre className="mt-3 max-h-60 overflow-auto whitespace-pre-wrap font-code text-xs text-destructive">
                  {result.compileError}
                </pre>
              </div>
            ) : null}

            <TestResults testCases={result.testCases as TestCase[]} />

            {/*
              The conversion block, and the reason the page exists. It says plainly that
              nothing was kept - promising otherwise would be a lie the next visit exposes.
            */}
            <div className="space-y-4 border-2 border-border bg-card p-5">
              <p className="text-muted-foreground">{t("guestResult.notCounted")}</p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="gap-2 rounded-none sm:flex-1">
                  <Link href="/register">
                    <ArrowRight className="h-4 w-4" fill="currentColor" />
                    {t("guest.createAccount")}
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="gap-2 rounded-none sm:flex-1"
                >
                  <Link href="/challenge">{t("guestResult.backToChallenge")}</Link>
                </Button>
              </div>
              <p className="text-base text-muted-foreground">
                {t("guest.haveAccount")}{" "}
                <Link
                  href="/login?callbackUrl=%2Fchallenge"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  {t("guest.login")}
                </Link>
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
