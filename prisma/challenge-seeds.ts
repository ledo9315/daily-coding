import type { ChallengeSeed } from "./challenge-upsert";
import challenges from "./challenges.json";

/**
 * The challenge content, in ring order.
 *
 * Challenges are written in the admin UI, so the database - not this repository - is where they
 * come into being. `scripts/export-challenges.ts` writes them back here; without that round
 * trip they exist in a single database and nowhere else, which is how 25 of these 40 came to be
 * missing from production while `db:reset` would have deleted them locally (#276).
 *
 * Content only, deliberately. `isActive`, `position` and `date` describe what an instance does
 * with a challenge, not what the challenge is - the seed derives them, the same distinction
 * `challengeUpsertArgs` draws for updates.
 *
 * The cast is the price of `resolveJsonModule`: JSON widens `difficulty` to `string` and
 * `supportedLanguages` to `string[]`, and the JSON columns to `unknown`. Nothing checks the
 * shape at compile time, so `__tests__/challenge-seeds.test.ts` does it at test time.
 */
export const CHALLENGE_SEEDS = challenges as unknown as ChallengeSeed[];

const duplicates = CHALLENGE_SEEDS.map((c) => c.id).filter(
  (id, i, all) => all.indexOf(id) !== i
);
if (duplicates.length > 0) {
  throw new Error(`Doppelte Challenge-IDs in challenges.json: ${duplicates.join(", ")}`);
}
