-- CRM lead metadata: operational state (status, priority, note) per lead
-- Paste this in Supabase Dashboard → SQL Editor and run, or: supabase db push

create table if not exists lead_meta (
  lead_id    text primary key,
  status     text not null default 'novo',
  priority   text not null default 'media',
  note       text not null default '',
  updated_at timestamptz default now()
);

alter table lead_meta enable row level security;

-- Authenticated users (CRM operators) can read and write all rows
create policy "crm_operators_all"
  on lead_meta for all
  to authenticated
  using (true)
  with check (true);
