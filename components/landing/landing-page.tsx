import { LandingNavbar } from "@/components/landing/navbar";
import { LandingHero } from "@/components/landing/hero";
import { LandingFeatures } from "@/components/landing/features";
import { LandingCTA } from "@/components/landing/cta";
import { LandingFooter } from "@/components/landing/footer";
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
        <LandingCodeDemo />
        <LandingCTA />
      </main>
      <LandingFooter />
    </div>
  );
}
