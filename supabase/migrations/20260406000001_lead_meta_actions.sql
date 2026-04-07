-- Add follow-up tracking fields to lead_meta
alter table lead_meta
  add column if not exists last_action  text,
  add column if not exists contacted_at timestamptz;
