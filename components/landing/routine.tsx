"use client";

import { ArrowBarUp, Trophy, Script, Calendar } from "@nsmr/pixelart-react";
import { CardSpotlight } from "@/components/ui/card-spotlight";
import { motion, Variants } from "framer-motion";

/**
 * What accumulates across days. The look is deliberate and unchanged; the content is not.
 *
 * Headed with verbs, not nouns. "Level", "Bestenlisten", "Community-Feed" and "Monatsübersicht"
 * are the names of database fields, and a card headed with one reads like documentation, which is
 * why it sounded like placeholder text. Each card now opens with what you do and puts the
 * mechanism in the body, the pattern Codewars uses on its own landing page. Short titles are a
 * constraint, not a preference: in the pixel face
 * "Monatsübersicht" overran the card width, and eleven characters is where a title stops wrapping.
 *
 * Everything it used to say was already said above it: the intro repeated the hero's USP and the
 * timeline's "one task, one attempt", the streak card repeated the timeline's last row almost word
 * for word, and "Algorithmen und Datenstrukturen, in vier Sprachen" repeated both the hero trio
 * and the timeline's testing row. The section now covers the four things that appear nowhere else
 * on the page.
 *
 * Each claim is checkable: level thresholds and tier names in `lib/level.ts`, the ranking sorted by
 * solved count then points in `lib/server/ranking-live.ts:105` with week and month only since #91,
 * the feed events in `components/feed-item.tsx`, and the month grid in `lib/monthly-activity.ts`.
 * The trophy stays on placements only, per #37.
 *
 * No section of its own any more: it shares one with the terminal below, so the ambient glow can
 * span both. Two sections meant two `overflow-hidden` boxes and a visible seam where the bloom was
 * cut in half. The `features` anchor moved to that shared section.
 */
export function LandingRoutine() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  return (
    <div className="py-24">
      <motion.div
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
      >
        <motion.div variants={itemVariants} className="text-center mb-16">
          <h2 className="font-heading text-3xl sm:text-4xl mb-4">
            AUS TAGEN WIRD KÖNNEN
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Eine einzelne Aufgabe ist morgen vergessen. Das hier bleibt und
            zeigt dir, wie weit du gekommen bist.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div variants={itemVariants} className="h-full">
            <CardSpotlight className="pixel-box bg-card p-6 flex flex-col items-center text-center hover:translate-y-[-4px] transition-transform h-full">
              <div className="h-12 w-12 flex items-center justify-center rounded-full mb-4 text-primary relative z-10">
                <ArrowBarUp className="h-8 w-8" />
              </div>
              <h3 className="font-heading text-lg mb-2 relative z-10">
                Steig auf
              </h3>
              <p className="text-sm text-muted-foreground relative z-10">
                Punkte für jede gelöste Aufgabe, Level für gesammelte Punkte.
                Von Einsteiger bis Legende, und jede Stufe liegt doppelt so weit
                wie die vorige.
              </p>
            </CardSpotlight>
          </motion.div>

          <motion.div variants={itemVariants} className="h-full">
            <CardSpotlight className="pixel-box bg-card p-6 flex flex-col items-center text-center hover:translate-y-[-4px] transition-transform h-full">
              <div className="h-12 w-12 flex items-center justify-center bg-accent/10 rounded-full mb-4 text-accent relative z-10">
                <Trophy className="h-8 w-8" />
              </div>
              <h3 className="font-heading text-lg mb-2 relative z-10">
                Miss dich
              </h3>
              <p className="text-sm text-muted-foreground relative z-10">
                Wochen- und Monatswertung nach gelösten Aufgaben. Bei
                Gleichstand entscheiden die Punkte.
              </p>
            </CardSpotlight>
          </motion.div>

          <motion.div variants={itemVariants} className="h-full">
            <CardSpotlight className="pixel-box bg-card p-6 flex flex-col items-center text-center hover:translate-y-[-4px] transition-transform h-full">
              <div className="h-12 w-12 flex items-center justify-center bg-chart-4/10 rounded-full mb-4 text-chart-4 relative z-10">
                <Script className="h-8 w-8" />
              </div>
              <h3 className="font-heading text-lg mb-2 relative z-10">
                Schau rein
              </h3>
              <p className="text-sm text-muted-foreground relative z-10">
                Wer heute gelöst hat, wer aufgestiegen ist, wer ein Abzeichen
                geholt hat. Dieselbe Aufgabe, viele Leute.
              </p>
            </CardSpotlight>
          </motion.div>

          <motion.div variants={itemVariants} className="h-full">
            <CardSpotlight className="pixel-box bg-card p-6 flex flex-col items-center text-center hover:translate-y-[-4px] transition-transform h-full">
              <div className="h-12 w-12 flex items-center justify-center bg-success/10 rounded-full mb-4 text-success relative z-10">
                <Calendar className="h-8 w-8" />
              </div>
              <h3 className="font-heading text-lg mb-2 relative z-10">
                Sieh zurück
              </h3>
              <p className="text-sm text-muted-foreground relative z-10">
                Ein Kalender deiner gelösten Tage. Du siehst sofort, wo du dran
                geblieben bist.
              </p>
            </CardSpotlight>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
