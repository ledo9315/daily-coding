import type { AchievementRarity } from "@/lib/generated/prisma/enums";
import { formatDate } from "@/lib/format";
import type { Achievement } from "@/lib/api";

type DefRow = {
  id: string;
  title: string;
  description: string;
  iconKey: string;
  rarity: AchievementRarity;
};

type UserAchievementRow = {
  achievementId: string;
  unlockedAt: Date | null;
};

/** „Blitzschnell“: mindestens eine Abgabe in ≤180 Sekunden (3 Minuten). */
const BLITZ_MAX_SECONDS = 180;

/**
 * Baut die Achievement-Liste für ein Profil inkl. Sperr-/Freigabe-Logik.
 * Ohne UserAchievement-Zeilen: „ach-1“ (Erste Schritte) bei ≥1 Abschluss; „ach-3“ (Blitzschnell) bei ≤3 Minuten.
 */
export function buildUserAchievementsView(
  defs: DefRow[],
  userAchievements: UserAchievementRow[],
  completedSubmissions: { createdAt: Date; timeTaken?: number | null }[]
): { achievements: Achievement[]; unlockedCount: number } {
  const totalSolved = completedSubmissions.length;
  const firstCompletedAt =
    completedSubmissions.length > 0
      ? completedSubmissions.reduce(
          (earliest, s) => (s.createdAt < earliest ? s.createdAt : earliest),
          completedSubmissions[0].createdAt
        )
      : null;

  const blitzEligible = completedSubmissions.filter(
    (s) => s.timeTaken != null && s.timeTaken > 0 && s.timeTaken <= BLITZ_MAX_SECONDS
  );
  const blitzFirstAt =
    blitzEligible.length > 0
      ? blitzEligible.reduce(
          (earliest, s) => (s.createdAt < earliest ? s.createdAt : earliest),
          blitzEligible[0].createdAt
        )
      : null;

  const progressByAchievementId = new Map(
    userAchievements.map((ua) => [ua.achievementId, ua])
  );

  const achievements: Achievement[] = defs.map((def) => {
    const ua = progressByAchievementId.get(def.id);
    const inferredFirstSteps =
      def.id === "ach-1" && totalSolved > 0 && ua?.unlockedAt == null;
    const inferredBlitz =
      def.id === "ach-3" && blitzEligible.length > 0 && ua?.unlockedAt == null;
    const unlocked =
      ua?.unlockedAt != null || inferredFirstSteps || inferredBlitz;
    let unlockedAt: string | undefined;
    if (ua?.unlockedAt) {
      unlockedAt = formatDate(ua.unlockedAt);
    } else if (inferredFirstSteps && firstCompletedAt) {
      unlockedAt = formatDate(firstCompletedAt);
    } else if (inferredBlitz && blitzFirstAt) {
      unlockedAt = formatDate(blitzFirstAt);
    }
    return {
      id: def.id,
      title: def.title,
      description: def.description,
      iconKey: def.iconKey,
      unlocked,
      rarity: def.rarity,
      unlockedAt,
    };
  });

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  return { achievements, unlockedCount };
}
