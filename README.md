# Daily Coding

[![CI](https://github.com/ledo9315/daily-coding/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/ledo9315/daily-coding/actions/workflows/ci.yml)
[![Last commit](https://img.shields.io/github/last-commit/ledo9315/daily-coding?label=last%20commit&color=c4fe4d)](https://github.com/ledo9315/daily-coding/commits/main)
[![Views](https://hits.sh/github.com/ledo9315/daily-coding.svg?label=views&color=c4fe4d)](https://hits.sh/github.com/ledo9315/daily-coding/)
[![License: MIT](https://img.shields.io/badge/License-MIT-c4fe4d)](LICENSE)

![Next.js](https://img.shields.io/badge/Next.js-16-0d1117?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-0d1117?logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5-0d1117?logo=typescript&logoColor=3178C6)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-0d1117?logo=tailwindcss&logoColor=38BDF8)
![Prisma](https://img.shields.io/badge/Prisma-7-0d1117?logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-0d1117?logo=postgresql&logoColor=4169E1)
![Vitest](https://img.shields.io/badge/Vitest-1489%20Tests-0d1117?logo=vitest&logoColor=6E9F18)

**English** · [Deutsch](#deutsch)

<img width="2000" height="1251" alt="CleanShot 2026-09-05 at 14 38 49" src="https://github.com/user-attachments/assets/bc0c711a-8a23-4c23-a79c-a7520c770cdc" />

A coding challenge platform: one task a day, solved in the browser, graded against real test cases in a sandbox. With a leaderboard, streaks, levels and badges.

**Live:** [daily-coding.dev](https://daily-coding.dev)

---

## What it does

- **Daily challenge** - one task per day, the same for every user. Which task is running is stored as an order plus a pointer in the database (`lib/server/challenge-ring.ts`); the pointer advances on the first request of a new UTC day, so no cron job is needed.
- **Ten languages** - JavaScript, TypeScript, Python, PHP, Ruby, Java, Go, C++, C#, Rust. The editor is Monaco, the code runs in a self-hosted [Piston](https://github.com/engineer-man/piston) instance. Java, Go, C++, C# and Rust are only offered for tasks whose test inputs can be typed; the other five are available everywhere.
- **Grading against test cases** - the submitted code is called once per test case through a harness and the result is compared. No comparison of console output.
- **Leaderboard** for week and month, with a podium and competition ranking (ties share a place).
- **Progress** - points, levels, streak with personal record, 23 badges, a monthly calendar of solved days.
- **Community feed** - who solved which challenge and who levelled up.
- **Accounts** via e-mail and password or through GitHub and Google. E-mail verification, password reset, account deletion.
- **Admin area** for creating and editing challenges together with their test cases.

## Stack

| Area | Choice |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| UI | Tailwind CSS v4, shadcn/ui (Radix), Framer Motion, pixel-art style |
| Database | PostgreSQL 17 with Prisma 7 |
| Auth | Auth.js (NextAuth v5), JWT sessions |
| Code execution | Piston in Docker, behind a reverse proxy with a bearer token |
| E-mail | Resend |
| Tests | Vitest, 135 test files |
| Hosting | Vercel, Neon (database), Hetzner (sandbox) |

## Running locally

Prerequisites: **Node 20 or newer** (developed on 22), **pnpm 11**, **Docker**.

```bash
git clone https://github.com/ledo9315/daily-coding.git
cd daily-coding
pnpm install

cp .env.example .env.local          # adjust values, see below
pnpm infra:up                       # PostgreSQL + Piston in Docker
pnpm piston:install                 # load the language runtimes into the container
pnpm db:migrate && pnpm db:seed     # schema + sample data
pnpm dev
```

The app then runs on `http://localhost:3000`. The seed creates demo accounts; sign in with `max.mustermann@company.com` and the password from `SEED_DEV_PASSWORD` (default `DailyDev2024!`).

**It also works without Docker** - set `CODE_EXECUTION_ENABLED=false`. Challenges cannot be solved that way, everything else works.

### Environment variables

`.env.example` describes every variable. The minimum for local development:

```bash
DATABASE_URL=postgresql://daily_dev:daily_dev_secret@localhost:5433/daily_dev
AUTH_SECRET=            # openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000
APP_URL=http://localhost:3000
```

Sending mail needs `RESEND_API_KEY`, third-party sign-in the four `GITHUB_*` and `GOOGLE_*` values. `.env.production.example` documents the production side.

## Commands

```bash
pnpm dev                 # development server
pnpm build               # production build
pnpm test                # Vitest, single run
pnpm test:watch          # Vitest in watch mode
pnpm test:coverage       # with coverage report
pnpm lint                # ESLint
pnpm exec tsc --noEmit   # type check

pnpm db:up               # start PostgreSQL only
pnpm infra:up            # PostgreSQL + Piston
pnpm db:migrate          # apply migrations
pnpm db:seed             # sample data
pnpm db:reset            # reset the database, migrate, seed
pnpm piston:install      # install the language runtimes
```

## Layout

```
app/                 pages (App Router) and API routes
  api/               by domain: challenge, user, ranking, community, admin, auth
components/          feature components, ui/ holds the shadcn primitives
lib/                 code shared by client and server
  server/            server-only: database access, auth guards, code execution
  api.ts             typed fetch wrappers and the shared types
prisma/              schema, migrations, seed
docs/DEPLOYMENT.md   from repository to running site
```

The one separation that explains the rest: `lib/prisma.ts` starts with `import "server-only"`. Anything that uses the database client - practically every file under `lib/server/` - therefore cannot be imported into a client component; the build fails. The client talks to the server exclusively through `lib/api.ts`.

### How a solution is graded

1. `POST /api/challenge/[id]/submit` accepts code and language.
2. `lib/server/challenge-execution.ts` decides the mode. If structured test cases and an entry in `evaluationConfig.callableByLanguage` exist, the code is wrapped in a harness (`lib/server/io-harness.ts`) and executed **once per test case**.
3. If both are missing, the code runs once and the exit code decides - the fallback for tasks without test cases.
4. `lib/server/piston-runner.ts` talks to Piston over HTTP.

Real execution is the default. Fixed results from `challenge-run-stub.ts` are returned only when `CODE_EXECUTION_ENABLED` is explicitly `false` - without a running Piston container that is the way to submit locally. The test suite always runs in this mode.

## Tests

```bash
pnpm test
```

Tests live in `__tests__/` folders next to the code under test. The test environment is `node`, so there are no DOM globals - components are checked through `renderToStaticMarkup`.

There are no end-to-end tests yet.

Before every pull request, `pnpm test`, `pnpm exec tsc --noEmit` and `pnpm lint` must pass without errors.

## Contributing

Branches are named after the issue number (`feature/DAI-42-short-title`), commits follow [Conventional Commits](https://www.conventionalcommits.org/) (`feat(DAI-42): …`). Nothing is committed directly to `main`.

New behaviour comes with tests. The conventions in detail - including the language rule that code and comments are English and everything user-facing lives bilingually in `messages/<locale>/` - are in [`CLAUDE.md`](CLAUDE.md).

## License

[MIT](LICENSE). The code may be used, modified and redistributed freely as long as the copyright notice is kept.

The pixel art under `public/user/` (avatars) and `public/pixel/` (landing banners) was generated with ChatGPT. Under OpenAI's terms of use the rights to the output belong to the user, so the images are under the same MIT license without restriction.

---

<a id="deutsch"></a>

# Daily Coding (Deutsch)

[English](#daily-coding) · **Deutsch**

Eine Coding-Challenge-Plattform: jeden Tag eine Aufgabe, gelöst im Browser, bewertet gegen echte Testfälle in einer Sandbox. Mit Bestenliste, Streaks, Levels und Abzeichen.

**Live:** [daily-coding.dev](https://daily-coding.dev)

## Was es kann

- **Tägliche Challenge** - eine Aufgabe pro Tag, für alle Nutzer dieselbe. Welche Aufgabe läuft, steht als Reihenfolge plus Zeiger in der Datenbank (`lib/server/challenge-ring.ts`); der Zeiger rückt beim ersten Aufruf eines neuen UTC-Tages weiter, ein Cronjob dafür entfällt.
- **Zehn Sprachen** - JavaScript, TypeScript, Python, PHP, Ruby, Java, Go, C++, C#, Rust. Der Editor ist Monaco, der Code läuft in einer selbst betriebenen [Piston](https://github.com/engineer-man/piston)-Instanz. Java, Go, C++, C# und Rust stehen nur bei Aufgaben zur Wahl, deren Testeingaben sich typisieren lassen; die übrigen fünf gelten überall.
- **Bewertung gegen Testfälle** - der eingereichte Code wird pro Testfall mit einem Harness aufgerufen und das Ergebnis verglichen. Kein Vergleich von Konsolenausgaben.
- **Bestenliste** für Woche und Monat, mit Podium und Platzierungen nach Wettkampfregel (Gleichstand teilt den Platz).
- **Fortschritt** - Punkte, Level, Streak samt Rekord, 23 Abzeichen, Monatsübersicht der gelösten Tage.
- **Community-Feed** - wer hat welche Challenge gelöst und wer ist im Level aufgestiegen.
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
| Tests | Vitest, 135 Testdateien |
| Betrieb | Vercel, Neon (Datenbank), Hetzner (Sandbox) |

## Lokal starten

Voraussetzungen: **Node 20 oder neuer** (entwickelt mit 22), **pnpm 11**, **Docker**.

```bash
git clone https://github.com/ledo9315/daily-coding.git
cd daily-coding
pnpm install

cp .env.example .env.local          # Werte anpassen, siehe unten
pnpm infra:up                       # PostgreSQL + Piston in Docker
pnpm piston:install                 # Sprachlaufzeiten in den Container laden
pnpm db:migrate && pnpm db:seed     # Schema + Beispieldaten
pnpm dev
```

Danach läuft die App auf `http://localhost:3000`. Der Seed legt Demo-Konten an; anmelden kannst du dich mit `max.mustermann@company.com` und dem Passwort aus `SEED_DEV_PASSWORD` (Standard `DailyDev2024!`).

**Ohne Docker geht es auch** - dann `CODE_EXECUTION_ENABLED=false` setzen. Challenges lassen sich damit nicht lösen, alles andere funktioniert.

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

Die Trennung, die den Rest erklärt: `lib/prisma.ts` beginnt mit `import "server-only"`. Alles, was den Datenbank-Client benutzt - also praktisch jede Datei unter `lib/server/` - lässt sich damit nicht in eine Client-Komponente importieren; der Build bricht ab. Der Client redet ausschließlich über `lib/api.ts` mit dem Server.

### Wie eine Lösung bewertet wird

1. `POST /api/challenge/[id]/submit` nimmt Code und Sprache an.
2. `lib/server/challenge-execution.ts` entscheidet die Betriebsart. Liegen strukturierte Testfälle und ein Eintrag in `evaluationConfig.callableByLanguage` vor, wird der Code mit einem Harness (`lib/server/io-harness.ts`) umschlossen und **pro Testfall** ausgeführt.
3. Fehlt beides, läuft der Code einmal durch und der Exit-Code entscheidet - der Rückfallweg für Aufgaben ohne Testfälle.
4. `lib/server/piston-runner.ts` spricht mit Piston über HTTP.

Echte Ausführung ist der Standard. Feste Ergebnisse aus `challenge-run-stub.ts` gibt es nur, wenn `CODE_EXECUTION_ENABLED` ausdrücklich auf `false` steht - ohne laufenden Piston-Container ist das der Weg, lokal abzugeben. Die Testsuite läuft immer in diesem Modus.

## Tests

```bash
pnpm test
```

Die Tests liegen in `__tests__/`-Ordnern neben dem geprüften Code. Die Testumgebung ist `node`, es gibt also keine DOM-Globals - Komponenten werden über `renderToStaticMarkup` geprüft.

End-to-End-Tests gibt es bislang nicht.

Vor jedem Pull Request müssen `pnpm test`, `pnpm exec tsc --noEmit` und `pnpm lint` fehlerfrei durchlaufen.

## Mitwirken

Zweige heißen nach der Issue-Nummer (`feature/DAI-42-kurzer-titel`), Commits folgen [Conventional Commits](https://www.conventionalcommits.org/) (`feat(DAI-42): …`). Direkt auf `main` wird nicht committet.

Neues Verhalten kommt mit Tests. Die Konventionen im Detail - auch die Sprachregel, dass Code und Kommentare englisch sind und alles Nutzersichtbare zweisprachig in `messages/<locale>/` liegt - stehen in [`CLAUDE.md`](CLAUDE.md).

## Lizenz

[MIT](LICENSE). Der Code darf frei verwendet, verändert und weitergegeben werden, solange der Urheberhinweis erhalten bleibt.

Die Pixel-Art unter `public/user/` (Avatare) und `public/pixel/` (Landing-Banner) ist mit ChatGPT erzeugt. Nach den OpenAI-Nutzungsbedingungen liegen die Rechte an den Ausgaben beim Nutzer; die Bilder stehen daher ohne Einschränkung unter derselben MIT-Lizenz.
