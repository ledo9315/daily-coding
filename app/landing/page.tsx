import { LandingNavbar } from "@/components/landing/navbar";
import { LandingHero } from "@/components/landing/hero";
import { LandingFeatures } from "@/components/landing/features";
import { LandingCTA } from "@/components/landing/cta";
import { LandingFooter } from "@/components/landing/footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground">
      <LandingNavbar />
      <main>
        <LandingHero />
        <LandingFeatures />
        <LandingCTA />
      </main>
      <LandingFooter />
    </div>
  );
}
