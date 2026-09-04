import { describe, expect, it } from "vitest";
import { createTranslator } from "next-intl";
import { NOTIFICATION_MESSAGE_KEYS, solutionLink } from "@/lib/notification-view";
import de from "@/messages/de/email.json";
import en from "@/messages/en/email.json";

describe("solutionLink", () => {
  it("points at the code hash, which is what a solution card is keyed by", () => {
    expect(solutionLink("chal-1", "a".repeat(64))).toBe(
      `/challenge/chal-1/loesungen?loesung=${"a".repeat(64)}`
    );
  });
});

/**
 * The bell and the activity mail resolve the same three keys. A key that names nothing
 * renders as its own path, and next-intl does not fail the request over it - so the check
 * is that every kind resolves to a sentence naming actor and challenge, in both languages.
 */
describe("NOTIFICATION_MESSAGE_KEYS", () => {
  const cases = [
    ["comment", "kommentiert", "commented"],
    ["best_practices", "vorbildlich", "exemplary"],
    ["clever", "clever", "clever"],
  ] as const;

  it.each(cases)("names actor, challenge and what happened for %s", (kind, german, english) => {
    for (const [messages, locale, verb] of [
      [de, "de", german],
      [en, "en", english],
    ] as const) {
      const t = createTranslator({ locale, messages: { email: messages }, namespace: "email" });
      const text = t(NOTIFICATION_MESSAGE_KEYS[kind], {
        actor: "Watson",
        challenge: "Two Sum",
      });

      expect(text).toContain("Watson");
      expect(text).toContain("Two Sum");
      expect(text).toContain(verb);
    }
  });
});
