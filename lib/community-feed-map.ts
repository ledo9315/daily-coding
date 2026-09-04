import type { CommunityFeedItem } from "@/lib/api";
import type { FeedItemProps } from "@/components/feed-item";
import { avatarImageSrc } from "@/lib/avatar-src";

/**
 * The `community` namespace translator, narrowed to the four keys this module asks of it.
 *
 * Spelled out rather than taken from next-intl, and narrow on purpose: `useTranslations`
 * types its key as `string` while `createTranslator` over a concrete catalogue types it as
 * that catalogue's key union, and only a parameter narrower than both accepts either. So
 * the feed can pass its hook and a test can pass a translator built from the message files.
 */
export type FeedTextTranslator = (
  key:
    | "feed.solvedTitle"
    | "feed.solvedDescription"
    | "feed.levelUpTitle"
    | "feed.levelUpDescription",
  values?: Record<string, string | number>
) => string;

export function communityFeedItemToFeedItem(
  item: CommunityFeedItem,
  t: FeedTextTranslator
): FeedItemProps {
  const baseUser = {
    name: item.user.name,
    username: item.username,
    avatar: avatarImageSrc(item.user.avatar) ?? "",
    initials: item.user.initials,
  };

  if (item.levelUp) {
    const { previousLevel, newLevel } = item.levelUp;

    return {
      user: baseUser,
      event: {
        type: "level-up",
        title: t("feed.levelUpTitle"),
        description: t("feed.levelUpDescription", {
          challenge: item.challenge,
          points: item.points,
          previousLevel,
          newLevel,
        }),
        timestamp: item.time,
        level: item.user.level,
      },
    };
  }

  return {
    user: baseUser,
    event: {
      type: "challenge-solved",
      title: t("feed.solvedTitle"),
      description: t("feed.solvedDescription", {
        challenge: item.challenge,
        points: item.points,
      }),
      timestamp: item.time,
      level: item.user.level,
    },
  };
}
