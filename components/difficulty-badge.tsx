import { cn } from "@/lib/utils"

type Difficulty = "easy" | "medium" | "hard"

interface DifficultyBadgeProps {
  difficulty: Difficulty
  className?: string
}

const difficultyConfig: Record<Difficulty, { label: string; className: string }> = {
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
}

export function DifficultyBadge({ difficulty, className }: DifficultyBadgeProps) {
  const config = difficultyConfig[difficulty]

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}
