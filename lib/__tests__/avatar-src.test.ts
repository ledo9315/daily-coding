import { describe, it, expect } from "vitest";
import { avatarImageSrc } from "@/lib/avatar-src";

describe("avatarImageSrc", () => {
  it("returns undefined for empty and placeholder", () => {
    expect(avatarImageSrc(undefined)).toBeUndefined();
    expect(avatarImageSrc("")).toBeUndefined();
    expect(avatarImageSrc("  ")).toBeUndefined();
    expect(avatarImageSrc("/placeholder.svg")).toBeUndefined();
  });

  it("returns undefined for emoji / non-url text", () => {
    expect(avatarImageSrc("🐱")).toBeUndefined();
  });

  it("returns path and absolute URLs", () => {
    expect(avatarImageSrc("/user/x.png")).toBe("/user/x.png");
    expect(avatarImageSrc("https://x.com/a.png")).toBe("https://x.com/a.png");
    expect(avatarImageSrc("data:image/png;base64,xx")).toBe("data:image/png;base64,xx");
  });
});
