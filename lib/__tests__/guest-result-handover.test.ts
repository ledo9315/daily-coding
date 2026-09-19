import { describe, expect, it } from "vitest";
import {
  clearGuestResult,
  readGuestResult,
  storeGuestResult,
  takeGuestArrival,
  type GuestResultHandover,
} from "@/lib/guest-result-handover";

function memoryStorage() {
  const map = new Map<string, string>();
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => void map.set(key, value),
    removeItem: (key: string) => void map.delete(key),
    raw: map,
  };
}

const payload: GuestResultHandover = {
  challengeId: "ch-1",
  title: "Two Sum",
  category: "Algorithmen",
  difficulty: "easy",
  points: 100,
  language: "javascript",
  passed: true,
  testCases: [],
};

describe("guest result handover", () => {
  it("hands the whole result over, because no row backs it", () => {
    const storage = memoryStorage();
    storeGuestResult(storage, payload);

    expect(readGuestResult(storage)).toEqual(payload);
  });

  /** The page *is* the payload, so a reload has to find it again. */
  it("survives being read twice", () => {
    const storage = memoryStorage();
    storeGuestResult(storage, payload);

    readGuestResult(storage);
    expect(readGuestResult(storage)).toEqual(payload);
  });

  it("keeps a compile error when there is one", () => {
    const storage = memoryStorage();
    storeGuestResult(storage, { ...payload, passed: false, compileError: "boom" });

    expect(readGuestResult(storage)?.compileError).toBe("boom");
  });

  it("reports nothing when nothing was stored", () => {
    expect(readGuestResult(memoryStorage())).toBeNull();
  });

  it("forgets on request", () => {
    const storage = memoryStorage();
    storeGuestResult(storage, payload);
    clearGuestResult(storage);

    expect(readGuestResult(storage)).toBeNull();
  });

  /**
   * The store belongs to the reader and can be edited by hand. The page prints the title
   * and maps over the test cases, so anything misshapen counts as no result rather than
   * as a half one.
   */
  it.each([
    ["not JSON at all", "{{{"],
    ["an empty object", "{}"],
    ["test cases that are not a list", JSON.stringify({ ...payload, testCases: "all" })],
    ["a difficulty outside the three", JSON.stringify({ ...payload, difficulty: "epic" })],
    ["a missing title", JSON.stringify({ ...payload, title: undefined })],
    ["points as text", JSON.stringify({ ...payload, points: "100" })],
  ])("treats %s as no result", (_case, stored) => {
    const storage = memoryStorage();
    storage.raw.set("guest-result", stored);

    expect(readGuestResult(storage)).toBeNull();
  });

  /** Private mode and blocked site data make every access throw. */
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
    };

    expect(() => storeGuestResult(throwing, payload)).not.toThrow();
    expect(() => clearGuestResult(throwing)).not.toThrow();
    expect(readGuestResult(throwing)).toBeNull();
  });
});

/**
 * The confetti fires from this marker. The payload itself has to survive a reload - it is
 * the page - so "this just happened" needs a key of its own, or a refresh would celebrate
 * the same solve again.
 */
describe("the guest arrival marker", () => {
  it("is set by storing a result", () => {
    const storage = memoryStorage();
    storeGuestResult(storage, payload);

    expect(takeGuestArrival(storage)).toBe(true);
  });

  it("is spent on the first read, so a reload stays quiet", () => {
    const storage = memoryStorage();
    storeGuestResult(storage, payload);

    takeGuestArrival(storage);
    expect(takeGuestArrival(storage)).toBe(false);
  });

  it("reports nothing when no result was stored", () => {
    expect(takeGuestArrival(memoryStorage())).toBe(false);
  });

  /** A second submission is a second arrival. */
  it("comes back for the next result", () => {
    const storage = memoryStorage();
    storeGuestResult(storage, payload);
    takeGuestArrival(storage);

    storeGuestResult(storage, { ...payload, passed: false });
    expect(takeGuestArrival(storage)).toBe(true);
  });

  it("goes away with the result it belongs to", () => {
    const storage = memoryStorage();
    storeGuestResult(storage, payload);
    clearGuestResult(storage);

    expect(takeGuestArrival(storage)).toBe(false);
  });

  it("stays quiet when the storage refuses", () => {
    expect(
      takeGuestArrival({
        getItem: () => {
          throw new Error("denied");
        },
        setItem: () => {},
        removeItem: () => {},
      })
    ).toBe(false);
  });
});
