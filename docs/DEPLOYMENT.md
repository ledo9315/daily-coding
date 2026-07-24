# Deployment

This guide takes Daily Dev from the repo to a running production site. The app
is a Next.js 16 server app with Prisma/Postgres and a self-hosted **Piston**
code-execution engine.

The one hard constraint: **Piston needs a privileged Docker host** (it sandboxes
user code with isolate/nsjail). It therefore cannot run on Vercel/serverless —
it lives on a small VM you control. Everything else is standard.

## Recommended stack

| Part | Service | Why |
|---|---|---|
| App | **Vercel** | Native Next.js; push-to-deploy |
| Database | **Neon** (Postgres) | Serverless, generous free tier |
| Code execution | **Piston on a small VPS** | Needs privileged Docker (Hetzner CX22, DigitalOcean, Fly.io …) |

If you prefer a single box: run app + db + Piston with `docker compose` on one
VPS behind a reverse proxy. That needs an app Dockerfile (not in the repo yet) —
open an issue/ask and it can be added. The steps below use the recommended split.

> **Fast path:** You can go live *without* code execution first by setting
> `CODE_EXECUTION_ENABLED=false` (challenges can't be solved yet), then add Piston
> later by switching to `PISTON_API_URL`. Skip step 3 in that case.

---

## 1. Database (Neon)

1. Create a project at [neon.tech]; copy both connection strings (pooled + direct).
2. Apply the schema against the **direct** URL (run once, and after each schema change):
   ```bash
   DATABASE_URL="<neon-direct-url>" pnpm prisma migrate deploy
   ```
3. (Optional) Seed baseline data. Do **not** ship the default admin — set a strong
   password first:
   ```bash
   DATABASE_URL="<neon-direct-url>" SEED_ADMIN_PASSWORD="<strong>" pnpm db:seed
   ```
   Or create the admin manually and skip seeding. See the seed admin note in
   `.env.production.example`.

## 2. App (Vercel)

1. Import the GitHub repo in Vercel. Framework preset: **Next.js**. Build command
   `pnpm build` (runs `prisma generate`), install `pnpm install`.
2. Set the environment variables from `.env.production.example` in
   **Project → Settings → Environment Variables** (Production scope):
   - `DATABASE_URL` → Neon **pooled** URL
   - `AUTH_SECRET` → `openssl rand -base64 32`
   - `NEXTAUTH_URL` and `APP_URL` → your final `https://…` domain
   - `RESEND_API_KEY`, `EMAIL_FROM` (on a domain verified in Resend)
   - `REQUIRE_EMAIL_VERIFICATION=true`
   - Piston: `PISTON_API_URL` (from step 3) — or `CODE_EXECUTION_ENABLED=false` for the fast path
   - OAuth vars only if you enable social login
3. Add your custom domain and deploy. Set `NEXTAUTH_URL`/`APP_URL` to the final
   domain **before** relying on the email links (they embed this URL).

## 3. Piston (small VPS)

On a VM with Docker installed (arm hosts also work; the image is amd64):

```bash
# 1. Copy docker-compose.yml (or just the `piston` service) to the VM, then:
docker compose up -d piston

# 2. Install the language runtimes (js/ts/python/php) into the container.
#    From a checkout of this repo pointed at the VM's Piston, or run the script's
#    HTTP calls against the instance:
PISTON_API_URL="http://<vps-ip>:2000" pnpm piston:install
```

Then make it reachable over HTTPS and lock it down:

- Put a reverse proxy in front (Caddy gives automatic HTTPS):
  `piston.your-domain.example` → `127.0.0.1:2000`.
- **Do not expose port 2000 publicly.** Restrict access to Vercel's egress
  (allow-list) or require a shared secret at the proxy, since this endpoint runs
  arbitrary code on request.
- Set `PISTON_API_URL=https://piston.your-domain.example` in Vercel.

Verify runtimes are present:
```bash
curl https://piston.your-domain.example/api/v2/runtimes
```

## 4. Post-deploy smoke test

1. Register a new account → confirm the verification email arrives (Resend logs).
2. Log in; open today's challenge.
3. Solve it in each language (js/ts/python/php) → all test cases pass.
4. Submit a deliberately wrong solution → it fails (grading discriminates).
5. Log in as admin → `/admin/challenges` loads.
6. Visit `/impressum` and `/datenschutz`.

## Notes

- **Migrations:** always `prisma migrate deploy` against the direct DB URL before
  or during the deploy; the pooled URL is for the running app.
- **Secrets naming:** the canonical secret is `AUTH_SECRET` (NextAuth v5 reads it
  automatically; middleware also accepts the legacy `NEXTAUTH_SECRET`).
- **Email domain:** `EMAIL_FROM` must be verified in Resend or delivery fails
  silently — this is the most common "why didn't I get the email" cause.
