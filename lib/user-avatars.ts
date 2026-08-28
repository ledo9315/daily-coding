/**
 * Predefined pixel avatars under `public/user/`.
 * Only these paths can be set through the API — no free-form values.
 */
export const USER_AVATAR_PATHS = [
  "/user/gpt.png",
  "/user/mike.png",
  "/user/christine.png",
  "/user/alex.png",
  "/user/isabella.png",
  "/user/steve.png",
  "/user/jessica.png",
  "/user/nancy.png",
  "/user/nelly.png",
  "/user/ben.png",
  "/user/bruno.png",
  "/user/sophie.png",
  "/user/elena.png",
  "/user/jordan.png",
  "/user/stella.png",
  "/user/anna.png",
  "/user/lili.png",
  "/user/rex.png",
  "/user/hopper.png",
  "/user/tom.png",
] as const;

export type UserAvatarPath = (typeof USER_AVATAR_PATHS)[number];

const ALLOWED = new Set<string>(USER_AVATAR_PATHS);

export function isAllowedUserAvatarPath(path: string): path is UserAvatarPath {
  return ALLOWED.has(path);
}

/**
 * The avatar a new user starts with, derived from `seed` so that two people rarely get
 * the same one. Both registration paths used to store an empty avatar, which left the
 * ranking and the feed showing bare initials next to picked avatars (#101).
 *
 * **The seed has to be public.** The result is rendered in the feed, in the ranking and
 * on the public profile page, so anyone can read it and invert the hash over a guess.
 * Seeded from the email address, as it was until #34, that turned a guessed address into
 * a testable claim. The display name is shown next to the picture anyway, and it carries
 * the unique constraint (#107), so it spreads exactly as well.
 *
 * ponytail: FNV-1a, not a crypto hash. It does not have to resist an attacker as long as
 * the seed is public — it only needs to spread evenly and give the same answer twice.
 */
export function starterAvatarPath(seed: string): UserAvatarPath {
  let hash = 2166136261;
  const normalised = seed.trim().toLowerCase();
  for (let i = 0; i < normalised.length; i++) {
    hash ^= normalised.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return USER_AVATAR_PATHS[(hash >>> 0) % USER_AVATAR_PATHS.length];
}
