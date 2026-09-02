/**
 * The global achievement definitions. Titles and descriptions are user-visible and
 * therefore German; they live in the database (`AchievementDef`) because the profile and
 * the dashboard read them with `findMany`, so the seed is the only way to change them.
 *
 * Array order is display order. The views sort by it rather than by id, because
 * `orderBy id` is a string sort and puts "ach-10" before "ach-2".
 */
export const ACHIEVEMENT_DEFS = [
  { id: "ach-1", title: "Erste Schritte",    description: "Erste Challenge abgeschlossen",                       iconKey: "Check",        rarity: "common"    as const },
  { id: "ach-2", title: "Wochenend-Krieger", description: "7 Tage Streak erreicht",                              iconKey: "CalendarWeek", rarity: "rare"      as const },
  { id: "ach-3", title: "Polyglott",         description: "An drei Tagen in drei verschiedenen Sprachen gelöst", iconKey: "Code",         rarity: "rare"      as const },
  { id: "ach-4", title: "Code-Meister",      description: "10 schwere Challenges gelöst",                        iconKey: "Trophy",       rarity: "epic"      as const },
  { id: "ach-5", title: "Unaufhaltsam",      description: "30 Tage Streak erreicht",                             iconKey: "Zap",          rarity: "legendary" as const },
  { id: "ach-6", title: "Perfektionist",     description: "20 Challenges ohne Fehler",                           iconKey: "Bullseye",     rarity: "epic"      as const },
  { id: "ach-7",  title: "Dranbleiber",        description: "3 Tage Streak erreicht",                                                   iconKey: "CalendarCheck", rarity: "common"    as const },
  { id: "ach-8",  title: "Ohne Stützräder",    description: "Erste schwere Challenge gelöst",                                           iconKey: "TrendingUp",    rarity: "common"    as const },
  { id: "ach-9",  title: "Allrounder",         description: "Je eine leichte, mittlere und schwere Challenge gelöst",                   iconKey: "Shuffle",       rarity: "rare"      as const },
  { id: "ach-10", title: "Halbes Hundert",     description: "50 Challenges gelöst",                                                     iconKey: "ChartBar",      rarity: "epic"      as const },
  { id: "ach-11", title: "Hundertschaft",      description: "100 Challenges gelöst",                                                    iconKey: "Coin",          rarity: "legendary" as const },
  { id: "ach-12", title: "Dreistellig",        description: "100 Tage Streak erreicht",                                                 iconKey: "Power",         rarity: "legendary" as const },
  { id: "ach-13", title: "Weltenbummler",      description: "In sechs verschiedenen Sprachen gelöst",                                   iconKey: "Map",           rarity: "epic"      as const },
  { id: "ach-14", title: "Rostfrei",           description: "Eine Challenge in Rust gelöst",                                            iconKey: "Shield",        rarity: "rare"      as const },
  { id: "ach-15", title: "Wiederholungstäter", description: "Dieselbe Challenge ein zweites Mal gelöst. Der Ring dreht sich weiter.",   iconKey: "Repeat",        rarity: "rare"      as const },
  { id: "ach-16", title: "Comeback",           description: "Nach mindestens 30 Tagen Pause wieder eine Challenge gelöst",              iconKey: "Downasaur",     rarity: "rare"      as const },
  { id: "ach-17", title: "Last Minute",        description: "In der letzten Stunde vor dem Tageswechsel gelöst",                        iconKey: "Hourglass",     rarity: "rare"      as const },
  { id: "ach-18", title: "Früher Vogel",       description: "Als erste Person die Tages-Challenge gelöst",                              iconKey: "Sun",           rarity: "rare"      as const },
  { id: "ach-19", title: "Wortmeldung",        description: "Ersten Kommentar zu einer Lösung geschrieben",                             iconKey: "Comment",       rarity: "common"    as const },
  { id: "ach-20", title: "Vorbild",            description: "10 Best-Practices-Stimmen für eigene Lösungen erhalten",                   iconKey: "Heart",         rarity: "epic"      as const },
  { id: "ach-21", title: "Trickreich",         description: "5 Clever-Stimmen für eigene Lösungen erhalten",                            iconKey: "Lightbulb",     rarity: "rare"      as const },
  { id: "ach-22", title: "Romanautor",         description: "Eine Challenge mit mindestens 100 Zeilen Code gelöst",                     iconKey: "BookOpen",      rarity: "rare"      as const },
  { id: "ach-23", title: "Minimalist",         description: "Eine Challenge mit höchstens 5 Zeilen Code gelöst",                        iconKey: "Minus",         rarity: "epic"      as const },
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
