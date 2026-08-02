import { LandingNavbar } from "@/components/landing/navbar";
import { LandingHero } from "@/components/landing/hero";
import { LandingCTA } from "@/components/landing/cta";
import { LandingFooter } from "@/components/landing/footer";
import { AmbientGlow } from "@/components/landing/ambient-glow";
import { LandingFeatures } from "@/components/landing/features";
import { LandingRoutine } from "@/components/landing/routine";
import { LandingCodeDemo } from "@/components/landing/code-demo";

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
          The grey block between two black ones: day timeline `#020912`, this on `bg-card/50`,
          countdown `#020912` again. The alternation is what separates them, so this section
          carries borders on both edges and the two around it need none.

          Both blocks live in one section because each one of its own needed `overflow-hidden`
          and cut the ambient bloom at the boundary, a visible seam between two blocks sharing a
          background. Two blooms at different heights, as in the hero, because the block is tall.

          No `id="features"` here: the anchor sits on the day timeline, which is what the hero
          button now promises.
        */}
        <section className="landing-deferred relative overflow-hidden border-y border-border bg-card/50">
          <AmbientGlow side="right" className="top-[22%]" />
          <AmbientGlow side="left" className="top-[62%]" />
          <LandingRoutine />
          <LandingCodeDemo />
        </section>
        <LandingCTA />
      </main>
      <LandingFooter />
    </div>
  );
}
