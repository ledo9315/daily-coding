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
2026-07-30. The previous 18 migrations were not replayable — several hand-written
directory names lacked a time component (`20260406_category_table`), and since `_`
sorts after digits, they ran out of creation order: one migration dropped a default
on `Submission.updatedAt` ten migrations before that column was created.

Both the local and the Neon database were marked as having applied the baseline via
`prisma migrate resolve --applied 0_init`; no data was touched. Consequence: history
before 2026-07-30 is gone, and the baseline is the oldest reachable point. Never edit
`0_init/migration.sql` — Prisma verifies checksums of applied migrations and both
environments would fail.

## Architecture

**Stack:** Next.js 16 App Router · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui (Radix) · Framer Motion · PostgreSQL (Docker) + Prisma ORM · Vitest · NextAuth v5 (JWT strategy, credentials provider)

### Key architectural layers

| Layer | Location | Role |
|---|---|---|
| Pages / UI | `app/` | App Router pages (challenge, dashboard, login, profile, ranking, admin, community) |
| API routes | `app/api/` | Next.js route handlers — grouped by domain (challenge, user, ranking, community, admin, auth) |
| Server-only logic | `lib/server/` | DB queries, auth guards, code execution, ranking, streak — **never imported client-side** |
| Client fetch layer | `lib/api.ts` | Typed fetch wrappers + shared types; consumed by client components and pages |
| Reusable UI | `components/` | Feature components + `components/ui/` (shadcn primitives) |
| DB client | `lib/prisma.ts` | Singleton Prisma client — always import from here, never instantiate directly |

### Code execution pipeline

Challenges run user code via a **self-hosted Piston** container (port 2000). Flow:

1. `app/api/challenge/[id]/run` or `.../submit` → `lib/server/challenge-execution.ts`
2. `challenge-execution.ts` decides evaluation mode:
   - **I/O evaluation** (when `Challenge.evaluationConfig.callableByLanguage` + structured `testCases` exist): wraps user code with a harness (`lib/server/io-harness.ts`) and runs each test case via Piston
   - **Smoke execution** (fallback): runs code once through Piston, marks all slots passed/failed based on exit code
3. `lib/server/piston-runner.ts` handles HTTP calls to Piston (`PISTON_API_URL` env var, defaults to `http://127.0.0.1:2000`)
4. When `CODE_EXECUTION_ENABLED` env is not `true`, stub results are returned (`challenge-run-stub.ts`)

Supported languages: `javascript`, `typescript`, `python`, `php` (matches `CodeLanguage` Prisma enum).

### Authentication

- `auth.ts` configures NextAuth with credentials provider
- `middleware.ts` protects `/challenge`, `/profile`, `/ranking`, `/admin` paths via JWT token check
- Admin role is checked **in route handlers** via `lib/server/require-admin-page.ts` / `lib/server/admin-session.ts` (not in middleware, to avoid stale JWT role data)

### Data model highlights

- `Challenge` stores per-language starter code in `starterCodes` (JSON map) — `starterCode` field is legacy JS-only
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
2. `pnpm test` — zero failures
3. `pnpm exec tsc --noEmit` — no type errors
4. `pnpm lint` — no lint errors

## Testing conventions

- Unit tests: Vitest, colocated in `__tests__/` next to the code under test
- No end-to-end tests exist. Playwright is not installed; `e2e/` does not exist.
- Test environment is `node` (see `vitest.config.ts`) — no DOM globals by default
- Path alias `@/` resolves to project root
- `describe`/`it` descriptions in English (see language convention below)

## Language convention

**Developer-facing text is English, user-facing text is German.**

English: code comments, JSDoc, `describe`/`it` descriptions, identifiers.

German — do not translate these:

- UI strings in JSX, API error messages, email bodies, toasts, button labels
- Challenge content in `prisma/seed.ts` (titles, descriptions, test-case names)
- Starter-code templates such as `defaultCode` in `components/code-editor.tsx`,
  which the user reads inside the editor
- Achievement titles quoted inside comments (`„Blitzschnell“`), because they name
  a user-visible string

The convention covers config files too, not just `app/`, `lib/`, `components/`: check
`vitest.config.ts`, `prisma.config.ts`, `middleware.ts`, `docker-compose.yml`,
`pnpm-workspace.yaml`, `.github/workflows/`, `.env.example`. Scoping the sweep to the
source directories is what let German comments survive in all of them.

There is no lint rule for this — umlaut heuristics trip over proper nouns and over
the German UI strings that are supposed to stay. A keyword list is not enough either:
lines like `// Gleiche Tagesgrenze wie …` and `# Nach Start: …` contain neither an
umlaut nor a common stop word. Read the candidate files rather than trusting a grep. When translating an old comment,
keep the *why*: a comment that only restates what the code does is worth deleting
rather than translating.
