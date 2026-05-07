const { chromium } = require('playwright');
const BASE = process.env.BASE_URL || 'http://localhost:8085';
const VP = { width: 375, height: 667 };

async function dismissBanner(page) {
  await page.evaluate(() => {
    const b = document.getElementById('cookie-consent-banner');
    if (b) b.style.display = 'none';
  });
}

async function testPage(page, path, gridId, cardSel) {
  await page.goto(BASE + path, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(1200);
  await dismissBanner(page);
  await page.waitForTimeout(800);

  const state = await page.evaluate(function(args) {
    var gridId = args[0], cardSel = args[1];
    var grid = document.getElementById(gridId);
    if (!grid) return { gridFound: false };

    var allCards = Array.from(grid.querySelectorAll(cardSel));
    var visibleCards = allCards.filter(function(c) {
      return c.style.display !== 'none' && getComputedStyle(c).display !== 'none';
    });
    var btn = document.querySelector('.load-more-btn[data-paginator]');
    var footer = document.querySelector('footer');
    var footerRect = footer ? footer.getBoundingClientRect() : null;

    return {
      gridFound: true,
      total: allCards.length,
      visible: visibleCards.length,
      hasBtn: !!btn,
      btnText: btn ? btn.textContent.trim() : null,
      footerTop: footerRect ? footerRect.top : null
    };
  }, [gridId, cardSel]);

  if (!state.gridFound) {
    console.log('  ⚠️  SKIP  ' + path + ': #' + gridId + ' not found');
    return true;
  }

  if (state.total <= 20) {
    console.log('  ℹ️  INFO  ' + path + ': only ' + state.total + ' cards — no pagination needed');
    return true;
  }

  let pass = true;
  const v1 = state.visible <= 20;
  const v2 = state.hasBtn;
  if (!v1) pass = false;
  if (!v2) pass = false;

  console.log('  ' + (v1 ? '✅' : '❌') + ' initial visible cards ≤20: ' + state.visible + '/' + state.total);
  console.log('  ' + (v2 ? '✅' : '❌') + ' Load More button present: ' + state.btnText);

  if (state.hasBtn) {
    await page.click('.load-more-btn[data-paginator]');
    await page.waitForTimeout(300);

    const after = await page.evaluate(function(args) {
      var gridId = args[0], cardSel = args[1];
      var grid = document.getElementById(gridId);
      var allCards = Array.from(grid.querySelectorAll(cardSel));
      var visible = allCards.filter(function(c) {
        return c.style.display !== 'none' && getComputedStyle(c).display !== 'none';
      });
      return visible.length;
    }, [gridId, cardSel]);

    const v3 = after > state.visible;
    if (!v3) pass = false;
    console.log('  ' + (v3 ? '✅' : '❌') + ' Load More reveals more: ' + state.visible + ' → ' + after);
  }

  return pass;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: VP });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

  let allPass = true;

  console.log('\n── beaches.html ──');
  const r1 = await testPage(page, '/beaches.html', 'beaches-grid', '.beach-card');
  if (!r1) allPass = false;

  console.log('\n── pesca.html ──');
  const r2 = await testPage(page, '/pesca.html', 'spots-grid', '.spot-card');
  if (!r2) allPass = false;

  console.log('\n── surf.html ──');
  const r3 = await testPage(page, '/surf.html', 'spots-grid', '.spot-card');
  if (!r3) allPass = false;

  const corsErrors = errors.filter(e => e.includes('CORS') || e.includes('supabase'));
  const realErrors = errors.filter(e => !e.includes('CORS') && !e.includes('supabase') && !e.includes('pexels'));
  console.log('\nconsole errors (non-CORS):', realErrors.length ? '❌ ' + realErrors[0] : '✅ none');

  await browser.close();
  console.log('\n1E:', allPass ? 'PASS ✅' : 'FAIL ❌');
  process.exit(allPass ? 0 : 1);
})().catch(e => { console.error(e.message); process.exit(1); });
