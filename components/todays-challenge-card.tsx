"use client";

import Link from "next/link";
import { DifficultyBadge } from "@/components/difficulty-badge";
import { CountdownTimer } from "@/components/countdown-timer";
import { PointsChip } from "@/components/points-chip";
import { ArrowRight, Tournament, Zap } from "@nsmr/pixelart-react";

interface TodaysChallengeCardProps {
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  points: number;
  category: string;
}

export function TodaysChallengeCard({
  title,
  description,
  difficulty,
  points,
  category,
}: TodaysChallengeCardProps) {
  return (
    <div className="pixel-box relative overflow-hidden p-6">
      {/* Pixel art corner decorations */}
      <div className="absolute top-0 left-0 w-4 h-4 border-r-4 border-b-4 border-primary/30" />
      <div className="absolute top-0 right-0 w-4 h-4 border-l-4 border-b-4 border-primary/30" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-r-4 border-t-4 border-primary/30" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-l-4 border-t-4 border-primary/30" />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center border-2 border-accent bg-accent/20">
            <Tournament className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm uppercase tracking-wider text-muted-foreground">
              DAILY CHALLENGE
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs uppercase text-muted-foreground">
                {category}
              </span>
              <DifficultyBadge difficulty={difficulty} />
            </div>
          </div>
        </div>
        <PointsChip points={points} variant="highlight" />
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
            ZEIT VERBLEIBEND
          </p>
          <CountdownTimer />
        </div>

        <Link
          href="/challenge"
          className="pixel-btn inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 group"
        >
          <Zap className="h-5 w-5" />
          START CHALLENGE
          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
