# SiteRent MVP Progress

## Objective

Build the MVP Website-as-a-Service platform described in `SiteRent_Developer_Brief.pdf`: a South African service-business website rental platform with guided onboarding, Gemini-assisted website planning, Peach Payments recurring billing, Supabase-backed published sites, client dashboard, and admin panel.

This document is the running implementation ledger. It must be updated after every implementation pass.

## Latest Pass

2026-06-14:

- Mobile optimization and temporary test-mode pass:
  - Added explicit `WAAS_TEST_MODE` / `NEXT_PUBLIC_WAAS_TEST_MODE` switches and turned them on in local env so this checkout can run without a Supabase database for now.
  - Bypassed middleware auth only in test mode, and supplied deterministic sample client/site/admin data for dashboard, admin, and published-site routes.
  - Added test-mode responses for onboarding save, dashboard updates, uploads, subdomain checks, publish/re-publish, Peach checkout, billing cancel, admin client actions, public enquiries, and AI website plan generation.
  - Updated `/login` with a visible database-free test-mode path so it does not instantiate the Supabase browser client while test mode is active.
  - Improved mobile layouts across landing, login, builder, onboarding, dashboard, and admin: compact page shells, horizontal mobile navs, stacked narrow form rows, scroll-safe wide tables, mobile dashboard section navigation, and a back path from mobile website preview.
  - Generalized onboarding beyond HVAC with industry presets for plumbers, geyser repair, electricians, locksmiths, pest control, roofing, HVAC, solar, barbers, and photographers.
  - Restored `/builder` -> `/onboarding?fromBuilder=1` draft handoff and added visual-direction notes so Gemini can carry customer website-look instructions into onboarding.
  - Updated local publish to simulate the Gemini website-ready email handoff with an `Open dashboard` button target, while production still queues the email event through the existing provider path.
  - Local paths verified on `http://127.0.0.1:3000`:
    - `/`
    - `/builder`
    - `/onboarding?fromBuilder=1` after generating a plumber draft in `/builder`
    - `/onboarding?demo=1` through all six steps, local Peach success, publish, and redirect to `/dashboard`
    - `/dashboard`
    - `/sites/brightspark-electricians`
  - Local test-mode APIs verified:
    - `GET /api/subdomains/check?subdomain=brightspark-electricians`
    - `POST /api/ai/website-plan`
    - `POST /api/onboarding/save`
    - `POST /api/peach/checkout`
    - `POST /api/publish`
    - `POST /api/uploads`
  - Verification after the pass:
    - `npm.cmd run typecheck` passed
    - `npm.cmd run lint` passed with the existing onboarding raw `<img>` upload-preview warning
    - `npm.cmd run build` passed with the same warning
    - Browser mobile checks at 390px width confirmed no horizontal overflow on `/onboarding?fromBuilder=1`, `/onboarding?demo=1`, and `/dashboard`

2026-06-03:

- Integration preflight and quality-gate pass:
  - Added a shared runtime readiness helper for Supabase, platform routing, Gemini, Peach, Vercel domains, email, GA4 reporting, and runtime hardening.
  - Added an integration preflight summary to the admin command center and a dedicated `/admin/integrations` matrix with critical blockers, missing environment values, evidence, and next setup steps.
  - Added `npm run verify`, `npm run smoke`, a dependency-free `scripts/preflight-smoke.mjs`, and a GitHub Actions CI workflow for install, typecheck, lint, and build.
  - Updated README with the pre-integration verification flow and `/admin/integrations` usage.
  - Verification after the pass:
    - `npm.cmd run typecheck` passed
    - `npm.cmd run lint` passed with no warnings
    - `npm.cmd run build` passed and the production route table lists `/admin/[section]` and middleware
    - Production smoke on `http://127.0.0.1:3001` via `npm.cmd run smoke` passed for `/`, `/login`, protected `/dashboard` and `/admin` redirects, protected AI API fail-closed behavior, invalid public enquiries, and unsigned Peach webhooks

- Client ownership authorization pass:
  - Added authenticated client ownership checks to `/api/publish`, `/api/peach/checkout`, and `/api/onboarding/save` so signed-in users cannot publish, pay for, or update another user's client row by guessing a `clientId`.
  - Made those routes fail closed with `401` when Supabase Auth is configured but no session is present, and `404` when the requested client is not owned by the current user.
  - Updated Peach checkout customer fields to derive from the owned client row before building signed Hosted Checkout fields.
  - Verification after the pass:
    - `npm.cmd run typecheck` passed
    - `npm.cmd run lint` passed with no warnings
    - `npm.cmd run build` passed and the production route table lists middleware
    - Production smoke on `http://127.0.0.1:3001` confirmed `/` and `/login` return `200`, `/builder`, `/dashboard`, and `/tutorial` redirect to `/login?next=...`, protected AI, publish, Peach checkout, and onboarding APIs return `401` without a session, and public invalid enquiries still return `400`

- Auth callback resilience pass:
  - Added missing-config, missing-code, and code-exchange error handling to `/auth/callback`.
  - Redirected callback failures back to `/login` with the requested `next` path preserved and a visible `auth_error` message.
  - Updated `/login` to render auth callback errors from `searchParams` immediately, not only after client hydration.
  - Verification after the pass:
    - `npm.cmd run typecheck` passed
    - `npm.cmd run lint` passed with no warnings
    - `npm.cmd run build` passed and the production route table lists middleware
    - Production smoke on `http://127.0.0.1:3001` confirmed missing-code and invalid-code callbacks redirect to `/login?next=...&auth_error=...`, the login page renders the callback error, protected app routes still redirect to login, and `/api/ai/website-plan` returns `401` without a session

