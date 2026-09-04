import { describe, expect, it } from "vitest";
import { normalizeHints } from "@/lib/challenge-hints";

/**
 * Staged hints replaced the single `hint` string: one sentence in an always-open amber box gave
 * away the solution to everyone, including the people who did not need it.
 */
describe("normalizeHints", () => {
  it("keeps well-formed steps in order", () => {
    expect(
      normalizeHints([
        { title: "Die Idee", body: "Halbiere den Suchbereich." },
        { title: "Fallstricke", body: "mid neu berechnen." },
      ], "Hinweis")
    ).toEqual([
      { title: "Die Idee", body: "Halbiere den Suchbereich." },
      { title: "Fallstricke", body: "mid neu berechnen." },
    ]);
  });

  it("returns nothing for a column that holds no array", () => {
    // A challenge without hints is normal - the panel is simply left out.
    for (const value of [null, undefined, {}, "Halbiere den Suchbereich.", 7]) {
      expect(normalizeHints(value, "Hinweis")).toEqual([]);
    }
  });

  it("drops steps that unfold to nothing", () => {
    expect(
      normalizeHints([
        { title: "Leer", body: "   " },
        { title: "Ohne Body" },
        null,
        "nur ein String",
        { title: "Gut", body: "Zwei Zeiger." },
      ], "Hinweis")
    ).toEqual([{ title: "Gut", body: "Zwei Zeiger." }]);
  });

  it("falls back to a generic label when the title is missing", () => {
    // An accordion needs something clickable; a blank trigger cannot be operated.
    expect(normalizeHints([{ body: "Zwei Zeiger." }], "Hinweis")).toEqual([
      { title: "Hinweis", body: "Zwei Zeiger." },
    ]);
    expect(normalizeHints([{ title: "  ", body: "Zwei Zeiger." }], "Hinweis")[0].title).toBe("Hinweis");
  });

  it("trims surrounding whitespace", () => {
    expect(normalizeHints([{ title: " Idee ", body: " Halbieren. " }], "Hinweis")).toEqual([
      { title: "Idee", body: "Halbieren." },
    ]);
  });
});
