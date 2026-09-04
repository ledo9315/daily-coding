import type { JWT } from "next-auth/jwt";
import type { Session, User } from "next-auth";
import { DEFAULT_LOCALE, isAppLocale } from "@/lib/locale";

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
    const u = user as {
      role?: string;
      image?: string | null;
      rememberMe?: boolean;
      locale?: string;
    };
    if (typeof u.role === "string") {
      token.role = u.role;
    }
    if (isAppLocale(u.locale)) {
      token.locale = u.locale;
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
    const s = session as { user?: { image?: string | null; locale?: unknown } };
    if (s.user && "image" in s.user) {
      const img = s.user.image;
      if (typeof img === "string") {
        token.picture = img;
      }
    }
    // Without this the token keeps the old language for up to 30 days, and `proxy.ts`
    // would keep resetting the cookie to it after every switch.
    if (s.user && isAppLocale(s.user.locale)) {
      token.locale = s.user.locale;
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
  session.user.locale = isAppLocale(token.locale) ? token.locale : DEFAULT_LOCALE;
  return session;
}

/**
 * True for every external provider - Google is "oidc", GitHub is "oauth".
 * Deliberately written as "not credentials" rather than a list of known types:
 * checking for a single type had silently missed Google logins.
 * A type guard, so `account` counts as defined in the branch that follows.
 */
export function isFederatedAccount<T extends { type?: string }>(
  account: T | null | undefined
): account is T {
  return account != null && account.type !== "credentials";
}
