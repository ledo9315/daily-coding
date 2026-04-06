"use client";

import { Zap, Trophy, Script, Bullseye } from "@nsmr/pixelart-react";
import { CardSpotlight } from "@/components/ui/card-spotlight";
import { motion, Variants } from "framer-motion";

export function LandingFeatures() {
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
    <section id="features" className="py-24 bg-card/50">
      <motion.div
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
      >
        <motion.div variants={itemVariants} className="text-center mb-16">
          <h2 className="font-heading text-3xl sm:text-4xl mb-4">
            DEINE ROUTINE, DEIN FORTSCHRITT
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Streaks, XP und Bestenliste – gamifiziert, damit du dranbleibst und
            deine Skills Schritt für Schritt ausbaust.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div variants={itemVariants} className="h-full">
            <CardSpotlight className="pixel-box bg-card p-6 flex flex-col items-center text-center hover:translate-y-[-4px] transition-transform h-full">
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
          </motion.div>

          <motion.div variants={itemVariants} className="h-full">
            <CardSpotlight className="pixel-box bg-card p-6 flex flex-col items-center text-center hover:translate-y-[-4px] transition-transform h-full">
              <div className="h-12 w-12 flex items-center justify-center bg-accent/10 rounded-full mb-4 text-accent relative z-10">
                <Trophy className="h-8 w-8" />
              </div>
              <h3 className="font-heading text-lg mb-2 relative z-10">
                Bestenlisten
              </h3>
              <p className="text-sm text-muted-foreground relative z-10">
                Vergleiche dich mit anderen – von heute bis zum Monatsranking.
              </p>
            </CardSpotlight>
          </motion.div>

          <motion.div variants={itemVariants} className="h-full">
            <CardSpotlight className="pixel-box bg-card p-6 flex flex-col items-center text-center hover:translate-y-[-4px] transition-transform h-full">
              <div className="h-12 w-12 flex items-center justify-center bg-chart-4/10 rounded-full mb-4 text-chart-4 relative z-10">
                <Script className="h-8 w-8" />
              </div>
              <h3 className="font-heading text-lg mb-2 relative z-10">
                Community-Feed
              </h3>
              <p className="text-sm text-muted-foreground relative z-10">
                Kurzer Überblick, was in der Community gerade passiert – zum
                Mitfeiern und Ideen holen.
              </p>
            </CardSpotlight>
          </motion.div>

          <motion.div variants={itemVariants} className="h-full">
            <CardSpotlight className="pixel-box bg-card p-6 flex flex-col items-center text-center hover:translate-y-[-4px] transition-transform h-full">
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
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
