"use client";

import { useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import confetti from "canvas-confetti";

const CONFETTI_LAYER_Z = 10050;

/** Fires once for as long as `active` stays true, on a portal canvas above everything. */
export function FullscreenConfetti({ active }: { active: boolean }) {
  const [canvasEl, setCanvasEl] = useState<HTMLCanvasElement | null>(null);

  useLayoutEffect(() => {
    if (!active || !canvasEl) return;

    // Own canvas rather than the library's global one, which loses its stacking context
    // inside Next/Radix portals.
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

  if (typeof document === "undefined" || !active) return null;

  return createPortal(
    <div
      className="pointer-events-none fixed inset-0"
      style={{ zIndex: CONFETTI_LAYER_Z }}
      aria-hidden
    >
      <canvas ref={(el) => setCanvasEl(el)} className="block h-full w-full" />
    </div>,
    document.body
  );
}
