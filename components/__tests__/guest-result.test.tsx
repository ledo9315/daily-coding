import { describe, it, expect, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { GuestResultHandover } from "@/lib/guest-result-handover";

// The header uses client hooks (useSession/usePathname), irrelevant for what is checked here.
vi.mock("@/components/header", () => ({
  Header: () => <nav data-role="header" />,
}));

// Rendered without a provider, so a key stands in for its sentence. The catalogues
// themselves are checked by `__tests__/message-keys.test.ts`.
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  // The points chip formats its number with it.
  useLocale: () => "de",
}));

import { GuestResultView } from "@/components/guest-result";

const passed: GuestResultHandover = {
  challengeId: "ch-1",
  title: "Two Sum",
  category: "Algorithmen",
  difficulty: "easy",
  points: 100,
  language: "javascript",
  passed: true,
  testCases: [
    { id: 1, name: "leeres Array", status: "passed" },
    { id: 2, name: "ein Treffer", status: "passed" },
  ] as GuestResultHandover["testCases"],
};

const failed: GuestResultHandover = { ...passed, passed: false };

/**
 * The page a guest lands on after handing in. Half of what matters about it is what it
 * leaves out: the signed-in result at `/challenge/<id>/solutions` shows other people's
 * answers, their comments and their votes, and none of that may leak out to a reader
 * without an account through this door.
 */
describe("the guest result page", () => {
  it("leads with the verdict and names the task", () => {
    const markup = renderToStaticMarkup(<GuestResultView result={passed} />);

    expect(markup).toContain("guestResult.passedHeadline");
    expect(markup).toContain("Two Sum");
    expect(markup).not.toContain("guestResult.failedHeadline");
  });

  it("says plainly when the tests did not pass", () => {
    const markup = renderToStaticMarkup(<GuestResultView result={failed} />);

    expect(markup).toContain("guestResult.failedHeadline");
    expect(markup).not.toContain("guestResult.passedHeadline");
  });

  it("shows the test cases that were run", () => {
    const markup = renderToStaticMarkup(<GuestResultView result={passed} />);

    expect(markup).toContain("leeres Array");
    expect(markup).toContain("ein Treffer");
  });

  it("shows a compile error where there is one, and nothing where there is not", () => {
    const withError = renderToStaticMarkup(
      <GuestResultView result={{ ...failed, compileError: "SyntaxError: boom" }} />
    );
    const without = renderToStaticMarkup(<GuestResultView result={passed} />);

    expect(withError).toContain("SyntaxError: boom");
    expect(without).not.toContain("compileError.title");
  });

  /** The reason the page exists - and it has to say that nothing was kept. */
  it("asks for an account and admits the run counted for nothing", () => {
    const markup = renderToStaticMarkup(<GuestResultView result={passed} />);

    expect(markup).toContain("guestResult.notCounted");
    expect(markup).toContain('href="/register"');
    expect(markup).toContain('href="/challenge"');
  });

  /**
   * The guard. Not a style rule: a link into the solutions would hand a guest both the
   * community content and the answer to the task they were just asked to solve.
   */
  it.each([
    ["passing", passed],
    ["failing", failed],
  ])("links nowhere near the community content on a %s result", (_case, result) => {
    const markup = renderToStaticMarkup(<GuestResultView result={result} />);

    expect(markup).not.toContain("/solutions");
    expect(markup).not.toContain("solutions.");
    expect(markup).not.toContain("share.");
  });

  it("offers a way back instead of an empty page when there is no result", () => {
    const markup = renderToStaticMarkup(<GuestResultView result={null} />);

    expect(markup).toContain("guestResult.empty");
    expect(markup).toContain('href="/challenge"');
    expect(markup).not.toContain("guestResult.notCounted");
  });
});
