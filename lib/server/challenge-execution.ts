import { getTranslations } from "next-intl/server";
import type { AppLocale } from "@/lib/locale";
import type { ChallengeTestCase } from "@/lib/api";
import { LANGUAGES, languageFileName, type CodeLanguageId } from "@/lib/challenge-languages";
import type { Prisma } from "@/lib/generated/prisma/client";
import { isCodeExecutionEnabled } from "@/lib/server/code-execution-flag";
import {
  buildWrappedProgram,
  extractIoProgramOutput,
  HARNESS_LINE_OFFSETS,
  outputsMatch,
} from "@/lib/server/io-harness";
import { executeWithPiston, type PistonRunResult } from "@/lib/server/piston-runner";
import { stubRunResults, stubSubmitPassedResults } from "@/lib/server/challenge-run-stub";

type ChallengeLike = {
  testCases: Prisma.JsonValue;
  evaluationConfig?: Prisma.JsonValue | null;
};

export type ParsedIoTestCase = {
  id: number;
  name: string;
  input?: string;
  expected?: string;
};

/**
 * The strings this module puts into the result panel itself, resolved once per request.
 *
 * Only the slots the module invents: a name that came from `Challenge.testCases` is already
 * in the reader's language by the time it gets here - `localizeChallenge` translated it.
 */
type ExecutionLabels = {
  runtimeSlot: string;
  configSlot: string;
  missingCallable: string;
  noAutoGrading: string;
};

export type EvaluationConfigShape = {
  callableByLanguage?: Partial<Record<CodeLanguageId, string>>;
};

export function parseEvaluationConfig(
  raw: Prisma.JsonValue | null | undefined
): EvaluationConfigShape | null {
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = raw as Record<string, unknown>;
  const cbl = o.callableByLanguage;
  if (!cbl || typeof cbl !== "object" || Array.isArray(cbl)) return null;
  return { callableByLanguage: cbl as Partial<Record<CodeLanguageId, string>> };
}

export function parseTestCasesIo(raw: Prisma.JsonValue): ParsedIoTestCase[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((x, i) => {
      if (x && typeof x === "object" && "name" in x) {
        const o = x as {
          id?: number;
          name?: string;
          input?: string;
          expected?: string;
        };
        return {
          id: typeof o.id === "number" ? o.id : i + 1,
          name: typeof o.name === "string" ? o.name : `Test ${i + 1}`,
          input: typeof o.input === "string" ? o.input : undefined,
          expected: typeof o.expected === "string" ? o.expected : undefined,
        };
      }
      return { id: i + 1, name: `Test ${i + 1}` };
    })
    .slice(0, 20);
}

function defaultSlots(labels: ExecutionLabels): ParsedIoTestCase[] {
  return [
    { id: 1, name: labels.runtimeSlot },
    { id: 2, name: "Test 2" },
    { id: 3, name: "Test 3" },
    { id: 4, name: "Test 4" },
    { id: 5, name: "Test 5" },
  ];
}

function usesIoEvaluation(
  challenge: ChallengeLike,
  language: CodeLanguageId
): boolean {
  const cfg = parseEvaluationConfig(challenge.evaluationConfig);
  const callable = cfg?.callableByLanguage?.[language];
  if (!callable || callable.length === 0) return false;
  const cases = parseTestCasesIo(challenge.testCases);
  return cases.some((c) => c.input != null && c.expected != null);
}

export type ChallengeExecutionMode = "run" | "submit";


export type ChallengeRunResult = {
  testCases: ChallengeTestCase[];
  runtimeOk: boolean;
  /**
   * Set when the compiler rejected the program. Not a test result: nothing ran, so every slot
   * stays pending and the message is shown on its own instead of in "actual".
   */
  compileError?: string;
};

/**
 * Piston compiles `main.ts` and reports errors against `main.ts.ts`. The editor calls the file
 * `solution.ts`, and a line number is only useful next to a file the user recognises.
 */
