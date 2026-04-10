import type { Challenge } from "@/lib/generated/prisma/client";
import { parseEvaluationConfig } from "@/lib/server/challenge-execution";

function jsonPretty(value: unknown): string {
  if (value === null || value === undefined) return "[]";
  return JSON.stringify(value, null, 2);
}

function formatDatetimeLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day}T${h}:${min}`;
}

export type ChallengeFormInitial = {
  id: string;
  title: string;
  description: string;
  hint: string;
  difficulty: "easy" | "medium" | "hard";
  points: number;
  categoryId: string;
  examplesJson: string;
  testsJson: string;
  fnJs: string;
  fnTs: string;
  fnPy: string;
  fnPhp: string;
  starterJs: string;
  starterTs: string;
  starterPy: string;
  starterPhp: string;
  isActive: boolean;
  dateLocal: string;
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
    hint: ch.hint ?? "",
    difficulty: ch.difficulty,
    points: ch.points,
    categoryId: ch.categoryId,
    examplesJson: jsonPretty(examples),
    testsJson: jsonPretty(testCases),
    fnJs: typeof cbl?.javascript === "string" ? cbl.javascript : "solve",
    fnTs: typeof cbl?.typescript === "string" ? cbl.typescript : "solve",
    fnPy: typeof cbl?.python === "string" ? cbl.python : "solve",
    fnPhp: typeof cbl?.php === "string" ? cbl.php : "solve",
    starterJs: starters.javascript ?? "",
    starterTs: starters.typescript ?? "",
    starterPy: starters.python ?? "",
    starterPhp: starters.php ?? "",
    isActive: ch.isActive,
    dateLocal: ch.date ? formatDatetimeLocal(new Date(ch.date)) : "",
  };
}