- Peach result-routing production pass:
  - Replaced the always-successful Peach shopper-result redirect with result-code classification for successful, pending, failed, and missing result states.
  - Added raw and normalized Peach result signature checks so signed shopper results are not marked valid if the signature fails.
  - Updated Peach return, failed, and cancel pages with honest state-specific copy, result-code display, and dashboard/billing next-step links.
  - Verification after the pass:
    - `npm.cmd run typecheck` passed
    - `npm.cmd run lint` passed with no warnings
    - `npm.cmd run build` passed and the production route table lists middleware
    - Production smoke on `http://127.0.0.1:3001` confirmed success and pending result codes route to `/peach/return`, failed and missing result codes route to `/peach/failed`, return/failed pages render the expected copy, protected app routes still redirect to login, and unsigned Peach webhooks return `400`

- Admin authorization and subsection readiness pass:
  - Moved admin authorization into the shared `/admin` layout so every admin child route requires a signed-in user with an `admin_users` record.
  - Replaced generic `/admin/[section]` developer-facing copy with production operations pages for payments, customers, messages, templates, invoices, analytics, automation, settings, security, and help.
  - Added section-specific data-source notes, readiness cards, and production checklists without introducing sample records or fake metrics.
  - Verification after the pass:
    - `npm.cmd run typecheck` passed
    - `npm.cmd run lint` passed with no warnings
    - `npm.cmd run build` passed and the production route table lists middleware
    - Production smoke on `http://127.0.0.1:3001` confirmed `/`, `/login`, `/builder`, `/admin/payment`, `/api/ai/website-plan`, `/api/enquiries`, `/api/peach/result`, `/api/peach/webhook`, and `/tutorial` have the expected public/protected behavior

- Production honesty cleanup pass:
  - Removed synthetic admin dashboard revenue multipliers, month bars, and growth claims.
  - Replaced fake admin revenue/pipeline charts with live-data summaries and empty states.
  - Updated dashboard system feed, domain settings, email settings, notification readiness, and lead reply routing so they reflect actual client configuration instead of defaulting to enabled/armed states.
  - Verification after the pass:
    - `npm.cmd run typecheck` passed
    - `npm.cmd run lint` passed with no warnings
    - `npm.cmd run build` passed and the production route table lists middleware
    - Production smoke on `http://127.0.0.1:3001` confirmed `/` and `/login` return `200`, `/builder`, `/dashboard`, and `/admin` redirect to `/login?next=...`, and `/api/ai/website-plan` returns `401` without a session

2026-06-02:

- Auth and first-use production readiness pass:
  - Added real Supabase Auth entry points at `/login` for registration, password sign-in, magic links, and Google OAuth.
  - Added `/auth/callback` and `/auth/signout` for OAuth/email redirect handling and session cleanup.
  - Moved the production auth gate into `src/middleware.ts` so the Next.js `src/app` build picks it up.
  - Protected `/builder`, `/onboarding`, `/dashboard`, `/admin`, `/tutorial`, and production action APIs behind server-validated Supabase sessions.
  - Added a protected `/tutorial` first-use guide and dismissible dashboard quick-start guide for first-time users.
  - Updated website CTAs, dashboard/admin sign-out paths, README, and `.env.example` for auth-first onboarding.
  - Verification after the pass:
    - `npm.cmd run typecheck` passed
    - `npm.cmd run lint` passed with no warnings
    - `npm.cmd run build` passed and the production route table lists middleware
    - Production smoke on `http://127.0.0.1:3001` confirmed `/` and `/login` return `200`, protected pages redirect to `/login?next=...`, and `/api/ai/website-plan` returns `401` without a session

- Production-mode hardening pass:
  - Removed demo/local success paths from production-facing API routes for enquiries, admin actions, cancellation, uploads, publish, onboarding save, Peach checkout, and Peach webhooks.
  - Removed local/sample published-site fallbacks so missing Supabase configuration surfaces as setup-required state instead of showing sample customer data.
  - Removed fake dashboard analytics, leads, billing history, database records, card details, review ratings, and published-site trust claims.
  - Added file and image attachment upload support to the AI website builder, admin AI studio, and dashboard AI side chat.
  - `GEMINI_API_KEY` is now required for AI website planning in production mode.

- Tonight onboarding basics pass:
  - Restored `/` as a public SiteRent website instead of redirecting straight to login.
  - Added `/builder` as a user-facing AI website builder that calls the existing `/api/ai/website-plan` endpoint.
  - Wired the builder to save a draft into browser storage and hand it into `/onboarding?fromBuilder=1`.
  - Updated onboarding to prefill business name, owner/contact, city, service area, services, phone, email, template style, about copy, WhatsApp, and subdomain from the builder draft.
  - Removed nonessential blockers from onboarding validation for a first publish: year founded, street address, and logo upload are now optional.
  - Added dashboard entry points for the AI builder in the projects top bar, empty state, projects home, and overview quick actions.
  - Updated route docs and sitemap to include `/builder`.
  - Verification after the pass:
    - `npm.cmd run typecheck` passed
    - `npm.cmd run lint` passed with no warnings
    - `npm.cmd run build` passed
    - Browser smoke checked `/`, `/builder`, builder-to-onboarding prefill, and `/dashboard` on `http://127.0.0.1:3000`

