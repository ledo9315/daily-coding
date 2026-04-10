import { describe, it, expect } from "vitest";
import {
  normalizeStarterCodes,
  parseCodeLanguage,
  normalizeSupportedLanguages,
  languageFileName,
} from "@/lib/challenge-languages";

describe("parseCodeLanguage", () => {
  const allowed = ["javascript", "typescript", "python", "php"] as const;

  it("defaults to first allowed when missing", () => {
    expect(parseCodeLanguage(undefined, allowed)).toBe("javascript");
    expect(parseCodeLanguage("", allowed)).toBe("javascript");
  });

  it("parses valid ids case-insensitively", () => {
    expect(parseCodeLanguage("Python", allowed)).toBe("python");
    expect(parseCodeLanguage("TYPESCRIPT", allowed)).toBe("typescript");
  });

  it("returns null for unknown language", () => {
    expect(parseCodeLanguage("rust", allowed)).toBeNull();
  });
});

describe("normalizeSupportedLanguages", () => {
  it("defaults to javascript when empty", () => {
    expect(normalizeSupportedLanguages([])).toEqual(["javascript"]);
    expect(normalizeSupportedLanguages(undefined)).toEqual(["javascript"]);
  });

  it("filters to known languages only", () => {
    expect(normalizeSupportedLanguages(["javascript", "rust"])).toEqual([
      "javascript",
    ]);
  });
});

describe("normalizeStarterCodes", () => {
  it("uses legacy starterCode for javascript when map missing", () => {
    const out = normalizeStarterCodes({}, ["javascript"], "function x() {}");
    expect(out.javascript).toBe("function x() {}");
  });

  it("prefers JSON map over legacy starter", () => {
    const out = normalizeStarterCodes(
      { javascript: "const a = 1" },
      ["javascript"],
      "legacy"
    );
    expect(out.javascript).toBe("const a = 1");
  });
});

describe("languageFileName", () => {
  it("maps to file names", () => {
    expect(languageFileName("javascript")).toBe("solution.js");
    expect(languageFileName("python")).toBe("main.py");
    expect(languageFileName("php")).toBe("main.php");
  });
});
