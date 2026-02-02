"use client";

import { useState } from "react";
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
import { ConfettiButton } from "@/components/ui/confetti";
import { EncryptedText } from "@/components/ui/encrypted-text";
import { FlickeringGrid } from "@/components/ui/flickering-grid";

const initialTestCases: TestCase[] = [
  { id: 1, name: "Test Case 1: Einfaches Array", status: "pending" },
  { id: 2, name: "Test Case 2: Leeres Array", status: "pending" },
  { id: 3, name: "Test Case 3: Negative Zahlen", status: "pending" },
  { id: 4, name: "Test Case 4: Großes Array", status: "pending" },
  { id: 5, name: "Test Case 5: Edge Cases", status: "pending" },
];

export default function ChallengePage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [testCases, setTestCases] = useState<TestCase[]>(initialTestCases);
  const [isRunning, setIsRunning] = useState(false);

  const handleRunTests = () => {
    setIsRunning(true);

    // Simulate test execution
    setTimeout(() => {
      setTestCases([
        {
          id: 1,
          name: "Test Case 1: Einfaches Array",
          status: "passed",
          time: "12ms",
        },
        {
          id: 2,
          name: "Test Case 2: Leeres Array",
          status: "passed",
          time: "8ms",
        },
        {
          id: 3,
          name: "Test Case 3: Negative Zahlen",
          status: "failed",
          input: "[-1, -2, -3]",
          expected: "[-1, -3, -6]",
          actual: "[-1, -2, -3]",
          time: "10ms",
        },
        {
          id: 4,
          name: "Test Case 4: Großes Array",
          status: "passed",
          time: "45ms",
        },
        { id: 5, name: "Test Case 5: Edge Cases", status: "pending" },
      ]);
      setIsRunning(false);
    }, 1500);
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
  };

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

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 relative">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-pixel uppercase tracking-tight">
                Array Manipulation Challenge
              </h1>
              <DifficultyBadge difficulty="medium" />
            </div>
            <EncryptedText
              text="Algorithmen • Tag 47"
              revealDelayMs={30}
              className="text-xl text-muted-foreground uppercase tracking-wide"
            />
          </div>

          <div className="flex items-center gap-4">
            <PointsChip points={150} variant="highlight" size="lg" />
            <CountdownTimer />
          </div>
        </div>

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
                  Implementiere eine Funktion{" "}
                  <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-sm text-primary">
                    transformArray(arr)
                  </code>
                  , die ein Array von Zahlen nimmt und ein neues Array
                  zurückgibt, bei dem jedes Element die kumulative Summe aller
                  vorherigen Elemente (inklusive sich selbst) enthält.
                </CardDescription>

                <div className="space-y-3 rounded-lg bg-secondary/50 p-4">
                  <h4 className="font-semibold">Beispiele:</h4>
                  <div className="space-y-2 text-xs font-code">
                    <div>
                      <span className="text-muted-foreground">Input: </span>
                      <span className="text-primary">[1, 2, 3, 4, 5]</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Output: </span>
                      <span className="text-emerald-500">
                        [1, 3, 6, 10, 15]
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2 text-xs font-code">
                    <div>
                      <span className="text-muted-foreground">Input: </span>
                      <span className="text-primary">[5, -2, 3, 1]</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Output: </span>
                      <span className="text-emerald-500">[5, 3, 6, 7]</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2 border border-amber-500/30 bg-amber-500/10 p-4">
                  <Lightbulb
                    className="mt-0.5 h-5 w-5 shrink-0 text-accent"
                    fill="currentColor"
                  />
                  <div>
                    <h4 className="font-medium text-accent">Hinweis</h4>
                    <p className="text-base text-accent/90">
                      Versuche die Lösung mit O(n) Zeitkomplexität und O(1)
                      zusätzlichem Speicher zu implementieren.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Code Editor</h2>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={handleRunTests}
                    disabled={isRunning || isSubmitted}
                    className="gap-2 bg-transparent rounded-none cursor-pointer"
                  >
                    <Play className="h-4 w-4" fill="currentColor" />
                    {isRunning ? "Läuft..." : "Test ausführen"}
                  </Button>
                </div>
              </div>

              <CodeEditor
                readOnly={isSubmitted}
                className="shadow-[0_0_40px_-10px_rgba(163,113,247,0.3)] border-chart-5/50"
              />
            </div>
          </div>

          <div className="space-y-6">
            <SubmissionStatus
              status={isSubmitted ? "submitted" : "not-submitted"}
              submittedAt={isSubmitted ? "14:32" : undefined}
            />

            {!isSubmitted && (
              <Alert
                variant="destructive"
                className="border-amber-500/30 bg-amber-500/10 text-accent [&>svg]:text-accent rounded-none"
              >
                <AlertIcon className="h-4 w-4" fill="currentColor" />
                <AlertTitle className="text-lg leading-none mb-2">
                  Achtung
                </AlertTitle>
                <AlertDescription className="text-sm">
                  Du kannst deine Lösung nur einmal final abgeben. Stelle
                  sicher, dass alle Tests bestanden sind.
                </AlertDescription>
              </Alert>
            )}

            <Button
              size="lg"
              className="w-full gap-2 cursor-pointer rounded-none"
              onClick={handleSubmit}
              disabled={isSubmitted}
            >
              <ArrowRight className="h-4 w-4" fill="currentColor" />
              {isSubmitted ? "Bereits abgegeben" : "Final abgeben"}
            </Button>

            <TestResults testCases={testCases} />
          </div>
        </div>
      </main>
    </div>
  );
}
