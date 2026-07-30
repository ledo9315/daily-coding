import { cn } from "@/lib/utils";

interface PointsChipProps {
  points: number;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "highlight";
  className?: string;
}

/**
 * Pixel star on a 9x9 grid, one `rect` per horizontal run.
 *
 * `@nsmr/pixelart-react` ships no plain star — only `MoonStar`/`MoonStars`, which mean
 * something else. Drawing nine rectangles is cheaper than pulling in a second icon
 * library for a single glyph, and `crispEdges` keeps the blocky look of the set.
 */
function PixelStar({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 9 9"
      className={className}
      fill="currentColor"
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="4" y="0" width="1" height="1" />
      <rect x="3" y="1" width="3" height="2" />
      <rect x="0" y="3" width="9" height="1" />
      <rect x="1" y="4" width="7" height="1" />
      <rect x="2" y="5" width="5" height="2" />
      <rect x="1" y="7" width="2" height="1" />
      <rect x="6" y="7" width="2" height="1" />
      <rect x="0" y="8" width="2" height="1" />
      <rect x="7" y="8" width="2" height="1" />
    </svg>
  );
}

/**
 * Points are a pure score: they are collected, never spent. There is no shop and no
 * unlock priced in points, so the previous coin icon promised an economy that does not
 * exist (#38). A star reads as "collected", and it collides with neither `Zap` (streak)
 * nor `Trophy` (rank).
 */
export function PointsChip({
  points,
  size = "md",
  variant = "default",
  className,
}: PointsChipProps) {
  const sizeClasses = {
    sm: "px-2 h-6 text-xs border-2",
    md: "px-3 h-9 text-sm border-2",
    lg: "px-4 h-10 text-base border-2",
  };

  /**
   * One step below the sizes the coin used. Its 24-unit viewBox carried padding, so the
   * glyph never filled the box; the star's 9x9 grid is edge to edge and would otherwise
   * read as noticeably bigger at the same class.
   */
  const iconSizes = {
    sm: "h-2.5 w-2.5",
    md: "h-3 w-3",
    lg: "h-4 w-4",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 font-bold font-sans tracking-wide",
        variant === "default"
          ? "bg-secondary text-accent border-border"
          : "bg-accent/10 text-accent border-accent/20",
        sizeClasses[size],
        className,
      )}
    >
      <PixelStar className={cn(iconSizes[size], "shrink-0")} />
      <span className="translate-y-px font-sans">
        {points.toLocaleString("de-DE")}
      </span>
    </div>
  );
}
