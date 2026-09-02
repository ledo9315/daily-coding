import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { config as loadEnv } from "dotenv";
import { resolve } from "node:path";
import { persistAchievementUnlocks } from "../lib/server/achievement-unlocks";

loadEnv({ path: resolve(process.cwd(), ".env") });
loadEnv({ path: resolve(process.cwd(), ".env.local"), override: true });

/**
 * Freezes the achievements every existing user has already reached.
 *
 * `persistAchievementUnlocks` runs on each successful submission from #205 on, so new
 * unlocks are safe. Accounts that unlocked something before that still carry nothing but
 * the derived state, and would lose it to the very re-submission the fix is about. One
 * run over all users closes that gap; a second run writes nothing.
 *
 *   pnpm exec tsx scripts/backfill-achievement-unlocks.ts
 *   PROD_DATABASE_URL='postgresql://…' pnpm exec tsx scripts/backfill-achievement-unlocks.ts
 */
async function main() {
  /*
    PROD_DATABASE_URL wins, same contract as prisma.production.config.ts and the seed: the
    two loadEnv calls above run with override: true, so a DATABASE_URL passed on the command
    line is silently replaced by whatever sits in .env.local. The script would then report
    success against the local database while the caller believes it wrote to production.
  */
  const connectionString =
    process.env.PROD_DATABASE_URL?.trim() || process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("Weder PROD_DATABASE_URL noch DATABASE_URL ist gesetzt.");
  }

  if (process.env.PROD_DATABASE_URL?.trim()) {
    // Host only: the URL carries credentials.
    const host = (() => {
      try {
        return new URL(connectionString).host;
      } catch {
        return "(unlesbare URL)";
      }
    })();
    console.log(`[backfill] PROD_DATABASE_URL gesetzt, Ziel ist ${host}`);
  }

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  try {
    const users = await prisma.user.findMany({ select: { id: true, name: true } });
    let frozen = 0;

    for (const user of users) {
      const ids = await persistAchievementUnlocks(prisma, user.id);
      if (ids.length > 0) {
        frozen += ids.length;
        console.log(`${user.name}: ${ids.join(", ")}`);
      }
    }

    console.log(`\n${users.length} Nutzer geprüft, ${frozen} Freischaltungen gesichert.`);
  } finally {
    await prisma.$disconnect();
  }
}

void main();
