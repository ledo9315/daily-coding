/** Supported programming languages (must match Prisma enum `CodeLanguage`). */
export const CODE_LANGUAGES = [
  "javascript",
  "typescript",
  "python",
  "php",
  "java",
  "ruby",
  "go",
] as const;
export type CodeLanguageId = (typeof CODE_LANGUAGES)[number];

/** Per-language starters returned for a challenge (keys ⊆ CodeLanguageId). */
export type StarterCodesMap = Partial<Record<CodeLanguageId, string>>;

const LABELS: Record<CodeLanguageId, string> = {
  javascript: "JavaScript",
  typescript: "TypeScript",
  python: "Python",
  php: "PHP",
  java: "Java",
  ruby: "Ruby",
  go: "Go",
};

const FILENAMES: Record<CodeLanguageId, string> = {
  javascript: "solution.js",
  typescript: "solution.ts",
  python: "main.py",
  php: "main.php",
  /*
    Not a free choice: javac derives the file name from the public class, and the harness wraps
    everything in `public class Main`. Piston is handed a file without extension and appends
    `.java` itself, so its error messages already say Main.java — editor and compiler agree
    without any rewriting.
  */
  java: "Main.java",
  ruby: "main.rb",
  go: "main.go",
};

export function languageLabel(lang: CodeLanguageId): string {
  return LABELS[lang] ?? lang;
}

export function languageFileName(lang: CodeLanguageId): string {
  return FILENAMES[lang] ?? "solution.txt";
}

function fallbackStarter(lang: CodeLanguageId): string {
  switch (lang) {
    case "python":
      return "# Implement your solution\ndef solve():\n    pass\n";
    case "typescript":
      return "// Implement your solution\n";
    case "php":
      return "<?php\n\n// Implement your solution\nfunction solve($data) {\n}\n";
    case "java":
      return "// Implement your solution\nstatic int solve(int[] arr) {\n    return 0;\n}\n";
    case "ruby":
      return "# Implement your solution\ndef solve(data)\n  nil\nend\n";
    case "go":
      return "// Implement your solution\nfunc solve(arr []int) []int {\n\treturn arr\n}\n";
    default:
      return "// Implement your solution\n";
  }
}

function isCodeLanguageId(s: string): s is CodeLanguageId {
  return (CODE_LANGUAGES as readonly string[]).includes(s);
}

/**
 * Build a full starter map for all supported languages, using DB JSON + legacy starterCode for JS.
 */
export function normalizeStarterCodes(
  starterCodesJson: unknown,
  supportedLanguages: CodeLanguageId[],
  legacyStarterCode: string | null | undefined
): StarterCodesMap {
  const raw =
    starterCodesJson &&
    typeof starterCodesJson === "object" &&
    !Array.isArray(starterCodesJson)
      ? (starterCodesJson as Partial<Record<string, string>>)
      : {};

  const result = {} as StarterCodesMap;
  for (const lang of supportedLanguages) {
    const fromJson = raw[lang];
    if (typeof fromJson === "string" && fromJson.trim().length > 0) {
      result[lang] = fromJson;
    } else if (lang === "javascript" && legacyStarterCode?.trim()) {
      result[lang] = legacyStarterCode;
    } else {
      result[lang] = fallbackStarter(lang);
    }
  }
  return result;
}

export function parseCodeLanguage(
  raw: unknown,
  allowed: readonly CodeLanguageId[]
): CodeLanguageId | null {
  if (allowed.length === 0) return null;
  if (raw == null || raw === "") return allowed[0];
  if (typeof raw !== "string") return null;
  const key = raw.trim().toLowerCase();
  return allowed.find((l) => l === key) ?? null;
}

export function normalizeSupportedLanguages(
  list: string[] | null | undefined
): CodeLanguageId[] {
  if (!list?.length) return ["javascript"];
  const out = list.filter((x): x is CodeLanguageId => isCodeLanguageId(x));
  return out.length > 0 ? out : ["javascript"];
}
