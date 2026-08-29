import type { Challenge } from "@/lib/generated/prisma/client";
import { parseEvaluationConfig } from "@/lib/server/challenge-execution";
import { normalizeHints } from "@/lib/challenge-hints";
import { perLanguage, type CodeLanguageId } from "@/lib/challenge-languages";

function jsonPretty(value: unknown): string {
  if (value === null || value === undefined) return "[]";
  return JSON.stringify(value, null, 2);
}

/** UTC calendar day as `YYYY-MM-DD`, the format `<input type="date">` expects. */
function formatUtcDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export type ChallengeFormInitial = {
  id: string;
  title: string;
  description: string;
  hintsJson: string;
  difficulty: "easy" | "medium" | "hard";
  points: number;
  categoryId: string;
  examplesJson: string;
  testsJson: string;
  /**
   * Function name per language. Empty means "not this language" for the typed ones - hence no
   * "solve" fallback there, which would turn every edit into a Java- and Go-enabled challenge.
   */
  callables: Record<CodeLanguageId, string>;
  starters: Record<CodeLanguageId, string>;
  isActive: boolean;
  dateUtcDay: string;
};

export function challengeToFormInitial(ch: Challenge): ChallengeFormInitial {
  const examples = ch.examples;
  const testCases = ch.testCases;
  const evalCfg = parseEvaluationConfig(ch.evaluationConfig);
  const cbl = evalCfg?.callableByLanguage;

  const starters =
    ch.starterCodes &&
    typeof ch.starterCodes === "object" &&
    !Array.isArray(ch.starterCodes)
      ? (ch.starterCodes as Record<string, string>)
      : {};

  return {
    id: ch.id,
    title: ch.title,
    description: ch.description,
    hintsJson: jsonPretty(normalizeHints(ch.hints)),
    difficulty: ch.difficulty,
    points: ch.points,
    categoryId: ch.categoryId,
    examplesJson: jsonPretty(examples),
    testsJson: jsonPretty(testCases),
    callables: perLanguage((spec) => {
      const name = cbl?.[spec.id];
      if (typeof name === "string") return name;
      return spec.typed ? "" : "solve";
    }),
    starters: perLanguage((spec) => starters[spec.id] ?? ""),
    isActive: ch.isActive,
    dateUtcDay: ch.date ? formatUtcDay(new Date(ch.date)) : "",
  };
}
