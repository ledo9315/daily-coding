"use client";

import Link from "next/link";
import { Code, TrendingUp, Zap } from "@nsmr/pixelart-react";
import { Meteors } from "../ui/meteors";
import Image from "next/image";
import { BorderBeam } from "../ui/border-beam";
import { EncryptedText } from "../ui/encrypted-text";
import { FlickeringGrid } from "../ui/flickering-grid";
import { motion, Variants } from "framer-motion";

/**
 * `todaysChallengeTitle` comes from the server. The badge used to hardcode
 * "Array Manipulation" — the one element on the page that claims to be live, and it would
 * have claimed the same thing forever. Null when the rotation pool is empty: a badge that
 * announces nothing is worse than no badge.
 */
export function LandingHero({
  todaysChallengeTitle,
}: {
  todaysChallengeTitle: string | null;
}) {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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
    <div className="relative overflow-hidden pt-32 pb-16 sm:pt-40 sm:pb-24">
      <FlickeringGrid
        className="absolute inset-0 z-0 mask-[radial-gradient(400px_circle_at_center,white,transparent)]"
        squareSize={6}
        gridGap={1}
        color="#A371F7"
        maxOpacity={0.2}
        flickerChance={0.1}
        height={800}
        width={1920}
      />
      {/* Background patterns */}
      <Meteors />
      <div className="absolute inset-0 z-0 opacity-20 scanlines" />
      <div className="absolute top-20 right-0 h-100 w-100 bg-chart-5/20 blur-[100px] rounded-full mix-blend-screen" />
      <div className="absolute bottom-0 left-0 h-75 w-75 bg-chart-5/20 blur-[100px] rounded-full mix-blend-screen" />

      <motion.div
        className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center z-10"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {todaysChallengeTitle ? (
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 rounded border border-border bg-card/50 px-3 py-1 text-sm text-muted-foreground mb-8 backdrop-blur-sm"
          >
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
            <EncryptedText
              text={`Heutige Challenge: ${todaysChallengeTitle}`}
              revealDelayMs={40}
            />
          </motion.div>
        ) : null}

        <motion.h1
          variants={itemVariants}
          className="mx-auto max-w-4xl font-heading text-4xl leading-tight tracking-tight sm:text-6xl mb-6"
        >
          EINE CHALLENGE<br />
          <span className="text-chart-5 retro-glow">JEDEN TAG</span> <br />
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="mx-auto max-w-2xl text-xl text-muted-foreground mb-10"
        >
          Keine Sammlung mit Tausenden Aufgaben, in der du nicht weißt, wo du
          anfangen sollst. Eine Aufgabe am Tag: die, die heute für alle gilt.
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/join?token=12312"
            className="pixel-btn bg-primary text-primary-foreground min-w-50 text-center"
          >
            CHALLENGE STARTEN
          </Link>
          <Link
            href="#features"
            className="pixel-btn bg-card hover:bg-muted min-w-50 text-center"
          >
            SO LÄUFT EIN TAG
          </Link>
        </motion.div>

        <div className="relative mt-16 mx-auto max-w-4xl rounded-xl border border-border bg-card/50 p-2 shadow-2xl backdrop-blur-sm">
          <BorderBeam size={250} duration={12} delay={9} />
          <Image
            src="/screen2.png"
            alt="Das Dashboard von Daily Coding mit Rang, Punkten, Streak und der heutigen Challenge"
            width={1920}
            height={1121}
            loading="eager"
            fetchPriority="high"
            className="rounded-lg border border-border"
          />
        </div>

        <motion.div
          variants={itemVariants}
          className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-5xl mx-auto border-t border-border pt-8"
        >
          <div className="flex flex-col items-center gap-2">
            <Code className="h-8 w-8 text-chart-1" />
            <span className="font-heading text-lg">TÄGLICHE AUFGABEN</span>
            <span className="text-muted-foreground text-sm">
              Leicht, mittel, schwer im Wechsel
            </span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Zap className="h-8 w-8 text-accent" />
            <span className="font-heading text-lg">PUNKTE UND LEVEL</span>
            <span className="text-muted-foreground text-sm">
              Streaks, Abzeichen, Wertungen
            </span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <TrendingUp className="h-8 w-8 text-primary" />
            <span className="font-heading text-lg">SKILL-WACHSTUM</span>
            <span className="text-muted-foreground text-sm">
              Algorithmen und Datenstrukturen
            </span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
