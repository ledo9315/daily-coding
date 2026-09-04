import type { NextRequest } from "next/server";
import { LOCALE_COOKIE, resolveLocale, type AppLocale } from "@/lib/locale";

/**
 * The request-bound half of the locale resolution: pulls the three request signals out of
 * a `NextRequest` and hands them to `resolveLocale`. Kept apart from `lib/locale.ts` so
 * the decision logic there stays testable without a request object.
 */
export function localeFromRequest(
  request: NextRequest,
  /** `User.locale` when the caller has it - the authoritative signal (E6). */
  user?: string | null
): AppLocale {
  return resolveLocale({
    user,
    cookie: request.cookies.get(LOCALE_COOKIE)?.value,
    acceptLanguage: request.headers.get("accept-language"),
    // Vercel only; absent locally and in tests, which is why it is never the first signal.
    country: request.headers.get("x-vercel-ip-country"),
  });
}
