import { describe, it, expect, vi, beforeEach } from "vitest";

/** The slots this module names itself are translated; `next-intl/server` throws outside react-server. */
vi.mock("next-intl/server", async () =>
  (await import("@/app/api/__tests__/api-translations-mock")).apiTranslationsMock()
);

vi.mock("@/lib/server/code-execution-flag", () => ({
  isCodeExecutionEnabled: () => true,
}));

vi.mock("@/lib/server/piston-runner", () => ({
  executeWithPiston: vi.fn(),
}));

import { executeWithPiston } from "@/lib/server/piston-runner";
import { runChallengeTests, withEditorFileName } from "@/lib/server/challenge-execution";

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
      "submit",
      "de"
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
      "submit", "de"
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
      "run", "de"
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
      "run", "de"
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
      "submit", "de"
    );

    expect(runtimeOk).toBe(false);
    expect(testCases.every((t) => t.status !== "passed")).toBe(true);
    expect(testCases[0]?.actual).toContain("keine automatische Bewertung");
  });

  it("names the fallback slots from the catalogue rather than from the source", async () => {
    mockExecute.mockResolvedValueOnce(pistonOk(""));

    const { testCases } = await runChallengeTests(
      { testCases: [] },
      "console.log(1)",
      "javascript",
      "run", "de"
    );

    expect(testCases[0]?.name).toContain("Laufzeit / Kompilierung");
  });
});

describe("runChallengeTests (execution failure)", () => {
  it("translates the frame and appends the cause unchanged", async () => {
    mockExecute.mockRejectedValueOnce(new Error("fetch failed"));

    const { runtimeOk, testCases } = await runChallengeTests(
      { testCases: [{ id: 1, name: "T" }] },
      "console.log(1)",
      "javascript",
      "run", "de"
    );

    expect(runtimeOk).toBe(false);
    expect(testCases[0]?.name).toBe("Laufzeit (javascript)");
    expect(testCases[0]?.actual).toBe("Ausführung fehlgeschlagen: fetch failed");
  });
});

describe("compile errors", () => {
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
      "de",
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

    const { compileError } = await runChallengeTests(ioChallenge, "code", "typescript", "run", "de");

    expect(compileError).toContain("solution.ts(1,7)");
    expect(compileError).not.toContain("main.ts");
  });
});

