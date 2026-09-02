import { describe, expect, it } from "vitest";
import { CHALLENGE_SEEDS } from "../challenge-seeds";
import { CODE_LANGUAGES } from "../../lib/challenge-languages";

/**
 * `challenges.json` is imported through `resolveJsonModule` and cast, so TypeScript checks
 * nothing about its shape: a challenge exported from a database that predates a column, or
 * hand-edited in the file, would only fail once the seed hit the database - or worse, seed a
 * challenge nobody can submit to because the language it offers has no callable name.
 */
const CATEGORY_IDS = ["cat-algorithmen", "cat-baeume", "cat-datenstrukturen", "cat-strings"];

type Hint = { title: string; body: string };
type TestCase = { id: number; name: string; input: string; expected: string };

describe("challenges.json", () => {
  it("has unique ids", () => {
    const ids = CHALLENGE_SEEDS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("holds content only", () => {
    // The seed derives these; a JSON that carried them would let an export from one instance
    // reorder the ring of another.
    for (const c of CHALLENGE_SEEDS) {
      expect(c).not.toHaveProperty("position");
      expect(c).not.toHaveProperty("isActive");
      expect(c).not.toHaveProperty("date");
    }
  });

  it.each(CHALLENGE_SEEDS.map((c) => [c.id, c] as const))("%s is complete", (_id, c) => {
    expect(c.title.trim()).not.toBe("");
    expect(c.description.trim()).not.toBe("");
    expect(["easy", "medium", "hard"]).toContain(c.difficulty);
    expect(c.points).toBeGreaterThan(0);
    expect(CATEGORY_IDS).toContain(c.categoryId);

    const hints = c.hints as Hint[];
    expect(hints.length).toBeGreaterThan(0);
    for (const h of hints) {
      expect(h.title.trim()).not.toBe("");
      expect(h.body.trim()).not.toBe("");
    }

    expect((c.examples as unknown[]).length).toBeGreaterThan(0);

    const testCases = c.testCases as TestCase[];
    expect(testCases.length).toBeGreaterThan(0);
    for (const t of testCases) {
      expect(typeof t.id).toBe("number");
      expect(t.name.trim()).not.toBe("");
      expect(typeof t.input).toBe("string");
      expect(typeof t.expected).toBe("string");
    }
  });

  it.each(CHALLENGE_SEEDS.map((c) => [c.id, c] as const))(
    "%s offers no language it cannot grade",
    (_id, c) => {
      const languages = c.supportedLanguages as string[];
      expect(languages.length).toBeGreaterThan(0);

      const starters = c.starterCodes as Record<string, string>;
      const callable = (c.evaluationConfig as { callableByLanguage?: Record<string, string> })
        .callableByLanguage;

      for (const lang of languages) {
        expect(CODE_LANGUAGES).toContain(lang);
        // Without a starter the editor opens empty; without a callable name the submission
        // falls back to smoke execution and passes on an empty solution.
        expect(starters[lang]?.trim()).toBeTruthy();
        expect(callable?.[lang]?.trim()).toBeTruthy();
      }
    }
  );
});
