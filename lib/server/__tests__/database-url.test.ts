import { describe, expect, it } from "vitest";
import { databaseUrl } from "@/lib/server/database-url";

describe("databaseUrl", () => {
  it("prefers APP_DATABASE_URL over DATABASE_URL", () => {
    expect(databaseUrl({ APP_DATABASE_URL: "postgres://own", DATABASE_URL: "postgres://neon" })).toBe(
      "postgres://own"
    );
  });

  it("falls back to DATABASE_URL when APP_DATABASE_URL is unset or blank", () => {
    expect(databaseUrl({ DATABASE_URL: "postgres://neon" })).toBe("postgres://neon");
    expect(databaseUrl({ APP_DATABASE_URL: "  ", DATABASE_URL: "postgres://neon" })).toBe(
      "postgres://neon"
    );
  });

  it("returns undefined when neither is set", () => {
    expect(databaseUrl({})).toBeUndefined();
  });
});
