import { describe, expect, it } from "vitest";
import nextConfig from "@/next.config.mjs";

describe("deployment security", () => {
  it("fails builds on TypeScript errors", () => {
    expect(nextConfig.typescript?.ignoreBuildErrors).not.toBe(true);
  });

  it("sets browser hardening headers on every route", async () => {
    const rules = await nextConfig.headers?.();
    const headers = new Map(rules?.[0]?.headers.map((header) => [header.key, header.value]));

    expect(headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(headers.get("X-Frame-Options")).toBe("DENY");
    expect(headers.get("Content-Security-Policy")).toContain("frame-ancestors 'none'");
    expect(headers.get("Strict-Transport-Security")).toContain("includeSubDomains");
  });
});
