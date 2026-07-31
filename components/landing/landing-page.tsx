import { LandingNavbar } from "@/components/landing/navbar";
import { LandingHero } from "@/components/landing/hero";
import { LandingCTA } from "@/components/landing/cta";
import { LandingFooter } from "@/components/landing/footer";
import { LandingFeatures } from "@/components/landing/features";
// Temporarily out with the section below: import { AmbientGlow } from "@/components/landing/ambient-glow";
// Temporarily out with the section below: import { LandingRoutine } from "@/components/landing/routine";
// Temporarily out with the section below: import { LandingCodeDemo } from "@/components/landing/code-demo";

/**
 * The page a visitor without a session sees on `/`.
 *
 * It used to be a route of its own at `/landing`, while `/` redirected anonymous visitors
 * to the login form. That left the canonical URL of the site — the one in `metadataBase`,
 * in the OG tags, and the one every external link points at — answering 307 with a login
 * form behind it, and put the page that has to sell the site on a second URL (#130).
 */
export function LandingPage({
  todaysChallengeTitle,
}: {
  todaysChallengeTitle: string | null;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground">
      <LandingNavbar />
      <main>
        <LandingHero todaysChallengeTitle={todaysChallengeTitle} />
        <LandingFeatures />
        {/*
          Hidden for a look at the page without it, not deleted. Both blocks live in one section
          because each one of its own needed `overflow-hidden` and cut the ambient bloom at the
          boundary, a visible seam between two blocks that share the same background anyway. Two
          blooms at different heights, as in the hero, because the merged block is tall.

          While this is out, `id="features"` sits on the day timeline instead, so the hero button
          has a target. Bringing this back means taking the anchor off one of the two.

          <section id="features" className="relative overflow-hidden bg-card/50">
            <AmbientGlow side="right" className="top-[22%]" />
            <AmbientGlow side="left" className="top-[62%]" />
            <LandingRoutine />
            <LandingCodeDemo />
          </section>
        */}
        <LandingCTA />
      </main>
      <LandingFooter />
    </div>
  );
}
