import { DEFAULT_LOCALE, isAppLocale, type AppLocale } from "@/lib/locale";

/** Formats seconds as "M:SS" string. Returns "-" for null/0. */
export function formatTime(seconds: number | null | undefined): string {
  if (!seconds) return "-";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * Every formatter below takes `string`, not `AppLocale`, because that is what `useLocale()`
 * and `getLocale()` return - next-intl narrows them only through an `AppConfig` module
 * augmentation, which the i18n fundament deliberately does not declare. Narrowing here
 * beats letting `Intl` fall back to the runtime's own locale, which on a server is whatever
 * the container was built with.
 *
 * The default on every `locale` parameter marks a call site still to be migrated, not one
 * that wants German forever.
 */
function appLocale(locale: string): AppLocale {
  return isAppLocale(locale) ? locale : DEFAULT_LOCALE;
}

/** Numeric date - "15.03.2026" in German, "03/15/2026" in English. */
export function formatDate(date: Date, locale: string = DEFAULT_LOCALE): string {
  return new Date(date).toLocaleDateString(appLocale(locale), {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/** Date with the month spelled out - "15. März 2026" / "March 15, 2026". */
export function formatLongDate(date: Date, locale: string = DEFAULT_LOCALE): string {
  return new Date(date).toLocaleDateString(appLocale(locale), {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

/** Weekday and date without the year - "Sonntag, 15. März" / "Sunday, March 15". */
export function formatWeekdayDate(date: Date, locale: string = DEFAULT_LOCALE): string {
  return new Date(date).toLocaleDateString(appLocale(locale), {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

/** Abbreviated month and year in UTC - "Okt. 2026" / "Oct 2026". */
export function formatMonthYearShort(date: Date, locale: string = DEFAULT_LOCALE): string {
  return new Date(date).toLocaleDateString(appLocale(locale), {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Full month and year in UTC - "Oktober 2026" / "October 2026". */
export function formatMonthYearLong(date: Date, locale: string = DEFAULT_LOCALE): string {
  return new Date(date).toLocaleDateString(appLocale(locale), {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Wall-clock time without seconds - "09:05" / "09:05 AM". */
export function formatTimeOfDay(date: Date, locale: string = DEFAULT_LOCALE): string {
  return new Date(date).toLocaleTimeString(appLocale(locale), {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Grouped integer - "1.500" in German, "1,500" in English. */
export function formatNumber(value: number, locale: string = DEFAULT_LOCALE): string {
  return value.toLocaleString(appLocale(locale));
}
