# SiteRent WAAS – Complete Deployment & Operations Guide

This is the master guide for taking SiteRent from local development to a live, revenue-generating website rental platform. It covers domain registration, database setup, authentication, payments, AI, email, analytics, deployment, and user onboarding.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites & Prerequisites Check](#prerequisites--prerequisites-check)
3. [Phase 1: Core Infrastructure Setup (Database, Auth, AI)](#phase-1-core-infrastructure-setup)
4. [Phase 2: Domain & DNS Setup](#phase-2-domain--dns-setup)
5. [Phase 3: Payment Processing Setup](#phase-3-payment-processing-setup)
6. [Phase 4: Email System Setup](#phase-4-email-system-setup)
7. [Phase 5: Analytics & Tracking Setup](#phase-5-analytics--tracking-setup)
8. [Phase 6: Deployment (Vercel)](#phase-6-deployment-vercel)
9. [Phase 7: User Onboarding & Launch](#phase-7-user-onboarding--launch)
10. [Appendix: Environment Variables Reference](#appendix-environment-variables-reference)
11. [Appendix: Troubleshooting](#appendix-troubleshooting)

---

## Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                   Users (HVAC Businesses)                   │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTPS
                     ▼
        ┌─────────────────────────────────┐
        │  SiteRent WAAS (Next.js App)    │
        │  Hosted on Vercel @ domain.com  │
        └────────┬──────────────┬─────────┘
                 │              │
        ┌────────▼────┐   ┌────▼──────────┐
        │  Supabase   │   │  Vercel       │
        │  (Auth,     │   │  (Hosting,    │
        │   Database, │   │   Domains)    │
        │   Storage)  │   └────┬──────────┘
        └────────┬────┘        │
                 │             │
        ┌────────▼─────────────▼──┐
        │   Published Client Sites │
        │   @ subdomain.domain.com │
        │   (Static/Generated)     │
        └──────────────────────────┘
                 │
        ┌────────▼────────────────┐
        │  Third-Party Services   │
        ├────────────────────────┤
        │ • Peach Payments (Sub)  │
        │ • Gemini AI (Planning)  │
        │ • Resend/SendGrid (Email)│
        │ • GA4 (Analytics)       │
        └─────────────────────────┘
```

### Data Flow

1. **User Registration**: Email → Supabase Auth (magic link) → Client record created
2. **Website Planning**: User input → Gemini AI generates website content → Stored in Supabase
3. **Publishing**: Client data → Next.js generates HTML → Deployed to Vercel subdomain
4. **Billing**: Monthly recurring charger → Peach Payments webhook → `billing_events` table
5. **Enquiries**: Published site contact form → PostgREST API → Email notification → Client dashboard

---

## Phase 1: Core Infrastructure Setup

### 1.1 Supabase Database & Authentication

**Why**: Supabase provides PostgreSQL database, Auth (email magic links), Row-Level Security, and file storage.

#### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign in or create account
3. Click "New project"
   - **Name**: `siterent-waas`
   - **Password**: Generate strong password (save in password manager)
   - **Region**: Closest to your main market (e.g., `eu-west-1` for Europe, `af-south-1` for South Africa)
4. Wait ~5 minutes for project to initialize
5. Note down:
   - **SUPABASE_URL**: From project settings → API
   - **SUPABASE_ANON_KEY**: From project settings → API
   - **SUPABASE_SERVICE_ROLE_KEY**: From project settings → API

#### Step 2: Initialize Database Schema

1. In Supabase console, go to **SQL Editor**
2. Copy content from `supabase/migrations/0001_initial_schema.sql`
3. Create new query and paste entire schema
4. Click "Run" and verify no errors

The schema creates these core tables:

- **`auth.users`**: Supabase built-in (email, password reset)
- **`public.clients`**: Primary client record (business info, branding, template choice)
- **`public.onboarding_progress`**: Tracks step completion for each client
- **`public.gallery_photos`**: Client website gallery images
- **`public.site_enquiries`**: Contact submissions from published sites
- **`public.billing_events`**: Payment receipts/failures from Peach
- **`public.email_events`**: Transactional email delivery logs
- **`public.admin_users`**: Admin/support staff accounts
- **`public.google_place_ids`**: Google Business Profile links

#### Step 3: Enable Auth Providers

1. In Supabase console, go to **Authentication** → **Providers**
2. Keep **Email** enabled (default)
   - Magic link delivery is automatic via Supabase
3. Disable **Phone** (not needed for MVP)
4. Optional: Enable **Google OAuth** later for better UX

#### Step 4: Configure Email Auth (Magic Links)

1. Go to **Authentication** → **Email Templates**
2. Verify **Confirm signup** and **Confirm email change** templates exist
3. These templates are auto-sent when users enter their email

#### Step 5: Row-Level Security (RLS) Configuration

The schema includes RLS policies that:

- **clients table**: Users see only their own record (via `auth.uid()`)
- **onboarding_progress table**: Users see only their progress
- **gallery_photos table**: Users manage only their own gallery
- **site_enquiries table**: Inserted via API (public, unauthed)
- **billing_events table**: Inserted via webhook (service role only)

Verify policies are active:

1. Go to **Table Editor** → **clients** → **RLS** tab
2. Should show "RLS is enabled with 2 policies"

---

### 1.2 Gemini AI Setup

**Why**: Generates website content, business descriptions, and planning during onboarding.

#### Step 1: Get Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com)
2. Sign in with Google account
3. Click "Get API Key" → "Create new secret key"
4. Copy the key (note: visible only once)
5. Store securely in `.env.local`:
   ```
   GEMINI_API_KEY=your_key_here
   GEMINI_MODEL=gemini-2.0-flash
   ```

#### Step 2: Verify Gemini Integration in Code

Check `src/app/api/ai/plan.ts` — this endpoint calls Gemini to generate website blueprint based on onboarding input.

Example request:
```bash
POST /api/ai/plan
Content-Type: application/json

{
  "businessName": "Example HVAC",
  "businessDescription": "Full service HVAC...",
  "templateStyle": "aireco-dark"
}
```

Response: JSON with `sitePlan` containing generated content.

#### Step 3: Set Usage Quotas (Optional)

In [Google Console](https://console.cloud.google.com), set quota limits to avoid unexpected charges.

---

### 1.3 Verify Local Environment

Once Supabase and Gemini keys are set:

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in Supabase and Gemini values:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
   GEMINI_API_KEY=AIza...
   GEMINI_MODEL=gemini-2.0-flash
   ```

3. Test locally:
   ```bash
   npm run dev
   npm run typecheck
   npm run build
   ```

4. Manual test:
   - Open `http://localhost:3000` → redirects to `/login`
   - Enter email → should see "Sign in link sent" message
   - Check email (Supabase or local test inbox) for magic link
   - Click link → should redirect to dashboard
   - Try onboarding flow to verify Gemini calls work

---

## Phase 2: Domain & DNS Setup

### 2.1 Register Primary Domain

**Why**: `.co.za` domain establishes geographic presence and brand credibility. Current config: `siterent.co.za`

#### Step 1: Register Domain

Choose a registrar (e.g., Namecheap, GoDaddy, local SA registrar):

1. Search `siterent.co.za` (or your chosen domain)
2. Purchase for 1–3 years
3. Note the registrar credentials for later DNS changes

#### Step 2: Point Domain to Vercel (Nameservers)

This step happens *after* deploying to Vercel (Phase 6), but prepare now:

Once deployed to Vercel:

1. In Vercel dashboard, go to your project → **Domains**
2. Add domain `siterent.co.za`
3. Vercel provides nameserver records (e.g., `ns1.vercel-dns.com`)
4. In your registrar control panel:
   - Replace nameservers with Vercel's
   - Or add Vercel's nameservers as secondary
5. Wait 24–48 hours for DNS propagation

Verify:
```bash
nslookup siterent.co.za
# Should resolve to Vercel IP
```

---

### 2.2 Subdomain Routing for Published Sites

**Why**: Each client's published site lives at `[clientname].siterent.co.za`

#### How It Works

In Next.js middleware (`middleware.ts`), incoming requests are routed:

- `siterent.co.za/login` → login page
- `siterent.co.za/dashboard` → client dashboard
- `[anything].siterent.co.za` → published client site

The middleware extracts the subdomain and queries the `clients` table via Supabase to find the matching site.

```typescript
// Pseudocode from middleware.ts
const subdomain = new URL(request.url).hostname.split('.')[0];
if (subdomain && subdomain !== 'www') {
  // Fetch client with matching subdomain
  const client = await supabase
    .from('clients')
    .select('*')
    .eq('subdomain', subdomain)
    .single();
  
  // Render published site
  return rewriteToPublishedSite(client);
}
```

#### Current Configuration in Code

Check `middleware.ts` for the exact subdomain routing logic. The current platform domain is set in `.env.example`:

```
NEXT_PUBLIC_PLATFORM_DOMAIN=siterent.co.za
```

---

## Phase 3: Payment Processing Setup

### 3.1 Peach Payments (Subscription Billing)

**Why**: Handles recurring monthly charges, card tokenization, and PCI compliance.

#### Step 1: Create Peach Account

1. Go to [peachpayments.com](https://peachpayments.com)
2. Sign up as merchant (South African entity required for best rates)
3. Complete KYC (business registration, banking, ID verification)
4. Wait for approval (~1–5 business days)

#### Step 2: Get API Credentials

In Peach merchant dashboard:

1. Go to **Settings** → **API** or **Integration**
2. Copy/note:
   - **Entity ID**: Merchant identifier (e.g., `8a829418...`)
   - **Secret Token**: API secret for backend calls
   - **Sandbox vs. Production**: Toggle between test and live modes

#### Step 3: Configure Environment Variables

In `.env.local`:

```
PEACH_ENTITY_ID=8a829418...
PEACH_SECRET_TOKEN=your_secret_token_here
PEACH_SANDBOX=true  # Set to false in production
```

#### Step 4: Webhook Configuration

By default, Peach sends webhooks to your app when payments succeed or fail.

In Peach dashboard → **Webhooks**:

1. Set webhook URL: `https://siterent.co.za/api/webhooks/peach`
   - (Use production URL after deploying; local dev won't receive)
2. Enable events: `PAYMENT.SUCCEEDED`, `PAYMENT.FAILED`, `RISK.SUCCEEDED`
3. Peach will POST to `/api/webhooks/peach` with payment details
4. App creates record in `billing_events` table

**Local testing**: Use Postman to manually POST to `http://localhost:3000/api/webhooks/peach` with sample payload.

#### Step 5: Integration in Onboarding

In the onboarding flow (Step 5 – Payment):

1. User enters card details inside Peach-hosted checkout (iframe or redirect)
2. Card is tokenized securely
3. Initial payment is charged
4. Subscription is configured for recurring billing (e.g., 1st of each month)
5. If successful, client is marked `published=true` and can go live

Check `src/app/onboarding/page.tsx`, Step 5 component for checkout integration.

---

### 3.2 Pricing Model

Define and document your pricing:

```
Example:
- Starter Site: R299/month
  - 5 gallery photos
  - Basic contact form
  - Google reviews widget
  
- Premium Site: R599/month
  - 20 gallery photos
  - Appointment booking
  - Service area map
  - Google reviews + testimonials
  
- Enterprise: Custom (contact sales)
```

Add pricing to `/` (marketing page) and make configurable in admin dashboard.

---

## Phase 4: Email System Setup

### 4.1 Choose Email Provider

Options:
- **Resend** (easiest for modern workflows, developer-friendly)
- **SendGrid** (more features, enterprise support)
- **Mailgun** (more control over sending, reputation)

**Recommendation for MVP**: Start with **Resend** due to simple API and good deliverability.

### 4.2 Resend Setup

#### Step 1: Create Account

1. Go to [resend.com](https://resend.com)
2. Sign up with email
3. Verify email address

#### Step 2: Get API Key

1. Go to **API Keys**
2. Create new key (default domain is `onboarding.resend.dev` for testing)
3. Copy key to `.env.local`:
   ```
   RESEND_API_KEY=re_abc123...
   ```

#### Step 3: Verify Domain (Production)

For production emails (not `onboarding.resend.dev`):

1. In Resend, go to **Domains**
2. Add your domain `siterent.co.za`
3. Add DNS records (CNAME, MX, DKIM) to your registrar
4. Wait for verification (~1 hour)

#### Step 4: Email Templates

Create transactional email templates in Resend or hardcode them in code.

**Key emails to send**:

1. **Magic Link (Supabase auto-sends)**
   - Handled by Supabase automatically

2. **Onboarding Confirmation**
   - Sent when user completes onboarding (Step 6)
   - Contains: Business name, site preview link, next steps

3. **Site Publication Confirmation**
   - Sent when site goes live
   - Contains: Live URL, edit dashboard link

4. **Contact Form Notification**
   - Sent to client when someone fills published site contact form
   - Contains: Enquiry details, client dashboard link

5. **Payment Notification**
   - Sent on successful payment: "Your site is now live"
   - Sent on failed payment: "Payment failed, click to retry"

6. **Monthly Invoice** (optional)
   - Sent on 1st of month with billing summary

Example sending code (already in codebase):

```typescript
// src/lib/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOnboardingConfirmation(email: string, businessName: string) {
  await resend.emails.send({
    from: 'noreply@siterent.co.za',
    to: email,
    subject: `Your ${businessName} website is ready!`,
    html: `<h1>Congratulations!</h1><p>Your website is live at https://[subdomain].siterent.co.za</p>`,
  });
}
```

---

### 4.3 SendGrid Setup (Alternative)

If using SendGrid instead:

1. Go to [sendgrid.com](https://sendgrid.com)
2. Create account and verify email
3. Generate API key (Settings → API Keys)
4. Add to `.env.local`:
   ```
   SENDGRID_API_KEY=SG.abc123...
   ```

Use SendGrid's Node.js SDK instead of Resend's.

---

## Phase 5: Analytics & Tracking Setup

### 5.1 Google Analytics 4 (GA4)

**Why**: Track visitor traffic, user behavior, and conversion funnels on published client sites.

#### Step 1: Create GA4 Property

1. Go to [analytics.google.com](https://analytics.google.com)
2. Click **Admin** → **Create property**
3. Set up Google Analytics → Web
4. Enter:
   - **Property name**: `SiteRent WAAS`
   - **Reporting timezone**: UTC or your main timezone
   - **Currency**: ZAR (South Africa)
5. Follow setup wizard → get **Measurement ID** (e.g., `G-ABCDEFGH123`)

#### Step 2: Add to Environment

```
GA4_PROPERTY_ID=G-ABCDEFGH123
```

#### Step 3: Install GA4 Script on Published Sites

In the published site template (e.g., `src/components/published-sites/[template]-renderer.tsx`), add:

```typescript
// Add to <head>
<script async src={`https://www.googletagmanager.com/gtag/js?id=${GA4_PROPERTY_ID}`}></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${GA4_PROPERTY_ID}');
</script>
```

This tracks all visitor activity on the published site.

#### Step 4: Dashboard Integration (Optional)

In client dashboard, show GA4 metrics:

1. Enable GA4 API in Google Cloud Console
2. Create service account credentials (JSON key)
3. Store credentials securely
4. Add to `.env.local`:
   ```
   GA4_CLIENT_EMAIL=...@...iam.gserviceaccount.com
   GA4_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...
   ```

5. Create API endpoint `/api/analytics/ga4` to fetch client's traffic data
6. Display in dashboard (visitor count, top pages, traffic sources)

---

### 5.2 Facebook Pixel (Optional) & Google Reviews

**Facebook Pixel**: Track conversions and build audience for retargeting ads

**Google Reviews**: Show recent reviews on published site (requires Google Business Profile link)

In dashboard, clients can optionally enter:

- **Facebook Pixel ID**
- **Google Place ID** (for reviews widget)

These are stored in the `clients` table and injected into the published site template.

---

## Phase 6: Deployment (Vercel)

### 6.1 Connect Vercel & GitHub

**Why**: Automatic deployments on every push; preview builds for testing.

#### Step 1: Prepare GitHub Repository

1. Initialize git (if not already):
   ```bash
   cd c:\Users\anoti\OneDrive\Desktop\WAAS
   git init
   git add .
   git commit -m "Initial commit: SiteRent WAAS MVP"
   ```

2. Create GitHub repository:
   - Go to [github.com/new](https://github.com/new)
   - **Repository name**: `siterent-waas`
   - **Visibility**: Private (unless open-sourcing)
   - Create repo

3. Connect local repo to GitHub:
   ```bash
   git remote add origin https://github.com/[yourusername]/siterent-waas.git
   git branch -M main
   git push -u origin main
   ```

#### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up or log in with GitHub
3. Click **Add New** → **Project**
4. Select `siterent-waas` repository
5. Configure project:
   - **Framework**: Next.js
   - **Root Directory**: `.` (default)
   - Leave other settings default
6. Click **Deploy**

Vercel will:
- Build the project
- Run `npm run build`
- Deploy to `siterent-waas.vercel.app` (temporary URL)

#### Step 3: Add Environment Variables to Vercel

1. In Vercel project, go to **Settings** → **Environment Variables**
2. Add all variables from `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   GEMINI_API_KEY=...
   PEACH_ENTITY_ID=...
   PEACH_SECRET_TOKEN=...
   PEACH_SANDBOX=false  # Production mode
   RESEND_API_KEY=...
   GA4_PROPERTY_ID=...
   VERCEL_API_TOKEN=...
   ```

3. Redeploy:
   - Go to **Deployments** → **Redeploy**
   - Or just push a new commit to GitHub (auto-deploys)

#### Step 4: Add Custom Domain

1. In Vercel project, go to **Settings** → **Domains**
2. Add `siterent.co.za`
3. Vercel displays nameservers or CNAME records
4. Update your domain registrar (done in Phase 2)
5. Wait 24–48 hours for DNS to propagate
6. Verify: `https://siterent.co.za` loads the app

#### Step 5: SSL/HTTPS

Vercel auto-provisions SSL certificates from Let's Encrypt. Within minutes, `https://siterent.co.za` will be secure.

---

### 6.2 Subdomain Routing on Vercel

For published sites at `[subdomain].siterent.co.za`:

1. In Vercel, go to **Domains** → **Add domain** → `*.siterent.co.za`
   - This enables wildcard subdomains
2. Vercel handles routing automatically
3. Your Next.js middleware (Phase 2.2) handles subdomain logic

---

### 6.3 Production Checklist

Before going live, verify:

- [ ] `.env` variables set correctly (especially `PEACH_SANDBOX=false`)
- [ ] Supabase production project is configured (not sandbox)
- [ ] Email templates tested in production
- [ ] Peach Payments set to production (not sandbox)
- [ ] GA4 tracking installed on published sites
- [ ] Domain DNS pointing to Vercel
- [ ] SSL certificate active (green lock)
- [ ] Database backups scheduled (Supabase auto-backups daily)
- [ ] Error monitoring set up (e.g., Sentry)
- [ ] Analytics dashboard configured
- [ ] Admin panel access restricted

---

## Phase 7: User Onboarding & Launch

### 7.1 Prepare for Launch

#### Marketing Website

Update `src/app/page.tsx` or create landing page with:

- **Hero section**: "Build your HVAC website in minutes"
- **Features**: 4-step process, no coding, instant publishing
- **Pricing table**: Subscription tiers with features
- **CTAs**: "Start free trial" button → `/onboarding`
- **FAQ**: Common questions
- **Testimonials** (after launch)

#### Legal Documents

Create and host:

1. **Terms of Service**
   - Define user responsibilities, liability, payment terms
   - Include clause about Vercel subdomain usage

2. **Privacy Policy**
   - Explain data collection (email, business info, photos)
   - Mention Supabase, Peach, GA4 integrations
   - Privacy Shield / GDPR compliance (if EU users)

3. **Acceptable Use Policy**
   - What uses are prohibited (spam, adult content, etc.)

Link these in footer and during signup.

---

### 7.2 Trial Period Setup

**Recommendation**: 14-day free trial with no card required.

1. In `clients` table schema, add:
   ```sql
   ALTER TABLE clients ADD COLUMN trial_ends_at TIMESTAMPTZ;
   ```

2. During onboarding, set:
   ```typescript
   trial_ends_at = now() + interval '14 days';
   published = true;  // Site can be published immediately
   ```

3. Create background job (cron task) to:
   - Check daily for expired trials
   - Convert to paying if they entered payment info
   - Send reminder email 1 day before expiry
   - Set `published = false` on trial expiry (unless payment succeeded)

---

### 7.3 Invite First Customers

#### Channels

1. **Email outreach**
   - Contact HVAC businesses in your target market
   - Offer: "Free site for 14 days" or "Lifetime discount: 30% off"

2. **LinkedIn**
   - Join HVAC groups and post about solution
   - Message business owners directly

3. **Facebook Groups**
   - Join local HVAC/plumbing business groups
   - Share demo / early access link

4. **Direct sales**
   - Phone/Zoom calls to explain product
   - Walk through onboarding UI in real-time

#### Feedback Loop

1. Track sign-ups and user flow via GA4
2. Collect feedback via post-onboarding survey (email)
3. Monitor errors and crashes (Sentry or Vercel analytics)
4. Update docs and support as issues arise

---

### 7.4 Post-Launch Operations

#### Week 1–2: Monitoring

- Monitor Vercel deployments for errors
- Check email deliverability (any bounces in Resend?)
- Verify Peach webhooks are firing
- Monitor GA4 for traffic spikes or anomalies

#### Week 3–4: Optimization

- A/B test onboarding flow (try different wording, fewer steps)
- Reduce friction: pre-fill data where possible
- Add live chat or support email during high traffic hours
- Collect testimonials from early customers

#### Month 2+: Scaling

- Add more templates and AI customization
- Implement advanced features (appointment booking, reviews auto-import, social ad templates)
- Hire support/sales team
- Expand to new regions or business verticals

---

## Appendix: Environment Variables Reference

Create `.env.local` (local development) and set equivalent vars in Vercel dashboard:

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SITE_URL` | Local/prod app URL | `http://localhost:3000` |
| `NEXT_PUBLIC_PLATFORM_DOMAIN` | Base domain for subdomains | `siterent.co.za` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://abc123.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public key | `eyJhbGc...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase admin key (backend only) | `eyJhbGc...` |
| `GEMINI_API_KEY` | Google AI Studio key | `AIza...` |
| `GEMINI_MODEL` | Gemini model to use | `gemini-2.0-flash` |
| `PEACH_ENTITY_ID` | Peach Payments merchant ID | `8a829418...` |
| `PEACH_SECRET_TOKEN` | Peach API secret | `secret_...` |
| `PEACH_SANDBOX` | Use Peach sandbox (true) or prod (false) | `false` in production |
| `RESEND_API_KEY` | Resend email API key | `re_abc...` |
| `SENDGRID_API_KEY` | SendGrid alternative | `SG.abc...` |
| `GA4_PROPERTY_ID` | Google Analytics Measurement ID | `G-ABCD...` |
| `GA4_CLIENT_EMAIL` | GA4 service account email | `...@...iam.gserviceaccount.com` |
| `GA4_PRIVATE_KEY` | GA4 service account private key | `-----BEGIN PRIVATE KEY...` |
| `VERCEL_API_TOKEN` | Vercel CLI auth token (optional) | `vercel_...` |
| `VERCEL_PROJECT_ID` | Vercel project ID | `prj_abc...` |

---

## Appendix: Troubleshooting

### Common Issues

#### 1. "Subdomain not found" when accessing `[subdomain].siterent.co.za`

**Cause**: DNS not propagated or domain not added to Vercel.

**Fix**:
- Check DNS propagation: `nslookup [subdomain].siterent.co.za`
- Add `*.siterent.co.za` to Vercel domains
- Wait 24–48 hours

#### 2. Magic link email never arrives

**Cause**: Supabase email sending disabled or delivery provider issue.

**Fix**:
- Verify `mailer_settings` in Supabase project
- Check spam/junk folder
- Use Supabase email templates (not custom)
- Test with Supabase console's email preview

#### 3. Peach webhook not firing

**Cause**: Webhook not configured or IP blocklisted.

**Fix**:
- Verify webhook URL in Peach dashboard
- Check Peach webhook logs for errors
- Test manually with Postman to `/api/webhooks/peach`
- Ensure webhook handler returns 200 OK

#### 4. Vercel build fails

**Cause**: Missing environment variable or TypeScript error.

**Fix**:
- Check Vercel deployment logs: **Settings** → **Build & Development** → logs
- Verify all required env vars are set
- Run `npm run build` locally to reproduce
- Fix error and push new commit (auto-redeploys)

#### 5. "CORS blocked" error in browser

**Cause**: Frontend calling API without proper CORS headers.

**Fix**:
- Ensure API route is in `src/app/api/...`
- Next.js handles CORS automatically for same-origin requests
- If calling external API, use backend route (not frontend fetch directly)

#### 6. High database costs / slow queries

**Cause**: Missing indexes or inefficient queries.

**Fix**:
- In Supabase console, go to **Query Performance**
- Enable query time analysis
- Add indexes on frequently filtered columns (`subdomain`, `user_id`, `created_at`)
- Profile queries with `EXPLAIN ANALYZE`

---

## Quick Reference: Step-by-Step Launch Checklist

```
PHASE 1 – INFRASTRUCTURE (Do First)
[ ] 1.1 – Create Supabase project, copy KEYS
[ ] 1.2 – Initialize database schema from migration file
[ ] 1.3 – Enable Auth email templates
[ ] 1.4 – Test Supabase locally (signup, email link)
[ ] 1.4 – Get Gemini API key, test onboarding AI
[ ] Test locally: `npm run dev`, `npm run build` pass

PHASE 2 – DOMAIN
[ ] 2.1 – Register siterent.co.za (or your domain)
[ ] (Defer 2.2 until after Vercel setup)

PHASE 3 – PAYMENTS
[ ] 3.1 – Sign up for Peach Payments
[ ] 3.2 – Get Entity ID & Secret Token
[ ] 3.3 – Configure webhook URL (after deployment)
[ ] 3.4 – Test Peach checkout in sandbox

PHASE 4 – EMAIL
[ ] 4.1 – Sign up for Resend
[ ] 4.2 – Get API key
[ ] (Defer domain verification until production)
[ ] Create email templates in code

PHASE 5 – ANALYTICS
[ ] 5.1 – Create GA4 property, get Measurement ID
[ ] 5.2 – Add GA4 script to published site template
[ ] (Optional 5.2 – Set up GA4 API for dashboard)

PHASE 6 – DEPLOYMENT
[ ] 6.1 – Create GitHub repo, push code
[ ] 6.2 – Import to Vercel
[ ] 6.3 – Add all env variables to Vercel
[ ] 6.4 – Add siterent.co.za domain to Vercel
[ ] 6.5 – Point nameservers to Vercel (in registrar)
[ ] Wait 24–48 hours for DNS
[ ] 6.6 – Verify HTTPS working

PHASE 7 – LAUNCH
[ ] 7.1 – Update marketing homepage
[ ] 7.2 – Set up legal docs (T&C, Privacy)
[ ] 7.3 – Configure free trial period
[ ] 7.4 – Invite first beta customers
[ ] 7.5 – Monitor for errors, collect feedback
```

---

## Next Steps After Launch

1. **Measure & iterate**: Track sign-ups, onboarding completion, payment conversion
2. **Customer success**: Email customers after 7 days asking for feedback
3. **Feature roadmap**: Build next features based on feedback (appointment booking, reviews import, SEO tools)
4. **Team hiring**: Hire support, sales, and engineers as revenue grows
5. **Marketing scaling**: Invest in ads / outreach once unit economics are positive

---

## Support & Documentation

- **Supabase docs**: https://supabase.com/docs
- **Next.js docs**: https://nextjs.org/docs
- **Vercel docs**: https://vercel.com/docs
- **Peach docs**: https://peachpayments.com/en/documentation
- **Resend docs**: https://resend.com/docs
- **Google Analytics**: https://support.google.com/analytics
- **Gemini API docs**: https://ai.google.dev/

---

**Document Version**: 1.0  
**Last Updated**: June 1, 2026  
**Author**: AI Assistant  
**Status**: Ready for implementation
