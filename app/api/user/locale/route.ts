import { NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth-session";
import { LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE, isAppLocale } from "@/lib/locale";

export async function PATCH(request: Request) {
  const session = await getSessionUserId();
  if (session.error) return session.error;

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const locale = body?.locale;
  if (!isAppLocale(locale)) {
    const t = await getTranslations("api");
    return NextResponse.json({ error: t("user.invalidLocale") }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: session.userId },
    data: { locale },
  });

  const response = NextResponse.json({ locale });
  /**
   * The account row alone is not enough: server components read the cookie through
   * `localeFromRequestScope`, and until the JWT carries the new locale the proxy would
   * keep handing them the old one.
   */
  response.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: LOCALE_COOKIE_MAX_AGE,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    httpOnly: false,
  });
  return response;
}
