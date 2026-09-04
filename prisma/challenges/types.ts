import type { ChallengeHint } from "../../lib/challenge-hints";
import type { CodeLanguage } from "../../lib/generated/prisma/enums";
import type { ChallengeSeed } from "../challenge-upsert";

/** The category rows the seed creates; a challenge module names one of these ids. */
export const CATEGORY = {
  algorithmen: "cat-algorithmen",
  baeume: "cat-baeume",
  datenstrukturen: "cat-datenstrukturen",
  strings: "cat-strings",
} as const;

/**
 * The prose of a challenge in one language: what a solver reads, and nothing else. Test
 * inputs, expected values, points and starter code have no language.
 */
export type ChallengeText = {
  title: string;
  description: string;
  hints: ChallengeHint[];
  /**
   * Test-case names, keyed by `testCases[].id` - not by position, so reordering the test
   * cases does not shift the names onto the wrong cases.
   */
  testCaseNames: Record<string, string>;
};

/**
 * Everything about a challenge that is content. The operational fields (`isActive`, `date`,
 * `position`) are set in the admin UI and never by a module; the seed adds them.
 *
 * The German prose stays where it always was - `title`, `description`, `hints` and the
 * `name` of each test case. Those fields are the `de` block, which is why a module needs no
 * `translations` entry for it, and why they remain the columns of the `Challenge` row: an
 * untranslated locale falls back to them (E8). Only a further language is spelled out.
 */
export type ChallengeContent = Omit<
  ChallengeSeed,
  "isActive" | "date" | "position" | "translations"
> & {
  categoryId: (typeof CATEGORY)[keyof typeof CATEGORY];
  translations?: { en?: ChallengeText };
};

type TestCaseSeed = { id: number | string; name: string };

/**
 * The `de` block of a challenge, read off the fields that carry the German text. Takes a
 * module or a `Challenge` row - the seed mirrors the row, so an admin edit is picked up.
 */
export function germanChallengeText(content: {
  title: string;
  description: string;
  hints?: unknown;
  testCases?: unknown;
}): ChallengeText {
  const testCases = content.testCases as unknown as TestCaseSeed[] | undefined;
  const testCaseNames: Record<string, string> = {};
  for (const testCase of Array.isArray(testCases) ? testCases : []) {
    testCaseNames[String(testCase.id)] = testCase.name;
  }
  const hints = content.hints as unknown as ChallengeHint[] | undefined;
  return {
    title: content.title,
    description: content.description,
    hints: Array.isArray(hints) ? hints : [],
    testCaseNames,
  };
}

/** Both language blocks of a module: `de` derived from its fields, `en` when it has one. */
export function challengeTexts(
  content: ChallengeContent
): { de: ChallengeText; en?: ChallengeText } {
  const en = content.translations?.en;
  return { de: germanChallengeText(content), ...(en ? { en } : {}) };
}

/** The interpreted languages: `data` there is just a JSON value, any test shape works. */
export const BASE_LANGUAGES: CodeLanguage[] = ["javascript", "typescript", "python", "php", "ruby"];

/**
 * Plus the typed ones. Only for challenges whose test inputs are scalars, arrays of one scalar
 * type, or an object of those - `inferArguments` in the harness turns each key into a typed
 * parameter and cannot express anything nested or mixed.
 */
export const ALL_LANGUAGES: CodeLanguage[] = [...BASE_LANGUAGES, "java", "go", "cpp", "csharp", "rust"];
