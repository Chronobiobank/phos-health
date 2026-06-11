-- Step 5: Chronobiobank research commons opt-in
-- Run after 005_employer_org.sql (safe to re-run)

create table if not exists public.research_contributions (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references public.members(id) on delete cascade not null unique,
  pseudonym_id text not null unique,
  status text not null default 'active' check (status in ('active', 'withdrawn')),
  tier text check (tier in ('free', 'basic', 'premium')),
  payload jsonb not null default '{}'::jsonb,
  contributed_at timestamptz not null default now(),
  withdrawn_at timestamptz,
  updated_at timestamptz not null default now()
);

create index if not exists research_contributions_status_idx
  on public.research_contributions (status, contributed_at desc);

alter table public.research_contributions enable row level security;

drop policy if exists "Members read own research contribution" on public.research_contributions;

create policy "Members read own research contribution"
  on public.research_contributions for select to authenticated
  using (auth.uid() = member_id);

-- Inserts/updates are service-role only (requires active research_chronobiobank consent).

create table if not exists public.research_access_log (
  id uuid primary key default gen_random_uuid(),
  researcher_org text not null,
  query_scope text not null,
  pseudonym_ids text[] default '{}',
  result_count int not null default 0,
  accessed_at timestamptz not null default now(),
  metadata jsonb default '{}'::jsonb
);

create index if not exists research_access_log_accessed_idx
  on public.research_access_log (accessed_at desc);

alter table public.research_access_log enable row level security;

-- Access log is charity/ops only (no member SELECT policy).

notify pgrst, 'reload schema';
