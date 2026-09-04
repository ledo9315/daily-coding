import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LandingNavbar } from "@/components/landing/navbar";
import { localizedAlternates } from "@/lib/server/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("legal");

  return {
    title: t("imprint.meta.title"),
    description: t("imprint.meta.description"),
    alternates: await localizedAlternates("/impressum"),
  };
}

// ponytail: static legal text. Have it reviewed by a lawyer before launch.
export default async function ImpressumPage() {
  const t = await getTranslations("legal");

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground font-sans">
      <LandingNavbar />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pt-32 pb-16 sm:px-6 lg:px-8">
        <h1 className="font-pixel text-2xl mb-8 uppercase tracking-wide">
          {t("imprint.title")}
        </h1>

        <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="font-heading text-base text-foreground mb-2">
              {t("imprint.provider.title")}
            </h2>
            <p>
              {t("provider.name")}
              <br />
              {t("provider.street")}
              <br />
              {t("provider.city")}
              <br />
              {t("provider.country")}
            </p>
          </section>

          <section>
            <h2 className="font-heading text-base text-foreground mb-2">
              {t("imprint.contact.title")}
            </h2>
            <p>
              {t("provider.emailLabel")}{" "}
              <a
                href={`mailto:${t("provider.email")}`}
                className="text-primary hover:underline"
              >
                {t("provider.email")}
              </a>
              <br />
              {t("provider.phoneLabel")}{" "}
              <a href="tel:+4915205892880" className="text-primary hover:underline">
                {t("provider.phone")}
              </a>
            </p>
          </section>

          <section>
            <h2 className="font-heading text-base text-foreground mb-2">
              {t("imprint.responsible.title")}
            </h2>
            <p>
              {t("provider.name")}
              <br />
              {t("provider.street")}
              <br />
              {t("provider.city")}
            </p>
          </section>

          <section>
            <h2 className="font-heading text-base text-foreground mb-2">
              {t("imprint.dispute.title")}
            </h2>
            <p>
              {t("imprint.dispute.platform")}{" "}
              {/* eslint-disable no-restricted-syntax -- a bare URL, printed as its own link text. */}
              <a
                href="https://ec.europa.eu/consumers/odr/"
                className="text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://ec.europa.eu/consumers/odr/
              </a>
              {/* eslint-enable no-restricted-syntax */}
              {". "}
              {t("imprint.dispute.notice")}
            </p>
          </section>

          <section>
            <h2 className="font-heading text-base text-foreground mb-2">
              {t("imprint.contentLiability.title")}
            </h2>
            <p>{t("imprint.contentLiability.body")}</p>
          </section>

          <section>
            <h2 className="font-heading text-base text-foreground mb-2">
              {t("imprint.linkLiability.title")}
            </h2>
            <p>{t("imprint.linkLiability.body")}</p>
          </section>
        </div>
      </main>
    </div>
  );
}
