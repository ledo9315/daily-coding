import Link from "next/link";

/**
 * One row instead of a four-column grid.
 *
 * Two of the four columns were commented-out placeholder links (Über uns, Blog, Karriere, Kontakt,
 * all `href="#"`), so the grid rendered two thirds empty. What is actually here is a brand, two
 * legal pages and a line of small print — which fits on one row.
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

        <nav className="flex items-center gap-6 font-code text-sm text-muted-foreground">
          <Link href="/impressum" className="hover:text-primary">
            Impressum
          </Link>
          <Link href="/datenschutz" className="hover:text-primary">
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
