/**
 * seed-tides-YYYY.js — ingestão anual de marés por porto de referência
 *
 * FONTE: Instituto Hidrográfico Portugal
 *   Almanaque de Marés: https://www.hidrografico.pt/almanaque-mares
 *   Formato disponível: PDF + ficheiros CSV/TXT por porto e ano
 *
 * COMO OBTER OS DADOS:
 *   1. Aceder a hidrografico.pt > Produtos > Almanaque de Marés
 *   2. Descarregar o ficheiro de dados para cada porto de referência
 *   3. Colocar os ficheiros CSV em _data/tides-YYYY/<porto>.csv
 *   4. Executar este script: node _scripts/seed-tides-YYYY.js
 *
 * FORMATO CSV ESPERADO (baseado no almanaque IH):
 *   date,time,height_m,type
 *   2025-01-01,03:12,3.45,high
 *   2025-01-01,09:34,0.82,low
 *   2025-01-01,15:48,3.21,high
 *   2025-01-01,22:01,0.91,low
 *
 * CUSTO: zero — dados públicos do IH, script local, sem API.
 * FREQUÊNCIA: uma vez por ano (Jan/Fev quando o almanaque é publicado).
 *
 * Sem deploy. Sem execução automática.
 */

import { readFileSync, readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://glupdjvdvunogkqgxoui.supabase.co';
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_KEY;   // nunca commitar

if (!SERVICE_KEY) {
  console.error('[ERRO] SUPABASE_SERVICE_KEY não definido.');
  console.error('  Uso: SUPABASE_SERVICE_KEY=<key> node _scripts/seed-tides-YYYY.js');
  process.exit(1);
}

const db = createClient(SUPABASE_URL, SERVICE_KEY);

// Portos de referência e os seus IDs no Supabase
const PORTS = ['VAN','LEI','AVE','FFZ','PEN','CAS','SET','SIN','LAG','FAR','FUN','PSA'];

// Directoria com os CSVs: _data/tides-2026/CAS.csv, FAR.csv, etc.
const DATA_DIR = fileURLToPath(new URL(`../_data/tides-${new Date().getFullYear()}`, import.meta.url));

function parseCsv(csvText) {
  const lines = csvText.trim().split('\n').slice(1); // skip header
  return lines.map(line => {
    const [date, time, height_m, type] = line.split(',').map(s => s.trim());
    return { date, time: time + ':00', height_m: parseFloat(height_m), type };
  }).filter(r => r.date && r.time && !isNaN(r.height_m) && (r.type === 'high' || r.type === 'low'));
}

async function seedPort(portId) {
  // 1. Ler CSV do porto
  let csvText;
  try {
    csvText = readFileSync(`${DATA_DIR}/${portId}.csv`, 'utf8');
  } catch {
    console.warn(`[SKIP] ${portId} — CSV não encontrado em ${DATA_DIR}/${portId}.csv`);
    return { portId, skipped: true };
  }

  const portRows = parseCsv(csvText);
  if (!portRows.length) {
    console.warn(`[SKIP] ${portId} — CSV vazio ou formato inválido`);
    return { portId, skipped: true };
  }

  // 2. Buscar IDs das praias associadas a este porto
  const { data: beaches, error: bErr } = await db
    .from('beaches')
    .select('id, name')
    .eq('reference_port_id', portId);

  if (bErr) {
    console.error(`[ERRO] ${portId} — Supabase: ${bErr.message}`);
    return { portId, skipped: true };
  }
  if (!beaches?.length) {
    console.warn(`[SKIP] ${portId} — sem praias associadas`);
    return { portId, skipped: true };
  }

  console.log(`[${portId}] ${beaches.length} praias | ${portRows.length} marés`);

  // 3. Expandir: cada linha de maré → uma linha por praia deste porto
  const rows = [];
  for (const beach of beaches) {
    for (const tide of portRows) {
      rows.push({
        beach_id:   beach.id,
        date:       tide.date,
        time:       tide.time,
        height:     tide.height_m,
        height_m:   tide.height_m,
        type:       tide.type,
        source:     `ih-${portId.toLowerCase()}`,
        fetched_at: new Date().toISOString(),
      });
    }
  }

  // 4. Upsert em lotes de 500
  let inserted = 0;
  const BATCH = 500;
  for (let i = 0; i < rows.length; i += BATCH) {
    const chunk = rows.slice(i, i + BATCH);
    const { error } = await db
      .from('tides')
      .upsert(chunk, { onConflict: 'beach_id,date,time', ignoreDuplicates: true });
    if (error) { console.error(`[ERRO] ${portId} lote ${i}: ${error.message}`); break; }
    inserted += chunk.length;
  }

  console.log(`[OK] ${portId} → ${inserted} linhas inseridas`);
  return { portId, beaches: beaches.length, tideRows: portRows.length, inserted };
}

// ── Main ──────────────────────────────────────────────────────────────────────
console.log(`\n=== seed-tides ${new Date().getFullYear()} ===`);
console.log(`Directoria de dados: ${DATA_DIR}\n`);

const results = [];
for (const port of PORTS) {
  results.push(await seedPort(port));
}

console.log('\n=== Resumo ===');
results.forEach(r => {
  if (r.skipped) console.log(`  SKIP  ${r.portId}`);
  else console.log(`  OK    ${r.portId}  beaches=${r.beaches}  tides=${r.tideRows}  inserted=${r.inserted}`);
});
