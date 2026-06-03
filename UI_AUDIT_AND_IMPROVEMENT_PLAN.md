# SiteRent WaaS — UI Audit & Improvement Plan

> Status: **P0 + P1 + P2 implemented; P3 quality gates started** (verified: `typecheck`, `lint`, `build`, and local smoke all green). See "Implementation progress" below.
>
> Scope reviewed: `src/app/**`, `src/components/**`, `src/lib/**`, `middleware.ts`, `supabase/migrations/**`, build config. Baseline health: `npm run typecheck` passes clean; `npm run lint` reports only `<img>` warnings.

---

## 1. Executive summary

The codebase is **healthy and already quite polished**. TypeScript is strict and passes, the published-site SEO/JSON-LD/tracking layer is well built, the Peach webhook verifies signatures, and admin mutations are gated by `admin_users`. This is a refinement job, not a rescue.

The work splits into four themes:

1. **Design-system consistency** — two visual languages coexist (a slate/blue "app" theme for login/onboarding/dashboard, and a paper/ink theme for admin). Many hex colors are hard-coded inline instead of tokenized.
2. **Production hardening** — missing `error`/`loading`/`not-found` boundaries, no `robots`/`sitemap`/`icon`/`manifest`, font declared but never loaded, `<img>` instead of `next/image`.
3. **Security & abuse edge cases** — the uploads and public-enquiry endpoints are unauthenticated and unthrottled; webhook processing is not idempotent.
4. **Repo hygiene** — a full duplicate app (`sales-ops-dashboard/`), redirect-only stub routes, and empty folders add noise.

A phased plan (P0–P3) is at the end with effort estimates.

---

## 2. UI audit by surface

### 2.1 `/login` (`src/app/login/page.tsx`)
- **Strong**: split-screen layout, OAuth + magic link, demo entry points, clear status messages.
- **Polish**
  - Submit button does not disable while `status === "sending"` → double-submit possible. Add `disabled` + spinner.
  - OAuth buttons use literal letters (`G`, `O`) instead of brand marks — looks unfinished; use proper SVG logos.
  - Status messages are not announced to assistive tech. Wrap in `role="status"` / `aria-live="polite"`.
  - The right-hand decorative panel (`bottom-20 right-[-60px] w-[560px]`) can overflow horizontally at some widths; verify clipping.
  - Hard-coded hexes (`#d9dee5`, `#f4f6f8`, `#111827`) duplicated across inputs/buttons → move to tokens.

### 2.2 `/onboarding` (`src/app/onboarding/page.tsx`, ~1,090 lines)
- **Strong**: 6-step wizard, localStorage resume, debounced subdomain availability check, demo seed, live preview.
- **Bugs / UX**
  - **Error banner placement**: the validation banner is rendered as a grid child with `lg:col-span-3` *between* the sidebar `<aside>` and the main `<section>`. On the 3-column grid this injects a full-width row mid-layout and shifts content. It is also not scrolled into view and not linked to the offending fields.
  - **Errors not associated with inputs**: failing fields get no `aria-invalid` / `aria-describedby`; the summary lists field names only. Per accessible-validation guidance, errors should be programmatically tied to inputs and focus moved to the summary. [4][5]
  - **No format guidance** on phone/price fields; auto-format/normalize rather than reject is recommended for multi-step forms. [6][7]
  - **Step 4 "Pay"**: payment button doesn't disable during `starting`; possible double-tap → double checkout.
  - **`<img>` preview** (line ~1023) triggers the lint warning; small but counts.
  - **Custom service key collision** uses `Date.now().slice(-4)` — low collision risk but not guaranteed unique.
  - Inputs use raw hex borders; tokenize for consistency with the design system.

### 2.3 `/dashboard` (`src/components/dashboard/waas-dashboard.tsx`, ~2,160 lines)
- **Strong**: rich section model (14 sections), sidebar groups, lots of states already handled.
- **Maintainability (highest structural risk)**
  - A single 2,160-line client component is hard to test, review, and code-split. It should be decomposed into per-section components under `src/components/dashboard/sections/` (folder already exists but is empty).
  - It is `"use client"` end-to-end; data-only sections could be server components to cut the client bundle.
- **Polish**
  - No `loading.tsx` for `/dashboard` while `getDashboardData()` runs (route is `force-dynamic`) → blank flash. Add skeletons. [3]
  - Verify empty/zero states (no website yet, no leads, no traffic) all render intentionally, not as "0/—".
  - Mobile: confirm the collapsible sidebar + wide tables degrade gracefully (horizontal scroll vs. card layout).

