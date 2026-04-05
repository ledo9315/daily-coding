# Project: Daily Coding Challenge UI

## Stack
- Next.js 16 App Router, React 19, TypeScript
- Tailwind CSS v4, shadcn/ui (Radix), Framer Motion
- PostgreSQL (Docker) + Prisma ORM
- Vitest (unit tests), Playwright (E2E tests)

## Structure
- app/         → pages (challenge, dashboard, login, profile, ranking, team)
- app/api/     → Next.js route handlers
- components/  → reusable UI components
- lib/         → api.ts (fetch layer), prisma.ts (DB client)
- prisma/      → schema.prisma, migrations, seed.ts

## Database
PostgreSQL running in Docker.
Connection: postgresql://daily_dev:daily_dev_secret@localhost:5433/daily_dev
Always use the Prisma client from lib/prisma.ts — never raw SQL.

## Git Workflow
- Never commit directly to main
- Create a branch for every issue: `git checkout -b feature/DAI-<number>-<short-title>`
  Example: `git checkout -b feature/DAI-3-authentication`
- Commit messages include the issue number: `feat(DAI-3): add NextAuth.js login`
- When the task is done:
  1. Push the branch: `git push origin feature/DAI-<number>-<short-title>`
  2. Open a Pull Request to main with title: `DAI-<number>: <issue title>`
  3. PR description must include: what was done, how to test it, any open questions

## Testing Rules
- Every feature must have tests written alongside the implementation (TDD)
- Unit tests: Vitest — place in `__tests__/` next to the file being tested
- E2E tests: Playwright — place in `e2e/`
- Do not mark a task as done if tests are missing

## Open work
- Authentication (NextAuth.js or JWT)
- Challenge submission logic
- Live ranking & stats connected to DB
- CI/CD pipeline (GitHub Actions)

## Workflow Rules
- After every CTO task is completed, the CEO must create a QA issue
  assigned to the QA agent to write tests for the new code.
- No feature is considered done without passing tests.
- The CEO is responsible for keeping the QA agent busy — check after every CTO run.

## Package Management
- Always commit pnpm-lock.yaml when adding or updating dependencies
- Run  ERR_PNPM_NO_PKG_MANIFEST  No package.json found in /Users/leonid after changing package.json and include the updated lockfile in the same commit
