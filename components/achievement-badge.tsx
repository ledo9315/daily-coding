import {
  Bookmark,
  BookOpen,
  Bullseye,
  CalendarCheck,
  CalendarWeek,
  ChartBar,
  Check,
  Clock,
  Code,
  Coin,
  Comment,
  Downasaur,
  Heart,
  Hourglass,
  Lightbulb,
  Map,
  Minus,
  Power,
  Repeat,
  Shield,
  Shuffle,
  Sun,
  TrendingUp,
  Trophy,
  Zap,
} from "@nsmr/pixelart-react";
import { cn } from "@/lib/utils";
// import type { LucideIcon } from "lucide-react"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Check,
  CalendarWeek,
  Clock,
  Trophy,
  Zap,
  Bullseye,
  Code,
  CalendarCheck,
  TrendingUp,
  Shuffle,
  ChartBar,
  Coin,
  Power,
  Map,
  Shield,
  Repeat,
  Downasaur,
  Hourglass,
  Sun,
  Comment,
  Heart,
  Lightbulb,
  BookOpen,
  Minus,
};

/** The glyph for an achievement's `iconKey`; anything unknown falls back to the bookmark. */
export function resolveAchievementIcon(
  iconKey: string
): React.ComponentType<{ className?: string }> {
  return iconMap[iconKey] ?? Bookmark;
}

interface AchievementBadgeProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  unlocked?: boolean;
  rarity?: "common" | "rare" | "epic" | "legendary";
  unlockedAt?: string;
  /** Standing towards the goal; only rendered while locked (#96). */
  progress?: { current: number; target: number; label?: string };
  className?: string;
}

const rarityConfig = {
  common: {
    bgClassName: "bg-green-500/10",
    borderClassName: "border-green-500/30",
    iconClassName: "text-green-500",
    labelClassName: "text-green-500",
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
};

export function AchievementBadge({
  title,
  description,
  icon: Icon,
  unlocked = true,
  rarity = "common",
  unlockedAt,
  progress,
  className,
}: AchievementBadgeProps) {
  const config = rarityConfig[rarity];
  const percent =
    progress && progress.target > 0
      ? Math.min(100, Math.round((progress.current / progress.target) * 100))
      : 0;

  return (
    <div
      className={cn(
        "relative overflow-hidden border-2 p-4 transition-all",
        unlocked ? config.borderClassName : "border-border",
        unlocked ? config.bgClassName : "bg-secondary/30",
        !unlocked && "opacity-50 grayscale",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center border-2 border-transparent",
            unlocked ? config.bgClassName : "bg-muted",
          )}
        >
          {/* `fill-current`: the pixelart Lightbulb path ships without `fill="currentColor"`
              and would render black. */}
          <Icon
            className={cn(
              "h-6 w-6 fill-current",
              unlocked ? config.iconClassName : "text-muted-foreground",
            )}
          />
        </div>
        <div className="min-w-0 flex-1">
          {/* `min-w-0` down the whole flex chain, otherwise the title refuses to shrink
              and widens the card past the viewport (#79). Wrapping, not truncating - the
              rarity label drops to its own line when the title needs the width. */}
          <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">
            <h4 className="min-w-0 font-semibold break-words">{title}</h4>
            {unlocked && (
              <span
                className={cn("shrink-0 text-xs font-medium", config.labelClassName)}
              >
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
          {!unlocked && progress && (
            <div className="mt-2">
              <p className="text-xs text-muted-foreground">
                {progress.label ? `${progress.label}: ` : ""}
                {progress.current}/{progress.target}
              </p>
              {/* ponytail: a div with an inline width, not the shadcn Progress
                  primitive - that one animates via a transform and would not survive
                  the grayscale/opacity treatment of a locked badge as legibly. */}
              <div
                className="mt-1 h-1.5 w-full bg-muted"
                role="progressbar"
                aria-valuenow={progress.current}
                aria-valuemin={0}
                aria-valuemax={progress.target}
              >
                <div className="h-full bg-foreground/40" style={{ width: `${percent}%` }} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
