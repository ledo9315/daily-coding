import type { MetadataRoute } from "next";
import { SITE_URL, SITEMAP_PATHS } from "@/lib/site";

/**
 * Only the pages that carry content (#114, #132). Listing `/challenge` or `/ranking` would
 * point a crawler at the login form and claim they are content; listing `/login` itself
 * would recommend a form for indexing.
 *
 * ponytail: no `lastModified`. It would have to be invented — these pages change when the
 * code does, and a made-up date is worse than none.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return SITEMAP_PATHS.map((path) => ({ url: `${SITE_URL}${path}` }));
}
