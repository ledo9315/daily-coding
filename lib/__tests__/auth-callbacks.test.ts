import { describe, it, expect } from "vitest";
import type { JWT } from "next-auth/jwt";
import type { Session } from "next-auth";
import { authJwtCallback, authSessionCallback } from "@/lib/auth-callbacks";

describe("authJwtCallback", () => {
  it("copies user.id onto token when user is present", () => {
    const token = {} as JWT;
    const out = authJwtCallback({
      token,
      user: { id: "uid-1", name: "N", email: "e@e.de" },
    });
    expect(out.id).toBe("uid-1");
  });

  it("returns token unchanged when user is absent", () => {
    const token = { id: "existing" } as JWT;
    const out = authJwtCallback({ token, user: undefined });
    expect(out).toBe(token);
    expect(out.id).toBe("existing");
  });
});

describe("authSessionCallback", () => {
  it("sets session.user.id from token.id", () => {
    const session = {
      user: { name: "N", email: "e@e.de", image: null },
    } as Session;
    const token = { id: "jwt-user" } as JWT;
    const out = authSessionCallback({ session, token });
    expect(out.user.id).toBe("jwt-user");
  });

  it("leaves session user id unset when token has no id", () => {
    const session = {
      user: { name: "N", email: "e@e.de", id: "old" },
    } as Session;
    const token = {} as JWT;
    const out = authSessionCallback({ session, token });
    expect(out.user.id).toBe("old");
  });
});
