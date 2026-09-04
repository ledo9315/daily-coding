import { describe, expect, it } from "vitest";
import { CHANGELOG } from "@/lib/changelog";
import { LOCALES } from "@/lib/locale";

/**
 * The list is ordered by hand, so a new entry appended in the wrong place is the one
 * mistake worth catching - the page renders the array as it stands.
 */
describe("changelog", () => {
  it("lists the releases newest first", () => {
    const dates = CHANGELOG.map((entry) => entry.date);
    expect(dates).toEqual([...dates].sort().reverse());
  });

  it("uses each version exactly once", () => {
    const versions = CHANGELOG.map((entry) => entry.version);
    expect(new Set(versions).size).toBe(versions.length);
  });

  it("gives every entry a parseable date and at least one change", () => {
    for (const entry of CHANGELOG) {
      expect(entry.date, entry.version).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(Number.isNaN(new Date(entry.date).getTime()), entry.version).toBe(false);
      for (const locale of LOCALES) {
        expect(entry.changes[locale].length, `${entry.version} ${locale}`).toBeGreaterThan(
          0
        );
      }
    }
  });

  /**
   * A release described in one language and not the other reads as a shorter release,
   * not as a missing translation - nothing on the page says a line is absent.
   */
  it("describes every release equally in both languages", () => {
    for (const entry of CHANGELOG) {
      const counts = LOCALES.map((locale) => entry.changes[locale].length);
      expect(new Set(counts).size, entry.version).toBe(1);
    }
  });
});
