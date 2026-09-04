"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { Header } from "@/components/header";
import ChallengeLoading from "./loading";
import { CodeEditor } from "@/components/code-editor";
import { TestResults, type TestCase } from "@/components/test-results";
import { SubmissionStatus } from "@/components/submission-status";
import { DifficultyBadge } from "@/components/difficulty-badge";
import { PointsChip } from "@/components/points-chip";
import { CountdownTimer } from "@/components/countdown-timer";
import { ChallengeHints } from "@/components/challenge-hints";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Play,
  ArrowRight,
  Alert as AlertIcon,
  BookOpen,
  Expand,
  Collapse,
} from "@nsmr/pixelart-react";
import { EncryptedText } from "@/components/ui/encrypted-text";
import { PageAmbience } from "@/components/page-ambience";
import { toast } from "sonner";
import {
  getDailyChallenge,
  runTests,
  submitSolution,
  type CodeLanguageId,
} from "@/lib/api";
import { storeResultHandover } from "@/lib/challenge-result-handover";
import { challengeResultPath } from "@/lib/navigation";
import { languageFileName, languageLabel } from "@/lib/challenge-languages";
import { notifyUserStatsChanged } from "@/lib/user-stats-events";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatTimeOfDay } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Interval for the silent API check that picks up a new UTC day / new challenge. */
const CHALLENGE_POLL_MS = 60_000;

