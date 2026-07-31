"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CountdownTimer } from "@/components/countdown-timer";

/**
 * Closes with the running clock, and nothing else.
 *
 * Replaces a card inside a section with a centred slogan and a giant "?" at ten percent opacity,
 * the shape every landing page ends in. The counter says what that copy was reaching for, only
 * true and live: the next task arrives at midnight UTC, the same one for everybody.
 *
 * The midnight artwork was briefly here too and gave the section two focal points, which left the
 * day timeline above with none. It closes that section now. `CountdownTimer` is the component the
 * challenge page already uses.
 */
export function LandingCTA() {
  return (
    <section className="relative overflow-hidden">
      <div className="scanlines absolute inset-0 bg-primary/5 opacity-50" />

      <motion.div
        className="relative mx-auto flex max-w-3xl flex-col items-center px-4 py-28 text-center"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5 }}
      >
        <p className="font-code text-xs uppercase tracking-[0.2em] text-muted-foreground">
          00:00 UTC, für alle gleichzeitig
        </p>

        <CountdownTimer className="mt-6 scale-125 sm:scale-150" />

        <h2 className="mt-14 font-heading text-2xl leading-tight sm:text-3xl">
          SEI MORGEN DABEI
        </h2>
        <p className="mt-4 max-w-md text-lg text-muted-foreground">
          Oder fang mit der von heute an. Sie läuft noch.
        </p>

        <Link
          href="/join?token=123124"
          className="pixel-btn mt-8 inline-block bg-primary px-8 py-4 text-xl text-primary-foreground transition-transform hover:scale-105"
        >
          CHALLENGE ANNEHMEN
        </Link>
      </motion.div>
    </section>
  );
}
