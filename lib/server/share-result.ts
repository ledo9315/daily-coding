import { getTranslations } from "next-intl/server";
import { formatDate } from "@/lib/format";
import { SHARE_WEEK_DAYS, shareResultText } from "@/lib/share-result";
import { completedDayKeys } from "@/lib/server/streak";
import { startOfUtcDay } from "@/lib/server/ranking-period";
import {
  completedWeekStrip,
  consecutiveStreakFromCompletedDaySet,
} from "@/lib/streak-days";
import { SITE_URL, localizedPath } from "@/lib/site";

export interface ShareResultParams {
  userId: string;
  /** The submission's own timestamp, not the current one - see below. */
  submittedAt: Date;
  challengeTitle: string;
  difficulty: "easy" | "medium" | "hard";
  locale: string;
}

/**
 * The finished block for one result page, rendered on the server.
 *
 * Everything is measured against the day of the submission rather than against today. The
 * ring repeats, so a result page can be opened weeks later; a strip ending today under a
 * streak counted today would describe a session the reader never had.
 *
 * The client component receives the string and nothing else: what it shows is then the
 * same text it copies, and there is no second implementation of the format to keep in
 * step.
 */
export async function buildShareResultText({
  userId,
  submittedAt,
  challengeTitle,
  difficulty,
  locale,
}: ShareResultParams): Promise<string> {
  const t = await getTranslations({ locale, namespace: "challenge" });
  const day = startOfUtcDay(submittedAt);
  const completed = await completedDayKeys(userId, submittedAt);

  return shareResultText({
    challengeTitle,
    difficultyLabel: t(`difficulty.${difficulty}`),
    dateLabel: formatDate(submittedAt, locale),
    days: completedWeekStrip(day, completed, SHARE_WEEK_DAYS),
    streakLabel: t("share.streak", {
      count: consecutiveStreakFromCompletedDaySet(day, completed),
    }),
    // Absolute, and pointing at the task: the block travels to readers who have no session
    // and no cookie, and a relative path in a chat message is not a link at all.
    url: `${SITE_URL}${localizedPath("/challenge", locale)}`,
  });
}
