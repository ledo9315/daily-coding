import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Signs a user id so the unsubscribe link in a reminder mail works without a login.
 *
 * `AUTH_SECRET` rather than a secret of its own: it is already required for the session,
 * so this adds nothing to configure - and rotating it invalidates old links, which for an
 * unsubscribe is the harmless direction. The purpose is part of the message, so a token
 * from here can never be replayed against another signature we might add later.
 */
function signingSecret(): string {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not configured");
  return secret;
}

export function reminderToken(userId: string): string {
  return createHmac("sha256", signingSecret())
    .update(`daily-reminder:${userId}`)
    .digest("hex");
}

export function isValidReminderToken(userId: string, token: string): boolean {
  const expected = Buffer.from(reminderToken(userId), "utf8");
  const given = Buffer.from(token, "utf8");
  // `timingSafeEqual` throws on a length mismatch, and the length of a hex digest is
  // public anyway - the comparison that has to stay constant-time is the one below.
  return expected.length === given.length && timingSafeEqual(expected, given);
}

/** The signed opt-out link of a reminder mail, app-relative. */
export function unsubscribePath(userId: string): string {
  const params = new URLSearchParams({ u: userId, t: reminderToken(userId) });
  return `/unsubscribe?${params.toString()}`;
}
