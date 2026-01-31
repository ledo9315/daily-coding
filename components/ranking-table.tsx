"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PointsChip } from "@/components/points-chip";
import {
  Trophy,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
} from "@nsmr/pixelart-react";
import { cn } from "@/lib/utils";

interface RankingEntry {
  rank: number;
  previousRank?: number;
  name: string;
  avatar?: string;
  initials: string;
  points: number;
  time?: string;
  challengesSolved?: number;
  team?: string;
  level?: number;
}

interface RankingTableProps {
  entries: RankingEntry[];
  showTime?: boolean;
  showTeam?: boolean;
  currentUserId?: string;
}

const rankIcons = [
  { icon: Trophy, className: "text-amber-500", bgClassName: "bg-amber-500/10" },
  {
    icon: Trophy,
    className: "text-zinc-400",
    bgClassName: "bg-zinc-400/10",
  },
  { icon: Trophy, className: "text-amber-700", bgClassName: "bg-amber-700/10" },
];

function RankChange({
  current,
  previous,
}: {
  current: number;
  previous?: number;
}) {
  if (previous === undefined) return null;

  const diff = previous - current;

  if (diff > 0) {
    return (
      <div className="flex items-center gap-0.5 text-emerald-500">
        <TrendingUp className="h-3 w-3" />
        <span className="text-xs font-medium">{diff}</span>
      </div>
    );
  }

  if (diff < 0) {
    return (
      <div className="flex items-center gap-0.5 text-rose-500">
        <TrendingDown className="h-3 w-3" />
        <span className="text-xs font-medium">{Math.abs(diff)}</span>
      </div>
    );
  }

  return <Minus className="h-3 w-3 text-muted-foreground" />;
}

export function RankingTable({
  entries,
  showTime = false,
  showTeam = false,
}: RankingTableProps) {
  return (
    <div className="overflow-hidden rounded-none border border-border">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground w-16">
                Rang
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Entwickler
              </th>
              {showTeam && (
                <th className="hidden px-4 py-3 text-left text-sm font-medium text-muted-foreground sm:table-cell">
                  Team
                </th>
              )}
              {showTime && (
                <th className="hidden px-4 py-3 text-left text-sm font-medium text-muted-foreground md:table-cell">
                  Zeit
                </th>
              )}
              <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                Punkte
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {entries.map((entry) => {
              const isTopThree = entry.rank <= 3;
              const RankConfig = rankIcons[entry.rank - 1];

              return (
                <tr
                  key={entry.rank}
                  className={cn(
                    "transition-colors hover:bg-secondary/30",
                    isTopThree && "bg-secondary/20",
                  )}
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      {RankConfig ? (
                        <div
                          className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-full",
                            RankConfig.bgClassName,
                          )}
                        >
                          <RankConfig.icon
                            className={cn("h-4 w-4", RankConfig.className)}
                          />
                        </div>
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center">
                          <span className="text-sm font-bold text-muted-foreground">
                            {entry.rank}
                          </span>
                        </div>
                      )}
                      <RankChange
                        current={entry.rank}
                        previous={entry.previousRank}
                      />
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={entry.avatar || "/placeholder.svg"}
                          alt={entry.name}
                        />
                        <AvatarFallback>{entry.initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{entry.name}</p>
                          {entry.level && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary border border-primary/20">
                              Lvl {entry.level}
                            </span>
                          )}
                        </div>
                        {entry.challengesSolved !== undefined && (
                          <p className="text-sm text-muted-foreground">
                            {entry.challengesSolved} Challenges gelöst
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {showTeam && (
                    <td className="hidden px-4 py-4 sm:table-cell">
                      <span className="text-sm text-muted-foreground">
                        {entry.team}
                      </span>
                    </td>
                  )}

                  {showTime && (
                    <td className="hidden px-4 py-4 md:table-cell">
                      {entry.time && (
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {entry.time}
                        </div>
                      )}
                    </td>
                  )}

                  <td className="px-4 py-4 text-right">
                    <PointsChip
                      points={entry.points}
                      variant={isTopThree ? "highlight" : "default"}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
