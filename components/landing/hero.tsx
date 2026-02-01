"use client";

import Link from "next/link";
import { ArrowRight, Code2, Trophy, Users } from "lucide-react";
import { Meteors } from "../ui/meteors";
import Image from "next/image";
import { BorderBeam } from "../ui/border-beam";
import { EncryptedText } from "../ui/encrypted-text";
import { FlickeringGrid } from "../ui/flickering-grid";
import { motion, Variants } from "framer-motion";

export function LandingHero() {
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
      <div className="absolute top-20 right-0 h-[400px] w-[400px] bg-chart-5/20 blur-[100px] rounded-full mix-blend-screen" />
      <div className="absolute bottom-0 left-0 h-[300px] w-[300px] bg-chart-5/20 blur-[100px] rounded-full mix-blend-screen" />

      <motion.div
        className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center z-10"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div
          variants={itemVariants}
          className="inline-flex items-center gap-2 rounded border border-border bg-card/50 px-3 py-1 text-sm text-muted-foreground mb-8 backdrop-blur-sm"
        >
          <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
          <EncryptedText
            text="Heutige Challenge: Array Manipulation"
            revealDelayMs={40}
          />
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="mx-auto max-w-4xl font-heading text-4xl leading-tight tracking-tight sm:text-6xl mb-6"
        >
          VERBESSERE DEINE <br />
          <span className="text-chart-5 retro-glow">CODING-SKILLS</span> <br />
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="mx-auto max-w-2xl text-xl text-muted-foreground mb-10"
        >
          Tritt gegen dein Team an, sammle XP und baue deinen Streak auf. Eine
          tägliche Coding-Challenge, um dich fit zu halten.
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/join?token=12312"
            className="pixel-btn bg-primary text-primary-foreground min-w-[200px] text-center"
          >
            CHALLENGE STARTEN
          </Link>
          <Link
            href="#features"
            className="pixel-btn bg-card hover:bg-muted min-w-[200px] text-center"
          >
            FEATURES ANSEHEN
          </Link>
        </motion.div>

        <div className="relative mt-16 mx-auto max-w-4xl rounded-xl border border-border bg-card/50 p-2 shadow-2xl backdrop-blur-sm">
          <BorderBeam size={250} duration={12} delay={9} />
          <Image
            src="/screen.png"
            alt="Daily Coding Challenge Dashboard"
            width={1200}
            height={600}
            className="rounded-lg border border-border"
          />
        </div>

        <motion.div
          variants={itemVariants}
          className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-5xl mx-auto border-t border-border pt-8"
        >
          <div className="flex flex-col items-center gap-2">
            <Code2 className="h-8 w-8 text-primary" />
            <span className="font-heading text-lg">TÄGLICHE AUFGABEN</span>
            <span className="text-muted-foreground text-sm">
              Kuratierte Coding-Probleme
            </span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Trophy className="h-8 w-8 text-accent" />
            <span className="font-heading text-lg">GAMIFICATION</span>
            <span className="text-muted-foreground text-sm">
              XP, Streaks & Abzeichen
            </span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Users className="h-8 w-8 text-chart-4" />
            <span className="font-heading text-lg">TEAM-BATTLE</span>
            <span className="text-muted-foreground text-sm">
              Miss dich mit Kollegen
            </span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
