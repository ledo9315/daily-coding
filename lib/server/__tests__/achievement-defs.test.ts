import { describe, expect, it, vi } from "vitest";
import {
  ACHIEVEMENT_DEFS,
  seedAchievementDefs,
} from "@/lib/server/achievement-defs";

describe("seedAchievementDefs", () => {
  it("writes the definition on update, not just on create", async () => {
    const upsert = vi.fn().mockResolvedValue(undefined);

    await seedAchievementDefs({ achievementDef: { upsert } });

    expect(upsert).toHaveBeenCalledTimes(ACHIEVEMENT_DEFS.length);
    for (const call of upsert.mock.calls) {
      const args = call[0] as { update: Record<string, unknown> };
      // `update: {}` is what left „Blitzschnell" on every profile after #91 renamed
      // ach-3: the row already existed, so the seed silently wrote nothing (#94).
      expect(args.update).toMatchObject({
        title: expect.any(String),
        description: expect.any(String),
      });
    }
  });

  it("keys the upsert by id so a rerun refreshes instead of duplicating", async () => {
    const upsert = vi.fn().mockResolvedValue(undefined);

    await seedAchievementDefs({ achievementDef: { upsert } });

    const args = upsert.mock.calls.map(
      (c) => c[0] as { where: { id: string }; create: { id: string } }
    );
    expect(args.map((a) => a.where.id)).toEqual(
      ACHIEVEMENT_DEFS.map((d) => d.id)
    );
    expect(args.map((a) => a.create.id)).toEqual(
      ACHIEVEMENT_DEFS.map((d) => d.id)
    );
  });

  it("describes ach-3 as Polyglott", () => {
    const ach3 = ACHIEVEMENT_DEFS.find((d) => d.id === "ach-3");
    expect(ach3?.title).toBe("Polyglott");
    expect(ach3?.description).toContain("drei verschiedenen Sprachen");
  });
});
