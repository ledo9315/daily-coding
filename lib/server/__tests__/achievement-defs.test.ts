import { describe, expect, it, vi } from "vitest";
import {
  ACHIEVEMENT_DEFS,
  seedAchievementDefs,
} from "@/lib/server/achievement-defs";
import { resolveAchievementIcon } from "@/components/achievement-badge";

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

describe("ACHIEVEMENT_DEFS", () => {
  it("has a unique id per entry", () => {
    const ids = ACHIEVEMENT_DEFS.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("numbers the ids ach-1..ach-N consecutively in array order", () => {
    // `orderBy id` would sort "ach-10" before "ach-2", so the views rely on the
    // array order - which only works if the numbering has no gaps or duplicates.
    const expected = ACHIEVEMENT_DEFS.map((_, i) => `ach-${i + 1}`);
    expect(ACHIEVEMENT_DEFS.map((d) => d.id)).toEqual(expected);
  });

  it("gives every entry a non-empty title, description, iconKey and a known rarity", () => {
    const rarities = ["common", "rare", "epic", "legendary"];
    for (const def of ACHIEVEMENT_DEFS) {
      expect(def.title.trim(), def.id).not.toBe("");
      expect(def.description.trim(), def.id).not.toBe("");
      expect(def.iconKey.trim(), def.id).not.toBe("");
      expect(rarities, def.id).toContain(def.rarity);
    }
  });

  it("uses only iconKeys that resolve to a registered icon", () => {
    // Unknown keys fall back to Bookmark, which no definition uses on purpose -
    // so equality with the fallback means the key is missing from the icon map.
    const fallback = resolveAchievementIcon("__missing__");
    for (const def of ACHIEVEMENT_DEFS) {
      expect(resolveAchievementIcon(def.iconKey), def.id).not.toBe(fallback);
    }
  });

  it("contains the 23 definitions with the new ones after ach-6", () => {
    expect(ACHIEVEMENT_DEFS).toHaveLength(23);
    expect(ACHIEVEMENT_DEFS[6]).toMatchObject({ id: "ach-7", title: "Dranbleiber" });
    expect(ACHIEVEMENT_DEFS[22]).toMatchObject({ id: "ach-23", title: "Minimalist" });
  });
});
