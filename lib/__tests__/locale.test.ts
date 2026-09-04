import { describe, expect, it } from "vitest";
import {
  DEFAULT_LOCALE,
  GERMAN_SPEAKING_COUNTRIES,
  LOCALES,
  isAppLocale,
  localeFromCountry,
  parseAcceptLanguage,
  resolveLocale,
} from "@/lib/locale";

describe("isAppLocale", () => {
  it("accepts the supported locales and nothing else", () => {
    expect(LOCALES.every(isAppLocale)).toBe(true);
    expect(isAppLocale("fr")).toBe(false);
    expect(isAppLocale("DE")).toBe(false);
    expect(isAppLocale(undefined)).toBe(false);
    expect(isAppLocale(null)).toBe(false);
    expect(isAppLocale(2)).toBe(false);
  });
});

describe("parseAcceptLanguage", () => {
  it("returns null without a usable header", () => {
    expect(parseAcceptLanguage(null)).toBeNull();
    expect(parseAcceptLanguage(undefined)).toBeNull();
    expect(parseAcceptLanguage("")).toBeNull();
    expect(parseAcceptLanguage("fr-FR,it;q=0.8")).toBeNull();
  });

  it("matches a region tag against its base language", () => {
    expect(parseAcceptLanguage("de-AT")).toBe("de");
    expect(parseAcceptLanguage("en-US")).toBe("en");
    expect(parseAcceptLanguage("DE-CH")).toBe("de");
  });

  it("follows the q-values rather than the header order", () => {
    expect(parseAcceptLanguage("en;q=0.5,de;q=0.9")).toBe("de");
    expect(parseAcceptLanguage("de;q=0.3,en;q=0.7")).toBe("en");
  });

  it("keeps the header order when the q-values tie", () => {
    expect(parseAcceptLanguage("en,de")).toBe("en");
    expect(parseAcceptLanguage("de,en")).toBe("de");
    expect(parseAcceptLanguage("en;q=0.8,de;q=0.8")).toBe("en");
  });

  it("skips languages ahead of ours that we do not support", () => {
    expect(parseAcceptLanguage("fr-FR,fr;q=0.9,de;q=0.8")).toBe("de");
  });

  it("treats q=0 as a rejection, not a weak preference", () => {
    expect(parseAcceptLanguage("de;q=0,en;q=0.1")).toBe("en");
    expect(parseAcceptLanguage("de;q=0")).toBeNull();
  });

  it("ignores the wildcard, which names no language", () => {
    expect(parseAcceptLanguage("*")).toBeNull();
    expect(parseAcceptLanguage("*;q=1.0,de;q=0.5")).toBe("de");
  });

  it("drops an entry with an unparsable q-value rather than ranking it first", () => {
    // No browser sends this; a proxy or a hand-written header might. Treating the
    // unparsable value as the default q=1 would let garbage outrank a well-formed entry.
    expect(parseAcceptLanguage("de;q=abc,en;q=0.9")).toBe("en");
    expect(parseAcceptLanguage("de;q=abc")).toBeNull();
  });

  it("survives the whitespace real browsers send", () => {
    expect(parseAcceptLanguage(" de-DE , de;q=0.9 , en;q=0.8 ")).toBe("de");
  });
});

describe("localeFromCountry", () => {
  it("maps the German-speaking countries", () => {
    for (const country of GERMAN_SPEAKING_COUNTRIES) {
      expect(localeFromCountry(country)).toBe("de");
    }
    expect(localeFromCountry("de")).toBe("de");
    expect(localeFromCountry(" at ")).toBe("de");
  });

  it("returns null for every other country and for a missing header", () => {
    expect(localeFromCountry("US")).toBeNull();
    expect(localeFromCountry("GB")).toBeNull();
    expect(localeFromCountry(null)).toBeNull();
    expect(localeFromCountry("")).toBeNull();
  });
});

describe("resolveLocale", () => {
  it("prefers the account setting over every request signal", () => {
    expect(
      resolveLocale({
        user: "en",
        cookie: "de",
        acceptLanguage: "de-DE",
        country: "DE",
      })
    ).toBe("en");
  });

  it("prefers the cookie over the request headers", () => {
    expect(resolveLocale({ cookie: "en", acceptLanguage: "de-DE", country: "DE" })).toBe(
      "en"
    );
  });

  it("uses Accept-Language before geography", () => {
    expect(resolveLocale({ acceptLanguage: "en-US", country: "DE" })).toBe("en");
    expect(resolveLocale({ acceptLanguage: "de-DE", country: "US" })).toBe("de");
  });

  it("falls back to geography when no header names a language we have", () => {
    expect(resolveLocale({ acceptLanguage: "fr-FR", country: "AT" })).toBe("de");
    expect(resolveLocale({ country: "CH" })).toBe("de");
  });

  it("falls back to the default locale when nothing is known", () => {
    expect(resolveLocale({})).toBe(DEFAULT_LOCALE);
    expect(resolveLocale({ acceptLanguage: "fr-FR", country: "US" })).toBe(DEFAULT_LOCALE);
  });

  it("ignores values that are not locales instead of trusting them", () => {
    // A hand-edited cookie, or a column read from an older row.
    expect(resolveLocale({ user: "klingon", cookie: "en" })).toBe("en");
    expect(resolveLocale({ cookie: "de-DE", acceptLanguage: "en-US" })).toBe("en");
    expect(resolveLocale({ cookie: "", acceptLanguage: "en-US" })).toBe("en");
  });
});
