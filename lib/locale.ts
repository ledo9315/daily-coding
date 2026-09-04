/**
 * Locale resolution for the bilingual app. Deliberately free of any Next.js, Prisma or
 * `next-intl` import: `proxy.ts` runs this on every request, the request config runs it
 * on the server, and the unit tests run it in plain Node.
 */

export const LOCALES = ["de", "en"] as const;

/**
 * Named `AppLocale`, not `Locale`: both Prisma's generated enum and `next-intl` export a
 * `Locale`, and the modules that need this one - the mail service above all - import from
 * all three.
 */
export type AppLocale = (typeof LOCALES)[number];

/**
 * Two jobs in one constant, and they only look like a coincidence: the locale a visitor
 * gets when nothing at all is known about them, and the locale that will later own the
 * unprefixed URL. Both are German today and both become English in the same release as
 * the domain switch, so the flip stays one line (plan, section 3b).
 */
export const DEFAULT_LOCALE: AppLocale = "de";

/**
 * `NEXT_LOCALE` is `next-intl`'s own cookie name. Nothing reads it as such yet - the
 * request config reads it by hand - but should the public pages ever get a URL prefix,
 * its middleware picks up this cookie without a second migration.
 */
export const LOCALE_COOKIE = "NEXT_LOCALE";

export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/**
 * The language is German, not Germany - hence Austria and Switzerland. For Switzerland it
 * is a bet, but a better one than English.
 */
export const GERMAN_SPEAKING_COUNTRIES = ["DE", "AT", "CH"] as const;

export function isAppLocale(value: unknown): value is AppLocale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/**
 * Best supported locale from an `Accept-Language` header, or `null` when the header names
 * none of ours.
 *
 * The user's own browser setting, and therefore a better first signal than geography: a
 * German browser in Zurich gets German, an American visitor in Berlin gets English.
 */
export function parseAcceptLanguage(header: string | null | undefined): AppLocale | null {
  if (!header) return null;

  const candidates: { locale: AppLocale; quality: number }[] = [];

  for (const part of header.split(",")) {
    const [tag, ...params] = part.trim().split(";");
    // `*` means "anything goes" and must not decide between two languages we support.
    if (!tag || tag === "*") continue;

    const base = tag.split("-")[0].toLowerCase();
    if (!isAppLocale(base)) continue;

    const qParam = params.find((p) => p.trim().startsWith("q="));
    const quality = qParam ? Number.parseFloat(qParam.trim().slice(2)) : 1;
    // `q=0` is an explicit rejection, not a weak preference.
    if (!Number.isFinite(quality) || quality <= 0) continue;

    candidates.push({ locale: base, quality });
  }

  if (candidates.length === 0) return null;

  // Stable by construction: `sort` in V8 is stable, so equal q-values keep header order,
  // which is the order the browser meant.
  candidates.sort((a, b) => b.quality - a.quality);
  return candidates[0].locale;
}

export function localeFromCountry(country: string | null | undefined): AppLocale | null {
  if (!country) return null;
  const upper = country.trim().toUpperCase();
  return (GERMAN_SPEAKING_COUNTRIES as readonly string[]).includes(upper) ? "de" : null;
}

export type LocaleSources = {
  /** `User.locale` of the signed-in account. */
  user?: string | null;
  cookie?: string | null;
  acceptLanguage?: string | null;
  /** `x-vercel-ip-country`; absent outside Vercel, so never the primary signal. */
  country?: string | null;
};

/**
 * The five stages from decision E6, with one deviation from how they were first written:
 * the account setting beats the cookie, not the other way round.
 *
 * The cookie is a cache of a decision, the account row is the record of it. They disagree
 * exactly once - on a second device where an older anonymous visit left a cookie behind -
 * and there the account is the one that is right.
 */
export function resolveLocale(sources: LocaleSources): AppLocale {
  if (isAppLocale(sources.user)) return sources.user;
  if (isAppLocale(sources.cookie)) return sources.cookie;
  return (
    parseAcceptLanguage(sources.acceptLanguage) ??
    localeFromCountry(sources.country) ??
    DEFAULT_LOCALE
  );
}
