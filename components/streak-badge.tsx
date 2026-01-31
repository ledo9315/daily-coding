import { Flame } from "lucide-react"
import { cn } from "@/lib/utils"

interface StreakBadgeProps {
  count: number
  size?: "sm" | "md" | "lg"
  className?: string
}

export function StreakBadge({ count, size = "md", className }: StreakBadgeProps) {
  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base",
  }

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-orange-500/10 font-semibold text-orange-500",
        sizeClasses[size],
        className
      )}
    >
      <Flame className={cn(iconSizes[size], "animate-pulse")} />
      <span>{count} Tage Streak</span>
    </div>
  )
}
