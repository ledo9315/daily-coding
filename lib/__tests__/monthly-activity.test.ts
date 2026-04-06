import { describe, it, expect } from "vitest";
import { buildMonthlyActivityGrid } from "@/lib/monthly-activity";

describe("buildMonthlyActivityGrid", () => {
  const april2026 = new Date("2026-04-06T12:00:00.000Z");

  it("has one cell per UTC month day plus weekday padding", () => {
    const grid = buildMonthlyActivityGrid(april2026, new Set());
    expect(grid.year).toBe(2026);
    expect(grid.month).toBe(4);
    expect(grid.daysInMonth).toBe(30);
    expect(grid.completedDaysInMonthCount).toBe(0);
    expect(grid.currentStreak).toBe(0);
    const dayCells = grid.cells.filter((c) => c.day !== null);
    expect(dayCells).toHaveLength(30);
  });

  it("marks completed and streak days (April 2026, streak ending 6th)", () => {
    const keys = new Set(["2026-04-04", "2026-04-05", "2026-04-06"]);
    const grid = buildMonthlyActivityGrid(april2026, keys);
    expect(grid.currentStreak).toBe(3);
    expect(grid.completedDaysInMonthCount).toBe(3);
    const d6 = grid.cells.find((c) => c.day === 6);
    expect(d6?.completed).toBe(true);
    expect(d6?.inStreak).toBe(true);
    const d3 = grid.cells.find((c) => c.day === 3);
    expect(d3?.completed).toBe(false);
  });

  it("uses Monday-first columns (April 2026 starts Wednesday)", () => {
    const grid = buildMonthlyActivityGrid(april2026, new Set());
    const leading = grid.cells.filter((c) => c.day === null).length;
    expect(leading).toBe(2);
  });
});
