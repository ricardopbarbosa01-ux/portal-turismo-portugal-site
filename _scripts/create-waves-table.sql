-- create-waves-table.sql  [FASE B — não executar ainda]
-- Tabela para estado do mar via Open-Meteo Marine (gratuito)
-- Colar no SQL Editor do Supabase → Run apenas quando iniciar Fase B

CREATE TABLE IF NOT EXISTS waves (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  beach_id        uuid        NOT NULL REFERENCES beaches(id) ON DELETE CASCADE,
  datetime        timestamptz NOT NULL,
  wave_height_m   numeric(4,2),    -- altura significativa (m)
  wave_period_s   numeric(5,2),    -- período médio (s)
  wave_direction  smallint,        -- direção em graus (0-360)
  swell_height_m  numeric(4,2),    -- altura de swell (m)
  source          text        NOT NULL DEFAULT 'open-meteo-marine',
  fetched_at      timestamptz NOT NULL DEFAULT now(),

  UNIQUE (beach_id, datetime)
);

CREATE INDEX IF NOT EXISTS waves_beach_dt_idx ON waves (beach_id, datetime);

ALTER TABLE waves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "waves_public_read"
  ON waves FOR SELECT USING (true);

CREATE POLICY "waves_service_write"
  ON waves FOR ALL USING (auth.role() = 'service_role');
