import { describe, expect, it } from "vitest";
import { codeHash, normalizeCodeForHash } from "@/lib/server/code-hash";

describe("normalizeCodeForHash", () => {
  it("unifies CRLF and lone CR line endings", () => {
    expect(normalizeCodeForHash("a\r\nb\rc")).toBe("a\nb\nc");
  });

  it("drops trailing whitespace per line", () => {
    expect(normalizeCodeForHash("a   \nb\t\nc")).toBe("a\nb\nc");
  });

  it("trims the outer margin, the first line's indentation included", () => {
    expect(normalizeCodeForHash("\n\n  const a = 1;\n\n")).toBe("const a = 1;");
  });

  it("keeps leading indentation, which changes the meaning in Python", () => {
    expect(normalizeCodeForHash("def f():\n    return 1")).toBe("def f():\n    return 1");
  });

  it("keeps blank lines inside the code", () => {
    expect(normalizeCodeForHash("a\n\nb")).toBe("a\n\nb");
  });
});

describe("codeHash", () => {
  it("gives the same hash to code differing only in noise", () => {
    expect(codeHash("  a = 1  \r\n\r\n")).toBe(codeHash("  a = 1\n"));
  });

  it("gives different hashes to differently indented bodies", () => {
    expect(codeHash("def f():\n  return 1")).not.toBe(codeHash("def f():\n    return 1"));
  });

  it("does not merge two solutions that only look alike", () => {
    expect(codeHash("return a + b")).not.toBe(codeHash("return b + a"));
  });
});
