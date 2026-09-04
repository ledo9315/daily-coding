import type { MetadataRoute } from "next";
import { SITE_URL, SITEMAP_PATHS, languageAlternates, localizedPath } from "@/lib/site";
import { LOCALES } from "@/lib/locale";

/**
 * Only the pages that carry content (#114, #132). Listing `/challenge` or `/ranking` would
 * point a crawler at the login form and claim they are content; listing `/login` itself
 * would recommend a form for indexing.
 *
 * Every path appears once per language, and each entry names the other one under
 * `alternates.languages`. Without that pairing the two URLs read as duplicates of each
 * other rather than as two versions of one page.
 *
 * ponytail: no `lastModified`. It would have to be invented - these pages change when the
 * code does, and a made-up date is worse than none.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return SITEMAP_PATHS.flatMap((path) =>
    LOCALES.map((locale) => ({
      url: `${SITE_URL}${localizedPath(path, locale)}`,
      alternates: { languages: languageAlternates(path) },
    }))
  );
}
