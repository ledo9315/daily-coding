"use client";

import { CheckboxOn, CloseBox, Clock, WarningBox } from "@nsmr/pixelart-react";
import { cn } from "@/lib/utils";

export interface TestCase {
  id: number;
  name: string;
  status: "passed" | "failed" | "pending" | "running";
  input?: string;
  expected?: string;
  actual?: string;
  time?: string;
}

interface TestResultsProps {
  testCases: TestCase[];
  className?: string;
}

const statusConfig = {
  passed: {
    icon: CheckboxOn,
    label: "Bestanden",
    className: "text-emerald-500",
    bgClassName: "bg-emerald-500/10",
  },
  failed: {
    icon: CloseBox,
    label: "Fehlgeschlagen",
    className: "text-rose-500",
    bgClassName: "bg-rose-500/10",
  },
  pending: {
    icon: WarningBox,
    label: "Ausstehend",
    className: "text-muted-foreground",
    bgClassName: "bg-muted",
  },
  running: {
    icon: Clock,
    label: "Läuft...",
    className: "text-amber-500 animate-pulse",
    bgClassName: "bg-amber-500/10",
  },
};

export function TestResults({ testCases, className }: TestResultsProps) {
  const passedCount = testCases.filter((tc) => tc.status === "passed").length;
  const totalCount = testCases.length;

  return (
    <div className={cn("rounded-none border border-border bg-card", className)}>
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="font-semibold">Testergebnisse</h3>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-sm font-medium",
              passedCount === totalCount
                ? "text-emerald-500"
                : "text-muted-foreground",
            )}
          >
            {passedCount}/{totalCount} bestanden
          </span>
        </div>
      </div>

      <div className="divide-y divide-border">
        {testCases.map((testCase) => {
          const st =
            testCase.status && testCase.status in statusConfig
              ? testCase.status
              : "pending";
          const config = statusConfig[st];
          const StatusIcon = config.icon;

          return (
            <div key={testCase.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn("rounded-full p-1", config.bgClassName)}>
                    <StatusIcon
                      className={cn("h-4 w-4", config.className)}
                      fill="currentColor"
                    />
                  </div>
                  <span className="font-medium">{testCase.name}</span>
                </div>
                {testCase.time && (
                  <span className="text-sm text-muted-foreground">
                    {testCase.time}
                  </span>
                )}
              </div>

              {st === "failed" && (
                <div className="mt-3 space-y-2 rounded-lg bg-rose-500/5 p-3 font-mono text-sm">
                  <div>
                    <span className="text-muted-foreground">Input: </span>
                    <span>{testCase.input}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Erwartet: </span>
                    <span className="text-emerald-500">
                      {testCase.expected}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Erhalten: </span>
                    <span className="text-rose-500">{testCase.actual}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
