import { describe, it, expect, beforeEach } from "vitest";

import {
  clearHeaderStats,
  readHeaderStats,
  writeHeaderStats,
} from "@/lib/header-stats-cache";

/**
 * #42: <Header /> is rendered per page instead of in a shared layout, so every
 * navigation remounts it and its state restarts at null, so the streak flashed a
 * placeholder until /api/user/stats answered. The cache keeps the last known values
 * across that remount.
 */
describe("header stats cache", () => {
  beforeEach(() => {
    clearHeaderStats();
  });

  it("starts empty, so the first ever load still shows the honest dash", () => {
    expect(readHeaderStats()).toEqual({
      userId: null,
      streak: null,
      level: null,
      isAdmin: false,
    });
  });

  it("returns what was written, which survives a remount", () => {
    writeHeaderStats("u-1", { streak: 7, level: 3 });

    expect(readHeaderStats()).toMatchObject({ userId: "u-1", streak: 7, level: 3 });
  });

  it("merges partial writes instead of dropping the other values", () => {
    writeHeaderStats("u-1", { streak: 7, level: 3 });
    writeHeaderStats("u-1", { isAdmin: true });

    expect(readHeaderStats()).toMatchObject({ streak: 7, level: 3, isAdmin: true });
  });

  it("keeps a streak of 0 rather than treating it as absent", () => {
    writeHeaderStats("u-1", { streak: 0 });

    expect(readHeaderStats().streak).toBe(0);
  });

  it("drops everything for a different user, so nobody inherits the previous numbers", () => {
    writeHeaderStats("u-1", { streak: 7, level: 3, isAdmin: true });
    writeHeaderStats("u-2", { streak: 1 });

    expect(readHeaderStats()).toEqual({
      userId: "u-2",
      streak: 1,
      level: null,
      isAdmin: false,
    });
  });

  it("is emptied on sign-out", () => {
    writeHeaderStats("u-1", { streak: 7, level: 3, isAdmin: true });
    clearHeaderStats();

    expect(readHeaderStats()).toEqual({
      userId: null,
      streak: null,
      level: null,
      isAdmin: false,
    });
  });
});
