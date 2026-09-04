import type { Prisma } from "@/lib/generated/prisma/client";
import type { AdminChallengeText } from "./challenge-schema";

/**
 * Writing the `ChallengeTranslation` rows behind an admin save.
 *
 * The German prose stays in the `Challenge` columns - it is what the read side falls back to
 * for a locale that has no row here. The `de` row is a mirror of those columns and is
 * rewritten on every save, so the table stays the full picture of what exists in which
 * language; the read side never queries it (`localizeChallenge` returns early for German).
 */

type TestCaseLike = { id?: number | string; name?: string };

/**
 * The German block, read off the fields that carry the German text.
 *
 * Test cases without an `id` are skipped: the names are keyed by id, so two id-less cases
 * would both land under the same key and one would win.
 */
export function germanChallengeText(challenge: {
  title: string;
  description: string;
  hints: AdminChallengeText["hints"];
  testCases: TestCaseLike[];
}): AdminChallengeText {
  const testCaseNames: Record<string, string> = {};
  for (const testCase of challenge.testCases) {
    if (testCase.id === undefined || testCase.id === null) continue;
    if (typeof testCase.name === "string" && testCase.name.trim() !== "") {
      testCaseNames[String(testCase.id)] = testCase.name;
    }
  }
  return {
    title: challenge.title,
    description: challenge.description,
    hints: challenge.hints,
    testCaseNames,
  };
}

async function upsertText(
  tx: Prisma.TransactionClient,
  challengeId: string,
  locale: "de" | "en",
  text: AdminChallengeText,
): Promise<void> {
  const data = {
    title: text.title,
    description: text.description,
    hints: text.hints as unknown as Prisma.InputJsonValue,
    testCaseNames: text.testCaseNames as Prisma.InputJsonValue,
  };
  await tx.challengeTranslation.upsert({
    where: { challengeId_locale: { challengeId, locale } },
    update: data,
    create: { challengeId, locale, ...data },
  });
}

/**
 * Mirrors German and stores the English version, or drops it when the admin emptied the
 * English tab. Called inside the same transaction as the challenge write, so a challenge is
 * never saved with the prose of the previous version still in the translation table.
 *
 * An omitted `translations` means the payload said nothing about languages at all - an API
 * client that predates them - and an existing English row survives.
 */
export async function writeChallengeTranslations(
  tx: Prisma.TransactionClient,
  challengeId: string,
  german: AdminChallengeText,
  translations: { en?: AdminChallengeText } | undefined,
): Promise<void> {
  await upsertText(tx, challengeId, "de", german);

  if (!translations) return;

  if (translations.en) {
    await upsertText(tx, challengeId, "en", translations.en);
    return;
  }
  await tx.challengeTranslation.deleteMany({ where: { challengeId, locale: "en" } });
}
