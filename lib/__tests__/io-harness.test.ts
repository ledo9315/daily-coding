import { describe, it, expect } from "vitest";
import { outputsMatch, buildWrappedProgram } from "@/lib/server/io-harness";

describe("outputsMatch", () => {
  it("trimmt Whitespace", () => {
    expect(outputsMatch("  [1]  \n", "[1]")).toBe(true);
  });

  it("vergleicht äquivalentes JSON mit unterschiedlicher Formatierung", () => {
    expect(outputsMatch("[1,3,6]", "[1, 3, 6]")).toBe(true);
  });

  it("scheitert bei echt unterschiedlichem Inhalt", () => {
    expect(outputsMatch("[1]", "[2]")).toBe(false);
  });
});

describe("buildWrappedProgram", () => {
  it("hängt stdin/stdout-Harness für JavaScript an", () => {
    const src = buildWrappedProgram("javascript", "function f(a){return a;}", "f");
    expect(src).toContain("function f(a){return a;}");
    expect(src).toContain("JSON.parse(raw)");
    expect(src).toContain("f(data)");
  });

  it("Python: ruft Callable mit geladenem JSON auf", () => {
    const src = buildWrappedProgram("python", "def g(x):\n    return x", "g");
    expect(src).toContain("def g(x):");
    expect(src).toContain("json.loads(_raw)");
    expect(src).toContain("g(_data)");
  });
});
