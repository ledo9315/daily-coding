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
 * Everything about a challenge that is content. The operational fields (`isActive`, `date`,
 * `position`) are set in the admin UI and never by a module; the seed adds them.
 */
export type ChallengeContent = Omit<ChallengeSeed, "isActive" | "date" | "position"> & {
  categoryId: (typeof CATEGORY)[keyof typeof CATEGORY];
};

/** The interpreted languages: `data` there is just a JSON value, any test shape works. */
export const BASE_LANGUAGES: CodeLanguage[] = ["javascript", "typescript", "python", "php", "ruby"];

/**
 * Plus the typed ones. Only for challenges whose test inputs are scalars, arrays of one scalar
 * type, or an object of those - `inferArguments` in the harness turns each key into a typed
 * parameter and cannot express anything nested or mixed.
 */
export const ALL_LANGUAGES: CodeLanguage[] = [...BASE_LANGUAGES, "java", "go", "cpp", "csharp", "rust"];
