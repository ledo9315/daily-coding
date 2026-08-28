/**
 * The canonical origin. Written out rather than read from `APP_URL`, for the same reason
 * as `metadataBase` in `app/layout.tsx` (#111): this is the address a shared link and a
 * search result should carry, which stays the production one even in a preview build.
 */
export const SITE_URL = "https://daily-coding.de";

/**
 * The pages worth recommending in the sitemap: those that carry content. The landing sits
 * on the apex URL since #130.
 *
 * This used to be `PUBLIC_PATHS`, "reachable without an account" — a different question,
 * and answering it put `/login` and `/register` in the sitemap, which recommends a sign-in
 * form for indexing (#132). Both stay crawlable; they are simply not recommended.
 */
export const SITEMAP_PATHS = ["/", "/changelog", "/impressum", "/datenschutz"] as const;

/**
 * Behind the login. Kept in step with `PROTECTED_PATHS` in `proxy.ts` plus the API
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
