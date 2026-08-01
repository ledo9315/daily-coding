import { afterEach, describe, it, expect, vi } from "vitest";
import {
  clearPistonRuntimeCache,
  executeWithPiston,
  pistonHttpEndpoints,
} from "@/lib/server/piston-runner";

type RunStub = {
  stdout?: string;
  stderr?: string;
  code?: number | null;
  signal?: string | null;
  message?: string | null;
};

/** Answers /runtimes with one runtime per language and /execute with the given run block. */
function mockPiston(language: string, run: RunStub, onBody?: (body: unknown) => void) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string | URL, init?: { body?: string }) => {
      if (String(url).endsWith("/runtimes")) {
        return new Response(JSON.stringify([{ language, version: "1.0.0" }]), { status: 200 });
      }
      onBody?.(JSON.parse(init?.body ?? "{}"));
      return new Response(
        JSON.stringify({ run: { stdout: "", stderr: "", code: 0, signal: null, ...run } }),
        { status: 200 }
      );
    })
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
  clearPistonRuntimeCache();
});

describe("pistonHttpEndpoints", () => {
  it("self-host: Origin → /api/v2/runtimes", () => {
    const u = pistonHttpEndpoints("http://127.0.0.1:2000");
    expect(u.runtimes).toBe("http://127.0.0.1:2000/api/v2/runtimes");
    expect(u.execute).toBe("http://127.0.0.1:2000/api/v2/execute");
  });

  it("legacy EMKC prefix: avoids duplicate /api/v2", () => {
    const u = pistonHttpEndpoints("https://example.org/api/v2/piston");
    expect(u.runtimes).toBe("https://example.org/api/v2/piston/runtimes");
    expect(u.execute).toBe("https://example.org/api/v2/piston/execute");
  });

  it("trims trailing slash", () => {
    const u = pistonHttpEndpoints("http://host:2000/");
    expect(u.execute).toBe("http://host:2000/api/v2/execute");
  });
});

describe("executeWithPiston: Go", () => {
  it("tells a rejected build apart from a panic — both exit 2", async () => {
    mockPiston("go", {
      stderr: "# command-line-arguments\n./main.go:24:9: undefined: strconv\n",
      code: 2,
    });
    const build = await executeWithPiston("go", "package main", "");
    expect(build.compileFailed).toBe(true);
    expect(build.compileOutput).toContain("undefined: strconv");

    clearPistonRuntimeCache();
    mockPiston("go", {
      stderr: "panic: runtime error: index out of range [0]\n\ngoroutine 1 [running]:\n",
      code: 2,
    });
    const panic = await executeWithPiston("go", "package main", "");
    expect(panic.compileFailed).toBe(false);
  });
});

describe("executeWithPiston: Java", () => {
  const COMPILE_ERROR =
    "Main.java:5: error: cannot find symbol\n        retrun best;\n        ^\n1 error\nerror: compilation failed\n";

  it("reports a rejected program as a compile failure", async () => {
    // Piston gives Java no compile stage — javac runs inside the run step. Without this the
    // caller shows a compiler message in "Erhalten" and runs the same broken program five times.
    mockPiston("java", { stderr: COMPILE_ERROR, code: 1 });
    const res = await executeWithPiston("java", "class Main {}", "");
    expect(res.compileFailed).toBe(true);
    expect(res.compileOutput).toContain("cannot find symbol");
    expect(res.compileOutput).not.toContain("Run:");
  });

  it("leaves a runtime exception a runtime error", async () => {
    mockPiston("java", {
      stderr: "Exception in thread \"main\" java.lang.ArithmeticException: / by zero\n",
      code: 1,
    });
    const res = await executeWithPiston("java", "class Main {}", "");
    expect(res.compileFailed).toBe(false);
  });

  it("does not mistake output plus the marker for a compile failure", async () => {
    // A program that prints the phrase and then fails has run. Only an empty stdout counts.
    mockPiston("java", { stdout: "error: compilation failed", stderr: COMPILE_ERROR, code: 1 });
    const res = await executeWithPiston("java", "class Main {}", "");
    expect(res.compileFailed).toBe(false);
  });

  it("names the reason when the run is killed for exceeding its budget", async () => {
    // SIGKILL leaves nothing behind: no stdout, no stderr, exit code null. Without Piston's
    // message the user reads "Exit -1" and cannot tell a timeout from a crash.
    mockPiston("java", { code: null, signal: "SIGKILL", message: "Time limit exceeded" });
    const res = await executeWithPiston("java", "class Main {}", "");
    expect(res.ok).toBe(false);
    expect(res.stderr).toContain("Time limit exceeded");
    expect(res.stderr).toContain("SIGKILL");
  });

  it("asks for a bigger CPU budget, and only for Java", async () => {
    // javac plus JVM startup alone burn about 2.5-3 s, right at Piston's 3000 ms default.
    let javaBody: { run_cpu_time?: number } = {};
    mockPiston("java", { stdout: "1" }, (b) => (javaBody = b as typeof javaBody));
    await executeWithPiston("java", "class Main {}", "");
    expect(javaBody.run_cpu_time).toBe(15_000);

    /*
      The other languages must send no limit at all. A Piston host rejects any request above its
      configured ceiling with HTTP 400, so spelling out even the default value would make every
      submission in every language depend on the host's configuration.
    */
    clearPistonRuntimeCache();
    let jsBody: Record<string, unknown> = {};
    mockPiston("javascript", { stdout: "1" }, (b) => (jsBody = b as Record<string, unknown>));
    await executeWithPiston("javascript", "1", "");
    expect(jsBody).not.toHaveProperty("run_cpu_time");
    expect(jsBody).not.toHaveProperty("run_timeout");
  });
});
