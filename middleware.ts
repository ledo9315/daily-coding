import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const PROTECTED_PATHS = ["/profile", "/challenge", "/ranking", "/settings"];
const ADMIN_PREFIX = "/admin";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminPath =
    pathname === ADMIN_PREFIX || pathname.startsWith(ADMIN_PREFIX + "/");

  const isProtected =
    isAdminPath ||
    PROTECTED_PATHS.some(
      (path) => pathname === path || pathname.startsWith(path + "/")
    );

  if (!isProtected) return NextResponse.next();

  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!secret) {
    console.error("[middleware] Set AUTH_SECRET or NEXTAUTH_SECRET in .env");
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const token = await getToken({
    req: request,
    secret,
    secureCookie: process.env.NODE_ENV === "production",
  });

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin-Rechte: nicht per JWT (nach DB-Änderung veraltet), sondern in
  // requireAdminPage / requireAdminApi per Datenbank prüfen.

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/profile/:path*",
    "/challenge",
    "/challenge/:path*",
    "/ranking/:path*",
    "/settings/:path*",
  ],
};
