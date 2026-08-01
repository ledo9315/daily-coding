import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  CODE_LANGUAGES,
  LANGUAGE_LIST,
  LANGUAGES,
  normalizeStarterCodes,
  parseCodeLanguage,
  normalizeSupportedLanguages,
  languageFileName,
} from "@/lib/challenge-languages";
import { buildWrappedProgram } from "@/lib/server/io-harness";

/**
 * The registry is only worth having if it cannot be half-filled.
 *
 * Adding a language used to mean editing ten files, and two of them were caught solely because
 * an exhaustive Record refused to compile. These checks cover what a type cannot: that the
 * strings are actually filled in, that a harness exists, and that the enum agrees.
 */
describe("Sprach-Registry", () => {
  it("hat für jede ID einen vollständigen Eintrag", () => {
    for (const id of CODE_LANGUAGES) {
      const spec = LANGUAGES[id];
      expect(spec.id, id).toBe(id);
      for (const field of ["label", "monacoId", "editorFile", "pistonFile", "pistonPackage", "starter"] as const) {
        expect(spec[field].length, `${id}.${field}`).toBeGreaterThan(0);
      }
    }
  });

  it("hat für jede Sprache einen Harness", () => {
    for (const spec of LANGUAGE_LIST) {
      // The typed harnesses bake the test input in, so they need one to build anything at all.
      const src = buildWrappedProgram(spec.id, "solve", "solve", "[1,2]");
      expect(src.length, spec.id).toBeGreaterThan(0);
      expect(src, spec.id).toContain("solve");
    }
  });

  it("erkennt bei jeder im Run-Schritt kompilierten Sprache den Compilerfehler", () => {
    // Without a pattern the compiler's message is shown as the program's output and the same
    // broken program runs once per test case — the bug behind #161.
    for (const spec of LANGUAGE_LIST.filter((l) => l.compiledInRunStep)) {
      expect(spec.compileFailure, spec.id).toBeInstanceOf(RegExp);
    }
  });

  it("stimmt mit dem Prisma-Enum überein", () => {
    const schema = readFileSync(resolve(process.cwd(), "prisma", "schema.prisma"), "utf8");
    const block = /enum CodeLanguage \{([^}]*)\}/u.exec(schema);
    const values = block![1]!.split("\n").map((l) => l.trim()).filter(Boolean);
    // Order matters too: it decides the dropdown, and the seed's default set is positional.
    expect(values).toEqual([...CODE_LANGUAGES]);
  });
});

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
    expect(parseCodeLanguage("cobol", allowed)).toBeNull();
  });
});

describe("normalizeSupportedLanguages", () => {
  it("defaults to javascript when empty", () => {
    expect(normalizeSupportedLanguages([])).toEqual(["javascript"]);
    expect(normalizeSupportedLanguages(undefined)).toEqual(["javascript"]);
  });

  it("filters to known languages only", () => {
    expect(normalizeSupportedLanguages(["javascript", "cobol"])).toEqual([
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