2026-05-27:

- Sales-ops-dashboard exactness pass:
  - Reworked the live WAAS dashboard to follow the `sales-ops-dashboard` visual system more closely while keeping real app routes and data wired.
  - Replaced the prior marketing-style dashboard overview with a sales-ops-style operational layout:
    - compact metric card strip
    - revenue trend panel
    - launch pipeline panel
    - recent activity table
    - top actions table
  - Updated global dark dashboard tokens to include the reference-style accent, destructive, and chart colors.
  - Restyled dashboard child surfaces to match the reference dark card system:
    - website edit form
    - photo manager
    - billing panel
    - tracking/settings form
    - publish notice
    - republish action
    - placeholder pages for traffic, reviews, and support
  - Kept `sales-ops-dashboard` as a reference-only folder, not compiled source, so WAAS still builds with its existing dependency set.
  - Verification after the pass:
    - `npm.cmd run typecheck` passed
    - `npm.cmd run lint` passed with the existing onboarding image optimization warning
    - `npm.cmd run build` passed with the existing onboarding image optimization warning

- Starter template and onboarding refinement pass:
  - Replaced the old internal published-site template names with the four visual starter styles requested from the HVAC references:
    - `aireco-dark`
    - `eircool-editorial`
    - `razor-minimal`
    - `coolair-blue`
  - Added shared template metadata in `src/lib/constants.ts` for labels, descriptions, accents, and onboarding previews.
  - Updated `ClientSite`, Supabase row mapping, sample data, dashboard update validation, AI website planning, query-string template previews, onboarding save validation, and the Supabase schema to use the new starter style keys.
  - Kept mapper compatibility for older stored keys by translating:
    - `soft-orange` and `dark-premium` to `aireco-dark`
    - `army-bold` to `razor-minimal`
    - `blue-corporate` to `coolair-blue`
    - `editorial-orange` to `eircool-editorial`
  - Reworked the published HVAC renderer so each starter style uses full-page-bleed section structure instead of an outer framed page:
    - `aireco-dark`: dark premium hero, orange booking form, large technician image, awards/offers sections.
    - `eircool-editorial`: cream/olive editorial layout, pale green ambience, large staggered imagery.
    - `razor-minimal`: ivory/yellow/burgundy service-page look with oversized typography and horizontal service-card energy.
    - `coolair-blue`: blue corporate full-bleed hero with overlay image, trust/process sections, and blue CTAs.
  - Refined onboarding:
    - Expanded the workspace width and made the right-side preview sticky.
    - Added a dedicated "Branding and starter style" section.
    - Added selectable visual cards for all four full-bleed starter templates.
    - Updated the live preview to reflect the selected starter template, not only the brand colour.
    - Added local-draft compatibility so old saved browser drafts fall back to `aireco-dark`.
  - Updated Gemini/admin assistant template choices to the new four starter styles.
  - Verification after the pass:
    - `npm.cmd run typecheck` passed
    - `npm.cmd run lint` passed with the existing onboarding image optimization warning
    - `npm.cmd run build` passed with the existing onboarding image optimization warning

- Light-mode dashboard design-language pass:
  - Rebuilt the dashboard shell into a light WAAS workspace with a warm neutral background, rounded cards, a left rail, and a top action bar.
  - Reworked the dashboard overview into a real WAAS command center with site status, billing, gallery, and tracking summary cards.
  - Restyled the website editor, gallery, billing, tracking, publish notice, and republish button to match the new light dashboard system.
  - Tuned the root auth and login surfaces to reuse the same light visual language.
  - Updated the global theme tokens, fonts, and background treatment so the dashboard now reads as a single cohesive product.
  - Verification after the pass:
    - `npm run typecheck` was not run, but targeted file error checks passed for the touched routes and components

2026-05-27:

- Milestone 3-6 dashboard, billing, publish, and enquiry pass:
  - Added a dashboard data loader that reads the authenticated Supabase user's latest client row, with local sample fallback.
  - Marked the dashboard segment as dynamic so authenticated client data is loaded per request.
  - Wired dashboard publish-update buttons to `/api/publish/republish`.
  - Built editable dashboard website settings backed by `/api/dashboard/client`.
  - Built dashboard gallery upload/delete flow using the existing Supabase Storage upload API and `gallery_photos`.
  - Built dashboard billing panel with failed-payment banner and Peach cancellation API action.
  - Added Facebook Pixel, GA4 Measurement ID, and Google Place ID dashboard settings.
  - Added a working published-site contact form and `/api/enquiries`.
  - Added `site_enquiries` and `google_place_id` to the Supabase schema.
  - Verification after the pass:
    - `npm run typecheck` passed
    - `npm run build` passed with the existing onboarding image optimization warning only

