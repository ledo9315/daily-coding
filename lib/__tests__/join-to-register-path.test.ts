import { describe, expect, it } from "vitest";
import { joinSearchParamsToRegisterPath } from "@/lib/join-to-register-path";

describe("joinSearchParamsToRegisterPath", () => {
  it("returns /register without query when empty", () => {
    expect(joinSearchParamsToRegisterPath({})).toBe("/register");
  });

  it("preserves token for invite links", () => {
    expect(joinSearchParamsToRegisterPath({ token: "abc" })).toBe(
      "/register?token=abc",
    );
  });

  it("passes through multiple params", () => {
    expect(
      joinSearchParamsToRegisterPath({ token: "x", ref: "landing" }),
    ).toBe("/register?token=x&ref=landing");
  });
});
