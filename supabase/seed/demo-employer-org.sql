-- Demo employer org (run in Supabase SQL Editor after migrations 002–005)
-- Replace EMPLOYER_USER_UUID with your signed-in employer account auth.users id.

insert into public.organisations (id, name, slug)
values (
  '11111111-1111-4111-8111-111111111111',
  'Northbridge Partners',
  'northbridge-partners'
)
on conflict (slug) do update set name = excluded.name;

insert into public.org_invite_codes (organisation_id, code, active)
values (
  '11111111-1111-4111-8111-111111111111',
  'NORTHBRIDGE-2026',
  true
)
on conflict (code) do nothing;

-- Employer admin membership (set member_id to your user UUID):
-- insert into public.organisation_memberships (organisation_id, member_id, role)
-- values ('11111111-1111-4111-8111-111111111111', 'EMPLOYER_USER_UUID', 'admin')
-- on conflict (organisation_id, member_id) do nothing;
