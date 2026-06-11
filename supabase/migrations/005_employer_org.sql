-- Step 4: employer tenancy, aggregate-only dashboard, invite join
-- Run after 004_shop_orders.sql (safe to re-run)

drop policy if exists "Employers read own organisations" on public.organisations;

create policy "Employers read own organisations"
  on public.organisations for select to authenticated
  using (
    exists (
      select 1
      from public.organisation_memberships om
      where om.organisation_id = organisations.id
        and om.member_id = auth.uid()
    )
  );

create table if not exists public.organisation_memberships (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade not null,
  member_id uuid references public.members(id) on delete cascade not null,
  role text not null check (role in ('admin', 'viewer')),
  created_at timestamptz not null default now(),
  unique (organisation_id, member_id)
);

create index if not exists organisation_memberships_member_idx
  on public.organisation_memberships (member_id);

alter table public.organisation_memberships enable row level security;

drop policy if exists "Members read own org memberships" on public.organisation_memberships;

create policy "Members read own org memberships"
  on public.organisation_memberships for select to authenticated
  using (auth.uid() = member_id);

create table if not exists public.org_invite_codes (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade not null,
  code text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.org_invite_codes enable row level security;

drop policy if exists "Employers read own org invite codes" on public.org_invite_codes;

create policy "Employers read own org invite codes"
  on public.org_invite_codes for select to authenticated
  using (
    exists (
      select 1
      from public.organisation_memberships om
      where om.organisation_id = org_invite_codes.organisation_id
        and om.member_id = auth.uid()
        and om.role = 'admin'
    )
  );

create table if not exists public.org_aggregates (
  organisation_id uuid primary key references public.organisations(id) on delete cascade,
  member_count int not null default 0,
  consented_count int not null default 0,
  active_count int not null default 0,
  participation_pct int not null default 0,
  avg_photonic_age numeric(5, 1),
  avg_lost_light_years numeric(4, 1),
  avg_calendar_age numeric(5, 1),
  cohort_shift_lly numeric(4, 2),
  estimated_annual_savings_pence bigint not null default 0,
  avg_confidence_score int,
  computed_at timestamptz not null default now()
);

alter table public.org_aggregates enable row level security;

drop policy if exists "Employers read own org aggregates" on public.org_aggregates;

create policy "Employers read own org aggregates"
  on public.org_aggregates for select to authenticated
  using (
    exists (
      select 1
      from public.organisation_memberships om
      where om.organisation_id = org_aggregates.organisation_id
        and om.member_id = auth.uid()
    )
  );

-- Aggregate wall: employers have NO select path to member photonic_age_profiles,
-- tiptraq_nights, phone_observations, or cue_events. Only org_aggregates.

notify pgrst, 'reload schema';
