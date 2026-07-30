import { describe, it, expect } from "vitest";
import { nameKeyOf, uniqueDisplayName } from "@/lib/display-name";

describe("nameKeyOf", () => {
  it("folds case, because the header renders names in capitals", () => {
    expect(nameKeyOf("Anna")).toBe(nameKeyOf("anna"));
  });

  it("trims and collapses inner whitespace", () => {
    expect(nameKeyOf("  Max   Müller ")).toBe("max müller");
  });
});

describe("uniqueDisplayName", () => {
  it("keeps the name when it is free", async () => {
    const taken = new Set<string>();
    expect(await uniqueDisplayName("Max Müller", async (k) => taken.has(k))).toBe("Max Müller");
  });

  it("appends a counter when taken, since OAuth cannot reject", async () => {
    const taken = new Set([nameKeyOf("Max Müller")]);
    expect(await uniqueDisplayName("Max Müller", async (k) => taken.has(k))).toBe("Max Müller 2");
  });

  it("keeps counting past the first free-looking suffix", async () => {
    const taken = new Set([
      nameKeyOf("Max Müller"),
      nameKeyOf("Max Müller 2"),
      nameKeyOf("Max Müller 3"),
    ]);
    expect(await uniqueDisplayName("Max Müller", async (k) => taken.has(k))).toBe("Max Müller 4");
  });

  it("gives up after a bounded number of tries rather than looping forever", async () => {
    await expect(uniqueDisplayName("Max", async () => true)).rejects.toThrow();
  });

  it("normalises the name it returns", async () => {
    expect(await uniqueDisplayName("  Max   Müller  ", async () => false)).toBe("Max Müller");
  });
});
