import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { challengeUpsertArgs } from "../challenge-upsert";

const seed = readFileSync(resolve(process.cwd(), "prisma", "seed.ts"), "utf8");

const binarySearch = {
  id: "challenge-binary-search",
  title: "Binary Search",
  description: "Gib den Index von target zurück.",
  difficulty: "easy" as const,
  points: 120,
  categoryId: "cat-algorithmen",
  hints: [{ title: "Ansatz", body: "Halbiere den Suchbereich." }],
  examples: [{ input: "[1,3,5]", output: "1" }],
  isActive: false,
  date: new Date("2026-07-30T00:00:00.000Z"),
};

/**
 * Every seeded challenge used a hand-written `update: { ...xFields }` that listed only the
 * mechanical fields - languages, test cases, starter code. Prose lived in the `create` branch
 * alone, so a re-seed never refreshed it and each row kept the text it was first created with:
 * Binary Search still read "Implementiere eine effiziente binäre Suche." long after the seed
 * had a far better description.
 */
describe("challengeUpsertArgs", () => {
  it("refreshes prose on a row that already exists", () => {
    const { update } = challengeUpsertArgs(binarySearch);
    expect(update).toMatchObject({
      title: "Binary Search",
      description: "Gib den Index von target zurück.",
      hints: [{ title: "Ansatz", body: "Halbiere den Suchbereich." }],
      examples: [{ input: "[1,3,5]", output: "1" }],
      points: 120,
    });
  });

  it("leaves the operational state alone", () => {
    const { update } = challengeUpsertArgs(binarySearch);
    // `isActive` and `date` are set in the admin UI. A re-seed that reset them would take a
    // live daily offline; `date` is unique too, so a shifted anchor would collide.
    expect(update).not.toHaveProperty("isActive");
    expect(update).not.toHaveProperty("date");
    expect(update).not.toHaveProperty("id");
    // The ring order is arranged by hand in the admin panel; a re-seed must not undo it.
    expect(update).not.toHaveProperty("position");
  });

  it("creates the row from the payload unchanged", () => {
    const { where, create } = challengeUpsertArgs(binarySearch);
    expect(where).toEqual({ id: "challenge-binary-search" });
    expect(create).toEqual(binarySearch);
  });

  it("clears the deprecated dates and hands out ring positions instead", () => {
    // `date` is unique and no longer drives the daily; leaving stale values around would only
    // wait to collide with a future write.
    const reset = seed.indexOf("challenge.updateMany({ data: { date: null } })");
    const ring = seed.indexOf("const ringOrder = CHALLENGE_SEEDS.map(");
    expect(reset).toBeGreaterThan(-1);
    expect(ring).toBeGreaterThan(reset);
    expect(seed).toContain("rotationState.upsert");
  });

  it("is the only way the seed writes a challenge", () => {
    // Structural, not per-challenge: a challenge written with a hand-rolled `update` clause
    // would silently bring the stale-prose bug back. Since the content moved to
    // challenges.json there is a single upsert, and it derives its arguments from here.
    expect(seed).toContain("challengeUpsertArgs(data)");
    expect(seed.match(/challengeUpsertArgs\(/g)?.length).toBe(1);
  });
});
