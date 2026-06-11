-- Protocol supplement SKUs: email fulfilment without kit binding

alter table public.order_items drop constraint if exists order_items_kit_type_check;

alter table public.order_items
  add constraint order_items_kit_type_check
  check (kit_type in ('panel', 'tiptraq', 'supplement'));

notify pgrst, 'reload schema';
