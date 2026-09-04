# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
pnpm dev                    # Start Next.js dev server
pnpm build                  # Build (runs prisma generate first)
pnpm lint                   # ESLint
pnpm exec tsc --noEmit      # Type-check without emitting

# Tests
pnpm test                   # Run all Vitest tests once
pnpm test:watch             # Vitest in watch mode
pnpm test:coverage          # Coverage report
# Run a single test file:
pnpm vitest run <path/to/file.test.ts>

# Database
pnpm db:up                  # Start only PostgreSQL in Docker
pnpm infra:up               # Start PostgreSQL + Piston in Docker
pnpm db:reset               # Reset DB, apply migrations, then seed explicitly
pnpm db:migrate             # Apply migrations (prisma migrate deploy)
pnpm db:seed                # Seed the database (tsx prisma/seed.ts)
pnpm prisma migrate dev     # Create + apply a new migration locally

# Code execution runtime
pnpm piston:install         # Install language runtimes into the running Piston container
```

**Local DB URL:** `postgresql://daily_dev:daily_dev_secret@localhost:5433/daily_dev`

**PostgreSQL version:** the local image in `docker-compose.yml` must track the major
version of the production database (Neon, currently 17). `pg_dump` refuses to run
against a newer server, so a divergence means no usable backup of production. When
Neon bumps its major version, bump the image too: the data directory in the
`daily_dev_pgdata` volume is version-specific, so dump first, remove the volume,
then restore (a dump from an older major restores into a newer one, not the reverse).

### Migration history

`prisma/migrations` holds a single baseline, `0_init`, generated from the schema on
2026-07-30. The previous 18 migrations were not replayable - several hand-written
directory names lacked a time component (`20260406_category_table`), and since `_`
sorts after digits, they ran out of creation order: one migration dropped a default
on `Submission.updatedAt` ten migrations before that column was created.

Both the local and the Neon database were marked as having applied the baseline via
`prisma migrate resolve --applied 0_init`; no data was touched. Consequence: history
before 2026-07-30 is gone, and the baseline is the oldest reachable point. Never edit
`0_init/migration.sql` - Prisma verifies checksums of applied migrations and both
environments would fail.

## Architecture

**Stack:** Next.js 16 App Router · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui (Radix) · Framer Motion · PostgreSQL (Docker) + Prisma ORM · Vitest · NextAuth v5 (JWT strategy, credentials provider)

### Key architectural layers

| Layer | Location | Role |
|---|---|---|
| Pages / UI | `app/` | App Router pages (challenge, dashboard, login, profile, ranking, admin, community) |
| API routes | `app/api/` | Next.js route handlers - grouped by domain (challenge, user, ranking, community, admin, auth) |
| Server-only logic | `lib/server/` | DB queries, auth guards, code execution, ranking, streak - **never imported client-side** |
| Client fetch layer | `lib/api.ts` | Typed fetch wrappers + shared types; consumed by client components and pages |
| Reusable UI | `components/` | Feature components + `components/ui/` (shadcn primitives) |
| DB client | `lib/prisma.ts` | Singleton Prisma client - always import from here, never instantiate directly |

### Code execution pipeline

Challenges run user code via a **self-hosted Piston** container (port 2000). Flow:

1. `app/api/challenge/[id]/run` or `.../submit` → `lib/server/challenge-execution.ts`
2. `challenge-execution.ts` decides evaluation mode:
   - **I/O evaluation** (when `Challenge.evaluationConfig.callableByLanguage` + structured `testCases` exist): wraps user code with a harness (`lib/server/io-harness.ts`) and runs each test case via Piston
   - **Smoke execution** (fallback): runs code once through Piston, marks all slots passed/failed based on exit code
3. `lib/server/piston-runner.ts` handles HTTP calls to Piston (`PISTON_API_URL` env var, defaults to `http://127.0.0.1:2000`)
4. Real execution is the **default**. Stub results (`challenge-run-stub.ts`) are returned only when
   `CODE_EXECUTION_ENABLED` is explicitly `false`, or under Vitest / `NODE_ENV=test`
   (`lib/server/code-execution-flag.ts`). To submit locally without a running Piston container, set
   `CODE_EXECUTION_ENABLED=false` - otherwise the submission fails with `Ausführung fehlgeschlagen: fetch failed`.

