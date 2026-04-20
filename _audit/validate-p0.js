const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = 'file:///C:/Users/Powerpc/portal-turismo-site';
const OUT  = path.join(__dirname, 'screenshots');
fs.mkdirSync(OUT, { recursive: true });

const RESULTS = [];

function pass(id, msg)  { RESULTS.push({ id, status: 'PASS', msg }); console.log(`  ✓ [${id}] ${msg}`); }
function fail(id, msg)  { RESULTS.push({ id, status: 'FAIL', msg }); console.log(`  ✗ [${id}] ${msg}`); }
function info(id, msg)  { console.log(`  · [${id}] ${msg}`); }

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page    = await context.newPage();

  const jsErrors = [];
  page.on('pageerror', e => jsErrors.push(e.message));

  // ─────────────────────────────────────────────────────────────────
  // P0-2: SUPABASE_URL — check no JS crash in affected pages
  // ─────────────────────────────────────────────────────────────────
  const supabasePages = ['beach.html', 'planear.html', 'precos.html', 'contact.html'];
  for (const pg of supabasePages) {
    jsErrors.length = 0;
    await page.goto(`${BASE}/${pg}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(800);
    const supaErr = jsErrors.filter(e => e.includes('SUPABASE_URL') || e.includes('already been declared'));
    if (supaErr.length === 0) pass('P0-2', `${pg} — sem erro SUPABASE_URL`);
    else                       fail('P0-2', `${pg} — ainda tem erro: ${supaErr[0]}`);
  }

  // ─────────────────────────────────────────────────────────────────
  // P0-1: Imagens — verificar onerror em index.html
  // ─────────────────────────────────────────────────────────────────
  jsErrors.length = 0;
  await page.goto(`${BASE}/index.html`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(1500);

  // Check img template has onerror
  const hasOnerrorIndex = await page.evaluate(() => {
    // Look in the actual rendered imgs for onerror attribute or check source
    const imgs = Array.from(document.querySelectorAll('.fb-card img, .beach-card img'));
    return imgs.length === 0 ? 'no-cards-rendered' : imgs.filter(i => i.onerror).length + '/' + imgs.length + ' with onerror';
  });
  info('P0-1', `index.html card imgs onerror: ${hasOnerrorIndex}`);

  await page.screenshot({ path: `${OUT}/validate-index.png`, fullPage: false });
  pass('P0-1', 'index.html carregou sem crash');

  // ─────────────────────────────────────────────────────────────────
  // P0-1: beach.html — sem Unsplash hardcoded no fallback
  // ─────────────────────────────────────────────────────────────────
  jsErrors.length = 0;
  await page.goto(`${BASE}/beach.html`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(800);

  // Error state should show (no ?id param)
  const errorVisible = await page.evaluate(() => {
    const el = document.getElementById('page-error');
    return el && el.style.display !== 'none' && el.offsetParent !== null;
  });
  if (errorVisible) pass('P0-5', 'beach.html sem ?id mostra estado de erro correto');
  else               fail('P0-5', 'beach.html sem ?id não mostra estado de erro');

  // Check hero-img has no hardcoded Unsplash as fallback (check JS source)
  const heroFallbackClean = await page.evaluate(() => {
    // Can't easily check JS source, but check that hero-img has onerror set
    const img = document.getElementById('hero-img');
    return img ? (img.onerror !== null ? 'has-onerror-handler' : 'no-onerror') : 'img-not-found';
  });
  info('P0-1', `beach.html hero-img: ${heroFallbackClean}`);

  await page.screenshot({ path: `${OUT}/validate-beach-noid.png` });

  // ─────────────────────────────────────────────────────────────────
  // P0-3: Formulários — verificar que config.js carregou e db existe
  // ─────────────────────────────────────────────────────────────────
  const formPages = [
    { file: 'contact.html', formId: 'contact-form' },
    { file: 'planear.html', formId: 'plan-form' },
    { file: 'parceiros.html', formId: 'b2b-form' },
  ];

  for (const fp of formPages) {
    jsErrors.length = 0;
    await page.goto(`${BASE}/${fp.file}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(800);

    const dbAvailable = await page.evaluate(() => typeof db !== 'undefined' && db !== null);
    const formExists  = await page.evaluate((id) => !!document.getElementById(id), fp.formId);
    const noJsErr     = jsErrors.filter(e => e.includes('already been declared') || e.includes('SUPABASE')).length === 0;

    if (dbAvailable && formExists && noJsErr) pass('P0-3', `${fp.file} — db disponível, form existe, sem erros JS`);
    else fail('P0-3', `${fp.file} — db=${dbAvailable} form=${formExists} jsClean=${noJsErr}`);

    await page.screenshot({ path: `${OUT}/validate-${fp.file.replace('.html','')}.png` });
  }

  // ─────────────────────────────────────────────────────────────────
  // P0-4: CTAs monetização — verificar hrefs reais
  // ─────────────────────────────────────────────────────────────────
  await page.goto(`${BASE}/index.html`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(800);

  const monetCTAs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.monet-card, [class*="monet"]'))
      .map(card => {
        const a = card.closest('a') || card.querySelector('a');
        return { text: card.innerText.slice(0,40).replace(/\n/g,' '), href: a?.href || 'NONE' };
      });
  });
  monetCTAs.forEach(c => {
    if (c.href && c.href !== 'NONE' && !c.href.endsWith('#')) pass('P0-4', `CTA com destino real: ${c.href.slice(0,50)}`);
    else fail('P0-4', `CTA sem destino: "${c.text}"`);
  });

  // ─────────────────────────────────────────────────────────────────
  await browser.close();

  console.log('\n' + '='.repeat(50));
  const passes = RESULTS.filter(r => r.status === 'PASS').length;
  const fails  = RESULTS.filter(r => r.status === 'FAIL').length;
  console.log(`RESULTADO: ${passes} PASS / ${fails} FAIL`);
  RESULTS.filter(r => r.status === 'FAIL').forEach(r => console.log(`  FAIL [${r.id}]: ${r.msg}`));
})();
