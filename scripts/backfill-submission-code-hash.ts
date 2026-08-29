import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { config as loadEnv } from "dotenv";
import { resolve } from "node:path";
import { codeHash } from "../lib/server/code-hash";

loadEnv({ path: resolve(process.cwd(), ".env") });
loadEnv({ path: resolve(process.cwd(), ".env.local"), override: true });

/**
 * Fills `Submission.codeHash` for rows written before the column existed (#223).
 *
 * Without it those rows carry no hash, are left out of the grouped solution list and would
 * silently disappear from the page. Idempotent: only rows with `codeHash: null` are read, so
 * a second run writes nothing.
 *
 *   pnpm exec tsx scripts/backfill-submission-code-hash.ts
 */
const BATCH_SIZE = 500;

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL ist nicht gesetzt.");

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  try {
    let filled = 0;

    for (;;) {
      const rows = await prisma.submission.findMany({
        where: { codeHash: null },
        select: { id: true, code: true },
        take: BATCH_SIZE,
      });
      if (rows.length === 0) break;

      for (const row of rows) {
        await prisma.submission.update({
          where: { id: row.id },
          data: { codeHash: codeHash(row.code) },
        });
      }
      filled += rows.length;
      console.log(`${filled} Einreichungen gehasht …`);
    }

    console.log(`\nFertig, ${filled} Einreichungen nachgefüllt.`);
  } finally {
    await prisma.$disconnect();
  }
}

void main();
