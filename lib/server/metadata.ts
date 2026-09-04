import { getLocale } from "next-intl/server";
import type { Metadata } from "next";
import { languageAlternates, localizedPath } from "@/lib/site";

/**
 * `alternates` for a public page, in the language this request is being rendered in.
 *
 * The same component answers `/impressum` and `/de/impressum` - `proxy.ts` rewrites the
 * prefix away - so the canonical cannot be a constant. Were it one, both URLs would name
 * the same page as the original and one of the two languages would drop out of the index.
 */
export async function localizedAlternates(pathname: string): Promise<Metadata["alternates"]> {
  const locale = await getLocale();
  return {
    canonical: localizedPath(pathname, locale),
    languages: languageAlternates(pathname),
  };
}
