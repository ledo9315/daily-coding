"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Clock } from "@nsmr/pixelart-react";
import { getMsUntilNextUtcMidnight } from "@/lib/utc-midnight";

/**
 * The unit labels used to be prop strings - `label="Std"` - which the ESLint ratchet cannot
 * see: a literal handed to a component is syntactically a value, not copy (#293).
 */
interface CountdownTimerProps {
  className?: string;
  /**
   * `inline` is the small widget next to a heading (challenge page, today's card). `display`
   * makes the clock the focal point of a section: digit plates in the pixel face.
   *
   * The landing used to scale the inline variant up by 1.5, which magnified a widget instead
   * of showing a clock - the pixel icon and the 12px labels grew along with it.
   */
  variant?: "inline" | "display";
}

function formatTime(ms: number) {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((ms % (1000 * 60)) / 1000);

  return {
    hours: hours.toString().padStart(2, "0"),
    minutes: minutes.toString().padStart(2, "0"),
    seconds: seconds.toString().padStart(2, "0"),
  };
}

export function CountdownTimer({
  className,
  variant = "inline",
}: CountdownTimerProps) {
  const t = useTranslations("dashboard");
  const [timeLeft, setTimeLeft] = useState(() => getMsUntilNextUtcMidnight());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getMsUntilNextUtcMidnight());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const { hours, minutes, seconds } = formatTime(timeLeft);

  if (variant === "display") {
    return (
      <div className={cn("flex items-start gap-2 sm:gap-4", className)}>
        <TimePlate value={hours} label={t("countdown.hours")} />
        <Colon />
        <TimePlate value={minutes} label={t("countdown.minutes")} />
        <Colon />
        <TimePlate value={seconds} label={t("countdown.seconds")} />
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Clock className="h-5 w-5 text-muted-foreground" />
      <div className="flex items-start gap-1">
        <TimeBlock value={hours} label={t("countdown.hours")} />
        <span className="text-xl font-bold text-muted-foreground">:</span>
        <TimeBlock value={minutes} label={t("countdown.minutes")} />
        <span className="text-xl font-bold text-muted-foreground">:</span>
        <TimeBlock value={seconds} label={t("countdown.seconds")} />
      </div>
    </div>
  );
}

function TimeBlock({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span
        className="text-2xl font-bold tabular-nums leading-none"
        suppressHydrationWarning
      >
        {value}
      </span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

/**
 * `tabular-nums` matters more here than in the small variant: the plate must not twitch in
 * width once a second. The pixel face is monospaced anyway, the class is the guarantee.
 */
function TimePlate({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <span
        className="rounded-lg border border-border bg-card/80 px-4 py-3 font-heading text-3xl leading-none tabular-nums text-foreground shadow-lg backdrop-blur-sm sm:px-6 sm:py-5 sm:text-5xl"
        suppressHydrationWarning
      >
        {value}
      </span>
      <span className="font-code text-xs uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

function Colon() {
  return (
    <span
      aria-hidden
      className="font-heading text-2xl leading-none text-primary/60 sm:text-4xl mt-3 sm:mt-5"
    >
      :
    </span>
  );
}
