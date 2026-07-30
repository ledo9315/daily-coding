/**
 * Catppuccin **Frappe** for the Monaco editor.
 * Colors: https://github.com/catppuccin/palette (Frappe)
 * There is no official `monaco-catppuccin` package — the token rules are modelled
 * on the VSCode/Monaco scopes.
 */
import type { Monaco } from "@monaco-editor/react";

export const MONACO_THEME_FRAPPE = "catppuccin-frappe";

/** Frappe palette (hex, lowercase) */
const frappe = {
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
      { token: "comment", foreground: frappe.overlay0, fontStyle: "italic" },
      { token: "string", foreground: frappe.green },
      { token: "string.escape", foreground: frappe.teal },
      { token: "keyword", foreground: frappe.mauve },
      { token: "number", foreground: frappe.peach },
      { token: "regexp", foreground: frappe.pink },
      { token: "type", foreground: frappe.yellow },
      { token: "class", foreground: frappe.yellow },
      { token: "interface", foreground: frappe.yellow },
      { token: "function", foreground: frappe.blue },
      { token: "method", foreground: frappe.blue },
      { token: "variable", foreground: frappe.text },
      { token: "parameter", foreground: frappe.flamingo },
      { token: "namespace", foreground: frappe.rosewater },
      { token: "annotation", foreground: frappe.yellow },
      { token: "delimiter", foreground: frappe.overlay2 },
      { token: "delimiter.bracket", foreground: frappe.overlay2 },
      { token: "operator", foreground: frappe.sky },
      { token: "tag", foreground: frappe.mauve },
      { token: "attribute.name", foreground: frappe.yellow },
      { token: "attribute.value", foreground: frappe.green },
      { token: "metatag", foreground: frappe.mauve },
      { token: "key", foreground: frappe.flamingo },
    ],
    colors: {
      "editor.background": hex(frappe.editorCanvas),
      "editor.foreground": hex(frappe.text),
      "editorLineNumber.foreground": hex(frappe.overlay1),
      "editorLineNumber.activeForeground": hex(frappe.lavender),
      "editorCursor.foreground": hex(frappe.rosewater),
      "editor.selectionBackground": `${hex(frappe.surface2)}99`,
      "editor.inactiveSelectionBackground": `${hex(frappe.surface1)}66`,
      "editor.lineHighlightBackground": hex(frappe.mantle),
      "editorLineNumber.activeBackground": hex(frappe.mantle),
      "editorWhitespace.foreground": hex(frappe.overlay0),
      "editorIndentGuide.background": hex(frappe.surface0),
      "editorIndentGuide.activeBackground": hex(frappe.overlay2),
      "editorBracketMatch.background": `${hex(frappe.surface1)}cc`,
      "editorBracketMatch.border": hex(frappe.overlay2),
      "scrollbarSlider.background": `${hex(frappe.surface1)}aa`,
      "scrollbarSlider.hoverBackground": `${hex(frappe.surface2)}cc`,
      "scrollbarSlider.activeBackground": hex(frappe.overlay2),
    },
  });

  monaco.editor.setTheme(MONACO_THEME_FRAPPE);
}
