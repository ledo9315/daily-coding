"use client";

import { AmbientGlow } from "@/components/landing/ambient-glow";
import { motion, type Variants } from "framer-motion";
import { useTranslations } from "next-intl";

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
 *
 * Only the ids live here; time, heading and body come from `dashboard.day.steps`. The order is
 * the sequence and therefore belongs in the code, not in a message file.
 */
const DAY = ["newTask", "test", "submit", "streak"] as const;

const container: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120 } },
};

export function LandingFeatures() {
  const t = useTranslations("dashboard");

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
              {t("day.eyebrow")}
            </p>
            {/* eslint-disable no-restricted-syntax -- „DAILY CODING" is the product name, not copy. */}
            <h2 className="mt-4 font-heading text-2xl leading-tight sm:text-3xl">
              {t("day.heading")}
              <br />
              DAILY CODING
            </h2>
            {/* eslint-enable no-restricted-syntax */}
          </motion.div>

          <div className="mt-14 border-t border-border">
            {DAY.map((step) => (
              <motion.div
                key={step}
                variants={item}
                className="grid grid-cols-1 gap-2 border-b border-border py-6 sm:grid-cols-[9rem_1fr] sm:gap-8"
              >
                <span className="font-code text-sm text-primary sm:pt-1">
                  {t(`day.steps.${step}.when`)}
                </span>
                <div className="sm:flex sm:items-baseline sm:gap-6">
                  <h3 className="font-heading text-base sm:w-40 sm:shrink-0">
                    {t(`day.steps.${step}.what`)}
                  </h3>
                  <p className="mt-2 text-lg text-muted-foreground sm:mt-0">
                    {t(`day.steps.${step}.detail`)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
