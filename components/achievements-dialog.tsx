"use client";

import { useState } from "react";
import { Bookmark } from "@nsmr/pixelart-react";
import { AchievementBadge, resolveAchievementIcon } from "@/components/achievement-badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { sortAchievementsForDisplay } from "@/lib/achievements-featured";
import type { Achievement } from "@/lib/api";

export type AchievementFilter = "all" | "unlocked" | "locked";

export function filterAchievements(
  list: Achievement[],
  filter: AchievementFilter,
): Achievement[] {
  if (filter === "unlocked") return list.filter((a) => a.unlocked);
  if (filter === "locked") return list.filter((a) => !a.unlocked);
  return list;
}

const EMPTY_MESSAGES: Record<AchievementFilter, string | null> = {
  all: null,
  unlocked: "Noch nichts freigeschaltet. Die erste Challenge wartet.",
  locked: "Alles freigeschaltet. Respekt.",
};

interface AchievementsDialogBodyProps {
  achievements: Achievement[];
  unlockedCount: number;
  total: number;
  filter: AchievementFilter;
  onFilterChange: (filter: AchievementFilter) => void;
  showProgress?: boolean;
}

/**
 * Everything inside the dialog frame. Exported separately because Radix renders the
 * frame through a portal, which stays empty on the server - so this is the part a
 * static render can see.
 */
export function AchievementsDialogBody({
  achievements,
  unlockedCount,
  total,
  filter,
  onFilterChange,
  showProgress = true,
}: AchievementsDialogBodyProps) {
  const sorted = sortAchievementsForDisplay(achievements);
  const visible = filterAchievements(sorted, filter);
  const unlockedInList = sorted.filter((a) => a.unlocked).length;
  const lockedInList = sorted.length - unlockedInList;
  const emptyMessage = visible.length === 0 ? EMPTY_MESSAGES[filter] : null;

  return (
    <>
      <DialogHeader className="p-6 pb-0 pr-12">
        <DialogTitle className="flex items-center gap-2">
          <Bookmark className="h-5 w-5 text-amber-500" />
          Achievements {unlockedCount}/{total}
        </DialogTitle>
        <DialogDescription className="sr-only">Alle Achievements im Überblick</DialogDescription>
      </DialogHeader>
      <Tabs
        value={filter}
        onValueChange={(value) => onFilterChange(value as AchievementFilter)}
        className="gap-0"
      >
        <div className="px-6 pt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">
              Alle <span className="tabular-nums">{sorted.length}</span>
            </TabsTrigger>
            <TabsTrigger value="unlocked">
              Freigeschaltet <span className="tabular-nums">{unlockedInList}</span>
            </TabsTrigger>
            <TabsTrigger value="locked">
              Offen <span className="tabular-nums">{lockedInList}</span>
            </TabsTrigger>
          </TabsList>
        </div>
        {/* One content pane whose value follows the filter: the active trigger's
            aria-controls still resolves, without three copies of the same grid. */}
        <TabsContent
          value={filter}
          // `flex-none`: the primitive sets `flex-1`, whose zero basis makes a flex column
          // ignore the height and grow with the content.
          className="h-[70vh] flex-none overflow-y-auto p-6 pt-4"
        >
          {emptyMessage ? (
            <p className="py-6 text-center text-sm text-muted-foreground">{emptyMessage}</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {visible.map((achievement) => (
                <AchievementBadge
                  key={achievement.id}
                  title={achievement.title}
                  description={achievement.description}
                  icon={resolveAchievementIcon(achievement.iconKey)}
                  unlocked={achievement.unlocked}
                  rarity={achievement.rarity}
                  unlockedAt={achievement.unlockedAt}
                  progress={showProgress ? achievement.progress : undefined}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </>
  );
}

interface AchievementsDialogProps {
  achievements: Achievement[];
  unlockedCount: number;
  total: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  showProgress?: boolean;
}

export function AchievementsDialog({
  achievements,
  unlockedCount,
  total,
  open,
  onOpenChange,
  showProgress = true,
}: AchievementsDialogProps) {
  const [filter, setFilter] = useState<AchievementFilter>("all");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl p-0 gap-0">
        <AchievementsDialogBody
          achievements={achievements}
          unlockedCount={unlockedCount}
          total={total}
          filter={filter}
          onFilterChange={setFilter}
          showProgress={showProgress}
        />
      </DialogContent>
    </Dialog>
  );
}
