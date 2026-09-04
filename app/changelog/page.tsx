import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { LandingNavbar } from "@/components/landing/navbar";
import { PageAmbience } from "@/components/page-ambience";
import { MarkChangelogSeen } from "@/components/changelog-link";
import { CHANGELOG } from "@/lib/changelog";
import { formatLongDate } from "@/lib/format";
import { DEFAULT_LOCALE, isAppLocale } from "@/lib/locale";
import { localizedAlternates } from "@/lib/server/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("changelog");

  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: await localizedAlternates("/changelog"),
  };
}

export default async function ChangelogPage() {
  const locale = await getLocale();
  const t = await getTranslations("changelog");
  // `getLocale()` is typed as `string`, and the release prose is keyed by `AppLocale`.
  const contentLocale = isAppLocale(locale) ? locale : DEFAULT_LOCALE;

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background text-foreground font-sans">
      <PageAmbience />
      <MarkChangelogSeen />
      <LandingNavbar />
      <main className="relative mx-auto w-full max-w-3xl flex-1 px-4 pt-32 pb-16 sm:px-6 lg:px-8">
        <h1 className="mb-2 font-pixel text-3xl uppercase tracking-tight">
          {t("page.title")}
        </h1>
        <p className="mb-12 text-base leading-relaxed text-muted-foreground">
          {t("page.intro")}
        </p>

        {CHANGELOG.length === 0 ? (
          <p className="text-base leading-relaxed text-muted-foreground">
            {t("page.empty")}
          </p>
        ) : (
          <ol className="space-y-12">
            {CHANGELOG.map((entry) => (
              <li key={entry.version}>
                <div className="mb-4 flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-border pb-3">
                  <h2 className="font-pixel text-lg uppercase tracking-tight text-primary">
                    {entry.version}
                  </h2>
                  <time
                    dateTime={entry.date}
                    className="font-code text-sm text-muted-foreground"
                  >
                    {formatLongDate(new Date(entry.date), locale)}
                  </time>
                </div>
                {/* The list is the whole page; muted small type made the one thing anyone
                    comes here to read the quietest thing on it. */}
                <ul className="space-y-3 text-base leading-relaxed text-foreground">
                  {entry.changes[contentLocale].map((change) => (
                    <li key={change} className="flex gap-3">
                      <span aria-hidden className="text-primary">
                        {">"}
                      </span>
                      <span>{change}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        )}
      </main>
    </div>
  );
}
