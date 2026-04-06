"use client";

import { useState, useEffect, useCallback } from "react";
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
  type DailyChallenge,
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

/** Abstand für stillen API-Check (neuer UTC-Tag / neue Challenge). */
const CHALLENGE_POLL_MS = 60_000;

export default function ChallengePage() {
  const [challenge, setChallenge] = useState<DailyChallenge | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoadingChallenge, setIsLoadingChallenge] = useState(true);
  const [language, setLanguage] = useState<CodeLanguageId | null>(null);
  const [sources, setSources] = useState<Partial<Record<CodeLanguageId, string>>>({});
  /**
   * none = noch offen; success = eingereicht und Tests ok; failed = eingereicht, Tests nicht ok;
   * pending = Submission noch ausstehend (selten).
   */
  const [submitOutcome, setSubmitOutcome] = useState<
    "none" | "success" | "failed" | "pending"
  >("none");
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedAtLabel, setSubmittedAtLabel] = useState<string | undefined>();
  const [testRunCount, setTestRunCount] = useState(0);
  const [celebrationOpen, setCelebrationOpen] = useState(false);
  const [celebration, setCelebration] = useState<SubmitCelebration | null>(null);

  const isSubmitLocked = submitOutcome !== "none";

  const loadChallenge = useCallback((options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;
    if (!silent) {
      setLoadError(null);
      setIsLoadingChallenge(true);
    }
    getDailyChallenge()
      .then((data) => {
        setChallenge((prev) => {
          if (prev && prev.id !== data.id) {
            toast.message("Neue Daily Challenge", {
              description: "Der UTC-Tag hat gewechselt.",
            });
          }
          return data;
        });
        setTestCases(data.testCases as TestCase[]);
        setLanguage(data.defaultLanguage);
        setSources({ ...data.starterCodes });
        if (data.todaySubmission) {
          const { status, submittedAt } = data.todaySubmission;
          if (status === "completed") setSubmitOutcome("success");
          else if (status === "failed") setSubmitOutcome("failed");
          else setSubmitOutcome("pending");
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
      })
      .catch((e) => {
        if (silent) return;
        setChallenge(null);
        const msg =
          e instanceof Error ? e.message : "Challenge konnte nicht geladen werden.";
        setLoadError(msg);
        toast.error("Daily Challenge", { description: msg });
      })
      .finally(() => {
        if (!silent) setIsLoadingChallenge(false);
      });
  }, []);

  useEffect(() => {
    loadChallenge();
  }, [loadChallenge]);

  useEffect(() => {
    const id = window.setInterval(() => {
      loadChallenge({ silent: true });
    }, CHALLENGE_POLL_MS);
    return () => clearInterval(id);
  }, [loadChallenge]);

  useEffect(() => {
    setTestRunCount(0);
  }, [challenge?.id]);

  useEffect(() => {
    if (!challenge || isSubmitLocked) return;
    ensureSolveStart(challenge.id);
  }, [challenge?.id, isSubmitLocked]);

  const currentCode =
    language != null ? (sources[language] ?? "") : "";

  const setCurrentCode = (next: string) => {
    if (!language) return;
    setSources((prev) => ({ ...prev, [language]: next }));
  };

  const handleRunTests = async () => {
    if (!challenge || !language) return;
    setIsRunning(true);
    try {
      const result = await runTests(challenge.id, currentCode, language);
      setTestCases(result.testCases as TestCase[]);
      setTestRunCount((c) => c + 1);
      if (result.runtimeOk === false) {
        toast.message("Tests ausgeführt", {
          description: "Mindestens ein Test ist fehlgeschlagen.",
        });
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unbekannter Fehler";
      toast.error("Testlauf fehlgeschlagen", { description: msg });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!challenge || !language || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const solveDurationSeconds = getSolveDurationSeconds(challenge.id);
      const result = await submitSolution(
        challenge.id,
        currentCode,
        language,
        solveDurationSeconds
      );
      clearSolveTimer(challenge.id);
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
          description: "Mindestens ein Test ist fehlgeschlagen oder die Ausführung war fehlerhaft.",
        });
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unbekannter Fehler";
      toast.error("Einreichen fehlgeschlagen", { description: msg });
    } finally {
      setIsSubmitting(false);
    }
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
              {loadError ??
                "Es ist keine aktive Aufgabe verfügbar. Bitte Datenbank prüfen (migrate + seed) oder später erneut versuchen."}
            </AlertDescription>
          </Alert>
          <Button
            variant="outline"
            className="rounded-none"
            onClick={() => {
              loadChallenge();
            }}
          >
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
      {/* Ambient Background Effects */}
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
                  <BookOpen
                    className="h-5 w-5 text-primary"
                    fill="currentColor"
                  />
                  <CardTitle className="text-lg">
                    Aufgabenbeschreibung
                  </CardTitle>
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
                  fileName={languageFileName(language)}
                  readOnly={isSubmitLocked}
                  className="shadow-[0_0_40px_-10px_rgba(163,113,247,0.3)] border-chart-5/50"
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

            {!isSubmitLocked && (
              <Alert
                variant="destructive"
                className="border-amber-500/30 bg-amber-500/10 text-accent [&>svg]:text-accent rounded-none"
              >
                <AlertIcon className="h-4 w-4" fill="currentColor" />
                <AlertTitle className="text-lg leading-none mb-2">
                  Achtung
                </AlertTitle>
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
