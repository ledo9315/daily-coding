"use client";

import Link from "next/link";
import { FlickeringGrid } from "../ui/flickering-grid";
import { motion } from "framer-motion";

export function LandingCTA() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-primary/5 scanlines opacity-50" />

      <motion.div
        className="relative mx-auto max-w-4xl px-4 text-center"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
      >
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
      </motion.div>
    </section>
  );
}
