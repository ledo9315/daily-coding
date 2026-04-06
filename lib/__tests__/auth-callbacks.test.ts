import { describe, it, expect } from "vitest";
import type { JWT } from "next-auth/jwt";
import type { Session } from "next-auth";
import { authJwtCallback, authSessionCallback } from "@/lib/auth-callbacks";

describe("authJwtCallback", () => {
  it("copies user.id onto token when user is present", () => {
    const token = {} as JWT;
    const out = authJwtCallback({
      token,
      user: { id: "uid-1", name: "N", email: "e@e.de", role: "admin" },
    });
    expect(out.id).toBe("uid-1");
    expect(out.role).toBe("admin");
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
      user: { name: "N", email: "e@e.de", image: null, role: "user" as const },
    } as Session;
    const token = { id: "jwt-user", role: "admin" } as JWT;
    const out = authSessionCallback({ session, token });
    expect(out.user.id).toBe("jwt-user");
    expect(out.user.role).toBe("admin");
  });

  it("leaves session user id unset when token has no id", () => {
    const session = {
      user: { name: "N", email: "e@e.de", id: "old", role: "user" as const },
    } as Session;
    const token = {} as JWT;
    const out = authSessionCallback({ session, token });
    expect(out.user.id).toBe("old");
    expect(out.user.role).toBe("user");
  });
});
