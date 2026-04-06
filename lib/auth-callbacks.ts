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
  return session;
}
