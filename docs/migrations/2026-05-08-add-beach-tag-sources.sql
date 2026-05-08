-- Add tag_sources audit trail column to beaches table
-- Migration: 2026-05-08
-- Purpose: Traceability for each tag assigned — which official source confirms it

BEGIN;

ALTER TABLE beaches
  ADD COLUMN IF NOT EXISTS tag_sources jsonb DEFAULT '{}'::jsonb;

COMMENT ON COLUMN beaches.tag_sources IS
  'Audit trail for tags. Format: { "surf": ["WSL/FPS/Surftotal"], "fishing": ["DGRM/FPPD"], "family": ["ABAE Bandeira Azul 2025"], "wild_nature": ["ICNF Áreas Protegidas"] }';

COMMIT;
