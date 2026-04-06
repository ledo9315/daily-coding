import { describe, it, expect } from "vitest";
import { communityFeedItemToFeedItem } from "../community-feed-map";
import type { CommunityFeedItem } from "@/lib/api";

describe("communityFeedItemToFeedItem", () => {
  const base: CommunityFeedItem = {
    id: "sub-1",
    kind: "challenge-solved",
    user: {
      name: "Alice",
      initials: "A",
      avatar: "/user/minipix4.png",
      level: 4,
    },
    username: "@alice",
    action: "hat die Challenge gelöst",
    challenge: "Two Sum",
    points: 200,
    time: "vor 5 Minuten",
    createdAt: new Date().toISOString(),
  };

  it("maps challenge-solved to FeedItem with quoted challenge title", () => {
    const props = communityFeedItemToFeedItem(base);
    expect(props.event.type).toBe("challenge-solved");
    expect(props.event.description).toBe(
      'hat die Challenge „Two Sum“ gelöst (+200 Punkte)',
    );
    expect(props.user.username).toBe("@alice");
  });
});
