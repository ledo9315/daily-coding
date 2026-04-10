import type { ChallengeTestCase } from "@/lib/api";
import type { CodeLanguageId } from "@/lib/challenge-languages";
import type { Prisma } from "@/lib/generated/prisma/client";
import { isCodeExecutionEnabled } from "@/lib/server/code-execution-flag";
import {
  buildWrappedProgram,
  extractIoProgramOutput,
  outputsMatch,
} from "@/lib/server/io-harness";
import { executeWithPiston } from "@/lib/server/piston-runner";
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

function defaultSlots(): ParsedIoTestCase[] {
  return [
    { id: 1, name: "Laufzeit / Kompilierung" },
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

/** Summiert „123ms“-Zeiten aus Testfällen (Gesamtlaufzeit aller Läufe). */
export function sumDurationMsFromTestCases(cases: ChallengeTestCase[]): number {
  let sum = 0;
  for (const tc of cases) {
    const t = tc.time?.trim();
    if (!t || t === "—") continue;
    const m = /^(\d+)ms$/i.exec(t);
    if (m) sum += parseInt(m[1], 10);
  }
  return sum;
}

export type ChallengeRunResult = {
  testCases: ChallengeTestCase[];
  runtimeOk: boolean;
  /** Summe aller gemessenen Laufzeiten (Piston), für `Submission.timeTaken` (Sekunden). */
  totalDurationMs: number;
};

async function runPistonIoCases(
  challenge: ChallengeLike,
  code: string,
  language: CodeLanguageId
): Promise<ChallengeRunResult> {
  const cfg = parseEvaluationConfig(challenge.evaluationConfig);
  const callable = cfg?.callableByLanguage?.[language];
  if (!callable) {
    return {
      testCases: [
        {
          id: 1,
          name: "Konfiguration",
          status: "failed",
          time: "0ms",
          actual: "Keine callableByLanguage für diese Sprache in evaluationConfig.",
        },
      ],
      runtimeOk: false,
      totalDurationMs: 0,
    };
  }

  let list = parseTestCasesIo(challenge.testCases);
  if (list.length === 0) list = defaultSlots();

  const wrapped = buildWrappedProgram(language, code, callable);
  const results: ChallengeTestCase[] = [];
  let allPassed = true;
  let totalDurationMs = 0;

  for (const tc of list) {
    if (tc.input == null || tc.expected == null) {
      results.push({
        id: tc.id,
        name: tc.name,
        status: "pending",
        time: undefined,
      });
      allPassed = false;
      continue;
    }

    const piston = await executeWithPiston(language, wrapped, tc.input);
    totalDurationMs += piston.durationMs;
    const timeStr = `${piston.durationMs}ms`;

    if (!piston.ok) {
      allPassed = false;
      results.push({
        id: tc.id,
        name: tc.name,
        status: "failed",
        input: tc.input,
        expected: tc.expected,
        actual: (piston.stderr || piston.stdout || `Exit ${piston.exitCode}`).slice(0, 2000),
        time: timeStr,
      });
      continue;
    }

    const out = extractIoProgramOutput(piston.stdout);
    const outDisplay = out.slice(0, 2000);
    if (!outputsMatch(out, tc.expected)) {
      allPassed = false;
      results.push({
        id: tc.id,
        name: tc.name,
        status: "failed",
        input: tc.input,
        expected: tc.expected,
        actual: outDisplay,
        time: timeStr,
      });
    } else {
      results.push({
        id: tc.id,
        name: tc.name,
        status: "passed",
        input: tc.input,
        expected: tc.expected,
        actual: outDisplay,
        time: timeStr,
      });
    }
  }

  return { testCases: results, runtimeOk: allPassed, totalDurationMs };
}

async function runPistonSmoke(
  challenge: ChallengeLike,
  code: string,
  language: CodeLanguageId,
  mode: ChallengeExecutionMode
): Promise<ChallengeRunResult> {
  const piston = await executeWithPiston(language, code, "");
  const totalDurationMs = piston.durationMs;
  const list = parseTestCasesIo(challenge.testCases);
  const slots = list.length > 0 ? list : defaultSlots();

  if (mode === "submit") {
    if (piston.ok) {
      return {
        testCases: slots.map((s, i) => ({
          id: s.id,
          name: s.name,
          status: "passed" as const,
          time: i === 0 ? `${piston.durationMs}ms` : "—",
        })),
        runtimeOk: true,
        totalDurationMs,
      };
    }
    return {
      testCases: slots.map((s, i) => ({
        id: s.id,
        name: s.name,
        status: (i === 0 ? "failed" : "pending") as "failed" | "pending",
        time: i === 0 ? `${piston.durationMs}ms` : undefined,
        actual:
          i === 0
            ? (piston.stderr || piston.stdout || `Exit ${piston.exitCode}`).slice(0, 2000)
            : undefined,
      })),
      runtimeOk: false,
      totalDurationMs,
    };
  }

  const firstName = slots[0]?.name ?? "Laufzeit / Kompilierung";
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
    totalDurationMs,
  };
}

export async function runChallengeTests(
  challenge: ChallengeLike,
  code: string,
  language: CodeLanguageId,
  mode: ChallengeExecutionMode
): Promise<ChallengeRunResult> {
  if (!isCodeExecutionEnabled()) {
    if (mode === "submit") {
      const testCases = stubSubmitPassedResults(language);
      return {
        testCases,
        runtimeOk: true,
        totalDurationMs: sumDurationMsFromTestCases(testCases),
      };
    }
    const testCases = stubRunResults(language);
    return {
      testCases,
      runtimeOk: true,
      totalDurationMs: sumDurationMsFromTestCases(testCases),
    };
  }

  try {
    if (usesIoEvaluation(challenge, language)) {
      return await runPistonIoCases(challenge, code, language);
    }
    return await runPistonSmoke(challenge, code, language, mode);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return {
      testCases: [
        {
          id: 1,
          name: `Laufzeit (${language})`,
          status: "failed",
          time: "0ms",
          actual: `Ausführung fehlgeschlagen: ${msg}`,
        },
      ],
      runtimeOk: false,
      totalDurationMs: 0,
    };
  }
}
