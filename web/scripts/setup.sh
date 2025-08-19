#!/usr/bin/env bash
set -euo pipefail

# Setup script for the web app
# - Installs Node dependencies
# - Ensures .env.local exists (copies from example or scaffolds placeholders)

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "==> Working directory: $ROOT_DIR"

# 1) Verify Node + npm
if ! command -v node >/dev/null 2>&1; then
  echo "✖ Node.js is not installed. Please install Node 18+ from https://nodejs.org/" >&2
  exit 1
fi
if ! command -v npm >/dev/null 2>&1; then
  echo "✖ npm is not installed. Please install Node which ships with npm." >&2
  exit 1
fi

NODE_MAJOR=$(node -p "process.versions.node.split('.')[0]")
if [ "$NODE_MAJOR" -lt 18 ]; then
  echo "✖ Node $(node -v) detected. Please use Node 18+" >&2
  exit 1
fi

# 2) Install dependencies (prefer lockfile)
if [ -f package-lock.json ]; then
  echo "==> Installing dependencies with npm ci"
  npm ci
else
  echo "==> Installing dependencies with npm install"
  npm install
fi

# 3) Env file
if [ ! -f .env.local ]; then
  if [ -f .env.local.example ]; then
    echo "==> Creating .env.local from .env.local.example"
    cp .env.local.example .env.local
  else
    echo "==> Creating .env.local with placeholder values"
    cat > .env.local <<'EOF'
# Required Supabase environment variables
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE=

# Admin auth (comma-separated emails that may access /admin)
NEXT_PUBLIC_ADMIN_EMAILS=
EOF
  fi
  echo "-- Reminder: fill in .env.local values before running dev server."
else
  echo "==> .env.local already exists; leaving it untouched."
fi

cat <<'DONE'

✔ Setup complete.

Next steps:
  1) Edit .env.local and fill in:
     - NEXT_PUBLIC_SUPABASE_URL
     - NEXT_PUBLIC_SUPABASE_ANON_KEY
     - SUPABASE_SERVICE_ROLE
     - NEXT_PUBLIC_ADMIN_EMAILS (comma-separated)
  2) Start the dev server:
     npm run dev

Optional (Database):
  - In Supabase SQL Editor, run migrations in web/db/migrations in order:
      001_init.sql
      002_profiles.sql (optional)
      002_times_split.sql

DONE

