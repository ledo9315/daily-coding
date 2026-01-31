import Link from "next/link";
import { FlickeringGrid } from "../ui/flickering-grid";

export function LandingCTA() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-primary/5 scanlines opacity-50" />

      <div className="relative mx-auto max-w-4xl px-4 text-center">
        <div className="pixel-box bg-card p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <span className="font-heading text-9xl">?</span>
          </div>

          <h2 className="font-heading text-3xl sm:text-4xl mb-6">
            BEREIT, DEINE SKILLS ZU DEBUGGEN?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Schließe dich anderen Entwicklern an und löse tägliche Challenges.
            Kostenlos für Einzelpersonen.
          </p>

          <Link
            href="/join"
            className="pixel-btn bg-primary text-primary-foreground text-xl px-8 py-4 inline-block hover:scale-105 transition-transform"
          >
            CHALLENGE ANNEHMEN
          </Link>

          <p className="mt-6 text-sm text-muted-foreground">
            Keine Kreditkarte erforderlich • Sofortiger Zugang
          </p>
        </div>
      </div>
      <FlickeringGrid
        className="absolute bottom-0 z-0 mask-[radial-gradient(400px_circle_at_bottom,white,transparent)]"
        squareSize={6}
        gridGap={1}
        color="#A371F7"
        maxOpacity={0.2}
        flickerChance={0.1}
        height={800}
        width={1920}
      />
    </section>
  );
}
