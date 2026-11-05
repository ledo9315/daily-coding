# Moving off Vercel

The app runs as a container on the same host as Postgres and Piston (Hetzner, Falkenstein,
4 vCPU). Caddy terminates TLS and proxies to `127.0.0.1:3000`; the container itself is not
reachable from outside.

Why at all: on 5 November 2026 Vercel paused the Hobby project for exceeding the Fluid
Active CPU allowance (4 h 34 m against 4 h) and every route answered 402 for a month. The
database already lived on this host, so each request crossed the internet twice anyway.

## What runs where

| Piece | Location |
|---|---|
| App container | `/opt/daily-coding/docker-compose.yml`, image from GHCR |
| Database | `/opt/daily-coding-db/docker-compose.yml`, network `daily-coding-db_default` |
| Piston | started outside compose, listens on `127.0.0.1:2000` |
| TLS and routing | `/etc/caddy/Caddyfile` |
| Daily reminder | `daily-coding-reminder.timer`, 17:00 UTC |

Migrations no longer run during the build. `deploy/entrypoint.sh` applies them when the
container starts, which is also why a rollback to an older image does **not** roll the
schema back.

## First setup

1. **Environment file.** Copy `deploy/env.template` to `/opt/daily-coding/.env`, fill it
   in, `chmod 600`. The connection string keeps the host `piston.daily-coding.de`, because
   the certificate Postgres presents carries only that name and `verify-full` rejects every
   other - see *How the app reaches Postgres* below.

2. **GitHub secrets** for `.github/workflows/deploy.yml`:
   `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_SSH_KEY` (a key whose public half sits in the
   host's `authorized_keys`), plus `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_ORG`,
   `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN`.

3. **Give Piston a smaller share of the CPU.** It was started with `docker run` and
   therefore carries the default weight of 1024, same as everything else. A burst of
   compiled submissions would otherwise stall the website:

   ```
   docker update --cpu-shares 512 piston
   ```

4. **Start it** and watch the first migration run:

   ```
   cd /opt/daily-coding && docker compose up -d && docker compose logs -f app
   ```

   `curl -s localhost:3000/api/health` must answer `{"status":"ok"}` before the domain is
   moved. At this point nothing public has changed yet.

5. **Move the DNS** at IONOS: the `A` record of `daily-coding.dev` (and `www`) from
   Vercel's `216.198.79.1` to this host. Only then does Caddy stand a chance of getting a
   certificate, because the HTTP challenge is answered on port 80 of whatever the name
   resolves to.

6. **Add the Caddy block** from `deploy/Caddyfile.snippet` to `/etc/caddy/Caddyfile` and
   `systemctl reload caddy`. The certificate arrives within seconds; `journalctl -u caddy
   -f` shows it.

7. **Arm the reminder:** `systemctl enable --now daily-coding-reminder.timer`, check with
   `systemctl list-timers daily-coding-reminder`.

## How the app reaches Postgres

The connection string names `piston.daily-coding.de`, and it has to: Postgres serves the
Let's Encrypt certificate Caddy keeps for that name, and `sslmode=verify-full` compares it
against the hostname that was dialled. The container's own name would fail the check.

That used to mean the request left the machine and came back over the public interface,
which is why `5432` was published to the whole internet. It is not any more. The database
service carries the same name as a **network alias**:

```yaml
    ports:
      - "127.0.0.1:5432:5432"
    networks:
      default:
        aliases:
          - piston.daily-coding.de
```

Docker's embedded resolver answers that name with the container's address on the shared
network, so the app dials the name the certificate was issued for and the packets never
leave the bridge. The published port is left on the loopback for an SSH tunnel from a
workstation; from outside, 5432 is closed.

The order matters when setting this up from scratch: bind the port to the loopback
*without* adding the alias and the app cannot reach the database at all.

**The alias shadows the name for everything in that network, not just Postgres.** Caddy
serves Piston under `piston.daily-coding.de` as well, so once the alias exists, the app
container resolves that name to the database and every submission dies with
`Execution failed: fetch failed` - the sandbox looks down when it is fine. Caddy's site
block carries a second name for Piston, and `PISTON_API_URL` uses that one
(`piston.leonid-domahalskyy.de`). Giving Postgres its own hostname and certificate would
untangle this properly; until then, the two names must not be the same.

## Afterwards

- **Remove the Vercel project** once a few days have passed without a reason to go back,
  and with it `vercel.json` and `scripts/deploy-migrations.mjs`.
- **Disk.** The host sits at 72 % before any of this. The deploy prunes images older than
  a week; keep an eye on `docker system df`.

## Rollback

```
cd /opt/daily-coding
sed -i "s|image: ghcr.io/.*|image: ghcr.io/ledo9315/daily-coding:<older-sha>|" docker-compose.yml
docker compose up -d app
```

Migrations are not undone by this. A release that changes the schema destructively needs a
database dump first, and `/opt/daily-coding-db` has no automatic backup yet.
