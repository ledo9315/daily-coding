import { readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { FlickeringGrid } from "@/components/ui/flickering-grid";
import { CardSpotlight } from "@/components/ui/card-spotlight";

const read = (...parts: string[]) =>
  readFileSync(resolve(process.cwd(), ...parts), "utf8");

describe("landing performance budget", () => {
  it("renders decorative grids without a continuously redrawn canvas", () => {
    const html = renderToStaticMarkup(<FlickeringGrid color="#C4FE4D" />);

    expect(html).toContain('aria-hidden="true"');
    expect(html).not.toContain("<canvas");
  });

  it("loads the card shader near a card on every viewport", () => {
    const html = renderToStaticMarkup(
      <CardSpotlight animatedDots>Inhalt</CardSpotlight>,
    );
    const routine = read("components", "landing", "routine.tsx");
    const loader = read("components", "ui", "card-spotlight-effect.tsx");
    const shader = read("components", "ui", "canvas-reveal-effect.tsx");

    expect(html).toContain("Inhalt");
    expect(html).toContain("data-card-spotlight-effect");
    expect(html).not.toContain("lg:block");
    expect(html).not.toContain("<canvas");
    expect(routine.match(/<CardSpotlight[^>]*animatedDots/g)).toHaveLength(4);
    expect(loader).toContain("dynamic(");
    // The viewport width no longer gates the shader; proximity and motion preference still do.
    expect(loader).not.toContain("min-width");
    expect(loader).toContain("IntersectionObserver");
    expect(loader).toContain("prefers-reduced-motion");
    expect(loader).toContain("CanvasRevealEffect");
    expect(shader).toContain('frameloop="demand"');
    expect(shader).toContain("dpr={1}");
  });

  it("keeps the new landing free of continuously running decorative renderers", () => {
    for (const file of [
      "hero.tsx",
      "product-tour.tsx",
      "mini-challenge.tsx",
      "progression.tsx",
      "cta.tsx",
    ]) {
      const source = read("components", "landing", file);
      expect(source).not.toMatch(
        /AnimatedFlickeringGrid|CanvasRevealEffect|setInterval|requestAnimationFrame/,
      );
    }
  });

  it("respects reduced motion for the tour and hover transitions", () => {
    const css = read("components", "landing", "landing.css");
    expect(css).toContain("prefers-reduced-motion: reduce");
    expect(css).toContain("animation: none !important");
    expect(css).toContain("transition: none !important");
  });

  it("ships the four new images within a 650 KB combined asset budget", () => {
    const bytes = [
      "dashboard-tour",
      "editor-tour",
      "profile-tour",
      "level-up",
    ].reduce(
      (total, name) =>
        total +
        statSync(resolve(process.cwd(), "public", "landing", `${name}.webp`))
          .size,
      0,
    );
    expect(bytes).toBeLessThan(650 * 1024);
  });
});
