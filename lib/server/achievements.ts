import type { AchievementRarity } from "@/lib/generated/prisma/enums";
import { formatDate } from "@/lib/format";
import type { Achievement } from "@/lib/api";
import type { AchievementFacts, FactSubmission } from "@/lib/server/achievement-facts";
import { ACHIEVEMENT_DEFS } from "@/lib/server/achievement-defs";
import { utcDayKey } from "@/lib/streak-days";

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

/**
 * „Polyglott“ (ach-3): solved in three different languages. Replaces the former
 * „Blitzschnell“, which needed a solve duration - that measurement went away with the
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
/** „Dranbleiber“ (ach-7): a 3-day streak. */
const STREAK_THREE_DAYS = 3;
/** „Allrounder“ (ach-9): one solve each of easy, medium and hard. */
const ALL_DIFFICULTIES = 3;
/** „Halbes Hundert“ (ach-10): 50 challenges solved. */
const FIFTY_SOLVED = 50;
/** „Hundertschaft“ (ach-11): 100 challenges solved. */
const HUNDRED_SOLVED = 100;
/** „Dreistellig“ (ach-12): a 100-day streak. */
const STREAK_HUNDRED = 100;
/** „Weltenbummler“ (ach-13): solved in six different languages. */
const GLOBETROTTER_LANGUAGES = 6;
/** „Wiederholungstäter“ (ach-15): the same challenge solved a second time. */
const REPEAT_SOLVES = 2;
/** „Comeback“ (ach-16): a solve after at least 30 calendar days without one. */
const COMEBACK_GAP_DAYS = 30;
/** „Last Minute“ (ach-17): a solve in the last UTC hour of the day. */
const LAST_MINUTE_HOUR = 23;
/** „Vorbild“ (ach-20): 10 best-practices votes received. */
const BEST_PRACTICES_VOTES = 10;
/** „Trickreich“ (ach-21): 5 clever votes received. */
const CLEVER_VOTES = 5;
/** „Romanautor“ (ach-22): a solution of at least 100 non-empty lines. */
const NOVEL_LINES = 100;
/** „Minimalist“ (ach-23): a solution of at most 5 non-empty lines. */
const MINIMALIST_LINES = 5;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export type AchievementRule = {
  unlocked: boolean;
  /** When the rule was first met. Null for the streak rules, which the record cannot date. */
  at: Date | null;
  current: number;
  target: number;
  label?: string;
};

type Dated = { createdAt: Date };

const sortByDate = <T extends Dated>(list: T[]): T[] =>
  [...list].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

/** Date of the nth (1-based) entry in a list already sorted by date. */
const nthDate = (list: Dated[], n: number): Date | null =>
  list.length >= n ? list[n - 1].createdAt : null;

/**
 * Distinct values of `key` across `byDate`, and the submission at which they first reach
 * `n` - the unlock condition and the unlock date come from the same pass.
 */
function distinctReached(
  byDate: FactSubmission[],
  key: (s: FactSubmission) => string | null,
  n: number
): { count: number; at: Date | null } {
  const seen = new Set<string>();
  let at: Date | null = null;
  for (const s of byDate) {
    const value = key(s);
    if (value) seen.add(value);
    if (at === null && seen.size >= n) at = s.createdAt;
  }
  return { count: seen.size, at };
}

const nonEmptyLineCount = (code: string): number =>
  code.split("\n").filter((line) => line.trim() !== "").length;

/**
 * Whole days since the epoch of the UTC calendar day `d` falls on. Goes through
 * `utcDayKey` so the day boundary is the streak's; a date-only ISO string parses as UTC.
 */
const utcDayIndex = (d: Date): number => Date.parse(utcDayKey(d)) / MS_PER_DAY;

/** The rule for a one-off event: unlocked by the first of `matches`, dated there. */
const firstOf = (matches: Dated[]): AchievementRule => ({
  unlocked: matches.length > 0,
  at: nthDate(matches, 1),
  current: Math.min(matches.length, 1),
  target: 1,
});

/**
 * Evaluates every rule against a user's facts.
 *
 * Split out from the view because `persistAchievementUnlocks` needs the raw dates rather
 * than the formatted strings the view produces - and both must read the same rules.
 */