- Published template design-language pass:
  - Reworked the HVAC published-site renderer into five selectable design languages:
    - `soft-orange`
    - `dark-premium`
    - `army-bold`
    - `blue-corporate`
    - `editorial-orange`
  - Added `template_style` to the client schema and mapper.
  - Added query-string template preview support on `/sites/[subdomain]?template=...`.
  - Added dashboard/API update support for `templateStyle`.
  - Improved local sample image fallbacks with real aircon repair photography.
  - Kept shared SEO, analytics, enquiry capture, contact details, service data, and testimonial data across all templates.
  - Verification after the pass:
    - `npm run typecheck` passed
    - `npm run build` passed with the existing onboarding image optimization warning only
    - Playwright smoke-tested all five template modes with no failed page assets

- Gemini website assistant scaffold:
  - Added server-side Gemini REST helper for structured website creation/restyle plans.
  - Added `/api/ai/website-plan`.
  - Added an admin Gemini Website Assistant panel for creating or restyling sites across the five template languages.
  - Added local fallback output when `GEMINI_API_KEY` is not configured.
  - Added `GEMINI_API_KEY` and `GEMINI_MODEL` to `.env.example`.
  - Verification after the pass:
    - `npm run typecheck` passed
    - `npm run build` passed with the existing onboarding image optimization warning only
    - Local fallback API smoke test passed

- Demo auth and Vercel-style workspace pass:
  - Replaced the marketing homepage with a focused demo auth screen at `/`.
  - Demo auth primary action now opens `/admin`.
  - Simplified `/dashboard` into an empty-state cockpit with a clear `Create website` CTA into `/onboarding`.
  - Tuned the admin panel toward a Vercel-like monochrome product UI with quieter borders, flatter white surfaces, black active states, and reduced saturated accents.
  - Verification after the pass:
    - `npm run typecheck` passed
    - `npm run build` passed with the existing onboarding image optimization warning only
    - Playwright smoke-tested `/`, `/dashboard`, and `/admin` with no failed page assets

- Milestone 5 published-site tracking and schema pass:
  - Added GA4 script injection on published sites when `ga_measurement_id` exists.
  - Added Facebook Pixel script and noscript fallback when `pixel_id` exists.
  - Added LocalBusiness/HomeAndConstructionBusiness JSON-LD with canonical URL, contact details, areas served, hours, image, logo, and social links.
  - Expanded published-site SEO metadata with canonical and Open Graph fields.
  - Rendered stored logo, hero photo, owner photo, operating hours, Google Maps embed, and social links on published sites.
  - Converted published-site gallery rendering from raw `<img>` to `next/image`.
  - Added broad remote image support for uploaded storage URLs in `next.config.mjs`.
  - Verification after the pass:
    - `npm run typecheck` passed
    - `npm run lint` passed with the existing onboarding image optimization warning only
    - `npm run build` passed with the existing onboarding image optimization warning only

2026-05-26:

- Sales-ops-dashboard primary UI pass:
  - Used `sales-ops-dashboard` as the primary reference for the default app shell.
  - Rebuilt `src/components/dashboard/dashboard-shell.tsx` around the reference structure: fixed collapsible sidebar, sticky header, search field, notification button, and compact avatar CTA.
  - Linked the reference-style navigation to the real WAAS app routes:
    - `/dashboard`
    - `/dashboard/edit`
    - `/dashboard/photos`
    - `/dashboard/traffic`
    - `/dashboard/billing`
    - `/dashboard/reviews`
    - `/dashboard/settings`
    - `/dashboard/support`
  - Changed `/` to redirect directly to `/dashboard`, making the dashboard the default and primary UI.
  - Added dark sales-ops-style design tokens to `globals.css` and Tailwind.
  - Removed stale re-export adapter files that pulled the reference app into this build.
  - Excluded `sales-ops-dashboard` and `skills` from this app's TypeScript project so they remain references, not compiled source.
  - Removed `next/font` Google font fetching so production builds work in restricted/offline environments.
  - Replaced broken `/admin/full` duplicate page with a redirect to `/admin`.
  - Verification after the pass:
    - `npm.cmd run typecheck` passed
    - `npm.cmd run lint` passed with the existing onboarding image optimization warning
    - `npm.cmd run build` passed

- Payment provider switch:
  - Replaced the previous payment-provider scaffold with Peach Payments Hosted Checkout.
  - Added Peach HMAC SHA256 signature helpers using `PEACH_ENTITY_ID` and `PEACH_SECRET_TOKEN`.
  - Added `/api/peach/checkout`, `/api/peach/webhook`, and `/api/peach/result`.
  - Added Peach return, cancel, and failed pages.
  - Onboarding Step 5 now calls Peach Checkout and posts signed fields to Peach.
  - Renamed payment env vars and schema token field to Peach-specific names.
  - Verification after the pass:
    - `npm run typecheck` passed
    - `npm run lint` passed with image optimization warnings only
    - `npm run build` passed

- Milestone 4 publish/subdomain pass:
  - Added domain helper utilities for platform URLs, reserved subdomains, validation, and custom-domain DNS instructions.
  - Added Vercel domain registration scaffold.
  - Tightened `/api/subdomains/check` validation.
  - Expanded `/api/publish` to return custom-domain instructions, queue publish confirmation email events, optionally call Vercel domain registration, and log publish events.
  - Onboarding now redirects to `/dashboard` after successful publish.
  - Dashboard now shows a post-publish notice with site URL and DNS instructions.
  - Added `/api/publish/republish` scaffold.
  - Added published-site suspension guard for expired past-due/cancelled/paused sites.
  - Verification after the pass:
    - `npm run typecheck` passed
    - `npm run lint` passed with image optimization warnings only
    - `npm run build` passed

