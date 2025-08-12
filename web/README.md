# will n jarv — web

Quick setup on a new machine

1) Prerequisites
- Node.js 18+ and npm installed (check with `node -v` and `npm -v`).

2) Install dependencies
- cd web
- npm install

3) Environment variables
- Copy the example file and fill in values:
  cp .env.local.example .env.local
- Then edit .env.local and set:
  - NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (from your Supabase project)
  - SUPABASE_SERVICE_ROLE (service role key; used only by server actions in dev)
  - NEXT_PUBLIC_ADMIN_EMAILS (comma-separated emails allowed into /admin)

4) Run the dev server

0) One‑time setup (recommended)
- From the repo root: cd web
- Run: npm run setup
  - Installs dependencies (using npm ci if lockfile present)
  - Creates .env.local (from example or with placeholders)
- Then fill in .env.local values (see step 3 below) and run npm run dev

- npm run dev
- Open http://localhost:3000

5) Sign in as admin
- Visit /sign-in and use a magic link for an email in NEXT_PUBLIC_ADMIN_EMAILS.
- After the callback you’ll be redirected to /admin.

6) Admin pages
- /admin/live — mark event live, moderate requests (demo fallback works if DB isn’t ready)
- /admin/events — add upcoming events (requires Supabase tables set up)
- Sign out: /auth/sign-out

Notes
- You can run the UI without Supabase configured; however, accessing /admin requires Supabase Auth to be set up and you must sign in with an allowed email.
- For production, disable open email signups in Supabase and invite only your admin emails.

7) Database (Supabase)
- In the Dashboard → SQL Editor, run the migrations in web/db/migrations in order:
  - 001_init.sql (events, song_requests + RLS)
  - 002_profiles.sql (optional profiles table + trigger)
- You can re-run them safely; they’re written to be idempotent.


---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
