import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { SITE_URL, isLegacyHost, isLocalizedPath, isVercelAliasHost } from "@/lib/site";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
  LOCALE_HEADER,
  PREFIXED_LOCALE,
  isAppLocale,
} from "@/lib/locale";
import { localeFromRequest } from "@/lib/request-locale";

const PROTECTED_PATHS = ["/profile", "/ranking", "/settings"];
const ADMIN_PREFIX = "/admin";

/**
 * `/challenge` itself is public since #287 - it is the page the whole site is about, and
 * behind a login it could be neither linked nor indexed. Everything below it stays shut:
 * `/challenge/<id>/solutions` shows other people's answers.
 */
const CHALLENGE_CHILD_PREFIX = "/challenge/";

const PREFIX = `/${PREFIXED_LOCALE}`;

/**
 * The path a `/de/…` URL stands for, or `null` when there is no prefix to strip. `/de`
 * itself is the German landing, so it maps to `/`.
 */
function stripLocalePrefix(pathname: string): string | null {
  if (pathname === PREFIX) return "/";
  if (pathname.startsWith(PREFIX + "/")) return pathname.slice(PREFIX.length);
  return null;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host") ?? request.nextUrl.host;

  /**
   * The domain the site launched on. Content-preserving, not path-preserving: everything
   * on `daily-coding.de` was German, so a German page has to land on the German URL of
   * the new domain. Sending `/changelog` to the English `/changelog` would hand a search
   * engine a different page under the same claim of "this moved here".
   *
   * Only the public paths take the prefix - the rest has no language pair, so there
   * `/de/challenge` would be a 404 where `/challenge` is the page that moved.
   *
   * Not a Vercel domain redirect: that one preserves the path and cannot insert a segment.
   */
  if (isLegacyHost(host)) {
    const target = new URL(request.url);
    target.protocol = "https:";
    target.host = new URL(SITE_URL).host;
    target.port = "";
    target.pathname = isLocalizedPath(pathname)
      ? pathname === "/"
        ? PREFIX
        : PREFIX + pathname
      : pathname;
    return NextResponse.redirect(target, 301);
  }

  /**
   * The vercel.app alias serves the same content as the custom domain. Without this, a
   * search engine may index the alias as the real thing and the brand name never shows up
   * in the results (#114). A redirect would also work, but it would close the fallback
   * route the alias provides if the domain or its DNS ever breaks.
   */
  const noindex = isVercelAliasHost(host);

  /**
   * Mutable on purpose. Two of the return points below are reached before the JWT has
   * been read, so the wrapper cannot take the locale as an argument - it reads this
   * variable when it runs, after any refinement.
   */
  let locale = localeFromRequest(request);

  /**
   * On a public page the path fixes the language, and that is the whole point of the
   * prefix: a URL whose content depends on a cookie can be crawled in one language only.
   * `null` everywhere else, where the cookie still decides.
   */
  const unprefixed = stripLocalePrefix(pathname);
  const pathLocale =
    unprefixed !== null && isLocalizedPath(unprefixed)
      ? PREFIXED_LOCALE
      : isLocalizedPath(pathname)
        ? DEFAULT_LOCALE
        : null;

  /**
   * The header is ours to set and never the visitor's to send: an inbound copy is dropped
   * before anything else, otherwise a reader could choose the language of a page that is
   * supposed to be fixed.
   */
  const forwardedHeaders = new Headers(request.headers);
  forwardedHeaders.delete(LOCALE_HEADER);
  if (pathLocale) forwardedHeaders.set(LOCALE_HEADER, pathLocale);
  const forwarded = { request: { headers: forwardedHeaders } };

  /**
   * The one place every response passes through. The noindex header needed that already;
   * the locale cookie needs it more, because it has to reach the public pages too - and
   * the landing is the page that decides what a first-time visitor sees.
   */
  const withResponseDefaults = (response: NextResponse) => {
    if (noindex) response.headers.set("X-Robots-Tag", "noindex, nofollow");
    /**
     * A prefixed page must not rewrite the cookie: reading `/de/impressum` is not a
     * decision to switch the whole app to German, and letting it write would mean a
     * German link silently re-languages the account behind it.
     */
    if (!pathLocale && request.cookies.get(LOCALE_COOKIE)?.value !== locale) {
      // Only on change: an unconditional Set-Cookie on every response would make each of
      // them uncacheable. In practice this writes once per visitor, and again after a switch.
      response.cookies.set(LOCALE_COOKIE, locale, {
        path: "/",
        maxAge: LOCALE_COOKIE_MAX_AGE,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        // Readable by the switcher in the settings, and there is nothing secret in it.
        httpOnly: false,
      });
    }
    return response;
  };

  /** `/de/impressum` renders `app/impressum`; the prefix never reaches the router. */
  const forward = () => {
    if (unprefixed === null) return NextResponse.next(forwarded);
    const rewritten = request.nextUrl.clone();
    rewritten.pathname = unprefixed;
    return NextResponse.rewrite(rewritten, forwarded);
  };

  /**
   * The guard reads the path the router will see, not the one in the address bar: `forward`
   * rewrites `/de/x` to `/x` whether or not `/x` has a language pair, so checking the
   * prefixed form would let `/de/profile` render the profile without a token.
   */
  const guarded = unprefixed ?? pathname;

  const isAdminPath =
    guarded === ADMIN_PREFIX || guarded.startsWith(ADMIN_PREFIX + "/");

  const isProtected =
    isAdminPath ||
    guarded.startsWith(CHALLENGE_CHILD_PREFIX) ||
    PROTECTED_PATHS.some(
      (path) => guarded === path || guarded.startsWith(path + "/")
    );

  if (!isProtected) return withResponseDefaults(forward());

  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!secret) {
    console.error("[proxy] Set AUTH_SECRET or NEXTAUTH_SECRET in .env");
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return withResponseDefaults(NextResponse.redirect(loginUrl));
  }

  const token = await getToken({
    req: request,
    secret,
    secureCookie: process.env.NODE_ENV === "production",
  });

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return withResponseDefaults(NextResponse.redirect(loginUrl));
  }

  /**
   * The account setting outranks the cookie, and this is the only point in a request
   * where both are known. It matters on a second device, where an earlier anonymous
   * visit may have left a cookie in the other language behind - the cookie gets
   * corrected here, and the public pages read the corrected one from then on.
   *
   * Deliberately not done for public paths: it would cost a JWT decrypt on every
   * landing-page hit to fix a case that resolves itself on the first navigation
   * into the app.
   */
  if (isAppLocale(token.locale)) locale = token.locale;

  // Admin rights are not checked from the JWT - it goes stale after a role change in
  // the DB. requireAdminPage / requireAdminApi check against the database instead.

  return withResponseDefaults(forward());
}

export const config = {
  /**
   * Everything except static assets and the metadata routes. It used to list only the
   * protected paths, but the noindex header, the locale cookie and the `.de` redirect
   * above have to reach the public pages too - those are the ones a crawler indexes
   * (#114). robots.txt and sitemap.xml are excluded so they stay statically cacheable.
   */
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.png$).*)"],
};
