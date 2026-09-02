"use client";

import { useState } from "react";
import { Bookmark } from "@nsmr/pixelart-react";
import { AchievementBadge, resolveAchievementIcon } from "@/components/achievement-badge";
import { AchievementsDialog } from "@/components/achievements-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FEATURED_ACHIEVEMENT_COUNT,
  pickFeaturedAchievements,
} from "@/lib/achievements-featured";
import type { Achievement } from "@/lib/api";

interface AchievementsCardProps {
  achievements: Achievement[];
  unlockedCount: number;
  total: number;
  showProgress?: boolean;
  className?: string;
}

export function AchievementsCard({
  achievements,
  unlockedCount,
  total,
  showProgress = true,
  className,
}: AchievementsCardProps) {
  const [open, setOpen] = useState(false);
  const featured = pickFeaturedAchievements(achievements, FEATURED_ACHIEVEMENT_COUNT);
  const hasMore = achievements.length > FEATURED_ACHIEVEMENT_COUNT;

  return (
    <Card className={className}>
      <CardHeader className="mb-2">
        <CardTitle className="flex items-center gap-2">
          <Bookmark className="h-5 w-5 text-amber-500" />
          Achievements {unlockedCount}/{total}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {featured.map((achievement) => (
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
        {hasMore && (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => setOpen(true)}
          >
            Alle {total} anzeigen
          </Button>
        )}
      </CardContent>
      {hasMore && (
        <AchievementsDialog
          achievements={achievements}
          unlockedCount={unlockedCount}
          total={total}
          open={open}
          onOpenChange={setOpen}
          showProgress={showProgress}
        />
      )}
    </Card>
  );
}
