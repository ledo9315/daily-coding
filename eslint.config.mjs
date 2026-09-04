import js from "@eslint/js";
import tseslint from "typescript-eslint";

/**
 * The ratchet for the bilingual conversion: inside a directory whose strings have been
 * moved to `messages/`, a literal where a translation key belongs is a forgotten string.
 *
 * Applied per area below - one block per directory group, so a violation names the area it
 * came from. Left out on purpose, each with its reason at the block: the admin area stays
 * German, `components/ui/**` is vendored, the level path is unconverted, and `__tests__`,
 * `prisma` and `scripts` hold no user-visible surface.
 *
 * Note what this is *not*: it does not detect German. `CLAUDE.md` rules that out for good
 * reasons - umlaut heuristics trip over proper nouns, and a keyword list misses plain
 * sentences. This detects a *literal in a place that should hold a key*, which is
 * language-agnostic and decidable from the syntax tree alone. It stays a floor, not a
 * proof: `aria-label`, `placeholder` and template strings pass it, so a converted
 * directory still has to be read.
 */
export const uiStringRatchet = {
  "no-restricted-syntax": [
    "error",
    {
      // Two or more letters, so arrows, bullets and lone digits stay allowed.
      selector: "JSXText[value=/[A-Za-z\\u00C0-\\u024F]{2,}/]",
      message:
        "User-visible text belongs in messages/<locale>/<area>.json - render it via useTranslations/getTranslations.",
    },
    {
      selector: "CallExpression[callee.object.name='toast'] > Literal",
      message:
        "Toast text belongs in messages/<locale>/<area>.json - pass a translated string.",
    },
  ],
};

export default tseslint.config(
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "lib/generated/**",
      "data/**",
      "prisma/migrations/**",
      ".pnpm-store/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", { "varsIgnorePattern": "^_", "argsIgnorePattern": "^_" }],
      "no-unused-vars": "off",
      "prefer-const": "warn",
    },
  },
  {
    // Pages and layouts: every string the reader sees comes from a namespace now.
    // `app/map/**` is the level path, still in flight and not part of the conversion.
    files: ["app/**/*.tsx"],
    ignores: ["app/admin/**", "app/map/**", "**/__tests__/**"],
    rules: uiStringRatchet,
  },
  {
    files: ["app/**/*.ts"],
    ignores: ["app/admin/**", "app/api/admin/**", "**/__tests__/**"],
    rules: uiStringRatchet,
  },
  {
    // `components/ui/**` is vendored: shadcn primitives kept as the CLI writes them, so
    // `shadcn add` can still update a file. Their only literals are upstream English
    // `sr-only` labels, and the one a reader can reach - the dialog close button - takes
    // its label from the caller. `level-map.tsx` belongs to the unconverted level path.
    files: ["components/**/*.tsx"],
    ignores: [
      "components/admin/**",
      "components/ui/**",
      "components/level-map.tsx",
      "**/__tests__/**",
    ],
    rules: uiStringRatchet,
  },
  {
    files: ["components/**/*.ts"],
    ignores: ["components/admin/**", "components/ui/**", "**/__tests__/**"],
    rules: uiStringRatchet,
  },
  {
    files: ["lib/**/*.ts", "lib/**/*.tsx"],
    ignores: ["lib/admin/**", "lib/generated/**", "**/__tests__/**"],
    rules: uiStringRatchet,
  },
  {
    // The Piston installer moved to TypeScript so it can read the language registry; nothing
    // under scripts/ is .mjs any more, but the globals block stays for the next one.
    files: ["scripts/**/*.mjs"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        AbortSignal: "readonly",
        console: "readonly",
        fetch: "readonly",
        process: "readonly",
        URL: "readonly",
      },
    },
  }
);
