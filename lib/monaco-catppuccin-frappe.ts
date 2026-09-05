/**
 * Catppuccin **Frappe** for the Monaco editor.
 * Colors: https://github.com/catppuccin/palette (Frappe)
 * There is no official `monaco-catppuccin` package - the token rules are modelled
 * on the VSCode/Monaco scopes.
 */
import type { Monaco } from "@monaco-editor/react";

export const MONACO_THEME_FRAPPE = "catppuccin-frappe";

/**
 * Frappe palette (hex, lowercase).
 *
 * Exported because the editor is no longer the only surface showing code: the result page
 * renders solutions through highlight.js, and `app/globals.css` carries the same values as
 * `--frappe-*` custom properties. `__tests__/frappe-palette.test.ts` compares the two, so a
 * colour changed here alone fails rather than drifting apart on one page.
 */
export const FRAPPE = {
  rosewater: "f2d5cf",
  flamingo: "eebebe",
  pink: "f4b8e4",
  mauve: "ca9ee6",
  red: "e78284",
  maroon: "ea999c",
  peach: "ef9f76",
  yellow: "e5c890",
  green: "a6d189",
  teal: "81c8be",
  sky: "99d1db",
  sapphire: "85c1dc",
  blue: "8caaee",
  lavender: "babbf1",
  text: "c6d0f5",
  subtext1: "b5bfe2",
  subtext0: "a5adce",
  overlay2: "949cbb",
  overlay1: "838ba7",
  overlay0: "737994",
  surface2: "626880",
  surface1: "51576d",
  surface0: "414559",
  base: "303446",
  mantle: "292c3c",
  crust: "232634",
  editorCanvas: "1a1c27",
} as const;

let registered = false;

function hex(n: string) {
  return `#${n}`;
}

export function registerCatppuccinFrappeTheme(monaco: Monaco) {
  if (registered) {
    monaco.editor.setTheme(MONACO_THEME_FRAPPE);
    return;
  }
  registered = true;

  monaco.editor.defineTheme(MONACO_THEME_FRAPPE, {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: FRAPPE.overlay0, fontStyle: "italic" },
      { token: "string", foreground: FRAPPE.green },
      { token: "string.escape", foreground: FRAPPE.teal },
      { token: "keyword", foreground: FRAPPE.mauve },
      { token: "number", foreground: FRAPPE.peach },
      { token: "regexp", foreground: FRAPPE.pink },
      { token: "type", foreground: FRAPPE.yellow },
      { token: "class", foreground: FRAPPE.yellow },
      { token: "interface", foreground: FRAPPE.yellow },
      { token: "function", foreground: FRAPPE.blue },
      { token: "method", foreground: FRAPPE.blue },
      { token: "variable", foreground: FRAPPE.text },
      { token: "parameter", foreground: FRAPPE.flamingo },
      { token: "namespace", foreground: FRAPPE.rosewater },
      { token: "annotation", foreground: FRAPPE.yellow },
      { token: "delimiter", foreground: FRAPPE.overlay2 },
      { token: "delimiter.bracket", foreground: FRAPPE.overlay2 },
      { token: "operator", foreground: FRAPPE.sky },
      { token: "tag", foreground: FRAPPE.mauve },
      { token: "attribute.name", foreground: FRAPPE.yellow },
      { token: "attribute.value", foreground: FRAPPE.green },
      { token: "metatag", foreground: FRAPPE.mauve },
      { token: "key", foreground: FRAPPE.flamingo },
    ],
    colors: {
      "editor.background": hex(FRAPPE.editorCanvas),
      "editor.foreground": hex(FRAPPE.text),
      "editorLineNumber.foreground": hex(FRAPPE.overlay1),
      "editorLineNumber.activeForeground": hex(FRAPPE.lavender),
      "editorCursor.foreground": hex(FRAPPE.rosewater),
      "editor.selectionBackground": `${hex(FRAPPE.surface2)}99`,
      "editor.inactiveSelectionBackground": `${hex(FRAPPE.surface1)}66`,
      "editor.lineHighlightBackground": hex(FRAPPE.mantle),
      "editorLineNumber.activeBackground": hex(FRAPPE.mantle),
      "editorWhitespace.foreground": hex(FRAPPE.overlay0),
      "editorIndentGuide.background": hex(FRAPPE.surface0),
      "editorIndentGuide.activeBackground": hex(FRAPPE.overlay2),
      "editorBracketMatch.background": `${hex(FRAPPE.surface1)}cc`,
      "editorBracketMatch.border": hex(FRAPPE.overlay2),
      "scrollbarSlider.background": `${hex(FRAPPE.surface1)}aa`,
      "scrollbarSlider.hoverBackground": `${hex(FRAPPE.surface2)}cc`,
      "scrollbarSlider.activeBackground": hex(FRAPPE.overlay2),
    },
  });

  monaco.editor.setTheme(MONACO_THEME_FRAPPE);
}
