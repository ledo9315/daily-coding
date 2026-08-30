import { describe, expect, it } from "vitest";
import { notificationText, solutionLink } from "@/lib/notification-view";

describe("solutionLink", () => {
  it("points at the code hash, which is what a solution card is keyed by", () => {
    expect(solutionLink("chal-1", "a".repeat(64))).toBe(
      `/challenge/chal-1/loesungen?loesung=${"a".repeat(64)}`
    );
  });
});

describe("notificationText", () => {
  it.each([
    ["comment", "kommentiert"],
    ["best_practices", "vorbildlich"],
    ["clever", "clever"],
  ] as const)("names actor, challenge and what happened for %s", (kind, verb) => {
    const text = notificationText(kind, "Watson", "Two Sum");
    expect(text).toContain("Watson");
    expect(text).toContain("Two Sum");
    expect(text).toContain(verb);
  });
});
