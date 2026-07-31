import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { LandingCodeDemo, terminalTabs } from "@/components/landing/code-demo";
import { CODE_LANGUAGES, languageFileName } from "@/lib/challenge-languages";

const html = renderToStaticMarkup(<LandingCodeDemo />);

/** All lines of one tab as a single string, whitespace collapsed. */
const bodyOf = (label: string) =>
  terminalTabs
    .find((tab) => tab.label === label)!
    .lines.map((line) => line.text)
    .join("\n");

/**
 * The terminal on the landing was a fixed script that typed one command and printed five
 * passing tests. It now has one tab per supported language.
 *
 * The rendered markup carries only the tab labels and the command — the animation starts at
 * zero visible lines — so the output itself is checked as data.
 */
describe("LandingCodeDemo", () => {
  it("offers a tab for every language the app accepts", () => {
    // Derived from CODE_LANGUAGES, so adding a language to the app fails this until the
    // landing stops claiming a smaller set.
    for (const language of CODE_LANGUAGES) {
      expect(html).toContain(`>${language}<`);
      expect(terminalTabs.map((tab) => tab.label)).toContain(language);
    }
  });

  it("keeps the headline and the claim next to it", () => {
    expect(html).toContain("OB ES PASST");
    // The old copy promised "nutze deine vorhandenen Tools" — there is no CLI and no API.
    // What the section may claim is that run and submit execute the same cases:
    // `runPistonIoCases` is not even passed the mode.
    expect(html).toContain("Dieselben Testfälle");
    expect(html).not.toContain("vorhandenen Tools");
  });

  it("shows a body that actually differs per language", () => {
    // The four tabs used to print near-identical test logs; only the text after `--lang=`
    // changed, so switching them told a visitor nothing.
    const bodies = CODE_LANGUAGES.map(bodyOf);
    expect(new Set(bodies).size).toBe(CODE_LANGUAGES.length);
    expect(bodyOf("python")).toContain("def binary_search(data):");
    expect(bodyOf("javascript")).toContain("function binarySearch({ arr, target }) {");
    expect(bodyOf("typescript")).toContain("number");
    expect(bodyOf("php")).toContain("$data['arr']");
  });

  it("names the entry point the harness really calls", () => {
    // snake_case for Python, camelCase for the rest — same as evaluationConfig in the seed.
    expect(bodyOf("python")).toContain("aufgerufen als binary_search()");
    for (const language of ["javascript", "typescript", "php"]) {
      expect(bodyOf(language)).toContain("aufgerufen als binarySearch()");
    }
  });

  it("names the file the editor would name", () => {
    for (const language of CODE_LANGUAGES) {
      expect(bodyOf(language)).toContain(languageFileName(language));
    }
  });

  it("names no single challenge", () => {
    // The hero badge hardcoded "Array Manipulation" and claimed it forever. A decorative demo
    // must not age with the seed data either.
    expect(html).not.toContain("Array Manipulation");
    for (const language of CODE_LANGUAGES) {
      expect(bodyOf(language)).not.toContain("Array Manipulation");
    }
  });
});