### 2.4 `/admin` (`src/app/admin/page.tsx` + `[section]`)
- **Strong**: proper `authorized` gate with a clear "access required" state; toolbar; client table.
- **Gaps**
  - **Different design language** (paper/ink/`#e1d8ca`/black-on-cream) vs. the rest of the app's slate/blue. Pick one system or formally define an "admin" theme.
  - `[section]` pages are **placeholder stubs** ("This section is wired as a real route…"). Either build them or hide the nav entries until built (dead-end navigation hurts trust).
  - Toolbar "Filter"/"Export" buttons appear non-functional — wire up or remove.
  - Backtick literal in copy: *"not listed in \`admin_users\`"* renders literal backticks to end users.

### 2.5 Published site (`src/app/sites/[subdomain]/**`, `hvac-site.tsx` ~46 KB)
- **Strong**: `generateMetadata`, canonical URLs, OpenGraph, JSON-LD (`HomeAndConstructionBusiness`), GA4 + Meta Pixel via `next/script`, suspended/not-found states. This is the best-built surface.
- **Polish**
  - Add `metadataBase` (root layout) so relative OG image URLs resolve.
  - Consider `opengraph-image` generation for richer social cards. [3]
  - Audit `hvac-site.tsx` for `<img>` vs `next/image` (LCP on hero).

### 2.6 Global shell (`src/app/layout.tsx`, `globals.css`, `tailwind.config.ts`)
- **Font never loads**: `globals.css` sets `font-family: "DM Sans", Inter, …` but nothing imports DM Sans (no `next/font`, `<link>`, or `@font-face`) → silent fallback to system UI font. Use `next/font` to actually load the intended typeface and avoid layout shift. [3]
- **No `viewport`/`themeColor`/`metadataBase`** exported; no favicon/`icon`, `manifest`, `robots`, or `sitemap`.
- **Token duplication**: `tailwind.config.ts` defines a shadcn-style token set *and* a separate palette (`ink/muted/line/paper/mint/peach`); components mostly bypass both with inline hex. Consolidate.

---

## 3. Functional gaps & stubs

| Area | Gap | Impact |
| --- | --- | --- |
| Admin sections | `src/app/admin/[section]/*` are placeholder copy only | Dead-end navigation |
| Admin toolbar | Filter / Export not wired | Non-functional controls |
| Dashboard sections | Confirm Traffic (GA4), Reviews (Place ID), Domain (DNS) are live vs. mocked | Possibly mock data shown as real |
| Email | `email_events` table exists; confirm transactional sends (Resend/SendGrid) are actually wired | Users may not get publish/billing emails |
| `payfast/` | Empty `src/app/payfast/` and `src/app/api/payfast/` dirs | Leftover from provider switch |
| Billing recovery | Past-due grace handling exists in webhook; confirm dunning emails + retry UX | Silent churn |

> Action: verify each "live data" section against `src/lib/*-data.ts` to confirm none render sample data as production data.

---

## 4. Security & data-integrity edge cases (researched)

Supabase guidance: tables exposed via the Data API **must** have RLS enabled, and the `service_role` key bypasses RLS entirely, so any route using it must do its own authorization. [2] Next.js guidance: authorize every mutation and never trust client input. [1]

| # | Finding | Location | Recommendation |
| --- | --- | --- | --- |
| S1 | **Unauthenticated upload** — no user check, no ownership check on `clientId`, MIME trusts `file.type`, no rate limit. A caller can write into any `clientId/` path. | `src/app/api/uploads/route.ts` | Require authenticated session; verify the `clientId` belongs to `auth.uid()`; validate magic-bytes/extension allowlist; add per-user rate limiting. |
| S2 | **Open public enquiry insert** — `with check (true)` + no captcha/honeypot/rate limit; `clientId` not validated against a real published client. | `api/enquiries/route.ts`, migration policy | Add honeypot + rate limit (IP/edge), validate `clientId` exists & is published, consider hCaptcha/Turnstile. [3] |
| S3 | **Webhook not idempotent** — duplicate Peach deliveries re-insert `billing_events` and re-apply status updates. Providers retry; duplicates are expected. [P1 sources] | `api/peach/webhook/route.ts` | Dedupe on `provider_payment_id` (unique index + upsert/`on conflict do nothing`); process in a transaction; log+ack unknown events. |
| S4 | **Storage RLS is broad** — any authenticated user may write to image buckets (no path-prefix ownership). | migration `storage.objects` policy | Restrict insert to `auth.uid()::text = (storage.foldername(name))[1]` style ownership. |
| S5 | **No Content-Security-Policy / security headers.** | `next.config.mjs` / middleware | Add CSP (allow GA/Meta/Supabase), `X-Content-Type-Options`, `Referrer-Policy`, HSTS. [1] |
| S6 | **`images.remotePatterns: hostname "**"`** allows optimizing images from any host (SSRF-ish abuse of the optimizer). | `next.config.mjs` | Restrict to Supabase storage + known CDNs. |
| S7 | Confirm `SUPABASE_SERVICE_ROLE_KEY` is server-only (it is, no `NEXT_PUBLIC_`) and never imported into client bundles. | `src/lib/supabase/admin.ts` | Keep; add a lint guard / `server-only` import. |