describe("case scheduling", () => {
  const ioChallenge = {
    evaluationConfig: { callableByLanguage: { javascript: "solve" } },
    testCases: [
      { id: 1, name: "A", input: "[1]", expected: "[1]" },
      { id: 2, name: "B", input: "[2]", expected: "[2]" },
      { id: 3, name: "C", input: "[3]", expected: "[3]" },
      { id: 4, name: "D", input: "[4]", expected: "[4]" },
    ],
  };

  /** A Piston call the test resolves by hand, to observe what is in flight at each moment. */
  function deferred() {
    let resolve!: (value: ReturnType<typeof pistonOk>) => void;
    const promise = new Promise<ReturnType<typeof pistonOk>>((r) => (resolve = r));
    return { promise, resolve };
  }

  it("runs the first case alone and the remaining cases together", async () => {
    const calls = [deferred(), deferred(), deferred(), deferred()];
    calls.forEach((c) => mockExecute.mockReturnValueOnce(c.promise));

    const run = runChallengeTests(ioChallenge, "code", "javascript", "run", "de");
    await Promise.resolve();
    // Only the probe is out: a compile error must not cost one compiler run per case.
    expect(mockExecute).toHaveBeenCalledTimes(1);

    calls[0].resolve(pistonOk("[1]"));
    await vi.waitFor(() => expect(mockExecute).toHaveBeenCalledTimes(4));

    calls[1].resolve(pistonOk("[2]"));
    calls[2].resolve(pistonOk("[3]"));
    calls[3].resolve(pistonOk("[4]"));
    const { runtimeOk } = await run;
    expect(runtimeOk).toBe(true);
  });

  it("keeps the catalogue order even when a later case answers first", async () => {
    const calls = [deferred(), deferred(), deferred(), deferred()];
    calls.forEach((c) => mockExecute.mockReturnValueOnce(c.promise));

    const run = runChallengeTests(ioChallenge, "code", "javascript", "run", "de");
    calls[0].resolve(pistonOk("[1]"));
    await vi.waitFor(() => expect(mockExecute).toHaveBeenCalledTimes(4));
    calls[3].resolve(pistonOk("[4]"));
    calls[2].resolve(pistonOk("wrong"));
    calls[1].resolve(pistonOk("[2]"));

    const { runtimeOk, testCases } = await run;
    expect(runtimeOk).toBe(false);
    expect(testCases.map((t) => t.id)).toEqual([1, 2, 3, 4]);
    expect(testCases.map((t) => t.status)).toEqual(["passed", "passed", "failed", "passed"]);
    expect(testCases[2].actual).toBe("wrong");
  });

  it("passes each case its own input, since the typed harnesses bake it into the program", async () => {
    mockExecute.mockResolvedValue(pistonOk("[1]"));

    await runChallengeTests(ioChallenge, "code", "javascript", "run", "de");

    expect(mockExecute.mock.calls.map((c) => c[2])).toEqual(["[1]", "[2]", "[3]", "[4]"]);
  });

  it("leaves a case without input or expected value pending and does not send it to Piston", async () => {
    mockExecute.mockResolvedValue(pistonOk("[1]"));
    const challenge = {
      ...ioChallenge,
      testCases: [
        { id: 1, name: "A", input: "[1]", expected: "[1]" },
        { id: 2, name: "B" },
        { id: 3, name: "C", input: "[1]", expected: "[1]" },
      ],
    };

    const { runtimeOk, testCases } = await runChallengeTests(challenge, "code", "javascript", "run", "de");

    expect(mockExecute).toHaveBeenCalledTimes(2);
    expect(runtimeOk).toBe(false);
    expect(testCases.map((t) => t.status)).toEqual(["passed", "pending", "passed"]);
  });

  it("reports a compile error from a later case the same way as from the first", async () => {
    mockExecute
      .mockResolvedValueOnce(pistonOk("[1]"))
      .mockResolvedValueOnce(pistonOk("[2]"))
      .mockResolvedValueOnce(pistonCompileError("main.js:1 boom"))
      .mockResolvedValueOnce(pistonOk("[4]"));

    const { runtimeOk, testCases, compileError } = await runChallengeTests(ioChallenge, "code", "javascript", "run", "de");

    expect(runtimeOk).toBe(false);
    expect(compileError).toContain("boom");
    expect(testCases.map((t) => t.status)).toEqual(["pending", "pending", "pending", "pending"]);
  });
});

describe("withEditorFileName", () => {
  it("subtracts the harness offset so a line number points at the user's code", () => {
    // javac counts from the top of the generated file, three lines above the solution's line 1.
    expect(withEditorFileName("Main.java:5: error: cannot find symbol", "java")).toContain(
      "Main.java:2:"
    );
  });

  it("understands Mono's parenthesised notation as well as the colon one", () => {
    // main.cs(9,17) rather than main.cs:9 - same offset, different spelling.
    const out = withEditorFileName("main.cs(9,17): error CS0029: …", "csharp");
    expect(out).toContain("main.cs(2,17)");
  });

  it("drops the compiler banner nobody needs to read twice", () => {
    const raw =
      "Microsoft (R) Visual C# Compiler version 3.9.0-6.21124.20 (db94f4cc)\n" +
      "Copyright (C) Microsoft Corporation. All rights reserved.\n\n" +
      "main.cs(9,17): error CS0029: Cannot implicitly convert type";
    const out = withEditorFileName(raw, "csharp");
    expect(out).not.toContain("Microsoft (R) Visual C# Compiler");
    expect(out).toContain("CS0029");
  });

  it("leaves a line number alone when subtracting would put it above the file", () => {
    // A message about the harness itself, not the solution - better wrong than negative.
    expect(withEditorFileName("Main.java:2: error: x", "java")).toContain("Main.java:2:");
  });

  it("renames Piston's file to the one the editor shows and drops the TypeScript header line", () => {
    // The lib directive sits above the user's code, so tsc counts one line too many.
    expect(withEditorFileName("main.ts.ts(3,1): error", "typescript")).toBe("solution.ts(2,1): error");
  });
});
