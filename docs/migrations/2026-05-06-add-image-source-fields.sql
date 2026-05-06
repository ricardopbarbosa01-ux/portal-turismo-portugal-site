-- Adds source/license tracking for multi-source image system (Wikipedia, Wikimedia, Pexels)
-- Date: 2026-05-06
-- Rollback:
--   ALTER TABLE beaches DROP COLUMN image_source;
--   ALTER TABLE beaches DROP COLUMN image_license;
--   ALTER TABLE beaches DROP COLUMN image_source_url;

ALTER TABLE beaches
  ADD COLUMN IF NOT EXISTS image_source     TEXT,
  ADD COLUMN IF NOT EXISTS image_license    TEXT,
  ADD COLUMN IF NOT EXISTS image_source_url TEXT;

COMMENT ON COLUMN beaches.image_source     IS 'Origin of image: wikipedia_infobox | wikimedia_geo | wikimedia_text | pexels';
COMMENT ON COLUMN beaches.image_license    IS 'License of image (e.g., CC BY-SA 3.0). Required for attribution display.';
COMMENT ON COLUMN beaches.image_source_url IS 'URL to original source page (Wikipedia article, Wikimedia file page, Pexels photo page).';
