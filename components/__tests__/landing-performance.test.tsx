import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { FlickeringGrid } from "@/components/ui/flickering-grid";
import { AnimatedFlickeringGrid } from "@/components/ui/animated-flickering-grid";
import { CardSpotlight } from "@/components/ui/card-spotlight";
import { Meteors } from "@/components/ui/meteors";

const read = (...parts: string[]) =>
  readFileSync(resolve(process.cwd(), ...parts), "utf8");

describe("landing performance budget", () => {
  it("renders decorative grids without a continuously redrawn canvas", () => {
    const html = renderToStaticMarkup(<FlickeringGrid color="#C4FE4D" />);

    expect(html).toContain('aria-hidden="true"');
    expect(html).not.toContain("<canvas");
  });

  it("uses the throttled rectangle animation only in the hero and CTA", () => {
    const html = renderToStaticMarkup(
      <AnimatedFlickeringGrid color="#C4FE4D" />,
    );
    const hero = read("components", "landing", "hero.tsx");
    const cta = read("components", "landing", "cta.tsx");
    const features = read("components", "landing", "features.tsx");

    expect(html).toContain("<canvas");
    expect(hero).toContain("<AnimatedFlickeringGrid");
    expect(cta).toContain("<AnimatedFlickeringGrid");
    expect(features).not.toContain("FlickeringGrid");
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

  it("server-renders the hero rain without adding another client boundary", () => {
    const html = renderToStaticMarkup(<Meteors number={5} />);
    const hero = read("components", "landing", "hero.tsx");
    const meteors = read("components", "ui", "meteors.tsx");

    expect(html.match(/data-meteor=/g)).toHaveLength(5);
    expect(hero).toContain("<Meteors");
    expect(meteors).not.toMatch(/^\s*["']use client["']/);
  });

  it("uses the original motion border beam in the hero", () => {
    const hero = read("components", "landing", "hero.tsx");
    const beamPath = resolve(
      process.cwd(),
      "components",
      "ui",
      "border-beam.tsx",
    );
    const beam = existsSync(beamPath) ? readFileSync(beamPath, "utf8") : "";

    expect(existsSync(beamPath)).toBe(true);
    expect(hero).toContain(
      '<BorderBeam size={250} duration={12} delay={9} />',
    );
    expect(beam).toMatch(/^\s*["']use client["']/);
    expect(beam).toContain('from "motion/react"');
    expect(beam).toContain(
      '"bg-linear-to-l from-(--color-from) via-(--color-to) to-transparent"',
    );
    expect(beam).toContain(
      "offsetPath: `rect(0 auto auto 0 round ${size}px)`",
    );
    expect(beam).toContain("offsetDistance");
    expect(beam).toContain('ease: "linear"');
  });

  it("restores the requested Motion reveals across the landing page", () => {
    const expectedMotionElements: Record<string, number> = {
      "hero.tsx": 5,
      "features.tsx": 2,
      "routine.tsx": 6,
      "code-demo.tsx": 2,
      "cta.tsx": 1,
    };

    for (const [file, minimum] of Object.entries(expectedMotionElements)) {
      const source = read("components", "landing", file);
      expect(source).toMatch(/^\s*["']use client["']/);
      expect(source).toContain('from "framer-motion"');
      expect(source.match(/<motion\./g)?.length).toBeGreaterThanOrEqual(minimum);
    }
  });
});
