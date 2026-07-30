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
  language?: string | null;
  challenge?: { difficulty?: string | null } | null;
};

/**
 * „Polyglott“ (ach-3): solved in three different languages. Replaces the former
 * „Blitzschnell“, which needed a solve duration — that measurement went away with the
 * daily ranking (#91).
 *
 * Reachable because the submit lock is per challenge and day, not per language: three
 * days with three languages is enough.
 */
const POLYGLOT_LANGUAGES = 3;
/** „Wochenend-Krieger“ (ach-2): a 7-day streak. */
const STREAK_WEEK = 7;
/** „Unaufhaltsam“ (ach-5): a 30-day streak. */
const STREAK_MONTH = 30;
/** „Code-Meister“ (ach-4): 10 hard challenges solved. */
const HARD_SOLVED = 10;
/** „Perfektionist“ (ach-6): 20 challenges solved (a completed submission passes every test case). */
const NO_ERROR_SOLVED = 20;

/**
 * Builds the achievement list for a profile, including locked/unlocked state.
 *
 * Unlocks are derived at runtime from existing data, so no separate "unlock"
 * persistence is needed. An existing UserAchievement row with `unlockedAt` takes
 * precedence and freezes the unlock date.
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
  /**
   * The submission that first completes the third distinct language — used both as the
   * unlock condition and as the unlock date.
   */
  const seenLanguages = new Set<string>();
  let polyglotAt: Date | null = null;
  for (const s of byDate) {
    if (s.language) seenLanguages.add(s.language);
    if (polyglotAt === null && seenLanguages.size >= POLYGLOT_LANGUAGES) {
      polyglotAt = s.createdAt;
    }
  }

  /** Date of the nth (1-based) submission in a list already sorted by date. */
  const nthDate = (list: CompletedSubmission[], n: number): Date | null =>
    list.length >= n ? list[n - 1].createdAt : null;

  // id -> { unlocked by a derived rule, unlock date where derivable }
  const inferred: Record<string, { unlocked: boolean; at: Date | null }> = {
    "ach-1": { unlocked: totalSolved > 0, at: nthDate(byDate, 1) },
    "ach-2": { unlocked: streakRecord >= STREAK_WEEK, at: null },
    "ach-3": { unlocked: polyglotAt !== null, at: polyglotAt },
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
