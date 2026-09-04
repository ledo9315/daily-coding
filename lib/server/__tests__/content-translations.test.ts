import { beforeEach, describe, expect, it, vi } from "vitest";

const mockChallengeFindUnique = vi.fn();
const mockChallengeTranslationFindMany = vi.fn();
const mockAchievementDefFindMany = vi.fn();
const mockAchievementTranslationFindMany = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    challenge: { findUnique: (...args: unknown[]) => mockChallengeFindUnique(...args) },
    challengeTranslation: {
      findMany: (...args: unknown[]) => mockChallengeTranslationFindMany(...args),
    },
    achievementDef: { findMany: (...args: unknown[]) => mockAchievementDefFindMany(...args) },
    achievementTranslation: {
      findMany: (...args: unknown[]) => mockAchievementTranslationFindMany(...args),
    },
  },
}));

import {
  findLocalizedAchievementDefs,
  localizeAchievements,
  localizeChallenge,
  localizeChallengeTitle,
  localizeChallengeTitles,
} from "@/lib/server/content-translations";

const germanRow = {
  id: "ch-1",
  title: "Duplicate Encoder",
  description: "Implementiere duplicateEncode(word).",
  hints: [{ title: "Die Idee", body: "Erst zählen, dann übersetzen." }],
  testCases: [
    { id: 1, name: "Alle einzeln", input: '"din"', expected: '"((("' },
    { id: 2, name: "Gemischt", input: '"recede"', expected: '"()()()"' },
  ],
  category: { id: "cat-strings", name: "Strings" },
};

const englishTranslation = {
  title: "Duplicate Encoder EN",
  description: "Implement duplicateEncode(word).",
  hints: [{ title: "The idea", body: "Count first, translate after." }],
  testCaseNames: { "1": "All distinct" },
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("localizeChallenge", () => {
  // German lives in the columns, so the default locale must not cost a query.
  it("returns the row untouched for German without querying", async () => {
    const localized = await localizeChallenge(germanRow, "de");
    expect(localized).toBe(germanRow);
    expect(mockChallengeFindUnique).not.toHaveBeenCalled();
  });

  it("replaces prose, category name and the test-case names it has", async () => {
    mockChallengeFindUnique.mockResolvedValueOnce({
      translations: [englishTranslation],
      category: { translations: [{ name: "Strings EN" }] },
    });

    const localized = await localizeChallenge(germanRow, "en");

    expect(localized.title).toBe("Duplicate Encoder EN");
    expect(localized.description).toBe("Implement duplicateEncode(word).");
    expect(localized.hints).toEqual(englishTranslation.hints);
    expect(localized.category.name).toBe("Strings EN");
    // Keyed by id, so an untranslated case keeps its German name instead of the name of
    // whatever case happens to sit at that position.
    expect(localized.testCases[0].name).toBe("All distinct");
    expect(localized.testCases[1].name).toBe("Gemischt");
    expect(localized.testCases[1].expected).toBe('"()()()"');
  });

  it("falls back to the German row when the locale has no translation", async () => {
    mockChallengeFindUnique.mockResolvedValueOnce({
      translations: [],
      category: { translations: [] },
    });

    const localized = await localizeChallenge(germanRow, "en");

    expect(localized).toBe(germanRow);
  });

  it("translates the category alone when only the category has a row", async () => {
    mockChallengeFindUnique.mockResolvedValueOnce({
      translations: [],
      category: { translations: [{ name: "Strings EN" }] },
    });

    const localized = await localizeChallenge(germanRow, "en");

    expect(localized.title).toBe("Duplicate Encoder");
    expect(localized.category.name).toBe("Strings EN");
  });

  // A caller that selected neither must not get them back: the shape it asked for is the
  // shape it hands on.
  it("adds no hints or test cases to a row that selected none", async () => {
    mockChallengeFindUnique.mockResolvedValueOnce({
      translations: [englishTranslation],
      category: { translations: [] },
    });

    const localized = await localizeChallenge(
      { id: "ch-1", title: "Duplicate Encoder", description: "…" },
      "en"
    );

    expect(localized).not.toHaveProperty("hints");
    expect(localized).not.toHaveProperty("testCases");
    expect(localized.title).toBe("Duplicate Encoder EN");
  });
});

describe("localizeChallengeTitles", () => {
  it("is empty for German and for an empty id list without querying", async () => {
    expect((await localizeChallengeTitles(["ch-1"], "de")).size).toBe(0);
    expect((await localizeChallengeTitles([], "en")).size).toBe(0);
    expect(mockChallengeTranslationFindMany).not.toHaveBeenCalled();
  });

  it("maps the ids that have a translation and asks for each id once", async () => {
    mockChallengeTranslationFindMany.mockResolvedValueOnce([
      { challengeId: "ch-1", title: "Duplicate Encoder EN" },
    ]);

    const titles = await localizeChallengeTitles(["ch-1", "ch-2", "ch-1"], "en");

    expect(titles.get("ch-1")).toBe("Duplicate Encoder EN");
    expect(titles.has("ch-2")).toBe(false);
    expect(mockChallengeTranslationFindMany.mock.calls[0][0]).toMatchObject({
      where: { locale: "en", challengeId: { in: ["ch-1", "ch-2"] } },
    });
  });

  it("keeps the German title for a single challenge without a translation", async () => {
    mockChallengeTranslationFindMany.mockResolvedValueOnce([]);

    expect(await localizeChallengeTitle("ch-2", "Two Sum", "en")).toBe("Two Sum");
  });
});

describe("localizeAchievements", () => {
  const defs = [
    { id: "ach-1", title: "Erste Schritte", description: "Erste Challenge abgeschlossen" },
    { id: "ach-2", title: "Dranbleiber", description: "3 Tage Streak erreicht" },
  ];

  it("translates what has a row and leaves the rest German", async () => {
    mockAchievementTranslationFindMany.mockResolvedValueOnce([
      { achievementId: "ach-1", title: "First steps", description: "First challenge solved" },
    ]);

    const localized = await localizeAchievements(defs, "en");

    expect(localized[0]).toEqual({
      id: "ach-1",
      title: "First steps",
      description: "First challenge solved",
    });
    expect(localized[1]).toBe(defs[1]);
  });

  it("reads the catalogue in id order and translates it", async () => {
    mockAchievementDefFindMany.mockResolvedValueOnce(defs);
    mockAchievementTranslationFindMany.mockResolvedValueOnce([]);

    const localized = await findLocalizedAchievementDefs("en");

    expect(mockAchievementDefFindMany.mock.calls[0][0]).toMatchObject({
      orderBy: { id: "asc" },
    });
    expect(localized).toEqual(defs);
  });
});
