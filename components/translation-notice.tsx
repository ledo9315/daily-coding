import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { CONTENT_SOURCE_LOCALE } from "@/lib/locale";
import { localizedPath } from "@/lib/site";

/**
 * Shown above a legal page that is being read in a translation.
 *
 * Impressum and Datenschutzerklärung describe the duties of a German operator and were
 * written in German. The English version stands beside the original rather than replacing
 * it, and a reader has no way of knowing that from the page alone - it reads like the real
 * thing. The notice says so and links to the version that is.
 *
 * Nothing renders on the German page: there it would be a sentence about itself.
 */
export async function TranslationNotice({ path }: { path: string }) {
  const [locale, t] = await Promise.all([getLocale(), getTranslations("legal")]);
  if (locale === CONTENT_SOURCE_LOCALE) return null;

  return (
    <p className="mb-8 border-2 border-border bg-card px-4 py-3 text-sm text-muted-foreground">
      {t("translationNotice.text")}{" "}
      <Link
        href={localizedPath(path, CONTENT_SOURCE_LOCALE)}
        className="text-primary hover:underline"
      >
        {t("translationNotice.link")}
      </Link>
    </p>
  );
}
