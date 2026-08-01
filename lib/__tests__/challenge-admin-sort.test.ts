import { describe, it, expect } from "vitest";
import { buildAdminOrder } from "@/lib/server/challenge-admin-sort";

const row = (id: string, position: number, isActive = true) => ({ id, position, isActive });

/**
 * The table used to sort by date in three tiers and needed a paragraph above it to explain the
 * result. It now shows the ring: today first, then the days that follow, inactive last.
 */
describe("buildAdminOrder", () => {
  const rows = [row("c", 2), row("a", 0), row("d", 3), row("b", 1)];

  it("puts the live challenge on top and keeps the ring order behind it", () => {
    const { active } = buildAdminOrder(rows, "b");
    expect(active.map((c) => c.id)).toEqual(["b", "c", "d", "a"]);
  });

  it("wraps, so what ran yesterday sits at the bottom", () => {
    const { active } = buildAdminOrder(rows, "d");
    expect(active.map((c) => c.id)).toEqual(["d", "a", "b", "c"]);
  });

  it("falls back to plain ring order when nothing is live", () => {
    // Empty pointer, or a pointer at a challenge that was just deactivated.
    expect(buildAdminOrder(rows, null).active.map((c) => c.id)).toEqual(["a", "b", "c", "d"]);
    expect(buildAdminOrder(rows, "weg").active.map((c) => c.id)).toEqual(["a", "b", "c", "d"]);
  });

  it("separates inactive challenges instead of mixing them into the ring", () => {
    const mixed = [row("a", 0), row("x", 1, false), row("b", 2)];
    const { active, inactive } = buildAdminOrder(mixed, "b");
    expect(active.map((c) => c.id)).toEqual(["b", "a"]);
    expect(inactive.map((c) => c.id)).toEqual(["x"]);
  });

  it("breaks ties by id, so equal positions cannot shuffle between requests", () => {
    const tied = [row("z", 1), row("a", 1), row("m", 0)];
    expect(buildAdminOrder(tied, null).active.map((c) => c.id)).toEqual(["m", "a", "z"]);
  });
});
