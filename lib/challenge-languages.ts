/** Supported programming languages (must match Prisma enum `CodeLanguage`). */
export const CODE_LANGUAGES = [
  "javascript",
  "typescript",
  "python",
  "php",
  "java",
  "ruby",
  "go",
  "cpp",
  "csharp",
  "rust",
] as const;
export type CodeLanguageId = (typeof CODE_LANGUAGES)[number];

/** Per-language starters returned for a challenge (keys ⊆ CodeLanguageId). */
export type StarterCodesMap = Partial<Record<CodeLanguageId, string>>;

/**
 * Everything about a language that is data rather than code.
 *
 * Adding one used to mean editing ten files, and two of them were only found because an
 * exhaustive `Record<CodeLanguageId, …>` refused to compile. The fields below exist because each
 * one has already differed from the language id somewhere:
 *
 * - `pistonPackage` - the installer calls Node "node", not "javascript".
 * - `pistonLanguage` - what Piston calls the runtime, when that is not the id. C++ has to be
 *   `cpp` in a Postgres enum and is `c++` to Piston.
 * - `pistonFile` - Piston appends its own extension, so Java is handed `Main` and Go `main`;
 *   passing `Main.java` yields errors against `Main.java.java`.
 * - `editorFile` - what the user sees in the editor's title bar.
 * - `monacoId` - what Monaco calls the language, when that is not the id either.
 * - `versionPrefix` - Piston ships Ruby 2.5 next to 3.0 and TypeScript 4 next to 5.
 * - `typed` - needs the test input expressible as typed parameters, so it is opt-in per
 *   challenge instead of part of the base set.
 * - `compiledInRunStep` - Piston has no separate compile stage for these, so the compiler's CPU
 *   cost counts against the program's budget and its errors arrive as a failed *run*.
 * - `compileFailure` - how that failed run is told apart from a crash. Matched against stderr,
 *   and only when stdout is empty.
 * - `compilerBanner` - boilerplate to drop before showing the message; Mono greets with two
 *   lines of version and copyright.
 * - `harnessLineOffset` - lines the wrapper puts above the user's code, so a compiler's line
 *   numbers can be corrected. Derived in `io-harness.ts`, not counted by hand.
 */
export type LanguageSpec = {
  id: CodeLanguageId;
  label: string;
  monacoId: string;
  editorFile: string;
  pistonFile: string;
  pistonPackage: string;
  pistonLanguage?: string;
  versionPrefix?: string;
  typed: boolean;
  compiledInRunStep: boolean;
  compileFailure?: RegExp;
  /** Boilerplate the compiler prints above its actual message, dropped before display. */
  compilerBanner?: RegExp;
  starter: string;
};

/**
 * A Record and not an array: the exhaustiveness check is the only thing standing between a new
 * enum value and a language that is half-registered.
 */