- Milestone 3 Peach Payments billing pass:
  - Added server-side Peach Checkout creation.
  - Replaced the Step 5 simulated payment button with Peach Checkout handoff plus local-mode fallback.
  - Added Peach return, cancel, and failed pages.
  - Added cancellation API scaffold.
  - Expanded webhook handling for active and past-due subscription states.
  - Added billing helper utilities and schema fields for failed-payment and subscription-end timing.
  - Verification after the pass:
    - `npm run typecheck` passed
    - `npm run lint` passed with image optimization warnings only
    - `npm run build` passed

- Renamed this document from `IMPLEMENTATION_PLAN.md` to `PROGRESS.md`.
- Milestone 2 onboarding was advanced with structured testimonials, address/social/pixel fields, structured hours, upload controls, local resume, subdomain availability checks, upload API, expanded save payload, and Supabase Storage migration additions.
- Verification after the pass:
  - `npm run typecheck` passed
  - `npm run lint` passed with image optimization warnings only
  - `npm run build` passed

## Current Stack

- `Next.js 14` App Router for the marketing site, onboarding, dashboard, admin panel, API routes, and published sites.
- `TypeScript` for application code.
- `TailwindCSS` for styling.
- `Supabase` for Auth, Postgres, RLS, service-role server operations, and future file storage.
- `Peach Payments` for South African payment and recurring subscription handling.
- `Resend` or `SendGrid` for future transactional email.
- `GA4` for future traffic reporting and per-site analytics.
- `Vercel` for future deployment, SSL, and domain handling.

## Implemented Foundation

### Project Setup

Implemented:

- Created the Next.js project structure manually.
- Added package/dependency setup in `package.json`.
- Added TypeScript config in `tsconfig.json`.
- Added Tailwind config in `tailwind.config.ts`.
- Added global styling in `src/app/globals.css`.
- Added environment template in `.env.example`.
- Added README setup and route documentation in `README.md`.

Remaining:

- Add real `.env.local` values.
- Review npm audit findings.
- Add formal deployment configuration once Vercel project exists.

Code areas:

- `package.json`
- `next.config.mjs`
- `tailwind.config.ts`
- `src/app/layout.tsx`
- `src/app/globals.css`
- `.env.example`
- `README.md`

## Milestone 1: Database, Auth, and Core Infrastructure

### Supabase Database

Implemented:

- Added initial Supabase migration:
  - `clients`
  - `onboarding_progress`
  - `billing_events`
  - `email_events`
  - `admin_users`
- Added RLS policies for client-owned data.
- Added admin policy foundation.
- Added `updated_at` trigger for `clients`.
- Added initial Supabase Storage bucket creation for:
  - `logos`
  - `hero-photos`
  - `owner-photos`
  - `gallery-photos`
- Added initial public-read and authenticated-upload storage policies.

Remaining:

- Run migration against a real Supabase project.
- Test RLS with real authenticated users.
- Add indexes for production lookups, especially `subdomain`, `user_id`, and billing status.
- Verify storage policies in the real Supabase project.

Integration:

- Supabase Postgres.
- Supabase Row Level Security.
- Supabase Storage still pending.

Code areas:

- `supabase/migrations/0001_initial_schema.sql`

### Supabase Auth

Implemented:

- Added Supabase browser client.
- Added Supabase server client.
- Added Supabase service-role admin client for server API routes.
- Added environment guards so the app still runs locally without Supabase credentials.
- Added magic-link login page.
- Added auth callback route.
- Added middleware protection for `/dashboard` and `/admin` when Supabase is configured.
- Onboarding save route attaches `user_id` when a logged-in Supabase user exists.

Remaining:

- Confirm magic-link email templates/settings in Supabase dashboard.
- Add signup/onboarding-start flow decision:
  - require login before onboarding, or
  - allow onboarding first and bind user before payment/publish.
- Add admin authorization checks beyond simple route protection.
- Add logout action.
- Add dashboard data loading by authenticated user.

Integration:

- Supabase Auth.
- Supabase SSR cookies.

Code areas:

- `src/lib/supabase/client.ts`
- `src/lib/supabase/server.ts`
- `src/lib/supabase/admin.ts`
- `src/lib/env.ts`
- `src/app/login/page.tsx`
- `src/app/auth/callback/route.ts`
- `middleware.ts`

## Milestone 2: Six-Step Onboarding Flow

### Onboarding UI

Implemented:

- Built six-step onboarding scaffold.
- Added top progress bar.
- Added six-step stepper with done, active, and upcoming states.
- Step 5 payment marker shows `R` and amber styling.
- Added basic required-field validation.
- Added Back/Continue behavior.
- Added live preview panel.
- Added blurred preview on payment step.
- Added the six required colour presets:
  - Navy `#1e3a5f`
  - Red `#C0392B`
  - Green `#1A7A4A`
  - Amber `#BA7517`
  - Purple `#534AB7`
  - Teal `#0F6E56`
- Added scaffold fields for:
  - basics
  - services
  - service prices
  - certifications
  - trust toggles
  - city/suburbs
  - business address
  - three structured testimonials
  - branding colour
  - logo upload
  - hero photo upload
  - owner photo upload
  - contact details
  - Facebook URL
  - Instagram URL
  - Facebook Pixel ID
  - structured operating hours
  - subdomain
  - custom domain
  - terms checkbox
