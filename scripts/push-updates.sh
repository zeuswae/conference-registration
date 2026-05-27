#!/bin/bash
set -e
cd "$(dirname "$0")/.."
git add -A
git diff --cached --quiet && echo "Nothing to commit" && exit 0
git commit -m "${1:-Update project}" || true
git push origin main
echo "Pushed to https://github.com/zeuswae/conference-registration"
