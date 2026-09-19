import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";

export function LandingCTA() {
  const t = useTranslations("dashboard.landing.close");
  return (
    <section className="lp-close">
      <div className="lp-container lp-close-content">
        <p className="lp-kicker">{t("eyebrow")}</p>
        <h2>{t("title")}</h2>
        <p>{t("body")}</p>
        <div className="lp-actions">
          <Link href="/register" className="lp-button lp-button-primary">
            {t("action")}
            <ArrowRight size={18} aria-hidden />
          </Link>
          <Link href="/challenge" className="lp-button lp-button-secondary">
            {t("guest")}
          </Link>
        </div>
      </div>
      <Image
        src="/pixel/banner3.webp"
        alt=""
        width={2172}
        height={724}
        sizes="100vw"
        className="lp-close-art"
      />
    </section>
  );
}
