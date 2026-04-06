import { describe, it, expect } from "vitest";
import { stripTestCaseSecretsForClient } from "@/lib/server/public-challenge";

describe("stripTestCaseSecretsForClient", () => {
  it("entfernt expected, lässt Rest stehen, setzt status=pending", () => {
    const out = stripTestCaseSecretsForClient([
      { id: 1, name: "A", input: "[1]", expected: "[1]" },
    ]) as { id: number; name: string; input: string; status: string }[];
    expect(out[0]?.expected).toBeUndefined();
    expect(out[0]?.input).toBe("[1]");
    expect(out[0]?.status).toBe("pending");
  });
});
