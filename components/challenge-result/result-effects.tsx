"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FullscreenConfetti } from "@/components/fullscreen-confetti";
import { takeResultHandover } from "@/lib/challenge-result-handover";

/**
 * Celebrates only the arrival straight from a submission: the handover is consumed on
 * read, so a reload or a later visit to an older solution stays quiet.
 */
export function ResultEffects({ submissionId }: { submissionId: string }) {
  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => {
    const handover = takeResultHandover(window.sessionStorage, submissionId);
    if (!handover) return;

    setCelebrate(true);
    for (const achievement of handover.unlockedAchievements) {
      toast.success(achievement.title, { description: achievement.description });
    }
  }, [submissionId]);

  return <FullscreenConfetti active={celebrate} />;
}
