#!/bin/bash
# Deploy using .neon.env (already configured). Run on your Mac in Terminal.
set -e
cd "$(dirname "$0")/.."
export PATH="$PWD/.tools/node/bin:$HOME/.local/bin:$PATH"

if [ ! -f .neon.env ]; then
  echo "Missing .neon.env — ask Cursor to recreate it or paste DATABASE_URL there."
  exit 1
fi
source .neon.env
export AUTH_SECRET="${AUTH_SECRET:-Oq6Wx9key3uOVrvr02LajtvJQkSQuGXgd7fRY+By6oE=}"

echo "→ Pushing to GitHub..."
git push origin main

if ! command -v vercel &>/dev/null; then
  npm install -g vercel@latest
fi
if ! vercel whoami &>/dev/null; then
  echo "Sign in to Vercel (browser opens):"
  vercel login
fi

echo "→ Setting Vercel environment variables..."
vercel link --yes 2>/dev/null || vercel link

echo "$DATABASE_URL" | vercel env add DATABASE_URL production --force 2>/dev/null || \
  (vercel env rm DATABASE_URL production -y 2>/dev/null; echo "$DATABASE_URL" | vercel env add DATABASE_URL production)

echo "$AUTH_SECRET" | vercel env add AUTH_SECRET production --force 2>/dev/null || \
  (vercel env rm AUTH_SECRET production -y 2>/dev/null; echo "$AUTH_SECRET" | vercel env add AUTH_SECRET production)

echo "→ Deploying..."
vercel --prod 2>&1 | tee /tmp/vercel-out.log

URL=$(grep -oE 'https://[a-zA-Z0-9.-]+\.vercel\.app' /tmp/vercel-out.log | tail -1)
if [ -n "$URL" ]; then
  echo "$URL" | vercel env add NEXT_PUBLIC_APP_URL production --force 2>/dev/null || true
  echo ""
  echo "=============================================="
  echo "  LIVE WEBSITE: $URL"
  echo "  Admin: admin@conference.local / admin12345"
  echo "=============================================="
  open "$URL" 2>/dev/null || true
else
  echo "Open https://vercel.com/dashboard for your deployment URL"
fi
