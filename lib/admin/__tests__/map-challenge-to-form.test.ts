import { describe, it, expect } from "vitest";
import { challengeToFormInitial } from "@/lib/admin/map-challenge-to-form";

type ChallengeRow = Parameters<typeof challengeToFormInitial>[0];

/**
 * #71: Die Vorbelegung las mit lokalen Gettern und zeigte damit einen anderen Tag
 * als den gespeicherten UTC-Tag — in CEST bis zu einen Tag daneben.
 */
describe("challengeToFormInitial", () => {
  const base = {
    id: "c1",
    title: "T",
    description: "D",
    difficulty: "easy" as const,
    points: 100,
    categoryId: "cat-1",
    hint: null,
    examples: [],
    testCases: [],
    evaluationConfig: null,
    starterCode: null,
    starterCodes: {},
    supportedLanguages: ["javascript"],
    isActive: true,
    date: null as Date | null,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  } satisfies ChallengeRow;

  it("zeigt den gespeicherten UTC-Tag, nicht den lokalen", () => {
    // 22:00Z ist in CEST bereits der Folgetag — angezeigt werden muss der UTC-Tag.
    const initial = challengeToFormInitial({
      ...base,
      date: new Date("2026-07-30T22:00:00.000Z"),
    });
    expect(initial.dateUtcDay).toBe("2026-07-30");
  });

  it("liefert einen leeren Wert ohne Datum", () => {
    expect(challengeToFormInitial(base).dateUtcDay).toBe("");
  });
});
