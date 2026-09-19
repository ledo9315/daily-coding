import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Flame, Trophy, Users } from "lucide-react";
import { useTranslations } from "next-intl";

export function LandingProgression() {
  const t = useTranslations("dashboard.landing.progression");
  return (
    <section className="lp-container lp-section lp-progression">
      <div className="lp-progress-art">
        <Image
          src="/landing/level-up.webp"
          alt={t("alt")}
          width={1536}
          height={1024}
          sizes="(max-width: 900px) 92vw, 620px"
        />
        <div className="lp-art-caption">{t("artCaption")}</div>
      </div>
      <div className="lp-progress-copy">
        <p className="lp-kicker">{t("eyebrow")}</p>
        <h2>{t("title")}</h2>
        <p className="lp-lead">{t("intro")}</p>
        <div className="lp-benefits">
          {(
            [
              { id: "streak", icon: Flame },
              { id: "level", icon: Trophy },
              { id: "community", icon: Users },
            ] as const
          ).map(({ id, icon: Icon }) => (
            <div key={id}>
              <span className={`lp-benefit-icon lp-benefit-${id}`}>
                <Icon size={22} aria-hidden />
              </span>
              <div>
                <h3>{t(`${id}.title`)}</h3>
                <p>{t(`${id}.body`)}</p>
              </div>
            </div>
          ))}
        </div>
        <Link href="/register" className="lp-text-link">
          {t("action")}
          <ArrowRight size={18} aria-hidden />
        </Link>
      </div>
    </section>
  );
}

export function LandingFAQ() {
  const t = useTranslations("dashboard.landing.faq");
  return (
    <section className="lp-container lp-section lp-faq">
      <div>
        <p className="lp-kicker">{t("eyebrow")}</p>
        <h2>{t("title")}</h2>
      </div>
      <div>
        {["cost", "skill", "languages", "rules"].map((id) => (
          <details key={id}>
            <summary>
              {t(`${id}.question`)}
              <span aria-hidden>+</span>
            </summary>
            <p>{t(`${id}.answer`)}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
