# Daily Coding
<img width="800" height="462" alt="dashboard" src="https://github.com/user-attachments/assets/726bd133-a25e-449b-805d-e0420d553243" />

Eine Coding-Challenge-Plattform: jeden Tag eine Aufgabe, gelöst im Browser, bewertet gegen echte Testfälle in einer Sandbox. Mit Bestenliste, Streaks, Levels und Abzeichen.

**Live:** [daily-coding.de](https://daily-coding.de)

![Das Dashboard mit Rang, Punkten, Streak und der heutigen Challenge](public/screen2.png)

---

## Was es kann

- **Tägliche Challenge** — eine Aufgabe pro Tag, für alle Nutzer dieselbe. Die Auswahl rotiert deterministisch aus dem UTC-Kalendertag (`lib/server/challenge-day.ts`), es braucht also keinen Cronjob.
- **Fünf Sprachen** — JavaScript, TypeScript, Python, PHP, Java. Der Editor ist Monaco, der Code läuft in einer selbst betriebenen [Piston](https://github.com/engineer-man/piston)-Instanz. Java steht nur bei Aufgaben zur Wahl, deren Testeingaben sich typisieren lassen.
- **Bewertung gegen Testfälle** — der eingereichte Code wird pro Testfall mit einem Harness aufgerufen und das Ergebnis verglichen. Kein Vergleich von Konsolenausgaben.
- **Bestenliste** für Woche und Monat, mit Podium und Platzierungen nach Wettkampfregel (Gleichstand teilt den Platz).
- **Fortschritt** — Punkte, Level, Streak samt Rekord, sechs Abzeichen, Monatsübersicht der gelösten Tage.
- **Community-Feed** — wer hat welche Challenge gelöst und wer ist im Level aufgestiegen.
- **Konten** per E-Mail und Passwort oder über GitHub und Google. E-Mail-Verifizierung, Passwort-Zurücksetzen, Konto-Löschung.
- **Admin-Bereich** zum Anlegen und Bearbeiten von Challenges samt Testfällen.

## Technik

| Bereich | Wahl |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Oberfläche | Tailwind CSS v4, shadcn/ui (Radix), Framer Motion, Pixel-Art-Stil |
| Datenbank | PostgreSQL 17 mit Prisma 7 |
| Anmeldung | Auth.js (NextAuth v5), JWT-Sitzungen |
| Code-Ausführung | Piston in Docker, hinter einem Reverse-Proxy mit Bearer-Token |
| E-Mail | Resend |
| Tests | Vitest, 66 Testdateien |
| Betrieb | Vercel, Neon (Datenbank), Hetzner (Sandbox) |

## Lokal starten

Voraussetzungen: **Node 20 oder neuer** (entwickelt mit 22), **pnpm 11**, **Docker**.

```bash
git clone https://github.com/ledo9315/daily-coding-challenge.git
cd daily-coding-challenge
pnpm install

cp .env.example .env.local          # Werte anpassen, siehe unten
pnpm infra:up                       # PostgreSQL + Piston in Docker
pnpm piston:install                 # Sprachlaufzeiten in den Container laden
pnpm db:migrate && pnpm db:seed     # Schema + Beispieldaten
pnpm dev
```

Danach läuft die App auf `http://localhost:3000`. Der Seed legt Demo-Konten an; anmelden kannst du dich mit `max.mustermann@company.com` und dem Passwort aus `SEED_DEV_PASSWORD` (Standard `DailyDev2024!`).

**Ohne Docker geht es auch** — dann `CODE_EXECUTION_ENABLED=false` setzen. Challenges lassen sich damit nicht lösen, alles andere funktioniert.

### Umgebungsvariablen

`.env.example` beschreibt jede Variable. Das Minimum für die lokale Entwicklung:

```bash
DATABASE_URL=postgresql://daily_dev:daily_dev_secret@localhost:5433/daily_dev
AUTH_SECRET=            # openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000
APP_URL=http://localhost:3000
```

Für den Mailversand kommt `RESEND_API_KEY` hinzu, für die Anmeldung über Dritte die vier `GITHUB_*`- und `GOOGLE_*`-Werte. `.env.production.example` dokumentiert die Produktionsseite.

## Befehle

```bash
pnpm dev                 # Entwicklungsserver
pnpm build               # Produktionsbuild
pnpm test                # Vitest, einmalig
pnpm test:watch          # Vitest im Beobachtungsmodus
pnpm test:coverage       # mit Abdeckungsbericht
pnpm lint                # ESLint
pnpm exec tsc --noEmit   # Typprüfung

pnpm db:up               # nur PostgreSQL starten
pnpm infra:up            # PostgreSQL + Piston
pnpm db:migrate          # Migrationen anwenden
pnpm db:seed             # Beispieldaten
pnpm db:reset            # Datenbank zurücksetzen, migrieren, seeden
pnpm piston:install      # Sprachlaufzeiten installieren
```

## Aufbau

```
app/                 Seiten (App Router) und API-Routen
  api/               nach Domäne: challenge, user, ranking, community, admin, auth
components/          Feature-Komponenten, ui/ enthält die shadcn-Primitiven
lib/                 geteilter Code für Client und Server
  server/            nur serverseitig: Datenbankzugriffe, Auth-Guards, Code-Ausführung
  api.ts             typisierte fetch-Hüllen samt gemeinsamer Typen
prisma/              Schema, Migrationen, Seed
docs/DEPLOYMENT.md   Anleitung vom Repository zur laufenden Seite
```

Die Trennung, die den Rest erklärt: `lib/prisma.ts` beginnt mit `import "server-only"`. Alles, was den Datenbank-Client benutzt — also praktisch jede Datei unter `lib/server/` — lässt sich damit nicht in eine Client-Komponente importieren; der Build bricht ab. Der Client redet ausschließlich über `lib/api.ts` mit dem Server.

### Wie eine Lösung bewertet wird

1. `POST /api/challenge/[id]/submit` nimmt Code und Sprache an.
2. `lib/server/challenge-execution.ts` entscheidet die Betriebsart. Liegen strukturierte Testfälle und ein Eintrag in `evaluationConfig.callableByLanguage` vor, wird der Code mit einem Harness (`lib/server/io-harness.ts`) umschlossen und **pro Testfall** ausgeführt.
3. Fehlt beides, läuft der Code einmal durch und der Exit-Code entscheidet — der Rückfallweg für Aufgaben ohne Testfälle.
4. `lib/server/piston-runner.ts` spricht mit Piston über HTTP.

Ist `CODE_EXECUTION_ENABLED` nicht `true`, liefert `challenge-run-stub.ts` feste Ergebnisse. Die Testsuite läuft immer in diesem Modus.

## Tests

```bash
pnpm test
```

Die Tests liegen in `__tests__/`-Ordnern neben dem geprüften Code. Die Testumgebung ist `node`, es gibt also keine DOM-Globals — Komponenten werden über `renderToStaticMarkup` geprüft.

End-to-End-Tests gibt es bislang nicht.

Vor jedem Pull Request müssen `pnpm test`, `pnpm exec tsc --noEmit` und `pnpm lint` fehlerfrei durchlaufen.

## Mitwirken

Zweige heißen nach der Issue-Nummer, Commits folgen [Conventional Commits](https://www.conventionalcommits.org/) (`feat(#42): …`). Direkt auf `main` wird nicht committet.

Neues Verhalten kommt mit Tests. Die Konventionen im Detail — auch die Sprachregel, dass Code und Kommentare englisch sind und alles Nutzersichtbare deutsch — stehen in [`CLAUDE.md`](CLAUDE.md).

## Lizenz

Noch keine. Ohne Lizenzdatei gilt das volle Urheberrecht: dieser Code darf nicht verwendet, kopiert oder verändert werden, auch wenn das Repository öffentlich ist. Eine Lizenz folgt.
