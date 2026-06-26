# Supabase backend setup

TapTipR stores wallets, tips, and transactions in **Supabase Postgres**. The Next.js app exposes API routes under `/api/*` that read and write through the Supabase service role.

## Architecture

```
Browser  →  Next.js API routes  →  Supabase Postgres
                (/api/wallets, /api/tips, …)
```

Without Supabase env vars, the app falls back to **localStorage** (demo mode only).

## 1. Create a Supabase project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Create a new project (e.g. `TapTipR`)
3. Wait for the database to provision

## 2. Run the database schema

Open **SQL Editor** in Supabase and run:

```
supabase/migrations/20250626000000_initial_schema.sql
```

This creates:

| Table | Purpose |
|-------|---------|
| `workplaces` | Participating businesses (Starbucks, etc.) |
| `profiles` | Employee/customer wallets + unique QR codes |
| `tips` | Tip records with optional NPS |
| `wallet_transactions` | Ledger (top-ups, tips, withdrawals) |

It also seeds demo workplaces and employees, and adds a `send_tip()` function for atomic tip transfers.

## 3. Configure environment variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

From Supabase **Project Settings → API**, copy:

| Variable | Where to find it |
|----------|------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role secret key |

Restart the dev server after saving `.env.local`.

## 4. API routes

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/wallets` | Create employee wallet + unique QR code |
| `GET` | `/api/wallets/code/[code]` | Lookup employee by QR code |
| `GET` | `/api/wallets/[id]` | Get wallet profile |
| `PATCH` | `/api/wallets/[id]` | Top up / withdraw balance |
| `GET` | `/api/wallets/[id]/tips` | Tip history |
| `GET` | `/api/wallets/[id]/transactions` | Ledger history |
| `POST` | `/api/tips` | Send a tip (atomic) |
| `GET` | `/api/workplaces/code/[code]` | Business QR lookup |

## 5. Verify

```bash
npm run dev
```

1. Create a wallet at `/register`
2. Confirm a row appears in Supabase **Table Editor → profiles**
3. Scan the generated QR and send a test tip
4. Check `tips` and `wallet_transactions` tables

## Optional: Supabase CLI

```bash
brew install supabase/tap/supabase
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

## Security note

The prototype uses the **service role key** on the server only. Before production, add Supabase Auth (phone OTP) and tighten Row Level Security policies.
