import { defineConfig } from "prisma/config";

/**
 * Migrations against the production database (Neon), run by hand.
 *
 * A separate config, and a differently named variable, on purpose. `prisma.config.ts` loads
 * `.env.local` with `override: true`, so an exported `DATABASE_URL` is silently replaced by the
 * local one — a migration meant for production then runs against Docker and reports success.
 * `PROD_DATABASE_URL` cannot be overwritten that way because nothing else reads it.
 *
 * Deliberately loads no env file: the URL has to be passed in for the one command, so it cannot
 * end up on disk.
 *
 *   PROD_DATABASE_URL='postgresql://…' pnpm prisma migrate deploy --config prisma.production.config.ts
 *
 * Needed because the Vercel build runs `prisma generate && next build` only, never
 * `migrate deploy` (#146): merging a migration does not apply it.
 */
const databaseUrl = process.env["PROD_DATABASE_URL"]?.trim();

if (!databaseUrl) {
  throw new Error(
    "PROD_DATABASE_URL ist nicht gesetzt. Diese Config ist nur für Migrationen gegen die Produktionsdatenbank gedacht."
  );
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: databaseUrl,
  },
});
