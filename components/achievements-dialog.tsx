"use client";

import { useTranslations } from "next-intl";
import { Bookmark } from "@nsmr/pixelart-react";
import { AchievementBadge, resolveAchievementIcon } from "@/components/achievement-badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { sortAchievementsByRarity } from "@/lib/achievements-featured";
import type { Achievement } from "@/lib/api";

interface AchievementsDialogBodyProps {
  achievements: Achievement[];
  unlockedCount: number;
  total: number;
  showProgress?: boolean;
}

/**
 * Everything inside the dialog frame. Exported separately because Radix renders the
 * frame through a portal, which stays empty on the server - so this is the part a
 * static render can see.
 *
 * One list, no filters. Splitting 23 entries across "all", "unlocked" and "open" gave
 * three views of a list short enough to read in full, and the tab bar cost more room than
 * the scrolling it saved. What the tabs were really for - seeing what is still open - the
 * rarity grouping answers in place.
 */
export function AchievementsDialogBody({
  achievements,
  unlockedCount,
  total,
  showProgress = true,
}: AchievementsDialogBodyProps) {
  const t = useTranslations("profile");
  const sorted = sortAchievementsByRarity(achievements);

  return (
    <>
      <DialogHeader className="p-6 pb-0 pr-12">
        <DialogTitle className="flex items-center gap-2">
          <Bookmark className="h-5 w-5 text-amber-500" />
          {t("achievements.title", { unlocked: unlockedCount, total })}
        </DialogTitle>
        <DialogDescription className="sr-only">
          {t("achievements.dialogDescription")}
        </DialogDescription>
      </DialogHeader>
      <div className="h-[70vh] overflow-y-auto p-6 pt-4">
        <div className="grid gap-3 sm:grid-cols-2">
          {sorted.map((achievement) => (
            <AchievementBadge
              key={achievement.id}
              title={achievement.title}
              description={achievement.description}
              icon={resolveAchievementIcon(achievement.iconKey)}
              unlocked={achievement.unlocked}
              rarity={achievement.rarity}
              unlockedAtIso={achievement.unlockedAtIso}
              progress={showProgress ? achievement.progress : undefined}
            />
          ))}
        </div>
      </div>
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
  const t = useTranslations("profile");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-3xl p-0 gap-0"
        closeLabel={t("closeDialog")}
      >
        <AchievementsDialogBody
          achievements={achievements}
          unlockedCount={unlockedCount}
          total={total}
          showProgress={showProgress}
        />
      </DialogContent>
    </Dialog>
  );
}
