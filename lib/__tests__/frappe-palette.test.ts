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

  it("paints the block on the canvas the editor uses", () => {
    const block = readFileSync(resolve(process.cwd(), "components/code-block.tsx"), "utf8");

    expect(block).toContain("bg-[var(--frappe-editorCanvas)]");
    expect(css).toContain(`--frappe-editorCanvas: #${FRAPPE.editorCanvas};`);
  });
});
