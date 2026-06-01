# SiteRent WAAS MVP

MVP implementation for the SiteRent Website-as-a-Service platform described in `SiteRent_Developer_Brief.pdf`.

## Stack

- Next.js App Router
- TypeScript
- TailwindCSS
- Supabase Auth, Postgres, Storage, RLS
- Peach Payments recurring billing
- Resend or SendGrid transactional email
- GA4 traffic reporting
- Vercel hosting

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Current Routes

- `/` public marketing page
- `/onboarding` six-step onboarding scaffold
- `/login` Supabase magic-link login
- `/dashboard` client dashboard shell
- `/admin` admin client-management shell
- `/sites/cape-climate-pros` sample HVAC published site
- `/sites/cape-climate-pros/privacy` generated privacy policy sample

## Database

Initial Supabase schema lives in:

```bash
supabase/migrations/0001_initial_schema.sql
```

It includes the core `clients`, `onboarding_progress`, `billing_events`, `email_events`, and `admin_users` tables with initial RLS policies.

## Environment

Copy `.env.example` to `.env.local` and fill in Supabase, Peach Payments sandbox, and email provider credentials.

## Next Implementation Slices

1. Add Supabase storage buckets and upload flows for logos, owner photos, hero photos, and gallery images.
2. Test Step 5 payment with Peach Payments sandbox checkout.
3. Connect publish flow to Vercel domain handling and dashboard redirect.
4. Expand dashboard pages from shells into editable Supabase-backed forms.
5. Add email templates and transactional send helpers.
6. Add GA4 dashboard fetching.
