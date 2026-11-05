# syntax=docker/dockerfile:1

# Node 22 matches the CI workflow; Debian slim rather than Alpine because Prisma's query
# engine wants glibc and openssl, and the musl build has been the source of enough
# "engine not found" evenings.
FROM node:22-bookworm-slim AS base
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH NEXT_TELEMETRY_DISABLED=1
RUN corepack enable && apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app

FROM base AS deps
# pnpm-workspace.yaml carries the overrides and the allowBuilds list since pnpm 11;
# without it `--frozen-lockfile` refuses the install as a config mismatch.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY prisma ./prisma
COPY prisma.config.ts ./
# postinstall runs `prisma generate`, which needs the schema but no reachable database.
# prisma.config.ts refuses to load without DATABASE_URL unless CI is set, where it hands
# Prisma a placeholder URL - deliberately not set in the runtime stage, so a container
# started without a database fails loudly instead of migrating into the void.
ENV CI=true
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Everything a browser needs is inlined by `next build`, so it has to be here rather than
# in the container's environment file.
ARG SENTRY_ORG
ARG SENTRY_PROJECT
ARG NEXT_PUBLIC_SENTRY_DSN
ARG NEXT_PUBLIC_APP_URL=https://daily-coding.dev
ARG NEXT_PUBLIC_GITHUB_ENABLED=true
ARG NEXT_PUBLIC_GOOGLE_ENABLED=true
ENV SENTRY_ORG=$SENTRY_ORG \
    SENTRY_PROJECT=$SENTRY_PROJECT \
    NEXT_PUBLIC_SENTRY_DSN=$NEXT_PUBLIC_SENTRY_DSN \
    NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL \
    NEXT_PUBLIC_GITHUB_ENABLED=$NEXT_PUBLIC_GITHUB_ENABLED \
    NEXT_PUBLIC_GOOGLE_ENABLED=$NEXT_PUBLIC_GOOGLE_ENABLED \
    CI=true \
    # lib/prisma.ts refuses to be imported without this, and `next build` imports every
    # route while collecting page data. Nothing connects here - every route that queries
    # is dynamic - so the value only has to parse. The runtime stage does not inherit it.
    DATABASE_URL=postgresql://build:build@127.0.0.1:5432/build
# `next build` directly, not `pnpm build`: that script also calls deploy-migrations.mjs,
# which is the Vercel release step and has no database to talk to in here.
#
# The Sentry token arrives as a build secret rather than an ARG, or it would sit in the
# layer history and in the exported build cache. Without it the plugin skips the upload
# and generates no browser source maps, which is what a local build wants.
RUN --mount=type=secret,id=sentry_auth_token \
    export SENTRY_AUTH_TOKEN="$(cat /run/secrets/sentry_auth_token 2>/dev/null || true)" \
    && pnpm exec prisma generate \
    && pnpm exec next build

FROM base AS runtime
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0
RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
# Output tracing keeps the generated client but has been known to drop the engine binary
# next to it, and a missing engine only shows up on the first query.
COPY --from=build /app/lib/generated/prisma ./lib/generated/prisma

# `migrate deploy` at container start needs the CLI, the schema and the config file that
# hands Prisma the connection string - the datasource block in the schema carries no url.
#
# Installed with npm into a scratch prefix and then merged in, rather than copied out of
# the pnpm tree: pnpm resolves through symlinks into .pnpm, so copying node_modules/prisma
# and node_modules/@prisma yields a tree that is missing @prisma/config and dies on first
# use. npm's flat layout brings every transitive dependency along.
COPY --from=deps /app/package.json ./package.prisma.json
RUN PRISMA_VERSION="$(node -p "const p=require('./package.prisma.json');(p.dependencies&&p.dependencies.prisma)||(p.devDependencies&&p.devDependencies.prisma)")" \
  && npm install --prefix /tmp/prisma-cli --no-audit --no-fund --loglevel=error \
     "prisma@${PRISMA_VERSION}" dotenv \
  && tar -C /tmp/prisma-cli/node_modules -cf - . \
     | tar -C ./node_modules -xf - --skip-old-files \
  && rm -rf /tmp/prisma-cli ./package.prisma.json /root/.npm
COPY prisma ./prisma
COPY prisma.config.ts ./
COPY deploy/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh && chown -R nextjs:nodejs /app

USER nextjs
EXPOSE 3000
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["node", "server.js"]
