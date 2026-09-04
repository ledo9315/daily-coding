import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  startOfUtcDay,
  startOfUtcWeek,
  startOfUtcMonth,
} from "../lib/server/ranking-period";
import {
  seedAchievementDefs,
  seedAchievementTranslations,
} from "../lib/server/achievement-defs";
import { starterAvatarPath } from "../lib/user-avatars";
import { nameKeyOf } from "../lib/display-name";
import { config as loadEnv } from "dotenv";
import { resolve } from "node:path";
import bcrypt from "bcryptjs";
import { challengeUpsertArgs } from "./challenge-upsert";
import { ALL_CHALLENGES } from "./challenges";
import { seedContentTranslations } from "./translation-upsert";

loadEnv({ path: resolve(process.cwd(), ".env") });
loadEnv({ path: resolve(process.cwd(), ".env.local"), override: true });

/*
  PROD_DATABASE_URL wins, and no .env file may touch it - same contract as
  prisma.production.config.ts. The two loadEnv calls above run with override: true, so a
  DATABASE_URL passed on the command line is silently replaced by whatever sits in .env.local:
  the seed then reports success against the local database while the caller believes it wrote to
  production. A separate name is the only thing those files cannot overwrite.
*/
const databaseUrl = process.env.PROD_DATABASE_URL?.trim() || process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL fehlt. Lege .env oder .env.local an (siehe .env.example)."
  );
}
if (process.env.PROD_DATABASE_URL?.trim()) {
  // Host only: the URL carries credentials.
  const host = (() => {
    try {
      return new URL(databaseUrl).host;
    } catch {
      return "(unlesbare URL)";
    }
  })();
  console.log(`[seed] PROD_DATABASE_URL gesetzt, Ziel ist ${host}`);
}
const adapter = new PrismaPg({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
  const anchor = startOfUtcDay(new Date());
  const rankingWeekStart = startOfUtcWeek(anchor);
  const rankingMonthStart = startOfUtcMonth(anchor);

  const devPassword = process.env.SEED_DEV_PASSWORD ?? "DailyDev2024!";
  const devPasswordHash = await bcrypt.hash(devPassword, 12);
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? devPassword;
  const adminPasswordHash = await bcrypt.hash(adminPassword, 12);

  // ─── Users ───────────────────────────────────────────────────────────────────
  // Demo data (users, rankings, submissions, default admin) only on a full seed.
  // For production set SEED_CONTENT_ONLY=true: categories, achievements, challenges only.
  const contentOnly = process.env.SEED_CONTENT_ONLY === "true";

  /*
    A full seed creates demo users with a default password, plus fixture submissions and
    rankings. Against production that is not a mess to clean up, it is eleven accounts whose
    credentials are in this file. One forgotten variable is too little between here and there.
  */
  if (process.env.PROD_DATABASE_URL?.trim() && !contentOnly) {
    throw new Error(
      "PROD_DATABASE_URL ohne SEED_CONTENT_ONLY=true: Das würde Demo-Nutzer, " +
        "Beispiel-Abgaben und Rankings in die Produktionsdatenbank schreiben. Abgebrochen."
    );
  }

  let anna!: { id: string }, tom!: { id: string }, max!: { id: string },
    lisa!: { id: string }, sarah!: { id: string }, jan!: { id: string },
    julia!: { id: string }, peter!: { id: string }, maria!: { id: string },
    david!: { id: string };

  if (!contentOnly) {
  await prisma.user.upsert({
    where: { email: "admin@dailydev.local" },
    update: {
      passwordHash: adminPasswordHash,
      role: "admin",
    },
    create: {
      id: "user-admin",
      name: "Admin",
      nameKey: nameKeyOf("Admin"),
      initials: "AD",
      avatar: starterAvatarPath("Admin"),
      email: "admin@dailydev.local",
      passwordHash: adminPasswordHash,
      role: "admin",
      streak: 0,
      streakRecord: 0,
    },
  });

  anna = await prisma.user.upsert({
    where: { email: "anna.schmidt@company.com" },
    update: { passwordHash: devPasswordHash },
    create: {
      id: "user-anna",
      name: "Anna Schmidt",
      nameKey: nameKeyOf("Anna Schmidt"),
      initials: "AS",
      avatar: starterAvatarPath("Anna Schmidt"),
      email: "anna.schmidt@company.com",
      passwordHash: devPasswordHash,
      streak: 5,
      streakRecord: 28,
    },
  });

  tom = await prisma.user.upsert({
    where: { email: "tom.weber@company.com" },
    update: { passwordHash: devPasswordHash },
    create: {
      id: "user-tom",
      name: "Tom Weber",
      nameKey: nameKeyOf("Tom Weber"),
      initials: "TW",
      avatar: starterAvatarPath("Tom Weber"),
      email: "tom.weber@company.com",
      passwordHash: devPasswordHash,
      streak: 7,
      streakRecord: 30,
    },
  });

  max = await prisma.user.upsert({
    where: { email: "max.mustermann@company.com" },
    update: { passwordHash: devPasswordHash },
    create: {
      id: "user-max",
      name: "Max Mustermann",
      nameKey: nameKeyOf("Max Mustermann"),
      initials: "MM",
      avatar: starterAvatarPath("Max Mustermann"),
      email: "max.mustermann@company.com",
      passwordHash: devPasswordHash,
      streak: 12,
      streakRecord: 28,
    },
  });

  lisa = await prisma.user.upsert({
    where: { email: "lisa.mueller@company.com" },
    update: { passwordHash: devPasswordHash },
    create: {
      id: "user-lisa",
      name: "Lisa Müller",
      nameKey: nameKeyOf("Lisa Müller"),
      initials: "LM",
      avatar: starterAvatarPath("Lisa Müller"),
      email: "lisa.mueller@company.com",
      passwordHash: devPasswordHash,
      streak: 3,
      streakRecord: 20,
    },
  });

  sarah = await prisma.user.upsert({
    where: { email: "sarah.klein@company.com" },
    update: { passwordHash: devPasswordHash },
    create: {
      id: "user-sarah",
      name: "Sarah Klein",
      nameKey: nameKeyOf("Sarah Klein"),
      initials: "SK",
      avatar: starterAvatarPath("Sarah Klein"),
      email: "sarah.klein@company.com",
      passwordHash: devPasswordHash,
      streak: 0,
      streakRecord: 15,
    },
  });

  jan = await prisma.user.upsert({
    where: { email: "jan.becker@company.com" },
    update: { passwordHash: devPasswordHash },
    create: {
      id: "user-jan",
      name: "Jan Becker",
      nameKey: nameKeyOf("Jan Becker"),
      initials: "JB",
      avatar: starterAvatarPath("Jan Becker"),
      email: "jan.becker@company.com",
      passwordHash: devPasswordHash,
      streak: 2,
      streakRecord: 18,
    },
  });

  julia = await prisma.user.upsert({
    where: { email: "julia.fischer@company.com" },
    update: { passwordHash: devPasswordHash },
    create: {
      id: "user-julia",
      name: "Julia Fischer",
      nameKey: nameKeyOf("Julia Fischer"),
      initials: "JF",
      avatar: starterAvatarPath("Julia Fischer"),
      email: "julia.fischer@company.com",
      passwordHash: devPasswordHash,
      streak: 4,
      streakRecord: 14,
    },
  });

  peter = await prisma.user.upsert({
    where: { email: "peter.hoffmann@company.com" },
    update: { passwordHash: devPasswordHash },
    create: {
      id: "user-peter",
      name: "Peter Hoffmann",
      nameKey: nameKeyOf("Peter Hoffmann"),
      initials: "PH",
      avatar: starterAvatarPath("Peter Hoffmann"),
      email: "peter.hoffmann@company.com",
      passwordHash: devPasswordHash,
      streak: 1,
      streakRecord: 10,
    },
  });

  maria = await prisma.user.upsert({
    where: { email: "maria.wagner@company.com" },
    update: { passwordHash: devPasswordHash },
    create: {
      id: "user-maria",
      name: "Maria Wagner",
      nameKey: nameKeyOf("Maria Wagner"),
      initials: "MW",
      avatar: starterAvatarPath("Maria Wagner"),
      email: "maria.wagner@company.com",
      passwordHash: devPasswordHash,
      streak: 2,
      streakRecord: 12,
    },
  });

  david = await prisma.user.upsert({
    where: { email: "david.schulz@company.com" },
    update: { passwordHash: devPasswordHash },
    create: {
      id: "user-david",
      name: "David Schulz",
      nameKey: nameKeyOf("David Schulz"),
      initials: "DS",
      avatar: starterAvatarPath("David Schulz"),
      email: "david.schulz@company.com",
      passwordHash: devPasswordHash,
      streak: 3,
      streakRecord: 9,
    },
  });
  } // Ende Demo-Nutzer

  // ─── Categories ──────────────────────────────────────────────────────────────

  /*
    The German name stays in `Category.name`; the English one goes into
    `CategoryTranslation`, because `name` is @unique and a translation written into it
    would collide with the name it translates.
  */
  const CATEGORIES = [
    { id: "cat-algorithmen", name: "Algorithmen", en: "Algorithms" },
    { id: "cat-baeume", name: "Bäume", en: "Trees" },
    { id: "cat-datenstrukturen", name: "Datenstrukturen", en: "Data Structures" },
    { id: "cat-strings", name: "Strings", en: "Strings" },
  ];

  for (const category of CATEGORIES) {
    await prisma.category.upsert({
      where: { id: category.id },
      update: {},
      create: { id: category.id, name: category.name },
    });
    await prisma.categoryTranslation.upsert({
      where: { categoryId_locale: { categoryId: category.id, locale: "en" } },
      update: { name: category.en },
      create: { categoryId: category.id, locale: "en", name: category.en },
    });
  }

  // ─── Achievement Definitions (global) ────────────────────────────────────────

  await seedAchievementDefs(prisma);
  await seedAchievementTranslations(prisma);

  // ─── User Achievements ────────────────────────────────────────────────────────

  if (!contentOnly) {
  const userAchievements = [
    { userId: max.id, achievementId: "ach-1", unlockedAt: new Date("2026-01-15") },
    { userId: max.id, achievementId: "ach-2", unlockedAt: new Date("2026-01-22") },
    { userId: max.id, achievementId: "ach-3", unlockedAt: new Date("2026-01-25") },
    { userId: max.id, achievementId: "ach-4", unlockedAt: new Date("2026-01-28") },
    { userId: max.id, achievementId: "ach-5", unlockedAt: null },
    { userId: max.id, achievementId: "ach-6", unlockedAt: null },
  ];

  for (const ua of userAchievements) {
    await prisma.userAchievement.upsert({
      where: { userId_achievementId: { userId: ua.userId, achievementId: ua.achievementId } },
      update: {},
      create: ua,
    });
  }
  } // Ende Demo-User-Achievements

  // ─── Challenges ───────────────────────────────────────────────────────────────

  /*
    The ids the demo fixtures and the ring order refer to. Their content lives in
    prisma/challenges like every other challenge; only the ids are named here.
  */
  const CHALLENGE_TODAY = "challenge-array-manipulation";
  const CHALLENGE_BINARY_SEARCH = "challenge-binary-search";
  const CHALLENGE_STRING_REVERSAL = "challenge-string-reversal";
  const CHALLENGE_HASHMAP = "challenge-hashmap";
  const CHALLENGE_RECURSION = "challenge-recursion";
  const CHALLENGE_BINARY_TREE = "challenge-binary-tree";

  // Content modules under prisma/challenges; `isActive` false until an admin adds them to the ring.
  for (const content of ALL_CHALLENGES) {
    // The language blocks are not columns of the row; they go into their own tables below.
    const { translations: _translations, ...row } = content;
    await prisma.challenge.upsert(challengeUpsertArgs({ ...row, isActive: false }));
  }

  // ─── Content translations ─────────────────────────────────────────────────────

  await seedContentTranslations(prisma);

  // Keep seed reruns deterministic even when records already existed with drifted state.
  if (!contentOnly)
  await prisma.user.updateMany({
    where: {
      email: {
        in: [
          "admin@dailydev.local",
          "anna.schmidt@company.com",
          "tom.weber@company.com",
          "max.mustermann@company.com",
          "lisa.mueller@company.com",
          "sarah.klein@company.com",
          "jan.becker@company.com",
          "julia.fischer@company.com",
          "peter.hoffmann@company.com",
          "maria.wagner@company.com",
          "david.schulz@company.com",
        ],
      },
    },
    data: { emailVerified: true },
  });

  /*
    Operational state, and therefore off-limits to a content refresh. `challengeUpsertArgs`
    already keeps isActive, position and date out of its update - this block wrote all three
    anyway, plus the ring pointer, so refreshing prose on a running instance reset the order
    someone arranged in the admin and jumped the daily challenge to the front of the ring.
  */
  if (!contentOnly) {
  // Since #67, `isActive` means "part of the rotation pool", not "is today's
  // challenge". Every finished challenge is eligible - otherwise the rotation would
  // hold a single element and the app would serve the same challenge forever.
  await prisma.challenge.updateMany({ data: { isActive: true } });
  /**
   * The order of the daily ring. `Challenge.date` is deprecated and stays null: the ring has no
   * dates, it has an order plus a pointer at where it stands.
   *
   * The six named challenges take the front so a seeded database has a predictable first week;
   * everything else follows in id order. Positions are not unique, but handing out distinct ones
   * keeps the arrows in the admin panel meaningful from the start.
   */
  await prisma.challenge.updateMany({ data: { date: null } });
  const ringOrder = [
    CHALLENGE_TODAY,
    CHALLENGE_BINARY_SEARCH,
    CHALLENGE_STRING_REVERSAL,
    CHALLENGE_HASHMAP,
    CHALLENGE_RECURSION,
    CHALLENGE_BINARY_TREE,
  ];
  for (const [index, id] of ringOrder.entries()) {
    await prisma.challenge.update({ where: { id }, data: { position: index } });
  }
  const rest = await prisma.challenge.findMany({
    where: { id: { notIn: ringOrder } },
    orderBy: { id: "asc" },
    select: { id: true },
  });
  for (const [index, c] of rest.entries()) {
    await prisma.challenge.update({
      where: { id: c.id },
      data: { position: ringOrder.length + index },
    });
  }

  // The ring starts on the well-known challenge, so a fresh database serves the same daily the
  // dashboard fixtures and the landing badge talk about.
  await prisma.rotationState.upsert({
    where: { id: "current" },
    create: { id: "current", challengeId: CHALLENGE_TODAY, position: 0, day: anchor },
    update: { challengeId: CHALLENGE_TODAY, position: 0, day: anchor },
  });
  }

  // ─── Submissions ─────────────────────────────────────────────────────────────

  if (!contentOnly) {
  // max spans three languages so „Polyglott" (ach-3) is derivable from the data, not
  // only granted by the explicit UserAchievement row above.
  const submissionData = [
    { userId: max.id, challengeId: CHALLENGE_TODAY, code: "// solved", status: "completed" as const, language: "javascript" as const, rank: 8 },
    { userId: max.id, challengeId: CHALLENGE_BINARY_SEARCH, code: "// solved", status: "completed" as const, language: "python" as const, rank: 3 },
    { userId: max.id, challengeId: CHALLENGE_BINARY_TREE, code: "// attempted", status: "failed" as const, language: "python" as const },
    { userId: max.id, challengeId: CHALLENGE_HASHMAP, code: "// solved", status: "completed" as const, language: "php" as const, rank: 12 },
    { userId: max.id, challengeId: CHALLENGE_RECURSION, code: "// solved", status: "completed" as const, language: "typescript" as const, rank: 5 },
    { userId: anna.id, challengeId: CHALLENGE_TODAY, code: "// solved", status: "completed" as const, rank: 1 },
    { userId: tom.id, challengeId: CHALLENGE_TODAY, code: "// solved", status: "completed" as const, rank: 2 },
    { userId: lisa.id, challengeId: CHALLENGE_TODAY, code: "// solved", status: "completed" as const, rank: 3 },
    { userId: jan.id, challengeId: CHALLENGE_TODAY, code: "// solved", status: "completed" as const, rank: 4 },
    { userId: sarah.id, challengeId: CHALLENGE_TODAY, code: "// solved", status: "completed" as const, rank: 5 },
    { userId: anna.id, challengeId: CHALLENGE_STRING_REVERSAL, code: "// solved", status: "completed" as const, rank: 1 },
    { userId: lisa.id, challengeId: CHALLENGE_BINARY_SEARCH, code: "// solved", status: "completed" as const, rank: 2 },
    { userId: jan.id, challengeId: CHALLENGE_HASHMAP, code: "// solved", status: "completed" as const, rank: 5 },
  ];

  for (let i = 0; i < submissionData.length; i++) {
    await prisma.submission.upsert({
      where: { id: `sub-${i + 1}` },
      update: {},
      create: {
        id: `sub-${i + 1}`,
        ...submissionData[i],
        submissionDay: new Date(anchor.getTime() + i),
      },
    });
  }

  // Weekly rankings
  const weekDate = rankingWeekStart;
  const weeklyRankings = [
    { userId: tom.id, rank: 1, previousRank: 2, points: 890, challengesSolved: 7 },
    { userId: anna.id, rank: 2, previousRank: 1, points: 875, challengesSolved: 7 },
    { userId: lisa.id, rank: 3, previousRank: 3, points: 820, challengesSolved: 6 },
    { userId: max.id, rank: 4, previousRank: 5, points: 780, challengesSolved: 6 },
    { userId: jan.id, rank: 5, previousRank: 4, points: 750, challengesSolved: 5 },
    { userId: sarah.id, rank: 6, previousRank: 6, points: 720, challengesSolved: 5 },
    { userId: julia.id, rank: 7, previousRank: 9, points: 690, challengesSolved: 5 },
    { userId: peter.id, rank: 8, previousRank: 7, points: 660, challengesSolved: 4 },
    { userId: maria.id, rank: 9, previousRank: 8, points: 630, challengesSolved: 4 },
    { userId: david.id, rank: 10, previousRank: 10, points: 600, challengesSolved: 4 },
  ];

  for (const entry of weeklyRankings) {
    await prisma.rankingEntry.upsert({
      where: { userId_period_periodDate: { userId: entry.userId, period: "week", periodDate: weekDate } },
      update: {},
      create: { period: "week", periodDate: weekDate, ...entry },
    });
  }

  // Monthly rankings
  const monthDate = rankingMonthStart;
  const monthlyRankings = [
    { userId: anna.id, rank: 1, previousRank: 1, points: 3450, challengesSolved: 28 },
    { userId: tom.id, rank: 2, previousRank: 3, points: 3280, challengesSolved: 27 },
    { userId: lisa.id, rank: 3, previousRank: 2, points: 3100, challengesSolved: 26 },
    { userId: max.id, rank: 4, previousRank: 4, points: 2950, challengesSolved: 24 },
    { userId: jan.id, rank: 5, previousRank: 6, points: 2800, challengesSolved: 23 },
    { userId: sarah.id, rank: 6, previousRank: 5, points: 2650, challengesSolved: 22 },
    { userId: julia.id, rank: 7, previousRank: 7, points: 2500, challengesSolved: 21 },
    { userId: peter.id, rank: 8, previousRank: 8, points: 2350, challengesSolved: 20 },
    { userId: maria.id, rank: 9, previousRank: 10, points: 2200, challengesSolved: 19 },
    { userId: david.id, rank: 10, previousRank: 9, points: 2050, challengesSolved: 18 },
  ];

  for (const entry of monthlyRankings) {
    await prisma.rankingEntry.upsert({
      where: { userId_period_periodDate: { userId: entry.userId, period: "month", periodDate: monthDate } },
      update: {},
      create: { period: "month", periodDate: monthDate, ...entry },
    });
  }
  } // Ende Demo-Submissions/Rankings

  console.log("✅ Seed complete");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
