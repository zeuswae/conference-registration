#!/bin/bash
# Vercel build: switch to PostgreSQL when DATABASE_URL is a Neon/Postgres URL.
set -e
cd "$(dirname "$0")/.."

SCHEMA="prisma/schema.prisma"

if [[ "${DATABASE_URL:-}" == postgresql* ]]; then
  echo "Using PostgreSQL (Neon) for production..."
  sed -i.bak 's/provider = "sqlite"/provider = "postgresql"/' "$SCHEMA"
else
  echo "ERROR: DATABASE_URL must be a PostgreSQL connection string on Vercel."
  echo "Add it in Vercel → Settings → Environment Variables"
  exit 1
fi

npx prisma generate
npx prisma db push
node prisma/seed.mjs
npx next build
