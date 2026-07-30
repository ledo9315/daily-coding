import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { RankingTable } from "@/components/ranking-table";

const row = (over: Partial<Parameters<typeof RankingTable>[0]["entries"][number]> = {}) => ({
  id: "1",
  rank: 1,
  name: "Lisa Müller",
  initials: "LM",
  avatar: "/user/lili.png",
  points: 270,
  level: 2,
  challengesSolved: 2,
  ...over,
});

describe("RankingTable", () => {
  /**
   * #79: on a phone the level chip broke into "Lvl" over "2" as soon as the name claimed
   * the width — as a shrinking flex item it had no reason to stay on one line. Two words
   * on two lines in a chip that small reads as a rendering fault.
   */
  it("keeps the level chip on one line", () => {
    const html = renderToStaticMarkup(
      <RankingTable entries={[row({ name: "Leonidas Domahalskyy" })]} />
    );
    expect(html).toContain("whitespace-nowrap");
    expect(html).toContain("shrink-0");
  });

  it("says Challenge in the singular for exactly one", () => {
    const html = renderToStaticMarkup(<RankingTable entries={[row({ challengesSolved: 1 })]} />);
    expect(html).toContain("1 Challenge gelöst");
    expect(html).not.toContain("1 Challenges gelöst");
  });

  it("still says Challenges for other counts", () => {
    for (const n of [0, 2, 17]) {
      const html = renderToStaticMarkup(<RankingTable entries={[row({ challengesSolved: n })]} />);
      expect(html).toContain(`${n} Challenges gelöst`);
    }
  });
});
