import { describe, it, expect } from "vitest";
import { isAllowedUserAvatarPath, USER_AVATAR_PATHS } from "@/lib/user-avatars";

describe("isAllowedUserAvatarPath", () => {
  it("allows listed paths", () => {
    expect(isAllowedUserAvatarPath(USER_AVATAR_PATHS[0])).toBe(true);
  });

  it("rejects arbitrary paths", () => {
    expect(isAllowedUserAvatarPath("/evil.png")).toBe(false);
    expect(isAllowedUserAvatarPath("/user/fake.png")).toBe(false);
  });
});
