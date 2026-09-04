import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { ALL_CHALLENGES } from "@/prisma/challenges";
import { ALL_LANGUAGES, BASE_LANGUAGES, challengeTexts } from "@/prisma/challenges/types";
import { buildWrappedProgram } from "@/lib/server/io-harness";
import type { CodeLanguageId } from "@/lib/challenge-languages";

const seed = readFileSync(resolve(process.cwd(), "prisma", "seed.ts"), "utf8");
const TYPED = ALL_LANGUAGES.filter((l) => !BASE_LANGUAGES.includes(l));
const HINT_TITLES = ["Die Idee", "Die Umsetzung", "Woran die meisten scheitern"];

type TestCase = { id: number; name: string; input: string; expected: string };

const parseJson = (s: string) => JSON.parse(s) as unknown;

/**
 * Structural checks over every challenge module, so a new one cannot ship with a language it
 * cannot pass in: every supported language needs a callable and a starter that names it, and
 * the typed languages need test inputs the harness can turn into parameters.
 */
describe("challenge catalog", () => {
  it("has unique ids in the challenge-<slug> form and titles the seed does not already use", () => {
    const ids = ALL_CHALLENGES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const c of ALL_CHALLENGES) {
      expect(c.id, c.id).toMatch(/^challenge-[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(seed, c.title).not.toContain(`title: "${c.title}"`);
    }
    const titles = ALL_CHALLENGES.map((c) => c.title);
    expect(new Set(titles).size).toBe(titles.length);
  });

  it.each(ALL_CHALLENGES.map((c) => [c.id, c] as const))("%s is complete", (_, c) => {
    expect(c.title.trim()).not.toBe("");
    expect(c.description.trim().length).toBeGreaterThan(80);
    expect(["easy", "medium", "hard"]).toContain(c.difficulty);
    expect({ easy: [100, 120], medium: [150], hard: [200] }[c.difficulty]).toContain(c.points);

    const hints = c.hints as { title: string; body: string }[];
    expect(hints.map((h) => h.title)).toEqual(HINT_TITLES);
    for (const h of hints) expect(h.body.trim().length, h.title).toBeGreaterThan(40);

    const examples = c.examples as { input: string; output: string }[];
    expect(examples.length).toBeGreaterThan(0);

    const cases = c.testCases as TestCase[];
    expect(cases.length).toBeGreaterThanOrEqual(5);
    expect(cases.map((t) => t.id)).toEqual(cases.map((_, i) => i + 1));
    for (const t of cases) {
      expect(t.name.trim(), `case ${t.id}`).not.toBe("");
      expect(() => parseJson(t.input), `case ${t.id} input`).not.toThrow();
      expect(() => parseJson(t.expected), `case ${t.id} expected`).not.toThrow();
    }
  });

  it.each(ALL_CHALLENGES.map((c) => [c.id, c] as const))(
    "%s names a callable and a starter for every supported language",
    (_, c) => {
      const languages = c.supportedLanguages as CodeLanguageId[];
      const callables = (c.evaluationConfig as { callableByLanguage: Record<string, string> })
        .callableByLanguage;
      const starters = c.starterCodes as Record<string, string>;

      expect(Object.keys(callables).sort()).toEqual([...languages].sort());
      expect(Object.keys(starters).sort()).toEqual([...languages].sort());
      for (const lang of languages) {
        expect(starters[lang], lang).toContain(callables[lang]);
        expect(starters[lang], lang).toContain("Your solution here");
      }
      expect(c.starterCode).toBe(starters.javascript);
    }
  );

  it.each(ALL_CHALLENGES.map((c) => [c.id, c] as const))(
    "%s offers typed languages only for inputs the harness can type",
    (_, c) => {
      const languages = c.supportedLanguages as CodeLanguageId[];
      const callables = (c.evaluationConfig as { callableByLanguage: Record<string, string> })
        .callableByLanguage;
      const starters = c.starterCodes as Record<string, string>;
      for (const lang of TYPED.filter((l) => languages.includes(l))) {
        for (const t of c.testCases as TestCase[]) {
          expect(
            () => buildWrappedProgram(lang, starters[lang], callables[lang], t.input),
            `${lang} case ${t.id}`
          ).not.toThrow();
        }
      }
    }
  );

  /**
   * The German block is nothing a module writes out - `challengeTexts` reads it off the
   * fields that carry the German text - so what is checked here is that those fields cover
   * every test case, and that an English block, where a module has one, answers the same
   * keys. No `en` is allowed: that locale falls back to German (E8).
   */
  it.each(ALL_CHALLENGES.map((c) => [c.id, c] as const))(
    "%s has a German language block, and an English one with the same keys where present",
    (_, c) => {
      const { de, en } = challengeTexts(c);
      const cases = c.testCases as TestCase[];

      expect(de.title).toBe(c.title);
      expect(de.description).toBe(c.description);
      expect(de.hints).toHaveLength((c.hints as unknown[]).length);
      expect(Object.keys(de.testCaseNames)).toEqual(cases.map((t) => String(t.id)));
      for (const t of cases) expect(de.testCaseNames[String(t.id)], `case ${t.id}`).toBe(t.name);

      if (!en) return;
      expect(en.title.trim()).not.toBe("");
      expect(en.description.trim().length).toBeGreaterThan(80);
      expect(en.hints).toHaveLength(de.hints.length);
      for (const h of en.hints) {
        expect(h.title.trim()).not.toBe("");
        expect(h.body.trim().length, h.title).toBeGreaterThan(40);
      }
      expect(Object.keys(en.testCaseNames).sort()).toEqual(
        Object.keys(de.testCaseNames).sort()
      );
      for (const [id, name] of Object.entries(en.testCaseNames)) {
        expect(name.trim(), `case ${id}`).not.toBe("");
      }
    }
  );
});
