import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const ROOT = resolve(process.cwd());
const DIRS = ["app", "components", "lib", "prisma"];

/**
 * German words spelled with an ASCII digraph instead of the umlaut. Curated rather than a
 * pattern: a regex over `ae|oe|ue` trips over English identifiers (`value`, `queue`, `used`)
 * and over proper nouns, which is why the project has no lint rule for this.
 *
 * Only stems that exist in no English word, so a hit is always the real thing.
 */
const MISSPELLINGS = [
  "aender",
  "Aender",
  "ueber",
  "Ueber",
  "fuer",
  "koenn",
  "muess",
  "loesch",
  "Loesch",
  "geloescht",
  "oeffn",
  "waehl",
  "zurueck",
  "naechst",
  "moegl",
  "gueltig",
  "bestaetig",
  "Bestaetig",
  "groess",
  "Groess",
  "taeglich",
  "spaeter",
];

function sourceFiles(dir: string, found: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "generated" || entry.name === "node_modules") continue;
      sourceFiles(path, found);
    } else if (/\.tsx?$/.test(entry.name) && !path.includes("umlaut-spelling")) {
      found.push(path);
    }
  }
  return found;
}

const files = DIRS.flatMap((dir) => sourceFiles(resolve(ROOT, dir)));

/**
 * User-facing text is German (see CLAUDE.md). "Passwort aendern" in a card title is a typo
 * that reaches the user, and it had spread across ten strings before anyone noticed.
 */
describe("German spelling", () => {
  it("finds the files to check", () => {
    expect(files.length).toBeGreaterThan(100);
  });

  it("writes umlauts as umlauts, not as ae/oe/ue", () => {
    // A Set, because one line can match two stems ("loesch" and "geloescht") and would
    // otherwise be reported twice.
    const hits = new Set<string>();
    for (const file of files) {
      readFileSync(file, "utf8")
        .split("\n")
        .forEach((line, index) => {
          if (MISSPELLINGS.some((word) => line.includes(word))) {
            hits.add(`${relative(ROOT, file)}:${index + 1}  ${line.trim()}`);
          }
        });
    }
    expect([...hits], `Umlaut-Schreibweise:\n${[...hits].join("\n")}`).toEqual([]);
  });
});