---

## 5. Best-practice gaps (Next.js production checklist) [3]

- [x] **Error handling**: added `error.tsx` + `global-error.tsx`.
- [x] **Loading UI**: added `loading.tsx` skeletons for `/dashboard` and `/admin`.
- [x] **not-found**: added root `not-found.tsx`.
- [x] **Metadata & SEO**: `metadataBase`, `robots.ts`, `sitemap.ts`, `icon.svg`, `manifest.ts` added; published sites use absolute titles.
- [x] **Fonts**: DM Sans now loaded via `next/font` and wired into `globals.css`.
- [x] **Images**: `<img>` → `next/image` (onboarding preview, photos-manager). Meta Pixel 1×1 beacon intentionally left as `<img>`.
- [x] **Accessibility**: enabled `eslint-plugin-jsx-a11y`; added `aria-live` status (login, contact form) and `role="alert"` + focus on onboarding errors. _Remaining: `aria-invalid`/`aria-describedby` per field, contrast audit, icon-only button labels._
- [ ] **Streaming/parallel data**: where a section awaits multiple sources, fetch in parallel. _(P3)_

---

## Implementation progress

**P0 (done):** uploads auth/ownership/MIME, webhook idempotency (+ migration `0002`), enquiry honeypot/rate-limit/validation, in-flight button disabling (login/onboarding/publish/contact), onboarding error-summary a11y, admin copy fix.

**P1 (done):** `next/font` DM Sans; `metadataBase`/viewport/icon/manifest/robots/sitemap; `error`/`global-error`/`not-found`/`loading`; `<img>`→`next/image`; narrowed `images.remotePatterns`; security headers + CSP (dev allows `unsafe-eval`); `eslint-plugin-jsx-a11y` enabled.

**P2 (done):** semantic design tokens for the app (slate/blue) and a formally-separated admin (paper/ink) theme in `globals.css` + `tailwind.config.ts`; shared `Button` + `Input`/`Field` primitives in `src/components/ui`; real Google/Microsoft OAuth brand logos; login refactored onto primitives; repeated inline neutral hexes tokenized across login, onboarding, and all admin surfaces. _Remaining (P3): adopt primitives in the 2,160-line dashboard during its decomposition; `hvac-site.tsx` keeps intentional per-template white-label colors._

**P3 (started):** added runtime integration readiness classification in `src/lib/integration-readiness.ts`, surfaced it on `/admin` and `/admin/integrations`, added `npm run verify`, `npm run smoke`, a local route smoke script, and GitHub Actions CI for install/typecheck/lint/build. _Remaining: dashboard decomposition, real email/dunning delivery, provider sandbox tests, unit/E2E tests beyond the smoke gate, and repo cleanup._

**Action required (ops):** apply migration `supabase/migrations/0002_p0_hardening.sql`; the rate limiter is per-instance (move to durable store for serverless).

---

## 6. Repo hygiene / dead code

- `sales-ops-dashboard/` — a **complete second Next.js app** (own `package.json`, `pnpm-lock.yaml` ~133 KB, 73 components). It was the source for the admin UI and is now reference-only. **Remove from the app repo** (archive elsewhere) or relocate to `/reference` and add to `.gitignore`/`.vercelignore` so it never deploys.
- `src/app/admin/full/page.tsx` — redirect-only stub → delete (and the `full/` dir).
- Empty dirs: `src/components/dashboard/sections/`, `src/components/dashboard/charts/` → fill (during dashboard decomposition) or remove.
- Empty dirs: `src/app/payfast/`, `src/app/api/payfast/` → remove.
- Dashboard sub-route redirect shims (`dashboard/billing`, `edit`, `photos`, …) all `redirect()` to `?section=` — fine to keep for shareable URLs, but document the pattern.
- `remaining.md` is stale (refers to "restore admin page" work already done) → fold into this doc or delete.