Supported languages live in the **registry** in `lib/challenge-languages.ts` - one `LanguageSpec`
per entry, holding everything about a language that is data: Piston package and file name, Monaco
id, editor file name, version prefix, whether it is typed, whether Piston compiles it inside the
run step and how a compile failure looks there. `piston-runner.ts`, the admin schema and form, the
editor and `scripts/install-piston-runtimes.ts` all read from it; a test checks each entry is
complete and that the list matches the Prisma enum, order included.

Adding a language means: registry entry, Prisma enum plus migration, a `case` in
`buildWrappedProgram`, seed content, and the runtime on the Piston host. Everything else follows. Ruby's harness is the Python one with `to_json` instead of
`json.dumps` - deliberately not `JSON.generate`, which refuses a bare String or Integer at the
top level, and half the challenges return exactly that.

Java, Go, C++, C# and Rust are the typed ones and share `inferArguments` in `io-harness.ts`: the test input is
turned into typed parameters (one per JSON key, in key order) and baked into the program as
literals. Both differ from the interpreted languages in ways worth knowing before touching the
harness:

- There is **no `data` without a type**, and Piston's images ship no JSON library for Java.
  Hence the baked-in literals - so `buildWrappedProgram` needs the input and is called once per
  test case, not once per submission.
- Piston runs the **compiler inside the run step** for Java and Go - C++ and C# get a proper
  compile stage, so nothing special is needed there. A Java compile error arrives as exit 1 with
  `error: compilation failed`; Go exits 2 for both a rejected build and a panic, told apart by
  `# command-line-arguments` and `./main.go:line:col`.
- Both burn CPU before running a line - javac plus JVM startup 2.5–3 s, the Go toolchain about
  1.7 s - over Piston's 3000 ms default. The ceiling is raised in `docker-compose.yml`;
  `piston-runner.ts` asks for the larger budget for Java and Go only. **A Piston host without
  those env vars kills every such submission with SIGKILL and an empty output.**
- Go additionally needs `PISTON_MAX_PROCESS_COUNT` well above the default 64: its runtime starts
  a thread per core and aborts with "Sandbox keeper received fatal signal 6" otherwise - while
  compile errors keep coming back normally, which makes it look like a harness bug.
- A Go solution **cannot add imports** and a C++ one no includes; both live in the harness
  header. Go's carries strconv, strings, sort, math, fmt and unicode and consumes each with a
  blank assignment (Go rejects unused imports); C++ gets `<bits/stdc++.h>` and `using namespace
  std`, which covers it in two lines.
- C++ serialises by overload like Java, and the scalar overloads must precede the `vector<T>`
  template or nested vectors fail to resolve. C# uses one method with ordered type tests instead
  - Mono has no `System.Text.Json`, and `string` must be answered before `IEnumerable` or every
  word comes back as a list of letters.
- Rust puts the solution *first* - no class to nest in, so line numbers need no correction at
  all - and serialises through a `ToJson` trait, where a blanket `impl<T: ToJson> for Vec<T>`
  covers nesting in one line. Its string escapes are `\u{XXXX}` with braces, unlike every other
  typed language here.
- C# runs on **Mono**, not on the `csharp.net` runtime Piston also offers: that one scaffolds a
  project per execution, ten seconds of CPU with its progress on stdout. Mono cannot start under
  the QEMU emulation the amd64 image needs on Apple Silicon, so C# is only testable against the
  real host - `piston-integration.test.ts` skips a runtime that dies in the sandbox keeper.

Java, Go, C++, C# and Rust are opt-in per challenge: no `callableByLanguage.<lang>` means the language is left
out of `supportedLanguages` and never appears in the dropdown. Hash Map (mixed types in one
array) and Binary Tree Traversal (recursive structure) are the two seeded challenges without
them - Ruby covers both, since `data` there is just a value.

### Authentication

