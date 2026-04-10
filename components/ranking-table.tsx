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
import { avatarImageSrc } from "@/lib/avatar-src";
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
  level?: number;
}

interface RankingTableProps {
  entries: RankingEntry[];
  showTime?: boolean;
  /** Bei Tages-Speed-Ranking überall gleiche Challenge-Punkte — dann ausblenden. */
  showPoints?: boolean;
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
  showPoints = true,
}: RankingTableProps) {
  /** Zeit ist die letzte Spalte (Tages-Ranking ohne Punkte) — Inhalt rechts ausrichten. */
  const timeColumnLast = showTime && !showPoints;

  return (
    <div className="overflow-hidden rounded-none border border-border">
      <div className="overflow-x-auto">
        <table
          className={cn(
            "w-full",
            timeColumnLast && "table-fixed",
          )}
        >
          {timeColumnLast && (
            <colgroup>
              <col className="w-[4.75rem]" />
              <col />
              <col className="w-[6.25rem]" />
            </colgroup>
          )}
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th
                className={cn(
                  "px-4 py-3 text-left text-sm font-medium text-muted-foreground",
                  !timeColumnLast && "w-16",
                )}
              >
                Rang
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground min-w-0">
                Nutzer
              </th>
              {showTime && (
                <th
                  className={cn(
                    "px-4 py-3 text-sm font-medium text-muted-foreground whitespace-nowrap",
                    timeColumnLast ? "text-right" : "text-left",
                    showPoints && "hidden md:table-cell",
                  )}
                >
                  Zeit
                </th>
              )}
              {showPoints && (
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground whitespace-nowrap">
                  Punkte
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {entries.map((entry) => {
              const isTopThree = entry.rank <= 3;
              const RankConfig = rankIcons[entry.rank - 1];
              const avatarSrc = avatarImageSrc(entry.avatar);

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
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="h-10 w-10">
                        {avatarSrc ? (
                          <AvatarImage src={avatarSrc} alt={entry.name} />
                        ) : null}
                        <AvatarFallback
                          className={cn(
                            "font-sans text-xs font-semibold tracking-tight",
                            "bg-gradient-to-b from-zinc-600 to-zinc-900 text-zinc-100",
                            "ring-1 ring-inset ring-white/15",
                          )}
                        >
                          {entry.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{entry.name}</p>
                          {entry.level && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary border border-primary/20">
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

                  {showTime && (
                    <td
                      className={cn(
                        "px-4 py-4 align-middle",
                        timeColumnLast && "text-right tabular-nums",
                        showPoints && "hidden md:table-cell",
                      )}
                    >
                      {entry.time && (
                        <div
                          className={cn(
                            "inline-flex items-center gap-1.5 text-md text-muted-foreground",
                            timeColumnLast && "justify-end w-full",
                          )}
                        >
                          <Clock className="h-4 w-4 shrink-0" />
                          <span>{entry.time}</span>
                        </div>
                      )}
                    </td>
                  )}

                  {showPoints && (
                    <td className="px-4 py-4 text-right">
                      <PointsChip
                        points={entry.points}
                        variant={isTopThree ? "highlight" : "default"}
                      />
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
