import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createTranslator } from "next-intl";
import { LandingCodeDemo, buildTerminalTabs } from "@/components/landing/code-demo";
import { CODE_LANGUAGES, languageFileName, languageLabel } from "@/lib/challenge-languages";
import { renderWithIntl } from "./intl-render";

const html = renderWithIntl(<LandingCodeDemo />);

/** A translator over one locale's `dashboard` catalogue, the way the component gets one. */
const translatorFor = (locale: string) =>
  createTranslator({
    locale,
    messages: {
      dashboard: JSON.parse(
        readFileSync(
          resolve(process.cwd(), "messages", locale, "dashboard.json"),
          "utf8"
        )
      ),
    },
    namespace: "dashboard",
  });

/** The tabs as the German catalogue renders them - the locale these assertions are written in. */
const germanTabs = buildTerminalTabs(translatorFor("de"));

/** All lines of one tab as a single string. */
/** Looked up by language id; the tab itself is labelled for readers ("C++", not `cpp`). */
const bodyOf = (language: (typeof CODE_LANGUAGES)[number]) =>
  germanTabs
    .find((tab) => tab.label === languageLabel(language))!
    .lines.map((line) => line.text)
    .join("\n");

/**
 * The terminal on the landing was a fixed script that typed one command and printed five
 * passing tests. It now has one tab per supported language.
 *
 * The rendered markup carries only the tab labels and the command - the animation starts at
 * zero visible lines - so the output itself is checked as data.
 */
describe("LandingCodeDemo", () => {
  it("offers a tab for every language the app accepts", () => {
    // Derived from CODE_LANGUAGES, so adding a language to the app fails this until the
    // landing stops claiming a smaller set.
    for (const language of CODE_LANGUAGES) {
      // The label is what a reader sees: "C++", not the enum value `cpp`.
      const label = languageLabel(language);
      expect(html).toContain(`>${label}<`);
      expect(germanTabs.map((tab) => tab.label)).toContain(label);
    }
  });

  it("keeps the headline and the claim next to it", () => {
    const t = translatorFor("de");
    expect(html).toContain(t("codeDemo.headlineLine2"));
    // The old copy promised "nutze deine vorhandenen Tools" - there is no CLI and no API.
    // What the section may claim is that run and submit execute the same cases:
    // `runPistonIoCases` is not even passed the mode.
    expect(html).toContain(t("codeDemo.claim"));
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
    // snake_case for Python, camelCase for the rest - same as evaluationConfig in the seed.
    expect(bodyOf("python")).toContain("aufgerufen als binary_search()");
    for (const language of ["javascript", "typescript", "php"] as const) {
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

  it("lines the timings up whichever language the copy is in", () => {
    /*
      The log renders with `whitespace-pre`, so the column only holds if every test name is
      padded to the same width - and the English names are longer than the German ones.
    */
    for (const locale of ["de", "en"]) {
      const tabs = buildTerminalTabs(translatorFor(locale));
      const columns = tabs[0].lines
        .filter((line) => line.text.includes(" ms)"))
        .map((line) => line.text.indexOf("("));
      expect(new Set(columns).size, locale).toBe(1);
    }
  });
});
