/**
 * translate-beaches-poc.mjs
 * POC: populate i18n JSONB for 5 beaches (PT→EN, Claude-translated in-context).
 * Reuse for remaining beaches: remove LIMIT and adjust TRANSLATIONS map.
 * Depends on: .env (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Load .env from project root ────────────────────────────────────────────────
function loadEnv() {
  const envPath = resolve(__dirname, '../.env');
  const raw = readFileSync(envPath, 'utf8');
  raw.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eq = trimmed.indexOf('=');
    if (eq < 0) return;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  });
}

loadEnv();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('FATAL: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing from .env');
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ── Claude-translated content (in-context, May 2026) ──────────────────────────
// Keys are beach UUIDs. water_quality and beach_type use consistent enum mappings.
// facilities: translated item-by-item (all empty arrays in this batch).
const TRANSLATIONS = {
  'a0529d77-b688-4293-ba11-8f023a69e4cf': { // Praia da Ursa, rank 1
    description_en: 'A wild beach nestled between vertical cliffs west of Sintra, at the westernmost point of continental Europe. Access is via a steep footpath, roughly a 45-minute walk. No facilities, no lifeguard, no crowds — just the Atlantic, dark sand and dramatic rock formations, including the iconic bear-shaped rock that gives the beach its name. Suited for prepared visitors, photography and contemplation. Not recommended for children, the elderly, or on rainy days.',
    beach_type_en: null,
    water_quality_en: 'Good',
    facilities_en: [],
  },
  'a6625ef3-a4ad-4e38-b74e-856ffc9fa724': { // Praia da Arrifana, rank 2
    description_en: 'Tucked into a rocky cove sheltered by dark cliffs and steep profiles, Praia da Arrifana is part of the wild coastline of Costa Vicentina. Water quality is Good, and the beach has a surf character — Atlantic conditions are frequent and attract surfers for much of the year. Access descends to the sand via a path cut into the cliff, gradually revealing the Atlantic. A human-scale beach, without the crowds of the better-known Algarve beaches nearby.',
    beach_type_en: null,
    water_quality_en: 'Good',
    facilities_en: [],
  },
  'c627b1c9-8467-4729-aa26-15fb6e86e6af': { // Praia de Odeceixe, rank 3
    description_en: 'Praia de Odeceixe is one of the most unusual stretches of the Portuguese coast — the Seixe stream separates the riverside beach from the ocean strand, creating two distinct environments in a single space: fresh water and Atlantic water, calm currents and open swell. Water quality is Good. The beach sits on the border between Alentejo and the Algarve, within the Parque Natural do Sudoeste Alentejano e Costa Vicentina. The sand is sheltered by the surrounding hills, which reduce wind impact and create a valley-by-the-sea atmosphere.',
    beach_type_en: null,
    water_quality_en: 'Good',
    facilities_en: [],
  },
  '37ac39ea-0a07-480a-9147-5aed9a9ae388': { // Praia da Bordeira, rank 4
    description_en: 'A vast beach at the mouth of the Rio Bordeira, near Carrapateira. Extensive dunes, a calm stream and almost always uncrowded.',
    beach_type_en: null,
    water_quality_en: 'Good',
    facilities_en: [],
  },
  '4c907c07-8bbd-4c37-90f2-8f9e2696f5a0': { // Praia da Nazaré, rank 5
    description_en: "Praia da Nazaré has two distinct faces: the town beach, long and lively, with the seafront of one of Portugal's best-known fishing towns; and Praia do Norte, a few minutes away, where giant waves between October and February make Nazaré the world epicentre of big-wave surfing. Outside winter, the main beach is a family-friendly stretch with beach support and the historic town immediately behind. The historic funicular climbs to the Sítio — the old hilltop neighbourhood with panoramic views over the ocean.",
    beach_type_en: null,
    water_quality_en: 'Good',
    facilities_en: [],
  },
};

// ── Sanity-check translated strings ───────────────────────────────────────────
function isSuspect(value) {
  if (value === null || value === undefined) return false; // null is valid for nullable fields
  if (typeof value === 'string') {
    return value.trim() === '' || value === 'undefined' || value === '[object Object]';
  }
  if (Array.isArray(value)) {
    return value.some(isSuspect);
  }
  return false;
}

// ── Main ───────────────────────────────────────────────────────────────────────
const startTime = Date.now();

console.log('=== translate-beaches-poc.mjs ===');
console.log(`Supabase URL: ${SUPABASE_URL}`);
console.log('');

// 1. Fetch 5 target beaches (WHERE i18n = '{}', ORDER BY editorial_rank, name)
console.log('STEP 1: Fetching 5 beaches with empty i18n...');
const { data: beaches, error: fetchError } = await sb
  .from('beaches')
  .select('id, name, description, beach_type, water_quality, facilities, editorial_rank')
  .filter('i18n', 'eq', '{}')
  .order('editorial_rank', { ascending: true, nullsFirst: false })
  .order('name', { ascending: true })
  .limit(5);

if (fetchError) {
  console.error('FATAL: fetch failed —', fetchError.message);
  process.exit(1);
}

console.log(`Fetched ${beaches.length} beaches:`);
beaches.forEach(b => console.log(`  [rank ${b.editorial_rank ?? 'null'}] ${b.id} — ${b.name}`));
console.log('');

// 2. UPDATE each beach
console.log('STEP 2: Writing i18n translations...');
let success = 0;
let failed = 0;

for (const beach of beaches) {
  const tr = TRANSLATIONS[beach.id];
  if (!tr) {
    console.error(`  SKIP ${beach.name}: no translation entry for ID ${beach.id}`);
    failed++;
    continue;
  }

  // Sanity-check before writing
  const suspects = [tr.description_en, tr.water_quality_en, ...tr.facilities_en];
  if (suspects.some(isSuspect)) {
    console.error(`  ABORT ${beach.name}: suspect value detected in translation — skipping UPDATE`);
    failed++;
    continue;
  }

  const i18n = {
    description: { pt: beach.description, en: tr.description_en },
    beach_type: { pt: beach.beach_type, en: tr.beach_type_en },
    water_quality: { pt: beach.water_quality, en: tr.water_quality_en },
    facilities: { pt: beach.facilities ?? [], en: tr.facilities_en },
  };

  const { error: updateError } = await sb
    .from('beaches')
    .update({ i18n })
    .eq('id', beach.id);

  if (updateError) {
    console.error(`  FAIL  ${beach.name}: ${updateError.message}`);
    failed++;
  } else {
    console.log(`  OK    ${beach.name}`);
    success++;
  }
}

console.log('');

// 3. Validation query
console.log('STEP 3: Validation — reading back i18n->description->en...');
const { data: validation, error: valError } = await sb
  .from('beaches')
  .select('name, editorial_rank, i18n')
  .filter('i18n', 'neq', '{}')
  .order('editorial_rank', { ascending: true, nullsFirst: false })
  .limit(5);

if (valError) {
  console.error('Validation query failed:', valError.message);
} else {
  console.log('');
  console.log('name                      | editorial_rank | description (EN, first 80 chars)');
  console.log('--------------------------|----------------|----------------------------------');
  for (const row of validation) {
    const descEn = (row.i18n?.description?.en ?? '').slice(0, 80);
    const name = row.name.padEnd(25);
    const rank = String(row.editorial_rank ?? 'null').padEnd(14);
    console.log(`${name} | ${rank} | ${descEn}`);
  }
}

// 4. Summary
const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
console.log('');
console.log(`=== SUMMARY ===`);
console.log(`${success}/${beaches.length} traduzidas com sucesso`);
if (failed > 0) console.log(`${failed}/${beaches.length} falharam — ver erros acima`);
console.log(`Tempo total: ${elapsed}s`);
