import type { JWT } from "next-auth/jwt";
import type { Session, User } from "next-auth";

/**
 * NextAuth JWT callback (unit-tested).
 */
export function authJwtCallback({
  token,
  user,
}: {
  token: JWT;
  user?: User | null;
}): JWT {
  if (user) {
    token.id = user.id;
    const u = user as { role?: string };
    if (typeof u.role === "string") {
      token.role = u.role;
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
  session.user.role =
    typeof token.role === "string" && (token.role === "admin" || token.role === "user")
      ? token.role
      : "user";
  return session;
}
