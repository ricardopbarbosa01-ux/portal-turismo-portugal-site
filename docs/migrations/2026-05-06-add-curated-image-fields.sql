-- Adds manual curation fields for hybrid image system.
-- Date: 2026-05-06
-- Purpose: Allow Ricardo to manually curate beach images via Supabase Table Editor
--          when automatic sources (Wikipedia/Pexels) fail to provide quality results.
-- Rollback:
--   ALTER TABLE beaches DROP COLUMN image_curated_url;
--   ALTER TABLE beaches DROP COLUMN image_curated_author;
--   ALTER TABLE beaches DROP COLUMN image_curated_source_url;

ALTER TABLE beaches
  ADD COLUMN IF NOT EXISTS image_curated_url        TEXT,
  ADD COLUMN IF NOT EXISTS image_curated_author     TEXT,
  ADD COLUMN IF NOT EXISTS image_curated_source_url TEXT;

COMMENT ON COLUMN beaches.image_curated_url        IS 'Manual override: public URL of image chosen by editor. Wins over Wikipedia/Pexels.';
COMMENT ON COLUMN beaches.image_curated_author     IS 'Author/photographer for manual override (attribution requirement for CC BY licenses).';
COMMENT ON COLUMN beaches.image_curated_source_url IS 'Source page URL for manual override (e.g. Wikimedia File page, Pexels photo page).';