export const LANGUAGES: Record<CodeLanguageId, LanguageSpec> = {
  javascript: {
    id: "javascript",
    label: "JavaScript",
    monacoId: "javascript",
    editorFile: "solution.js",
    pistonFile: "main.js",
    pistonPackage: "node",
    typed: false,
    compiledInRunStep: false,
    starter: "// Implement your solution\n",
  },
  typescript: {
    id: "typescript",
    label: "TypeScript",
    monacoId: "typescript",
    editorFile: "solution.ts",
    pistonFile: "main.ts",
    pistonPackage: "typescript",
    versionPrefix: "5.",
    typed: false,
    compiledInRunStep: false,
    starter: "// Implement your solution\n",
  },
  python: {
    id: "python",
    label: "Python",
    monacoId: "python",
    editorFile: "main.py",
    pistonFile: "main.py",
    pistonPackage: "python",
    versionPrefix: "3.",
    typed: false,
    compiledInRunStep: false,
    starter: "# Implement your solution\ndef solve():\n    pass\n",
  },
  php: {
    id: "php",
    label: "PHP",
    monacoId: "php",
    editorFile: "main.php",
    pistonFile: "main.php",
    pistonPackage: "php",
    typed: false,
    compiledInRunStep: false,
    starter: "<?php\n\n// Implement your solution\nfunction solve($data) {\n}\n",
  },
  ruby: {
    id: "ruby",
    label: "Ruby",
    monacoId: "ruby",
    editorFile: "main.rb",
    pistonFile: "main.rb",
    pistonPackage: "ruby",
    versionPrefix: "3.",
    typed: false,
    compiledInRunStep: false,
    starter: "# Implement your solution\ndef solve(data)\n  nil\nend\n",
  },
  java: {
    id: "java",
    label: "Java",
    monacoId: "java",
    editorFile: "Main.java",
    pistonFile: "Main",
    pistonPackage: "java",
    typed: true,
    compiledInRunStep: true,
    compileFailure: /^error: compilation failed$/mu,
    starter: "// Implement your solution\nstatic int solve(int[] arr) {\n    return 0;\n}\n",
  },
  go: {
    id: "go",
    label: "Go",
    monacoId: "go",
    editorFile: "main.go",
    pistonFile: "main",
    pistonPackage: "go",
    typed: true,
    compiledInRunStep: true,
    // Go exits 2 for a rejected build and for a panic alike; only the build says this.
    compileFailure: /^# command-line-arguments$|^\.\/main\.go:\d+:\d+:/mu,
    starter: "// Implement your solution\nfunc solve(arr []int) []int {\n\treturn arr\n}\n",
  },
  cpp: {
    id: "cpp",
    label: "C++",
    monacoId: "cpp",
    editorFile: "main.cpp",
    pistonFile: "main",
    pistonPackage: "gcc",
    // Three different spellings for one language, which is what the registry is for.
    pistonLanguage: "c++",
    typed: true,
    // gcc gets its own compile stage from Piston, unlike javac and the Go toolchain.
    compiledInRunStep: false,
    starter:
      "// Implement your solution\nvector<int> solve(vector<int> arr) {\n    return arr;\n}\n",
  },
  csharp: {
    id: "csharp",
    label: "C#",
    monacoId: "csharp",
    editorFile: "main.cs",
    pistonFile: "main",
    /*
      Mono, not the .NET runtime Piston also carries. `csharp.net` runs `dotnet new console` plus
      restore and build on every single execution: ten seconds of CPU for a hello world, and its
      progress messages land on stdout where the program's answer belongs. mcs compiles in
      400 ms and says nothing.
    */
    pistonPackage: "mono",
    typed: true,
    compiledInRunStep: false,
    // Two lines of version banner above every message, including the successful ones.
    compilerBanner: /^Microsoft \(R\) Visual C# Compiler.*\n(Copyright .*\n)?\n?/u,
    starter:
      "// Implement your solution\nstatic int[] Solve(int[] arr) {\n    return arr;\n}\n",
  },
  rust: {
    id: "rust",
    label: "Rust",
    monacoId: "rust",
    editorFile: "main.rs",
    /*
      With the extension, unlike Java, Go and C++. Piston appends one for those and rustc reports
      against whatever it was handed - `main` without a suffix would put a file the user never
      saw into every error message.
    */
    pistonFile: "main.rs",
    pistonPackage: "rust",
    typed: true,
    compiledInRunStep: false,
    starter:
      "// Implement your solution\nfn solve(arr: Vec<i64>) -> Vec<i64> {\n    arr\n}\n",
  },
};

/** What Piston calls this language - the id unless the registry says otherwise. */
export function pistonLanguageName(lang: CodeLanguageId): string {
  return LANGUAGES[lang]?.pistonLanguage ?? lang;
}

/** In CODE_LANGUAGES order, which is the order the dropdown and the admin form follow. */
export const LANGUAGE_LIST: LanguageSpec[] = CODE_LANGUAGES.map((id) => LANGUAGES[id]);

/**
 * One value per language, in registry order, with the key types intact.
 *
 * `Object.fromEntries` would widen the keys to `string` and lose exactly the exhaustiveness this
 * registry exists for.
 */
export function perLanguage<T>(make: (spec: LanguageSpec) => T): Record<CodeLanguageId, T> {
  const out = {} as Record<CodeLanguageId, T>;
  for (const spec of LANGUAGE_LIST) out[spec.id] = make(spec);
  return out;
}

export function languageLabel(lang: CodeLanguageId): string {
  return LANGUAGES[lang]?.label ?? lang;
}

/** The name shown in the editor - not necessarily the one Piston is handed. */
export function languageFileName(lang: CodeLanguageId): string {
  return LANGUAGES[lang]?.editorFile ?? "solution.txt";
}

export function monacoLanguageId(lang: CodeLanguageId): string {
  return LANGUAGES[lang]?.monacoId ?? "plaintext";
}

/**
 * True when the language needs the test input expressible as typed parameters.
 *
 * Such a language is offered only where the challenge says so, via
 * `evaluationConfig.callableByLanguage`. A dropdown entry whose submission always fails is worse
 * than a missing one.
 */
export function isTypedLanguage(lang: CodeLanguageId): boolean {
  return LANGUAGES[lang]?.typed ?? false;
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
      result[lang] = LANGUAGES[lang]?.starter ?? "// Implement your solution\n";
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
