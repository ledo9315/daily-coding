import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ChangelogLink } from "@/components/changelog-link";

const REPOSITORY_URL = "https://github.com/ledo9315/daily-coding-challenge";
const BUG_REPORT_URL = `${REPOSITORY_URL}/issues/new?template=bug_report.yml`;
const SUPPORT_EMAIL = "leonid.domahalskyy@icloud.com";
const footerLinkClass = "transition-colors hover:text-primary focus-visible:text-primary";

/**
 * Brand column plus two labelled link groups, over a separated bottom bar. Rendered once by
 * the root layout, so Impressum and Datenschutz are one click away from every page (#265).
 *
 * The four-column grid this replaces was two thirds placeholder links (Über uns, Blog, Karriere,
 * Kontakt, all `href="#"`), so it was cut down to a single row. The row read like an afterthought;
 * the groups below carry only links that exist, which is what the placeholders never did.
 */
export async function SiteFooter() {
  const t = await getTranslations("community");

  return (
    // `mt-16` because the footer now follows arbitrary page content: on the challenge page
    // the editor ended and the footer began, with barely a line between them.
    <footer className="mt-16 border-t border-border bg-card text-card-foreground sm:mt-24">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3">
              <span className="font-pixel text-xl tracking-tighter text-primary">
                {">_"}
              </span>
              {/* eslint-disable-next-line no-restricted-syntax -- „DAILY CODING" is the product name, not copy. */}
              <span className="font-pixel text-xs tracking-tight text-foreground">
                DAILY CODING
              </span>
            </Link>
            <p className="mt-4 max-w-sm font-code text-sm leading-relaxed text-muted-foreground">
              {t("footer.tagline")}
            </p>
          </div>

          <nav aria-label={t("footer.project")}>
            <h2 className="font-pixel text-xs uppercase tracking-wider text-foreground">
              {t("footer.project")}
            </h2>
            <ul className="mt-4 space-y-3 font-code text-sm text-muted-foreground">
              <li>
                <a
                  href={REPOSITORY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={footerLinkClass}
                  aria-label={t("footer.githubLabel")}
                >
                  {/* eslint-disable no-restricted-syntax -- provider name, not copy. */}
                  GitHub
                  {/* eslint-enable no-restricted-syntax */}
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
                  aria-label={t("footer.bugReportLabel")}
                >
                  {t("footer.bugReport")}
                </a>
              </li>
              <li>
                <a href={`mailto:${SUPPORT_EMAIL}`} className={footerLinkClass}>
                  {t("footer.support")}
                </a>
              </li>
            </ul>
          </nav>

          <nav aria-label={t("footer.legal")}>
            <h2 className="font-pixel text-xs uppercase tracking-wider text-foreground">
              {t("footer.legal")}
            </h2>
            <ul className="mt-4 space-y-3 font-code text-sm text-muted-foreground">
              <li>
                <Link href="/impressum" className={footerLinkClass}>
                  {t("footer.imprint")}
                </Link>
              </li>
              <li>
                <Link href="/datenschutz" className={footerLinkClass}>
                  {t("footer.privacy")}
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-12 border-t border-border pt-6">
          <p className="font-code text-xs text-muted-foreground">
            {/* A string, not a number: as an ICU argument the year would be grouped
                into „2.026". */}
            {t("footer.copyright", { year: String(new Date().getFullYear()) })}
          </p>
        </div>
      </div>
    </footer>
  );
}
