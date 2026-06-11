-- PHOS Chronobiobank platform: members, consents, Free-tier spine
-- Run after 001_phos_dashboard.sql (safe to re-run)

create table if not exists public.organisations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  created_at timestamptz not null default now()
);

alter table public.organisations enable row level security;

create table if not exists public.members (
  id uuid references auth.users on delete cascade primary key,
  organisation_id uuid references public.organisations(id) on delete set null,
  full_name text,
  date_of_birth date,
  location_city text,
  location_country text default 'United Kingdom',
  latitude numeric(8, 5),
  created_at timestamptz not null default now()
);

alter table public.members enable row level security;

drop policy if exists "Members read own row" on public.members;
drop policy if exists "Members insert own row" on public.members;
drop policy if exists "Members update own row" on public.members;

create policy "Members read own row"
  on public.members for select to authenticated using (auth.uid() = id);

create policy "Members insert own row"
  on public.members for insert to authenticated with check (auth.uid() = id);

create policy "Members update own row"
  on public.members for update to authenticated using (auth.uid() = id);

create table if not exists public.consents (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references public.members(id) on delete cascade not null,
  consent_type text not null check (consent_type in ('service', 'employer_aggregate', 'research_chronobiobank')),
  granted boolean not null default false,
  granted_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  unique (member_id, consent_type)
);

alter table public.consents enable row level security;

drop policy if exists "Members read own consents" on public.consents;
drop policy if exists "Members insert own consents" on public.consents;
drop policy if exists "Members update own consents" on public.consents;

create policy "Members read own consents"
  on public.consents for select to authenticated using (auth.uid() = member_id);

create policy "Members insert own consents"
  on public.consents for insert to authenticated with check (auth.uid() = member_id);

create policy "Members update own consents"
  on public.consents for update to authenticated using (auth.uid() = member_id);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references public.members(id) on delete cascade not null unique,
  tier text not null default 'free' check (tier in ('free', 'basic', 'premium')),
  status text not null default 'active' check (status in ('active', 'cancelled', 'past_due')),
  current_period_start timestamptz default now(),
  current_period_end timestamptz,
  created_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

drop policy if exists "Members read own subscription" on public.subscriptions;
drop policy if exists "Members insert own subscription" on public.subscriptions;
drop policy if exists "Members update own subscription" on public.subscriptions;

create policy "Members read own subscription"
  on public.subscriptions for select to authenticated using (auth.uid() = member_id);

create policy "Members insert own subscription"
  on public.subscriptions for insert to authenticated with check (auth.uid() = member_id);

create policy "Members update own subscription"
  on public.subscriptions for update to authenticated using (auth.uid() = member_id);

create table if not exists public.phone_observations (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references public.members(id) on delete cascade not null,
  source text not null check (source in ('apple_healthkit', 'google_health_connect', 'demo')),
  observation_date date not null,
  sleep_onset time,
  sleep_offset time,
  sleep_duration_minutes int,
  is_weekend boolean default false,
  steps int,
  synced_at timestamptz not null default now(),
  unique (member_id, observation_date, source)
);

create index if not exists phone_observations_member_date_idx
  on public.phone_observations (member_id, observation_date desc);

alter table public.phone_observations enable row level security;

drop policy if exists "Members read own phone observations" on public.phone_observations;
drop policy if exists "Members insert own phone observations" on public.phone_observations;
drop policy if exists "Members delete own phone observations" on public.phone_observations;

create policy "Members read own phone observations"
  on public.phone_observations for select to authenticated using (auth.uid() = member_id);

create policy "Members insert own phone observations"
  on public.phone_observations for insert to authenticated with check (auth.uid() = member_id);

create policy "Members delete own phone observations"
  on public.phone_observations for delete to authenticated using (auth.uid() = member_id);

create table if not exists public.photonic_age_profiles (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references public.members(id) on delete cascade not null unique,
  tier text not null default 'free' check (tier in ('free', 'basic', 'premium')),
  calendar_age int,
  photonic_age numeric(5, 1) not null,
  lost_light_years numeric(4, 1) not null,
  confidence_score int not null,
  confidence_band_minutes int not null,
  confidence_label text not null,
  d1_value numeric(6, 2),
  d1_source text,
  d1_confidence int,
  d2_value numeric(6, 2),
  d2_source text,
  d2_confidence int,
  d3_value numeric(6, 2),
  d3_source text,
  d3_confidence int,
  light_time_start time,
  light_time_end time,
  daily_cue_type text,
  daily_cue_copy text,
  provenance jsonb default '{}'::jsonb,
  computed_at timestamptz not null default now()
);

alter table public.photonic_age_profiles enable row level security;

drop policy if exists "Members read own photonic profile" on public.photonic_age_profiles;
drop policy if exists "Members insert own photonic profile" on public.photonic_age_profiles;
drop policy if exists "Members update own photonic profile" on public.photonic_age_profiles;

create policy "Members read own photonic profile"
  on public.photonic_age_profiles for select to authenticated using (auth.uid() = member_id);

create policy "Members insert own photonic profile"
  on public.photonic_age_profiles for insert to authenticated with check (auth.uid() = member_id);

create policy "Members update own photonic profile"
  on public.photonic_age_profiles for update to authenticated using (auth.uid() = member_id);

create table if not exists public.cue_events (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references public.members(id) on delete cascade not null,
  cue_type text not null,
  cue_copy text not null,
  light_time_start time,
  light_time_end time,
  delivered_via text not null default 'q' check (delivered_via in ('q', 'dashboard', 'push')),
  delivered_at timestamptz not null default now()
);

create index if not exists cue_events_member_delivered_idx
  on public.cue_events (member_id, delivered_at desc);

alter table public.cue_events enable row level security;

drop policy if exists "Members read own cue events" on public.cue_events;
drop policy if exists "Members insert own cue events" on public.cue_events;

create policy "Members read own cue events"
  on public.cue_events for select to authenticated using (auth.uid() = member_id);

create policy "Members insert own cue events"
  on public.cue_events for insert to authenticated with check (auth.uid() = member_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, full_name)
  values (new.id, 'patient', coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;

  insert into public.patient_profiles (id, location_country)
  values (new.id, 'United Kingdom')
  on conflict (id) do nothing;

  insert into public.members (id, full_name, location_country)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'United Kingdom'
  )
  on conflict (id) do nothing;

  insert into public.consents (member_id, consent_type, granted, granted_at)
  values (new.id, 'service', true, now())
  on conflict (member_id, consent_type) do nothing;

  insert into public.subscriptions (member_id, tier, status)
  values (new.id, 'free', 'active')
  on conflict (member_id) do nothing;

  return new;
end;
$$;

notify pgrst, 'reload schema';
