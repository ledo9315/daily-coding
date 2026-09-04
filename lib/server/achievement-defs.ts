// Relative, not `@/lib/...`: the seed imports this module through tsx, where the alias
// does not resolve - every other module reached from `prisma/` imports the same way.
import type { AchievementRarity } from "../generated/prisma/enums";

/** One achievement as the seed writes it: the German row plus its other languages. */
export type AchievementDefSeed = {
  id: string;
  title: string;
  description: string;
  iconKey: string;
  rarity: AchievementRarity;
  translations: { en: { title: string; description: string } };
};

/**
 * The global achievement definitions. Titles and descriptions are user-visible; they live
 * in the database (`AchievementDef`) because the profile and the dashboard read them with
 * `findMany`, so the seed is the only way to change them.
 *
 * The German text stays in the columns of the row and is the fallback for every locale
 * without a translation; `translations` spells out the further languages, which go into
 * `AchievementTranslation`. Same split as a challenge module (E8). The English titles are
 * names, not descriptions: „Ohne Stützräder“ is „No Training Wheels“, not „solved a hard
 * challenge unaided“ - a title that needs a subclause has lost the wink it was written for.
 *
 * Array order is display order. The views sort by it rather than by id, because
 * `orderBy id` is a string sort and puts "ach-10" before "ach-2".
 */
export const ACHIEVEMENT_DEFS: AchievementDefSeed[] = [
  { id: "ach-1", title: "Erste Schritte", description: "Erste Challenge abgeschlossen",
    iconKey: "Check", rarity: "common",
    translations: { en: { title: "First Steps", description: "First challenge completed" } } },
  { id: "ach-2", title: "Wochenend-Krieger", description: "7 Tage Streak erreicht",
    iconKey: "CalendarWeek", rarity: "rare",
    translations: { en: { title: "Weekend Warrior", description: "Reached a 7-day streak" } } },
  { id: "ach-3", title: "Polyglott", description: "An drei Tagen in drei verschiedenen Sprachen gelöst",
    iconKey: "Code", rarity: "rare",
    translations: { en: { title: "Polyglot", description: "Solved in three different languages on three days" } } },
  { id: "ach-4", title: "Code-Meister", description: "10 schwere Challenges gelöst",
    iconKey: "Trophy", rarity: "epic",
    translations: { en: { title: "Code Master", description: "Solved 10 hard challenges" } } },
  { id: "ach-5", title: "Unaufhaltsam", description: "30 Tage Streak erreicht",
    iconKey: "Zap", rarity: "legendary",
    translations: { en: { title: "Unstoppable", description: "Reached a 30-day streak" } } },
  { id: "ach-6", title: "Perfektionist", description: "20 Challenges ohne Fehler",
    iconKey: "Bullseye", rarity: "epic",
    translations: { en: { title: "Perfectionist", description: "20 challenges without a single failed test" } } },
  { id: "ach-7", title: "Dranbleiber", description: "3 Tage Streak erreicht",
    iconKey: "CalendarCheck", rarity: "common",
    translations: { en: { title: "Streak Starter", description: "Reached a 3-day streak" } } },
  { id: "ach-8", title: "Ohne Stützräder", description: "Erste schwere Challenge gelöst",
    iconKey: "TrendingUp", rarity: "common",
    translations: { en: { title: "No Training Wheels", description: "Solved your first hard challenge" } } },
  { id: "ach-9", title: "Allrounder", description: "Je eine leichte, mittlere und schwere Challenge gelöst",
    iconKey: "Shuffle", rarity: "rare",
    translations: { en: { title: "All-Rounder", description: "Solved an easy, a medium and a hard challenge" } } },
  { id: "ach-10", title: "Halbes Hundert", description: "50 Challenges gelöst",
    iconKey: "ChartBar", rarity: "epic",
    translations: { en: { title: "Half Century", description: "Solved 50 challenges" } } },
  { id: "ach-11", title: "Hundertschaft", description: "100 Challenges gelöst",
    iconKey: "Coin", rarity: "legendary",
    translations: { en: { title: "Century", description: "Solved 100 challenges" } } },
  { id: "ach-12", title: "Dreistellig", description: "100 Tage Streak erreicht",
    iconKey: "Power", rarity: "legendary",
    translations: { en: { title: "Triple Digits", description: "Reached a 100-day streak" } } },
  { id: "ach-13", title: "Weltenbummler", description: "In sechs verschiedenen Sprachen gelöst",
    iconKey: "Map", rarity: "epic",
    translations: { en: { title: "Globetrotter", description: "Solved in six different languages" } } },
  { id: "ach-14", title: "Rostfrei", description: "Eine Challenge in Rust gelöst",
    iconKey: "Shield", rarity: "rare",
    translations: { en: { title: "Rustproof", description: "Solved a challenge in Rust" } } },
  { id: "ach-15", title: "Wiederholungstäter", description: "Dieselbe Challenge ein zweites Mal gelöst. Der Ring dreht sich weiter.",
    iconKey: "Repeat", rarity: "rare",
    translations: { en: { title: "Repeat Offender", description: "Solved the same challenge a second time. The ring keeps turning." } } },
  { id: "ach-16", title: "Comeback", description: "Nach mindestens 30 Tagen Pause wieder eine Challenge gelöst",
    iconKey: "Downasaur", rarity: "rare",
    translations: { en: { title: "Comeback", description: "Solved a challenge again after a break of at least 30 days" } } },
  { id: "ach-17", title: "Last Minute", description: "In der letzten Stunde vor dem Tageswechsel gelöst",
    iconKey: "Hourglass", rarity: "rare",
    translations: { en: { title: "Last Minute", description: "Solved in the last hour before the day rolled over" } } },
  { id: "ach-18", title: "Früher Vogel", description: "Als erste Person die Tages-Challenge gelöst",
    iconKey: "Sun", rarity: "rare",
    translations: { en: { title: "Early Bird", description: "First to solve the daily challenge" } } },
  { id: "ach-19", title: "Wortmeldung", description: "Ersten Kommentar zu einer Lösung geschrieben",
    iconKey: "Comment", rarity: "common",
    translations: { en: { title: "Chiming In", description: "Wrote your first comment on a solution" } } },
  { id: "ach-20", title: "Vorbild", description: "10 Best-Practices-Stimmen für eigene Lösungen erhalten",
    iconKey: "Heart", rarity: "epic",
    translations: { en: { title: "Role Model", description: "Received 10 best-practice votes for your own solutions" } } },
  { id: "ach-21", title: "Trickreich", description: "5 Clever-Stimmen für eigene Lösungen erhalten",
    iconKey: "Lightbulb", rarity: "rare",
    translations: { en: { title: "Crafty", description: "Received 5 clever votes for your own solutions" } } },
  { id: "ach-22", title: "Romanautor", description: "Eine Challenge mit mindestens 100 Zeilen Code gelöst",
    iconKey: "BookOpen", rarity: "rare",
    translations: { en: { title: "Novelist", description: "Solved a challenge with at least 100 lines of code" } } },
  { id: "ach-23", title: "Minimalist", description: "Eine Challenge mit höchstens 5 Zeilen Code gelöst",
    iconKey: "Minus", rarity: "epic",
    translations: { en: { title: "Minimalist", description: "Solved a challenge with at most 5 lines of code" } } },
];

