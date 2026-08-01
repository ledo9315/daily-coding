import { execFileSync } from "node:child_process";

/**
 * Applies pending migrations during the Vercel build — production only.
 *
 * The build command was `prisma generate && next build`, so a merged migration never reached
 * Neon. Twice now the deployed code queried something that did not exist yet and the site
 * answered 500 until someone ran `migrate deploy` by hand (#146, #145).
 *
 * Two guards, both load-bearing:
 *
 * 1. `VERCEL_ENV` must be exactly "production". Preview deployments share the same Neon database
 *    (DATABASE_URL is set for All Environments), so without this every preview build — including
 *    branches that never get merged — would migrate the production database.
 * 2. The direct connection is preferred over the pooled one. Neon's DATABASE_URL goes through
 *    PgBouncer, and migrations there are unreliable: DDL in a transaction and the advisory lock
 *    Prisma takes on the migrations table both dislike the pooler.
 *
 * Anywhere else — locally, in CI, in a preview build — this prints what it would have done and
 * exits 0. A failing migration fails the build on purpose: no deploy is better than a deploy
 * against a schema that does not fit.
 */

const env = process.env.VERCEL_ENV ?? "(nicht gesetzt)";

if (process.env.VERCEL_ENV !== "production") {
  console.log(`[migrations] übersprungen, VERCEL_ENV=${env}`);
  process.exit(0);
}

const url = process.env.DATABASE_URL_UNPOOLED?.trim() || process.env.DATABASE_URL?.trim();

if (!url) {
  console.error("[migrations] Weder DATABASE_URL_UNPOOLED noch DATABASE_URL gesetzt.");
  process.exit(1);
}

const pooled = !process.env.DATABASE_URL_UNPOOLED?.trim();
if (pooled) {
  console.warn(
    "[migrations] DATABASE_URL_UNPOOLED fehlt, benutze die gepoolte Verbindung. " +
      "Über PgBouncer können Migrationen hängen bleiben."
  );
}

// Host only: the connection string carries credentials and must not reach the build log.
const host = (() => {
  try {
    return new URL(url).host;
  } catch {
    return "(unlesbare URL)";
  }
})();

console.log(`[migrations] prisma migrate deploy gegen ${host}`);

/*
  `prisma.production.config.ts` and not the default one: `prisma.config.ts` loads `.env.local`
  with `override: true`, so a DATABASE_URL passed in here is silently replaced by whatever sits
  in that file. Caught in testing — the script reported success against localhost while pointed
  at an unreachable host.
*/
try {
  execFileSync(
    "pnpm",
    ["exec", "prisma", "migrate", "deploy", "--config", "prisma.production.config.ts"],
    { stdio: "inherit", env: { ...process.env, PROD_DATABASE_URL: url } }
  );
} catch {
  // Prisma has printed the reason; a Node stack trace on top only buries it.
  console.error("[migrations] fehlgeschlagen, Build wird abgebrochen.");
  process.exit(1);
}
