import type { MetadataRoute } from "next";
import { SITE_URL, PRIVATE_PATHS } from "@/lib/site";

/**
 * `/robots.txt` used to answer 404 (#114). The exclusions are the paths behind the login: a
 * crawler that follows them only ever reaches the login form, so the trip is wasted.
 *
 * `/login` and `/register` are deliberately *not* excluded — they are legitimate pages, they
 * just have nothing to index, which is why the sitemap leaves them out instead (#132).
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
