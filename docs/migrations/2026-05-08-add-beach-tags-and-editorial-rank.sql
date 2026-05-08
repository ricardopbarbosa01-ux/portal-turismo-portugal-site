-- Add tags and editorial_rank to beaches table
-- Migration: 2026-05-08
-- Purpose: Enable activity-based filtering ("IDEAL PARA") and editorial sort

BEGIN;

-- 1. Add tags column (text array)
ALTER TABLE beaches
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT ARRAY[]::text[];

COMMENT ON COLUMN beaches.tags IS
  'Activity tags for filtering. Allowed values: family, surf, fishing, wild_nature. Multi-value, single-select per category in UI.';

-- 2. Add editorial_rank column (integer, lower = higher priority)
ALTER TABLE beaches
  ADD COLUMN IF NOT EXISTS editorial_rank integer DEFAULT NULL;

COMMENT ON COLUMN beaches.editorial_rank IS
  'Editorial featured rank. Lower number = higher priority in "Destaque editorial" sort. NULL = unranked (sorted alphabetically after ranked).';

-- 3. GIN index for fast tag lookups
CREATE INDEX IF NOT EXISTS idx_beaches_tags
  ON beaches USING GIN (tags)
  WHERE is_active = true;

-- 4. B-tree index for editorial_rank ordering
CREATE INDEX IF NOT EXISTS idx_beaches_editorial_rank
  ON beaches (editorial_rank ASC NULLS LAST)
  WHERE is_active = true;

COMMIT;