export function deriveAchievementRules(facts: AchievementFacts): Record<string, AchievementRule> {
  const byDate = sortByDate(facts.completed);
  const { streakRecord } = facts;
  const hardByDate = byDate.filter((s) => s.challenge.difficulty === "hard");
  const languages = (n: number) => distinctReached(byDate, (s) => s.language, n);
  const polyglot = languages(POLYGLOT_LANGUAGES);
  const globetrotter = languages(GLOBETROTTER_LANGUAGES);
  const allrounder = distinctReached(byDate, (s) => s.challenge.difficulty, ALL_DIFFICULTIES);

  const solvesPerChallenge = new Map<string, number>();
  let repeatAt: Date | null = null;
  let maxSolvesOfOne = 0;
  for (const s of byDate) {
    const count = (solvesPerChallenge.get(s.challenge.id) ?? 0) + 1;
    solvesPerChallenge.set(s.challenge.id, count);
    maxSolvesOfOne = Math.max(maxSolvesOfOne, count);
    if (repeatAt === null && count >= REPEAT_SOLVES) repeatAt = s.createdAt;
  }

  const comebacks = byDate.filter(
    (s, i) =>
      i > 0 && utcDayIndex(s.createdAt) - utcDayIndex(byDate[i - 1].createdAt) >= COMEBACK_GAP_DAYS
  );
  // Both time-of-day rules read `createdAt`, which the day's upsert (#200) never touches:
  // it is the first attempt of the day, not the passing one. A `completedAt` column would
  // fix that; until then a failed morning attempt hides an evening solve.
  const lastMinute = byDate.filter((s) => s.createdAt.getUTCHours() === LAST_MINUTE_HOUR);
  const earlyBird = byDate.filter(
    (s) =>
      facts.earliestCompletionByDay.get(utcDayKey(s.createdAt))?.getTime() === s.createdAt.getTime()
  );
  const comments = sortByDate(facts.comments);
  const votesByDate = sortByDate(facts.votesReceived);
  const bestPractices = votesByDate.filter((v) => v.kind === "best_practices");
  const clever = votesByDate.filter((v) => v.kind === "clever");

  const streak = (target: number): AchievementRule => ({
    unlocked: streakRecord >= target,
    at: null,
    current: streakRecord,
    target,
    label: "Rekord",
  });
  const countOf = (list: Dated[], target: number): AchievementRule => ({
    unlocked: list.length >= target,
    at: nthDate(list, target),
    current: list.length,
    target,
  });
  const distinct = (reached: { count: number; at: Date | null }, target: number): AchievementRule => ({
    unlocked: reached.at !== null,
    at: reached.at,
    current: reached.count,
    target,
  });

  /**
   * id -> { unlocked by a derived rule, unlock date where derivable, how far along }
   *
   * `current`/`target` are the same numbers the `unlocked` check already runs on - a
   * locked achievement used to name its goal without ever saying where you stood (#96).
   * The streak rules read the record rather than the running streak, so they carry a
   * label; „5/7" alone would read as a series still going.
   */
  return {
    "ach-1": countOf(byDate, 1),
    "ach-2": streak(STREAK_WEEK),
    "ach-3": distinct(polyglot, POLYGLOT_LANGUAGES),
    "ach-4": countOf(hardByDate, HARD_SOLVED),
    "ach-5": streak(STREAK_MONTH),
    "ach-6": countOf(byDate, NO_ERROR_SOLVED),
    "ach-7": streak(STREAK_THREE_DAYS),
    "ach-8": firstOf(hardByDate),
    "ach-9": distinct(allrounder, ALL_DIFFICULTIES),
    "ach-10": countOf(byDate, FIFTY_SOLVED),
    "ach-11": countOf(byDate, HUNDRED_SOLVED),
    "ach-12": streak(STREAK_HUNDRED),
    "ach-13": distinct(globetrotter, GLOBETROTTER_LANGUAGES),
    "ach-14": firstOf(byDate.filter((s) => s.language === "rust")),
    "ach-15": {
      unlocked: repeatAt !== null,
      at: repeatAt,
      current: Math.min(maxSolvesOfOne, REPEAT_SOLVES),
      target: REPEAT_SOLVES,
    },
    "ach-16": firstOf(comebacks),
    "ach-17": firstOf(lastMinute),
    "ach-18": firstOf(earlyBird),
    "ach-19": firstOf(comments),
    "ach-20": countOf(bestPractices, BEST_PRACTICES_VOTES),
    "ach-21": countOf(clever, CLEVER_VOTES),
    "ach-22": firstOf(byDate.filter((s) => nonEmptyLineCount(s.code) >= NOVEL_LINES)),
    "ach-23": firstOf(
      byDate.filter((s) => {
        const lines = nonEmptyLineCount(s.code);
        return lines >= 1 && lines <= MINIMALIST_LINES;
      })
    ),
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
  facts: AchievementFacts
): { achievements: Achievement[]; unlockedCount: number } {
  const inferred = deriveAchievementRules(facts);

  const progressByAchievementId = new Map(
    userAchievements.map((ua) => [ua.achievementId, ua])
  );

  // The rows arrive ordered by id, and "ach-10" < "ach-2" as strings; the definition list
  // is the display order. Ids missing from it go last, in the order they came.
  const position = new Map(ACHIEVEMENT_DEFS.map((d, i) => [d.id, i]));
  const rank = (id: string) => position.get(id) ?? ACHIEVEMENT_DEFS.length;
  const ordered = [...defs].sort((a, b) => rank(a.id) - rank(b.id));

  const achievements: Achievement[] = ordered.map((def) => {
    const ua = progressByAchievementId.get(def.id);
    const rule = inferred[def.id];
    const inferredUnlock = ua?.unlockedAt == null && rule?.unlocked === true;
    const unlocked = ua?.unlockedAt != null || inferredUnlock;

    let unlockedAtDate: Date | undefined;
    if (ua?.unlockedAt) {
      unlockedAtDate = ua.unlockedAt;
    } else if (inferredUnlock && rule?.at) {
      unlockedAtDate = rule.at;
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
      unlockedAt: unlockedAtDate && formatDate(unlockedAtDate),
      unlockedAtIso: unlockedAtDate?.toISOString(),
      progress,
    };
  });

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  return { achievements, unlockedCount };
}
