/**
 * The six global achievement definitions. Titles and descriptions are user-visible and
 * therefore German; they live in the database (`AchievementDef`) because the profile and
 * the dashboard read them with `findMany`, so the seed is the only way to change them.
 */
export const ACHIEVEMENT_DEFS = [
  { id: "ach-1", title: "Erste Schritte",    description: "Erste Challenge abgeschlossen",         iconKey: "Check",        rarity: "common"    as const },
  { id: "ach-2", title: "Wochenend-Krieger", description: "7 Tage Streak erreicht",                iconKey: "CalendarWeek", rarity: "rare"      as const },
  { id: "ach-3", title: "Polyglott",         description: "In drei verschiedenen Sprachen gelöst", iconKey: "Code",         rarity: "rare"      as const },
  { id: "ach-4", title: "Code-Meister",      description: "10 schwere Challenges gelöst",          iconKey: "Trophy",       rarity: "epic"      as const },
  { id: "ach-5", title: "Unaufhaltsam",      description: "30 Tage Streak erreicht",               iconKey: "Zap",          rarity: "legendary" as const },
  { id: "ach-6", title: "Perfektionist",     description: "20 Challenges ohne Fehler",             iconKey: "Bullseye",     rarity: "epic"      as const },
];

type AchievementDefUpsertClient = {
  achievementDef: {
    upsert: (args: {
      where: { id: string };
      update: (typeof ACHIEVEMENT_DEFS)[number];
      create: (typeof ACHIEVEMENT_DEFS)[number];
    }) => Promise<unknown>;
  };
};

/**
 * Brings the stored definitions in line with the list above.
 *
 * `update` carries the whole definition on purpose. It used to be `update: {}`, which made
 * the rows write-once: renaming ach-3 from „Blitzschnell" to „Polyglott" in #91 changed the
 * unlock logic but left every profile showing the old title, because the row already
 * existed and the seed skipped it (#94).
 *
 * ponytail: takes the client as a parameter instead of importing it, so the loop is
 * testable without a database. The seed passes its own adapter-backed client.
 */
export async function seedAchievementDefs(
  client: AchievementDefUpsertClient
): Promise<void> {
  for (const def of ACHIEVEMENT_DEFS) {
    await client.achievementDef.upsert({
      where: { id: def.id },
      update: def,
      create: def,
    });
  }
}
