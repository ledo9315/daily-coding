import { describe, it, expect } from "vitest";
import { getMsUntilNextUtcMidnight } from "@/lib/utc-midnight";

describe("getMsUntilNextUtcMidnight", () => {
  it("returns time until next 00:00 UTC", () => {
    const now = new Date("2026-04-06T15:30:00.000Z");
    const ms = getMsUntilNextUtcMidnight(now);
    const next = new Date(now.getTime() + ms);
    expect(next.getUTCHours()).toBe(0);
    expect(next.getUTCMinutes()).toBe(0);
    expect(next.getUTCSeconds()).toBe(0);
    expect(next.getUTCDate()).toBe(7);
  });

  it("one second before UTC midnight returns 1000 ms", () => {
    const now = new Date("2026-04-06T23:59:59.000Z");
    expect(getMsUntilNextUtcMidnight(now)).toBe(1000);
  });
});
