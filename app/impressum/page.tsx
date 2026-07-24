import type { Metadata } from "next";
import { LandingNavbar } from "@/components/landing/navbar";
import { LandingFooter } from "@/components/landing/footer";

export const metadata: Metadata = {
  title: "Impressum – Daily Dev",
};

// ponytail: statischer Rechtstext. Vor dem Launch juristisch prüfen lassen.
export default function ImpressumPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <LandingNavbar />
      <main className="mx-auto max-w-3xl px-4 pt-32 pb-16 sm:px-6 lg:px-8">
        <h1 className="font-pixel text-2xl mb-8 uppercase tracking-wide">
          Impressum
        </h1>

        <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="font-heading text-base text-foreground mb-2">
              Angaben gemäß § 5 DDG
            </h2>
            <p>
              Leonid Domahalskyy
              <br />
              Rude 13
              <br />
              24941 Flensburg
              <br />
              Deutschland
            </p>
          </section>

          <section>
            <h2 className="font-heading text-base text-foreground mb-2">
              Kontakt
            </h2>
            <p>
              E-Mail:{" "}
              <a
                href="mailto:leonid.domagalsky@gmail.com"
                className="text-primary hover:underline"
              >
                leonid.domagalsky@gmail.com
              </a>
              <br />
              Telefon:{" "}
              <a href="tel:+4915205892880" className="text-primary hover:underline">
                015205892880
              </a>
            </p>
          </section>

          <section>
            <h2 className="font-heading text-base text-foreground mb-2">
              Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV
            </h2>
            <p>
              Leonid Domahalskyy
              <br />
              Rude 13
              <br />
              24941 Flensburg
            </p>
          </section>

          <section>
            <h2 className="font-heading text-base text-foreground mb-2">
              Streitschlichtung
            </h2>
            <p>
              Die Europäische Kommission stellt eine Plattform zur
              Online-Streitbeilegung (OS) bereit:{" "}
              <a
                href="https://ec.europa.eu/consumers/odr/"
                className="text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://ec.europa.eu/consumers/odr/
              </a>
              . Wir sind nicht bereit und nicht verpflichtet, an
              Streitbeilegungsverfahren vor einer
              Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-base text-foreground mb-2">
              Haftung für Inhalte
            </h2>
            <p>
              Als Diensteanbieter sind wir gemäß § 7 Abs. 1 DDG für eigene
              Inhalte auf diesen Seiten nach den allgemeinen Gesetzen
              verantwortlich. Nach §§ 8 bis 10 DDG sind wir als Diensteanbieter
              jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde
              Informationen zu überwachen oder nach Umständen zu forschen, die
              auf eine rechtswidrige Tätigkeit hinweisen.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-base text-foreground mb-2">
              Haftung für Links
            </h2>
            <p>
              Unser Angebot enthält Links zu externen Websites Dritter, auf
              deren Inhalte wir keinen Einfluss haben. Deshalb können wir für
              diese fremden Inhalte auch keine Gewähr übernehmen. Für die
              Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter
              oder Betreiber der Seiten verantwortlich.
            </p>
          </section>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
