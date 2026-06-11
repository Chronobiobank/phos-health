-- Sean James lives in DIOS Supabase (dios-health), not PHOS.
-- Run this in the DIOS project SQL Editor (dios-health-dev or dios-health-prod).
-- Email: s.james@tutamail.com

-- 1) Find Sean's auth UUID
select id, email, email_confirmed_at, raw_user_meta_data->>'full_name' as full_name, created_at
from auth.users
where lower(email) = lower('s.james@tutamail.com');

-- 2) Profile + TipTraQ nights (paste UUID from step 1 if needed)
select id, role, full_name from public.profiles
where id in (select id from auth.users where lower(email) = lower('s.james@tutamail.com'));

select id, first_name, family_name, onboarding_complete, date_of_birth, location_city, location_country
from public.patient_profiles
where id in (select id from auth.users where lower(email) = lower('s.james@tutamail.com'));

select id, patient_id, report_date, sleep_efficiency_pct, tst_minutes, created_at
from public.tiptraq_nights
where patient_id in (select id from auth.users where lower(email) = lower('s.james@tutamail.com'))
order by report_date desc;

select * from public.mlux_profiles
where patient_id in (select id from auth.users where lower(email) = lower('s.james@tutamail.com'));

-- 3) Auto-repair: confirm account + profile rows (safe to re-run)
do $$
declare
  sean_uuid uuid;
  sean_nights int;
begin
  select id into sean_uuid
  from auth.users
  where lower(email) = lower('s.james@tutamail.com');

  if sean_uuid is null then
    raise exception 'No auth user for s.james@tutamail.com. Re-invite or recreate in DIOS Auth.';
  end if;

  insert into public.profiles (id, role, full_name)
  values (sean_uuid, 'patient', 'Sean James')
  on conflict (id) do update set role = 'patient', full_name = 'Sean James';

  insert into public.patient_profiles (
    id, first_name, family_name, onboarding_complete,
    location_city, location_country, fitzpatrick_type, date_of_birth
  )
  values (
    sean_uuid, 'Sean', 'James', true,
    'Auckland', 'New Zealand', 2, date '1978-07-17'
  )
  on conflict (id) do update set
    first_name = 'Sean',
    family_name = 'James',
    onboarding_complete = true,
    location_city = coalesce(patient_profiles.location_city, 'Auckland'),
    location_country = coalesce(patient_profiles.location_country, 'New Zealand'),
    fitzpatrick_type = coalesce(patient_profiles.fitzpatrick_type, 2),
    date_of_birth = coalesce(patient_profiles.date_of_birth, date '1978-07-17');

  select count(*) into sean_nights
  from public.tiptraq_nights
  where patient_id = sean_uuid;

  raise notice 'Sean UUID: %. TipTraQ nights: %', sean_uuid, sean_nights;
end $$;
