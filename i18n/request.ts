import { getRequestConfig } from "next-intl/server";
import { isAppLocale, type AppLocale } from "@/lib/locale";
import { localeFromRequestScope } from "@/lib/server/request-locale";

/**
 * One file per area and per language, not one `de.json` for everything. The split is what
 * makes the string extraction parallelisable: each area owns two files nobody else writes
 * to. The area name is also the namespace, so `useTranslations("auth")` reads
 * `messages/<locale>/auth.json`.
 *
 * Owners: one extraction step each. `legal` covers Impressum and Datenschutz, which are
 * bilingual as well - a translation there does not replace the German version, it stands
 * beside it. Only the admin area has no namespace: it stays German (decision E4).
 */
const NAMESPACES = [
  "api",
  "auth",
  "challenge",
  "changelog",
  "community",
  "dashboard",
  "email",
  "legal",
  "profile",
] as const;

/**
 * The language one render or one route handler reads in.
 *
 * `requested` is set when a caller names a language itself - `getTranslations({ locale })`
 * in the routes that answer the challenge page, which is fixed to a language by its URL
 * that no route handler can see (#287). Ignoring it, as this file did, means those routes
 * fall back to the cookie and label an English panel in German.
 *
 * Otherwise the request decides. No `user` argument: reading the session would mean a
 * database round trip on every render. `proxy.ts` writes the account's locale into the
 * cookie instead, so by the time this runs the cookie already carries it.
 *
 * Exported for its test: vitest resolves `next-intl` to the client build, where calling
 * the configuration `getRequestConfig` returns is refused.
 */
export function configLocale(requested: string | undefined): Promise<AppLocale> {
  return isAppLocale(requested)
    ? Promise.resolve(requested)
    : localeFromRequestScope();
}

export default getRequestConfig(async ({ locale: requested }) => {
  const locale = await configLocale(requested);

  const namespaces = await Promise.all(
    NAMESPACES.map(async (namespace) => {
      const imported = await import(`../messages/${locale}/${namespace}.json`);
      return [namespace, imported.default] as const;
    })
  );

  return { locale, messages: Object.fromEntries(namespaces) };
});
