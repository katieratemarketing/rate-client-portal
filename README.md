# Rate Client Portal

Client-facing delivery portal for Rate Marketing. Two views: admin (Rate team) and client.

## Current state

**Prototype** — using Claude artifact with shared persistent storage for testing with Ulverscroft.

**This repo** — scaffolded for the production build (Next.js + Supabase) when Paul is available.

## Production stack

- **Frontend:** Next.js (React)
- **Database:** Supabase (Postgres + Auth)
- **Hosting:** Netlify (auto-deploy from this repo)
- **Domain:** portal.ratemarketing.co.uk

## Setup (when ready to build)

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Copy `.env.example` to `.env.local` and add your Supabase credentials
3. Run the SQL in `supabase/schema.sql` in the Supabase SQL editor
4. `npm install && npm run dev`

## Deploy to Netlify

1. Connect this repo in Netlify
2. Build command: `npm run build`
3. Publish directory: `.next`
4. Add environment variables from `.env.example`

## Architecture

See `docs/architecture.md` for the full system spec.
