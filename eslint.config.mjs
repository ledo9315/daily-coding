import js from "@eslint/js";
import tseslint from "typescript-eslint";

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
