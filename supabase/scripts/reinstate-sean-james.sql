-- Reinstate Sean James: find account + TipTraQ nights, repair orphaned rows.
-- Run in Supabase SQL Editor with service-role context.

-- 1) Find auth user
select id, email, raw_user_meta_data->>'full_name' as full_name, created_at, deleted_at
from auth.users
where raw_user_meta_data->>'full_name' ilike '%Sean%James%'
   or email ilike '%sean%';

-- 2) Member + profile rows
select * from public.members where full_name ilike '%Sean%James%';
select * from public.profiles where full_name ilike '%Sean%James%';

-- 3) TipTraQ nights for Sean (paste UUID from step 1)
-- select id, patient_id, report_date, sleep_efficiency_pct, tst_minutes, created_at
-- from public.tiptraq_nights
-- where patient_id = 'PASTE_USER_UUID_HERE'
-- order by report_date desc;

-- 4) If nights exist under a different patient_id, re-link them:
-- update public.tiptraq_nights
-- set patient_id = 'CORRECT_USER_UUID'
-- where patient_id = 'ORPHAN_USER_UUID';

-- 5) If auth user was deleted but nights remain, recreate rows after re-inviting user:
-- insert into public.members (id, full_name, location_country)
-- values ('USER_UUID', 'Sean James', 'United Kingdom')
-- on conflict (id) do update set full_name = excluded.full_name;

-- insert into public.profiles (id, role, full_name)
-- values ('USER_UUID', 'patient', 'Sean James')
-- on conflict (id) do update set full_name = excluded.full_name;

-- insert into public.patient_profiles (id, location_country)
-- values ('USER_UUID', 'United Kingdom')
-- on conflict (id) do nothing;
