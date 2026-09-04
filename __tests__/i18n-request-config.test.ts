import { describe, expect, it, vi } from "vitest";

const mockLocaleFromRequestScope = vi.fn();
vi.mock("@/lib/server/request-locale", () => ({
  localeFromRequestScope: () => mockLocaleFromRequestScope(),
}));

import { configLocale } from "@/i18n/request";

/**
 * The configuration used to ignore its argument, so `getTranslations({ locale })` in a
 * route handler silently answered in the cookie's language - which is how an English test
 * panel ended up with German labels on `/challenge` (#287).
 */
describe("configLocale", () => {
  it.each(["de", "en"] as const)("takes %s from the caller that named it", async (locale) => {
    mockLocaleFromRequestScope.mockResolvedValue(locale === "de" ? "en" : "de");

    expect(await configLocale(locale)).toBe(locale);
    // The request is never consulted: the caller had already decided.
    expect(mockLocaleFromRequestScope).not.toHaveBeenCalled();
  });

  it.each([
    ["nobody named one", undefined],
    ["the name is not a language of this app", "fr"],
    ["the name is empty", ""],
  ])("falls back to the request when %s", async (_case, requested) => {
    mockLocaleFromRequestScope.mockResolvedValue("de");

    expect(await configLocale(requested)).toBe("de");
    expect(mockLocaleFromRequestScope).toHaveBeenCalled();
  });
});
