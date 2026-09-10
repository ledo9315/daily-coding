import { describe, it, expect } from "vitest";
import {
  DISPLAY_NAME_MAX_LENGTH,
  displayNameValidationError,
  nameKeyOf,
  publicProfilePath,
  uniqueDisplayName,
} from "@/lib/display-name";

describe("displayNameValidationError", () => {
  it.each([".", "---", "_ _", "🎮", "A"])(
    "rejects a name without at least two letters or numbers: %s",
    (name) => {
      expect(displayNameValidationError(name)).toEqual({ code: "tooFewAlphanumerics" });
    }
  );

  it("rejects a name that normalises to nothing", () => {
    expect(displayNameValidationError("   ")).toEqual({ code: "empty" });
  });

  it("rejects names longer than 50 normalised characters", () => {
    expect(displayNameValidationError("A".repeat(51))).toEqual({
      code: "tooLong",
      max: DISPLAY_NAME_MAX_LENGTH,
    });
  });

  it.each(["Li", "O’Neil", "Müller-Lüdenscheidt", "coder42", "李雷"])(
    "accepts a meaningful display name: %s",
    (name) => {
      expect(displayNameValidationError(name)).toBeNull();
    }
  );
});

describe("nameKeyOf", () => {
  it("folds case, because the header renders names in capitals", () => {
    expect(nameKeyOf("Anna")).toBe(nameKeyOf("anna"));
  });

  it("trims and collapses inner whitespace", () => {
    expect(nameKeyOf("  Max   Müller ")).toBe("max müller");
  });
});

describe("publicProfilePath", () => {
  it("builds the path from the name key", () => {
    expect(publicProfilePath("Anna Schmidt")).toBe("/u/anna%20schmidt");
  });

  it("percent-encodes umlauts", () => {
    expect(publicProfilePath("Lisa Müller")).toBe("/u/lisa%20m%C3%BCller");
  });

  it("ignores case and surrounding whitespace, because nameKeyOf normalises", () => {
    expect(publicProfilePath("  ANNA   SCHMIDT  ")).toBe(publicProfilePath("Anna Schmidt"));
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

describe("blocked display names", () => {
  it.each([
    "Hitler, Nazi Germany",
    "hitler",
    "H1TLER",
    "Нitler",
    "Adolf H i t l e r",
    "Sieg Heil",
    "Nazi",
    "der Führer",
    "1488",
    "sw4stika",
  ])("rejects a name that glorifies Nazism or carries a slur: %s", (name) => {
    expect(displayNameValidationError(name)).toEqual({ code: "blocked" });
  });

  it.each(["Arschloch", "hurensohn", "Sch3isse", "fuck you", "MotherFucker", "Gang Bang Gary", "bimbos"])(
    "rejects profanity from the LDNOOBW lists, matched on whole words: %s",
    (name) => {
      expect(displayNameValidationError(name)).toEqual({ code: "blocked" });
    }
  );

  it.each([
    "Cassandra",
    "Charles Dickens",
    "Peter Sexauer",
    "Assmann",
    "Dick Schmidt",
    "Ali Mufti",
    "XXX",
    "Scunthorpe",
    "Anna Schmidt",
    "Max Mustermann",
    "kirreth89",
  ])("keeps a real name that a substring dictionary would hit: %s", (name) => {
    expect(displayNameValidationError(name)).toBeNull();
  });

  it.each(["Ashkenazi", "Nazira", "Владислав Ключев", "Nikunj Saini", "Simon Sr.", "Max 88"])(
    "keeps a legitimate name that merely contains a short blocked term: %s",
    (name) => {
      expect(displayNameValidationError(name)).toBeNull();
    }
  );
});
