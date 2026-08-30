import type { CommunityFeedItem } from "@/lib/api";
import type { FeedItemProps } from "@/components/feed-item";
import { avatarImageSrc } from "@/lib/avatar-src";

export function communityFeedItemToFeedItem(item: CommunityFeedItem): FeedItemProps {
  const baseUser = {
    name: item.user.name,
    username: item.username,
    avatar: avatarImageSrc(item.user.avatar) ?? "",
    initials: item.user.initials,
  };

  if (item.levelUp) {
    const { previousLevel, newLevel } = item.levelUp;
    const title = "Challenge gelöst & Level-Aufstieg";
    const desc = `hat die Challenge „${item.challenge}“ gelöst (+${item.points} Punkte) und ist von Stufe ${previousLevel} auf Stufe ${newLevel} gestiegen`;

    return {
      user: baseUser,
      event: {
        type: "level-up",
        title,
        description: desc,
        timestamp: item.time,
        level: item.user.level,
      },
    };
  }

  return {
    user: baseUser,
    event: {
      type: "challenge-solved",
      title: "Challenge gelöst",
      description: `hat die Challenge „${item.challenge}“ gelöst (+${item.points} Punkte)`,
      timestamp: item.time,
      level: item.user.level,
    },
  };
}
