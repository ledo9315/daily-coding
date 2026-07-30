import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFindFirst = vi.fn();
const mockFindMany = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    challenge: {
      findFirst: (...args: unknown[]) => mockFindFirst(...args),
      findMany: (...args: unknown[]) => mockFindMany(...args),
    },
    submission: { findFirst: vi.fn() },
  },
}));

import {
  rotationIndexForUtcDay,
  findDailyChallengeForApp,
} from "@/lib/server/challenge-day";

/**
 * #67: Ohne Rotation lieferte die App dauerhaft dieselbe Aufgabe, weil der Seed
 * nur Daten in der Vergangenheit setzt und die Rückfallebene immer die neueste
 * aktive Challenge nahm.
 */
describe("rotationIndexForUtcDay", () => {
  const poolSize = 15;

  it("liefert für denselben Tag immer denselben Index", () => {
    const a = rotationIndexForUtcDay(new Date("2026-07-30T00:00:01.000Z"), poolSize);
    const b = rotationIndexForUtcDay(new Date("2026-07-30T23:59:59.000Z"), poolSize);
    expect(a).toBe(b);
  });

  it("liefert für aufeinanderfolgende Tage verschiedene Indizes", () => {
    const d30 = rotationIndexForUtcDay(new Date("2026-07-30T12:00:00.000Z"), poolSize);
    const d31 = rotationIndexForUtcDay(new Date("2026-07-31T12:00:00.000Z"), poolSize);
    expect(d30).not.toBe(d31);
  });

  it("bleibt innerhalb des Pools und läuft zyklisch um", () => {
    for (let day = 0; day < 40; day++) {
      const date = new Date(Date.UTC(2026, 6, 30) + day * 86_400_000);
      const index = rotationIndexForUtcDay(date, poolSize);
      expect(index).toBeGreaterThanOrEqual(0);
      expect(index).toBeLessThan(poolSize);
    }
    const start = rotationIndexForUtcDay(new Date("2026-07-30T00:00:00.000Z"), poolSize);
    const afterCycle = rotationIndexForUtcDay(
      new Date(Date.UTC(2026, 6, 30) + poolSize * 86_400_000),
      poolSize,
    );
    expect(afterCycle).toBe(start);
  });

  it("liefert 0 bei leerem Pool statt NaN", () => {
    expect(rotationIndexForUtcDay(new Date("2026-07-30T00:00:00.000Z"), 0)).toBe(0);
  });
});

describe("findDailyChallengeForApp", () => {
  const pool = Array.from({ length: 15 }, (_, i) => ({
    id: `ch-${i}`,
    title: `Aufgabe ${i}`,
    isActive: true,
  }));

  beforeEach(() => {
    vi.clearAllMocks();
    mockFindFirst.mockResolvedValue(null);
    mockFindMany.mockResolvedValue(pool);
  });

  it("bevorzugt eine explizit für heute geplante Challenge", async () => {
    mockFindFirst.mockResolvedValueOnce({ id: "geplant", title: "Geplant" });
    const found = await findDailyChallengeForApp();
    expect(found?.id).toBe("geplant");
    // Kein Pool-Abruf, wenn manuell geplant wurde.
    expect(mockFindMany).not.toHaveBeenCalled();
  });

  it("rotiert deterministisch, wenn für heute nichts geplant ist", async () => {
    const first = await findDailyChallengeForApp();
    const second = await findDailyChallengeForApp();
    expect(first?.id).toBe(second?.id);
    expect(pool.map((c) => c.id)).toContain(first?.id);
  });

  it("holt den Pool in stabiler Reihenfolge", async () => {
    await findDailyChallengeForApp();
    expect(mockFindMany.mock.calls[0][0].orderBy).toEqual([
      { date: "asc" },
      { id: "asc" },
    ]);
    expect(mockFindMany.mock.calls[0][0].where).toEqual({ isActive: true });
  });

  it("liefert null bei leerem Pool statt zu werfen", async () => {
    mockFindMany.mockResolvedValueOnce([]);
    expect(await findDailyChallengeForApp()).toBeNull();
  });
});
