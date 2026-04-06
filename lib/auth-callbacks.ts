import type { JWT } from "next-auth/jwt";
import type { Session, User } from "next-auth";

/**
 * NextAuth JWT callback (unit-tested).
 */
export function authJwtCallback({
  token,
  user,
  trigger,
  session,
}: {
  token: JWT;
  user?: User | null;
  trigger?: "signIn" | "signUp" | "update";
  session?: unknown;
}): JWT {
  if (user) {
    token.id = user.id;
    const u = user as { role?: string; image?: string | null };
    if (typeof u.role === "string") {
      token.role = u.role;
    }
    if (typeof u.image === "string") {
      token.picture = u.image;
    }
  }
  if (trigger === "update" && session && typeof session === "object") {
    const s = session as { user?: { image?: string | null } };
    if (s.user && "image" in s.user) {
      const img = s.user.image;
      if (typeof img === "string") {
        token.picture = img;
      }
    }
  }
  return token;
}

/**
 * NextAuth session callback (unit-tested).
 */
export function authSessionCallback({
  session,
  token,
}: {
  session: Session;
  token: JWT;
}): Session {
  if (token.id) {
    session.user.id = token.id as string;
  }
  if (typeof token.picture === "string") {
    session.user.image = token.picture;
  }
  session.user.role =
    typeof token.role === "string" && (token.role === "admin" || token.role === "user")
      ? token.role
      : "user";
  return session;
}
