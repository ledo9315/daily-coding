import { describe, expect, it, vi } from "vitest";
import {
  ACHIEVEMENT_DEFS,
  seedAchievementDefs,
  seedAchievementTranslations,
} from "@/lib/server/achievement-defs";
import { resolveAchievementIcon } from "@/components/achievement-badge";

type AchievementTranslationUpsertArgs = {
  where: { achievementId_locale: { achievementId: string; locale: string } };
  update: { title: string; description: string };
  create: { achievementId: string; locale: string; title: string; description: string };
};

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

  it("keeps the language blocks out of the row", async () => {
    const upsert = vi.fn().mockResolvedValue(undefined);

    await seedAchievementDefs({ achievementDef: { upsert } });

    for (const call of upsert.mock.calls) {
      const args = call[0] as { update: object; create: object };
      // `AchievementDef` has no `translations` column; the rows go into their own table.
      expect(args.update).not.toHaveProperty("translations");
      expect(args.create).not.toHaveProperty("translations");
    }
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

describe("seedAchievementTranslations", () => {
  it("writes one English row per definition, keyed by id and locale", async () => {
    const upsert = vi.fn().mockResolvedValue(undefined);

    await seedAchievementTranslations({ achievementTranslation: { upsert } });

    const args = upsert.mock.calls.map((c) => c[0] as AchievementTranslationUpsertArgs);
    expect(args).toHaveLength(ACHIEVEMENT_DEFS.length);
    expect(args.map((a) => a.where.achievementId_locale)).toEqual(
      ACHIEVEMENT_DEFS.map((d) => ({ achievementId: d.id, locale: "en" }))
    );
    // Same reason as `update: def` above: a renamed achievement must reach an existing row.
    expect(args.map((a) => a.update)).toEqual(
      ACHIEVEMENT_DEFS.map((d) => d.translations.en)
    );
  });

  it("writes no German row - the seed mirrors that from the columns", async () => {
    const upsert = vi.fn().mockResolvedValue(undefined);

    await seedAchievementTranslations({ achievementTranslation: { upsert } });

    const locales = upsert.mock.calls.map(
      (c) => (c[0] as AchievementTranslationUpsertArgs).where.achievementId_locale.locale
    );
    expect(new Set(locales)).toEqual(new Set(["en"]));
  });
});

describe("English achievement text", () => {
  it("gives every definition a non-empty English title and description", () => {
    for (const def of ACHIEVEMENT_DEFS) {
      expect(def.translations.en.title.trim(), def.id).not.toBe("");
      expect(def.translations.en.description.trim(), def.id).not.toBe("");
    }
  });

  it("keeps the titles short enough to read as names", () => {
    // „Ohne Stützräder" is „No Training Wheels", not a sentence explaining the unlock:
    // a badge shows the title on one line.
    for (const def of ACHIEVEMENT_DEFS) {
      expect(def.translations.en.title.length, def.id).toBeLessThanOrEqual(24);
      expect(def.translations.en.title, def.id).not.toContain(".");
    }
  });

  it("translates every description instead of repeating the German one", () => {
    for (const def of ACHIEVEMENT_DEFS) {
      expect(def.translations.en.description, def.id).not.toBe(def.description);
    }
  });

  it("names ach-14 after Rust in both languages", () => {
    const rustproof = ACHIEVEMENT_DEFS.find((d) => d.id === "ach-14");
    expect(rustproof?.title).toBe("Rostfrei");
    expect(rustproof?.translations.en.title).toBe("Rustproof");
  });
});
