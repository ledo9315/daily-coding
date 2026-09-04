import { Zap } from "@nsmr/pixelart-react";
import { getTranslations } from "next-intl/server";
import { cn } from "@/lib/utils";

interface StreakBadgeProps {
  count: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export async function StreakBadge({
  count,
  size = "md",
  className,
}: StreakBadgeProps) {
  const t = await getTranslations("profile");
  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 bg-orange-500/10 font-sans font-bold text-orange-500 border-2 border-orange-500/20",
        sizeClasses[size],
        className,
      )}
    >
      <Zap className={cn(iconSizes[size], "animate-pulse")} />
      <span>{t("profilePage.streakBadge", { count })}</span>
    </div>
  );
}
