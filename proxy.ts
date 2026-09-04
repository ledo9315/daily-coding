import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { isVercelAliasHost } from "@/lib/site";
import { LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE, isAppLocale } from "@/lib/locale";
import { localeFromRequest } from "@/lib/request-locale";

const PROTECTED_PATHS = ["/profile", "/challenge", "/ranking", "/settings"];
const ADMIN_PREFIX = "/admin";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  /**
   * The vercel.app alias serves the same content as the custom domain. Without this, a
   * search engine may index the alias as the real thing and the brand name never shows up
   * in the results (#114). A redirect would also work, but it would close the fallback
   * route the alias provides if the domain or its DNS ever breaks.
   */
  // `host` is what the client asked for; `nextUrl.host` is the fallback, and the only one
  // present when a NextRequest is built from a URL without headers.
  const noindex = isVercelAliasHost(
    request.headers.get("host") ?? request.nextUrl.host
  );

  /**
   * Mutable on purpose. Two of the return points below are reached before the JWT has
   * been read, so the wrapper cannot take the locale as an argument - it reads this
   * variable when it runs, after any refinement.
   */
  let locale = localeFromRequest(request);

  /**
   * The one place every response passes through. The noindex header needed that already;
   * the locale cookie needs it more, because it has to reach the public pages too - and
   * the landing is the page that decides what a first-time visitor sees.
   */
  const withResponseDefaults = (response: NextResponse) => {
    if (noindex) response.headers.set("X-Robots-Tag", "noindex, nofollow");
    // Only on change: an unconditional Set-Cookie on every response would make each of
    // them uncacheable. In practice this writes once per visitor, and again after a switch.
    if (request.cookies.get(LOCALE_COOKIE)?.value !== locale) {
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

  const isAdminPath =
    pathname === ADMIN_PREFIX || pathname.startsWith(ADMIN_PREFIX + "/");

  const isProtected =
    isAdminPath ||
    PROTECTED_PATHS.some(
      (path) => pathname === path || pathname.startsWith(path + "/")
    );

  if (!isProtected) return withResponseDefaults(NextResponse.next());

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

  return withResponseDefaults(NextResponse.next());
}

export const config = {
  /**
   * Everything except static assets and the metadata routes. It used to list only the
   * protected paths, but the noindex header and the locale cookie above have to reach the
   * public pages too - those are the ones a crawler indexes (#114). robots.txt and
   * sitemap.xml are excluded so they stay statically cacheable.
   */
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.png$).*)"],
};
