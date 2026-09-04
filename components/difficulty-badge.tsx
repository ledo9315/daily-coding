import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

type Difficulty = "easy" | "medium" | "hard";

interface DifficultyBadgeProps {
  difficulty: Difficulty;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const difficultyClassName: Record<Difficulty, string> = {
  easy: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  medium: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  hard: "bg-rose-500/10 text-rose-500 border-rose-500/20",
};

export function DifficultyBadge({
  difficulty,
  size = "md",
  className,
}: DifficultyBadgeProps) {
  const t = useTranslations("challenge");

  const sizeClasses = {
    sm: "px-2 h-6 text-xs border-2",
    md: "px-3 h-9 text-sm border-2",
    lg: "px-4 h-10 text-base border-2",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center border-2 font-bold font-sans uppercase tracking-wide",
        difficultyClassName[difficulty],
        sizeClasses[size],
        className,
      )}
    >
      {t(`difficulty.${difficulty}`)}
    </span>
  );
}
