#!/bin/bash
set -e
cd "$(dirname "$0")/.."

if [[ "${DATABASE_URL:-}" != postgresql* ]]; then
  echo "ERROR: Set DATABASE_URL to your Neon PostgreSQL string in Vercel env vars."
  exit 1
fi

echo "Using PostgreSQL (Neon)..."
node scripts/prepare-schema.mjs

npx prisma generate
npx prisma db push
node prisma/seed.mjs
npx next build
