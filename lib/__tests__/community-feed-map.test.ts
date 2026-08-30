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

  it("maps level-up to event type level-up with combined description", () => {
    const props = communityFeedItemToFeedItem({
      ...base,
      levelUp: { previousLevel: 3, newLevel: 4 },
    });
    expect(props.event.type).toBe("level-up");
    expect(props.event.title).toBe("Challenge gelöst & Level-Aufstieg");
    expect(props.event.description).toContain("Two Sum");
    expect(props.event.description).toContain("Stufe 3");
    expect(props.event.description).toContain("Stufe 4");
  });
});
