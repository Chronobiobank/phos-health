-- Step 2: kit serial routing + automated TipTraQ ingest audit
-- Run after 002_chronobiobank_platform.sql (safe to re-run)

create table if not exists public.kits (
  id uuid primary key default gen_random_uuid(),
  serial text not null unique,
  kit_type text not null check (kit_type in ('panel', 'tiptraq')),
  status text not null default 'inventory' check (
    status in ('inventory', 'assigned', 'in_use', 'returned', 'completed')
  ),
  organisation_id uuid references public.organisations(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists kits_serial_idx on public.kits (serial);
create index if not exists kits_org_idx on public.kits (organisation_id);

alter table public.kits enable row level security;

drop policy if exists "Members read assigned kits" on public.kits;
drop policy if exists "Members read assignable kits" on public.kits;
drop policy if exists "Members update assignable kits" on public.kits;

create policy "Members read assignable kits"
  on public.kits for select to authenticated
  using (
    status = 'inventory'
    or exists (
      select 1
      from public.kit_assignments ka
      where ka.kit_id = kits.id
        and ka.member_id = auth.uid()
        and ka.unassigned_at is null
    )
  );

create policy "Members update assignable kits"
  on public.kits for update to authenticated
  using (status in ('inventory', 'assigned'))
  with check (status in ('assigned', 'in_use', 'completed', 'returned'));

create table if not exists public.kit_assignments (
  id uuid primary key default gen_random_uuid(),
  kit_id uuid references public.kits(id) on delete cascade not null,
  member_id uuid references public.members(id) on delete cascade not null,
  assigned_at timestamptz not null default now(),
  unassigned_at timestamptz
);

create unique index if not exists kit_assignments_active_kit_idx
  on public.kit_assignments (kit_id)
  where unassigned_at is null;

create index if not exists kit_assignments_member_active_idx
  on public.kit_assignments (member_id)
  where unassigned_at is null;

alter table public.kit_assignments enable row level security;

drop policy if exists "Members read own kit assignments" on public.kit_assignments;
drop policy if exists "Members insert own kit assignments" on public.kit_assignments;

create policy "Members read own kit assignments"
  on public.kit_assignments for select to authenticated
  using (auth.uid() = member_id);

create policy "Members insert own kit assignments"
  on public.kit_assignments for insert to authenticated
  with check (auth.uid() = member_id);

create table if not exists public.ingest_events (
  id uuid primary key default gen_random_uuid(),
  source text not null default 'tiptraq_webhook',
  external_id text,
  kit_serial text,
  member_id uuid references public.members(id) on delete set null,
  status text not null check (status in ('received', 'processed', 'failed', 'duplicate')),
  payload jsonb default '{}'::jsonb,
  error_message text,
  received_at timestamptz not null default now(),
  processed_at timestamptz
);

create unique index if not exists ingest_events_external_id_idx
  on public.ingest_events (source, external_id)
  where external_id is not null;

create index if not exists ingest_events_serial_idx
  on public.ingest_events (kit_serial, received_at desc);

alter table public.ingest_events enable row level security;

-- Ingest audit is service-role only (no member SELECT policy).

notify pgrst, 'reload schema';
