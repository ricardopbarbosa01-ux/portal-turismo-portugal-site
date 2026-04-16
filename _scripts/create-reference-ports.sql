-- create-reference-ports.sql
-- Fase B: Marés por porto de referência
-- Fonte de dados: Instituto Hidrográfico Portugal — almanaque anual (PDF/CSV)
-- Ingestão: manual uma vez por ano via _scripts/seed-tides-YYYY.js
-- Colar no SQL Editor do Supabase → Run
-- Sem deploy. Sem execução automática.

-- ── 1. Tabela de portos de referência ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reference_ports (
  id          text        PRIMARY KEY,          -- ex: 'CAS', 'FAR', 'SIN'
  name        text        NOT NULL,             -- ex: 'Cascais'
  latitude    numeric(9,6) NOT NULL,
  longitude   numeric(9,6) NOT NULL,
  ih_notes    text                              -- notas sobre a fonte/estação IH
);

-- Portos de referência para o litoral português continental + ilhas
INSERT INTO reference_ports (id, name, latitude, longitude, ih_notes) VALUES
  ('VAN', 'Viana do Castelo',  41.6917, -8.8333, 'IH almanaque — estação Viana do Castelo'),
  ('LEI', 'Leixões',           41.1832, -8.7027, 'IH almanaque — estação Leixões (Porto)'),
  ('AVE', 'Aveiro',            40.6440, -8.7580, 'IH almanaque — estação Aveiro/Barra'),
  ('FFZ', 'Figueira da Foz',   40.1417, -8.8783, 'IH almanaque — estação Figueira da Foz'),
  ('PEN', 'Peniche',           39.3553, -9.3800, 'IH almanaque — estação Peniche'),
  ('CAS', 'Cascais',           38.6970, -9.4220, 'IH almanaque — estação Cascais (referência Lisboa)'),
  ('SET', 'Setúbal',           38.5244, -8.8882, 'IH almanaque — estação Setúbal'),
  ('SIN', 'Sines',             37.9500, -8.8800, 'IH almanaque — estação Sines'),
  ('LAG', 'Lagos',             37.1020, -8.6730, 'IH almanaque — estação Lagos (Algarve barlavento)'),
  ('FAR', 'Faro',              37.0017, -7.9300, 'IH almanaque — estação Faro (Algarve sotavento)'),
  ('FUN', 'Funchal',           32.6400, -16.9100,'IH almanaque — estação Funchal (Madeira)'),
  ('PSA', 'Porto Santo',       33.0400, -16.3400,'IH almanaque — estação Porto Santo')
ON CONFLICT (id) DO NOTHING;

-- ── 2. Coluna na tabela beaches ───────────────────────────────────────────────
ALTER TABLE beaches
  ADD COLUMN IF NOT EXISTS reference_port_id text REFERENCES reference_ports(id);

-- ── 3. Mapeamento praias → porto de referência ────────────────────────────────
-- Norte → Leixões
UPDATE beaches SET reference_port_id = 'LEI'
WHERE region = 'Norte';

-- Centro: Aveiro e arredores → AVE
UPDATE beaches SET reference_port_id = 'AVE'
WHERE region = 'Centro'
  AND name IN (
    'Praia da Barra', 'Praia da Costa Nova', 'Praia da Torreira',
    'Praia da Vagueira', 'Praia da Murtinheira', 'Praia da Tocha'
  );

-- Centro: Figueira da Foz e arredores → FFZ
UPDATE beaches SET reference_port_id = 'FFZ'
WHERE region = 'Centro'
  AND name IN (
    'Praia da Figueira da Foz', 'Praia de Buarcos', 'Praia de Mira',
    'Praia da Vieira', 'Praia de S. Pedro de Moel', 'Praia do Pedrógão'
  );

-- Centro: Nazaré, São Martinho, Foz do Arelho → PEN
UPDATE beaches SET reference_port_id = 'PEN'
WHERE region = 'Centro'
  AND name IN (
    'Praia da Nazaré', 'Praia de São Martinho do Porto', 'Praia da Foz do Arelho',
    'Praia de Peniche', 'Praia da Areia Branca'
  );

-- Lisboa e Setúbal → Cascais
UPDATE beaches SET reference_port_id = 'CAS'
WHERE region = 'Lisboa e Setúbal';

-- Oeste (Estoril/Cascais/Caparica/Setúbal side) → CAS
UPDATE beaches SET reference_port_id = 'CAS'
WHERE region = 'Oeste'
  AND name IN (
    'Praia de Carcavelos', 'Praia de S. Pedro do Estoril', 'Praia do Guincho',
    'Portinho da Arrábida', 'Lagoa de Albufeira', 'Praia da Costa de Caparica',
    'Praia da Fonte da Telha', 'Praia do Meco'
  );

-- Oeste (Sintra/Ericeira side) → PEN
UPDATE beaches SET reference_port_id = 'PEN'
WHERE region = 'Oeste'
  AND name IN (
    'Praia das Maçãs', 'Praia Grande', 'Praia de Ericeira', 'Ribeira d''Ilhas'
  );

-- Alentejo (Tróia/Comporta) → SET
UPDATE beaches SET reference_port_id = 'SET'
WHERE region IN ('Alentejo', 'Lisboa e Setúbal')
  AND name IN ('Praia de Tróia', 'Praia do Carvalhal');

-- Alentejo (costa) → SIN
UPDATE beaches SET reference_port_id = 'SIN'
WHERE region = 'Alentejo'
  AND reference_port_id IS NULL;

-- Algarve sotavento (Faro, Culatra, Vilamoura, Falésia, Altura, Praia Verde) → FAR
UPDATE beaches SET reference_port_id = 'FAR'
WHERE region = 'Algarve'
  AND name IN (
    'Praia de Faro', 'Ilha da Culatra', 'Praia de Vilamoura',
    'Praia da Falésia', 'Praia da Galé', 'Praia do Peneco',
    'Praia de Armação de Pêra', 'Praia da Senhora da Rocha',
    'Praia da Altura', 'Praia Verde'
  );

-- Algarve barlavento (restante) → LAG
UPDATE beaches SET reference_port_id = 'LAG'
WHERE region = 'Algarve'
  AND reference_port_id IS NULL;

-- Madeira → FUN ou PSA
UPDATE beaches SET reference_port_id = 'FUN'
WHERE region = 'Madeira'
  AND name != 'Praia de Porto Santo';

UPDATE beaches SET reference_port_id = 'PSA'
WHERE name = 'Praia de Porto Santo';

-- ── 4. Verificar mapeamento ───────────────────────────────────────────────────
-- SELECT b.name, b.region, b.reference_port_id, p.name AS porto
-- FROM beaches b
-- LEFT JOIN reference_ports p ON p.id = b.reference_port_id
-- ORDER BY b.region, b.name;

-- Praias sem porto atribuído (devem ser 0):
-- SELECT name, region FROM beaches WHERE reference_port_id IS NULL;
