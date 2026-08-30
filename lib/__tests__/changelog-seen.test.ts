import { describe, expect, it } from "vitest";
import { hasUnseenChangelog } from "@/lib/changelog-seen";

describe("hasUnseenChangelog", () => {
  it("marks a release the reader has not opened", () => {
    expect(hasUnseenChangelog("v0.1.0", "v0.2.0")).toBe(true);
  });

  it("stays quiet once the newest release was seen", () => {
    expect(hasUnseenChangelog("v0.2.0", "v0.2.0")).toBe(false);
  });

  /** Everything is new to a first-time reader, so the badge would say nothing. */
  it("stays quiet on a first visit", () => {
    expect(hasUnseenChangelog(null, "v0.2.0")).toBe(false);
  });

  it("stays quiet while there is no release at all", () => {
    expect(hasUnseenChangelog("v0.1.0", undefined)).toBe(false);
  });
});
