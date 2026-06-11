create table phos_assessments (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  chronological_age integer not null,
  postcode_lat numeric(7,4) not null,
  sleep_time time not null,
  wake_time time not null,
  screen_after_9pm boolean not null,
  outdoor_hours numeric(3,1) not null,
  current_d3 boolean not null,
  current_d3_dose integer,
  photonic_age numeric(4,1) not null,
  lost_light_years numeric(4,1) not null,
  light_time_start time not null,
  light_time_end time not null,
  risk_level text check (risk_level in ('low','elevated','high')) not null,
  protocol_recommended text not null,
  consented_chronobiobank boolean not null default false
);

alter table phos_assessments enable row level security;

create policy "insert only"
  on phos_assessments for insert
  with check (true);
