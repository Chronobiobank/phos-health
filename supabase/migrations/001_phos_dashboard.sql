-- PHOS master dashboard: auth, TipTraQ upload, MLux profiles
-- Run in Supabase SQL Editor (safe to re-run)

create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  role text not null default 'patient' check (role in ('patient', 'clinician', 'admin')),
  full_name text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;

create policy "Users can read own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

create table if not exists public.patient_profiles (
  id uuid references public.profiles on delete cascade primary key,
  date_of_birth date,
  location_city text,
  location_country text default 'United Kingdom',
  created_at timestamptz not null default now()
);

alter table public.patient_profiles enable row level security;

drop policy if exists "Patients can read own patient profile" on public.patient_profiles;
drop policy if exists "Patients can insert own patient profile" on public.patient_profiles;
drop policy if exists "Patients can update own patient profile" on public.patient_profiles;

create policy "Patients can read own patient profile"
  on public.patient_profiles for select using (auth.uid() = id);

create policy "Patients can insert own patient profile"
  on public.patient_profiles for insert with check (auth.uid() = id);

create policy "Patients can update own patient profile"
  on public.patient_profiles for update using (auth.uid() = id);

insert into storage.buckets (id, name, public)
values ('tiptraq-reports', 'tiptraq-reports', false)
on conflict (id) do nothing;

drop policy if exists "Users access own tiptraq reports" on storage.objects;

create policy "Users access own tiptraq reports"
on storage.objects for all
to authenticated
using (
  bucket_id = 'tiptraq-reports'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'tiptraq-reports'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create table if not exists public.tiptraq_nights (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references public.profiles(id) on delete cascade,
  report_date date not null,
  pdf_path text,
  recording_start timestamptz,
  recording_end timestamptz,
  trt_minutes int,
  signal_quality_pct int,
  sleep_onset timestamptz,
  sleep_offset timestamptz,
  sleep_latency_minutes int,
  tst_minutes int,
  waso_minutes int,
  sleep_efficiency_pct int,
  rem_duration_minutes int,
  rem_pct_tst numeric(5,2),
  nrem_duration_minutes int,
  first_rem_onset timestamptz,
  ahi numeric(5,2),
  ahi_severity text,
  rdi numeric(5,2),
  odi_3pct numeric(5,2),
  odi_4pct numeric(5,2),
  t90_pct numeric(5,2),
  min_spo2 int,
  mean_spo2 int,
  hypoxic_burden numeric(6,2),
  event_count int,
  mean_pr int,
  min_pr int,
  max_pr int,
  sns_pct int,
  pns_pct int,
  snoring_minutes int,
  algorithm_version text,
  mlux_phase_time time,
  mlux_phase_minutes int,
  dlmo_baseline_estimate time,
  dlmo_rem_correction_min int,
  dlmo_ans_correction_min int,
  dlmo_ahi_modifier_min int,
  confidence_score int,
  confidence_band_minutes int,
  confidence_label text,
  chronotype_signal text,
  non_dipper_flag boolean default false,
  high_sympathetic_flag boolean default false,
  rem_delay_flag boolean default false,
  apnea_confound_flag boolean default false,
  extraction_model text,
  created_at timestamptz default now()
);

create index if not exists tiptraq_nights_patient_date_idx
  on public.tiptraq_nights (patient_id, report_date desc);

alter table public.tiptraq_nights enable row level security;

drop policy if exists "Patients can read own tiptraq nights" on public.tiptraq_nights;
drop policy if exists "Patients can insert own tiptraq nights" on public.tiptraq_nights;
drop policy if exists "Patients can delete own tiptraq nights" on public.tiptraq_nights;

create policy "Patients can read own tiptraq nights"
  on public.tiptraq_nights for select to authenticated using (auth.uid() = patient_id);

create policy "Patients can insert own tiptraq nights"
  on public.tiptraq_nights for insert to authenticated with check (auth.uid() = patient_id);

create policy "Patients can delete own tiptraq nights"
  on public.tiptraq_nights for delete to authenticated using (auth.uid() = patient_id);

create table if not exists public.mlux_profiles (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references public.profiles(id) on delete cascade unique,
  nights_count int default 0,
  mlux_phase_time time,
  mlux_phase_minutes int,
  confidence_score int,
  confidence_band_minutes int,
  confidence_label text,
  chronotype text,
  non_dipper_confirmed boolean default false,
  last_updated timestamptz default now(),
  simvastatin_optimal_time time,
  ramipril_optimal_time time,
  prednisolone_optimal_time time,
  salmeterol_optimal_time time,
  light_dose_window_start time,
  light_dose_window_end time,
  has_tiptraq boolean default false,
  created_at timestamptz default now()
);

alter table public.mlux_profiles enable row level security;

drop policy if exists "Patients can read own mlux profile" on public.mlux_profiles;
drop policy if exists "Patients can insert own mlux profile" on public.mlux_profiles;
drop policy if exists "Patients can update own mlux profile" on public.mlux_profiles;

create policy "Patients can read own mlux profile"
  on public.mlux_profiles for select to authenticated using (auth.uid() = patient_id);

create policy "Patients can insert own mlux profile"
  on public.mlux_profiles for insert to authenticated with check (auth.uid() = patient_id);

create policy "Patients can update own mlux profile"
  on public.mlux_profiles for update to authenticated using (auth.uid() = patient_id);

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

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

notify pgrst, 'reload schema';
