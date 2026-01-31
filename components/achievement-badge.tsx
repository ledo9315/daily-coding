import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface AchievementBadgeProps {
  title: string
  description: string
  icon: LucideIcon
  unlocked?: boolean
  rarity?: "common" | "rare" | "epic" | "legendary"
  unlockedAt?: string
  className?: string
}

const rarityConfig = {
  common: {
    bgClassName: "bg-zinc-500/10",
    borderClassName: "border-zinc-500/30",
    iconClassName: "text-zinc-500",
    labelClassName: "text-zinc-500",
    label: "Gewöhnlich",
  },
  rare: {
    bgClassName: "bg-blue-500/10",
    borderClassName: "border-blue-500/30",
    iconClassName: "text-blue-500",
    labelClassName: "text-blue-500",
    label: "Selten",
  },
  epic: {
    bgClassName: "bg-purple-500/10",
    borderClassName: "border-purple-500/30",
    iconClassName: "text-purple-500",
    labelClassName: "text-purple-500",
    label: "Episch",
  },
  legendary: {
    bgClassName: "bg-amber-500/10",
    borderClassName: "border-amber-500/30",
    iconClassName: "text-amber-500",
    labelClassName: "text-amber-500",
    label: "Legendär",
  },
}

export function AchievementBadge({
  title,
  description,
  icon: Icon,
  unlocked = true,
  rarity = "common",
  unlockedAt,
  className,
}: AchievementBadgeProps) {
  const config = rarityConfig[rarity]

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border p-4 transition-all",
        unlocked ? config.borderClassName : "border-border",
        unlocked ? config.bgClassName : "bg-secondary/30",
        !unlocked && "opacity-50 grayscale",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg",
            unlocked ? config.bgClassName : "bg-muted"
          )}
        >
          <Icon className={cn("h-6 w-6", unlocked ? config.iconClassName : "text-muted-foreground")} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="truncate font-semibold">{title}</h4>
            {unlocked && (
              <span className={cn("text-xs font-medium", config.labelClassName)}>
                {config.label}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
          {unlocked && unlockedAt && (
            <p className="mt-2 text-xs text-muted-foreground">
              Freigeschaltet am {unlockedAt}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
