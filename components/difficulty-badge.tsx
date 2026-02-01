import { cn } from "@/lib/utils";

type Difficulty = "easy" | "medium" | "hard";

interface DifficultyBadgeProps {
  difficulty: Difficulty;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const difficultyConfig: Record<
  Difficulty,
  { label: string; className: string }
> = {
  easy: {
    label: "Einfach",
    className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  },
  medium: {
    label: "Mittel",
    className: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  },
  hard: {
    label: "Schwer",
    className: "bg-rose-500/10 text-rose-500 border-rose-500/20",
  },
};

export function DifficultyBadge({
  difficulty,
  size = "md",
  className,
}: DifficultyBadgeProps) {
  const config = difficultyConfig[difficulty];

  const sizeClasses = {
    sm: "px-2 h-6 text-xs border-2",
    md: "px-3 h-9 text-sm border-2",
    lg: "px-4 h-10 text-base border-2",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center border-2 font-bold font-sans uppercase tracking-wide",
        config.className,
        sizeClasses[size],
        className,
      )}
    >
      {config.label}
    </span>
  );
}
