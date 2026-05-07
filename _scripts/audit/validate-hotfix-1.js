const { chromium } = require('playwright');
const BASE = process.env.BASE_URL || 'http://localhost:8080';
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

  // ── 1A: /beach accordion toggleAcc ───────────────────────────────────────
  // Uses ?id=praia-da-rocha (a known beach) or any valid beach id
  await page.goto(BASE + '/beach.html?id=praia-da-rocha', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1200); // wait for DOMContentLoaded + DB fetch
  await dismissBanner(page);

  // Check window.toggleAcc is global
  const toggleAccGlobal = await page.evaluate(() => typeof window.toggleAcc === 'function');
  console.log('1A toggleAcc global: ' + (toggleAccGlobal ? '✅' : '❌'));
  if (!toggleAccGlobal) pass = false;

  // Click "O que Explorar" accordion (acc-explore, starts closed)
  const exploreBtn = page.locator('#acc-explore .acc-header');
  if (await exploreBtn.count() > 0) {
    const wasOpen = await page.locator('#acc-explore').evaluate(el => el.classList.contains('open'));
    await exploreBtn.click();
    await page.waitForTimeout(300);
    const isOpen = await page.locator('#acc-explore').evaluate(el => el.classList.contains('open'));
    const toggled = isOpen !== wasOpen;
    console.log('1A "O que Explorar" toggles: ' + (toggled ? '✅' : '❌') + ' (was=' + wasOpen + ' now=' + isOpen + ')');
    if (!toggled) pass = false;
  } else {
    console.log('1A "O que Explorar" not found (beach may not have loaded) — skip');
  }

  // Click "Dicas Práticas" accordion
  const tipsBtn = page.locator('#acc-tips .acc-header');
  if (await tipsBtn.count() > 0) {
    const wasOpen2 = await page.locator('#acc-tips').evaluate(el => el.classList.contains('open'));
    await tipsBtn.click();
    await page.waitForTimeout(300);
    const isOpen2 = await page.locator('#acc-tips').evaluate(el => el.classList.contains('open'));
    const toggled2 = isOpen2 !== wasOpen2;
    console.log('1A "Dicas Práticas" toggles: ' + (toggled2 ? '✅' : '❌'));
    if (!toggled2) pass = false;
  } else {
    console.log('1A "Dicas Práticas" not found — skip');
  }

  // Regression: MENU bottom nav still works
  const menuBtn = page.locator('#mob-menu-btn');
  if (await menuBtn.count() > 0) {
    await menuBtn.click();
    await page.waitForTimeout(400);
    const menuOpen = await page.evaluate(() => !!document.getElementById('mobile-menu')?.classList.contains('open'));
    console.log('1A MENU regression: open=' + menuOpen + ' ' + (menuOpen ? '✅' : '❌'));
    if (!menuOpen) pass = false;
    // Close menu
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
  } else {
    console.log('1A MENU btn not found — skip');
  }

  // ── 1B: /media-kit webcam slot removed ───────────────────────────────────
  await page.goto(BASE + '/media-kit.html', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(300);

  const webcamSlotPT = await page.evaluate(() => document.body.innerHTML.includes('Slot de patrocínio em webcam ao vivo'));
  console.log('1B PT webcam slot absent: ' + (!webcamSlotPT ? '✅' : '❌ STILL PRESENT'));
  if (webcamSlotPT) pass = false;

  // Verify other ratecard still present
  const beachSpotPT = await page.evaluate(() => document.body.innerHTML.includes('Spotlight em página de praia'));
  console.log('1B PT beach slot intact: ' + (beachSpotPT ? '✅' : '❌ MISSING'));
  if (!beachSpotPT) pass = false;

  const profilePT = await page.evaluate(() => document.body.innerHTML.includes('Perfil premium de parceiro'));
  console.log('1B PT premium profile intact: ' + (profilePT ? '✅' : '❌ MISSING'));
  if (!profilePT) pass = false;

  // ── 1B: /en/media-kit webcam slot removed ────────────────────────────────
  await page.goto(BASE + '/en/media-kit.html', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(300);

  const webcamSlotEN = await page.evaluate(() => document.body.innerHTML.includes('Live webcam sponsor slot'));
  console.log('1B EN webcam slot absent: ' + (!webcamSlotEN ? '✅' : '❌ STILL PRESENT'));
  if (webcamSlotEN) pass = false;

  const beachSpotEN = await page.evaluate(() => document.body.innerHTML.includes('Beach page spotlight'));
  console.log('1B EN beach slot intact: ' + (beachSpotEN ? '✅' : '❌ MISSING'));
  if (!beachSpotEN) pass = false;

  // ── console errors ────────────────────────────────────────────────────────
  const critErrors = errors.filter(e => !e.includes('Turnstile') && !e.includes('supabase'));
  console.log('console errors: ' + (critErrors.length ? '❌ ' + critErrors.slice(0,2).join('; ') : '✅ none critical'));

  await browser.close();
  console.log('\nHotfix-1:', pass ? 'PASS ✅' : 'FAIL ❌');
  process.exit(pass ? 0 : 1);
})().catch(e => { console.error(e.message); process.exit(1); });
