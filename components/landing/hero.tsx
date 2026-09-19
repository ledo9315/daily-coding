"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowDown, Check, Flame, Terminal } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

export function LandingHero({
  todaysChallengeTitle,
}: {
  todaysChallengeTitle: string | null;
}) {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const badge = todaysChallengeTitle
    ? t("hero.todaysChallenge", { title: todaysChallengeTitle })
    : null;

  return (
    <section className="lp-hero">
      <div className="lp-container lp-hero-grid">
        <div className="lp-hero-copy">
          {badge ? (
            <a href="/challenge" className="lp-today" aria-label={badge}>
              <span />
              {badge}
              <ArrowRight size={14} aria-hidden />
            </a>
          ) : null}
          <h1>
            {t("hero.headlineLine1")}
            <br />
            {t("hero.headlineLine2")}
          </h1>
          <p className="lp-lead">{t("hero.subline")}</p>
          <div className="lp-actions">
            <Link href="/register" className="lp-button lp-button-primary">
              {t("landing.signup")}
              <ArrowRight size={18} aria-hidden />
            </Link>
            <a href="#product-tour" className="lp-button lp-button-secondary">
              {t("landing.explore")}
              <ArrowDown size={17} aria-hidden />
            </a>
          </div>
          <p className="lp-reassurance">
            <Check size={15} aria-hidden />
            {t("landing.noSetup")}
          </p>
          <div className="lp-hero-footnote">
            <Terminal size={20} aria-hidden />
            <span>{t("landing.heroNote")}</span>
          </div>
        </div>
        <div className="lp-hero-visual">
          <div className="lp-window">
            <div className="lp-window-bar">
              <span className="lp-window-dots" aria-hidden>
                <i />
                <i />
                <i />
              </span>
              <span>{t("landing.yourDashboard")}</span>
              <span className="lp-preview-label">{t("landing.preview")}</span>
            </div>
            <a href="#product-tour" aria-label={t("landing.explore")}>
              <Image
                src={locale === "de" ? "/screen.de.webp" : "/screen.en.webp"}
                alt={t("hero.screenshotAlt")}
                width={3338}
                height={2296}
                sizes="(max-width: 900px) 92vw, 740px"
                loading="eager"
                fetchPriority="high"
                className="lp-dashboard-image"
              />
            </a>
          </div>
          <div className="lp-streak-sticker">
            <Flame size={25} aria-hidden />
            <div>
              <strong>{t("landing.streakTitle")}</strong>
              <span>{t("landing.streakDetail")}</span>
            </div>
          </div>
          <div className="lp-visual-caption">
            <span aria-hidden>↳</span>
            {t("landing.screenCaption")}
          </div>
        </div>
      </div>
      <div className="lp-container lp-value-strip">
        {(["daily", "languages", "progress"] as const).map((key) => (
          <div key={key}>
            <span className="lp-value-dot" />
            <span>{t(`landing.values.${key}`)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
