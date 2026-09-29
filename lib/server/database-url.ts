/**
 * The connection string the app uses. APP_DATABASE_URL wins because the Neon integration owns
 * DATABASE_URL on Vercel: its variables are locked there and cannot point anywhere else.
 * Removing APP_DATABASE_URL falls back to Neon.
 */
export function databaseUrl(
  env: Record<string, string | undefined> = process.env
): string | undefined {
  return env.APP_DATABASE_URL?.trim() || env.DATABASE_URL;
}
