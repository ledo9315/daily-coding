import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { config as loadEnv } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";

/**
 * Writes the challenge content of a database back to `prisma/challenges.json`.
 *
 * Challenges are authored in the admin UI, not in the seed. For a long time that meant they
 * existed in exactly one place - the database they were typed into. 25 of the 40 challenges
 * lived only in the local one, so `db:reset` would have taken them with it and production
 * never had them (#276).
 *
 * Round trip: write a challenge in the admin, run this, commit the JSON.
 *
 *   pnpm challenges:export                          # local database
 *   PROD_DATABASE_URL='postgresql://…' pnpm challenges:export
 *
 * Content only. `isActive`, `position` and `date` are operational state that belongs to the
 * instance, not to the challenge - `challengeUpsertArgs` keeps them out of an update for the
 * same reason, and the seed derives them.
 */
loadEnv({ path: resolve(process.cwd(), ".env") });
loadEnv({ path: resolve(process.cwd(), ".env.local"), override: true });

const databaseUrl = process.env.PROD_DATABASE_URL?.trim() || process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("Weder PROD_DATABASE_URL noch DATABASE_URL gesetzt.");
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) });

async function main() {
  // Ring order, so the JSON reads in the order the challenges are served and the seed can
  // hand out positions by index.
  const challenges = await prisma.challenge.findMany({ orderBy: { position: "asc" } });

  const content = challenges.map((c) => ({
    id: c.id,
    title: c.title,
    description: c.description,
    difficulty: c.difficulty,
    points: c.points,
    categoryId: c.categoryId,
    hints: c.hints,
    examples: c.examples,
    evaluationConfig: c.evaluationConfig,
    testCases: c.testCases,
    supportedLanguages: c.supportedLanguages,
    starterCodes: c.starterCodes,
    starterCode: c.starterCode,
  }));

  const target = resolve(process.cwd(), "prisma/challenges.json");
  writeFileSync(target, `${JSON.stringify(content, null, 2)}\n`, "utf8");
  console.log(`${content.length} Challenges nach prisma/challenges.json geschrieben.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
