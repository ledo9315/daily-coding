import { describe, it, expect } from "vitest";
import { createTranslator } from "next-intl";
import { communityFeedItemToFeedItem } from "../community-feed-map";
import type { CommunityFeedItem } from "@/lib/api";
import de from "@/messages/de/community.json";
import en from "@/messages/en/community.json";

const translatorFor = (locale: "de" | "en") =>
  createTranslator({
    locale,
    messages: { community: locale === "de" ? de : en },
    namespace: "community",
  });

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
    const props = communityFeedItemToFeedItem(base, translatorFor("de"));
    expect(props.event.type).toBe("challenge-solved");
    expect(props.event.description).toBe(de.feed.solvedDescription
      .replace("{challenge}", "Two Sum")
      .replace("{points}", "200"));
    expect(props.event.description).toBe(
      'hat die Challenge „Two Sum“ gelöst (+200 Punkte)',
    );
    expect(props.user.username).toBe("@alice");
  });

  it("maps level-up to event type level-up with combined description", () => {
    const props = communityFeedItemToFeedItem(
      { ...base, levelUp: { previousLevel: 3, newLevel: 4 } },
      translatorFor("de"),
    );
    expect(props.event.type).toBe("level-up");
    expect(props.event.title).toBe(de.feed.levelUpTitle);
    expect(props.event.description).toContain("Two Sum");
    expect(props.event.description).toContain("Stufe 3");
    expect(props.event.description).toContain("Stufe 4");
  });

  /** The German sentence must not survive into an English feed (#DAI-202). */
  it("writes the sentence in the reader's language", () => {
    const props = communityFeedItemToFeedItem(base, translatorFor("en"));
    expect(props.event.title).toBe(en.feed.solvedTitle);
    expect(props.event.description).toBe('solved the challenge "Two Sum" (+200 points)');
  });
});
