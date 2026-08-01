# CRM Aspidus — Next.js + Supabase

Čist, brz CRM rebuilt od nule u **Next.js 16 + TypeScript + Supabase**.
Nula SQLite. Nula migracionog duga. Aplikacija radi **isto** u dev i produkciji
jer sve ide kroz jedan Supabase projekat.

## Šta radi

- **Auth** — login, JWT sesija u httpOnly cookie, audit log svake akcije
- **Dashboard** — KPI-ovi, chart-ovi (poslovi po fazama, ponude po danima), top partneri, recent activity
- **Partneri** — pun CRUD, tip/status/rizik/KYC, kontakt i banka, portal pristup, detail sheet sa povezanim poslovima
- **Proizvodi** — CRUD, kategorije, nisko-stanje upozorenja
- **Poslovi** — pipeline kanban + tabela, 6 faza, verovatnoća, brza promena faze
- **Ponude** — CRUD sa editorom stavki (proizvod/količina/cena/popust/PDV), auto-izračun totala, statusi
- **Potražnje (RFQ)** — CRUD, stavke, statusi, konverzija u ponudu
- **Dokumenti** — biblioteka deljenih dokumenata po partnerima, kategorije, vidljivost
- **Zadaci** — lični taskovi, prioritet, rok, toggle done
- **Audit log** — svaka akcija sa korisnikom, IP-om, vremenom, detaljima
- **Korisnici** — admin upravljanje (uloge: admin/manager/staff/viewer)
- **Podešavanja** — kompanija, security policy, SMTP — 3 taba

## Arhitektura

```
src/
├─ app/
│  ├─ page.tsx              # auth gate → Login ili AppShell
│  ├─ layout.tsx            # root layout + Providers
│  └─ api/
│     ├─ auth/{login,logout,me}/route.ts
│     ├─ dashboard/route.ts
│     ├─ partners/route.ts + [id]/route.ts
│     ├─ products/, deals/, offers/, demands/
│     ├─ documents/, tasks/, users/, audit/, settings/
├─ components/
│  ├─ auth/login-view.tsx
│  ├─ layout/{sidebar,topbar,app-shell}.tsx
│  └─ views/*-view.tsx      # 11 view komponenti
├─ lib/
│  ├─ supabase/{client,types}.ts
│  ├─ data/
│  │  ├─ store.ts           # Store interfejs + factory
│  │  ├─ mock-store.ts      # in-memory (dev/demo)
│  │  ├─ supabase-store.ts  # production
│  │  └─ mock.ts            # seed data
│  ├─ auth/{session,password}.ts
│  └─ api/helpers.ts        # requireAuth + audit
└─ supabase-schema.sql      # ← pokreni ovo u Supabase Studiju
```

**Auto-detekcija backenda:**
- Ako su `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` setovani → koristi `SupabaseStore`
- Inače → koristi `MockStore` (in-memory sa seed podacima, za dev/demo)

## Pokretanje lokalno (demo mode)

```bash
bun install
bun run dev
```

Otvori aplikaciju. Prijavi se sa:
- **Username:** `vladimir`
- **Password:** `Vladimir2026`

App radi sa in-memory podacima (mock). Sve što uneseš nestaje pri restart-u.
Za perzistenciju, poveži Supabase (ispod).

## Povezivanje sa Supabase (produkcija)

### 1. Kreiraj Supabase projekat
- Idi na https://supabase.com → New Project
- Zapamti URL, service_role key, anon key

### 2. Pokreni schema
- U Supabase Studio → SQL Editor
- Otvori `supabase-schema.sql` iz ovog repa
- Klikni Run (idempotentno je — bezbedno pustiti više puta)

### 3. Setuj env varijable

Kopiraj `.env.example` u `.env.local` (dev) ili ih unesi u Render Dashboard (prod):

```bash
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...        # SERVER ONLY — nikad na frontend
SUPABASE_ANON_KEY=eyJ...
SECRET_KEY=<random 32+ char string>
ADMIN_USERNAME=vladimir
ADMIN_PASSWORD=Vladimir2026
APP_BASE_URL=https://your-app.onrender.com
```

### 4. Prvi boot
- Aplikacija automatski kreira admin nalog (`ADMIN_USERNAME` / `ADMIN_PASSWORD`)
  pri prvom startu ako ne postoji.
- Prijavi se i promeni lozinku (preporuka).

## Deploy na Render

### Render Web Service
1. **New → Web Service** → poveži GitHub repo
2. **Runtime:** Node (ili Bun)
3. **Build Command:** `bun install && bun run build`
4. **Start Command:** `bun run start`
5. **Environment Variables:** unesi sve iz `.env.example`
6. **Health Check:** `/` (vraća 200)

Napomene:
- **Ne treba persistent disk** — svi podaci su u Supabase-u.
- **Auto-deploy** iz `main` grane radi out-of-the-box.
- Render besplatni plan je OK za početak (aplikacija spin-up-uje na request).

### Alternative deploy platforme
Bilo gde gde Next.js radi (Vercel, Railway, Fly.io, VPS). Isti env varijable.

## Supabase Storage buckets (opciono, za dokumente)

U Supabase Studio → Storage kreiraj (privatne) bucket-e:
- `partner-docs`
- `offer-pdfs`
- `portal-uploads`
- `backups`

Trenutna dokumentaciona funkcija koristi samo metadata (filename, size, storage_path).
Pravi upload dođe u sledećoj iteraciji (upload-uj fajl → čuvaj u bucket → snimi path).

## RLS policies (preporuka za produkciju)

`service_role_key` bypass-uje RLS — bezbedno jer key nikad ne ide na frontend.
Za dodatni sloj zaštite, u Supabase Studiju definiši RLS policies:

```sql
-- Primer: partner može videti samo svoje ponude
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "partner sees own offers" ON offers
  FOR SELECT USING (
    auth.uid()::text = (SELECT portal_token FROM partners WHERE id = partner_id)
  );
```

Prilagodi po potrebi za tvoj auth model.

## Šta sledi (krug 2)

Ovaj rebuild pokriva **core CRM**. Sledeći koraci:
- Portal klijent flow (KYC, RFQ sa portala, order confirmation)
- Real Supabase Storage upload za dokumente
- Email queue (Supabase tabela)
- Document register sa V1/V2/V3 numeracijom
- Offer → Invoice/Proforma konverzija
- Custom SQL izveštaji (preko Supabase RPC funkcije)

## Tehnologije

- **Next.js 16** (App Router, Turbopack)
- **TypeScript 5**
- **Tailwind CSS 4** + **shadcn/ui** (New York style)
- **@supabase/supabase-js** (server-side, service_role)
- **jose** (JWT sesija)
- **bcryptjs** (password hashing)
- **TanStack Query** (server state)
- **Zustand** (client state)
- **Recharts** (chart-ovi)
- **lucide-react** (ikone)
