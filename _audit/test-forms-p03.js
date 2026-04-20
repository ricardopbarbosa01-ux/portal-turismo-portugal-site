/**
 * P0-3 Form Validation — Playwright end-to-end
 * Tests: contact.html, planear.html, parceiros.html
 *
 * Strategy:
 *  - Serves files via local HTTP server
 *  - Proxies Supabase REST calls through Node.js fetch (bypasses CORS from localhost)
 *  - Intercepts db.from().insert() in-page to capture error/success
 *  - Validates: UI success state + localStorage + Supabase API response
 */

'use strict';

const { chromium } = require('playwright');
const http         = require('http');
const fs           = require('fs');
const path         = require('path');

const BASE_DIR = path.resolve(__dirname, '..');
const PORT     = 17331;
const SUPABASE = 'https://glupdjvdvunogkqgxoui.supabase.co';

// ─── Static file server ───────────────────────────────────────────────────────
function createServer() {
  const MIME = {
    '.html': 'text/html; charset=utf-8', '.css': 'text/css',
    '.js': 'application/javascript', '.svg': 'image/svg+xml',
    '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp',
    '.ico': 'image/x-icon', '.json': 'application/json',
    '.woff2': 'font/woff2', '.woff': 'font/woff',
  };
  return http.createServer((req, res) => {
    const p = req.url.split('?')[0].split('#')[0];
    const fp = path.join(BASE_DIR, p === '/' ? 'index.html' : p);
    try {
      res.writeHead(200, { 'Content-Type': MIME[path.extname(fp)] || 'application/octet-stream' });
      res.end(fs.readFileSync(fp));
    } catch (_) { res.writeHead(404); res.end('nf'); }
  });
}

// ─── Result helpers ───────────────────────────────────────────────────────────
const RESULTS = [];
function pass(id, msg) { RESULTS.push({ id, status: 'PASS', msg }); console.log(`  ✓ [${id}] ${msg}`); }
function fail(id, msg) { RESULTS.push({ id, status: 'FAIL', msg }); console.log(`  ✗ [${id}] ${msg}`); }
function info(id, msg) { console.log(`  · [${id}] ${msg}`); }

// ─── Inject a DB spy before form scripts run ──────────────────────────────────
// Wraps db.from().insert() to capture the Promise result into window.__dbResults
const DB_SPY_SCRIPT = `
(function patchDbSpy() {
  function tryPatch() {
    if (typeof db === 'undefined' || !db.from) {
      requestAnimationFrame(tryPatch);
      return;
    }
    const orig = db.from.bind(db);
    db.from = function(table) {
      const qb = orig(table);
      if (!qb) return qb;
      const origInsert = qb.insert ? qb.insert.bind(qb) : null;
      if (origInsert) {
        qb.insert = function(rows, opts) {
          const p = origInsert(rows, opts);
          if (p && typeof p.then === 'function') {
            p.then(function(res) {
              window.__dbResults = window.__dbResults || [];
              window.__dbResults.push({ table: table, status: res.status, error: res.error ? { message: res.error.message, code: res.error.code } : null });
            }).catch(function(e) {
              window.__dbResults = window.__dbResults || [];
              window.__dbResults.push({ table: table, exception: e.message });
            });
          }
          return p;
        };
      }
      return qb;
    };
    console.log('[spy] db.from patched');
  }
  tryPatch();
})();
`;

