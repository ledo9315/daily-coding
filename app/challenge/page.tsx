"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { CodeEditor } from "@/components/code-editor";
import { TestResults, type TestCase } from "@/components/test-results";
import { SubmissionStatus } from "@/components/submission-status";
import { DifficultyBadge } from "@/components/difficulty-badge";
import { PointsChip } from "@/components/points-chip";
import { CountdownTimer } from "@/components/countdown-timer";
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
  Lightbulb,
  BookOpen,
} from "@nsmr/pixelart-react";
import { EncryptedText } from "@/components/ui/encrypted-text";
import { FlickeringGrid } from "@/components/ui/flickering-grid";
import { toast } from "sonner";
import {
  getDailyChallenge,
  runTests,
  submitSolution,
  type CodeLanguageId,
  type SubmitCelebration,
} from "@/lib/api";
import { ChallengeSuccessModal } from "@/components/challenge-success-modal";
import { languageFileName, languageLabel } from "@/lib/challenge-languages";
import { notifyUserStatsChanged } from "@/lib/user-stats-events";
import {
  ensureSolveStart,
  getSolveDurationSeconds,
  clearSolveTimer,
} from "@/lib/solve-timer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";

/** Abstand für stillen API-Check (neuer UTC-Tag / neue Challenge). */
const CHALLENGE_POLL_MS = 60_000;

