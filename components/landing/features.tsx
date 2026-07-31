"use client";

import { motion, Variants } from "framer-motion";

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
      "Im Browser, in JavaScript, TypeScript, Python oder PHP. So oft du willst.",
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

       `id="features"` is the hero button's target. It lived on the section that is currently
       commented out in `landing-page.tsx`; if that one comes back, one of the two has to give up
       the anchor. */
    <section id="features" className="border-t border-border bg-[#020912]">
      <motion.div
        className="mx-auto max-w-6xl px-4 pt-24 pb-16 sm:px-6 lg:px-8"
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

    </section>
  );
}
