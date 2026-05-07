const { chromium } = require('playwright');
const BASE = process.env.BASE_URL || 'http://localhost:8085';
const VP = { width: 375, height: 667 };

async function dismissBanner(page) {
  await page.evaluate(() => {
    const b = document.getElementById('cookie-consent-banner');
    if (b) b.style.display = 'none';
  });
  await page.waitForTimeout(200);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: VP });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

  let pass = true;

  // ── beaches.html: BUSCAR ──────────────────────────────────────────────────
  await page.goto(BASE + '/beaches.html', { waitUntil: 'networkidle' });
  await dismissBanner(page);

  await page.evaluate(() => window.scrollTo({ top: 2000, behavior: 'instant' }));
  await page.waitForTimeout(200);

  await page.click('#mob-search-btn');
  await page.waitForTimeout(700);

  const scrollY = await page.evaluate(() => window.scrollY);
  const buscarOk = scrollY < 100;
  console.log('beaches BUSCAR: scrollY=' + scrollY + ' ' + (buscarOk ? '✅' : '❌'));
  if (!buscarOk) pass = false;

  // ── beaches.html: MENU ────────────────────────────────────────────────────
  await page.click('#mob-menu-btn');
  await page.waitForTimeout(400);

  const menuOpen = await page.evaluate(() => !!document.getElementById('mobile-menu')?.classList.contains('open'));
  const expanded = await page.evaluate(() => document.getElementById('nav-toggle')?.getAttribute('aria-expanded'));
  const menuOk = menuOpen && expanded === 'true';
  console.log('beaches MENU: open=' + menuOpen + ' expanded=' + expanded + ' ' + (menuOk ? '✅' : '❌'));
  if (!menuOk) pass = false;

  // ── guias.html: MENU ──────────────────────────────────────────────────────
  await page.goto(BASE + '/guias.html', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(400);
  await dismissBanner(page);

  await page.click('#mob-menu-btn');
  await page.waitForTimeout(300);

  const gOpen = await page.evaluate(() => !!document.getElementById('mobile-menu')?.classList.contains('open'));
  console.log('guias MENU: open=' + gOpen + ' ' + (gOpen ? '✅' : '❌'));
  if (!gOpen) pass = false;

  // ── console errors ────────────────────────────────────────────────────────
  console.log('console errors:', errors.length ? '❌ ' + errors.slice(0, 2).join('; ') : '✅ none');

  await browser.close();
  console.log('\n1C:', pass ? 'PASS ✅' : 'FAIL ❌');
  process.exit(pass ? 0 : 1);
})().catch(e => { console.error(e.message); process.exit(1); });
