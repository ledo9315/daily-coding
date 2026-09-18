import * as Sentry from "@sentry/nextjs";

/**
 * Next.js calls this once per server runtime before any request is handled. The two
 * config files stay separate imports rather than one shared call because the Node.js
 * and Edge builds of the SDK are different packages under the same name, and the
 * bundler has to see which one a runtime pulls in.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

/**
 * Every uncaught error in a server component, route handler or server action passes
 * through here, with the route and the render phase attached. Without it a failed render
 * ends in Vercel's function log and nowhere else.
 */
export const onRequestError = Sentry.captureRequestError;