// ─── Main ────────────────────────────────────────────────────────────────────
(async () => {
  const server = createServer();
  await new Promise(resolve => server.listen(PORT, '127.0.0.1', resolve));
  const BASE = `http://127.0.0.1:${PORT}`;
  console.log(`\nServidor local: ${BASE}\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });

  // Proxy ALL Supabase REST calls through Node.js (bypasses CORS)
  await context.route(`${SUPABASE}/**`, async route => {
    const req = route.request();
    try {
      const hdrs = { ...req.headers() };
      delete hdrs['origin']; delete hdrs['referer'];
      const body = (req.method() !== 'GET' && req.method() !== 'HEAD') ? req.postData() : undefined;
      const resp = await fetch(req.url(), { method: req.method(), headers: hdrs, body });
      const buf  = Buffer.from(await resp.arrayBuffer());
      const rh   = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' };
      resp.headers.forEach((v, k) => { if (k !== 'content-encoding') rh[k] = v; });
      await route.fulfill({ status: resp.status, headers: rh, body: buf });
    } catch (e) {
      console.error('  [proxy error]', e.message);
      await route.abort('failed');
    }
  });

  const page = await context.newPage();
  const jsErrors = [];
  page.on('pageerror', e => { if (!/favicon|Failed to load resource/.test(e.message)) jsErrors.push(e.message); });

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. contact.html
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('═══ contact.html ═══');
  jsErrors.length = 0;

  await page.addInitScript(DB_SPY_SCRIPT);
  await page.goto(`${BASE}/contact.html`, { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(800);

  await page.fill('#cf-name',    'Playwright Teste');
  await page.fill('#cf-email',   'pw-p03@portalteste.pt');
  await page.selectOption('#cf-subject', { index: 1 });
  await page.fill('#cf-message', 'Mensagem automática de teste P0-3.');

  await page.screenshot({ path: path.join(__dirname, 'screenshots', 'p03-contact-before.png') });

  // Submit via regular button (form has standard submit listener)
  await page.evaluate(() => document.getElementById('contact-form').requestSubmit());
  await page.waitForTimeout(4000); // allow Supabase round-trip

  // UI
  const cUI = await page.evaluate(() => document.getElementById('form-success')?.classList.contains('visible'));
  if (cUI) pass('P0-3-contact-ui', 'contact.html — success state visível');
  else     fail('P0-3-contact-ui', 'contact.html — success state NÃO visível');

  // localStorage
  const cLS = await page.evaluate(() => {
    const arr = JSON.parse(localStorage.getItem('pth_contact_messages') || '[]');
    return arr.find(r => r.email === 'pw-p03@portalteste.pt') || null;
  });
  if (cLS) pass('P0-3-contact-ls', `contact.html — localStorage: name="${cLS.name}"`);
  else     fail('P0-3-contact-ls', 'contact.html — sem registo em localStorage');

  // Supabase result
  const cDB = await page.evaluate(() => {
    const r = (window.__dbResults || []).find(x => x.table === 'contact_messages');
    return r || null;
  });
  info('P0-3-contact-api', `DB spy: ${JSON.stringify(cDB)}`);
  if (!cDB)               fail('P0-3-contact-api', 'contact.html — insert não foi chamado (spy sem resultado)');
  else if (!cDB.error)    pass('P0-3-contact-api', `contact.html — Supabase insert OK (HTTP ${cDB.status})`);
  else                    fail('P0-3-contact-api', `contact.html — Supabase error: ${cDB.error.message}`);

  if (jsErrors.length) fail('P0-3-contact-js', `JS errors: ${jsErrors.join('; ')}`);
  await page.screenshot({ path: path.join(__dirname, 'screenshots', 'p03-contact-after.png') });

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. planear.html
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n═══ planear.html ═══');
  jsErrors.length = 0;

  await page.goto(`${BASE}/planear.html`, { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(800);

  await page.fill('#f-nome',  'Playwright Viajante');
  await page.fill('#f-email', 'pw-p03@portalteste.pt');

  // Check interest checkbox via JS (hidden behind styled labels)
  const cbOk = await page.evaluate(() => {
    const cb = document.querySelector('.interest-item input[type="checkbox"]');
    if (!cb) return false;
    cb.checked = true;
    cb.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  });
  info('P0-3-planear', `Interest checkbox via JS: ${cbOk}`);

  try { await page.selectOption('#f-regiao',  { index: 1 }); } catch (_) {}
  try { await page.selectOption('#f-pessoas', { index: 1 }); } catch (_) {}

  await page.screenshot({ path: path.join(__dirname, 'screenshots', 'p03-planear-before.png') });

  // Submit via form's submit event (the hidden #submit-btn triggers this path)
  // The slide-to-confirm is an alternative UX path; requestSubmit() exercises
  // the same data payload and the same Supabase insert.
  await page.evaluate(() => document.getElementById('plan-form').requestSubmit());
  info('P0-3-planear', 'Form submetido via requestSubmit()');

  await page.waitForTimeout(5000); // slide has 1300ms delay + Supabase round-trip

  // UI
  const pUI = await page.evaluate(() => document.getElementById('form-success')?.classList.contains('visible'));
  if (pUI) pass('P0-3-planear-ui', 'planear.html — success state visível');
  else     fail('P0-3-planear-ui', 'planear.html — success state NÃO visível');

  // localStorage
  const pLS = await page.evaluate(() => {
    const arr = JSON.parse(localStorage.getItem('pth_plan_requests') || '[]');
    return arr.find(r => r.email === 'pw-p03@portalteste.pt') || null;
  });
  if (pLS) pass('P0-3-planear-ls', `planear.html — localStorage: nome="${pLS.nome}"`);
  else     fail('P0-3-planear-ls', 'planear.html — sem registo em localStorage');

  // Supabase result
  const pDB = await page.evaluate(() => {
    const r = (window.__dbResults || []).find(x => x.table === 'plan_requests');
    return r || null;
  });
  info('P0-3-planear-api', `DB spy: ${JSON.stringify(pDB)}`);
  if (!pDB)            fail('P0-3-planear-api', 'planear.html — insert não foi chamado (spy sem resultado)');
  else if (!pDB.error) pass('P0-3-planear-api', `planear.html — Supabase insert OK (HTTP ${pDB.status})`);
  else                 fail('P0-3-planear-api', `planear.html — Supabase error: ${pDB.error.message}`);

  if (jsErrors.length) fail('P0-3-planear-js', `JS errors: ${jsErrors.join('; ')}`);
  await page.screenshot({ path: path.join(__dirname, 'screenshots', 'p03-planear-after.png') });

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. parceiros.html
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n═══ parceiros.html ═══');
  jsErrors.length = 0;

  await page.goto(`${BASE}/parceiros.html`, { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(800);

  await page.fill('#f-negocio',  'Surf School Playwright Test');
  await page.selectOption('#f-tipo',     'surf');
  await page.selectOption('#f-objetivo', 'visibilidade');
  await page.fill('#f-contacto',  'Ricardo Teste');
  await page.fill('#f-email',     'pw-p03@portalteste.pt');

  await page.screenshot({ path: path.join(__dirname, 'screenshots', 'p03-parceiros-before.png') });

  await page.evaluate(() => document.getElementById('b2b-form').requestSubmit());
  await page.waitForTimeout(4000);

  // UI (parceiros uses class "vis")
  const bUI = await page.evaluate(() => document.getElementById('b2b-success')?.classList.contains('vis'));
  if (bUI) pass('P0-3-parceiros-ui', 'parceiros.html — success state visível');
  else     fail('P0-3-parceiros-ui', 'parceiros.html — success state NÃO visível');

  // localStorage
  const bLS = await page.evaluate(() => {
    const arr = JSON.parse(localStorage.getItem('pth_partner_leads') || '[]');
    return arr.find(r => r.email === 'pw-p03@portalteste.pt') || null;
  });
  if (bLS) pass('P0-3-parceiros-ls', `parceiros.html — localStorage: negocio="${bLS.negocio}"`);
  else     fail('P0-3-parceiros-ls', 'parceiros.html — sem registo em localStorage');

  // Supabase result
  const bDB = await page.evaluate(() => {
    const r = (window.__dbResults || []).find(x => x.table === 'partner_leads');
    return r || null;
  });
  info('P0-3-parceiros-api', `DB spy: ${JSON.stringify(bDB)}`);
  if (!bDB)            fail('P0-3-parceiros-api', 'parceiros.html — insert não foi chamado (spy sem resultado)');
  else if (!bDB.error) pass('P0-3-parceiros-api', `parceiros.html — Supabase insert OK (HTTP ${bDB.status})`);
  else                 fail('P0-3-parceiros-api', `parceiros.html — Supabase error: ${bDB.error.message}`);

  if (jsErrors.length) fail('P0-3-parceiros-js', `JS errors: ${jsErrors.join('; ')}`);
  await page.screenshot({ path: path.join(__dirname, 'screenshots', 'p03-parceiros-after.png') });

  // ─── Final summary ────────────────────────────────────────────────────────
  await browser.close();
  server.close();

  console.log('\n' + '═'.repeat(60));
  const passes = RESULTS.filter(r => r.status === 'PASS').length;
  const fails  = RESULTS.filter(r => r.status === 'FAIL').length;
  console.log(`RESULTADO FINAL: ${passes} PASS  /  ${fails} FAIL`);
  if (fails === 0) {
    console.log('\n✓ P0-3 FECHADO — todos os formulários validados ponta-a-ponta');
  } else {
    console.log('\nFalhas:');
    RESULTS.filter(r => r.status === 'FAIL').forEach(r => console.log(`  FAIL [${r.id}]: ${r.msg}`));
  }
  process.exit(fails === 0 ? 0 : 1);
})();
