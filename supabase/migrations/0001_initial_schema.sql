create extension if not exists "pgcrypto";

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  business_name text,
  trading_name text not null default '',
  tagline text,
  owner_name text,
  year_founded integer,
  business_types text[] not null default '{}',
  jobs_completed integer,
  about_text text,
  services text[] not null default '{}',
  service_prices jsonb not null default '{}'::jsonb,
  certifications text[] not null default '{}',
  is_insured boolean not null default false,
  has_guarantee boolean not null default false,
  guarantee_period text,
  has_emergency boolean not null default false,
  offers_free_quote boolean not null default true,
  primary_city text,
  address text,
  suburbs text[] not null default '{}',
  is_mobile boolean not null default false,
  phone text,
  whatsapp text,
  email text,
  response_time text,
  hours jsonb not null default '{}'::jsonb,
  facebook_url text,
  instagram_url text,
  pixel_id text,
  google_place_id text,
  ga_measurement_id text,
  template_style text not null default 'aireco-dark',
  brand_colour text not null default 'navy',
  logo_url text,
  hero_photo_url text,
  owner_photo_url text,
  gallery_photos text[] not null default '{}',
  testimonials jsonb not null default '[]'::jsonb,
  subdomain text unique,
  custom_domain text unique,
  site_published boolean not null default false,
  published_at timestamptz,
  subscription_status text not null default 'pending',
  peach_registration_id text,
  next_billing_date date,
  payment_failed_at timestamptz,
  subscription_ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint clients_brand_colour_check check (brand_colour in ('navy', 'red', 'green', 'amber', 'purple', 'teal')),
  constraint clients_template_style_check check (template_style in ('aireco-dark', 'eircool-editorial', 'razor-minimal', 'coolair-blue')),
  constraint clients_subscription_status_check check (subscription_status in ('pending', 'active', 'cancelled', 'past_due', 'paused'))
);

create table public.onboarding_progress (
  client_id uuid primary key references public.clients(id) on delete cascade,
  current_step integer not null default 1,
  completed_steps integer[] not null default '{}',
  last_saved_at timestamptz not null default now()
);

create table public.billing_events (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete set null,
  provider text not null default 'peach',
  event_type text not null,
  provider_payment_id text,
  amount numeric(10, 2),
  status text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.email_events (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete set null,
  template_key text not null,
  recipient text not null,
  provider text not null,
  provider_message_id text,
  status text not null default 'queued',
  created_at timestamptz not null default now()
);

create table public.site_enquiries (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete cascade,
  name text not null,
  phone text not null,
  service text not null,
  suburb text not null,
  message text,
  status text not null default 'new',
  created_at timestamptz not null default now(),
  constraint site_enquiries_status_check check (status in ('new', 'contacted', 'closed'))
);

create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.clients enable row level security;
alter table public.onboarding_progress enable row level security;
alter table public.billing_events enable row level security;
alter table public.email_events enable row level security;
alter table public.admin_users enable row level security;
alter table public.site_enquiries enable row level security;

create policy "clients can read own client rows"
  on public.clients for select
  using (auth.uid() = user_id);

create policy "clients can update own client rows"
  on public.clients for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "clients can insert own client rows"
  on public.clients for insert
  with check (auth.uid() = user_id);

create policy "clients can read own onboarding progress"
  on public.onboarding_progress for select
  using (
    exists (
      select 1 from public.clients
      where clients.id = onboarding_progress.client_id
      and clients.user_id = auth.uid()
    )
  );

create policy "clients can update own onboarding progress"
  on public.onboarding_progress for update
  using (
    exists (
      select 1 from public.clients
      where clients.id = onboarding_progress.client_id
      and clients.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.clients
      where clients.id = onboarding_progress.client_id
      and clients.user_id = auth.uid()
    )
  );

create policy "clients can insert own onboarding progress"
  on public.onboarding_progress for insert
  with check (
    exists (
      select 1 from public.clients
      where clients.id = onboarding_progress.client_id
      and clients.user_id = auth.uid()
    )
  );

create policy "admins can read all clients"
  on public.clients for select
  using (exists (select 1 from public.admin_users where admin_users.user_id = auth.uid()));

create policy "admins can manage billing events"
  on public.billing_events for all
  using (exists (select 1 from public.admin_users where admin_users.user_id = auth.uid()))
  with check (exists (select 1 from public.admin_users where admin_users.user_id = auth.uid()));

create policy "clients can read own enquiries"
  on public.site_enquiries for select
  using (
    exists (
      select 1 from public.clients
      where clients.id = site_enquiries.client_id
      and clients.user_id = auth.uid()
    )
  );

create policy "public can create published-site enquiries"
  on public.site_enquiries for insert
  with check (true);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger clients_set_updated_at
  before update on public.clients
  for each row execute function public.set_updated_at();

insert into storage.buckets (id, name, public)
values
  ('logos', 'logos', true),
  ('hero-photos', 'hero-photos', true),
  ('owner-photos', 'owner-photos', true),
  ('gallery-photos', 'gallery-photos', true)
on conflict (id) do nothing;

create policy "clients can upload logos"
  on storage.objects for insert
  with check (bucket_id in ('logos', 'hero-photos', 'owner-photos', 'gallery-photos') and auth.role() = 'authenticated');

create policy "public can read site images"
  on storage.objects for select
  using (bucket_id in ('logos', 'hero-photos', 'owner-photos', 'gallery-photos'));
