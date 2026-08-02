import type { CSSProperties, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface FlickeringGridProps extends HTMLAttributes<HTMLDivElement> {
  squareSize?: number;
  gridGap?: number;
  flickerChance?: number;
  color?: string;
  width?: number;
  height?: number;
  maxOpacity?: number;
}

/**
 * A decorative pixel grid implemented as a static CSS background.
 *
 * The previous canvas redrew tens of thousands of squares on every animation frame. Several
 * instances run on the landing page, so CPU-throttled phones never became idle and Lighthouse
 * accumulated seconds of blocking work. The visual texture does not need JavaScript or a 60 fps
 * animation; CSS also renders immediately in the server response.
 */
export function FlickeringGrid({
  squareSize = 4,
  gridGap = 6,
  color = "rgb(0, 0, 0)",
  maxOpacity = 0.2,
  className,
  style,
  // Kept in the public API so existing call sites do not need visual/layout changes.
  flickerChance: _flickerChance,
  width: _width,
  height: _height,
  ...props
}: FlickeringGridProps) {
  const tileSize = squareSize + gridGap;
  const gridColor = `color-mix(in srgb, ${color} ${Math.round(maxOpacity * 100)}%, transparent)`;

  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none h-full w-full", className)}
      style={
        {
          backgroundImage: `linear-gradient(to right, ${gridColor} ${squareSize}px, transparent ${squareSize}px), linear-gradient(to bottom, ${gridColor} ${squareSize}px, transparent ${squareSize}px)`,
          backgroundSize: `${tileSize}px ${tileSize}px`,
          ...style,
        } as CSSProperties
      }
      {...props}
    />
  );
}
