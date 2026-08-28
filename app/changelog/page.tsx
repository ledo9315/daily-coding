import type { Metadata } from "next";
import { LandingNavbar } from "@/components/landing/navbar";
import { LandingFooter } from "@/components/landing/footer";
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
    <div className="flex min-h-screen flex-col bg-background text-foreground font-sans">
      <LandingNavbar />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pt-32 pb-16 sm:px-6 lg:px-8">
        <h1 className="font-pixel text-2xl mb-2 uppercase tracking-wide">Changelog</h1>
        <p className="mb-12 text-sm text-muted-foreground">
          Was sich zuletzt geändert hat, neuestes Release zuerst.
        </p>

        {CHANGELOG.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Hier steht noch nichts. Sobald das erste Release veröffentlicht ist,
            findest du an dieser Stelle, was sich geändert hat.
          </p>
        ) : (
          <ol className="space-y-12">
            {CHANGELOG.map((entry) => (
              <li key={entry.version}>
                <div className="mb-4 flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-border pb-3">
                  <h2 className="font-pixel text-base uppercase tracking-wide text-primary">
                    {entry.version}
                  </h2>
                  <time
                    dateTime={entry.date}
                    className="font-code text-xs text-muted-foreground"
                  >
                    {dateFormat.format(new Date(entry.date))}
                  </time>
                </div>
                <ul className="space-y-3 text-sm leading-relaxed text-muted-foreground">
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
