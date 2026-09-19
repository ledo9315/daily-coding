import { describe, expect, it } from "vitest";
import {
  FORWARDED_CONSOLE_LEVELS,
  PRODUCTION_TRACES_SAMPLE_RATE,
  scrubLog,
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

describe("logs", () => {
  const dsn = "https://key@o1.ingest.sentry.io/1";

  it("opens the log channel and installs the scrubber", () => {
    const options = sentryBaseOptions({ dsn, environment: "production" });
    expect(options.enableLogs).toBe(true);
    expect(options.beforeSendLog).toBe(scrubLog);
  });

  it("forwards only warn and error from the console", () => {
    expect(FORWARDED_CONSOLE_LEVELS).toEqual(["warn", "error"]);
  });
});

describe("scrubLog", () => {
  it("replaces e-mail addresses in the message", () => {
    const log = scrubLog({ level: "error", message: "could not deliver to max@example.com" });
    expect(log.message).toBe("could not deliver to [email]");
  });

  it("replaces e-mail addresses anywhere in the attributes, nested included", () => {
    const log = scrubLog({
      level: "warn",
      message: "mail failed",
      attributes: {
        userId: "u_1",
        error: "Resend: erika.mustermann+tag@mail.example.org rejected",
        nested: { list: ["ok", "x@y.de"] },
      },
    });
    expect(log.attributes).toEqual({
      userId: "u_1",
      error: "Resend: [email] rejected",
      nested: { list: ["ok", "[email]"] },
    });
  });

  it("leaves a log without addresses untouched", () => {
    const input = { level: "info", message: "daily reminder run", attributes: { sent: 3, failed: 0 } };
    expect(scrubLog(input)).toEqual(input);
  });
});
