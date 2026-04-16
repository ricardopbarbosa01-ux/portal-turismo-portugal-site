#!/usr/bin/env node
/**
 * validate-beaches-data.js
 * Validates data/beaches-master.json against schema rules.
 * Run: node _scripts/validate-beaches-data.js
 */

import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const FILE = path.join(__dirname, '..', 'data', 'beaches-master.json');

// ── Valid enum values ────────────────────────────────────────────────────────
const VALID_STATUS        = new Set(['live', 'draft', 'missing-data']);
const VALID_WATER_QUALITY = new Set(['Excelente', 'Boa', 'Suficiente', 'Má']);
const VALID_REGIONS       = new Set(['Alentejo', 'Algarve', 'Açores', 'Centro', 'Lisboa e Setúbal', 'Madeira', 'Norte', 'Oeste']);
const VALID_BEACH_TYPE    = new Set(['sandy', 'cove', 'urban', 'wild', 'surf', 'river-mouth', 'natural-reserve', 'volcanic']);
const VALID_ACCESS        = new Set(['easy-flat', 'wooden-staircase', 'cliff-path', 'sandy-path', 'boat-only', 'car-direct']);
const VALID_PARKING       = new Set(['free-onsite', 'paid-onsite', 'nearby-free', 'nearby-paid', 'limited', 'none']);
const UUID_RE             = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SLUG_RE             = /^[a-z0-9-]+$/;
const DATE_RE             = /^\d{4}-\d{2}-\d{2}$/;

// ── Required string fields ───────────────────────────────────────────────────
const REQUIRED_STRING = [
  'slug', 'supabase_id', 'status', 'last_updated',
  'name_pt', 'name_en', 'region', 'subregion',
  'beach_type', 'water_quality', 'access', 'parking',
  'description_pt', 'description_en', 'booking_region_hint'
];

// ── Required boolean fields ──────────────────────────────────────────────────
const REQUIRED_BOOL = ['family_friendly', 'surf', 'fishing', 'lifeguard', 'disabled_access', 'webcam_available'];

// ── Required array fields ────────────────────────────────────────────────────
const REQUIRED_ARRAY = ['ideal_for', 'facilities', 'related_pages_pt', 'related_pages_en'];

// ── Required numeric fields ──────────────────────────────────────────────────
const REQUIRED_NUM = ['latitude', 'longitude'];

// ── Run validation ───────────────────────────────────────────────────────────
let errors   = 0;
let warnings = 0;

function err(slug, msg)  { console.error(`  ❌ [${slug}] ${msg}`); errors++;   }
function warn(slug, msg) { console.warn (`  ⚠️  [${slug}] ${msg}`); warnings++; }

