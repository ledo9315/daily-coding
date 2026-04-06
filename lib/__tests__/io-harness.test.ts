import { describe, it, expect } from "vitest";
import { outputsMatch, buildWrappedProgram } from "@/lib/server/io-harness";

describe("outputsMatch", () => {
  it("trims whitespace", () => {
    expect(outputsMatch("  [1]  \n", "[1]")).toBe(true);
  });

  it("treats equivalent JSON with different formatting as equal", () => {
    expect(outputsMatch("[1,3,6]", "[1, 3, 6]")).toBe(true);
  });

  it("fails when content actually differs", () => {
    expect(outputsMatch("[1]", "[2]")).toBe(false);
  });
});

describe("buildWrappedProgram", () => {
  it("wraps JavaScript with stdin/stdout harness", () => {
    const src = buildWrappedProgram("javascript", "function f(a){return a;}", "f");
    expect(src).toContain("function f(a){return a;}");
    expect(src).toContain("JSON.parse(raw)");
    expect(src).toContain("f(data)");
  });

  it("Python: invokes callable with JSON-loaded input", () => {
    const src = buildWrappedProgram("python", "def g(x):\n    return x", "g");
    expect(src).toContain("def g(x):");
    expect(src).toContain("json.loads(_raw)");
    expect(src).toContain("g(_data)");
  });
});
