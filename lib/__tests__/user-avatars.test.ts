import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import {
  isAllowedUserAvatarPath,
  starterAvatarPath,
  USER_AVATAR_PATHS,
} from "@/lib/user-avatars";

/** Width and height from the PNG header — bytes 16..24, no decoding needed. */
function pngSize(file: string): { width: number; height: number } {
  const head = readFileSync(file).subarray(0, 24);
  return { width: head.readUInt32BE(16), height: head.readUInt32BE(20) };
}

const MAX_EDGE = 256;

describe("isAllowedUserAvatarPath", () => {
  it("allows listed paths", () => {
    expect(isAllowedUserAvatarPath(USER_AVATAR_PATHS[0])).toBe(true);
  });

  it("rejects arbitrary paths", () => {
    expect(isAllowedUserAvatarPath("/evil.png")).toBe(false);
    expect(isAllowedUserAvatarPath("/user/fake.png")).toBe(false);
  });
});

describe("starterAvatarPath", () => {
  it("returns a path from the list", () => {
    expect(isAllowedUserAvatarPath(starterAvatarPath("max@example.com"))).toBe(true);
  });

  it("returns the same avatar for the same seed", () => {
    expect(starterAvatarPath("max@example.com")).toBe(starterAvatarPath("max@example.com"));
  });

  it("spreads different seeds across the set", () => {
    const seeds = Array.from({ length: 60 }, (_, i) => `user${i}@example.com`);
    const distinct = new Set(seeds.map(starterAvatarPath));
    // Not a uniformity claim — just that it is not one avatar for everybody, which is
    // the whole reason for deriving it (#101).
    expect(distinct.size).toBeGreaterThan(USER_AVATAR_PATHS.length / 2);
  });

  it("ignores case, so the same address cannot yield two avatars", () => {
    expect(starterAvatarPath("Max@Example.com")).toBe(starterAvatarPath("max@example.com"));
  });

  it("still returns a valid path for an empty seed", () => {
    expect(isAllowedUserAvatarPath(starterAvatarPath(""))).toBe(true);
  });
});

describe("the avatar files themselves", () => {
  it.each([...USER_AVATAR_PATHS])("%s exists and is at most 256px", (path) => {
    const file = resolve(process.cwd(), "public", path.replace(/^\//, ""));
    expect(existsSync(file), `${path} is registered but missing`).toBe(true);

    /**
     * They arrived as 1024x1024 at ~1.5 MB each, 29 MB for the set, and the picker
     * renders all of them at once at roughly 64px (#99). The guard is on the header, so
     * it costs no decoding.
     */
    const { width, height } = pngSize(file);
    expect(width).toBeLessThanOrEqual(MAX_EDGE);
    expect(height).toBeLessThanOrEqual(MAX_EDGE);
  });
});
