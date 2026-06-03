/**
 * fetch-beaches-for-translation.mjs
 * Dumps all beaches with empty i18n to stdout as JSON for translation work.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

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

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const { data: beaches, error } = await sb
  .from('beaches')
  .select('id, name, description, beach_type, water_quality, facilities, editorial_rank, region, town, subregion')
  .filter('i18n', 'eq', '{}')
  .order('editorial_rank', { ascending: true, nullsFirst: false })
  .order('name', { ascending: true });

if (error) { console.error('FATAL:', error.message); process.exit(1); }

console.log(`Total beaches to translate: ${beaches.length}`);
console.log('');
console.log(JSON.stringify(beaches, null, 2));
