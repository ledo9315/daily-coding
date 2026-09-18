import * as Sentry from "@sentry/nextjs";
import { sentryBaseOptions } from "@/lib/sentry-options";

/**
 * Runs in the browser before the app hydrates. Both variables are spelled out because the
 * client bundle only inlines a `process.env.NEXT_PUBLIC_*` read that it can see literally.
 *
 * No session replay: it records the page as the user sees it, which includes the code in
 * the editor and the profile settings, and nothing in a stack trace needs that footage.
 */
Sentry.init(
  sentryBaseOptions({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV,
  })
);

// Gives each client-side navigation its own trace instead of one endless page load.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
