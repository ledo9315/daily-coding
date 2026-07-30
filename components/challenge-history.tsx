import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DifficultyBadge } from "@/components/difficulty-badge";
import { PointsChip } from "@/components/points-chip";
import { Check, Close, Clock } from "@nsmr/pixelart-react";
import { cn } from "@/lib/utils";

interface ChallengeHistoryEntry {
  id: string;
  title: string;
  date: string;
  difficulty: "easy" | "medium" | "hard";
  status: "pending" | "completed" | "failed" | "skipped";
  points: number;
  rank?: number;
}

interface ChallengeHistoryProps {
  entries: ChallengeHistoryEntry[];
  className?: string;
}

const statusConfig = {
  pending: {
    icon: Clock,
    label: "Ausstehend",
    className: "text-amber-500",
  },
  completed: {
    icon: Check,
    label: "Abgeschlossen",
    className: "text-emerald-500",
  },
  failed: {
    icon: Close,
    label: "Nicht bestanden",
    className: "text-rose-500",
  },
  skipped: {
    icon: Clock,
    label: "Übersprungen",
    className: "text-muted-foreground",
  },
};

export function ChallengeHistory({
  entries,
  className,
}: ChallengeHistoryProps) {
  return (
    <Card className={className}>
      <CardHeader className="mb-2">
        <CardTitle>Letzte Challenges</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {entries.map((entry) => {
            const config = statusConfig[entry.status];
            const StatusIcon = config.icon;

            return (
              <div
                key={entry.id}
                className="flex items-center gap-4 border-2 border-border bg-card p-4"
              >
                <div className={cn("shrink-0", config.className)}>
                  <StatusIcon className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  {/*
                    `min-w-0` on every flex ancestor, not just this one: a flex item
                    defaults to `min-width: auto`, so without it the title refuses to
                    shrink and the row pushes the whole grid column past the viewport (#79).
                    Wrapping instead of truncating, because "Array Ma…" tells a phone user
                    nothing — the badge drops to its own line when the title needs the room.
                  */}
                  <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                    <h4 className="min-w-0 font-medium break-words">{entry.title}</h4>
                    <DifficultyBadge size="sm" difficulty={entry.difficulty} />
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                    <span>{entry.date}</span>
                    {entry.rank && <span>Rang #{entry.rank}</span>}
                  </div>
                </div>

                <div className="shrink-0">
                  <PointsChip
                    points={entry.status === "completed" ? entry.points : 0}
                    variant="default"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
