"use client";

import { useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import confetti from "canvas-confetti";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { SubmitCelebration } from "@/lib/api";
import { Trophy, Zap } from "@nsmr/pixelart-react";
import { TestResults, type TestCase } from "@/components/test-results";

/** Own fullscreen canvas via `confetti.create` — more reliable than the global default canvas, which suffers from stacking issues in Next/Radix. */
const CONFETTI_LAYER_Z = 10050;
const MODAL_ABOVE_Z = 10060;

function useFullscreenConfetti(active: boolean, canvasEl: HTMLCanvasElement | null) {
  useLayoutEffect(() => {
    if (!active || !canvasEl) return;

    const myConfetti = confetti.create(canvasEl, {
      resize: true,
      useWorker: false,
    });

    const duration = 3_200;
    const end = Date.now() + duration;
    const colors = ["#a786ff", "#88ff5a", "#fcff42", "#ff5e7e", "#26ccff"];
    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const fire = (particleCount: number) => {
      void myConfetti({
        startVelocity: 28,
        spread: 360,
        ticks: 55,
        particleCount,
        colors,
        origin: { x: randomInRange(0.12, 0.32), y: randomInRange(0.15, 0.35) },
      });
      void myConfetti({
        startVelocity: 28,
        spread: 360,
        ticks: 55,
        particleCount,
        colors,
        origin: { x: randomInRange(0.68, 0.88), y: randomInRange(0.15, 0.35) },
      });
    };

    fire(48);
    const id = window.setInterval(() => {
      if (Date.now() > end) {
        clearInterval(id);
        return;
      }
      const particleCount = Math.max(
        12,
        Math.floor(36 * ((end - Date.now()) / duration))
      );
      fire(particleCount);
    }, 220);

    return () => {
      clearInterval(id);
      myConfetti.reset();
    };
  }, [active, canvasEl]);
}

export function ChallengeSuccessModal({
  open,
  onOpenChange,
  celebration,
  testRunsBeforeSubmit,
  pointsEarned,
  testCases,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  celebration: SubmitCelebration | null;
  /** Number of "run tests" clicks before the final submission. */
  testRunsBeforeSubmit: number;
  pointsEarned: number;
  /** Optional: the same test details as the sidebar (input / expected / actual). */
  testCases?: TestCase[];
}) {
  const [confettiCanvas, setConfettiCanvas] = useState<HTMLCanvasElement | null>(null);
  useFullscreenConfetti(Boolean(open && celebration), confettiCanvas);

  if (!celebration) return null;

  const attemptLine =
    testRunsBeforeSubmit === 1
      ? "Mit 1 Testlauf!"
      : `Mit ${testRunsBeforeSubmit} Testläufen!`;

  /** `streak` / `streakRecord`: consecutive UTC days with a solved challenge; the record is the longest streak ever. */
  const streakLine =
    celebration.streakRecord > celebration.streak
      ? `${celebration.streak}-tägige Gewinnserie! Dein Rekord: ${celebration.streakRecord} Tage.`
      : `${celebration.streak}-tägige Gewinnserie!`;

  const confettiLayer =
    typeof document !== "undefined" && open
      ? createPortal(
          <div
            className="pointer-events-none fixed inset-0"
            style={{ zIndex: CONFETTI_LAYER_Z }}
            aria-hidden
          >
            <canvas
              ref={(el) => setConfettiCanvas(el)}
              className="block h-full w-full"
            />
          </div>,
          document.body
        )
      : null;

  return (
    <>
      {confettiLayer}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="rounded-none border-2 border-primary/40 bg-linear-to-b from-card to-secondary/80 shadow-[0_0_60px_-12px_rgba(163,113,247,0.45)] sm:max-w-lg overflow-hidden gap-8 p-8 sm:p-10"
          style={{ zIndex: MODAL_ABOVE_Z }}
        >
          <DialogHeader className="space-y-3 text-center sm:text-center px-0">
            <DialogTitle className="font-pixel text-3xl sm:text-4xl text-primary tracking-wide uppercase leading-tight">
              Großartig!
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-5">
            <div className="grid grid-cols-1 gap-4">
              <div className="flex flex-col gap-2 rounded-none border border-amber-500/30 bg-amber-500/5 px-5 py-4 min-h-22 justify-center">
                <span className="flex items-center gap-2 text-xs uppercase tracking-wider text-amber-600/90 dark:text-amber-400/90 font-semibold">
                  <Trophy className="h-4 w-4 shrink-0" fill="currentColor" />
                  Punkte
                </span>
                <span className="font-mono text-3xl sm:text-4xl tabular-nums text-amber-500 font-bold">
                  +{pointsEarned}
                </span>
              </div>
            </div>

            <p className="text-base sm:text-[1.05rem] leading-relaxed text-foreground border-l-4 border-primary/60 pl-4 py-1">
              {attemptLine}
            </p>

            <div className="flex gap-3 rounded-none border border-emerald-500/25 bg-emerald-500/5 px-5 py-4">
              <Zap className="h-6 w-6 shrink-0 text-emerald-500 mt-0.5" fill="currentColor" />
              <p className="text-base sm:text-[1.05rem] leading-relaxed text-foreground">
                {streakLine}
              </p>
            </div>

            {testCases && testCases.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Testübersicht
                </p>
                <div className="max-h-[min(45vh,320px)] overflow-y-auto rounded-none border border-border bg-card/80">
                  <TestResults testCases={testCases} className="border-0 shadow-none" />
                </div>
              </div>
            ) : null}
          </div>

          <DialogFooter className="sm:justify-center pt-2">
            <Button
              type="button"
              size="lg"
              className="rounded-none w-full sm:min-w-[200px] text-base font-semibold"
              onClick={() => onOpenChange(false)}
            >
              Weiter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
