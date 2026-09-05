# Contributing to Daily Coding

**English** · [Deutsch](#deutsch)

Thanks for taking the time. This page covers everything you need to go from a fresh clone to a merged pull request. The detailed engineering conventions live in [`CLAUDE.md`](CLAUDE.md); this document is the short version for people.

## Ways to help

- **Report a bug** - use the [bug report form](https://github.com/ledo9315/daily-coding/issues/new/choose). Include what you expected, what happened, and steps to reproduce it.
- **Suggest a feature** - open an issue and describe the problem it solves before the solution. A short discussion up front saves everyone a rewrite later.
- **Fix something** - pick an issue, comment that you are working on it, and open a pull request.
- **Add or translate a challenge** - see [Challenges](#challenges) below. This is the most welcome kind of contribution and needs no framework knowledge.
- **Improve a translation** - the UI is bilingual; every string lives in `messages/<locale>/`.

**Security issues** are the one thing not to post publicly. Please e-mail leonid.domahalskyy@icloud.com instead.

## Local setup

Prerequisites: **Node 20 or newer** (developed on 22), **pnpm 11** (the exact version is pinned in `package.json` under `packageManager`), **Docker**.

```bash
git clone https://github.com/ledo9315/daily-coding.git
cd daily-coding
pnpm install

cp .env.example .env.local          # then set AUTH_SECRET, see the comments in the file
pnpm infra:up                       # PostgreSQL + Piston in Docker
pnpm piston:install                 # load the language runtimes into the container
pnpm db:migrate && pnpm db:seed     # schema + sample data
pnpm dev
```

The app runs on `http://localhost:3000`. Sign in with `max.mustermann@company.com` and `DailyDev2024!` (the seeded password, changeable via `SEED_DEV_PASSWORD`). The seeded admin is `admin@dailydev.local` with the same password.

**Without Docker:** set `CODE_EXECUTION_ENABLED=false` in `.env.local` and start only the database with `pnpm db:up`. Everything works except actually running code - submissions then return fixed stub results.

If `pnpm test` or `tsc` complains about types after switching branches, run `pnpm exec prisma generate` once.

## Workflow

1. **Branch from `main`.** Name it after the issue: `feature/DAI-<issue>-<short-title>`. Nothing is committed directly to `main`.
2. **Write a test first** for new behaviour - happy path and the main error paths. Tests are Vitest, colocated in `__tests__/` next to the code. The environment is `node`, so components are checked through `renderToStaticMarkup`, not a DOM.
3. **Keep the language rule.** Code, comments, commit messages and test descriptions are English. Anything a user reads goes into `messages/<locale>/<area>.json` in both `de` and `en`, never as a literal in JSX. The German value is the source of truth; the English one is written as English, not word for word. The admin area is the exception and stays German.
4. **Run the checks** before opening the pull request. All three must pass; CI runs the same set plus a production build.

   ```bash
   pnpm test
   pnpm exec tsc --noEmit
   pnpm lint
   ```

5. **Commit** in [Conventional Commits](https://www.conventionalcommits.org/) style with the issue number: `feat(DAI-42): describe the change`, `fix(DAI-42): …`. If you touched `package.json`, commit `pnpm-lock.yaml` with it.
6. **Open the pull request** against `main`, titled `DAI-<issue>: <issue title>`. Say what changed and why, and mention anything a reviewer should try by hand. Small, focused pull requests get reviewed faster than large ones.

Please do not include generated attribution footers in commits or pull requests.

## Challenges

Every challenge is one module under `prisma/challenges/<slug>.ts` exporting `challenge: ChallengeContent`, registered in `prisma/challenges/index.ts`. The German text sits in the top-level fields; the English version lives in `translations.en` of the same module. Copy an existing module such as `binary-search.ts` as a starting point.

What a challenge needs:

- a description, hints, difficulty and points;
- structured `testCases` with `input` and `expected` as JSON;
- the list of `supportedLanguages`, in `evaluationConfig.callableByLanguage` the function name to call per language, and a starter snippet per language in `starterCodes`. Java, Go, C++, C# and Rust are opt-in: leave them out when the test input cannot be typed (mixed types in one array, recursive structures).

Before opening the pull request:

1. Run `pnpm vitest run prisma/__tests__/challenge-catalog.test.ts` - it checks the module structurally.
2. Verify the challenge is solvable in every language it offers. Write a reference solution per language into a folder **outside the repository** and run

   ```bash
   pnpm exec tsx scripts/verify-challenge.ts prisma/challenges/<slug>.ts ../solutions/<slug>
   ```

   It executes each solution through the real harness against your local Piston. Please do not commit the solutions - a reference solution next to the challenge would be one `git log` away from every user.
3. Do not worry about activation. The seed writes every module with `isActive: false`; an admin adds the challenge to the ring once it is deployed.

Translating an existing challenge means filling in `translations.en` of its module, nothing else.

## Code map

```
app/                 pages (App Router) and API routes under app/api/
components/          feature components; ui/ holds the shadcn primitives
lib/                 shared by client and server
  server/            server-only: database, auth guards, code execution - never import client-side
  api.ts             typed fetch wrappers, the only way the client talks to the server
messages/<locale>/   every user-visible string, one file per area
prisma/              schema, the single baseline migration, seed and challenge modules
```

The full architecture, including how a submission is graded and how the per-language harness works, is described in [`CLAUDE.md`](CLAUDE.md).

## License

By contributing you agree that your contribution is licensed under the [MIT License](LICENSE) like the rest of the project.

---

<a id="deutsch"></a>

# Mitmachen bei Daily Coding

[English](#contributing-to-daily-coding) · **Deutsch**

Danke, dass du dir die Zeit nimmst. Diese Seite beschreibt den Weg vom frischen Klon bis zum gemergten Pull Request. Die ausführlichen Konventionen stehen in [`CLAUDE.md`](CLAUDE.md); dieses Dokument ist die Kurzfassung für Menschen.

## Wie du helfen kannst

- **Fehler melden** - über das [Formular für Fehlermeldungen](https://github.com/ledo9315/daily-coding/issues/new/choose). Schreib, was du erwartet hast, was stattdessen passiert ist und wie man es nachstellt.
- **Feature vorschlagen** - eröffne ein Issue und beschreib zuerst das Problem, dann die Lösung. Eine kurze Diskussion vorab spart allen eine Überarbeitung.
- **Etwas reparieren** - such dir ein Issue, schreib kurz, dass du daran arbeitest, und eröffne einen Pull Request.
- **Challenge beisteuern oder übersetzen** - siehe [Challenges](#challenges-1). Die willkommenste Art von Beitrag, und sie braucht kein Framework-Wissen.
- **Übersetzung verbessern** - die Oberfläche ist zweisprachig; jeder Text liegt in `messages/<locale>/`.

**Sicherheitslücken** bitte nicht öffentlich melden, sondern per E-Mail an leonid.domahalskyy@icloud.com.

## Lokal einrichten

Voraussetzungen: **Node 20 oder neuer** (entwickelt wird mit 22), **pnpm 11** (die genaue Version steht in `package.json` unter `packageManager`), **Docker**.

```bash
git clone https://github.com/ledo9315/daily-coding.git
cd daily-coding
pnpm install

cp .env.example .env.local          # dann AUTH_SECRET setzen, siehe Kommentare in der Datei
pnpm infra:up                       # PostgreSQL + Piston in Docker
pnpm piston:install                 # Sprach-Runtimes in den Container laden
pnpm db:migrate && pnpm db:seed     # Schema + Beispieldaten
pnpm dev
```

Die App läuft dann auf `http://localhost:3000`. Anmelden mit `max.mustermann@company.com` und `DailyDev2024!` (das Passwort des Seeds, änderbar über `SEED_DEV_PASSWORD`). Der Admin aus dem Seed ist `admin@dailydev.local` mit demselben Passwort.

**Ohne Docker:** `CODE_EXECUTION_ENABLED=false` in `.env.local` setzen und nur die Datenbank mit `pnpm db:up` starten. Alles funktioniert bis auf das Ausführen von Code - Einreichungen liefern dann feste Stub-Ergebnisse.

Wenn `pnpm test` oder `tsc` nach einem Branch-Wechsel über Typen klagt, einmal `pnpm exec prisma generate` ausführen.

## Ablauf

1. **Branch von `main`.** Benannt nach dem Issue: `feature/DAI-<Nummer>-<kurzer-titel>`. Auf `main` wird nichts direkt committet.
2. **Zuerst einen Test schreiben** für neues Verhalten - Happy Path und die wichtigsten Fehlerfälle. Tests sind Vitest und liegen in `__tests__/` neben dem Code. Die Umgebung ist `node`, Komponenten werden also über `renderToStaticMarkup` geprüft, nicht in einem DOM.
3. **Sprachregel einhalten.** Code, Kommentare, Commit-Nachrichten und Testbeschreibungen sind Englisch. Alles, was ein Nutzer liest, kommt nach `messages/<locale>/<bereich>.json` in `de` und `en`, nie als Literal ins JSX. Der deutsche Wert ist die Quelle; der englische wird als Englisch geschrieben, nicht Wort für Wort. Ausnahme ist der Admin-Bereich, der bleibt deutsch.
4. **Prüfungen laufen lassen**, bevor du den Pull Request eröffnest. Alle drei müssen grün sein; die CI führt dieselben plus einen Produktions-Build aus.

   ```bash
   pnpm test
   pnpm exec tsc --noEmit
   pnpm lint
   ```

5. **Committen** im Stil von [Conventional Commits](https://www.conventionalcommits.org/) mit Issue-Nummer: `feat(DAI-42): describe the change`, `fix(DAI-42): …`. Wer `package.json` anfasst, committet `pnpm-lock.yaml` mit.
6. **Pull Request eröffnen** gegen `main`, Titel `DAI-<Nummer>: <Issue-Titel>`. Schreib, was sich ändert und warum, und was ein Reviewer von Hand ausprobieren sollte. Kleine, fokussierte Pull Requests werden schneller gelesen als große.

Bitte keine generierten Attributions-Footer in Commits oder Pull Requests.

## Challenges

Jede Challenge ist ein Modul unter `prisma/challenges/<slug>.ts`, das `challenge: ChallengeContent` exportiert und in `prisma/challenges/index.ts` eingetragen ist. Der deutsche Text steht in den Feldern auf oberster Ebene, die englische Fassung in `translations.en` desselben Moduls. Am einfachsten kopierst du ein vorhandenes Modul wie `binary-search.ts` als Vorlage.

Was eine Challenge braucht:

- Beschreibung, Hinweise, Schwierigkeit und Punkte;
- strukturierte `testCases` mit `input` und `expected` als JSON;
- die Liste `supportedLanguages`, in `evaluationConfig.callableByLanguage` den aufzurufenden Funktionsnamen pro Sprache und in `starterCodes` einen Starter pro Sprache. Java, Go, C++, C# und Rust sind optional: weglassen, wenn sich die Testeingabe nicht typisieren lässt (gemischte Typen in einem Array, rekursive Strukturen).

Vor dem Pull Request:

1. `pnpm vitest run prisma/__tests__/challenge-catalog.test.ts` ausführen - der Test prüft das Modul strukturell.
2. Sicherstellen, dass die Challenge in jeder angebotenen Sprache lösbar ist. Dafür pro Sprache eine Referenzlösung in einen Ordner **außerhalb des Repositories** legen und

   ```bash
   pnpm exec tsx scripts/verify-challenge.ts prisma/challenges/<slug>.ts ../solutions/<slug>
   ```

   ausführen. Das Skript jagt jede Lösung durch den echten Harness gegen dein lokales Piston. Die Lösungen bitte nicht committen - eine Referenzlösung neben der Challenge wäre für jeden Nutzer nur ein `git log` entfernt.
3. Um die Aktivierung musst du dich nicht kümmern. Der Seed schreibt jedes Modul mit `isActive: false`; ein Admin nimmt die Challenge nach dem Deploy in den Ring auf.

Eine vorhandene Challenge übersetzen heißt: `translations.en` in ihrem Modul ausfüllen, mehr nicht.

## Wo was liegt

```
app/                 Seiten (App Router) und API-Routen unter app/api/
components/          Feature-Komponenten; ui/ enthält die shadcn-Primitive
lib/                 gemeinsam für Client und Server
  server/            nur Server: Datenbank, Auth-Guards, Code-Ausführung - nie clientseitig importieren
  api.ts             typisierte Fetch-Wrapper, der einzige Weg vom Client zum Server
messages/<locale>/   jeder sichtbare Text, eine Datei pro Bereich
prisma/              Schema, die einzelne Baseline-Migration, Seed und Challenge-Module
```

Die vollständige Architektur, einschließlich der Bewertung einer Einreichung und des Harness pro Sprache, steht in [`CLAUDE.md`](CLAUDE.md).

## Lizenz

Mit deinem Beitrag stimmst du zu, dass er wie das übrige Projekt unter der [MIT-Lizenz](LICENSE) steht.
