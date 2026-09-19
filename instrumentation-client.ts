import * as Sentry from "@sentry/nextjs";
import {
  REPLAY_ON_ERROR_SAMPLE_RATE,
  REPLAY_PRIVACY_OPTIONS,
  REPLAY_SESSION_SAMPLE_RATE,
  sentryBaseOptions,
} from "@/lib/sentry-options";

/**
 * Runs in the browser before the app hydrates. Both variables are spelled out because the
 * client bundle only inlines a `process.env.NEXT_PUBLIC_*` read that it can see literally.
 *
 * Session Replay is on, masked. It replays the page around an error from the recorded DOM
 * changes, so a report like "the editor breaks on my phone" can be looked at instead of
 * reproduced. With `REPLAY_PRIVACY_OPTIONS` the recording carries the layout and the
 * interactions, not the words: the solution in the editor, a profile field and an address
 * in a form are masked in the browser before anything is sent.
 */
Sentry.init({
  ...sentryBaseOptions({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV,
  }),
  integrations: [Sentry.replayIntegration({ ...REPLAY_PRIVACY_OPTIONS })],
  replaysSessionSampleRate: REPLAY_SESSION_SAMPLE_RATE,
  replaysOnErrorSampleRate: REPLAY_ON_ERROR_SAMPLE_RATE,
});

// Gives each client-side navigation its own trace instead of one endless page load.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