---

## 7. Prioritized implementation plan

### P0 — Correctness, security, trust (do first)
1. Onboarding error-banner placement + field-level `aria-invalid`/focus + scroll-into-view.
2. Disable submit/pay/publish buttons while in-flight (login, onboarding ×2, publish).
3. Uploads endpoint: auth + ownership + MIME allowlist + size (S1); tighten storage RLS (S4).
4. Webhook idempotency: unique index on `provider_payment_id` + upsert (S3).
5. Enquiry endpoint: validate `clientId`, add honeypot + rate limit (S2).
6. Remove backtick literal in admin copy; fix any mock-as-real data.

### P1 — Production polish (high visibility, low risk)
7. `next/font` for DM Sans; `metadataBase`, favicon/`icon`, `robots.ts`, `sitemap.ts`, `manifest`.
8. `error.tsx` + `global-error.tsx` + `not-found.tsx` + `loading.tsx` skeletons.
9. Replace `<img>` with `next/image`; narrow `images.remotePatterns`.
10. Security headers / CSP in `next.config.mjs` (S5).
11. Enable `eslint-plugin-jsx-a11y`; fix surfaced a11y issues.

### P2 — Design-system consistency _(done)_
12. [x] Consolidated tokens in `globals.css` + `tailwind.config.ts`; replaced repeated inline neutral hexes with semantic tokens (app + admin + brand).
13. [x] Admin theme formally separated as a documented `admin-*` token set and applied across all admin files.
14. [x] Real OAuth brand logos; shared `Button` + `Input`/`Field` primitives in `src/components/ui`, adopted in login.

### P3 — Structure, features, quality gates
15. Decompose `waas-dashboard.tsx` into per-section components; move pure-display sections to server components.
16. Build or hide admin `[section]` stubs; wire Filter/Export.
17. Confirm/finish email (Resend/SendGrid) + dunning flow.
18. Tests: unit (data mappers, `cn`, `formatCurrencyZar`, billing date helpers) + 1 Playwright smoke per surface; CI now runs `typecheck`, `lint`, and `build`, with `npm run smoke` available for a running preview.
19. Remove `sales-ops-dashboard/` and dead dirs; refresh `README`/docs.

**Rough effort**: P0 ≈ 1 day · P1 ≈ 1 day · P2 ≈ 1–2 days · P3 ≈ 3–5 days.

---

## 8. Suggested verification per phase
- `npm run typecheck && npm run lint && npm run build` green after each phase.
- Manual a11y pass with keyboard + axe DevTools on `/login`, `/onboarding`, `/dashboard`, `/admin`, a published site.
- Webhook idempotency test: replay the same Peach payload twice → exactly one `billing_events` row, one status transition.
- Upload abuse test: attempt upload while logged out and for a foreign `clientId` → rejected.

---

## 9. References
1. Next.js — Security & Server Actions practices: https://nextjs.org/blog/security-nextjs-server-components-actions
2. Supabase — Securing your API (RLS, service_role bypass): https://supabase.com/docs/guides/api/securing-your-api
3. Next.js 14 — Production Checklist (metadata, fonts, images, streaming, a11y): https://nextjs.org/docs/14/app/building-your-application/deploying/production-checklist
4. UXPin — Accessible Form Validation Best Practices: https://www.uxpin.com/studio/blog/accessible-form-validation-best-practices/
5. Reform — Accessible Form Validation Best Practices: https://www.reform.app/blog/accessible-form-validation-best-practices
6. Reform — 10 Best Practices for Multi-Step Form Navigation: https://www.reform.app/blog/10-best-practices-for-multi-step-form-navigation
7. FormAssembly — Multi-Step Form Best Practices: https://www.formassembly.com/blog/multi-step-form-best-practices/
8. Hookdeck — How to Implement Webhook Idempotency: https://hookdeck.com/webhooks/guides/implement-webhook-idempotency
9. apidog — Payment Webhook Best Practices: https://apidog.com/blog/payment-webhook-best-practices/
