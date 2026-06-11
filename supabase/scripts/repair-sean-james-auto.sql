-- PHOS Supabase repair only. Sean's live account + 3 nights are in DIOS.
-- Use repair-sean-james-dios.sql in the DIOS project first.
-- Run this only if you have already migrated nights into PHOS or re-uploaded here.

do $$
declare
  sean_uuid uuid;
  uploader_uuid uuid;
  sean_nights int;
begin
  select id into sean_uuid
  from auth.users
  where lower(email) = lower('s.james@tutamail.com')
     or coalesce(raw_user_meta_data->>'full_name', '') ilike '%Sean%James%'
  order by
    case when lower(email) = lower('s.james@tutamail.com') then 0 else 1 end,
    created_at desc
  limit 1;

  if sean_uuid is null then
    raise exception 'No Sean James auth user. Create account at /auth/signin with full name Sean James, then re-run.';
  end if;

  select count(*) into sean_nights
  from public.tiptraq_nights
  where patient_id = sean_uuid;

  if sean_nights >= 3 then
    raise notice 'Sean already owns % nights. UUID: %', sean_nights, sean_uuid;
    return;
  end if;

  select n.patient_id into uploader_uuid
  from public.tiptraq_nights n
  where n.patient_id <> sean_uuid
  group by n.patient_id
  having count(*) = 3
  order by max(n.created_at) desc
  limit 1;

  if uploader_uuid is null then
    raise exception 'No other patient_id with exactly 3 nights found. Sean UUID: %', sean_uuid;
  end if;

  raise notice 'Repairing: move 3 nights from % to Sean %', uploader_uuid, sean_uuid;

  update public.tiptraq_nights
  set patient_id = sean_uuid
  where patient_id = uploader_uuid;

  update public.mlux_profiles
  set patient_id = sean_uuid
  where patient_id = uploader_uuid
    and not exists (
      select 1 from public.mlux_profiles where patient_id = sean_uuid
    );

  delete from public.mlux_profiles
  where patient_id = uploader_uuid
    and exists (
      select 1 from public.mlux_profiles where patient_id = sean_uuid
    );

  insert into public.profiles (id, role, full_name)
  values (sean_uuid, 'patient', 'Sean James')
  on conflict (id) do update set full_name = excluded.full_name;

  insert into public.patient_profiles (id, date_of_birth, location_city, location_country)
  values (sean_uuid, '1978-07-17', 'Auckland', 'New Zealand')
  on conflict (id) do update
  set date_of_birth = excluded.date_of_birth,
      location_city = excluded.location_city,
      location_country = excluded.location_country;

  insert into public.members (id, full_name, date_of_birth, location_city, location_country)
  values (sean_uuid, 'Sean James', '1978-07-17', 'Auckland', 'New Zealand')
  on conflict (id) do update
  set full_name = excluded.full_name,
      date_of_birth = excluded.date_of_birth,
      location_city = excluded.location_city,
      location_country = excluded.location_country;

  raise notice 'Done. Sean UUID: %. Nights now: %', sean_uuid, (
    select count(*) from public.tiptraq_nights where patient_id = sean_uuid
  );
end $$;

-- Verify
select
  u.id as sean_uuid,
  u.email,
  p.full_name,
  (select count(*) from public.tiptraq_nights n where n.patient_id = u.id) as nights_count
from auth.users u
left join public.profiles p on p.id = u.id
where coalesce(u.raw_user_meta_data->>'full_name', '') ilike '%Sean%James%'
   or u.email ilike '%sean%james%'
order by u.created_at desc
limit 1;
