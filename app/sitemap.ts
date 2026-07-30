import type { MetadataRoute } from "next";
import { SITE_URL, PUBLIC_PATHS } from "@/lib/site";

/**
 * Only the pages reachable without an account (#114). Listing `/challenge` or `/ranking`
 * would point a crawler at the login form and claim they are content.
 *
 * ponytail: no `lastModified`. It would have to be invented — these pages change when the
 * code does, and a made-up date is worse than none.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_PATHS.map((path) => ({ url: `${SITE_URL}${path}` }));
}
