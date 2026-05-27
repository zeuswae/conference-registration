#!/bin/bash
# Push latest code, then open Vercel import page.
set -e
cd "$(dirname "$0")/.."
export PATH="$PWD/.tools/node/bin:$HOME/.local/bin:$PATH"

git add -A
git reset HEAD .neon.env .env 2>/dev/null || true
git diff --cached --quiet || git commit -m "Production build for Neon + Vercel"

echo "Pushing to GitHub..."
if git push origin main; then
  echo "Push OK"
else
  echo "Push failed — run: gh auth login"
  echo "Then: git push origin main"
fi

open "https://vercel.com/new/import?s=https://github.com/zeuswae/conference-registration"

echo ""
echo "In Vercel, add Environment Variables:"
echo "  DATABASE_URL  = (from .neon.env)"
echo "  AUTH_SECRET   = Oq6Wx9key3uOVrvr02LajtvJQkSQuGXgd7fRY+By6oE="
echo "  NEXT_PUBLIC_APP_URL = https://conference-registration.vercel.app"
echo ""
echo "Then click Deploy."
