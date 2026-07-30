import type { MetadataRoute } from "next";
import { SITE_URL, PUBLIC_PATHS, PRIVATE_PATHS } from "@/lib/site";

/**
 * `/robots.txt` used to answer 404 (#114). Everything except the pages in `PUBLIC_PATHS`
 * sits behind the login, so a crawler that follows those links only ever reaches the login
 * form — the exclusions save it the trip and keep the login URLs out of the index.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [...PRIVATE_PATHS],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

// Re-exported for the test, which asserts the two lists do not drift apart.
export { PUBLIC_PATHS };
