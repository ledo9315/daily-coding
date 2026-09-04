import { describe, it, expect } from "vitest";
import { challengeToFormInitial } from "@/lib/admin/map-challenge-to-form";

type ChallengeRow = Parameters<typeof challengeToFormInitial>[0];

/**
 * #71: the form prefill used local getters and therefore showed a different day than
 * the stored UTC day - off by up to a day in CEST.
 */
describe("challengeToFormInitial", () => {
  const base = {
    id: "c1",
    title: "T",
    description: "D",
    difficulty: "easy" as const,
    points: 100,
    categoryId: "cat-1",
    hints: [],
    examples: [],
    testCases: [],
    evaluationConfig: null,
    starterCode: null,
    starterCodes: {},
    supportedLanguages: ["javascript"],
    isActive: true,
    position: 0,
    date: null as Date | null,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  } satisfies ChallengeRow;

  it("shows the stored UTC day, not the local one", () => {
    // 22:00Z is already the next day in CEST - the UTC day is what must be shown.
    const initial = challengeToFormInitial({
      ...base,
      date: new Date("2026-07-30T22:00:00.000Z"),
    });
    expect(initial.dateUtcDay).toBe("2026-07-30");
  });

  it("returns an empty value when there is no date", () => {
    expect(challengeToFormInitial(base).dateUtcDay).toBe("");
  });

  it("reports no English version when there is no translation row", () => {
    expect(challengeToFormInitial(base).english).toBeNull();
    expect(challengeToFormInitial(base, null).english).toBeNull();
  });

  it("prefills the English tab from the translation row", () => {
    const initial = challengeToFormInitial(base, {
      title: "Title",
      description: "Description",
      hints: [{ title: "Approach", body: "Modulo." }],
      testCaseNames: { "1": "First case" },
    });
    expect(initial.english).toEqual({
      title: "Title",
      description: "Description",
      hints: [{ title: "Approach", body: "Modulo." }],
      testCaseNames: { "1": "First case" },
    });
  });

  // `testCaseNames` is a Json column, so a hand-edited row can hold anything.
  it("falls back to an empty name map when the column holds no object", () => {
    const initial = challengeToFormInitial(base, {
      title: "T",
      description: "D",
      hints: [],
      testCaseNames: ["nope"],
    });
    expect(initial.english?.testCaseNames).toEqual({});
  });
});