- Added local browser resume using `localStorage`.
- Added subdomain availability check UI using `/api/subdomains/check`.
- Added custom-domain DNS instruction placeholder after a custom domain is entered.

Remaining:

- Load saved onboarding state from Supabase on page load when a real authenticated client exists.
- Resume at the saved step from Supabase `onboarding_progress`, not only local browser storage.
- Improve validation with field-level messages.
- Test Step 5 Peach Checkout with real sandbox credentials.
- Redirect to dashboard after publish.

Integration:

- Supabase persistence is partly wired.
- Supabase Storage upload endpoint is implemented and will upload to buckets when service credentials exist.
- Local upload mode returns a placeholder URL so UI development can continue without Supabase credentials.

Code areas:

- `src/app/onboarding/page.tsx`
- `src/app/api/uploads/route.ts`
- `src/lib/constants.ts`
- `src/lib/types.ts`
- `src/lib/utils.ts`

### Onboarding Persistence

Implemented:

- Added `/api/onboarding/save`.
- On Continue, onboarding posts form data to the save endpoint.
- Save endpoint validates payload with `zod`.
- If Supabase service credentials exist:
  - inserts or updates `clients`
  - upserts `onboarding_progress`
  - stores selected services, prices, certifications, suburbs, toggles, contact data, brand colour, subdomain, custom domain, address, testimonials, hours, social URLs, Pixel ID, guarantee period, and uploaded asset URLs
- If Supabase is not configured:
  - returns local-mode success so UI development can continue.
- UI shows save status:
  - idle
  - saving
  - saved
  - error
  - published

Remaining:

- Fetch existing client and progress from Supabase on onboarding load.
- Decide how anonymous onboarding should become authenticated client ownership.
- Add optimistic retry/error handling.

Integration:

- Supabase service-role server writes.
- Supabase Auth user association when available.

Code areas:

- `src/app/api/onboarding/save/route.ts`
- `src/app/onboarding/page.tsx`

## Milestone 3: Peach Payments Billing

Implemented:

- Added Peach helper for checkout URL selection.
- Added Peach HMAC SHA256 signature builder.
- Added Peach body-signature and optional webhook-header signature verification helpers.
- Added Peach nonce and merchant-transaction-id helpers.
- Added `/api/peach/checkout`.
- Checkout route creates signed Peach Hosted Checkout fields server-side.
- Checkout route supports initial recurring-card tokenisation fields:
  - `createRegistration`
  - `standingInstruction.type`
  - `standingInstruction.mode`
  - `standingInstruction.recurringType`
  - `standingInstruction.frequency`
- Checkout route records a pending `billing_events` row when Supabase is configured.
- Added `/api/peach/webhook` route.
- Webhook route verifies Peach signatures.
- Webhook route inserts `billing_events` when Supabase is configured.
- Webhook route updates `clients.subscription_status` to:
  - `active` on complete
  - `past_due` on failed
- Webhook route stores Peach `registrationId` when present.
- Webhook route stores failed-payment timing and grace-period end timing.
- Added `/api/peach/result` to handle Peach shopper-result POST redirects.
- Added `/peach/return`.
- Added `/peach/cancel`.
- Added `/peach/failed`.
- Added `/api/billing/cancel` scaffold.
- Dashboard billing page now shows subscription status, failed-payment notice, and calls `/api/billing/cancel`.
- Added `payment_failed_at` and `subscription_ends_at` fields to the `clients` schema.
- Added `peach_registration_id` to the `clients` schema.
- Added Peach environment variables to `.env.example`.
- Payment step now calls the server checkout route. If Peach credentials are not configured, local mode treats payment as successful so development can continue.

Remaining:

- Test Peach sandbox end-to-end with real sandbox entity ID and secret token.
- Confirm card tokenisation/recurring payment setup with the active Peach account configuration.
- Implement server-side recurring charges using Peach registration IDs.
- Add status-query reconciliation using Peach Checkout status APIs.
- Implement retry handling.
- Connect remote Peach token/subscription cancellation or disablement flow from the dashboard cancellation action.
- Implement remote Peach token/subscription cancellation or disablement flow, not only local Supabase status update.
- Implement manual refund tracking in admin.

Integration:

- Peach sandbox first.
- Peach live credentials only after sandbox verification.
- Supabase stores subscription and billing event state.
- Peach Hosted Checkout requires signed browser POSTs with `authentication.entityId`, `nonce`, and `merchantTransactionId`.
- Peach recurring payments rely on card tokenisation/registration IDs for follow-up charges.

Code areas:

- `src/lib/peach.ts`
- `src/lib/billing.ts`
- `src/app/api/peach/checkout/route.ts`
- `src/app/api/peach/webhook/route.ts`
- `src/app/api/peach/result/route.ts`
- `src/app/api/billing/cancel/route.ts`
- `src/app/onboarding/page.tsx`
- `src/app/peach/return/page.tsx`
- `src/app/peach/cancel/page.tsx`
- `src/app/peach/failed/page.tsx`
- `supabase/migrations/0001_initial_schema.sql`
- `.env.example`

## Milestone 4: Publish Flow and Subdomains

Implemented:

- Added `/api/subdomains/check`.
- Added shared domain helpers for platform domain, reserved subdomains, URL generation, validation, and DNS instructions.
- Reserved core platform subdomains:
  - `www`
  - `admin`
  - `app`
  - `api`
  - `dashboard`
  - `support`
  - `billing`
