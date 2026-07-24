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

type CompletedSubmission = {
  createdAt: Date;
  timeTaken?: number | null;
  challenge?: { difficulty?: string | null } | null;
};

/** „Blitzschnell“ (ach-3): mindestens eine Abgabe in ≤180 Sekunden (3 Minuten). */
const BLITZ_MAX_SECONDS = 180;
/** „Wochenend-Krieger“ (ach-2): 7 Tage Streak. */
const STREAK_WEEK = 7;
/** „Unaufhaltsam“ (ach-5): 30 Tage Streak. */
const STREAK_MONTH = 30;
/** „Code-Meister“ (ach-4): 10 schwere Challenges gelöst. */
const HARD_SOLVED = 10;
/** „Perfektionist“ (ach-6): 20 Challenges gelöst (abgeschlossene Abgaben bestehen alle Testfälle). */
const NO_ERROR_SOLVED = 20;

/**
 * Baut die Achievement-Liste für ein Profil inkl. Sperr-/Freigabe-Logik.
 *
 * Freischaltungen werden zur Laufzeit aus den vorhandenen Daten abgeleitet
 * (keine separate „unlock“-Persistenz nötig). Eine vorhandene UserAchievement-Zeile
 * mit `unlockedAt` hat Vorrang und friert das Freigabedatum ein.
 */
export function buildUserAchievementsView(
  defs: DefRow[],
  userAchievements: UserAchievementRow[],
  completedSubmissions: CompletedSubmission[],
  streakRecord = 0
): { achievements: Achievement[]; unlockedCount: number } {
  const byDate = [...completedSubmissions].sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
  );
  const totalSolved = byDate.length;
  const hardByDate = byDate.filter((s) => s.challenge?.difficulty === "hard");
  const blitzByDate = byDate.filter(
    (s) => s.timeTaken != null && s.timeTaken > 0 && s.timeTaken <= BLITZ_MAX_SECONDS
  );

  /** Datum der n-ten (1-basiert) Abgabe einer bereits nach Datum sortierten Liste. */
  const nthDate = (list: CompletedSubmission[], n: number): Date | null =>
    list.length >= n ? list[n - 1].createdAt : null;

  // id → { unlocked durch abgeleitete Regel, Freigabedatum (falls ableitbar) }
  const inferred: Record<string, { unlocked: boolean; at: Date | null }> = {
    "ach-1": { unlocked: totalSolved > 0, at: nthDate(byDate, 1) },
    "ach-2": { unlocked: streakRecord >= STREAK_WEEK, at: null },
    "ach-3": { unlocked: blitzByDate.length > 0, at: nthDate(blitzByDate, 1) },
    "ach-4": {
      unlocked: hardByDate.length >= HARD_SOLVED,
      at: nthDate(hardByDate, HARD_SOLVED),
    },
    "ach-5": { unlocked: streakRecord >= STREAK_MONTH, at: null },
    "ach-6": {
      unlocked: totalSolved >= NO_ERROR_SOLVED,
      at: nthDate(byDate, NO_ERROR_SOLVED),
    },
  };

  const progressByAchievementId = new Map(
    userAchievements.map((ua) => [ua.achievementId, ua])
  );

  const achievements: Achievement[] = defs.map((def) => {
    const ua = progressByAchievementId.get(def.id);
    const rule = inferred[def.id];
    const inferredUnlock = ua?.unlockedAt == null && rule?.unlocked === true;
    const unlocked = ua?.unlockedAt != null || inferredUnlock;

    let unlockedAt: string | undefined;
    if (ua?.unlockedAt) {
      unlockedAt = formatDate(ua.unlockedAt);
    } else if (inferredUnlock && rule?.at) {
      unlockedAt = formatDate(rule.at);
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
