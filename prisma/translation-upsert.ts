import type { Prisma, PrismaClient } from "../lib/generated/prisma/client";
import { challengeTexts, germanChallengeText, type ChallengeText } from "./challenges/types";
import { ALL_CHALLENGES } from "./challenges";

/**
 * The `*Translation` rows for the content that lives in the database.
 *
 * German is written from the columns rather than from the modules: `Challenge`,
 * `Category` and `AchievementDef` carry the German original, an admin edits it there, and
 * the read side falls back to those columns for a locale that has no row here. Mirroring
 * them keeps the table the full picture of what exists in which language, which is what a
 * translation view will want to show.
 *
 * A further language is only written where a module actually carries one, so re-running
 * the seed never overwrites a translation with an empty one.
 */
export async function seedContentTranslations(client: PrismaClient): Promise<void> {
  await seedCategoryTranslations(client);
  await seedAchievementTranslations(client);
  await seedChallengeTranslations(client);
}

async function seedCategoryTranslations(client: PrismaClient): Promise<void> {
  const categories = await client.category.findMany({ select: { id: true, name: true } });
  for (const category of categories) {
    await client.categoryTranslation.upsert({
      where: { categoryId_locale: { categoryId: category.id, locale: "de" } },
      update: { name: category.name },
      create: { categoryId: category.id, locale: "de", name: category.name },
    });
  }
}

async function seedAchievementTranslations(client: PrismaClient): Promise<void> {
  const defs = await client.achievementDef.findMany({
    select: { id: true, title: true, description: true },
  });
  for (const def of defs) {
    const text = { title: def.title, description: def.description };
    await client.achievementTranslation.upsert({
      where: { achievementId_locale: { achievementId: def.id, locale: "de" } },
      update: text,
      create: { achievementId: def.id, locale: "de", ...text },
    });
  }
}

async function seedChallengeTranslations(client: PrismaClient): Promise<void> {
  const rows = await client.challenge.findMany({
    select: { id: true, title: true, description: true, hints: true, testCases: true },
  });
  for (const row of rows) {
    await upsertChallengeText(client, row.id, "de", germanChallengeText(row));
  }

  for (const content of ALL_CHALLENGES) {
    const { en } = challengeTexts(content);
    if (en) await upsertChallengeText(client, content.id, "en", en);
  }
}

async function upsertChallengeText(
  client: PrismaClient,
  challengeId: string,
  locale: "de" | "en",
  text: ChallengeText
): Promise<void> {
  const data = {
    title: text.title,
    description: text.description,
    hints: text.hints as unknown as Prisma.InputJsonValue,
    testCaseNames: text.testCaseNames as Prisma.InputJsonValue,
  };
  await client.challengeTranslation.upsert({
    where: { challengeId_locale: { challengeId, locale } },
    update: data,
    create: { challengeId, locale, ...data },
  });
}
