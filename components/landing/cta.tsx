"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { CountdownTimer } from "@/components/countdown-timer";
import { FlickeringGrid } from "@/components/ui/flickering-grid";

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
 *
 * Background `#020912`, the same panel colour as the day timeline, so the page closes on a
 * defined surface instead of on the page background.
 */
export function LandingCTA() {
  return (
    <section className="relative overflow-hidden bg-[#020912]">
      {/*
        The decorations wrap only the clock, not the whole section: the artwork below makes the
        section far taller, and anything centred in it would sit in the middle of the picture.
      */}
      <div className="relative">
        {/*
          Same component, same mask and the same violet as the hero: the page opens and closes on
          the same note, with the lime sections in between. Purely decorative, below the content.

          No scanline layer here. `scanlines` came with `bg-primary/5`, a flat lime wash over the
          whole block, and since the block does not span the section it ended in a visible bright
          rectangle against the identical background above it. The grid carries the texture.
        */}
        <FlickeringGrid
          /*
            An ellipse, not the hero's circle: the clock block is ~620px tall, so a 500px circle
            still had a quarter of its alpha left at the top edge and the grid ended in a straight
            cut along the border. 260px vertical radius fades out inside it.
          */
          className="absolute inset-0 z-0 mask-[radial-gradient(700px_260px_at_center,white,transparent)]"
          squareSize={6}
          gridGap={1}
          color="#A371F7"
          /* Violet sits darker on #020912 than the lime did, so it needs a touch more opacity
             to read at all. */
          maxOpacity={0.2}
          flickerChance={0.08}
        />

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

          <CountdownTimer className="mt-8" variant="display" />

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
      </div>

      {/*
        Was closing the day timeline, and now closes the whole lower half. Both sections share
        `#020912` and the timeline has no bottom border, so timeline, clock and picture read as
        one block, and the picture is the last thing above the footer.

        No fade needed: the top pixel row of this artwork is #020912 itself. Outside the decorated
        block on purpose, pixel art with a scanline pattern over it reads as a dirty screen.
      */}
      <Image
        src="/pixel/banner3.webp"
        alt="Nachtszene als Pixelgrafik: ein Schreibtisch mit Büchern, dampfender Tasse, einem alten Röhrenmonitor, dessen grünes Leuchten die Wand anstrahlt, Tastatur und ausgeschalteter Lampe, rechts ein Fenster mit Vollmond"
        width={2172}
        height={724}
        sizes="100vw"
        className="relative block h-auto w-full [image-rendering:pixelated]"
      />
    </section>
  );
}
