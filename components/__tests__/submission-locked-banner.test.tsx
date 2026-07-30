import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import { SubmissionLockedBanner } from "@/components/submission-locked-banner";

/**
 * #36: the editor was greyed out and locked with no explanation where the lock was
 * visible. The hint sat at the top of the page and was long out of view by the time
 * you scrolled down to the editor.
 */
describe("SubmissionLockedBanner", () => {
  const markup = renderToStaticMarkup(<SubmissionLockedBanner />);

  it("mentions that a submission was made", () => {
    expect(markup).toMatch(/abgegeben/i);
  });

  it("mentions that testing is locked too", () => {
    // Without this part you are left guessing why "run tests" does nothing.
    expect(markup).toMatch(/test/i);
    expect(markup).toMatch(/gesperrt|nicht möglich/i);
  });

  it("mentions how long the lock lasts", () => {
    expect(markup).toMatch(/morgen/i);
    expect(markup).toMatch(/UTC/);
  });

  it("is marked up as a status message for screen readers", () => {
    expect(markup).toContain('role="status"');
  });

  // #59: proves icons resolve without a mock — importing @nsmr/pixelart-react used
  // to fail in the node env because of a missing ESM file extension.
  it("renders the real lock icon without a mock", () => {
    expect(markup).toContain("<svg");
  });
});
