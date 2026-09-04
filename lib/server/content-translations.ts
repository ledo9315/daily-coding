import { prisma } from "@/lib/prisma";
import { CONTENT_SOURCE_LOCALE, type AppLocale } from "@/lib/locale";
import { localeFromRequestScope } from "@/lib/server/request-locale";

/**
 * Reading the content that lives in the database - challenges, categories, achievements -
 * in the language of the request.
 *
 * The German text stays in the columns of `Challenge`, `Category` and `AchievementDef`; the
 * `*Translation` tables hold the other languages. Two consequences, both intended: German
 * costs no additional query, and a locale without a translation row falls back to the
 * columns, so a half-translated catalogue shows German text instead of an empty page (E8).
 *
 * The guard below is `CONTENT_SOURCE_LOCALE`, not `DEFAULT_LOCALE`. They were the same
 * value until the domain moved, and mixing them up here means the default language skips
 * the lookup and renders the German columns under an English URL.
 */

async function contentLocale(locale?: AppLocale): Promise<AppLocale> {
  return locale ?? (await localeFromRequestScope());
}

/**
 * `testCaseNames` is keyed by `testCases[].id`, so a case whose name was not translated -
 * or a case added after the translation was written - keeps the German one.
 */
function withTranslatedTestCaseNames(testCases: unknown, names: unknown): unknown {
  if (!Array.isArray(testCases) || typeof names !== "object" || names === null) {
    return testCases;
  }
  const byId = names as Record<string, unknown>;
  return testCases.map((entry) => {
    if (typeof entry !== "object" || entry === null || Array.isArray(entry)) return entry;
    const testCase = entry as Record<string, unknown>;
    const translated = byId[String(testCase.id)];
    return typeof translated === "string" && translated.trim() !== ""
      ? { ...testCase, name: translated }
      : testCase;
  });
}

/**
 * Any challenge row that carries prose. `hints` and `testCases` are Json columns and stay
 * `unknown` here: this module replaces them, it does not interpret them.
 */
export type LocalizableChallenge = {
  id: string;
  title: string;
  description: string;
  hints?: unknown;
  testCases?: unknown;
  category?: { name: string } | null;
};

/**
 * The same row with its prose in `locale` - title, description, hints, test-case names and,
 * when the row carries its category, the category name. Fields without a translation are
 * left as they are.
 */
export async function localizeChallenge<T extends LocalizableChallenge>(
  challenge: T,
  locale?: AppLocale
): Promise<T> {
  const target = await contentLocale(locale);
  if (target === CONTENT_SOURCE_LOCALE) return challenge;

  // One query for both: the category is reached through the challenge, so a caller that
  // selected `category.name` without `categoryId` needs no second lookup.
  const row = await prisma.challenge.findUnique({
    where: { id: challenge.id },
    select: {
      translations: {
        where: { locale: target },
        select: { title: true, description: true, hints: true, testCaseNames: true },
      },
      category: {
        select: { translations: { where: { locale: target }, select: { name: true } } },
      },
    },
  });

  const text = row?.translations[0];
  const categoryName = row?.category.translations[0]?.name;
  if (!text && !categoryName) return challenge;

  // Only fields the caller actually selected are replaced - a `select` without `hints` must
  // not come back carrying them.
  const localized: Record<string, unknown> = { ...challenge };
  if (text) {
    localized.title = text.title;
    localized.description = text.description;
    if ("hints" in challenge) localized.hints = text.hints;
    if ("testCases" in challenge) {
      localized.testCases = withTranslatedTestCaseNames(challenge.testCases, text.testCaseNames);
    }
  }
  if (categoryName && challenge.category) {
    localized.category = { ...challenge.category, name: categoryName };
  }
  return localized as T;
}

/**
 * Titles only, for the places that name a challenge without showing it - the solved history
 * on a profile, and any list that prints a title. One query for the whole page instead of
 * one per row. Ids missing from the map have no translation and keep their German title.
 */
export async function localizeChallengeTitles(
  challengeIds: string[],
  locale?: AppLocale
): Promise<Map<string, string>> {
  const target = await contentLocale(locale);
  if (target === CONTENT_SOURCE_LOCALE || challengeIds.length === 0) return new Map();

  const rows = await prisma.challengeTranslation.findMany({
    where: { locale: target, challengeId: { in: [...new Set(challengeIds)] } },
    select: { challengeId: true, title: true },
  });
  return new Map(rows.map((row) => [row.challengeId, row.title]));
}

/**
 * One challenge title, falling back to the German one. For callers that know the locale
 * from the account rather than from the request - a mail is written without one.
 */
export async function localizeChallengeTitle(
  challengeId: string,
  germanTitle: string,
  locale?: AppLocale
): Promise<string> {
  const titles = await localizeChallengeTitles([challengeId], locale);
  return titles.get(challengeId) ?? germanTitle;
}

export type LocalizableAchievement = { id: string; title: string; description: string };

/** The same definitions with title and description in `locale`, German where none exists. */
export async function localizeAchievements<T extends LocalizableAchievement>(
  defs: T[],
  locale?: AppLocale
): Promise<T[]> {
  const target = await contentLocale(locale);
  if (target === CONTENT_SOURCE_LOCALE || defs.length === 0) return defs;

  const rows = await prisma.achievementTranslation.findMany({
    where: { locale: target, achievementId: { in: defs.map((def) => def.id) } },
    select: { achievementId: true, title: true, description: true },
  });
  if (rows.length === 0) return defs;

  const byId = new Map(rows.map((row) => [row.achievementId, row]));
  return defs.map((def) => {
    const text = byId.get(def.id);
    return text ? { ...def, title: text.title, description: text.description } : def;
  });
}

/**
 * The achievement catalogue in display order, translated. Replaces the bare
 * `achievementDef.findMany` the profile, the dashboard and the public profile each had.
 */
export async function findLocalizedAchievementDefs(locale?: AppLocale) {
  const defs = await prisma.achievementDef.findMany({ orderBy: { id: "asc" } });
  return localizeAchievements(defs, locale);
}
