#!/usr/bin/env bash
# One-shot setup for the Kalyx demo recorder.
# Idempotent: safe to re-run. Installs deps + Chromium and creates output dirs.
set -euo pipefail

cd "$(dirname "$0")"

# Prefer pnpm, fall back to npm.
if command -v pnpm >/dev/null 2>&1; then
  PM=pnpm
else
  PM=npm
fi
echo "==> Using package manager: $PM"

# package.json is already committed, so just install.
"$PM" install

# Install the Chromium browser Playwright drives (no-op if already present).
"$PM" exec playwright install chromium

mkdir -p out recordings

echo
echo "==> Setup complete."
echo "    Record : DEMO_URL=https://kalyx-docs-site.vercel.app/playground pnpm record"
echo "    Encode : pnpm encode"
echo "    Both   : pnpm demo"
