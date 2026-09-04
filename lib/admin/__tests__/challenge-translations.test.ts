import { describe, it, expect, vi } from "vitest";
import type { Prisma } from "@/lib/generated/prisma/client";
import {
  germanChallengeText,
  writeChallengeTranslations,
} from "@/lib/admin/challenge-translations";

function fakeTx() {
  const upsert = vi.fn();
  const deleteMany = vi.fn();
  const tx = { challengeTranslation: { upsert, deleteMany } };
  return { tx: tx as unknown as Prisma.TransactionClient, upsert, deleteMany };
}

const german = {
  title: "Titel",
  description: "Beschreibung",
  hints: [{ title: "Die Idee", body: "Modulo." }],
  testCaseNames: { "1": "Beispiel" },
};

describe("germanChallengeText", () => {
  it("keys the test-case names by id, not by position", () => {
    const text = germanChallengeText({
      title: "T",
      description: "D",
      hints: [],
      testCases: [
        { id: 7, name: "Sieben" },
        { id: 2, name: "Zwei" },
      ],
    });
    expect(text.testCaseNames).toEqual({ "7": "Sieben", "2": "Zwei" });
  });

  it("skips test cases without an id, which would all share one key", () => {
    const text = germanChallengeText({
      title: "T",
      description: "D",
      hints: [],
      testCases: [{ name: "Erster" }, { name: "Zweiter" }],
    });
    expect(text.testCaseNames).toEqual({});
  });
});

describe("writeChallengeTranslations", () => {
  it("mirrors German even when no other language exists", async () => {
    const { tx, upsert, deleteMany } = fakeTx();
    await writeChallengeTranslations(tx, "c1", german, undefined);

    expect(upsert).toHaveBeenCalledTimes(1);
    expect(upsert.mock.calls[0][0].create).toMatchObject({
      challengeId: "c1",
      locale: "de",
      title: "Titel",
    });
    expect(deleteMany).not.toHaveBeenCalled();
  });

  it("writes the English row when one is given", async () => {
    const { tx, upsert } = fakeTx();
    await writeChallengeTranslations(tx, "c1", german, {
      en: {
        title: "Title",
        description: "Description",
        hints: [{ title: "The idea", body: "Modulo." }],
        testCaseNames: { "1": "Example" },
      },
    });

    const locales = upsert.mock.calls.map((call) => call[0].create.locale);
    expect(locales).toEqual(["de", "en"]);
  });

  it("drops the English row when the payload names no English version", async () => {
    const { tx, deleteMany } = fakeTx();
    await writeChallengeTranslations(tx, "c1", german, {});

    expect(deleteMany).toHaveBeenCalledWith({
      where: { challengeId: "c1", locale: "en" },
    });
  });
});
