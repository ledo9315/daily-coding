"use client";

import Link from "next/link";
import { DifficultyBadge } from "@/components/difficulty-badge";
import { CountdownTimer } from "@/components/countdown-timer";
import { PointsChip } from "@/components/points-chip";
import { ArrowRight, Tournament, Zap, CheckDouble } from "@nsmr/pixelart-react";

import { cn } from "@/lib/utils";

interface TodaysChallengeCardProps {
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  points: number;
  category: string;
  /**
   * Status der heutigen Abgabe. Ist eine vorhanden, sperrt die Challenge-Seite
   * Editor, Tests und Abgabe — der Button darf dann kein Starten versprechen.
   */
  todayStatus?: "completed" | "failed" | "pending" | null;
  className?: string;
}

export function TodaysChallengeCard({
  title,
  description,
  difficulty,
  points,
  category,
  todayStatus = null,
  className,
}: TodaysChallengeCardProps) {
  const submittedToday = todayStatus != null;
  // „gelöst" nur wenn wirklich bestanden — ein Fehlversuch sperrt ebenfalls,
  // wäre aber falsch beschriftet.
  const label = !submittedToday
    ? "CHALLENGE STARTEN"
    : todayStatus === "completed"
      ? "BEREITS GELÖST — ANSEHEN"
      : "BEREITS ABGEGEBEN — ANSEHEN";

  return (
    <div className={cn("pixel-box relative overflow-hidden p-6", className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center border-2 border-primary bg-primary/20">
            <Tournament className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-md uppercase tracking-wider text-muted-foreground">
              TAGES-CHALLENGE
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs uppercase text-muted-foreground">
                {category}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 items-start">
          <DifficultyBadge difficulty={difficulty} size="md" />
          <PointsChip points={points} variant="highlight" size="md" />
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <h2 className="font-pixel text-lg text-foreground">{title}</h2>
        <p className="text-lg text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t-2 border-border pt-4">
        <div className="space-y-1">
          <p className="text-sm uppercase tracking-wider text-muted-foreground">
            Zeit verbleibend
          </p>
          <CountdownTimer />
        </div>

        <Link
          href="/challenge"
          className={cn(
            "pixel-btn inline-flex items-center gap-2 group",
            submittedToday
              ? "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
        >
          {submittedToday ? (
            <CheckDouble className="h-5 w-5" />
          ) : (
            <Zap className="h-5 w-5" />
          )}
          {label}
          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
