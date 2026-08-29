import { describe, expect, it } from "vitest";

import {
  storeResultHandover,
  takeResultHandover,
  type ChallengeResultHandover,
} from "@/lib/challenge-result-handover";

function memoryStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    data,
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
    removeItem: (key: string) => void data.delete(key),
  };
}

const payload: ChallengeResultHandover = {
  unlockedAchievements: [
    { id: "a1", title: "Blitzschnell", description: "Unter einer Minute" },
  ],
};

describe("challenge result handover", () => {
  it("returns the stored payload", () => {
    const storage = memoryStorage();
    storeResultHandover(storage, "sub-1", payload);

    expect(takeResultHandover(storage, "sub-1")).toEqual(payload);
  });

  it("returns null on a second take", () => {
    const storage = memoryStorage();
    storeResultHandover(storage, "sub-1", payload);
    takeResultHandover(storage, "sub-1");

    expect(takeResultHandover(storage, "sub-1")).toBeNull();
    expect(storage.data.size).toBe(0);
  });

  it("returns null for broken JSON and still drops the key", () => {
    const storage = memoryStorage();
    storeResultHandover(storage, "sub-1", payload);
    const key = [...storage.data.keys()][0];
    storage.data.set(key, "{not json");

    expect(takeResultHandover(storage, "sub-1")).toBeNull();
    expect(storage.data.size).toBe(0);
  });

  it("returns null for valid JSON that is not a handover", () => {
    const storage = memoryStorage();
    storeResultHandover(storage, "sub-1", payload);
    const key = [...storage.data.keys()][0];
    storage.data.set(key, "42");

    expect(takeResultHandover(storage, "sub-1")).toBeNull();
  });

  it("swallows errors from a throwing storage", () => {
    const throwing = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
      removeItem: () => {
        throw new Error("blocked");
      },
    };

    expect(() => storeResultHandover(throwing, "sub-1", payload)).not.toThrow();
    expect(takeResultHandover(throwing, "sub-1")).toBeNull();
  });

  it("keeps submissions apart", () => {
    const storage = memoryStorage();
    const other: ChallengeResultHandover = { unlockedAchievements: [] };
    storeResultHandover(storage, "sub-1", payload);
    storeResultHandover(storage, "sub-2", other);

    expect(takeResultHandover(storage, "sub-1")).toEqual(payload);
    expect(takeResultHandover(storage, "sub-2")).toEqual(other);
  });
});
