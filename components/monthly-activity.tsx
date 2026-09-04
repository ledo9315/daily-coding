import type { ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { MonthlyActivity } from "@/lib/api";
import { formatMonthYearLong } from "@/lib/format";
import { progressPercentage } from "@/lib/progress-percentage";
import { cn } from "@/lib/utils";
import { Check } from "@nsmr/pixelart-react";

/** Monday first, like the grid `lib/monthly-activity.ts` builds. */
const WEEKDAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

export function MonthlyActivityView({ activity }: { activity: MonthlyActivity }) {
  const locale = useLocale();
  const t = useTranslations("dashboard");
  const monthTitle = formatMonthYearLong(
    new Date(Date.UTC(activity.year, activity.month - 1, 1)),
    locale
  );

  const monthPct = progressPercentage(
    activity.completedDaysInMonthCount,
    activity.daysInMonth
  );

  return (
    <div className="space-y-5 font-sans">
      <div className="space-y-1">
        <p className="text-sm uppercase tracking-wider text-muted-foreground">
          {t("monthlyActivity.currentMonth")}
        </p>
        <p className="text-2xl font-bold capitalize leading-none tracking-tight text-foreground">
          {monthTitle}
        </p>
      </div>

      <div className="border border-border bg-secondary/40 p-2 sm:p-3">
        {/* gap-px + bg-border: clean lines without a double frame between two cells. */}
        <div className="grid grid-cols-7 gap-px bg-border">
          {WEEKDAYS.map((w) => (
            <div
              key={w}
              className="flex h-8 items-center justify-center bg-secondary/90 text-xs font-bold uppercase tracking-wider text-muted-foreground sm:h-9 sm:text-sm"
            >
              {t(`monthlyActivity.weekdays.${w}`)}
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
                      t("monthlyActivity.cell.day", { day: cell.day }),
                      cell.completed
                        ? t("monthlyActivity.cell.completed")
                        : t("monthlyActivity.cell.notCompleted"),
                      cell.inStreak ? t("monthlyActivity.cell.inStreak") : "",
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
            {t.rich("monthlyActivity.daysWithCompletion", {
              count: activity.completedDaysInMonthCount,
              days: activity.daysInMonth,
              big: (chunks: ReactNode) => (
                <span className="text-3xl font-bold tabular-nums text-primary">{chunks}</span>
              ),
              num: (chunks: ReactNode) => (
                <span className="tabular-nums text-foreground">{chunks}</span>
              ),
            })}
          </p>
          <p className="text-sm uppercase tracking-wider text-muted-foreground">
            {t("monthlyActivity.monthLabel")}{" "}
            <span className="font-sans text-xl font-bold text-primary tabular-nums">{monthPct}%</span>
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
