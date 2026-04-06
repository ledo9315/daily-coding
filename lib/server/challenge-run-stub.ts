import type { ChallengeTestCase } from "@/lib/api";
import type { CodeLanguageId } from "@/lib/challenge-languages";

/**
 * Temporary stub runner — swap for real sandbox / Judge0 per language later.
 * Returns distinct stub metadata so clients can verify language was accepted.
 */
export function stubRunResults(language: CodeLanguageId): ChallengeTestCase[] {
  return [
    { id: 1, name: `Smoke (${language}): trivial case`, status: "passed", time: "12ms" },
    { id: 2, name: `Smoke (${language}): empty input`, status: "passed", time: "8ms" },
    {
      id: 3,
      name: `Sample failure (stub only)`,
      status: "failed",
      input: "[-1, -2, -3]",
      expected: "[-1, -3, -6]",
      actual: "[-1, -2, -3]",
      time: "10ms",
    },
    { id: 4, name: `Smoke (${language}): large input`, status: "passed", time: "45ms" },
    { id: 5, name: `Smoke (${language}): pending slot`, status: "pending" },
  ];
}

export function stubSubmitPassedResults(language: CodeLanguageId): ChallengeTestCase[] {
  return [
    { id: 1, name: `Submit (${language}): case 1`, status: "passed", time: "12ms" },
    { id: 2, name: `Submit (${language}): case 2`, status: "passed", time: "8ms" },
    { id: 3, name: `Submit (${language}): case 3`, status: "passed", time: "10ms" },
    { id: 4, name: `Submit (${language}): case 4`, status: "passed", time: "45ms" },
    { id: 5, name: `Submit (${language}): case 5`, status: "passed", time: "5ms" },
  ];
}
