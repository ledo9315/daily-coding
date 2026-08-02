"use client";

import { useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { FlickeringGrid } from "@/components/ui/flickering-grid";

type AnimatedFlickeringGridProps = {
  squareSize?: number;
  gridGap?: number;
  flickerChance?: number;
  color?: string;
  maxOpacity?: number;
  className?: string;
};

const FRAME_INTERVAL_MS = 160;

/**
 * The original independently flickering rectangles, with bounded rendering work.
 * Only rectangles whose opacity changes are repainted, the canvas is kept at CSS-pixel
 * resolution, and animation stops while off-screen or when the tab is hidden.
 */
export function AnimatedFlickeringGrid({
  squareSize = 4,
  gridGap = 6,
  flickerChance = 0.1,
  color = "#A371F7",
  maxOpacity = 0.2,
  className,
}: AnimatedFlickeringGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawSquare = useCallback(
    (
      context: CanvasRenderingContext2D,
      index: number,
      columns: number,
      opacity: number,
    ) => {
      const tileSize = squareSize + gridGap;
      const x = (index % columns) * tileSize;
      const y = Math.floor(index / columns) * tileSize;

      context.clearRect(x, y, squareSize, squareSize);
      context.globalAlpha = opacity;
      context.fillRect(x, y, squareSize, squareSize);
    },
    [gridGap, squareSize],
  );

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!container || !canvas || !context) return;

    let animationFrame = 0;
    let lastFrame = 0;
    let running = false;
    let inView = false;
    let columns = 1;
    let opacities = new Float32Array(0);

    const setup = () => {
      const width = Math.max(1, Math.ceil(container.clientWidth));
      const height = Math.max(1, Math.ceil(container.clientHeight));
      const tileSize = squareSize + gridGap;
      columns = Math.max(1, Math.ceil(width / tileSize));
      const rows = Math.max(1, Math.ceil(height / tileSize));

      // Intentionally cap the backing store at one device pixel per CSS pixel. These are
      // pixel-art rectangles; Retina resolution would quadruple memory without improving them.
      canvas.width = width;
      canvas.height = height;
      context.fillStyle = color;
      opacities = new Float32Array(columns * rows);

      context.clearRect(0, 0, width, height);
      for (let index = 0; index < opacities.length; index += 1) {
        const opacity = Math.random() * maxOpacity;
        opacities[index] = opacity;
        drawSquare(context, index, columns, opacity);
      }
      context.globalAlpha = 1;
    };

    const tick = (now: number) => {
      if (!running) return;
      const elapsed = now - lastFrame;

      if (elapsed >= FRAME_INTERVAL_MS && opacities.length > 0) {
        lastFrame = now;
        const changedCount = Math.max(
          1,
          Math.round(opacities.length * flickerChance * (elapsed / 1000)),
        );

        for (let change = 0; change < changedCount; change += 1) {
          const index = Math.floor(Math.random() * opacities.length);
          const opacity = Math.random() * maxOpacity;
          opacities[index] = opacity;
          drawSquare(context, index, columns, opacity);
        }
        context.globalAlpha = 1;
      }

      animationFrame = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running || document.hidden) return;
      running = true;
      lastFrame = performance.now();
      animationFrame = requestAnimationFrame(tick);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(animationFrame);
    };

    setup();
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const resizeObserver = new ResizeObserver(setup);
    resizeObserver.observe(container);

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      inView = Boolean(entry?.isIntersecting);
      if (inView && !reducedMotion.matches) start();
      else stop();
    });
    intersectionObserver.observe(container);

    const onVisibilityChange = () => {
      if (document.hidden) stop();
      else if (inView && !reducedMotion.matches) start();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      stop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [color, drawSquare, flickerChance, gridGap, maxOpacity, squareSize]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={cn("pointer-events-none h-full w-full", className)}
    >
      <FlickeringGrid
        color={color}
        gridGap={gridGap}
        maxOpacity={maxOpacity * 0.15}
        squareSize={squareSize}
        className="absolute inset-0"
      />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
