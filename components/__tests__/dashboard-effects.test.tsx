import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { SVGProps } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { StatsCard } from "@/components/stats-card";

const read = (...parts: string[]) =>
  readFileSync(join(process.cwd(), ...parts), "utf8");

function TestIcon(props: SVGProps<SVGSVGElement>) {
  return <svg {...props} />;
}

describe("dashboard effects", () => {
  it("uses the animated flickering grid across authenticated app routes", () => {
    const routes = [
      ["app", "page.tsx"],
      ["app", "challenge", "page.tsx"],
      ["app", "ranking", "page.tsx"],
      ["app", "ranking", "loading.tsx"],
      ["app", "profile", "page.tsx"],
      ["app", "profile", "loading.tsx"],
    ];

    for (const route of routes) {
      const source = read(...route);

      expect(source, route.join("/")).toContain(
        'import { AnimatedFlickeringGrid } from "@/components/ui/animated-flickering-grid"',
      );
      expect(source, route.join("/")).toContain("<AnimatedFlickeringGrid");
      expect(source, route.join("/")).toContain("h-[300px]");
      expect(source, route.join("/")).not.toContain("<FlickeringGrid");
    }
  });

  it("enables the animated dot reveal on dashboard stat cards", () => {
    const html = renderToStaticMarkup(
      <StatsCard icon={TestIcon} title="PUNKTE" value={42} />,
    );

    expect(html).toContain("data-card-spotlight-effect");
  });
});