- `auth.ts` configures NextAuth with credentials provider
- `proxy.ts` (Next 16's name for `middleware.ts`) protects `/challenge`, `/profile`, `/ranking`, `/settings` and `/admin` paths via JWT token check, and writes the locale cookie on every response
- Admin role is checked **in route handlers** via `lib/server/require-admin-page.ts` / `lib/server/admin-session.ts` (not in the proxy, to avoid stale JWT role data)

### Challenge content

Every challenge is a module under `prisma/challenges/<slug>.ts` exporting
`challenge: ChallengeContent`, listed in `prisma/challenges/index.ts` as `ALL_CHALLENGES`
and upserted by the seed in one loop - the first fifteen used to sit inline in
`prisma/seed.ts` and no longer do. The German text is the column value; the English one
lives in `translations.en` of the same module and is written to `ChallengeTranslation` by
`prisma/translation-upsert.ts`. `prisma/__tests__/challenge-catalog.test.ts`
checks each module structurally (ids, hint titles, points, JSON validity, a callable and a starter
per language, typed-harness compatibility of every test input). Before seeding a new challenge run
`scripts/verify-challenge.ts` with reference solutions kept outside the repo - it executes them
through the real harness on the local Piston. New challenges are created with `isActive: false`;
an admin adds them to the ring.

### Data model highlights

- `Challenge` stores per-language starter code in `starterCodes` (JSON map) - `starterCode` field is legacy JS-only
- `Challenge.evaluationConfig` holds `callableByLanguage` map for I/O test evaluation
- `Submission` tracks code, language, status, test results (JSON), and timing
- `RankingEntry` is pre-computed per period (today/week/month) with unique constraint on `(userId, period, periodDate)`

## Git & PR workflow

- Branch naming: `feature/DAI-<number>-<short-title>`
- Commit format: `feat(DAI-<number>): description`
- PR title: `DAI-<number>: <issue title>`
- Never commit directly to `main`
- Always commit `pnpm-lock.yaml` alongside `package.json` changes

## PR checklist (mandatory before opening)

1. Vitest tests for new behavior (TDD; happy path + main error paths)
2. `pnpm test` - zero failures
3. `pnpm exec tsc --noEmit` - no type errors
4. `pnpm lint` - no lint errors

## Testing conventions

- Unit tests: Vitest, colocated in `__tests__/` next to the code under test
- No end-to-end tests exist. Playwright is not installed; `e2e/` does not exist.
- Test environment is `node` (see `vitest.config.ts`) - no DOM globals by default
- Path alias `@/` resolves to project root
- `describe`/`it` descriptions in English (see language convention below)

## Language convention

**Developer text is English. User-visible text is bilingual and lives in
`messages/<locale>/<area>.json`, not in the JSX.**

English, everywhere and without exception: code comments, JSDoc, `describe`/`it`
descriptions, identifiers, commit messages. The convention covers config files too, not
just `app/`, `lib/`, `components/`: check `vitest.config.ts`, `prisma.config.ts`,
`proxy.ts`, `docker-compose.yml`, `pnpm-workspace.yaml`, `.github/workflows/`,
`.env.example`. Scoping the sweep to the source directories is what let German comments
survive in all of them. When translating an old comment, keep the *why*: a comment that
only restates what the code does is worth deleting rather than translating.

### Where a string goes

`next-intl` 4, **without** i18n routing - no `/de` or `/en` prefix, one URL per page. The
locale comes from the cookie `NEXT_LOCALE`, which `proxy.ts` writes on every response.

- Client components (`"use client"`): `const t = useTranslations("<area>")`
- Server components and route handlers: `const t = await getTranslations("<area>")`
- Mails: `emailTranslator(locale)` from `lib/server/email-template.ts` - `getTranslations`
  would read the *request's* locale, and an activity mail goes to a third party

The German value is the source of truth and is copied **verbatim** - umlauts, typographic
quotes (`„…“`), trailing spaces and all. The English one carries the same key set and is
written as English, not word for word; `„…“` becomes `"…"` there. Keys are English
camelCase, nested by component or section (`{ "loginForm": { "title": … } }`). Plurals go
through ICU (`"{count, plural, one {# Punkt} other {# Punkte}}"`), interpolation through
`t("greeting", { name })`.

Nine namespaces, one file per language each:

| Namespace | Covers |
|---|---|
| `api` | route-handler error messages under `app/api/**` |
| `auth` | login, register, forgot/reset password, verify e-mail |
| `challenge` | challenge page, editor, hints, test results, submission status, solutions page |
| `changelog` | `/changelog` page chrome and the footer link |
| `community` | header, nav, footer, notifications, community feed, comments, solution cards and votes |
| `dashboard` | landing page and the signed-in dashboard, including today's card and the activity calendar |
| `email` | every outgoing mail, plus the three notification sentences the bell shares with it |
| `legal` | Impressum and Datenschutz |
| `profile` | profile, settings, ranking, public profile, achievements |

The list in `i18n/request.ts` is authoritative; `__tests__/messages.test.ts` checks that it
matches the files on disk, that both languages carry the same keys, that no value is empty
and that a placeholder present in one language is present in the other.

### What stays German

- **Admin area** (`app/admin/**`, `components/admin/**`, `lib/server/admin-session.ts`,
  `ringLabel`): one audience, and it speaks German (decision E4)
- **Content columns in the database.** `Challenge`, `Category` and `AchievementDef` hold
  the German text; `ChallengeTranslation`, `CategoryTranslation` and
  `AchievementTranslation` hold the other languages, and a missing row falls back to the
  column, so a half-translated catalogue shows German rather than an empty page (E8). Read
  them through `lib/server/content-translations.ts`, never `findMany` directly.
- **Changelog entries** (`lib/changelog.ts`): bilingual, but as prose in the module rather
  than in `messages/` - a release is a numbered block of sentences, not a keyed list
- **Protocol strings that both sides compare**, above all `KONTO LÖSCHEN`: the settings
  panel types it and `DELETE /api/user/account` checks it. Only the sentence around it is
  translated, and a test keeps the phrase out of the catalogues.
- **Shared validation messages** in `lib/display-name.ts`, `lib/password-policy.ts`,
  `lib/comment-policy.ts`, `lib/email-address.ts` and `lib/server/auth-service.ts`. They
  are shared between a route handler and the client, so they hand back a rendered German
  sentence; the form maps the known outcomes back to keys (see `translateNameError` in
  `components/register-form.tsx`).
- **Brands and names**: `DAILY CODING`, `GitHub`, `Google`, `Vercel`, `Neon`, and every
  programming-language label in `lib/challenge-languages.ts`

### Impressum and Datenschutz

Both are bilingual, and the German version is the **authoritative** one. The English
translation is a courtesy for the reader and has had no legal review; treat the German text
as the one that binds, and do not change the German wording to match a translation
(decision E5).

### The switch and how a locale is decided

`User.locale` (Prisma `enum Locale { de en }`, default `de`) holds the account setting; the
switch sits in Settings → Sprache and writes it through `PATCH /api/user/locale`, which
also sets the cookie so server components see the change on the next render.

`resolveLocale` in `lib/locale.ts` is the whole decision, in this order:

1. `User.locale` of the signed-in account
2. the `NEXT_LOCALE` cookie
3. `Accept-Language`
4. `x-vercel-ip-country` (German for DE/AT/CH)
5. `DEFAULT_LOCALE`, currently `de`

The account beats the cookie, not the other way round: the cookie is a cache of a decision,
the account row is the record of it. Two entry points wrap it - `localeFromRequest(request)`
for code holding a `NextRequest` (`proxy.ts`), and `localeFromRequestScope(user?)` for code
that has none (the request config, NextAuth callbacks, mails). Outside a request scope the
latter degrades to the default instead of throwing.

### The ESLint ratchet

`eslint.config.mjs` exports `uiStringRatchet` and applies it per area to `app/**`,
`components/**` and `lib/**`. It flags a JSX text literal and a bare literal inside a
`toast.*` call - a *literal where a key belongs*, which is decidable from the syntax tree
and says nothing about which language the literal is in.

It is a floor, not a proof. It does **not** see `aria-label`, `placeholder`, `alt`, `title`,
a template string, an object literal like `{ label: "Mittel" }`, or a string handed to a
component as a prop. Every one of those hid a German string that survived the first sweep.
So: read the candidate file, do not trust a grep, and never trust a green lint as evidence
that a directory is converted.

Exempt, with reason: `app/admin/**` and `components/admin/**` (German by decision),
`components/ui/**` (vendored shadcn primitives, kept as the CLI writes them - the one label
a reader can reach, the dialog's close button, takes it from the caller), `app/map/**` and
`components/level-map.tsx` (the level path, not yet converted), plus `__tests__`, `prisma`
and `scripts`. A hit that is genuinely not copy gets an `eslint-disable-next-line` with a
short reason - not a file-wide exemption. Note the mechanics: a JSX text node starts on the
line of the tag *before* it, so `disable-next-line` cannot reach text that follows a
`</svg>` or a `<br />`; use an `eslint-disable` / `eslint-enable` pair around the element
there.
