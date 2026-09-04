import { getRequestConfig } from "next-intl/server";
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

export default getRequestConfig(async () => {
  /**
   * No `user` argument: reading the session would mean a database round trip on every
   * render. `proxy.ts` writes the account's locale into the cookie instead, so by the time
   * this runs the cookie already carries it.
   */
  const locale = await localeFromRequestScope();

  const namespaces = await Promise.all(
    NAMESPACES.map(async (namespace) => {
      const imported = await import(`../messages/${locale}/${namespace}.json`);
      return [namespace, imported.default] as const;
    })
  );

  return { locale, messages: Object.fromEntries(namespaces) };
});
