import type { MonthlyActivity } from "@/lib/api";
import { progressPercentage } from "@/lib/progress-percentage";
import { cn } from "@/lib/utils";
import { Check } from "@nsmr/pixelart-react";

const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"] as const;

export function MonthlyActivityView({ activity }: { activity: MonthlyActivity }) {
  const monthTitle = new Date(Date.UTC(activity.year, activity.month - 1, 1)).toLocaleDateString(
    "de-DE",
    { month: "long", year: "numeric", timeZone: "UTC" }
  );

  const monthPct = progressPercentage(
    activity.completedDaysInMonthCount,
    activity.daysInMonth
  );

  return (
    <div className="space-y-5 font-sans">
      <div className="space-y-1">
        <p className="text-sm uppercase tracking-wider text-muted-foreground">Aktueller Monat</p>
        <p className="text-2xl font-bold capitalize leading-none tracking-tight text-foreground">
          {monthTitle}
        </p>
      </div>

      <div className="border border-border bg-secondary/40 p-2 sm:p-3">
        {/*
          gap-px + bg-border: klare Linien ohne doppelte Rahmen (kein border-2 zwischen Zellen).
        */}
        <div className="grid grid-cols-7 gap-px bg-border">
          {WEEKDAYS.map((w) => (
            <div
              key={w}
              className="flex h-8 items-center justify-center bg-secondary/90 text-xs font-bold uppercase tracking-wider text-muted-foreground sm:h-9 sm:text-sm"
            >
              {w}
            </div>
          ))}
          {activity.cells.map((cell, i) => (
            <div
              key={i}
              className={cn(
                "flex h-11 min-h-11 items-center justify-center text-sm font-bold tabular-nums transition-colors sm:h-12 sm:text-base",
                cell.day === null && "pointer-events-none bg-secondary/40",
                cell.day !== null &&
                  !cell.completed &&
                  "bg-card/70 text-muted-foreground hover:bg-muted/60",
                cell.completed &&
                  !cell.inStreak &&
                  "bg-primary/15 text-primary",
                cell.inStreak && "bg-primary/30 text-primary ring-1 ring-inset ring-primary/35"
              )}
              title={
                cell.day === null
                  ? undefined
                  : [
                      `Tag ${cell.day}`,
                      cell.completed ? "Challenge gelöst" : "kein Abschluss",
                      cell.inStreak ? "Teil der aktuellen Serie" : "",
                    ]
                      .filter(Boolean)
                      .join(" · ")
              }
            >
              {cell.completed ? (
                <Check className="h-5 w-5" fill="currentColor" />
              ) : (
                cell.day ?? ""
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-md text-muted-foreground">
            <span className="text-3xl font-bold tabular-nums text-primary">
              {activity.completedDaysInMonthCount}
            </span>
            <span> von </span>
            <span className="tabular-nums text-foreground">{activity.daysInMonth}</span>
            <span> Tagen mit Abschluss</span>
          </p>
          <p className="text-sm uppercase tracking-wider text-muted-foreground">
            Monat: <span className="font-sans text-xl font-bold text-primary tabular-nums">{monthPct}%</span>
          </p>
        </div>
        <div className="h-2.5 overflow-hidden bg-secondary">
          <div
            className="h-full bg-primary transition-[width] duration-500 ease-out"
            style={{ width: `${monthPct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
