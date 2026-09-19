import { describe, expect, it } from "vitest";
import {
  FORWARDED_CONSOLE_LEVELS,
  PRODUCTION_TRACES_SAMPLE_RATE,
  filterLog,
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
    expect(options.beforeSendLog).toBe(filterLog);
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

/**
 * The two shapes below are copied from what arrived in Sentry on the first morning, and
 * from a probe against the SDK's own console integration: Node prefixes every process
 * warning with its pid, and the console integration passes the line through unchanged.
 */
describe("filterLog", () => {
  it("drops Node's process warnings, whatever they are called", () => {
    expect(
      filterLog({
        level: "error",
        message:
          "(node:4) Warning: SECURITY WARNING: The SSL modes 'prefer', 'require', and 'verify-ca' are treated as aliases for 'verify-full'.",
      })
    ).toBeNull();
    expect(
      filterLog({
        level: "error",
        message:
          "(node:4) ExperimentalWarning: vm.USE_MAIN_CONTEXT_DEFAULT_LOADER is an experimental feature",
      })
    ).toBeNull();
    expect(
      filterLog({ level: "error", message: "(node:85743) [DEP0205] DeprecationWarning: x" })
    ).toBeNull();
  });

  it("keeps the app's own logs and still scrubs them", () => {
    const kept = filterLog({
      level: "error",
      message: "[daily-reminder] mail to max@example.com failed",
      attributes: { userId: "u_1" },
    });
    expect(kept).toEqual({
      level: "error",
      message: "[daily-reminder] mail to [email] failed",
      attributes: { userId: "u_1" },
    });
  });

  it("keeps a line that only mentions node somewhere", () => {
    const message = "[piston] node runtime missing (node:22 not installed)";
    expect(filterLog({ level: "warn", message })?.message).toBe(message);
  });
});
