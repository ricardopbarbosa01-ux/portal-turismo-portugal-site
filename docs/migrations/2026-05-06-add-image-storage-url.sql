-- Migration: Add image_storage_url + metadata to beaches
-- Date: 2026-05-06
-- Purpose: Support fetch-and-store image system. Each beach gets a Supabase Storage URL
--          that replaces the volatile Unsplash URLs currently in image_url.
-- Rollback:
--   ALTER TABLE beaches DROP COLUMN image_storage_url;
--   ALTER TABLE beaches DROP COLUMN image_storage_url_webp;
--   ALTER TABLE beaches DROP COLUMN image_photographer;
--   ALTER TABLE beaches DROP COLUMN image_pexels_id;
--   ALTER TABLE beaches DROP COLUMN image_query_used;
--   ALTER TABLE beaches DROP COLUMN image_updated_at;

ALTER TABLE beaches
  ADD COLUMN IF NOT EXISTS image_storage_url      TEXT,
  ADD COLUMN IF NOT EXISTS image_storage_url_webp TEXT,
  ADD COLUMN IF NOT EXISTS image_photographer     TEXT,
  ADD COLUMN IF NOT EXISTS image_pexels_id        TEXT,
  ADD COLUMN IF NOT EXISTS image_query_used       TEXT,
  ADD COLUMN IF NOT EXISTS image_updated_at       TIMESTAMPTZ;

COMMENT ON COLUMN beaches.image_storage_url      IS 'Public URL from Supabase Storage card-images bucket (JPEG fallback). Replaces image_url at runtime.';
COMMENT ON COLUMN beaches.image_storage_url_webp IS 'Public URL for WebP version. Served via <picture> with JPEG fallback.';
COMMENT ON COLUMN beaches.image_photographer     IS 'Pexels photographer name for attribution (Pexels TOS requirement).';
COMMENT ON COLUMN beaches.image_pexels_id        IS 'Pexels photo ID for traceability and re-fetch.';
COMMENT ON COLUMN beaches.image_query_used       IS 'Query string sent to Pexels — useful to identify weak matches in audit.';
COMMENT ON COLUMN beaches.image_updated_at       IS 'When the image was last fetched/updated.';
