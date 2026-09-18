import process from "node:process";
import createNextIntlPlugin from "next-intl/plugin";
import { withSentryConfig } from "@sentry/nextjs/config";

// Points at ./i18n/request.ts, which resolves the locale and loads the message namespaces.
const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: "/dashboard", destination: "/", permanent: true },
      { source: "/dashboard/:path*", destination: "/", permanent: true },
      // The landing moved to `/` (#130). Kept because the URL is in the sitemap Google
      // has already fetched, and in whatever links were shared before the move.
      { source: "/landing", destination: "/", permanent: true },
      /**
       * The solutions page was the last German route name. Kept because activity mails
       * carrying the old address are already sent - the path sits behind the login and in
       * robots.txt, so no search engine ever had it, but a reader following a mail from
       * last week has.
       */
      {
        source: "/challenge/:id/loesungen",
        destination: "/challenge/:id/solutions",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Content-Security-Policy",
            value: "base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
  // Prisma & DB drivers must stay in Node, not Edge / Turbopack client graph
  serverExternalPackages: [
    "@prisma/client",
    "prisma",
    "@prisma/adapter-pg",
    "pg",
    "@prisma/adapter-pg",
  ],
};

/**
 * The build-time half of Sentry: source-map upload after `next build` and the tunnel
 * route. The runtime half lives in instrumentation.ts and the three `sentry.*.config`
 * files, with `lib/sentry-options.ts` holding what they share.
 *
 * Org, project and token come from the Vercel Marketplace integration as environment
 * variables. Without the token - a local build, the CI build - the upload is skipped
 * *and* no browser source maps are generated: Sentry would otherwise switch them on for
 * the upload, and a build that then does not upload leaves them on the CDN for anyone.
 */
const sentryOptions = {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  telemetry: false,
  /**
   * A fixed path, not `true`: under Turbopack the proxy matcher has to exclude it by
   * name, and a generated path cannot be excluded. Events go to our own origin and from
   * there to Sentry, so a content blocker that knows the ingest domain does not swallow
   * them. Not an English word a visitor would look for; `/monitoring` is what Sentry's
   * own examples use.
   */
  tunnelRoute: "/monitoring",
  widenClientFileUpload: true,
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
    deleteSourcemapsAfterUpload: true,
  },
};

export default withSentryConfig(withNextIntl(nextConfig), sentryOptions);
