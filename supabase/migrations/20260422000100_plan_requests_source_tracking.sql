-- Adicionar colunas de source tracking ao plan_requests
-- Todas nullable, todas text (frontend envia strings)

alter table public.plan_requests
  add column if not exists source_page text,
  add column if not exists source_beach text,
  add column if not exists source_region text,
  add column if not exists source_partner_type text,
  add column if not exists source_partner_name text,
  add column if not exists source_vertical text,
  add column if not exists intent_type text,
  add column if not exists page_url text;

-- Index para analytics futuros (filter por source_page)
create index if not exists idx_plan_requests_source_page
  on public.plan_requests(source_page);

create index if not exists idx_plan_requests_created_at
  on public.plan_requests(created_at desc);
