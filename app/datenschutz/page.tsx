import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LandingNavbar } from "@/components/landing/navbar";
import { localizedAlternates } from "@/lib/server/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("legal");

  return {
    title: t("privacy.meta.title"),
    description: t("privacy.meta.description"),
    alternates: await localizedAlternates("/datenschutz"),
  };
}

export default async function DatenschutzPage() {
  const t = await getTranslations("legal");

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground font-sans">
      <LandingNavbar />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pt-32 pb-16 sm:px-6 lg:px-8">
        <h1 className="font-pixel text-2xl mb-8 uppercase tracking-wide">
          {t("privacy.title")}
        </h1>

        <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="font-heading text-base text-foreground mb-2">
              {t("privacy.controller.title")}
            </h2>
            <p>{t("privacy.controller.intro")}</p>
            <p className="mt-2">
              {t("provider.name")}
              <br />
              {t("provider.street")}
              <br />
              {t("provider.city")}
              <br />
              {t("provider.country")}
              <br />
              {t("provider.emailLabel")}{" "}
              <a
                href={`mailto:${t("provider.email")}`}
                className="text-primary hover:underline"
              >
                {t("provider.email")}
              </a>
              <br />
              {t("provider.phoneLabel")} {t("provider.phone")}
            </p>
          </section>

          <section>
            <h2 className="font-heading text-base text-foreground mb-2">
              {t("privacy.registration.title")}
            </h2>
            <p>{t("privacy.registration.p1")}</p>
            <p className="mt-2">{t("privacy.registration.p2")}</p>
          </section>

          <section>
            <h2 className="font-heading text-base text-foreground mb-2">
              {t("privacy.oauth.title")}
            </h2>
            <p>{t("privacy.oauth.p1")}</p>
          </section>

          <section>
            <h2 className="font-heading text-base text-foreground mb-2">
              {t("privacy.usageData.title")}
            </h2>
            <p>{t("privacy.usageData.p1")}</p>
            <p>{t("privacy.usageData.p2")}</p>
            <p>{t("privacy.usageData.p3")}</p>
          </section>

          <section>
            <h2 className="font-heading text-base text-foreground mb-2">
              {t("privacy.codeExecution.title")}
            </h2>
            <p>{t("privacy.codeExecution.p1")}</p>
          </section>

          <section>
            <h2 className="font-heading text-base text-foreground mb-2">
              {t("privacy.emailDelivery.title")}
            </h2>
            <p>{t("privacy.emailDelivery.p1")}</p>
          </section>

          <section>
            <h2 className="font-heading text-base text-foreground mb-2">
              {t("privacy.hosting.title")}
            </h2>
            <p>{t("privacy.hosting.p1")}</p>
          </section>

          <section>
            <h2 className="font-heading text-base text-foreground mb-2">
              {t("privacy.analytics.title")}
            </h2>
            <p>{t("privacy.analytics.p1")}</p>
          </section>

          <section>
            <h2 className="font-heading text-base text-foreground mb-2">
              {t("privacy.cookies.title")}
            </h2>
            <p>{t("privacy.cookies.p1")}</p>
          </section>

          <section>
            <h2 className="font-heading text-base text-foreground mb-2">
              {t("privacy.retention.title")}
            </h2>
            <p>{t("privacy.retention.p1")}</p>
          </section>

          <section>
            <h2 className="font-heading text-base text-foreground mb-2">
              {t("privacy.rights.title")}
            </h2>
            <p>{t("privacy.rights.p1")}</p>
          </section>

          <section>
            <h2 className="font-heading text-base text-foreground mb-2">
              {t("privacy.complaints.title")}
            </h2>
            <p>{t("privacy.complaints.p1")}</p>
          </section>
        </div>
      </main>
    </div>
  );
}
