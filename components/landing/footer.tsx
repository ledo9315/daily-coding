import { Terminal } from "lucide-react";
import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-card text-card-foreground py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link href="/" className="flex items-center gap-3 group mb-4">
            <span className="text-xl font-pixel tracking-tighter text-primary">
              {">_"}
            </span>
            <span className="font-pixel text-xs text-foreground tracking-tight">
              DAILY DEV
            </span>
          </Link>
          <p className="text-sm text-muted-foreground">
            Tägliche Coding-Challenges für Teams und Einzelpersonen. Optimiere
            deine Skills.
          </p>
        </div>

        <div>
          <h4 className="font-heading text-sm mb-4">PLATTFORM</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="#" className="hover:text-primary">
                Challenges
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-primary">
                Bestenliste
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-primary">
                Teams
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-primary">
                Preise
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-heading text-sm mb-4">FIRMA</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="#" className="hover:text-primary">
                Über uns
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-primary">
                Blog
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-primary">
                Karriere
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-primary">
                Kontakt
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-heading text-sm mb-4">RECHTLICHES</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="#" className="hover:text-primary">
                Datenschutz
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-primary">
                AGB
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="mt-12 pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
        {new Date().getFullYear()} Daily Coding. Gemacht mit Pixeln.
      </div>
    </footer>
  );
}
