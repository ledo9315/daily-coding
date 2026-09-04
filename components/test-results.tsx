"use client";

import { Check, CloseBox, Clock, WarningBox } from "@nsmr/pixelart-react";
import { useTranslations } from "next-intl";
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
  /** For a caller that already names the block and shows the score in its own trigger. */
  hideHeader?: boolean;
}

const statusConfig = {
  passed: {
    icon: Check,
    className: "text-emerald-500",
    bgClassName: "bg-emerald-500/10",
  },
  failed: {
    icon: CloseBox,
    className: "text-rose-500",
    bgClassName: "bg-rose-500/10",
  },
  pending: {
    icon: WarningBox,
    className: "text-muted-foreground",
    bgClassName: "bg-muted",
  },
  running: {
    icon: Clock,
    className: "text-amber-500 animate-pulse",
    bgClassName: "bg-amber-500/10",
  },
};

export function TestResults({ testCases, className, hideHeader }: TestResultsProps) {
  // The heading and the score are the same two strings the result panels show, so both
  // read `panels.*` rather than keeping a second copy of them.
  const t = useTranslations("challenge");
  const passedCount = testCases.filter((tc) => tc.status === "passed").length;
  const totalCount = testCases.length;

  return (
    <div className={cn("rounded-none border border-border bg-card", className)}>
      {!hideHeader && (
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="font-semibold">{t("panels.testResults")}</h3>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-sm font-medium",
              passedCount === totalCount
                ? "text-emerald-500"
                : "text-muted-foreground",
            )}
          >
            {t("panels.passed", { passed: passedCount, total: totalCount })}
          </span>
        </div>
      </div>
      )}

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

              {testCase.input != null &&
                testCase.expected != null &&
                (st === "failed" || st === "passed") && (
                  <div
                    className={cn(
                      "mt-3 space-y-2 rounded-lg p-3 font-mono text-sm break-all",
                      st === "failed"
                        ? "bg-rose-500/5"
                        : "bg-emerald-500/5 border border-emerald-500/15",
                    )}
                  >
                    <div>
                      <span className="text-muted-foreground">{t("testCase.input")}</span>
                      <span>{testCase.input}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{t("testCase.expected")}</span>
                      <span className="text-emerald-500">
                        {testCase.expected}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{t("testCase.actual")}</span>
                      <span
                        className={
                          st === "failed"
                            ? "text-rose-500"
                            : "text-emerald-400"
                        }
                      >
                        {testCase.actual != null && testCase.actual !== ""
                          ? String(testCase.actual)
                          : "-"}
                      </span>
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
