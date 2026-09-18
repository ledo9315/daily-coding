import * as Sentry from "@sentry/nextjs";
import { sentryBaseOptions } from "@/lib/sentry-options";

// Loaded once per Edge runtime by `register` in instrumentation.ts - that is proxy.ts.
Sentry.init(
  sentryBaseOptions({
    // Sentry's Vercel integration sets only the public name; the DSN is the same either way.
    dsn: process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.VERCEL_ENV,
  })
);
