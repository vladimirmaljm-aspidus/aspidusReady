# Aspidus Trade Platform

A multi-tenant B2B trade management platform — CRM, landed-cost calculation,
logistics, KYC/compliance, document management, and a client-facing portal —
built on Next.js and Supabase.

## Stack

- **Framework:** Next.js (App Router), React, TypeScript
- **UI:** Tailwind CSS, shadcn/ui
- **Data:** Supabase (Postgres) via the service-role key on the server
- **Maps/routing:** MapLibre GL, OSRM, Nominatim (Trade Globe module)

## Local development

```bash
npm install --legacy-peer-deps
cp .env.example .env.local   # fill in SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, etc.
npm run dev
```

The app runs at `http://localhost:3000`. First-time setup requires
`ADMIN_USERNAME`, `ADMIN_PASSWORD`, and `ADMIN_EMAIL` to be set before
calling `POST /api/setup` to create the first admin user.

## Database

Schema and RLS policies live in `supabase-schema.sql` (baseline) and
`supabase/migrations/` (incremental changes). Apply them against your
Supabase project via the SQL editor or the Supabase CLI.

## Deployment

Configured for [Render](https://render.com) via `render.yaml` — see that
file for the required environment variables. `docs/` contains per-module
reference documentation.
