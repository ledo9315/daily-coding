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
    expect(isAllowedUserAvatarPath(starterAvatarPath("Max Mustermann"))).toBe(true);
  });

  it("returns the same avatar for the same seed", () => {
    expect(starterAvatarPath("Max Mustermann")).toBe(starterAvatarPath("Max Mustermann"));
  });

  it("spreads different seeds across the set", () => {
    const seeds = Array.from({ length: 60 }, (_, i) => `User ${i}`);
    const distinct = new Set(seeds.map(starterAvatarPath));
    // Not a uniformity claim — just that it is not one avatar for everybody, which is
    // the whole reason for deriving it (#101).
    expect(distinct.size).toBeGreaterThan(USER_AVATAR_PATHS.length / 2);
  });

  it("ignores case, so the same name cannot yield two avatars", () => {
    expect(starterAvatarPath("Max Mustermann")).toBe(starterAvatarPath("max mustermann"));
  });

  it("still returns a valid path for an empty seed", () => {
    expect(isAllowedUserAvatarPath(starterAvatarPath(""))).toBe(true);
  });
});

describe("avatar paths written by the seed", () => {
  /**
   * The seed used to spell out paths like "/user/chibi1.png". Replacing the avatar set
   * updated the allow-list but not those literals, so a seed kept writing references to
   * files that no longer exist — 11 of 14 users ended up with a 404 as their avatar (#103).
   *
   * ponytail: reads the seed as text instead of importing it. `prisma/seed.ts` calls
   * `main()` at import time and connects to a database; a regex over the source is what
   * makes the guard possible at all.
   */
  it("only uses paths that are in the allow-list", () => {
    const source = readFileSync(resolve(process.cwd(), "prisma", "seed.ts"), "utf8");
    const referenced = [...source.matchAll(/["'](\/user\/[^"']+)["']/g)].map((m) => m[1]);

    const unknown = referenced.filter((p) => !isAllowedUserAvatarPath(p));
    expect(unknown, `seed references avatars that do not exist: ${unknown.join(", ")}`).toEqual(
      []
    );
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
