import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { nameKeyOf } from "@/lib/display-name";
import { calculateLevel } from "@/lib/level";
import { formatDate } from "@/lib/format";
import { buildUserAchievementsView } from "@/lib/server/achievements";
import { buildMonthlyActivityGrid } from "@/lib/monthly-activity";
import { utcDayKey } from "@/lib/streak-days";
import type { Achievement, MonthlyActivity } from "@/lib/api";

export type PublicProfile = {
  name: string;
  initials: string;
  avatar: string;
  level: number;
  points: number;
  streak: number;
  streakRecord: number;
  totalSolved: number;
  /** Month and year the account was created, e.g. "Sep. 2026". */
  memberSince: string;
  /** Date of the most recent completed submission; null for an account that never solved one. */
  lastSolvedAt: string | null;
  /** Unlocked achievements only — a stranger has no use for someone else's progress bars. */
  achievements: Achievement[];
  badgesTotal: number;
  monthlyActivity: MonthlyActivity;
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
 * `getUserProfileData` is not reusable here, it loads the full row via `include` and adds
 * the challenge history, which is the one block that would expose failed and skipped
 * attempts — the feed shows completions only (#194).
 *
 * `nameKeyOf` is idempotent, so both the stored key and the displayed name work as handle.
 *
 * `cache` because the page calls this twice per request, once in `generateMetadata` and
 * once in the component.
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
      createdAt: true,
    },
  });
  if (!user) return null;

  /**
   * One query for every number on the page: points, the solved count, the last solve and
   * the activity grid all come from these rows, and the achievements are derived from
   * them too.
   */
  const [completed, achievementDefs, userAchievements] = await Promise.all([
    prisma.submission.findMany({
      where: { userId: user.id, status: "completed" },
      orderBy: { createdAt: "desc" },
      select: {
        createdAt: true,
        language: true,
        challenge: { select: { points: true, difficulty: true } },
      },
    }),
    prisma.achievementDef.findMany({ orderBy: { id: "asc" } }),
    prisma.userAchievement.findMany({ where: { userId: user.id } }),
  ]);

  const points = completed.reduce((sum, s) => sum + s.challenge.points, 0);
  const now = new Date();
  const { achievements } = buildUserAchievementsView(
    achievementDefs,
    userAchievements,
    completed,
    user.streakRecord
  );

  return {
    name: user.name,
    initials: user.initials,
    avatar: user.avatar,
    level: calculateLevel(points),
    points,
    streak: user.streak,
    streakRecord: user.streakRecord,
    totalSolved: completed.length,
    memberSince: user.createdAt.toLocaleDateString("de-DE", {
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }),
    lastSolvedAt: completed[0] ? formatDate(completed[0].createdAt) : null,
    achievements: achievements.filter((achievement) => achievement.unlocked),
    badgesTotal: achievementDefs.length,
    monthlyActivity: buildMonthlyActivityGrid(
      now,
      new Set(completed.map((s) => utcDayKey(s.createdAt)))
    ),
  };
});
