import type { Prisma } from "../lib/generated/prisma/client";

/** A seeded challenge — same shape as `create`, with the id spelled out rather than generated. */
export type ChallengeSeed = Prisma.ChallengeUncheckedCreateInput & { id: string };

/**
 * Upsert arguments derived from one payload, so `update` cannot drift from `create`.
 *
 * The seed used to hand-write `update: { ...xFields }` per challenge, listing only the
 * mechanical fields. Prose — title, description, hints, examples — sat in `create` alone, so a
 * re-seed left existing rows untouched and every challenge kept the text it was born with.
 *
 * `isActive`, `position` and `date` are deliberately not updated: those are operational state
 * set in the admin UI. `position` in particular is the order of the daily ring — refreshing the
 * prose of a challenge must not throw away a schedule someone arranged by hand.
 */
export function challengeUpsertArgs(data: ChallengeSeed) {
  const {
    id,
    isActive: _isActive,
    date: _date,
    position: _position,
    ...refreshable
  } = data;
  return { where: { id }, create: data, update: refreshable };
}
