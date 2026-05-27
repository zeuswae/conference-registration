#!/bin/bash
# Deploy local code to Vercel + Neon (runs on YOUR Mac — needs internet).
set -e
cd "$(dirname "$0")/.."
export PATH="$PWD/.tools/node/bin:$HOME/.local/bin:$PATH"

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

[ -f .neon.env ] && source .neon.env
AUTH_SECRET="${AUTH_SECRET:-Oq6Wx9key3uOVrvr02LajtvJQkSQuGXgd7fRY+By6oE=}"

if [ -z "${DATABASE_URL:-}" ]; then
  echo -e "${RED}Missing .neon.env — Neon connection string not found.${NC}"
  exit 1
fi

# Test internet
if ! curl -sf --max-time 10 https://vercel.com >/dev/null; then
  echo -e "${RED}No internet or Vercel blocked. Check Wi‑Fi and try again.${NC}"
  exit 1
fi

echo "Installing Vercel CLI if needed..."
if ! command -v vercel &>/dev/null; then
  npm install -g vercel@latest || { echo "Run: npm install -g vercel"; exit 1; }
fi

if ! vercel whoami &>/dev/null 2>&1; then
  echo ""
  echo "Sign in to Vercel — browser will open."
  echo "Use: Continue with GitHub (same as zeuswae)"
  echo ""
  vercel login || exit 1
fi

echo "Logged in as: $(vercel whoami 2>/dev/null)"

vercel link --yes 2>/dev/null || vercel link

set_env() {
  local k=$1 v=$2
  vercel env rm "$k" production -y 2>/dev/null || true
  printf '%s' "$v" | vercel env add "$k" production
}

echo "Setting environment variables..."
set_env DATABASE_URL "$DATABASE_URL"
set_env AUTH_SECRET "$AUTH_SECRET"
set_env NEXT_PUBLIC_APP_URL "https://conference-registration.vercel.app"

echo ""
echo "Deploying (please wait 2–4 minutes)..."
if vercel --prod --yes 2>&1 | tee /tmp/vercel-deploy.log; then
  URL=$(grep -oE 'https://[a-z0-9][a-z0-9-]*[a-z0-9]\.vercel\.app' /tmp/vercel-deploy.log | tail -1)
  if [ -n "$URL" ]; then
    set_env NEXT_PUBLIC_APP_URL "$URL"
    vercel --prod --yes >/dev/null 2>&1 || true
    echo ""
    echo -e "${GREEN}=============================================="
    echo "  LIVE WEBSITE:"
    echo "  $URL"
    echo "=============================================="
    echo "  Admin: admin@conference.local / admin12345"
    echo -e "==============================================${NC}"
    open "$URL" 2>/dev/null || true
    exit 0
  fi
fi

echo ""
echo -e "${RED}Deploy may have failed. Open:${NC} https://vercel.com/dashboard"
echo "Or use manual steps in Desktop → COPY THESE TO VERCEL.txt"
exit 1
