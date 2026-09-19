import { LandingNavbar } from "@/components/landing/navbar";
import { LandingHero } from "@/components/landing/hero";
import { LandingCTA } from "@/components/landing/cta";
import { ProductTour } from "@/components/landing/product-tour";
import { MiniChallenge } from "@/components/landing/mini-challenge";
import {
  LandingProgression,
  LandingFAQ,
} from "@/components/landing/progression";
import "./landing.css";

/** Public product journey; authenticated visitors keep the existing dashboard. */
export function LandingPage({
  todaysChallengeTitle,
}: {
  todaysChallengeTitle: string | null;
}) {
  return (
    <div className="lp min-h-screen [&+footer]:mt-0">
      <LandingNavbar />
      <main>
        <LandingHero todaysChallengeTitle={todaysChallengeTitle} />
        <ProductTour />
        <MiniChallenge />
        <LandingProgression />
        <LandingFAQ />
        <LandingCTA />
      </main>
    </div>
  );
}
