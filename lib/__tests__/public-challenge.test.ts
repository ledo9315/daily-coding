import { describe, it, expect } from "vitest";
import { stripTestCaseSecretsForClient } from "@/lib/server/public-challenge";

describe("stripTestCaseSecretsForClient", () => {
  it("entfernt expected, lässt Rest stehen, setzt status=pending", () => {
    const out = stripTestCaseSecretsForClient([
      { id: 1, name: "A", input: "[1]", expected: "[1]" },
    ]);
    expect(Array.isArray(out)).toBe(true);
    const first = (out as Record<string, unknown>[])[0];
    expect(first?.expected).toBeUndefined();
    expect(first?.input).toBe("[1]");
    expect(first?.status).toBe("pending");
  });
});