export function withEditorFileName(message: string, language: CodeLanguageId): string {
  const name = languageFileName(language);
  const withoutBanner = message.replace(LANGUAGES[language].compilerBanner ?? /(?!)/u, "");

  /*
    Several compilers already name the file the editor shows, but count lines from the top of the
    generated program - three above the user's first line for Java, twenty-three for Go. An error
    pointing below the actual mistake is worse than no line number at all.

    Two notations to cover: `Main.java:12` and, from Mono, `main.cs(12,7)`.
  */
  // Rename first: tsc reports `main.ts.ts(2,1)`, and its offset has to find the editor name.
  const renamed = withoutBanner
    .replaceAll("main.ts.ts", name)
    .replaceAll(/\bmain\.(ts|js|py|php)\b/gu, name);
  const offset = HARNESS_LINE_OFFSETS[language];
  if (!offset) return renamed;
  const file = name.replace(".", "\\.");
  const pattern = new RegExp(`\\b${file}(?::(\\d+)|\\((\\d+),)`, "gu");
  return renamed.replaceAll(pattern, (whole, colon?: string, paren?: string) => {
    const raw = colon ?? paren;
    const line = Number(raw) - offset;
    if (line < 1) return whole;
    return colon ? `${name}:${line}` : `${name}(${line},`;
  });
}

async function runPistonIoCases(
  challenge: ChallengeLike,
  code: string,
  language: CodeLanguageId,
  labels: ExecutionLabels
): Promise<ChallengeRunResult> {
  const cfg = parseEvaluationConfig(challenge.evaluationConfig);
  const callable = cfg?.callableByLanguage?.[language];
  if (!callable) {
    return {
      testCases: [
        {
          id: 1,
          name: labels.configSlot,
          status: "failed",
          time: "0ms",
          actual: labels.missingCallable,
        },
      ],
      runtimeOk: false,
    };
  }

  let list = parseTestCasesIo(challenge.testCases);
  if (list.length === 0) list = defaultSlots(labels);

  const pendingSlots = () =>
    list.map((slot) => ({ id: slot.id, name: slot.name, status: "pending" as const }));

  type CaseOutcome =
    | { kind: "result"; testCase: ChallengeTestCase }
    | { kind: "compileError"; piston: PistonRunResult };

  const evaluateCase = async (tc: ParsedIoTestCase): Promise<CaseOutcome> => {
    /*
      Built per case, not once: the Java and Go harnesses bake the input in as typed literals
      rather than parsing it at runtime, so the program differs from case to case. The other
      languages ignore the argument and produce the same string every time.
    */
    const wrapped = buildWrappedProgram(language, code, callable, tc.input as string);
    const piston = await executeWithPiston(language, wrapped, tc.input as string);
    if (piston.compileFailed) return { kind: "compileError", piston };
    const time = `${piston.durationMs}ms`;
    const expected = tc.expected as string;

    if (!piston.ok) {
      return {
        kind: "result",
        testCase: {
          id: tc.id,
          name: tc.name,
          status: "failed",
          input: tc.input as string,
          expected,
          actual: (piston.stderr || piston.stdout || `Exit ${piston.exitCode}`).slice(0, 2000),
          time,
        },
      };
    }

    const out = extractIoProgramOutput(piston.stdout);
    return {
      kind: "result",
      testCase: {
        id: tc.id,
        name: tc.name,
        status: outputsMatch(out, expected) ? "passed" : "failed",
        input: tc.input as string,
        expected,
        actual: out.slice(0, 2000),
        time,
      },
    };
  };

  const compileErrorResult = (piston: PistonRunResult): ChallengeRunResult => ({
    testCases: pendingSlots(),
    runtimeOk: false,
    compileError: withEditorFileName(
      (piston.compileOutput || piston.stderr || `Exit ${piston.exitCode}`).slice(0, 2000),
      language
    ),
  });

  const runnable = list.filter((tc) => tc.input != null && tc.expected != null);
  const outcomes = new Map<number, CaseOutcome>();

  /*
    The first case runs alone, the rest together. Every case is a round trip to the sandbox,
    and six of them in a row were most of what a user waited for. Running all six at once
    would cut that further, but a program the compiler rejects would then be compiled six
    times for one answer - so the first case doubles as the compile check, and only when it
    comes back as a result do the others go out.
  */
  const [first, ...rest] = runnable;
  if (first) {
    const outcome = await evaluateCase(first);
    if (outcome.kind === "compileError") return compileErrorResult(outcome.piston);
    outcomes.set(first.id, outcome);
    const others = await Promise.all(rest.map(evaluateCase));
    for (const [i, outcome] of others.entries()) {
      if (outcome.kind === "compileError") return compileErrorResult(outcome.piston);
      outcomes.set(rest[i].id, outcome);
    }
  }

  let allPassed = true;
  const results: ChallengeTestCase[] = list.map((tc) => {
    const outcome = outcomes.get(tc.id);
    if (!outcome || outcome.kind !== "result") {
      allPassed = false;
      return { id: tc.id, name: tc.name, status: "pending", time: undefined };
    }
    if (outcome.testCase.status !== "passed") allPassed = false;
    return outcome.testCase;
  });

  return { testCases: results, runtimeOk: allPassed };
}

