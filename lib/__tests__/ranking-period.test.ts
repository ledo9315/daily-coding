import { describe, it, expect } from "vitest";
import {
  startOfUtcDay,
  startOfUtcWeek,
  startOfUtcMonth,
  getPeriodDateForRanking,
} from "@/lib/server/ranking-period";

describe("ranking-period", () => {
  it("startOfUtcDay normalizes to UTC midnight", () => {
    const d = new Date("2026-04-06T14:35:22.123Z");
    expect(startOfUtcDay(d).toISOString()).toBe("2026-04-06T00:00:00.000Z");
  });

  it("startOfUtcWeek is Monday of the same ISO week (UTC)", () => {
    // 2026-04-08 is a Wednesday
    const wed = new Date("2026-04-08T12:00:00.000Z");
    expect(startOfUtcWeek(wed).toISOString()).toBe("2026-04-06T00:00:00.000Z");
  });

  it("startOfUtcWeek: Sunday belongs to the week that started the previous Monday", () => {
    const sun = new Date("2026-04-12T12:00:00.000Z");
    expect(startOfUtcWeek(sun).toISOString()).toBe("2026-04-06T00:00:00.000Z");
  });

  it("startOfUtcMonth is the first day of the month (UTC)", () => {
    const d = new Date("2026-04-17T08:00:00.000Z");
    expect(startOfUtcMonth(d).toISOString()).toBe("2026-04-01T00:00:00.000Z");
  });

  it("getPeriodDateForRanking maps today/week/month", () => {
    const now = new Date("2026-04-08T15:00:00.000Z");
    expect(getPeriodDateForRanking("today", now).toISOString()).toBe(
      "2026-04-08T00:00:00.000Z"
    );
    expect(getPeriodDateForRanking("week", now).toISOString()).toBe(
      "2026-04-06T00:00:00.000Z"
    );
    expect(getPeriodDateForRanking("month", now).toISOString()).toBe(
      "2026-04-01T00:00:00.000Z"
    );
  });
});
