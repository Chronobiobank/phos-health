-- Sean James account + 3 TipTraQ nights live in DIOS Supabase (dios-health).
-- Email: s.james@tutamail.com — use repair-sean-james-dios.sql first.
-- PHOS is a separate project; run this file only in PHOS after migration.

-- ── 1) DIAGNOSTIC: find Sean's auth account ──────────────────────────────────
select id, email, raw_user_meta_data->>'full_name' as full_name, created_at, deleted_at
from auth.users
where raw_user_meta_data->>'full_name' ilike '%Sean%James%'
   or email ilike '%sean%james%'
   or email ilike '%sean%'
order by created_at desc;

-- ── 2) DIAGNOSTIC: profile + member rows ─────────────────────────────────────
select p.id, p.full_name, p.role, pp.date_of_birth, pp.location_country
from public.profiles p
left join public.patient_profiles pp on pp.id = p.id
where p.full_name ilike '%Sean%James%';

select m.id, m.full_name, m.date_of_birth, m.location_country
from public.members m
where m.full_name ilike '%Sean%James%';

-- ── 3) DIAGNOSTIC: who has exactly 3 TipTraQ nights? (likely upload target) ──
select
  n.patient_id,
  u.email,
  p.full_name,
  count(*) as nights_count,
  min(n.report_date) as first_night,
  max(n.report_date) as last_night
from public.tiptraq_nights n
left join auth.users u on u.id = n.patient_id
left join public.profiles p on p.id = n.patient_id
group by n.patient_id, u.email, p.full_name
having count(*) = 3
order by max(n.created_at) desc;

-- ── 4) DIAGNOSTIC: all TipTraQ night counts (find misplaced uploads) ───────
select
  n.patient_id,
  u.email,
  p.full_name,
  count(*) as nights_count
from public.tiptraq_nights n
left join auth.users u on u.id = n.patient_id
left join public.profiles p on p.id = n.patient_id
group by n.patient_id, u.email, p.full_name
order by count(*) desc;

-- ── 5) REPAIR: set these two UUIDs from steps 1 and 3, then uncomment ────────
-- SEAN_USER_UUID     = Sean's auth.users.id (step 1)
-- UPLOADER_USER_UUID = patient_id with 3 nights if not Sean (step 3)

-- begin;

-- -- Re-link nights from uploader account to Sean
-- update public.tiptraq_nights
-- set patient_id = 'SEAN_USER_UUID'
-- where patient_id = 'UPLOADER_USER_UUID';

-- -- Move mlux profile if it exists on uploader
-- update public.mlux_profiles
-- set patient_id = 'SEAN_USER_UUID'
-- where patient_id = 'UPLOADER_USER_UUID'
--   and not exists (
--     select 1 from public.mlux_profiles where patient_id = 'SEAN_USER_UUID'
--   );

-- delete from public.mlux_profiles
-- where patient_id = 'UPLOADER_USER_UUID'
--   and exists (
--     select 1 from public.mlux_profiles where patient_id = 'SEAN_USER_UUID'
--   );

-- -- Ensure Sean has profile rows (safe if auth user exists)
-- insert into public.profiles (id, role, full_name)
-- values ('SEAN_USER_UUID', 'patient', 'Sean James')
-- on conflict (id) do update set full_name = excluded.full_name;

-- insert into public.patient_profiles (id, date_of_birth, location_city, location_country)
-- values ('SEAN_USER_UUID', '1978-07-17', 'Auckland', 'New Zealand')
-- on conflict (id) do update
-- set date_of_birth = excluded.date_of_birth,
--     location_city = excluded.location_city,
--     location_country = excluded.location_country;

-- insert into public.members (id, full_name, date_of_birth, location_city, location_country)
-- values ('SEAN_USER_UUID', 'Sean James', '1978-07-17', 'Auckland', 'New Zealand')
-- on conflict (id) do update
-- set full_name = excluded.full_name,
--     date_of_birth = excluded.date_of_birth,
--     location_city = excluded.location_city,
--     location_country = excluded.location_country;

-- -- Verify
-- select id, patient_id, report_date, sleep_efficiency_pct, tst_minutes
-- from public.tiptraq_nights
-- where patient_id = 'SEAN_USER_UUID'
-- order by report_date desc;

-- select * from public.mlux_profiles where patient_id = 'SEAN_USER_UUID';

-- commit;
