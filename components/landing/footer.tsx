import Link from "next/link";
import { ChangelogLink } from "@/components/changelog-link";

const REPOSITORY_URL = "https://github.com/ledo9315/daily-coding-challenge";
const BUG_REPORT_URL = `${REPOSITORY_URL}/issues/new?template=bug_report.yml`;
const SUPPORT_EMAIL = "leonid.domahalskyy@icloud.com";
const footerLinkClass = "transition-colors hover:text-primary focus-visible:text-primary";

/**
 * Brand column plus two labelled link groups, over a separated bottom bar.
 *
 * The four-column grid this replaces was two thirds placeholder links (Über uns, Blog, Karriere,
 * Kontakt, all `href="#"`), so it was cut down to a single row. The row read like an afterthought;
 * the groups below carry only links that exist, which is what the placeholders never did.
 */
export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-card text-card-foreground">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3">
              <span className="font-pixel text-xl tracking-tighter text-primary">
                {">_"}
              </span>
              <span className="font-pixel text-xs tracking-tight text-foreground">
                DAILY CODING
              </span>
            </Link>
            <p className="mt-4 max-w-sm font-code text-sm leading-relaxed text-muted-foreground">
              Löse jeden Tag eine neue Coding-Challenge in deiner Programmiersprache
              und steige im Ranking auf.
            </p>
          </div>

          <nav aria-label="Projekt">
            <h2 className="font-pixel text-xs uppercase tracking-wider text-foreground">
              Projekt
            </h2>
            <ul className="mt-4 space-y-3 font-code text-sm text-muted-foreground">
              <li>
                <a
                  href={REPOSITORY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={footerLinkClass}
                  aria-label="GitHub-Repository in neuem Tab öffnen"
                >
                  GitHub
                </a>
              </li>
              <li>
                <ChangelogLink className={footerLinkClass} />
              </li>
              <li>
                <a
                  href={BUG_REPORT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={footerLinkClass}
                  aria-label="Fehler auf GitHub in neuem Tab melden"
                >
                  Fehler melden
                </a>
              </li>
              <li>
                <a href={`mailto:${SUPPORT_EMAIL}`} className={footerLinkClass}>
                  Support
                </a>
              </li>
            </ul>
          </nav>

          <nav aria-label="Rechtliches">
            <h2 className="font-pixel text-xs uppercase tracking-wider text-foreground">
              Rechtliches
            </h2>
            <ul className="mt-4 space-y-3 font-code text-sm text-muted-foreground">
              <li>
                <Link href="/impressum" className={footerLinkClass}>
                  Impressum
                </Link>
              </li>
              <li>
                <Link href="/datenschutz" className={footerLinkClass}>
                  Datenschutz
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-12 border-t border-border pt-6">
          <p className="font-code text-xs text-muted-foreground">
            © {new Date().getFullYear()} Daily Coding
          </p>
        </div>
      </div>
    </footer>
  );
}
