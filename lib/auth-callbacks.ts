import type { JWT } from "next-auth/jwt";
import type { Session, User } from "next-auth";

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
    const u = user as { role?: string; image?: string | null; rememberMe?: boolean };
    if (typeof u.role === "string") {
      token.role = u.role;
    }
    if (typeof u.image === "string") {
      token.picture = u.image;
    }
    const rememberMe = u.rememberMe ?? false;
    token.exp = rememberMe
      ? Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60
      : Math.floor(Date.now() / 1000) + 24 * 60 * 60;
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