- When Supabase is configured, subdomain check queries `clients`.
- Subdomain check now rejects invalid or reserved subdomains through shared validation.
- Added `/api/publish`.
- Publish route validates:
  - client ID
  - subdomain
  - optional custom domain
  - accepted terms
- When Supabase is configured, publish route:
  - checks duplicate subdomain
  - updates `subdomain`
  - updates `custom_domain`
  - sets `site_published`
  - sets `published_at`
- Publish route logs a `site_published` billing event.
- Publish route returns:
  - `siteUrl`
  - `dashboardUrl`
  - custom-domain DNS instructions when relevant
  - Vercel registration result/skipped reason
  - publish-confirmation email queue result
- Onboarding Publish button calls `/api/publish`.
- Onboarding clears local draft state and redirects to `/dashboard` after successful publish.
- Dashboard shows the latest publish result from local browser storage.
- Added `/api/publish/republish`.
- Dashboard overview and edit pages now expose manual re-publish actions.
- Published site route now shows a temporary-unavailable page for expired suspended sites.
- Added Vercel domain registration helper.
- Added publish-confirmation email queue helper.

Remaining:

- Replace publish-confirmation queue placeholder with real Resend/SendGrid delivery.
- Connect Vercel domain registration with real credentials and verify custom-domain status.
- Add manual re-publish buttons in admin using `/api/publish/republish`.
- Add dashboard UI for custom-domain DNS instructions beyond the one-time post-publish notice.
- Add email/send failure handling.
- Add tests for domain validation and publish route behavior.

Integration:

- Supabase for publish state.
- Vercel Domains API scaffold is present, pending credentials and production testing.
- Email provider queue scaffold is present, pending real Resend/SendGrid delivery.

Code areas:

- `src/lib/domains.ts`
- `src/lib/vercel.ts`
- `src/lib/email/publish-confirmation.ts`
- `src/app/api/subdomains/check/route.ts`
- `src/app/api/publish/route.ts`
- `src/app/api/publish/republish/route.ts`
- `src/app/onboarding/page.tsx`
- `src/components/dashboard/publish-result-notice.tsx`
- `src/app/dashboard/page.tsx`
- `src/app/sites/[subdomain]/page.tsx`

## Milestone 5: HVAC Published Site Engine

Implemented:

- Added reusable HVAC published-site renderer.
- Added dynamic route `/sites/[subdomain]`.
- Added real Supabase lookup by `subdomain` when configured.
- Added local sample fallback when Supabase is not configured.
- Added database-row-to-site mapper.
- Added generated privacy page route.
- Implemented major HVAC template sections:
  - navigation
  - hero
  - response-time badge
  - emergency banner
  - trust bar
  - services
  - service cards with prices
  - pricing guide
  - suburb tag cloud
  - testimonials
  - about section
  - conditional gallery section
  - contact section
  - footer
  - floating WhatsApp button
- Added six-colour theme mapping from `brand_colour`.
- Added dynamic SEO metadata from site data.
- Added canonical and Open Graph metadata.
- Added GA4 script injection when `ga_measurement_id` exists.
- Added Facebook Pixel injection when `pixel_id` exists.
- Added LocalBusiness/HomeAndConstructionBusiness JSON-LD.
- Added embedded Google Map from address.
- Added operating hours display.
- Added social links in footer/contact.
- Added logo rendering.
- Added hero/owner photo rendering.
- Converted gallery rendering from raw `<img>` to `next/image`.
- Added working published-site contact form submission through `/api/enquiries`.
- Added `site_enquiries` table for captured quote requests.

Remaining:

- Make privacy policy more complete and POPIA-specific.
- Replace local sample fallback with clear seed/demo behavior for production.

Integration:

- Supabase Postgres published site data.
- GA4 pending.
- Facebook Pixel pending.
- Google Maps embed pending.

Code areas:

- `src/components/published/hvac-site.tsx`
- `src/app/sites/[subdomain]/page.tsx`
- `src/app/sites/[subdomain]/privacy/page.tsx`
- `src/lib/client-site-mapper.ts`
- `src/lib/sample-data.ts`

## Milestone 6: Client Dashboard

Implemented:

- Added dashboard layout and sidebar navigation.
- Added dashboard shell pages:
  - Dashboard
  - Traffic
  - Edit website
  - Photos
  - Google reviews
  - Facebook
  - Billing
  - Settings
  - Support
- Dashboard home includes:
  - welcome panel
  - four stat cards
  - setup checklist
  - sample weekly visitor chart
- Added authenticated Supabase dashboard client loader with local sample fallback.
- Added dynamic dashboard rendering for per-request auth data.
- Added edit website form backed by `/api/dashboard/client`.
- Added dashboard re-publish action.
- Added photo upload and delete flow backed by `gallery_photos`.
- Added billing status panel, failed-payment banner, and Peach cancellation action.
- Added Facebook Pixel, GA4 Measurement ID, and Google Place ID settings.

Remaining:

- Add GA4 traffic data fetch and chart rendering.
- Expand settings/account update behavior beyond tracking and review IDs.
- Add support contact flow.

Integration:

- Supabase Auth and Postgres.
- Supabase Storage for photos.
- Peach Payments for billing.
- GA4 Data API for traffic.

