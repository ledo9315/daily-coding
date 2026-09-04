import { describe, expect, it } from "vitest";
import { renderWithIntl } from "./intl-render";
import { FeedItem } from "@/components/feed-item";

describe("FeedItem", () => {
  it("derives the profile link from the name, not from the @-prefixed handle", () => {
    const html = renderWithIntl(
      <FeedItem
        user={{
          name: "Lisa Müller",
          username: "@lisa müller",
          avatar: "",
          initials: "LM",
        }}
        event={{
          type: "challenge-solved",
          title: "Challenge gelöst",
          description: "hat die Challenge „Two Sum“ gelöst (+200 Punkte)",
          timestamp: "vor 5 Minuten",
        }}
      />
    );
    expect(html).toContain('href="/u/lisa%20m%C3%BCller"');
    expect(html).toContain("@lisa müller");
  });
});
