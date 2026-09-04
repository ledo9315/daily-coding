import { describe, expect, it } from "vitest";
import { createTranslator } from "next-intl";
import de from "@/messages/de/api.json";
import en from "@/messages/en/api.json";

function keyPaths(value: unknown, prefix = ""): string[] {
  if (typeof value !== "object" || value === null) return [prefix];
  return Object.entries(value).flatMap(([key, child]) =>
    keyPaths(child, prefix ? `${prefix}.${key}` : key)
  );
}

/**
 * A key present in one file and missing in the other does not fail loudly - next-intl
 * renders the key path, so a failed request answers with `user.notFound` where a sentence
 * belongs, and the client shows that string in a toast.
 */
describe("the api namespace", () => {
  it("has the same keys in both languages", () => {
    expect(keyPaths(en).sort()).toEqual(keyPaths(de).sort());
  });

  it("leaves no value empty", () => {
    for (const messages of [de, en]) {
      const t = createTranslator({ locale: "de", messages: { api: messages } });
      for (const path of keyPaths(messages)) {
        expect(t.raw(`api.${path}` as Parameters<typeof t.raw>[0])).not.toBe("");
      }
    }
  });

  it("counts elapsed time with the plural the language needs", () => {
    const t = createTranslator({ locale: "en", messages: { api: en }, namespace: "api" });

    expect(t("feed.hoursAgo", { count: 1 })).toBe("1 hour ago");
    expect(t("feed.hoursAgo", { count: 3 })).toBe("3 hours ago");
    expect(t("feed.daysAgo", { count: 1 })).toBe("1 day ago");
    expect(t("feed.minutesAgo", { count: 1 })).toBe("1 minute ago");
  });

  /** Read "vor 1 Minuten" for a while, because the German text was a plain placeholder. */
  it("counts elapsed time in German with a plural too", () => {
    const t = createTranslator({ locale: "de", messages: { api: de }, namespace: "api" });

    expect(t("feed.minutesAgo", { count: 1 })).toBe("vor 1 Minute");
    expect(t("feed.minutesAgo", { count: 10 })).toBe("vor 10 Minuten");
    expect(t("feed.daysAgo", { count: 1 })).toBe("vor 1 Tag");
    expect(t("feed.daysAgo", { count: 2 })).toBe("vor 2 Tagen");
  });

  it("keeps the deletion phrase out of the sentence around it", () => {
    // The phrase itself lives in the `profile` namespace, one wording per language; this
    // sentence only interpolates whichever one the caller was shown.
    const german = createTranslator({ locale: "de", messages: { api: de }, namespace: "api" });
    const english = createTranslator({ locale: "en", messages: { api: en }, namespace: "api" });

    expect(german("user.deleteConfirmRequired", { phrase: "KONTO LÖSCHEN" })).toBe(
      "Bitte bestätige mit KONTO LÖSCHEN."
    );
    expect(english("user.deleteConfirmRequired", { phrase: "DELETE ACCOUNT" })).toBe(
      "Please confirm with DELETE ACCOUNT."
    );
  });
});
