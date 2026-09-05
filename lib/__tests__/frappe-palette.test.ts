import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { FRAPPE } from "@/lib/monaco-catppuccin-frappe";

/**
 * The palette exists twice: as `FRAPPE` for the Monaco theme, which needs the values at
 * runtime, and as `--frappe-*` in `app/globals.css`, because the result page paints code
 * with highlight.js and CSS cannot import a module.
 *
 * Two copies of the same table drift, and the drift is invisible - the editor and the block
 * would simply disagree on one colour. These tests make the drift a failure.
 */
const css = readFileSync(resolve(process.cwd(), "app/globals.css"), "utf8");

function cssVars(): Record<string, string> {
  const found: Record<string, string> = {};
  for (const [, name, hex] of css.matchAll(/--frappe-([A-Za-z0-9]+):\s*#([0-9a-fA-F]{6});/g)) {
    found[name] = hex.toLowerCase();
  }
  return found;
}

describe("frappe palette", () => {
  it("carries every colour of the Monaco theme into the stylesheet", () => {
    expect(cssVars()).toEqual(FRAPPE);
  });

  it("declares no colour the theme does not know", () => {
    expect(Object.keys(cssVars()).sort()).toEqual(Object.keys(FRAPPE).sort());
  });

  /** The five the eye actually reads in a solution; a rename here is a visible regression. */
  it.each(["mauve", "blue", "peach", "green", "overlay0"])(
    "keeps %s reachable for the highlight.js rules",
    (name) => {
      expect(css).toContain(`var(--frappe-${name})`);
    }
  );

  /**
   * Every surface that shows monospaced content on the result page sits on the editor's
   * canvas. `--background` beside them reads as a hole in the page rather than as a block.
   */
  it.each([
    "components/code-block.tsx",
    "components/challenge-result/solution-diff.tsx",
    "components/challenge-result/share-result.tsx",
  ])("paints %s on the canvas the editor uses", (file) => {
    const source = readFileSync(resolve(process.cwd(), file), "utf8");

    expect(source).toContain("bg-[var(--frappe-editorCanvas)]");
    expect(css).toContain(`--frappe-editorCanvas: #${FRAPPE.editorCanvas};`);
  });

  /**
   * The editor runs `fontLigatures: false`. JetBrains Mono ships them on, so without this
   * the same `<=` was one glyph in the block and two characters in the editor.
   */
  it.each([
    "components/code-block.tsx",
    "components/challenge-result/solution-diff.tsx",
  ])("spells operators in %s the way the editor does", (file) => {
    const source = readFileSync(resolve(process.cwd(), file), "utf8");

    expect(source).toContain("[font-variant-ligatures:none]");
  });
});
