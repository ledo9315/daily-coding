import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import { SubmissionLockedBanner } from "@/components/submission-locked-banner";

/**
 * #36: the editor was greyed out and locked with no explanation where the lock was
 * visible. The hint sat at the top of the page and was long out of view by the time
 * you scrolled down to the editor.
 *
 * The banner has since been trimmed to its label. The two assertions on the wording —
 * that testing is locked too, and that the lock lasts until tomorrow (UTC) — are gone
 * with the sentence they guarded; what remains is that the lock is named at all, in a
 * region a screen reader announces.
 */
describe("SubmissionLockedBanner", () => {
  const markup = renderToStaticMarkup(<SubmissionLockedBanner />);

  it("mentions that a submission was made", () => {
    expect(markup).toMatch(/abgegeben/i);
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
