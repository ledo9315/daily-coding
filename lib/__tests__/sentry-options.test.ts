import { describe, expect, it } from "vitest";
import {
  PRODUCTION_TRACES_SAMPLE_RATE,
  sentryBaseOptions,
  sentryEnvironment,
} from "@/lib/sentry-options";

describe("sentryEnvironment", () => {
  it("passes production and preview through", () => {
    expect(sentryEnvironment("production")).toBe("production");
    expect(sentryEnvironment("preview")).toBe("preview");
  });

  it("treats everything else as development", () => {
    expect(sentryEnvironment("development")).toBe("development");
    expect(sentryEnvironment(undefined)).toBe("development");
    expect(sentryEnvironment("")).toBe("development");
    expect(sentryEnvironment("staging")).toBe("development");
  });
});

describe("sentryBaseOptions", () => {
  const dsn = "https://key@o1.ingest.sentry.io/1";

  it("is disabled without a DSN, so a local checkout and CI send nothing", () => {
    const options = sentryBaseOptions({ dsn: undefined, environment: "production" });
    expect(options.enabled).toBe(false);
    expect(options.dsn).toBeUndefined();
  });

  it("is enabled as soon as a DSN is set", () => {
    expect(sentryBaseOptions({ dsn, environment: "preview" }).enabled).toBe(true);
  });

  it("samples traces in production and keeps every trace elsewhere", () => {
    expect(sentryBaseOptions({ dsn, environment: "production" }).tracesSampleRate).toBe(
      PRODUCTION_TRACES_SAMPLE_RATE
    );
    expect(sentryBaseOptions({ dsn, environment: "preview" }).tracesSampleRate).toBe(1.0);
    expect(sentryBaseOptions({ dsn, environment: undefined }).tracesSampleRate).toBe(1.0);
  });

  it("never sends personal data by default", () => {
    expect(sentryBaseOptions({ dsn, environment: "production" }).sendDefaultPii).toBe(false);
  });
});
