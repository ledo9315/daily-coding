#!/bin/sh
set -e

# Migrations run here rather than in the build, because the build has no database: the
# image is built in CI and the database only exists on the host. Vercel ran them as part
# of `pnpm build` (scripts/deploy-migrations.mjs), which is why that script is still in
# the repo but no longer on this path.
if [ "${RUN_MIGRATIONS:-1}" = "1" ]; then
  echo "[entrypoint] prisma migrate deploy"
  node node_modules/prisma/build/index.js migrate deploy
fi

exec "$@"
