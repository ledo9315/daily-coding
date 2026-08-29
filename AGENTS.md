# Project: Daily Coding Challenge UI

Multi-agent: see **`AGENTS-QA.md`** for the QA role (supplementary tests, review). This document is the **CTO / engineering** guide.

## CTO vs. QA - who tests what?

| | **CTO** | **QA** |
|---|---------|--------|
| **Feature & business code** | Yes | No |
| **Vitest for new behavior** | **Required** in the feature PR (TDD, happy path + main error paths) | **Adds** missing cases, regression, harder edge cases |
| **Playwright (E2E)** | Only when in scope / sensible to ship with the task | **Primary owner** for critical user flows once Playwright is in the project |
| **PR review** | Author | **Reviewer** (logic, edge cases, basic security) |

**No duplicate work:** QA does **not** rewrite the same unit-test scenarios from scratch that the CTO already covered - unless **briefly agreed** in the issue/PR (e.g. “CTO tests insufficient, QA adds case X” or “E2E owned by QA”).

## Stack

- Next.js 16 App Router, React 19, TypeScript
- Tailwind CSS v4, shadcn/ui (Radix), Framer Motion
- PostgreSQL (Docker) + Prisma ORM
- Vitest (unit tests), Playwright (E2E tests)

## Structure

- `app/` → pages (challenge, dashboard, login, profile, ranking, team)
- `app/api/` → Next.js route handlers
- `components/` → reusable UI components
- `lib/` → `api.ts` (fetch layer), `prisma.ts` (DB client)
- `prisma/` → `schema.prisma`, migrations, `seed.ts`

## Database

- **Local:** PostgreSQL in Docker (`docker compose up -d db`). URL: `postgresql://daily_dev:daily_dev_secret@localhost:5433/daily_dev` (see `.env.example`).
- **Vercel / production:** `DATABASE_URL` must point to hosted Postgres (e.g. Neon), never `localhost`.
- **Migrations:** local: `pnpm prisma migrate dev`; production: `DATABASE_URL=<prod> pnpm prisma migrate deploy`.
- Always use the Prisma client from `lib/prisma.ts` - no raw SQL.

## Git workflow

- Never commit directly to `main`.
- Create a branch per issue: `git checkout -b feature/DAI-<number>-<short-title>`  
  Example: `git checkout -b feature/DAI-3-authentication`
- Commit messages include the issue number: `feat(DAI-3): add NextAuth.js login`
- When the task is done:
  1. Push: `git push origin feature/DAI-<number>-<short-title>`
  2. Open a PR to `main` titled `DAI-<number>: <issue title>`
  3. PR description: what changed, how to test, open questions

## Testing rules

- Every feature must ship with tests (TDD).
- Unit tests: Vitest - colocate in `__tests__/` next to the code under test.
- E2E tests: Playwright - under `e2e/`.
- Do not consider a task done if tests are missing.

## Open work

- Authentication (NextAuth.js or JWT)
- Challenge submission logic (real execution)
- Live ranking & stats (DB-backed)
- CI/CD (GitHub Actions - baseline exists in `.github/workflows/ci.yml`)

## Workflow rules

- After a CTO task lands, the CEO may open a QA issue for **additional** tests, E2E, and review - the CTO PR already includes baseline Vitest per Testing Rules.
- No feature is done without passing tests.
- The CEO keeps the QA agent fed with work after CTO runs.

## Package management

- Always commit `pnpm-lock.yaml` when adding or updating dependencies (same commit as `package.json` changes).
- Run `pnpm install` from the project root after pulling dependency changes.

## PR requirements (mandatory)

Before opening a PR, in order:

1. Tests for the change (Vitest; Playwright E2E if applicable).
2. Run all tests locally: `pnpm test` - **zero failures**.
3. `pnpm exec tsc --noEmit` - no type errors.
4. `pnpm lint` - no lint errors (or fix / agree with reviewer).
5. Open the PR only after tests (and typecheck/lint if required) pass.

No PR with failing tests or without tests for new behavior.
