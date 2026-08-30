import type { Metadata } from "next";
import { LandingNavbar } from "@/components/landing/navbar";
import { LandingFooter } from "@/components/landing/footer";
import { PageAmbience } from "@/components/page-ambience";
import { MarkChangelogSeen } from "@/components/changelog-link";
import { CHANGELOG } from "@/lib/changelog";

export const metadata: Metadata = {
  title: "Changelog",
  description: "Was sich bei Daily Coding zuletzt geändert hat, Release für Release.",
  alternates: { canonical: "/changelog" },
};

const dateFormat = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

export default function ChangelogPage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background text-foreground font-sans">
      <PageAmbience />
      <MarkChangelogSeen />
      <LandingNavbar />
      <main className="relative mx-auto w-full max-w-3xl flex-1 px-4 pt-32 pb-16 sm:px-6 lg:px-8">
        <h1 className="mb-2 font-pixel text-3xl uppercase tracking-tight">Changelog</h1>
        <p className="mb-12 text-base leading-relaxed text-muted-foreground">
          Was sich zuletzt geändert hat, neuestes Release zuerst.
        </p>

        {CHANGELOG.length === 0 ? (
          <p className="text-base leading-relaxed text-muted-foreground">
            Hier steht noch nichts. Sobald das erste Release veröffentlicht ist,
            findest du an dieser Stelle, was sich geändert hat.
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
                    {dateFormat.format(new Date(entry.date))}
                  </time>
                </div>
                {/* The list is the whole page; muted small type made the one thing anyone
                    comes here to read the quietest thing on it. */}
                <ul className="space-y-3 text-base leading-relaxed text-foreground">
                  {entry.changes.map((change) => (
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
      <LandingFooter />
    </div>
  );
}
