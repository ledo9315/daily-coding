import { describe, expect, it } from "vitest";
import {
  clearDrafts,
  pruneDrafts,
  readDraft,
  writeDraft,
} from "@/lib/challenge-draft-store";

function memoryStorage() {
  const map = new Map<string, string>();
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => void map.set(key, value),
    removeItem: (key: string) => void map.delete(key),
    key: (index: number) => [...map.keys()][index] ?? null,
    get length() {
      return map.size;
    },
    raw: map,
  };
}

/**
 * Reported from r/webdev: a solution was gone after clicking to another tab and back,
 * because the editor kept it in React state alone.
 */
describe("challenge draft store", () => {
  it("gives back what was typed", () => {
    const storage = memoryStorage();
    writeDraft(storage, "ch-1", "python", "print(1)");

    expect(readDraft(storage, "ch-1", "python")).toBe("print(1)");
  });

  it("reports nothing for a challenge that has no draft", () => {
    expect(readDraft(memoryStorage(), "ch-1", "python")).toBeNull();
  });

  /** Two languages are two programs; switching must not overwrite the other one. */
  it("keeps one draft per language", () => {
    const storage = memoryStorage();
    writeDraft(storage, "ch-1", "python", "print(1)");
    writeDraft(storage, "ch-1", "java", "class Solution {}");

    expect(readDraft(storage, "ch-1", "python")).toBe("print(1)");
    expect(readDraft(storage, "ch-1", "java")).toBe("class Solution {}");
  });

  it("keeps drafts of different challenges apart", () => {
    const storage = memoryStorage();
    writeDraft(storage, "ch-1", "python", "one");
    writeDraft(storage, "ch-2", "python", "two");

    expect(readDraft(storage, "ch-1", "python")).toBe("one");
    expect(readDraft(storage, "ch-2", "python")).toBe("two");
  });

  /** What was handed in is no longer a draft - in any language. */
  it("clears every language of a challenge on submission", () => {
    const storage = memoryStorage();
    writeDraft(storage, "ch-1", "python", "one");
    writeDraft(storage, "ch-1", "java", "two");
    writeDraft(storage, "ch-2", "python", "other challenge");

    clearDrafts(storage, "ch-1");

    expect(readDraft(storage, "ch-1", "python")).toBeNull();
    expect(readDraft(storage, "ch-1", "java")).toBeNull();
    expect(readDraft(storage, "ch-2", "python")).toBe("other challenge");
  });

  /**
   * The ring moves on daily. Without the sweep the store would grow by one entry per
   * language per day and never shrink.
   */
  it("drops every draft but today's challenge", () => {
    const storage = memoryStorage();
    writeDraft(storage, "yesterday", "python", "old");
    writeDraft(storage, "today", "python", "current");

    pruneDrafts(storage, "today");

    expect(readDraft(storage, "yesterday", "python")).toBeNull();
    expect(readDraft(storage, "today", "python")).toBe("current");
  });

  /** The store is shared with everything else the app keeps in it. */
  it("leaves keys that are not drafts alone", () => {
    const storage = memoryStorage();
    storage.raw.set("NEXT_LOCALE", "de");
    writeDraft(storage, "today", "python", "current");

    pruneDrafts(storage, "nothing-matches");

    expect(storage.raw.get("NEXT_LOCALE")).toBe("de");
  });

  it("stays quiet when the storage refuses", () => {
    const throwing = {
      getItem: () => {
        throw new Error("denied");
      },
      setItem: () => {
        throw new Error("denied");
      },
      removeItem: () => {
        throw new Error("denied");
      },
      key: () => {
        throw new Error("denied");
      },
      get length(): number {
        throw new Error("denied");
      },
    };

    expect(() => writeDraft(throwing, "ch-1", "python", "x")).not.toThrow();
    expect(() => clearDrafts(throwing, "ch-1")).not.toThrow();
    expect(() => pruneDrafts(throwing, "ch-1")).not.toThrow();
    expect(readDraft(throwing, "ch-1", "python")).toBeNull();
  });
});
