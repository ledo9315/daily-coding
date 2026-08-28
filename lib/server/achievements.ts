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
 * Counted across days, not across attempts: since #200 a second submission overwrites the
 * day's row, so eight languages on one day leave one behind. Three days, three languages.
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

export type AchievementRule = {
  unlocked: boolean;
  /** When the rule was first met. Null for the streak rules, which the record cannot date. */
  at: Date | null;
  current: number;
  target: number;
  label?: string;
};

/**
 * Evaluates the six rules against a user's completed submissions.
 *
 * Split out from the view because `persistAchievementUnlocks` needs the raw dates rather
 * than the formatted strings the view produces — and both must read the same rules.
 */
export function deriveAchievementRules(
  completedSubmissions: CompletedSubmission[],
  streakRecord = 0
): Record<string, AchievementRule> {
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

  /**
   * id -> { unlocked by a derived rule, unlock date where derivable, how far along }
   *
   * `current`/`target` are the same numbers the `unlocked` check already runs on — a
   * locked achievement used to name its goal without ever saying where you stood (#96).
   * The streak rules read the record rather than the running streak, so they carry a
   * label; „5/7" alone would read as a series still going.
   */
  return {
    "ach-1": {
      unlocked: totalSolved > 0,
      at: nthDate(byDate, 1),
      current: totalSolved,
      target: 1,
    },
    "ach-2": {
      unlocked: streakRecord >= STREAK_WEEK,
      at: null,
      current: streakRecord,
      target: STREAK_WEEK,
      label: "Rekord",
    },
    "ach-3": {
      unlocked: polyglotAt !== null,
      at: polyglotAt,
      current: seenLanguages.size,
      target: POLYGLOT_LANGUAGES,
    },
    "ach-4": {
      unlocked: hardByDate.length >= HARD_SOLVED,
      at: nthDate(hardByDate, HARD_SOLVED),
      current: hardByDate.length,
      target: HARD_SOLVED,
    },
    "ach-5": {
      unlocked: streakRecord >= STREAK_MONTH,
      at: null,
      current: streakRecord,
      target: STREAK_MONTH,
      label: "Rekord",
    },
    "ach-6": {
      unlocked: totalSolved >= NO_ERROR_SOLVED,
      at: nthDate(byDate, NO_ERROR_SOLVED),
      current: totalSolved,
      target: NO_ERROR_SOLVED,
    },
  };
}

/**
 * Builds the achievement list for a profile, including locked/unlocked state.
 *
 * A UserAchievement row with `unlockedAt` wins over the rules and freezes the date. That
 * row is what makes an unlock permanent: the rules are recomputed from the submissions on
 * every call, and since #200 a re-submission can lower a count they read (#205).
 */
export function buildUserAchievementsView(
  defs: DefRow[],
  userAchievements: UserAchievementRow[],
  completedSubmissions: CompletedSubmission[],
  streakRecord = 0
): { achievements: Achievement[]; unlockedCount: number } {
  const inferred = deriveAchievementRules(completedSubmissions, streakRecord);

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

    // Only while locked, and only where the target has more than one step: "0/1" for
    // „Erste Schritte" is noise, and a full bar next to the unlock date says less than
    // the date does.
    const progress =
      !unlocked && rule && rule.target > 1
        ? { current: rule.current, target: rule.target, ...(rule.label && { label: rule.label }) }
        : undefined;

    return {
      id: def.id,
      title: def.title,
      description: def.description,
      iconKey: def.iconKey,
      unlocked,
      rarity: def.rarity,
      unlockedAt,
      progress,
    };
  });

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  return { achievements, unlockedCount };
}
