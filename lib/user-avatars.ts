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
 * Callers pass the email address, not the user id: Prisma assigns the id during the
 * insert, so an id-based derivation would need a second write. The result is stored, so
 * this runs exactly once per user and a later email change does not move the avatar.
 *
 * ponytail: FNV-1a, not a crypto hash. Nothing here needs to resist an attacker — it
 * only needs to spread evenly and give the same answer twice.
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
