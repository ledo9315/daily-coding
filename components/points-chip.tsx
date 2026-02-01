import { cn } from "@/lib/utils";
import { Coin } from "@nsmr/pixelart-react";

interface PointsChipProps {
  points: number;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "highlight";
  className?: string;
}

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

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
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
      <Coin
        className={cn(iconSizes[size], "fill-current shrink-0")}
        fill="currentColor"
      />
      <span className="translate-y-px font-sans">
        {points.toLocaleString("de-DE")}
      </span>
    </div>
  );
}
