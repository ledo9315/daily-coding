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
    durationMs: 3,
  };
}

beforeEach(() => {
  mockExecute.mockReset();
});

describe("runChallengeTests (IO)", () => {
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

  it("markiert runtimeOk=true wenn alle stdout mit expected übereinstimmen", async () => {
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

  it("markiert runtimeOk=false bei stdout-Abweichung", async () => {
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

  it("markiert fehlgeschlagen wenn Piston ok=false", async () => {
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

describe("runChallengeTests (Smoke ohne IO)", () => {
  it("nutzt einen Lauf ohne stdin wenn keine evaluationConfig", async () => {
    mockExecute.mockResolvedValueOnce(pistonOk(""));

    const { testCases, runtimeOk } = await runChallengeTests(
      { testCases: [{ id: 1, name: "T" }] },
      "console.log(1)",
      "javascript",
      "submit"
    );

    expect(mockExecute).toHaveBeenCalledTimes(1);
    expect(mockExecute.mock.calls[0]?.[2]).toBe("");
    expect(runtimeOk).toBe(true);
    expect(testCases.length).toBeGreaterThan(0);
  });
});
