import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface PointsChipProps {
  points: number
  size?: "sm" | "md" | "lg"
  variant?: "default" | "highlight"
  className?: string
}

export function PointsChip({ points, size = "md", variant = "default", className }: PointsChipProps) {
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
    lg: "px-3 py-1.5 text-base",
  }

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-3.5 w-3.5",
    lg: "h-4 w-4",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-semibold",
        variant === "default"
          ? "bg-primary/10 text-primary"
          : "bg-primary text-primary-foreground",
        sizeClasses[size],
        className
      )}
    >
      <Star className={cn(iconSizes[size], "fill-current")} />
      <span>{points.toLocaleString("de-DE")}</span>
    </div>
  )
}
