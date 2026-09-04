import { cookies, headers } from "next/headers";
import {
  LOCALE_COOKIE,
  LOCALE_HEADER,
  isAppLocale,
  resolveLocale,
  type AppLocale,
} from "@/lib/locale";

/**
 * The same resolution as `localeFromRequest` in `lib/request-locale.ts`, but for code that
 * has no request object to pass around - the `next-intl` request config and NextAuth's
 * callbacks. Two modules rather than one because `next/headers` cannot be imported into
 * `proxy.ts`, which is the other caller.
 */
export async function localeFromRequestScope(
  /** `User.locale` when the caller has it - the authoritative signal (E6). */
  user?: string | null
): Promise<AppLocale> {
  try {
    const [cookieStore, headerList] = await Promise.all([cookies(), headers()]);

    /**
     * A public page whose language the path fixed. It outranks even the account setting:
     * `/de/impressum` is the German Impressum for everyone, or it could not be the URL a
     * search engine files under German. `proxy.ts` is the only writer of this header.
     */
    const fromPath = headerList.get(LOCALE_HEADER);
    if (isAppLocale(fromPath)) return fromPath;

    return resolveLocale({
      user,
      cookie: cookieStore.get(LOCALE_COOKIE)?.value,
      acceptLanguage: headerList.get("accept-language"),
      country: headerList.get("x-vercel-ip-country"),
    });
  } catch {
    /**
     * Both throw outside a request scope. One caller is NextAuth's `jwt` callback, and a
     * throw there fails the whole sign-in - losing the language is the smaller price.
     */
    return resolveLocale({ user });
  }
}

/**
 * The language a client explicitly asks an API for, or `undefined`.
 *
 * The challenge page is language-fixed by its path since #287, but the task itself arrives
 * from a route handler, and no path reaches that one - it would fall back to the cookie and
 * answer with the other language, which is how a German task ended up under an English
 * heading. So the page names the language it is rendering in.
 *
 * Only for JSON a caller reads about itself. It is deliberately *not* honoured on a page:
 * there the URL decides, or the same address could be crawled in either language.
 */
export function localeFromQuery(url: string): AppLocale | undefined {
  const value = new URL(url).searchParams.get("locale");
  return isAppLocale(value) ? value : undefined;
}
