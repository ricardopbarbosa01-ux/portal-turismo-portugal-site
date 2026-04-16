/**
 * reconcile-sprint2.js
 * Draft 11 Reconciliation Sprint 2 — remaining 11 draft beaches
 *
 * Usage:
 *   SUPABASE_SERVICE_KEY=<service_role_key> node _scripts/reconcile-sprint2.js
 */

import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const https = require('https');
const fs    = require('fs');

const SUPABASE_HOST = 'glupdjvdvunogkqgxoui.supabase.co';
const ANON_KEY      = 'sb_publishable_HKdE2IRmz9lMDcg4p3l1tw_HiTdD4nw';
const SERVICE_KEY   = process.env.SUPABASE_SERVICE_KEY;
const MASTER_PATH   = path.join(__dirname, '..', 'data', 'beaches-master.json');
const TODAY         = new Date().toISOString().slice(0, 10);

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

async function main() {
  if (!SERVICE_KEY) {
    console.error('\n❌  SUPABASE_SERVICE_KEY not set.');
    console.error('   Run: SUPABASE_SERVICE_KEY=<key> node _scripts/reconcile-sprint2.js\n');
    process.exit(1);
  }

  const master  = JSON.parse(fs.readFileSync(MASTER_PATH, 'utf8'));
  const beaches = master.beaches;
  const drafts  = beaches.filter(b => b.status === 'draft');

  console.log('\n🏖  Draft 11 — Reconciliation Sprint 2');
  console.log(`    Target: ${drafts.length} draft beaches\n`);

  const results = { inserted: 0, already: 0, live: 0, kept_draft: [], errors: [] };

  for (const b of drafts) {
    const idx = beaches.findIndex(x => x.slug === b.slug);
    console.log(`  → ${b.slug} (${b.name_pt})`);

    let realId = null;
    if (b.supabase_id) {
      const existing = await checkExists(b.supabase_id);
      if (existing) {
        results.already++;
        realId = b.supabase_id;
        console.log(`     ✓ Already in Supabase: ${realId}`);
      } else {
        console.log(`     ~ UUID is local — will insert`);
      }
    }

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
        results.errors.push({ slug: b.slug, reason: err.message });
        continue;
      }
    }

    beaches[idx].supabase_id  = realId;
    beaches[idx].last_updated = TODAY;

    const canGoLive = !!(b.description_pt && b.description_en && b.latitude && b.longitude);
    if (canGoLive) {
      beaches[idx].status = 'live';
      results.live++;
      console.log(`     ✓ Status → live`);
    } else {
      results.kept_draft.push({ slug: b.slug, reason: 'missing description or coords' });
      console.log(`     ⚠️  Kept draft`);
    }
  }

  fs.writeFileSync(MASTER_PATH, JSON.stringify(master, null, 2) + '\n', 'utf8');
  console.log('\n  ✅ beaches-master.json updated\n');

  const liveAfter  = beaches.filter(b => b.status === 'live').length;
  const draftAfter = beaches.filter(b => b.status === 'draft').length;

  console.log('────────────────────────────────────────────────');
  console.log('  Sprint 2 Results');
  console.log('────────────────────────────────────────────────');
  console.log(`  Already in Supabase:  ${results.already}`);
  console.log(`  Newly inserted:       ${results.inserted}`);
  console.log(`  Promoted to live:     ${results.live}`);
  console.log(`  Kept draft:           ${results.kept_draft.length}`);
  if (results.kept_draft.length) results.kept_draft.forEach(d => console.log(`    - ${d.slug} — ${d.reason}`));
  console.log(`  Errors:               ${results.errors.length}`);
  if (results.errors.length) results.errors.forEach(e => console.log(`    - ${e.slug} — ${e.reason}`));
  console.log('────────────────────────────────────────────────');
  console.log(`  Total beaches: ${beaches.length}`);
  console.log(`  Live after:    ${liveAfter}`);
  console.log(`  Draft after:   ${draftAfter}`);
  console.log('────────────────────────────────────────────────\n');
}

main().catch(e => { console.error(e); process.exit(1); });
