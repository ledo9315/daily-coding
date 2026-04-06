import type { CommunityFeedItem } from "@/lib/api";
import type { FeedItemProps } from "@/components/feed-item";
import { avatarImageSrc } from "@/lib/avatar-src";

/**
 * Mappt API-Zeilen auf FeedItem. Level-Aufstieg nutzt später dieselbe Beschreibung
 * mit Klammern (Stufenname) wie in `levelUpSentenceDe`.
 */
export function communityFeedItemToFeedItem(item: CommunityFeedItem): FeedItemProps {
  return {
    user: {
      name: item.user.name,
      username: item.username,
      avatar: avatarImageSrc(item.user.avatar) ?? "",
      initials: item.user.initials,
    },
    event: {
      type: "challenge-solved",
      title: "Challenge gelöst",
      description: `hat die Challenge „${item.challenge}“ gelöst (+${item.points} Punkte)`,
      timestamp: item.time,
      level: item.user.level,
    },
  };
}
