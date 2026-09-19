import type { MetadataRoute } from "next";

/**
 * The android-chrome icons have been in `public/` since the favicon set was made, but
 * nothing pointed at them - a manifest is what a browser reads them from, and what an
 * audit checks for. The description is the English tagline: a manifest is not rendered in
 * a request, so it cannot follow the reader's language.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Daily Coding",
    short_name: "Daily Coding",
    description:
      "Solve a new coding challenge every day in the language of your choice and climb the ranking.",
    start_url: "/",
    display: "standalone",
    background_color: "#020912",
    theme_color: "#020912",
    icons: [
      { src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
