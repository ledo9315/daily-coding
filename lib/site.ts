import { DEFAULT_LOCALE, LOCALES } from "@/lib/locale";

/**
 * The canonical origin. Written out rather than read from `APP_URL`, for the same reason
 * as `metadataBase` in `app/layout.tsx` (#111): this is the address a shared link and a
 * search result should carry, which stays the production one even in a preview build.
 */
export const SITE_URL = "https://daily-coding.dev";

/**
 * The domain the site launched on. It keeps redirecting rather than being dropped: the
 * links already shared point at it, and a German-language site whose German domain is
 * free is an invitation to whoever registers it next.
 */
export const LEGACY_HOSTS = ["daily-coding.de", "www.daily-coding.de"] as const;

export function isLegacyHost(host: string | null | undefined): boolean {
  if (!host) return false;
  const withoutPort = host.split(":")[0].toLowerCase();
  return (LEGACY_HOSTS as readonly string[]).includes(withoutPort);
}

/**
 * The pages worth recommending in the sitemap: those that carry content. The landing sits
 * on the apex URL since #130.
 *
 * This used to be `PUBLIC_PATHS`, "reachable without an account" - a different question,
 * and answering it put `/login` and `/register` in the sitemap, which recommends a sign-in
 * form for indexing (#132). Both stay crawlable; they are simply not recommended.
 */
export const SITEMAP_PATHS = ["/", "/changelog", "/impressum", "/datenschutz"] as const;

/**
 * The paths whose language the URL decides instead of the cookie. Everything else is
 * behind the login or excluded by robots.txt, and there a cookie is enough - a page no
 * crawler reaches has nothing to gain from a second URL.
 *
 * The public profiles under `/u` are the near miss: reachable without an account, and
 * shared as links - but `robots: { index: false }`, because section 4 of the
 * Datenschutzerklärung promises they stay out of the search engines. A prefix would buy
 * nothing there and cost the cookie its say, so a German reader following a profile link
 * out of the feed would land on the English rendering.
 */
export const LOCALIZED_PATHS = ["/", "/changelog", "/impressum", "/datenschutz"] as const;

/**
 * True for a path that gets a language pair - the exact prefixes above, plus anything
 * below them. `/uber-uns` must not count as `/u`, hence the segment check.
 */
export function isLocalizedPath(pathname: string): boolean {
  return LOCALIZED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path === "/" ? "//" : path + "/")
  );
}

/**
 * The address a link should carry for a reader of `locale`. The default locale owns the
 * unprefixed path, so only the other one gets a prefix - a footer link to the Impressum
 * has to land a German reader on the German one.
 */
export function localizedPath(pathname: string, locale: string): string {
  if (locale === DEFAULT_LOCALE || !isLocalizedPath(pathname)) return pathname;
  return pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;
}

/**
 * Absolute URLs of one path in every language, for `alternates.languages`.
 *
 * `x-default` names the one to show a reader whose language is neither - without it a
 * search engine picks for itself, and the pair says nothing about which is the front door.
 */
export function languageAlternates(pathname: string): Record<string, string> {
  const url = (locale: string) => `${SITE_URL}${localizedPath(pathname, locale)}`;
  return {
    ...Object.fromEntries(LOCALES.map((locale) => [locale, url(locale)])),
    "x-default": url(DEFAULT_LOCALE),
  };
}

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
