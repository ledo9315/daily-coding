import * as Sentry from "@sentry/nextjs";
import { sentryBaseOptions } from "@/lib/sentry-options";

// Loaded once per Edge runtime by `register` in instrumentation.ts - that is proxy.ts.
Sentry.init(
  sentryBaseOptions({ dsn: process.env.SENTRY_DSN, environment: process.env.VERCEL_ENV })
);
