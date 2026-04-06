/**
 * Vordefinierte Pixel-Avatare unter `public/user/`.
 * Nur diese Pfade sind per API setzbar (kein Freitext).
 */
export const USER_AVATAR_PATHS = [
  "/user/chibi1.png",
  "/user/chibi2.png",
  "/user/chibi3.png",
  "/user/minipix2.png",
  "/user/minipix4.png",
  "/user/minipix5.png",
  "/user/minipix6.png",
  "/user/pony2.png",
  "/user/pony3.png",
  "/user/pony4.png",
  "/user/guy1.png",
] as const;

export type UserAvatarPath = (typeof USER_AVATAR_PATHS)[number];

const ALLOWED = new Set<string>(USER_AVATAR_PATHS);

export function isAllowedUserAvatarPath(path: string): path is UserAvatarPath {
  return ALLOWED.has(path);
}
