-- P0 hardening: webhook idempotency + tighter storage RLS.

-- 1. Webhook idempotency
-- Guarantee a single stored webhook event per provider payment id so retried
-- deliveries cannot be processed twice. Partial unique index keeps checkout
-- and admin events (which may share ids or be null) unaffected.
create unique index if not exists billing_events_webhook_unique
  on public.billing_events (provider, provider_payment_id)
  where event_type = 'webhook' and provider_payment_id is not null;

-- 2. Tighten storage object insert policy
-- The previous policy let any authenticated user write to any path in the
-- image buckets. Restrict direct client uploads to a folder owned by the user
-- (first path segment must equal their uid). The app's server route uploads
-- with the service role and is unaffected by this policy.
drop policy if exists "clients can upload logos" on storage.objects;

create policy "users can upload to own folder"
  on storage.objects for insert
  with check (
    bucket_id in ('logos', 'hero-photos', 'owner-photos', 'gallery-photos')
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
