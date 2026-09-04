import { describe, expect, it } from "vitest";
import { createTranslator } from "next-intl";
import de from "@/messages/de/community.json";
import en from "@/messages/en/community.json";

function keyPaths(value: unknown, prefix = ""): string[] {
  if (typeof value !== "object" || value === null) return [prefix];
  return Object.entries(value).flatMap(([key, child]) =>
    keyPaths(child, prefix ? `${prefix}.${key}` : key)
  );
}

/**
 * A key present in one file and missing in the other does not fail loudly - next-intl
 * renders the key path, so the reader gets `comments.submit` where a button label belongs.
 */
describe("the community namespace", () => {
  it("has the same keys in both languages", () => {
    expect(keyPaths(en).sort()).toEqual(keyPaths(de).sort());
  });

  it("leaves no value empty", () => {
    for (const messages of [de, en]) {
      const t = createTranslator({ locale: "de", messages: { community: messages } });
      for (const path of keyPaths(messages)) {
        expect(t.raw(`community.${path}` as Parameters<typeof t.raw>[0])).not.toBe("");
      }
    }
  });

  it("counts characters with the plural the language needs", () => {
    const t = createTranslator({
      locale: "en",
      messages: { community: en },
      namespace: "community",
    });

    expect(t("comments.remaining", { count: 1 })).toBe("1 character left");
    expect(t("comments.remaining", { count: 12 })).toBe("12 characters left");
  });
});