try {
  if (!fs.existsSync(FILE)) {
    console.error(`File not found: ${FILE}`);
    process.exit(1);
  }

  const raw  = fs.readFileSync(FILE, 'utf8');
  const data = JSON.parse(raw);

  if (!Array.isArray(data.beaches)) {
    console.error('beaches-master.json must have a top-level "beaches" array.');
    process.exit(1);
  }

  const beaches = data.beaches;
  console.log(`\n🏖  Validating ${beaches.length} beach entries...\n`);

  const seenSlugs = new Map();
  const seenIds   = new Map();

  for (const b of beaches) {
    const slug = b.slug || '(no-slug)';

    // ── Duplicate slug ───────────────────────────────────────────────────────
    if (seenSlugs.has(slug)) {
      err(slug, `Duplicate slug — also used by "${seenSlugs.get(slug)}"`);
    } else {
      seenSlugs.set(slug, slug);
    }

    // ── Duplicate supabase_id ────────────────────────────────────────────────
    if (b.supabase_id && seenIds.has(b.supabase_id)) {
      err(slug, `Duplicate supabase_id "${b.supabase_id}" — also used by "${seenIds.get(b.supabase_id)}"`);
    } else if (b.supabase_id) {
      seenIds.set(b.supabase_id, slug);
    }

    // ── Slug format ──────────────────────────────────────────────────────────
    if (!SLUG_RE.test(slug)) {
      err(slug, `Invalid slug format — use lowercase kebab-case, no accents`);
    }

    // ── UUID format ──────────────────────────────────────────────────────────
    if (!b.supabase_id || !UUID_RE.test(b.supabase_id)) {
      err(slug, `Missing or invalid supabase_id — must be a UUID`);
    }

    // ── Date format ──────────────────────────────────────────────────────────
    if (!b.last_updated || !DATE_RE.test(b.last_updated)) {
      err(slug, `Invalid last_updated — must be YYYY-MM-DD`);
    }

    // ── Required string fields ───────────────────────────────────────────────
    for (const f of REQUIRED_STRING) {
      if (!b[f] || typeof b[f] !== 'string' || b[f].trim() === '') {
        err(slug, `Missing or empty required field: "${f}"`);
      }
    }

    // ── Enum validations ─────────────────────────────────────────────────────
    if (b.status && !VALID_STATUS.has(b.status)) {
      err(slug, `Invalid status "${b.status}" — must be one of: ${[...VALID_STATUS].join(', ')}`);
    }
    if (b.water_quality && !VALID_WATER_QUALITY.has(b.water_quality)) {
      err(slug, `Invalid water_quality "${b.water_quality}"`);
    }
    if (b.region && !VALID_REGIONS.has(b.region)) {
      err(slug, `Invalid region "${b.region}" — must match Supabase exactly`);
    }
    if (b.beach_type && !VALID_BEACH_TYPE.has(b.beach_type)) {
      err(slug, `Invalid beach_type "${b.beach_type}"`);
    }
    if (b.access && !VALID_ACCESS.has(b.access)) {
      err(slug, `Invalid access "${b.access}"`);
    }
    if (b.parking && !VALID_PARKING.has(b.parking)) {
      err(slug, `Invalid parking "${b.parking}"`);
    }

    // ── Required booleans ────────────────────────────────────────────────────
    for (const f of REQUIRED_BOOL) {
      if (typeof b[f] !== 'boolean') {
        err(slug, `Field "${f}" must be a boolean (true/false), got: ${JSON.stringify(b[f])}`);
      }
    }

    // ── Required arrays ──────────────────────────────────────────────────────
    for (const f of REQUIRED_ARRAY) {
      if (!Array.isArray(b[f])) {
        err(slug, `Field "${f}" must be an array`);
      }
    }

    // ── ideal_for must not be empty ──────────────────────────────────────────
    if (Array.isArray(b.ideal_for) && b.ideal_for.length === 0) {
      warn(slug, `"ideal_for" is empty — add at least one use-case`);
    }

    // ── related_pages_pt/en must not be empty ────────────────────────────────
    if (Array.isArray(b.related_pages_pt) && b.related_pages_pt.length === 0) {
      warn(slug, `"related_pages_pt" is empty — beach has no PT internal links`);
    }
    if (Array.isArray(b.related_pages_en) && b.related_pages_en.length === 0) {
      warn(slug, `"related_pages_en" is empty — beach has no EN internal links`);
    }

    // ── Required numerics + geo bounds ───────────────────────────────────────
    for (const f of REQUIRED_NUM) {
      if (typeof b[f] !== 'number') {
        err(slug, `Field "${f}" must be a number, got: ${JSON.stringify(b[f])}`);
      }
    }
    if (typeof b.latitude === 'number' && (b.latitude < 29 || b.latitude > 43)) {
      warn(slug, `Suspicious latitude ${b.latitude} — Portugal is roughly 29–43°N`);
    }
    if (typeof b.longitude === 'number' && (b.longitude < -10 || b.longitude > -6)) {
      warn(slug, `Suspicious longitude ${b.longitude} — Portugal mainland is roughly -10 to -6°E`);
    }

    // ── Missing EN description for live beaches ──────────────────────────────
    if (b.status === 'live' && (!b.description_en || b.description_en.trim() === '')) {
      err(slug, `Live beach is missing description_en`);
    }

    // ── Missing PT description for live beaches ──────────────────────────────
    if (b.status === 'live' && (!b.description_pt || b.description_pt.trim() === '')) {
      err(slug, `Live beach is missing description_pt`);
    }
  }

  // ── Summary ─────────────────────────────────────────────────────────────────
  console.log('─'.repeat(52));
  console.log(`  Total beaches : ${beaches.length}`);
  console.log(`  Live          : ${beaches.filter(b => b.status === 'live').length}`);
  console.log(`  Draft         : ${beaches.filter(b => b.status === 'draft').length}`);
  console.log(`  Missing data  : ${beaches.filter(b => b.status === 'missing-data').length}`);
  console.log('─'.repeat(52));

  if (errors === 0 && warnings === 0) {
    console.log('\n✅ All checks passed — beaches-master.json is valid.\n');
    process.exit(0);
  }

  if (warnings > 0) console.warn(`\n  ${warnings} warning(s) found.`);
  if (errors > 0) {
    console.error(`\n  ${errors} error(s) found. Fix before deploying.\n`);
    process.exit(1);
  } else {
    console.log('\n✅ No errors. Warnings above are advisory.\n');
    process.exit(0);
  }

} catch (e) {
  if (e instanceof SyntaxError) {
    console.error(`\nJSON parse error in beaches-master.json:\n  ${e.message}\n`);
  } else {
    console.error('\nUnexpected error:', e.message);
  }
  process.exit(1);
}
