import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/server/code-execution-flag", () => ({
  isCodeExecutionEnabled: () => true,
}));

vi.mock("@/lib/server/piston-runner", () => ({
  executeWithPiston: vi.fn(),
}));

import { executeWithPiston } from "@/lib/server/piston-runner";
import { runChallengeTests } from "@/lib/server/challenge-execution";

const mockExecute = vi.mocked(executeWithPiston);

function pistonOk(stdout: string) {
  return {
    ok: true,
    exitCode: 0,
    stdout,
    stderr: "",
    compileStderr: "",
    compileFailed: false,
    compileOutput: "",
    durationMs: 8,
  };
}

function pistonFail(msg: string) {
  return {
    ok: false,
    exitCode: 1,
    stdout: "",
    stderr: msg,
    compileStderr: "",
    compileFailed: false,
    compileOutput: "",
    durationMs: 3,
  };
}

/** The compiler rejected the program: nothing ran, so there is no stdout to compare. */
function pistonCompileError(msg: string) {
  return {
    ok: false,
    exitCode: 2,
    stdout: msg,
    stderr: "",
    compileStderr: "",
    compileFailed: true,
    compileOutput: msg,
    durationMs: 2500,
  };
}

beforeEach(() => {
  mockExecute.mockReset();
});

describe("runChallengeTests (IO evaluation)", () => {
  const ioChallenge = {
    evaluationConfig: {
      callableByLanguage: {
        javascript: "solve",
        typescript: "solve",
        python: "solve",
      },
    },
    testCases: [
      { id: 1, name: "A", input: "[1]", expected: "[1]" },
      { id: 2, name: "B", input: "[2]", expected: "[99]" },
    ],
  };

  it("sets runtimeOk=true when all stdout values match expected", async () => {
    mockExecute
      .mockResolvedValueOnce(pistonOk("[1]"))
      .mockResolvedValueOnce(pistonOk("[99]"));

    const { testCases, runtimeOk } = await runChallengeTests(
      ioChallenge,
      "function solve(x){return x;}",
      "javascript",
      "submit"
    );

    expect(runtimeOk).toBe(true);
    expect(testCases.every((t) => t.status === "passed")).toBe(true);
    expect(mockExecute).toHaveBeenCalledTimes(2);
  });

  it("sets runtimeOk=false when stdout differs from expected", async () => {
    mockExecute.mockResolvedValueOnce(pistonOk("[1]")).mockResolvedValueOnce(pistonOk("[2]"));

    const { runtimeOk, testCases } = await runChallengeTests(
      ioChallenge,
      "code",
      "javascript",
      "submit"
    );

    expect(runtimeOk).toBe(false);
    expect(testCases.some((t) => t.status === "failed")).toBe(true);
  });

  it("marks failed when Piston returns ok=false", async () => {
    mockExecute.mockResolvedValueOnce(pistonFail("boom"));

    const { runtimeOk, testCases } = await runChallengeTests(
      {
        ...ioChallenge,
        testCases: [{ id: 1, name: "A", input: "[1]", expected: "[1]" }],
      },
      "x",
      "javascript",
      "run"
    );

    expect(runtimeOk).toBe(false);
    expect(testCases[0]?.status).toBe("failed");
  });
});

describe("runChallengeTests (smoke, no IO)", () => {
  it("run mode: single run without stdin, runtimeOk reflects compile status", async () => {
    mockExecute.mockResolvedValueOnce(pistonOk(""));

    const { testCases, runtimeOk } = await runChallengeTests(
      { testCases: [{ id: 1, name: "T" }] },
      "console.log(1)",
      "javascript",
      "run"
    );

    expect(mockExecute).toHaveBeenCalledTimes(1);
    expect(mockExecute.mock.calls[0]?.[2]).toBe("");
    expect(runtimeOk).toBe(true);
    expect(testCases.length).toBeGreaterThan(0);
  });

  it("submit mode: never auto-passes without IO evaluation, even when code runs", async () => {
    mockExecute.mockResolvedValueOnce(pistonOk(""));

    const { testCases, runtimeOk } = await runChallengeTests(
      { testCases: [{ id: 1, name: "T" }] },
      "console.log(1)",
      "javascript",
      "submit"
    );

    expect(runtimeOk).toBe(false);
    expect(testCases.every((t) => t.status !== "passed")).toBe(true);
    expect(testCases[0]?.actual).toContain("keine automatische Bewertung");
  });
});

describe("Kompilierfehler", () => {
  const ioChallenge = {
    evaluationConfig: { callableByLanguage: { typescript: "solve" } },
    testCases: [
      { id: 1, name: "A", input: "[1]", expected: "[1]" },
      { id: 2, name: "B", input: "[2]", expected: "[2]" },
      { id: 3, name: "C", input: "[3]", expected: "[3]" },
    ],
  };

  it("stops after the first case instead of compiling the same program five times", async () => {
    mockExecute.mockResolvedValue(pistonCompileError("main.ts.ts(1,7): error TS2322: nope"));

    const { runtimeOk, testCases, compileError } = await runChallengeTests(
      ioChallenge,
      "const x: number = 'nope';",
      "typescript",
      "run",
    );

    expect(mockExecute).toHaveBeenCalledTimes(1);
    expect(runtimeOk).toBe(false);
    expect(compileError).toContain("error TS2322");
    // Nothing ran, so nothing may claim to have been tested.
    expect(testCases.map((t) => t.status)).toEqual(["pending", "pending", "pending"]);
    expect(testCases.every((t) => t.actual === undefined)).toBe(true);
  });

  it("renames Piston's main.ts.ts to the file the editor shows", async () => {
    mockExecute.mockResolvedValue(pistonCompileError("main.ts.ts(1,7): error TS2322: nope"));

    const { compileError } = await runChallengeTests(ioChallenge, "code", "typescript", "run");

    expect(compileError).toContain("solution.ts(1,7)");
    expect(compileError).not.toContain("main.ts");
  });
});
