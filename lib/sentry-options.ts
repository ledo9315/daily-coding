/**
 * The part of the Sentry configuration that is the same in every runtime. Three files
 * call `Sentry.init` - `instrumentation-client.ts`, `sentry.server.config.ts` and
 * `sentry.edge.config.ts` - and each hands over only what differs: its DSN and the
 * environment name it can see.
 *
 * The DSN is a parameter, not read here: the browser bundle only inlines
 * `process.env.NEXT_PUBLIC_*` where it is spelled out literally, so the client file has to
 * name its variable itself. Same for the environment, `VERCEL_ENV` on the server and
 * `NEXT_PUBLIC_VERCEL_ENV` in the browser.
 */

export type SentryEnvironment = "production" | "preview" | "development";

export type SentryInitInput = {
  dsn: string | undefined;
  /** `VERCEL_ENV` or its public twin; anything else counts as development. */
  environment: string | undefined;
};

export type SentryBaseOptions = {
  dsn: string | undefined;
  enabled: boolean;
  environment: SentryEnvironment;
  tracesSampleRate: number;
  sendDefaultPii: false;
};

export function sentryEnvironment(vercelEnv: string | undefined): SentryEnvironment {
  return vercelEnv === "production" || vercelEnv === "preview" ? vercelEnv : "development";
}

/**
 * Traces are sampled, errors are not: every error is one event, but every page view and
 * every `run` request would be a transaction, and production traffic at 100 % would eat
 * the quota for the one signal that matters. Outside production the volume is one
 * developer or one reviewer, so every trace is kept.
 */
export const PRODUCTION_TRACES_SAMPLE_RATE = 0.2;

export function sentryBaseOptions({ dsn, environment }: SentryInitInput): SentryBaseOptions {
  const resolved = sentryEnvironment(environment);
  return {
    dsn,
    /**
     * Without a DSN the SDK has nowhere to send anything and would only log a warning on
     * every start - so it is switched off, which is the state of a local checkout and of
     * the CI build. Setting the variable is what turns monitoring on, nothing in the code.
     */
    enabled: Boolean(dsn),
    environment: resolved,
    tracesSampleRate: resolved === "production" ? PRODUCTION_TRACES_SAMPLE_RATE : 1.0,
    /**
     * Never on: an event would otherwise carry the client's IP address and, on the
     * server, the request headers with the session cookie. The user id of a signed-in
     * account is not set anywhere either; an issue is debugged by its stack trace, not
     * by who hit it.
     */
    sendDefaultPii: false,
  };
}