/** The row as it is stored: the German columns, without the language blocks. */
type AchievementDefRow = Omit<AchievementDefSeed, "translations">;

type AchievementDefUpsertClient = {
  achievementDef: {
    upsert: (args: {
      where: { id: string };
      update: AchievementDefRow;
      create: AchievementDefRow;
    }) => Promise<unknown>;
  };
};

type AchievementTranslationUpsertClient = {
  achievementTranslation: {
    upsert: (args: {
      where: { achievementId_locale: { achievementId: string; locale: "en" } };
      update: { title: string; description: string };
      create: { achievementId: string; locale: "en"; title: string; description: string };
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
    const { translations: _translations, ...row } = def;
    await client.achievementDef.upsert({
      where: { id: row.id },
      update: row,
      create: row,
    });
  }
}

/**
 * The English rows for the same list. German is not written here: the seed mirrors it from
 * the columns, so an admin edit to a title is picked up instead of being overwritten by
 * this file.
 */
export async function seedAchievementTranslations(
  client: AchievementTranslationUpsertClient
): Promise<void> {
  for (const def of ACHIEVEMENT_DEFS) {
    const text = def.translations.en;
    await client.achievementTranslation.upsert({
      where: { achievementId_locale: { achievementId: def.id, locale: "en" } },
      update: text,
      create: { achievementId: def.id, locale: "en", ...text },
    });
  }
}
