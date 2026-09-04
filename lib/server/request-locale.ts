import { cookies, headers } from "next/headers";
import { LOCALE_COOKIE, resolveLocale, type AppLocale } from "@/lib/locale";

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
