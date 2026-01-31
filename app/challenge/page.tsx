"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { CodeEditor } from "@/components/code-editor"
import { TestResults } from "@/components/test-results"
import { SubmissionStatus } from "@/components/submission-status"
import { DifficultyBadge } from "@/components/difficulty-badge"
import { PointsChip } from "@/components/points-chip"
import { CountdownTimer } from "@/components/countdown-timer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Play, Send, AlertTriangle, Lightbulb, BookOpen } from "lucide-react"

const initialTestCases = [
  { id: 1, name: "Test Case 1: Einfaches Array", status: "pending" as const },
  { id: 2, name: "Test Case 2: Leeres Array", status: "pending" as const },
  { id: 3, name: "Test Case 3: Negative Zahlen", status: "pending" as const },
  { id: 4, name: "Test Case 4: Großes Array", status: "pending" as const },
  { id: 5, name: "Test Case 5: Edge Cases", status: "pending" as const },
]

export default function ChallengePage() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [testCases, setTestCases] = useState(initialTestCases)
  const [isRunning, setIsRunning] = useState(false)

  const handleRunTests = () => {
    setIsRunning(true)
    
    // Simulate test execution
    setTimeout(() => {
      setTestCases([
        { id: 1, name: "Test Case 1: Einfaches Array", status: "passed", time: "12ms" },
        { id: 2, name: "Test Case 2: Leeres Array", status: "passed", time: "8ms" },
        { id: 3, name: "Test Case 3: Negative Zahlen", status: "failed", input: "[-1, -2, -3]", expected: "[-1, -3, -6]", actual: "[-1, -2, -3]", time: "10ms" },
        { id: 4, name: "Test Case 4: Großes Array", status: "passed", time: "45ms" },
        { id: 5, name: "Test Case 5: Edge Cases", status: "pending" },
      ])
      setIsRunning(false)
    }, 1500)
  }

  const handleSubmit = () => {
    setIsSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">Array Manipulation Challenge</h1>
              <DifficultyBadge difficulty="medium" />
            </div>
            <p className="mt-1 text-muted-foreground">Algorithmen • Tag 47</p>
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
                  <BookOpen className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Aufgabenbeschreibung</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription className="text-base leading-relaxed text-foreground">
                  Implementiere eine Funktion <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-sm">transformArray(arr)</code>, 
                  die ein Array von Zahlen nimmt und ein neues Array zurückgibt, bei dem jedes Element 
                  die kumulative Summe aller vorherigen Elemente (inklusive sich selbst) enthält.
                </CardDescription>

                <div className="space-y-3 rounded-lg bg-secondary/50 p-4">
                  <h4 className="font-semibold">Beispiele:</h4>
                  <div className="space-y-2 font-mono text-sm">
                    <div>
                      <span className="text-muted-foreground">Input: </span>
                      <span className="text-primary">[1, 2, 3, 4, 5]</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Output: </span>
                      <span className="text-emerald-500">[1, 3, 6, 10, 15]</span>
                    </div>
                  </div>
                  <div className="space-y-2 font-mono text-sm">
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

                <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
                  <Lightbulb className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500" />
                  <div>
                    <h4 className="font-medium text-amber-500">Hinweis</h4>
                    <p className="text-sm text-amber-500/90">
                      Versuche die Lösung mit O(n) Zeitkomplexität und O(1) zusätzlichem Speicher zu implementieren.
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
                    className="gap-2 bg-transparent"
                  >
                    <Play className="h-4 w-4" />
                    {isRunning ? "Läuft..." : "Test ausführen"}
                  </Button>
                </div>
              </div>
              
              <CodeEditor readOnly={isSubmitted} />
            </div>
          </div>

          <div className="space-y-6">
            <SubmissionStatus 
              status={isSubmitted ? "submitted" : "not-submitted"}
              submittedAt={isSubmitted ? "14:32" : undefined}
            />

            {!isSubmitted && (
              <Alert variant="destructive" className="border-amber-500/30 bg-amber-500/10 text-amber-500 [&>svg]:text-amber-500">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Achtung</AlertTitle>
                <AlertDescription className="text-amber-500/90">
                  Du kannst deine Lösung nur einmal final abgeben. Stelle sicher, dass alle Tests bestanden sind.
                </AlertDescription>
              </Alert>
            )}

            <Button
              size="lg"
              className="w-full gap-2"
              onClick={handleSubmit}
              disabled={isSubmitted}
            >
              <Send className="h-4 w-4" />
              {isSubmitted ? "Bereits abgegeben" : "Final abgeben"}
            </Button>

            <TestResults testCases={testCases} />
          </div>
        </div>
      </main>
    </div>
  )
}
