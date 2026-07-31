/**
 * The canonical origin. Written out rather than read from `APP_URL`, for the same reason
 * as `metadataBase` in `app/layout.tsx` (#111): this is the address a shared link and a
 * search result should carry, which stays the production one even in a preview build.
 */
export const SITE_URL = "https://daily-coding.de";

/** Reachable without an account — the only pages worth putting in a sitemap (#114). */
export const PUBLIC_PATHS = [
  // The landing itself since #130; `/landing` now only redirects here.
  "/",
  "/login",
  "/register",
  "/impressum",
  "/datenschutz",
] as const;

/**
 * Behind the login. Kept in step with `PROTECTED_PATHS` in `middleware.ts` plus the API
 * and the admin area; a crawler following these only ever reaches the login form.
 */
export const PRIVATE_PATHS = [
  "/api/",
  "/admin",
  "/challenge",
  "/profile",
  "/settings",
  "/ranking",
] as const;

/**
 * True for the `*.vercel.app` alias, which serves the same content as the custom domain.
 * Matched on the host suffix, not with `includes`, so a host like
 * `vercel.app.daily-coding.de` does not qualify (#114).
 */
export function isVercelAliasHost(host: string | null | undefined): boolean {
  if (!host) return false;
  const withoutPort = host.split(":")[0].toLowerCase();
  return withoutPort === "vercel.app" || withoutPort.endsWith(".vercel.app");
}
