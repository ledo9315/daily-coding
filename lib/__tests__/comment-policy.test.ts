import { describe, expect, it } from "vitest";
import { COMMENT_MAX_LENGTH, normalizeCommentBody } from "@/lib/comment-policy";

describe("comment policy", () => {
  it("returns the trimmed body", () => {
    expect(normalizeCommentBody("  Guter Ansatz.  ")).toEqual({ body: "Guter Ansatz." });
  });

  it("trims leading and trailing line breaks", () => {
    expect(normalizeCommentBody("\n\nZeile\nZeile\n\n")).toEqual({ body: "Zeile\nZeile" });
  });

  it("keeps Umlauts and emoji intact", () => {
    expect(normalizeCommentBody(" Schöne Lösung 🚀 ")).toEqual({ body: "Schöne Lösung 🚀" });
  });

  it.each([["whitespace only", "   \n\t "], ["empty string", ""]])(
    "rejects %s",
    (_label, raw) => {
      expect(normalizeCommentBody(raw)).toEqual({ error: "Kommentar darf nicht leer sein." });
    }
  );

  it.each([null, undefined, 42, {}, ["text"]])("rejects non-string %s", (raw) => {
    expect(normalizeCommentBody(raw)).toEqual({ error: "Kommentar darf nicht leer sein." });
  });

  it("accepts a body at the length limit", () => {
    const body = "a".repeat(COMMENT_MAX_LENGTH);
    expect(normalizeCommentBody(body)).toEqual({ body });
  });

  it("rejects one character over the limit", () => {
    const result = normalizeCommentBody("a".repeat(COMMENT_MAX_LENGTH + 1));
    expect(result).toEqual({
      error: `Kommentar darf höchstens ${COMMENT_MAX_LENGTH} Zeichen lang sein.`,
    });
  });

  /**
   * An adversarial pass got both of these past the check: `trim()` removes whitespace but
   * not format characters, so a body of nothing but U+200B was stored and rendered as an
   * empty paragraph - and a NUL reached Postgres, whose `text` type refuses it, turning a
   * validation problem into a 500.
   */
  it.each(["\u200b", "\u200c\u200d", "\u2060", "\u180e", "\u034f", " \u200b \n "])(
    "rejects a body that only looks like text (%j)",
    (raw) => {
      expect(normalizeCommentBody(raw)).toEqual({
        error: "Kommentar darf nicht leer sein.",
      });
    }
  );

  it("strips characters Postgres text cannot store", () => {
    expect(normalizeCommentBody("a\u0000b")).toEqual({ body: "ab" });
  });

  it("keeps the line breaks and tabs the thread renders", () => {
    expect(normalizeCommentBody("erste\nzweite\tdritte")).toEqual({
      body: "erste\nzweite\tdritte",
    });
  });

  it("keeps letters that carry a combining mark", () => {
    expect(normalizeCommentBody("cafe\u0301")).toEqual({ body: "cafe\u0301" });
  });
});
