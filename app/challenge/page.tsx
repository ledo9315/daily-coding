"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
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
import { AnimatedFlickeringGrid } from "@/components/ui/animated-flickering-grid";
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
        toast.message("Neue Daily Challenge", {
          description: "Der UTC-Tag hat gewechselt.",
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
        setSubmittedAtLabel(
          new Date(submittedAt).toLocaleTimeString("de-DE", {
            hour: "2-digit",
            minute: "2-digit",
          })
        );
      } else {
        setSubmitOutcome("none");
        setSubmittedAtLabel(undefined);
      }
    }
  }, [challenge]);

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
        toast.error("Kompilieren fehlgeschlagen", {
          description: "Der Code wurde nicht ausgeführt.",
        });
      } else if (result.runtimeOk === false) {
        toast.message("Tests ausgeführt", {
          description: "Mindestens ein Test ist fehlgeschlagen.",
        });
      }
    },
    onError: (e) => {
      toast.error("Testlauf fehlgeschlagen", {
        description: e instanceof Error ? e.message : "Unbekannter Fehler",
      });
    },
  });

  const { mutate: submitMutation, isPending: isSubmitting } = useMutation({
    mutationFn: ({ code, lang }: { code: string; lang: CodeLanguageId }) =>
      submitSolution(challenge!.id, code, lang),
    onSuccess: (result) => {
      setTestCases(result.testCases as TestCase[]);
      setCompileError(result.compileError ?? null);
      setSubmittedAtLabel(
        new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })
      );
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
          toast.success("Lösung aktualisiert", {
            description: "Deine Abgabe für heute wurde ersetzt.",
            action: {
              label: "Zum Ergebnis",
              onClick: () => router.push(challengeResultPath(challenge!.id)),
            },
          });
        }
      } else {
        toast.error("Abgabe nicht bestanden", {
          description:
            "Mindestens ein Test ist fehlgeschlagen oder die Ausführung war fehlerhaft.",
        });
      }
    },
    onError: (e) => {
      toast.error("Einreichen fehlgeschlagen", {
        description: e instanceof Error ? e.message : "Unbekannter Fehler",
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
            Kompilieren fehlgeschlagen
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Der Code wurde nicht ausgeführt, es gibt daher kein Testergebnis.
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
            <AlertTitle>Keine Challenge</AlertTitle>
            <AlertDescription>
              {loadError instanceof Error
                ? loadError.message
                : "Es ist keine aktive Aufgabe verfügbar. Bitte Datenbank prüfen (migrate + seed) oder später erneut versuchen."}
            </AlertDescription>
          </Alert>
          <Button variant="outline" className="rounded-none" onClick={() => refetch()}>
            Erneut laden
          </Button>
        </main>
      </div>
    );
  }

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
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] h-150 w-150 bg-chart-5/15 blur-[120px] rounded-full opacity-50 mix-blend-screen" />
        <div className="absolute bottom-[-10%] left-[-5%] h-125 w-125 bg-chart-5/15 blur-[100px] rounded-full opacity-50 mix-blend-screen" />
      </div>

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
                  <CardTitle className="text-lg">Aufgabenbeschreibung</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* pre-wrap, so a description may use paragraphs - nothing parses Markdown. */}
                <CardDescription className="whitespace-pre-wrap text-lg text-muted-foreground">
                  {challenge.description}
                </CardDescription>

                <div className="space-y-3 rounded-lg bg-secondary/50 p-4">
                  <h4 className="font-semibold">Beispiele:</h4>
                  {challenge.examples.map((ex, i) => (
                    <div key={i} className="space-y-2 text-xs font-code">
                      <div>
                        <span className="text-muted-foreground">Input: </span>
                        <span className="text-primary">{ex.input}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Output: </span>
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
                <h2 className="text-lg font-semibold">Code Editor</h2>
                <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
                  {language && challenge.supportedLanguages.length > 1 ? (
                    <Select
                      value={language}
                      onValueChange={(v) => setLanguage(v as CodeLanguageId)}
                    >
                      <SelectTrigger size="sm" className="w-full rounded-none font-sans sm:w-[180px]">
                        <SelectValue placeholder="Sprache" />
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
                    title="Test ausführen, im Editor auch mit ⌘S / Strg+S"
                    className="gap-2 rounded-none cursor-pointer border-border bg-transparent hover:bg-primary/15 hover:text-primary dark:hover:bg-primary/20 dark:hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Play className="h-4 w-4" fill="currentColor" />
                    {isRunning ? "Läuft..." : "Test ausführen"}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsMaximized((v) => !v)}
                    aria-pressed={isMaximized}
                    aria-label={
                      isMaximized ? "Editor verkleinern" : "Editor maximieren"
                    }
                    title={isMaximized ? "Editor verkleinern" : "Editor maximieren"}
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

            <Button
              size="lg"
              className="w-full gap-2 rounded-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={handleSubmit}
              disabled={!language || isSubmitting}
            >
              <ArrowRight className="h-4 w-4" fill="currentColor" />
              {isSubmitting
                ? "Wird gesendet…"
                : submitOutcome === "none"
                  ? "Final abgeben"
                  : "Erneut abgeben"}
            </Button>

            {isMaximized ? null : runOutcome}
          </div>
        </div>
      </main>
    </div>
  );
}
