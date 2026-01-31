import { Zap, Trophy, Users, Bullseye } from "@nsmr/pixelart-react";
import { CardSpotlight } from "@/components/ui/card-spotlight";

export function LandingFeatures() {
  return (
    <section id="features" className="py-24 bg-card/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-heading text-3xl sm:text-4xl mb-4">
            BRING DEINE KARRIERE VORAN
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Gamifizierte Erfahrung, um dich motiviert und konsistent zu halten.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <CardSpotlight className="pixel-box bg-card p-6 flex flex-col items-center text-center hover:translate-y-[-4px] transition-transform">
            <div className="h-12 w-12 flex items-center justify-center rounded-full mb-4 text-primary relative z-10">
              <Zap className="h-8 w-8" />
            </div>
            <h3 className="font-heading text-lg mb-2 relative z-10">
              Täglicher Streak
            </h3>
            <p className="text-sm text-muted-foreground relative z-10">
              Baue eine Gewohnheit auf, indem du jeden Tag codest.
            </p>
          </CardSpotlight>

          <CardSpotlight className="pixel-box bg-card p-6 flex flex-col items-center text-center hover:translate-y-[-4px] transition-transform">
            <div className="h-12 w-12 flex items-center justify-center bg-accent/10 rounded-full mb-4 text-accent relative z-10">
              <Trophy className="h-8 w-8" />
            </div>
            <h3 className="font-heading text-lg mb-2 relative z-10">
              Bestenlisten
            </h3>
            <p className="text-sm text-muted-foreground relative z-10">
              Miss dich, um die Top 3 zu erreichen!
            </p>
          </CardSpotlight>

          <CardSpotlight className="pixel-box bg-card p-6 flex flex-col items-center text-center hover:translate-y-[-4px] transition-transform">
            <div className="h-12 w-12 flex items-center justify-center bg-chart-4/10 rounded-full mb-4 text-chart-4 relative z-10">
              <Users className="h-8 w-8" />
            </div>
            <h3 className="font-heading text-lg mb-2 relative z-10">
              Team-Battle
            </h3>
            <p className="text-sm text-muted-foreground relative z-10">
              Frontend vs. Backend? Finde heraus, wer die besseren Algorithmen
              schreibt.
            </p>
          </CardSpotlight>

          <CardSpotlight className="pixel-box bg-card p-6 flex flex-col items-center text-center hover:translate-y-[-4px] transition-transform">
            <div className="h-12 w-12 flex items-center justify-center bg-success/10 rounded-full mb-4 text-success relative z-10">
              <Bullseye className="h-8 w-8" />
            </div>
            <h3 className="font-heading text-lg mb-2 relative z-10">
              Skill-Wachstum
            </h3>
            <p className="text-sm text-muted-foreground relative z-10">
              Meistere Algorithmen und Datenstrukturen, Schritt für Schritt.
            </p>
          </CardSpotlight>
        </div>
      </div>
    </section>
  );
}
