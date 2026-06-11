-- Demo kits for local shop + webhook testing (run in Supabase SQL Editor)
insert into public.kits (serial, kit_type, status)
values
  ('TQ-DEMO-001', 'tiptraq', 'inventory'),
  ('TQ-DEMO-002', 'tiptraq', 'inventory'),
  ('PL-DEMO-001', 'panel', 'inventory'),
  ('PL-DEMO-002', 'panel', 'inventory')
on conflict (serial) do nothing;
