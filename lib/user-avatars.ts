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
