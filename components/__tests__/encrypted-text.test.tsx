import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { EncryptedText } from "@/components/ui/encrypted-text";

describe("EncryptedText", () => {
  it("renders a deterministic hydration frame", () => {
    const render = () =>
      renderToStaticMarkup(<EncryptedText text="Heutige Challenge: Two Sum" />);

    expect(render()).toBe(render());
  });
});
