"use client";

// Hidden with the banner below: import Image from "next/image";
import { AmbientGlow } from "@/components/landing/ambient-glow";
import { motion, type Variants } from "framer-motion";

/**
 * The day, as a timed sequence instead of four feature cards.
 *
 * What this product actually has is a clock: the task changes at midnight UTC, testing is free,
 * submitting happens once. That is a real sequence, so a time column carries information rather
 * than decorating one.
 *
 * Every line is verifiable in the code: the daily is derived from the UTC calendar day
 * (`lib/server/challenge-day.ts`), `/api/challenge/[id]/run` has no limit, a second submission is
 * refused with 409 even after a failed one, and the streak counts consecutive UTC days with a
 * passing submission (`lib/server/streak.ts`).
 */
const DAY = [
  {
    when: "00:00 UTC",
    what: "Neue Aufgabe",
    detail:
      "Für alle dieselbe. Sie ergibt sich aus dem Kalendertag, nicht aus deinem Profil.",
  },
  {
    when: "danach",
    what: "Testen",
    detail:
      "Im Browser, in deiner Sprache. So oft du willst.",
  },
  {
    when: "einmal",
    what: "Abgeben",
    detail: "Ein Versuch. Bestanden oder nicht, damit ist der Tag erledigt.",
  },
  {
    when: "23:59 UTC",
    what: "Streak",
    detail: "Ein gelöster Tag verlängert ihn. Ein übersprungener setzt ihn auf null.",
  },
];

const container: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120 } },
};

export function LandingFeatures() {
  return (
    /* Only a top border: the countdown section below shares this background, and a line between
       them would split what is meant to read as one block.

       `id="features"` is the hero button's target, and stays here now that the button says
       "SO LÄUFT EIN TAG". The section below used to hold it; two anchors of the same name would
       leave the jump to document order. */
    <section
      id="features"
      className="relative overflow-hidden border-t border-border bg-[#020912] pb-12"
    >
      <div className="relative">
        {/*
          One bloom, on the side the grey section below does not start on, and inside the table
          block rather than the section: over the artwork it would wash out the night sky, which
          is why it was taken out here in the first place.

          Lime instead of the component's violet, and thinner still: the primary is a far brighter
          colour than chart-5, and on `#020912` a haze reads much more readily than it does on the
          grey `bg-card/50`. The violet stays with the grey section in between.
        */}
        <AmbientGlow side="left" className="bg-primary/6" />
        <AmbientGlow side="right" className="bg-primary/10" />
        <motion.div
          className="relative mx-auto max-w-6xl px-4 pt-24 pb-16 sm:px-6 lg:px-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={container}
        >
          <motion.div variants={item} className="max-w-2xl">
            <p className="font-code text-xs uppercase tracking-[0.2em] text-primary">
              Von Mitternacht zu Mitternacht
            </p>
            <h2 className="mt-4 font-heading text-2xl leading-tight sm:text-3xl">
              EIN TAG AUF
              <br />
              DAILY CODING
            </h2>
          </motion.div>

          <div className="mt-14 border-t border-border">
            {DAY.map((step) => (
              <motion.div
                key={step.what}
                variants={item}
                className="grid grid-cols-1 gap-2 border-b border-border py-6 sm:grid-cols-[9rem_1fr] sm:gap-8"
              >
                <span className="font-code text-sm text-primary sm:pt-1">
                  {step.when}
                </span>
                <div className="sm:flex sm:items-baseline sm:gap-6">
                  <h3 className="font-heading text-base sm:w-40 sm:shrink-0">
                    {step.what}
                  </h3>
                  <p className="mt-2 text-lg text-muted-foreground sm:mt-0">
                    {step.detail}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/*
        Hidden for now, kept for later. It closed the section rather than heading it: the table
        walks from 00:00 to 23:59, so the picture was the moment right after the last row.
        Full-bleed, outside the container, so the section edge is the edge of the picture.

        No fade needed, the top pixel row of the artwork is #020912, the section's own colour.
        The height is 648 and not the 724 of the other banner; a wrong ratio reserves the wrong
        height and the section jumps once the file has loaded.

        <Image
          src="/pixel/banner6.webp"
          alt="Nachtszene als Pixelgrafik: links eine Werkstatt mit grün leuchtendem Fenster, in der Mitte ein kahler Baum auf einem Hügel, rechts ein Uhrturm vor dem Vollmond, dessen Zeiger auf Mitternacht stehen"
          width={2172}
          height={648}
          sizes="100vw"
          className="block h-auto w-full [image-rendering:pixelated]"
        />
      */}
    </section>
  );
}
