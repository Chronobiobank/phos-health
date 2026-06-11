-- Step 3: shop orders + fulfilment queue + Daily Cue delivery channel
-- Run after 003_ingestion_kits.sql (safe to re-run)

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references public.members(id) on delete cascade not null,
  status text not null default 'confirmed' check (
    status in ('pending_payment', 'confirmed', 'fulfilled', 'cancelled')
  ),
  total_pence int not null,
  currency text not null default 'GBP',
  fulfilment_email text not null default 'orders@phos.org.uk',
  created_at timestamptz not null default now()
);

create index if not exists orders_member_created_idx
  on public.orders (member_id, created_at desc);

alter table public.orders enable row level security;

drop policy if exists "Members read own orders" on public.orders;

create policy "Members read own orders"
  on public.orders for select to authenticated
  using (auth.uid() = member_id);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade not null,
  sku text not null,
  kit_type text not null check (kit_type in ('panel', 'tiptraq')),
  quantity int not null default 1,
  unit_price_pence int not null,
  kit_id uuid references public.kits(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists order_items_order_idx on public.order_items (order_id);

alter table public.order_items enable row level security;

drop policy if exists "Members read own order items" on public.order_items;

create policy "Members read own order items"
  on public.order_items for select to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and o.member_id = auth.uid()
    )
  );

create table if not exists public.fulfilment_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade not null,
  member_id uuid references public.members(id) on delete cascade not null,
  kit_id uuid references public.kits(id) on delete set null,
  kit_serial text not null,
  sku text not null,
  notify_email text not null default 'orders@phos.org.uk',
  status text not null default 'queued' check (status in ('queued', 'sent', 'failed')),
  payload jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.fulfilment_events enable row level security;

-- Fulfilment queue is ops/service-role only.

alter table public.cue_events drop constraint if exists cue_events_delivered_via_check;

alter table public.cue_events
  add constraint cue_events_delivered_via_check
  check (delivered_via in ('daily_cue', 'dashboard', 'push', 'q'));

notify pgrst, 'reload schema';
