# SiteRent WAAS

Production-mode implementation for the SiteRent Website-as-a-Service platform described in `SiteRent_Developer_Brief.pdf`.

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
- `/login` Supabase registration, password sign-in, magic link, and Google OAuth
- `/tutorial` first-time production guide
- `/builder` protected Gemini AI website builder with file/image upload and onboarding handoff
- `/onboarding` protected six-step production onboarding flow
- `/dashboard` protected client website, AI assistant, media, billing, and settings workspace
- `/admin` protected admin client-management workspace
- `/admin/integrations` protected live integration preflight matrix
- `/sites/[subdomain]` production published site
- `/sites/[subdomain]/privacy` generated privacy policy

## Verification

Run the full local gate before wiring real providers:

```bash
npm run verify
```

Run route smoke checks against a running server:

```bash
npm run dev
npm run smoke
```

Use `SMOKE_BASE_URL=https://your-preview.example.com npm run smoke` to target a deployed preview. The smoke script checks public pages, protected route redirects, protected API fail-closed behavior, invalid enquiry rejection, and unsigned Peach webhook rejection.

## Database

Initial Supabase schema lives in:

```bash
supabase/migrations/0001_initial_schema.sql
```

Production hardening additions live in:

```bash
supabase/migrations/0002_p0_hardening.sql
```

## Environment

Copy `.env.example` to `.env.local` and fill in Supabase, Peach Payments sandbox/live, Gemini, Vercel, and email provider credentials.

Publishing is intentionally paused in this rollout. Keep `PUBLISHING_PAUSED=true` and `NEXT_PUBLIC_PUBLISHING_PAUSED=true` until the Supabase, billing, DNS, and launch checks are ready; the publish APIs return setup-paused responses while the flag is on.

Gemini website planning supports either:

- `GEMINI_API_KEY` for the Gemini Developer API.
- Vertex AI through Google Application Default Credentials. Set `GEMINI_PROVIDER=vertex-ai`, `GEMINI_MODEL=gemini-3.5-flash`, `GOOGLE_CLOUD_PROJECT`, and `GOOGLE_CLOUD_LOCATION=global`, then run `gcloud auth application-default login` locally and enable `aiplatform.googleapis.com`.
- On Vercel, local ADC is not available. Use `GEMINI_API_KEY`, or store service-account JSON in `GOOGLE_APPLICATION_CREDENTIALS_JSON` or base64-encoded JSON in `GOOGLE_APPLICATION_CREDENTIALS_BASE64`.

Supabase Auth is required before users can access `/builder`, `/onboarding`, `/dashboard`, `/admin`, `/tutorial`, or production action APIs. Configure Google as an OAuth provider in Supabase and allow `/auth/callback` as a redirect URL.

## Production Notes

The runtime fails with setup-required responses instead of placeholder success paths when required services are missing. Fill Supabase, Gemini, Peach Payments, Vercel, and email/tracking credentials before onboarding a production client end to end.

Before switching live credentials on, open `/admin/integrations`. It reads the current runtime environment and separates launch-critical blockers from optional/reporting integrations so Supabase, Gemini, Peach, Vercel, email, and GA4 can be connected one at a time.