export default function ChallengePage() {
  const [language, setLanguage] = useState<CodeLanguageId | null>(null);
  const [sources, setSources] = useState<Partial<Record<CodeLanguageId, string>>>({});
  const [submitOutcome, setSubmitOutcome] = useState<
    "none" | "success" | "failed" | "pending"
  >("none");
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [compileError, setCompileError] = useState<string | null>(null);
  const [submittedAtLabel, setSubmittedAtLabel] = useState<string | undefined>();
  const prevChallengeIdRef = useRef<string | null>(null);
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("challenge");

  const {
    data: challenge,
    isLoading: isLoadingChallenge,
    error: loadError,
    refetch,
  } = useQuery({
    queryKey: ["daily-challenge"],
    queryFn: getDailyChallenge,
    refetchInterval: CHALLENGE_POLL_MS,
    staleTime: CHALLENGE_POLL_MS,
  });

  // Initialises sources/language/outcome whenever a new challenge arrives
  useEffect(() => {
    if (!challenge) return;

    const isNew = prevChallengeIdRef.current !== challenge.id;
    if (isNew) {
      if (prevChallengeIdRef.current !== null) {
        toast.message(t("toasts.newChallenge.title"), {
          description: t("toasts.newChallenge.description"),
        });
      }
      prevChallengeIdRef.current = challenge.id;

      if (challenge.todaySubmission) {
        setLanguage(challenge.todaySubmission.language as CodeLanguageId);
        setSources({
          ...challenge.starterCodes,
          [challenge.todaySubmission.language]: challenge.todaySubmission.code,
        });
      } else {
        setLanguage(challenge.defaultLanguage);
        setSources({ ...challenge.starterCodes });
      }

      // Prefer the graded results of today's submission - otherwise the panel
      // showed the empty template ("0/5") next to "successfully submitted" after
      // a reload. Legacy rows without stored results fall back to the template.
      const storedResults = challenge.todaySubmission?.testResults;
      setTestCases(
        (storedResults?.length ? storedResults : challenge.testCases) as TestCase[]
      );

      if (challenge.todaySubmission) {
        const { status, submittedAt } = challenge.todaySubmission;
        setSubmitOutcome(
          status === "completed" ? "success"
          : status === "failed" ? "failed"
          : "pending"
        );
        setSubmittedAtLabel(formatTimeOfDay(new Date(submittedAt), locale));
      } else {
        setSubmitOutcome("none");
        setSubmittedAtLabel(undefined);
      }
    }
  }, [challenge, locale, t]);

  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    if (!isMaximized) return;
    // Own overlay instead of the Fullscreen API: the browser window keeps its tabs and
    // address bar, which also means Escape and the scroll lock are ours to handle.
    const closeOnEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMaximized(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [isMaximized]);

  const { mutate: runTestsMutation, isPending: isRunning } = useMutation({
    mutationFn: ({ code, lang }: { code: string; lang: CodeLanguageId }) =>
      runTests(challenge!.id, code, lang),
    onSuccess: (result) => {
      setTestCases(result.testCases as TestCase[]);
      setCompileError(result.compileError ?? null);
      if (result.compileError) {
        toast.error(t("toasts.compileFailed.title"), {
          description: t("toasts.compileFailed.description"),
        });
      } else if (result.runtimeOk === false) {
        toast.message(t("toasts.testsRun.title"), {
          description: t("toasts.testsRun.description"),
        });
      }
    },
    onError: (e) => {
      toast.error(t("toasts.runFailed.title"), {
        description: e instanceof Error ? e.message : t("errors.unknown"),
      });
    },
  });

  const { mutate: submitMutation, isPending: isSubmitting } = useMutation({
    mutationFn: ({ code, lang }: { code: string; lang: CodeLanguageId }) =>
      submitSolution(challenge!.id, code, lang),
    onSuccess: (result) => {
      setTestCases(result.testCases as TestCase[]);
      setCompileError(result.compileError ?? null);
      setSubmittedAtLabel(formatTimeOfDay(new Date(), locale));
      setSubmitOutcome(result.status === "completed" ? "success" : "failed");

      if (result.success) {
        notifyUserStatsChanged();
        storeResultHandover(window.sessionStorage, result.submissionId, {
          unlockedAchievements: result.unlockedAchievements,
        });

        if (result.firstSolveToday) {
          router.push(challengeResultPath(challenge!.id));
        } else {
          // Staying put on a repeat submission: navigating away would throw the user
          // out of the editor every time they improve an already passing solution.
          toast.success(t("toasts.solutionUpdated.title"), {
            description: t("toasts.solutionUpdated.description"),
            action: {
              label: t("actions.toResult"),
              onClick: () => router.push(challengeResultPath(challenge!.id)),
            },
          });
        }
      } else {
        toast.error(t("toasts.submissionFailed.title"), {
          description: t("toasts.submissionFailed.description"),
        });
      }
    },
    onError: (e) => {
      toast.error(t("toasts.submitFailed.title"), {
        description: e instanceof Error ? e.message : t("errors.unknown"),
      });
    },
  });

  const currentCode = language != null ? (sources[language] ?? "") : "";

  const setCurrentCode = (next: string) => {
    if (!language) return;
    setSources((prev) => ({ ...prev, [language]: next }));
  };

  // Everything a test run produces. Defined once so it can live in the sidebar or, while
  // maximized, inside the panel - a compile error is a result too, and reading it should
  // not require shrinking the editor first.
  const runOutcome = (
    <>
      {compileError ? (
        <div className="border-2 border-destructive/60 bg-destructive/10 p-4">
          <p className="font-sans text-sm uppercase tracking-wide text-destructive">
            {t("compileError.title")}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("compileError.body")}
          </p>
          <pre className="mt-3 max-h-60 overflow-auto whitespace-pre-wrap font-code text-xs text-destructive">
            {compileError}
          </pre>
        </div>
      ) : null}
      <TestResults testCases={testCases} />
    </>
  );

  const handleRunTests = () => {
    if (!challenge || !language || isRunning) return;
    runTestsMutation({ code: currentCode, lang: language });
  };

  const handleSubmit = () => {
    if (!challenge || !language || isSubmitting) return;
    submitMutation({ code: currentCode, lang: language });
  };

  if (isLoadingChallenge) {
    return <ChallengeLoading />;
  }

  if (loadError || !challenge) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-lg px-4 py-16 space-y-4">
          <Alert variant="destructive" className="rounded-none">
            <AlertIcon className="h-4 w-4" fill="currentColor" />
            <AlertTitle>{t("loadError.title")}</AlertTitle>
            <AlertDescription>
              {loadError instanceof Error
                ? loadError.message
                : t("loadError.description")}
            </AlertDescription>
          </Alert>
          <Button variant="outline" className="rounded-none" onClick={() => refetch()}>
            {t("loadError.retry")}
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <PageAmbience />

      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 relative">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-pixel uppercase tracking-tight">
                {challenge.title}
              </h1>
              <DifficultyBadge difficulty={challenge.difficulty} />
            </div>
            <EncryptedText
              text={challenge.category}
              revealDelayMs={30}
              className="text-xl text-muted-foreground uppercase tracking-wide"
            />
          </div>

          <div className="flex flex-col items-start gap-2 sm:items-end">
            <div className="flex items-center gap-4">
              <PointsChip points={challenge.points} variant="highlight" size="lg" />
              <CountdownTimer />
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="min-w-0 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" fill="currentColor" />
                  <CardTitle className="text-lg">{t("description.title")}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* pre-wrap, so a description may use paragraphs - nothing parses Markdown. */}
                <CardDescription className="whitespace-pre-wrap text-lg text-muted-foreground">
                  {challenge.description}
                </CardDescription>

                <div className="space-y-3 rounded-lg bg-secondary/50 p-4">
                  <h4 className="font-semibold">{t("description.examples")}</h4>
                  {challenge.examples.map((ex, i) => (
                    <div key={i} className="space-y-2 text-xs font-code">
                      <div>
                        <span className="text-muted-foreground">
                          {t("description.inputLabel")}{" "}
                        </span>
                        <span className="text-primary">{ex.input}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          {t("description.outputLabel")}{" "}
                        </span>
                        <span className="text-emerald-500">{ex.output}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <ChallengeHints hints={challenge.hints} />
              </CardContent>
            </Card>

            <div
              className={cn(
                "space-y-4",
                isMaximized &&
                  "fixed inset-0 z-[60] flex flex-col gap-4 space-y-0 overflow-hidden bg-background p-4 sm:p-6"
              )}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-semibold">{t("editor.title")}</h2>
                <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
                  {language && challenge.supportedLanguages.length > 1 ? (
                    <Select
                      value={language}
                      onValueChange={(v) => setLanguage(v as CodeLanguageId)}
                    >
                      <SelectTrigger size="sm" className="w-full rounded-none font-sans sm:w-[180px]">
                        <SelectValue placeholder={t("editor.languagePlaceholder")} />
                      </SelectTrigger>
                      {/*
                        Above the maximize overlay. The list is portalled to the body, and
                        Radix copies this z-index onto the positioned wrapper, which would
                        otherwise land on 50 and paint behind the overlay's 60.
                      */}
                      <SelectContent className="z-[70] rounded-none">
                        {challenge.supportedLanguages.map((id) => (
                          <SelectItem key={id} value={id}>
                            {languageLabel(id)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : null}
                  <Button
                    variant="outline"
                    onClick={handleRunTests}
                    disabled={isRunning || !language}
                    title={t("editor.runTestsTitle")}
                    className="gap-2 rounded-none cursor-pointer border-border bg-transparent hover:bg-primary/15 hover:text-primary dark:hover:bg-primary/20 dark:hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Play className="h-4 w-4" fill="currentColor" />
                    {isRunning ? t("editor.running") : t("editor.runTests")}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsMaximized((v) => !v)}
                    aria-pressed={isMaximized}
                    aria-label={
                      isMaximized ? t("editor.minimize") : t("editor.maximize")
                    }
                    title={isMaximized ? t("editor.minimize") : t("editor.maximize")}
                    className="rounded-none cursor-pointer border-border bg-transparent hover:bg-primary/15 hover:text-primary dark:hover:bg-primary/20 dark:hover:text-primary"
                  >
                    {isMaximized ? (
                      <Collapse className="h-4 w-4" fill="currentColor" />
                    ) : (
                      <Expand className="h-4 w-4" fill="currentColor" />
                    )}
                  </Button>
                </div>
              </div>

              {/* This wrapper stays in the tree in both modes on purpose: moving the editor
                  to a different parent would remount Monaco and drop the undo history. */}
              <div
                className={cn(
                  isMaximized && "flex min-h-0 flex-1 flex-col gap-4 lg:flex-row"
                )}
              >
                {language ? (
                  <CodeEditor
                    value={currentCode}
                    onChange={setCurrentCode}
                    onSaveShortcut={handleRunTests}
                    language={language}
                    fileName={languageFileName(language)}
                    className={cn(
                      "shadow-[0_0_40px_-10px_rgba(163,113,247,0.3)] border-chart-5/50",
                      isMaximized && "h-auto min-h-0 flex-1"
                    )}
                  />
                ) : null}

                {/* Running tests without seeing the result is pointless, so the panel comes
                    along instead of staying behind the overlay. Beside the editor where
                    there is room, below it on a narrow screen. */}
                {isMaximized ? (
                  <div className="max-h-[38%] shrink-0 space-y-4 overflow-y-auto lg:max-h-none lg:w-[380px]">
                    {runOutcome}
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <SubmissionStatus
              status={
                submitOutcome === "success"
                  ? "submitted"
                  : submitOutcome === "failed"
                    ? "failed"
                    : submitOutcome === "pending"
                      ? "pending"
                      : "not-submitted"
              }
              submittedAt={submittedAtLabel}
            />

            {/* The two together, tighter than the column's rhythm: they are one decision. */}
            <div className="space-y-3">
              <Button
                size="lg"
                className="w-full gap-2 rounded-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                onClick={handleSubmit}
                disabled={!language || isSubmitting}
              >
                <ArrowRight className="h-4 w-4" fill="currentColor" />
                {isSubmitting
                  ? t("submit.sending")
                  : submitOutcome === "none"
                    ? t("submit.final")
                    : t("submit.again")}
              </Button>

              {/* Only after a passing submission: the result page needs one, and a repeat
                  submission keeps the user in the editor (see the toast above), so without
                  this the way back to the discussion was that toast alone. */}
              {submitOutcome === "success" ? (
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  // The outline variant's hairline disappears on this ground, so the border
                  // carries the button here. Spelled with `dark:` as well: the app forces the
                  // dark theme, and the variant's own `dark:` rules would otherwise win.
                  className="w-full gap-2 rounded-none border-2 border-primary/40 bg-transparent text-primary hover:border-primary hover:bg-primary/10 hover:text-primary dark:border-primary/40 dark:bg-transparent dark:hover:border-primary dark:hover:bg-primary/10 dark:hover:text-primary"
                >
                  {/* No icon: the arrow of the button above it is the one that means
                      „weiter", and twice in a row it read as a list rather than as a choice. */}
                  <Link href={challengeResultPath(challenge.id)}>
                    {t("actions.toResult")}
                  </Link>
                </Button>
              ) : null}
            </div>

            {isMaximized ? null : runOutcome}
          </div>
        </div>
      </main>
    </div>
  );
}
