import type { Prisma } from "../lib/generated/prisma/client";

/** A seeded challenge — same shape as `create`, with the id spelled out rather than generated. */
export type ChallengeSeed = Prisma.ChallengeUncheckedCreateInput & { id: string };

/**
 * Upsert arguments derived from one payload, so `update` cannot drift from `create`.
 *
 * The seed used to hand-write `update: { ...xFields }` per challenge, listing only the
 * mechanical fields. Prose — title, description, hint, examples — sat in `create` alone, so a
 * re-seed left existing rows untouched and every challenge kept the text it was born with.
 *
 * `isActive` and `date` are deliberately not updated: those are set in the admin UI, and `date`
 * is unique, so writing it back against a fresh anchor would collide with a sibling row.
 */
export function challengeUpsertArgs(data: ChallengeSeed) {
  const { id, isActive: _isActive, date: _date, ...refreshable } = data;
  return { where: { id }, create: data, update: refreshable };
}
