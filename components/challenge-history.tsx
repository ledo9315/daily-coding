import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DifficultyBadge } from "@/components/difficulty-badge"
import { PointsChip } from "@/components/points-chip"
import { CheckCircle2, XCircle, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChallengeHistoryEntry {
  id: string
  title: string
  date: string
  difficulty: "easy" | "medium" | "hard"
  status: "completed" | "failed" | "skipped"
  points: number
  time?: string
  rank?: number
}

interface ChallengeHistoryProps {
  entries: ChallengeHistoryEntry[]
  className?: string
}

const statusConfig = {
  completed: {
    icon: CheckCircle2,
    label: "Abgeschlossen",
    className: "text-emerald-500",
  },
  failed: {
    icon: XCircle,
    label: "Nicht bestanden",
    className: "text-rose-500",
  },
  skipped: {
    icon: Clock,
    label: "Übersprungen",
    className: "text-muted-foreground",
  },
}

export function ChallengeHistory({ entries, className }: ChallengeHistoryProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Letzte Challenges</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {entries.map((entry) => {
            const config = statusConfig[entry.status]
            const StatusIcon = config.icon

            return (
              <div
                key={entry.id}
                className="flex items-center gap-4 rounded-lg border border-border bg-card p-4"
              >
                <div className={cn("flex-shrink-0", config.className)}>
                  <StatusIcon className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="truncate font-medium">{entry.title}</h4>
                    <DifficultyBadge difficulty={entry.difficulty} />
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                    <span>{entry.date}</span>
                    {entry.time && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {entry.time}
                      </span>
                    )}
                    {entry.rank && <span>Rang #{entry.rank}</span>}
                  </div>
                </div>

                <PointsChip
                  points={entry.status === "completed" ? entry.points : 0}
                  variant={entry.status === "completed" ? "default" : "default"}
                />
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
