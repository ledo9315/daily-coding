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
 * gets when nothing at all is known about them, and the locale that owns the unprefixed
 * URL. Both were German until the domain moved to `.dev`; they flipped together, in one
 * release, so that German moved once in the index instead of twice.
 */
export const DEFAULT_LOCALE: AppLocale = "en";

/** The locale that keeps a URL prefix - everything that is not `DEFAULT_LOCALE`. */
export const PREFIXED_LOCALE: AppLocale = "de";

/**
 * The language the seeded content is written in - the one sitting in the columns of
 * `Challenge`, `Category` and `AchievementDef`, with every other language in a
 * `*Translation` table beside it.
 *
 * Deliberately its own constant and not `DEFAULT_LOCALE`, which it happened to equal until
 * the domain moved. They answer different questions: this one is "what does the database
 * already hold", the other is "what does an unprefixed URL show". Sharing a constant meant
 * the flip silently claimed English needed no translation row - and English would have
 * rendered the German columns.
 */
export const CONTENT_SOURCE_LOCALE: AppLocale = "de";

/**
 * `NEXT_LOCALE` is `next-intl`'s own cookie name. The request config reads it by hand, but
 * keeping the name means a later move to next-intl's own routing middleware costs no
 * cookie migration.
 */
export const LOCALE_COOKIE = "NEXT_LOCALE";

/**
 * How `proxy.ts` tells the request config which language a *public* URL stands for. On
 * those pages the path decides, not the cookie: `/impressum` is the English one and
 * `/de/impressum` the German one, whoever is reading. That is what makes them indexable
 * in both languages - a URL whose content depends on a cookie can only ever be crawled
 * in one.
 *
 * Set on the rewritten request, never trusted from the outside: `proxy.ts` strips any
 * inbound copy first, otherwise a visitor could pick the language of a page that is
 * supposed to be fixed.
 */
export const LOCALE_HEADER = "x-app-locale";

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