async function runPistonSmoke(
  challenge: ChallengeLike,
  code: string,
  language: CodeLanguageId,
  mode: ChallengeExecutionMode,
  labels: ExecutionLabels
): Promise<ChallengeRunResult> {
  const piston = await executeWithPiston(language, code, "");
  const list = parseTestCasesIo(challenge.testCases);
  const slots = list.length > 0 ? list : defaultSlots(labels);

  if (piston.compileFailed) {
    return {
      testCases: slots.map((s) => ({ id: s.id, name: s.name, status: "pending" as const })),
      runtimeOk: false,
      compileError: withEditorFileName(
        (piston.compileOutput || piston.stderr || `Exit ${piston.exitCode}`).slice(0, 2000),
        language
      ),
    };
  }

  if (mode === "submit") {
    // Without real I/O test cases a submission cannot be checked for
    // correctness. No auto-pass - that would award full points for code that
    // merely compiles. Affects misconfigured challenges: seed demos without a
    // config, or admin-created challenges without test cases.
    return {
      testCases: slots.map((s, i) => ({
        id: s.id,
        name: s.name,
        status: (i === 0 ? "failed" : "pending") as "failed" | "pending",
        time: i === 0 ? `${piston.durationMs}ms` : undefined,
        actual:
          i === 0
            ? piston.ok
              ? labels.noAutoGrading
              : (piston.stderr || piston.stdout || `Exit ${piston.exitCode}`).slice(0, 2000)
            : undefined,
      })),
      runtimeOk: false,
    };
  }

  const firstName = slots[0]?.name ?? labels.runtimeSlot;
  const first: ChallengeTestCase = {
    id: slots[0]?.id ?? 1,
    name: `${firstName} (${language})`,
    status: piston.ok ? "passed" : "failed",
    time: `${piston.durationMs}ms`,
    actual: piston.ok
      ? undefined
      : (piston.stderr || piston.stdout || `Exit ${piston.exitCode}`).slice(0, 2000),
  };

  const rest: ChallengeTestCase[] = slots.slice(1).map((s) => ({
    id: s.id,
    name: s.name,
    status: "pending" as const,
    time: undefined,
  }));

  return {
    testCases: [first, ...rest],
    runtimeOk: piston.ok,
  };
}

export async function runChallengeTests(
  challenge: ChallengeLike,
  code: string,
  language: CodeLanguageId,
  mode: ChallengeExecutionMode,
  /**
   * The language of the page these results are going back to. Passed in rather than read
   * from the request: the challenge page is fixed to a language by its URL, which a route
   * handler cannot see, and these labels sit in the same panel as the test-case names
   * (#287).
   */
  locale: AppLocale
): Promise<ChallengeRunResult> {
  if (!isCodeExecutionEnabled()) {
    if (mode === "submit") {
      const testCases = stubSubmitPassedResults(language);
      return {
        testCases,
        runtimeOk: true,
      };
    }
    const testCases = stubRunResults(language);
    return {
      testCases,
      runtimeOk: true,
    };
  }

  const t = await getTranslations({ locale, namespace: "challenge" });
  const labels: ExecutionLabels = {
    runtimeSlot: t("execution.slots.runtimeCompile"),
    configSlot: t("execution.slots.configuration"),
    missingCallable: t("execution.missingCallable"),
    noAutoGrading: t("execution.noAutoGrading"),
  };

  try {
    if (usesIoEvaluation(challenge, language)) {
      return await runPistonIoCases(challenge, code, language, labels);
    }
    return await runPistonSmoke(challenge, code, language, mode, labels);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return {
      testCases: [
        {
          id: 1,
          name: t("execution.slots.runtime", { language }),
          status: "failed",
          time: "0ms",
          // Only the frame is ours: the cause is a Piston message or a harness refusal and is
          // appended unchanged, the way a compiler's own wording reaches the panel.
          actual: t("execution.failed", { cause: msg }),
        },
      ],
      runtimeOk: false,
    };
  }
}
