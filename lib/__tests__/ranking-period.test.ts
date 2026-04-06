import { describe, it, expect } from "vitest";
import {
  startOfUtcDay,
  startOfUtcWeek,
  startOfUtcMonth,
  getPeriodDateForRanking,
} from "@/lib/server/ranking-period";

describe("ranking-period", () => {
  it("startOfUtcDay normalisiert auf UTC-Mitternacht", () => {
    const d = new Date("2026-04-06T14:35:22.123Z");
    expect(startOfUtcDay(d).toISOString()).toBe("2026-04-06T00:00:00.000Z");
  });

  it("startOfUtcWeek ist Montag derselben ISO-Woche (UTC)", () => {
    // 2026-04-08 ist Mittwoch
    const wed = new Date("2026-04-08T12:00:00.000Z");
    expect(startOfUtcWeek(wed).toISOString()).toBe("2026-04-06T00:00:00.000Z");
  });

  it("startOfUtcWeek: Sonntag gehört zur Woche, die am Vormontag startet", () => {
    const sun = new Date("2026-04-12T12:00:00.000Z");
    expect(startOfUtcWeek(sun).toISOString()).toBe("2026-04-06T00:00:00.000Z");
  });

  it("startOfUtcMonth ist der erste des Monats UTC", () => {
    const d = new Date("2026-04-17T08:00:00.000Z");
    expect(startOfUtcMonth(d).toISOString()).toBe("2026-04-01T00:00:00.000Z");
  });

  it("getPeriodDateForRanking mapped today/week/month", () => {
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
