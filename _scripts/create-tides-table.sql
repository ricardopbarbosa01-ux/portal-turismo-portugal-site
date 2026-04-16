-- create-tides-table.sql
-- Colar no SQL Editor do Supabase → Run
-- Cria tabela tides compatível com o loadTides() já existente em beach.html
-- Fonte de dados: IH Portugal almanaque anual → seed-tides-YYYY.js
-- Sem deploy. Sem execução automática.

-- ── 1. Tabela principal ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tides (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  beach_id   uuid        NOT NULL REFERENCES beaches(id) ON DELETE CASCADE,
  date       date        NOT NULL,
  time       time        NOT NULL,           -- ex: '14:32:00'
  height_m   numeric(5,2) NOT NULL,          -- ex: 3.42
  type       text        NOT NULL CHECK (type IN ('high', 'low')),
  source     text        NOT NULL DEFAULT 'ih-portugal',
  fetched_at timestamptz NOT NULL DEFAULT now(),

  UNIQUE (beach_id, date, time)
);

-- ── 2. Índices ────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS tides_beach_date_idx ON tides (beach_id, date);

-- ── 3. Row Level Security ─────────────────────────────────────────────────────
ALTER TABLE tides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tides_public_read"
  ON tides FOR SELECT USING (true);

CREATE POLICY "tides_service_write"
  ON tides FOR ALL USING (auth.role() = 'service_role');

-- ── 4. Verificação ────────────────────────────────────────────────────────────
-- SELECT table_name FROM information_schema.tables WHERE table_name = 'tides';
-- SELECT COUNT(*) FROM tides;  -- após seed: esperado ~120k linhas/ano