Code areas:

- `src/app/dashboard/layout.tsx`
- `src/app/dashboard/page.tsx`
- `src/app/dashboard/traffic/page.tsx`
- `src/app/dashboard/edit/page.tsx`
- `src/app/dashboard/photos/page.tsx`
- `src/app/dashboard/reviews/page.tsx`
- `src/app/dashboard/facebook/page.tsx`
- `src/app/dashboard/billing/page.tsx`
- `src/app/dashboard/settings/page.tsx`
- `src/app/dashboard/support/page.tsx`

## Milestone 7: Admin Panel

Implemented:

- Added `/admin` route.
- Replaced the basic client-list shell with a full sleek admin dashboard inspired by the Nexus-style reference:
  - sidebar navigation
  - search/topbar controls
  - KPI cards
  - revenue overview chart
  - client pipeline chart
  - subscription distribution
  - recent platform events
  - client command center
- Added real Supabase admin dashboard data loading with local sample fallback.
- Added `admin_users` authorization check on the admin page when Supabase is configured.
- Added middleware protection when Supabase is configured.
- Added `/api/admin/client-action` for admin-only operational actions:
  - manual re-publish
  - pause subscription
  - cancel subscription
  - reactivate/suspension override
  - manual refund tracking through `billing_events`
- Added responsive mobile client cards for the admin command center.
- Verification after the pass:
  - `npm run typecheck` passed
  - `npm run build` passed with the existing onboarding image optimization warning only
  - Playwright smoke-tested `/admin` on desktop and mobile with no failed page assets

Remaining:

- Wire admin sidebar sub-pages if needed.
- Replace chart placeholders with real time-series analytics once billing/traffic history grows.
- Connect remote Peach token/subscription disablement from admin cancellation flows.

Integration:

- Supabase Auth.
- Supabase `admin_users`.
- Supabase `clients`.
- Peach cancellation/refund-adjacent workflows.

Code areas:

- `src/app/admin/page.tsx`
- `middleware.ts`
- `supabase/migrations/0001_initial_schema.sql`

## Milestone 8: Emails

Implemented:

- Added `email_events` table in the Supabase migration.
- Added email provider environment placeholders in `.env.example`.

Remaining:

- Choose Resend or SendGrid.
- Add email provider helper.
- Add HTML email templates:
  - publish confirmation
  - welcome/dashboard login
  - monthly receipt
  - payment failed
  - cancellation confirmation
- Trigger publish confirmation after `/api/publish`.
- Trigger payment emails from Peach webhook handling.
- Store provider message IDs and delivery status in `email_events`.

Integration:

- Resend or SendGrid.
- Supabase `email_events`.
- Peach event lifecycle.

Code areas:

- `.env.example`
- `supabase/migrations/0001_initial_schema.sql`
- future `src/lib/email/*`
- future API integration points in publish and billing routes

## Milestone 9: Analytics and Tracking

Implemented:

- Added fields to database schema for:
  - `ga_measurement_id`
  - `pixel_id`
- Added dashboard traffic placeholder.
- Added Facebook dashboard placeholder.

Remaining:

- Inject GA4 script into published sites.
- Inject Facebook Pixel script when `pixel_id` exists.
- Add GA4 Data API credentials and server helper.
- Render dashboard charts from GA4 data.
- Add traffic source breakdown.
- Keep Meta Graph API out of scope for MVP.

Integration:

- GA4 Measurement ID per site.
- GA4 Data API for dashboard.
- Facebook Pixel only, not Meta Graph API.

Code areas:

- `src/components/published/hvac-site.tsx`
- `src/app/dashboard/traffic/page.tsx`
- `src/app/dashboard/facebook/page.tsx`
- `.env.example`

## Milestone 10: Production Readiness

Implemented:

- `npm run typecheck` passes.
- `npm run lint` passes with one warning.
- `npm run build` passes.
- Local dev server has been verified at `http://localhost:3000`.

Current known warning:

- `src/app/onboarding/page.tsx` uses a raw `<img>` for upload previews. This can become `next/image` or a lint exemption once the preview strategy is finalized.

Remaining:

- Add proper loading and error states.
- Add automated smoke tests.
- Add form/unit tests for mapping, validation, Peach signing, and publish logic.
- Add end-to-end onboarding test.
- Add Vercel deployment.
- Add production environment documentation.
- Add dependency audit review.

Verification commands:

```bash
npm install
npm run lint
npm run typecheck
npm run build
```

Manual verification targets:

- `/`
- `/login`
- `/onboarding`
- `/dashboard`
- `/admin`
- `/sites/cape-climate-pros`
- `/sites/cape-climate-pros/privacy`

## Recommended Next Code Slices

1. Supabase Storage uploads:
   - create buckets
   - add upload API/client helpers
   - wire logo, hero photo, owner photo, and dashboard gallery uploads

2. Saved onboarding resume:
   - fetch client row and `onboarding_progress`
   - hydrate the form
   - resume at saved step

3. Peach Checkout:
   - server-side payment payload
   - sandbox redirect
   - success/failure/cancel routes
   - recurring token storage

4. Dashboard edit/photos:
   - authenticated client data loading
   - edit website form
   - gallery manager
   - re-publish action

5. Published-site tracking and schema:
   - improved SEO metadata
   - contact form submission
   - fuller POPIA privacy policy
