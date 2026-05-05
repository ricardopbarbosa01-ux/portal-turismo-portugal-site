-- Migration: add image_cache table for Pexels auto-fallback (BUG-IMG-AUTOFIX)
-- Run manually in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/glupdjvdvunogkqgxoui/sql/new

CREATE TABLE IF NOT EXISTS image_cache (
  query        TEXT PRIMARY KEY,
  url          TEXT NOT NULL,
  photographer TEXT,
  source       TEXT DEFAULT 'pexels',
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  expires_at   TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_image_cache_expires ON image_cache(expires_at);

-- RLS: service_role has full access (used by Edge Function)
-- anon role has NO access — client never reads this table directly
ALTER TABLE image_cache ENABLE ROW LEVEL SECURITY;

-- No policies created = anon/authenticated have zero access by default
-- Edge Function uses service_role key which bypasses RLS
