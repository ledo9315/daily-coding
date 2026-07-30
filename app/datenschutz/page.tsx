import type { Metadata } from "next";
import { LandingNavbar } from "@/components/landing/navbar";
import { LandingFooter } from "@/components/landing/footer";

export const metadata: Metadata = {
  title: "Datenschutzerklärung – Daily Coding",
};

export default function DatenschutzPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <LandingNavbar />
      <main className="mx-auto max-w-3xl px-4 pt-32 pb-16 sm:px-6 lg:px-8">
        <h1 className="font-pixel text-2xl mb-8 uppercase tracking-wide">
          Datenschutz&shy;erklärung
        </h1>

        <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="font-heading text-base text-foreground mb-2">
              1. Verantwortlicher
            </h2>
            <p>
              Verantwortlich für die Datenverarbeitung auf dieser Website ist:
            </p>
            <p className="mt-2">
              Leonid Domahalskyy
              <br />
              Rude 13
              <br />
              24941 Flensburg
              <br />
              Deutschland
              <br />
              E-Mail:{" "}
              <a
                href="mailto:leonid.domagalsky@gmail.com"
                className="text-primary hover:underline"
              >
                leonid.domagalsky@gmail.com
              </a>
              <br />
              Telefon: 015205892880
            </p>
          </section>

          <section>
            <h2 className="font-heading text-base text-foreground mb-2">
              2. Verarbeitung bei Registrierung und Konto
            </h2>
            <p>
              Zur Nutzung von Daily Coding legst du ein Nutzerkonto an. Dabei
              verarbeiten wir deinen Namen, deine E-Mail-Adresse und dein
              Passwort. Das Passwort wird ausschließlich als kryptografischer
              Hash (bcrypt) gespeichert – es ist uns zu keiner Zeit im Klartext
              zugänglich. Zur Verifizierung deiner E-Mail-Adresse und für das
              Zurücksetzen des Passworts erzeugen wir zeitlich befristete Token.
            </p>
            <p className="mt-2">
              Rechtsgrundlage ist die Erfüllung des Nutzungsvertrags gemäß
              Art. 6 Abs. 1 lit. b DSGVO.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-base text-foreground mb-2">
              3. Anmeldung über Drittanbieter (OAuth)
            </h2>
            <p>
              Sofern du dich über GitHub oder Google anmeldest, erhalten wir von
              dem jeweiligen Anbieter deine E-Mail-Adresse, deinen Namen und
              gegebenenfalls dein Profilbild, um dein Konto anzulegen bzw. zu
              verknüpfen. Es werden keine Passwörter der Drittanbieter an uns
              übertragen. Rechtsgrundlage ist deine Einwilligung durch die
              Auswahl des Anmeldedienstes (Art. 6 Abs. 1 lit. a DSGVO) sowie die
              Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO).
            </p>
          </section>

          <section>
            <h2 className="font-heading text-base text-foreground mb-2">
              4. Nutzungsdaten (Challenges, Ranking, Streaks)
            </h2>
            <p>
              Wenn du Coding-Challenges bearbeitest, speichern wir den von dir
              eingereichten Quellcode, die gewählte Programmiersprache, den
              Lösungsstatus sowie daraus abgeleitete Punkte-, Ranglisten- und
              Streak-Daten. Diese Daten sind für die Kernfunktion der Plattform
              (Bewertung, Bestenliste, Fortschritt) erforderlich.
              Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO sowie unser
              berechtigtes Interesse an einer funktionsfähigen Plattform
              (Art. 6 Abs. 1 lit. f DSGVO).
            </p>
            <p>
              Für andere angemeldete Nutzer sichtbar sind dabei dein Name, dein
              gewählter Avatar, dein Level und die von dir gelösten Challenges
              — in der Bestenliste und im Community-Feed. Dein eingereichter
              Quellcode ist für andere Nutzer nicht sichtbar.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-base text-foreground mb-2">
              5. Ausführung von Quellcode
            </h2>
            <p>
              Zur Bewertung deiner Lösungen wird der eingereichte Code in einer
              isolierten, selbst betriebenen Ausführungsumgebung (Sandbox)
              ausgeführt. Diese läuft auf einem Server der Hetzner Online GmbH
              in Nürnberg, die insoweit als Auftragsverarbeiter
              (Art. 28 DSGVO) für uns tätig ist. Der Code wird ausschließlich
              zum Zweck der Bewertung verarbeitet und nicht an unbeteiligte
              Dritte weitergegeben.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-base text-foreground mb-2">
              6. E-Mail-Versand
            </h2>
            <p>
              Für den Versand von System-E-Mails (E-Mail-Verifizierung,
              Passwort-Zurücksetzen, Willkommens- und
              Konto-Löschbestätigungen) setzen wir den Dienstleister Resend
              (Resend, Inc.) als Auftragsverarbeiter ein. Dabei wird deine
              E-Mail-Adresse an den Dienstleister übermittelt; der Versand
              erfolgt über dessen Infrastruktur in Irland. Rechtsgrundlage ist
              Art. 6 Abs. 1 lit. b und lit. f DSGVO.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-base text-foreground mb-2">
              7. Hosting und Datenbank
            </h2>
            <p>
              Diese Website wird bei der Vercel Inc. betrieben; die Datenbank
              wird bei Neon in einem Rechenzentrum in Frankfurt am Main
              gehostet. Beide verarbeiten die oben genannten Daten in unserem
              Auftrag als Auftragsverarbeiter (Art. 28 DSGVO). Beim Aufruf der
              Website werden serverseitig technisch notwendige Zugriffsdaten
              (z. B. IP-Adresse, Zeitpunkt, aufgerufene Ressource) verarbeitet,
              um den sicheren und stabilen Betrieb zu gewährleisten
              (Art. 6 Abs. 1 lit. f DSGVO). Vercel Inc. und Resend, Inc. sind
              US-Unternehmen; soweit dabei Daten außerhalb der EU/des EWR
              verarbeitet werden, erfolgt dies auf Grundlage geeigneter
              Garantien (z. B. EU-Standardvertragsklauseln). Die Datenbank und
              die Ausführungsumgebung für Quellcode liegen innerhalb der EU.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-base text-foreground mb-2">
              8. Reichweitenmessung
            </h2>
            <p>
              Zur Auswertung der Seitennutzung setzen wir Vercel Web Analytics
              der Vercel Inc. ein. Erhoben werden aufgerufene Seiten,
              Verweisquelle, Gerätetyp und Land. Der Dienst arbeitet ohne
              Cookies und ohne Speicherung deiner IP-Adresse; es werden keine
              geräteübergreifenden Profile gebildet. Rechtsgrundlage ist unser
              berechtigtes Interesse an der statistischen Auswertung der
              Nutzung (Art. 6 Abs. 1 lit. f DSGVO).
            </p>
          </section>

          <section>
            <h2 className="font-heading text-base text-foreground mb-2">
              9. Cookies
            </h2>
            <p>
              Wir verwenden ein technisch notwendiges Cookie, um deine
              Anmeldung (Session) aufrechtzuerhalten. Dieses Cookie ist für den
              Betrieb des Login-Bereichs erforderlich; Rechtsgrundlage ist
              § 25 Abs. 2 TDDDG sowie Art. 6 Abs. 1 lit. f DSGVO. Tracking- oder
              Marketing-Cookies setzen wir nicht ein.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-base text-foreground mb-2">
              10. Speicherdauer
            </h2>
            <p>
              Wir speichern deine Daten, solange dein Konto besteht. Du kannst
              dein Konto jederzeit selbst in den Einstellungen löschen; dabei
              werden deine personenbezogenen Daten sowie die zugehörigen
              Einreichungen, Ranglisten- und Token-Daten gelöscht, sofern keine
              gesetzlichen Aufbewahrungspflichten entgegenstehen.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-base text-foreground mb-2">
              11. Deine Rechte
            </h2>
            <p>
              Dir stehen im Rahmen der gesetzlichen Vorgaben die folgenden
              Rechte zu: Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16 DSGVO),
              Löschung (Art. 17 DSGVO), Einschränkung der Verarbeitung
              (Art. 18 DSGVO), Datenübertragbarkeit (Art. 20 DSGVO) sowie
              Widerspruch gegen die Verarbeitung (Art. 21 DSGVO). Eine erteilte
              Einwilligung kannst du jederzeit mit Wirkung für die Zukunft
              widerrufen. Zur Ausübung genügt eine Nachricht an die oben
              genannten Kontaktdaten.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-base text-foreground mb-2">
              12. Beschwerderecht
            </h2>
            <p>
              Du hast das Recht, dich bei einer Datenschutz-Aufsichtsbehörde zu
              beschweren. Für uns zuständig ist das Unabhängige Landeszentrum
              für Datenschutz Schleswig-Holstein (ULD), Holstenstraße 98,
              24103 Kiel.
            </p>
          </section>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
