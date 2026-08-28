import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { nameKeyOf } from "@/lib/display-name";
import { calculateLevel } from "@/lib/level";
import { getLifetimePointsByUserIds } from "@/lib/server/user-points";

export type PublicProfile = {
  name: string;
  initials: string;
  avatar: string;
  level: number;
  streak: number;
  streakRecord: number;
  totalSolved: number;
};

/**
 * Next hands the route segment to the page component still percent-encoded, so
 * "Anna Schmidt" arrives as `anna%20schmidt` and matches no `nameKey`. `generateMetadata`
 * gets it decoded, which made the page answer 404 while its own title said otherwise.
 */
function decodeHandle(handle: string): string {
  try {
    return decodeURIComponent(handle);
  } catch {
    // A display name may contain a literal "%", which is not a valid escape sequence.
    return handle;
  }
}

/**
 * The read model behind the public profile page — the security boundary for #34.
 *
 * `select` is the whole point: it never widens to `email`, `passwordHash` or `role`, and
 * the return value is built field by field so a later column on `User` cannot ride along.
 * `getUserProfileData` is not reusable here, it loads the full row via `include`.
 *
 * `nameKeyOf` is idempotent, so both the stored key and the displayed name work as handle.
 *
 * `cache` because the page calls this twice per request, once in `generateMetadata` and
 * once in the component, and each call is three round-trips.
 */
export const getPublicProfile = cache(async (
  handle: string
): Promise<PublicProfile | null> => {
  const user = await prisma.user.findUnique({
    where: { nameKey: nameKeyOf(decodeHandle(handle)) },
    select: {
      id: true,
      name: true,
      initials: true,
      avatar: true,
      streak: true,
      streakRecord: true,
    },
  });
  if (!user) return null;

  const [points, totalSolved] = await Promise.all([
    getLifetimePointsByUserIds([user.id]).then((m) => m.get(user.id)),
    prisma.submission.count({ where: { userId: user.id, status: "completed" } }),
  ]);

  return {
    name: user.name,
    initials: user.initials,
    avatar: user.avatar,
    level: calculateLevel(points ?? 0),
    streak: user.streak,
    streakRecord: user.streakRecord,
    totalSolved,
  };
});