export default function ChallengePage() {
  const [language, setLanguage] = useState<CodeLanguageId | null>(null);
  const [sources, setSources] = useState<Partial<Record<CodeLanguageId, string>>>({});
  const [submitOutcome, setSubmitOutcome] = useState<
    "none" | "success" | "failed" | "pending"
  >("none");
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [submittedAtLabel, setSubmittedAtLabel] = useState<string | undefined>();
  const [testRunCount, setTestRunCount] = useState(0);
  const [celebrationOpen, setCelebrationOpen] = useState(false);
  const [celebration, setCelebration] = useState<SubmitCelebration | null>(null);
  const [submitWarningDismissed, setSubmitWarningDismissed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("challenge_submit_warning_dismissed") === "true";
    }
    return false;
  });

  const prevChallengeIdRef = useRef<string | null>(null);

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

  // Initialisiert Sources/Language/Outcome wenn eine neue Challenge kommt
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

      setTestCases(challenge.testCases as TestCase[]);
      setTestRunCount(0);

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

  const isSubmitLocked = submitOutcome !== "none";

  useEffect(() => {
    if (!challenge || isSubmitLocked) return;
    ensureSolveStart(challenge.id);
  }, [challenge?.id, isSubmitLocked]);

  const { mutate: runTestsMutation, isPending: isRunning } = useMutation({
    mutationFn: ({ code, lang }: { code: string; lang: CodeLanguageId }) =>
      runTests(challenge!.id, code, lang),
    onSuccess: (result) => {
      setTestCases(result.testCases as TestCase[]);
      setTestRunCount((c) => c + 1);
      if (result.runtimeOk === false) {
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
    mutationFn: ({ code, lang }: { code: string; lang: CodeLanguageId }) => {
      const solveDurationSeconds = getSolveDurationSeconds(challenge!.id);
      return submitSolution(challenge!.id, code, lang, solveDurationSeconds);
    },
    onSuccess: (result) => {
      clearSolveTimer(challenge!.id);
      setTestCases(result.testCases as TestCase[]);
      setSubmittedAtLabel(
        new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })
      );
      if (result.success) {
        setSubmitOutcome("success");
        notifyUserStatsChanged();
        if (result.celebration) {
          setCelebration(result.celebration);
          setCelebrationOpen(true);
        } else {
          toast.success("Lösung eingereicht", {
            description: "Alle Tests wurden bestanden.",
          });
        }
      } else {
        setSubmitOutcome("failed");
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

  const handleRunTests = () => {
    if (!challenge || !language) return;
    runTestsMutation({ code: currentCode, lang: language });
  };

  const handleSubmit = () => {
    if (!challenge || !language || isSubmitting) return;
    submitMutation({ code: currentCode, lang: language });
  };

  if (isLoadingChallenge) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-4">
        <Header />
        <p className="text-muted-foreground">Challenge wird geladen…</p>
      </div>
    );
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
      <FlickeringGrid
        className="absolute inset-0 z-0 mask-[radial-gradient(300px_circle_at_top,white,transparent)]"
        squareSize={6}
        gridGap={1}
        color="#A371F7"
        maxOpacity={0.2}
        flickerChance={0.1}
        height={300}
        width={1920}
      />
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] h-150 w-150 bg-chart-5/15 blur-[120px] rounded-full opacity-50 mix-blend-screen" />
        <div className="absolute bottom-[-10%] left-[-5%] h-125 w-125 bg-chart-5/15 blur-[100px] rounded-full opacity-50 mix-blend-screen" />
      </div>

      <Header />

      {celebration ? (
        <ChallengeSuccessModal
          open={celebrationOpen}
          onOpenChange={(o) => {
            setCelebrationOpen(o);
            if (!o) setCelebration(null);
          }}
          celebration={celebration}
          testRunsBeforeSubmit={testRunCount}
          pointsEarned={challenge.points}
          testCases={testCases}
        />
      ) : null}

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

          <div className="flex items-center gap-4">
            <PointsChip points={challenge.points} variant="highlight" size="lg" />
            <CountdownTimer />
          </div>
        </div>

        {isSubmitLocked ? (
          <p
            className="mb-6 text-sm text-muted-foreground border-l-2 border-primary/60 pl-3 py-1 max-w-2xl"
            role="status"
          >
            Du hast für diese Daily Challenge heute (UTC) bereits eine Lösung abgegeben. Testen
            und erneutes Einreichen sind bis morgen (UTC) nicht möglich.
          </p>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" fill="currentColor" />
                  <CardTitle className="text-lg">Aufgabenbeschreibung</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription className="text-lg text-muted-foreground">
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

                <div className="flex items-start gap-2 border border-amber-500/30 bg-amber-500/10 p-4">
                  <Lightbulb
                    className="mt-0.5 h-5 w-5 shrink-0 text-accent"
                    fill="currentColor"
                  />
                  <div>
                    <h4 className="font-medium text-accent">Hinweis</h4>
                    <p className="text-base text-accent/90">{challenge.hint}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-semibold">Code Editor</h2>
                <div className="flex flex-wrap items-center gap-2">
                  {language && challenge.supportedLanguages.length > 1 ? (
                    <Select
                      value={language}
                      onValueChange={(v) => setLanguage(v as CodeLanguageId)}
                      disabled={isSubmitLocked}
                    >
                      <SelectTrigger
                        size="sm"
                        className="rounded-none w-[180px] font-sans disabled:opacity-40"
                      >
                        <SelectValue placeholder="Sprache" />
                      </SelectTrigger>
                      <SelectContent className="rounded-none">
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
                    disabled={isRunning || isSubmitLocked || !language}
                    className="gap-2 rounded-none cursor-pointer border-border bg-transparent hover:bg-primary/15 hover:text-primary dark:hover:bg-primary/20 dark:hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Play className="h-4 w-4" fill="currentColor" />
                    {isRunning ? "Läuft..." : "Test ausführen"}
                  </Button>
                </div>
              </div>

              {language ? (
                <CodeEditor
                  value={currentCode}
                  onChange={setCurrentCode}
                  language={language}
                  fileName={languageFileName(language)}
                  readOnly={isSubmitLocked}
                  className={`shadow-[0_0_40px_-10px_rgba(163,113,247,0.3)] border-chart-5/50${isSubmitLocked ? " opacity-50 grayscale pointer-events-none" : ""}`}
                />
              ) : null}
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

            {!isSubmitLocked && !submitWarningDismissed && (
              <Alert
                variant="destructive"
                className="relative border-amber-500/30 bg-amber-500/10 text-accent [&>svg]:text-accent rounded-none pr-12"
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1 h-8 w-8 rounded-none text-muted-foreground hover:text-foreground hover:bg-amber-500/20"
                  onClick={() => {
                    setSubmitWarningDismissed(true);
                    localStorage.setItem("challenge_submit_warning_dismissed", "true");
                  }}
                  aria-label="Hinweis schließen"
                >
                  <X className="h-4 w-4" />
                </Button>
                <AlertIcon className="h-4 w-4" fill="currentColor" />
                <AlertTitle className="text-lg leading-none mb-2">Achtung</AlertTitle>
                <AlertDescription className="text-sm">
                  Pro Kalendertag (UTC) kannst du nur eine finale Abgabe machen. Stelle
                  sicher, dass alle Tests bestanden sind, bevor du einreichst.
                </AlertDescription>
              </Alert>
            )}

            <Button
              size="lg"
              className="w-full gap-2 rounded-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={handleSubmit}
              disabled={isSubmitLocked || !language || isSubmitting}
            >
              <ArrowRight className="h-4 w-4" fill="currentColor" />
              {isSubmitLocked
                ? "Bereits abgegeben"
                : isSubmitting
                  ? "Wird gesendet…"
                  : "Final abgeben"}
            </Button>

            <TestResults testCases={testCases} />
          </div>
        </div>
      </main>
    </div>
  );
}
