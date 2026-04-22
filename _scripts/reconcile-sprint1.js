/**
 * reconcile-sprint1.js
 * Draft 23 Reconciliation Sprint 1 — 12 priority beaches
 *
 * Usage:
 *   SUPABASE_SERVICE_KEY=<service_role_key> node _scripts/reconcile-sprint1.js
 *
 * What it does:
 *   1. Reads 12 target beaches from data/beaches-master.json
 *   2. Checks if each UUID already exists in Supabase (via anon key)
 *   3. Inserts records that don't exist yet → gets real Supabase UUID
 *   4. Updates beaches-master.json with real supabase_id + status=live
 *   5. Reports results
 */

import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const https = require('https');
const fs    = require('fs');

// ── Config ────────────────────────────────────────────────────────────────────

const SUPABASE_HOST = 'glupdjvdvunogkqgxoui.supabase.co';
const SUPABASE_URL  = `https://${SUPABASE_HOST}`;
const SERVICE_KEY   = process.env.SUPABASE_SERVICE_KEY;
const ANON_KEY      = 'sb_publishable_HKdE2IRmz9lMDcg4p3l1tw_HiTdD4nw';
const MASTER_PATH   = path.join(__dirname, '..', 'data', 'beaches-master.json');
const TODAY         = new Date().toISOString().slice(0, 10);

const TARGET_SLUGS = [
  'praia-de-dona-ana',
  'praia-de-alvor',
  'praia-de-armacao-de-pera',
  'ilha-de-tavira',
  'manta-rota',
  'praia-da-fuseta',
  'praia-do-zavial',
  'praia-de-beliche',
  'praia-da-cordoama',
  'praia-de-santa-eulalia',
  'praia-do-martinhal',
  'praia-de-supertubos',
];

// ── HTTP helper (uses node https — no external deps) ──────────────────────────

function httpsRequest(method, urlPath, body, key) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: SUPABASE_HOST,
      path:     urlPath,
      method,
      headers: {
        'Authorization': `Bearer ${key}`,
        'apikey':        key,
        'Content-Type':  'application/json',
        'Prefer':        'return=representation',
      },
    };
    if (data) opts.headers['Content-Length'] = Buffer.byteLength(data);

    let out = '';
    const req = https.request(opts, r => {
      r.on('data', c => (out += c));
      r.on('end', () => {
        try { resolve({ status: r.statusCode, body: JSON.parse(out) }); }
        catch { resolve({ status: r.statusCode, body: out }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function checkExists(id) {
  const r = await httpsRequest('GET', `/rest/v1/beaches?id=eq.${id}&select=id,name`, null, ANON_KEY);
  return Array.isArray(r.body) && r.body.length > 0 ? r.body[0] : null;
}

async function insertBeach(payload) {
  const r = await httpsRequest('POST', '/rest/v1/beaches', payload, SERVICE_KEY);
  if (r.status === 201 && Array.isArray(r.body) && r.body[0]) return r.body[0];
  throw new Error(`Insert failed (${r.status}): ${JSON.stringify(r.body)}`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  if (!SERVICE_KEY) {
    console.error('\n❌  SUPABASE_SERVICE_KEY not set.');
    console.error('   Run: SUPABASE_SERVICE_KEY=<service_role_key> node _scripts/reconcile-sprint1.js\n');
    process.exit(1);
  }

  const master  = JSON.parse(fs.readFileSync(MASTER_PATH, 'utf8'));
  const beaches = master.beaches;

  const results = {
    had_local_uuid:      0,
    already_in_supabase: 0,
    inserted:            0,
    set_live:            0,
    kept_draft:          [],
    errors:              [],
  };

  console.log('\n🏖  Draft 23 — Reconciliation Sprint 1');
  console.log(`    Target: ${TARGET_SLUGS.length} beaches\n`);

  for (const slug of TARGET_SLUGS) {
    const idx = beaches.findIndex(b => b.slug === slug);
    if (idx === -1) {
      console.log(`  ⚠️  ${slug} — NOT FOUND in master JSON, skipping`);
      results.errors.push({ slug, reason: 'not found in master' });
      continue;
    }

    const b       = beaches[idx];
    const localId = b.supabase_id;

    console.log(`  → ${slug} (${b.name_pt})`);

    // 1. Check if UUID already real in Supabase
    let realId = null;
    if (localId) {
      results.had_local_uuid++;
      const existing = await checkExists(localId);
      if (existing) {
        results.already_in_supabase++;
        realId = localId;
        console.log(`     ✓ Already in Supabase: ${realId}`);
      } else {
        console.log(`     ~ UUID is local — will insert`);
      }
    }

    // 2. Insert if not in Supabase
    if (!realId) {
      const payload = {
        name:          b.name_pt,
        region:        b.region,
        description:   b.description_pt,
        water_quality: b.water_quality,
        facilities:    b.facilities || [],
        latitude:      b.latitude,
        longitude:     b.longitude,
        is_active:     true,
      };
      if (b.subregion) payload.town = b.subregion;

      try {
        const inserted = await insertBeach(payload);
        realId = inserted.id;
        results.inserted++;
        console.log(`     ✓ Inserted → ${realId}`);
      } catch (err) {
        console.error(`     ❌ Error: ${err.message}`);
        results.errors.push({ slug, reason: err.message });
        continue;
      }
    }

    // 3. Update master JSON entry
    beaches[idx].supabase_id  = realId;
    beaches[idx].last_updated = TODAY;

    // 4. Promote to live if data is complete
    const canGoLive = !!(
      beaches[idx].description_pt &&
      beaches[idx].description_en &&
      beaches[idx].latitude &&
      beaches[idx].longitude
    );

    if (canGoLive) {
      beaches[idx].status = 'live';
      results.set_live++;
      console.log(`     ✓ Status → live`);
    } else {
      results.kept_draft.push({ slug, reason: 'missing description or coords' });
      console.log(`     ⚠️  Kept draft — missing fields`);
    }
  }

  // 5. Write updated master JSON
  fs.writeFileSync(MASTER_PATH, JSON.stringify(master, null, 2) + '\n', 'utf8');
  console.log('\n  ✅ beaches-master.json updated\n');

  // 6. Summary
  const liveAfter  = beaches.filter(b => b.status === 'live').length;
  const draftAfter = beaches.filter(b => b.status === 'draft').length;

  console.log('────────────────────────────────────────────────');
  console.log('  Sprint 1 Results');
  console.log('────────────────────────────────────────────────');
  console.log(`  Had local UUID (not in Supabase): ${results.had_local_uuid}`);
  console.log(`  Already in Supabase:              ${results.already_in_supabase}`);
  console.log(`  Newly inserted:                   ${results.inserted}`);
  console.log(`  Promoted to live:                 ${results.set_live}`);
  console.log(`  Kept draft:                       ${results.kept_draft.length}`);
  if (results.kept_draft.length) results.kept_draft.forEach(d => console.log(`    - ${d.slug} — ${d.reason}`));
  console.log(`  Errors:                           ${results.errors.length}`);
  if (results.errors.length) results.errors.forEach(e => console.log(`    - ${e.slug} — ${e.reason}`));
  console.log('────────────────────────────────────────────────');
  console.log(`  Total beaches: ${beaches.length}`);
  console.log(`  Live after:    ${liveAfter}`);
  console.log(`  Draft after:   ${draftAfter}`);
  console.log('────────────────────────────────────────────────\n');
}

main().catch(e => { console.error(e); process.exit(1); });
