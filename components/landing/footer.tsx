import Link from "next/link";

const REPOSITORY_URL = "https://github.com/ledo9315/daily-coding-challenge";
const BUG_REPORT_URL = `${REPOSITORY_URL}/issues/new?template=bug_report.yml`;
const SUPPORT_EMAIL = "leonid.domahalskyy@icloud.com";
const footerLinkClass = "transition-colors hover:text-primary focus-visible:text-primary";

/**
 * One row instead of a four-column grid.
 *
 * Two of the four columns were commented-out placeholder links (Über uns, Blog, Karriere, Kontakt,
 * all `href="#"`), so the grid rendered two thirds empty. What is actually here is a brand, two
 * legal pages and a line of small print - which fits on one row. Repository, feedback and
 * support now sit beside the legal links and wrap as a compact link rail on small screens.
 */
export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-card py-10 text-card-foreground">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="font-pixel text-xl tracking-tighter text-primary">
            {">_"}
          </span>
          <span className="font-pixel text-xs tracking-tight text-foreground">
            DAILY CODING
          </span>
        </Link>

        <nav
          aria-label="Footer-Navigation"
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 font-code text-sm text-muted-foreground sm:justify-end"
        >
          <a
            href={REPOSITORY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={footerLinkClass}
            aria-label="GitHub-Repository in neuem Tab öffnen"
          >
            GitHub
          </a>
          <a
            href={BUG_REPORT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={footerLinkClass}
            aria-label="Fehler auf GitHub in neuem Tab melden"
          >
            Fehler melden
          </a>
          <a href={`mailto:${SUPPORT_EMAIL}`} className={footerLinkClass}>
            Support
          </a>
          <Link href="/changelog" className={footerLinkClass}>
            Changelog
          </Link>
          <Link href="/impressum" className={footerLinkClass}>
            Impressum
          </Link>
          <Link href="/datenschutz" className={footerLinkClass}>
            Datenschutz
          </Link>
        </nav>
      </div>

      <p className="mx-auto mt-8 max-w-6xl px-4 font-code text-xs text-muted-foreground sm:px-6 lg:px-8">
        {new Date().getFullYear()} Daily Coding. Gemacht mit Pixeln.
      </p>
    </footer>
  );
}
