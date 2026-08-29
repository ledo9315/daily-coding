import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { isVercelAliasHost } from "@/lib/site";

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
  const withNoindex = (response: NextResponse) => {
    if (noindex) response.headers.set("X-Robots-Tag", "noindex, nofollow");
    return response;
  };

  const isAdminPath =
    pathname === ADMIN_PREFIX || pathname.startsWith(ADMIN_PREFIX + "/");

  const isProtected =
    isAdminPath ||
    PROTECTED_PATHS.some(
      (path) => pathname === path || pathname.startsWith(path + "/")
    );

  if (!isProtected) return withNoindex(NextResponse.next());

  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!secret) {
    console.error("[proxy] Set AUTH_SECRET or NEXTAUTH_SECRET in .env");
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return withNoindex(NextResponse.redirect(loginUrl));
  }

  const token = await getToken({
    req: request,
    secret,
    secureCookie: process.env.NODE_ENV === "production",
  });

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return withNoindex(NextResponse.redirect(loginUrl));
  }

  // Admin rights are not checked from the JWT - it goes stale after a role change in
  // the DB. requireAdminPage / requireAdminApi check against the database instead.

  return withNoindex(NextResponse.next());
}

export const config = {
  /**
   * Everything except static assets and the metadata routes. It used to list only the
   * protected paths, but the noindex header above has to reach the public pages too -
   * those are the ones a crawler indexes (#114). robots.txt and sitemap.xml are excluded
   * so they stay statically cacheable.
   */
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.png$).*)"],
};
