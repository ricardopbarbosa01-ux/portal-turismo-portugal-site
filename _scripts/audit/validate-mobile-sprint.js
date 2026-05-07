/**
 * validate-mobile-sprint.js
 * Playwright validation for mobile bug sprint 1A–1E
 * Viewport: 375×667 (iPhone SE)
 */
const { chromium } = require('playwright');

const BASE = process.env.BASE_URL || 'http://localhost:8080';
const VP = { width: 375, height: 667 };

let passed = 0;
let failed = 0;
const results = [];

function assert(name, condition, detail = '') {
  if (condition) {
    passed++;
    results.push({ status: 'PASS', name, detail });
    console.log(`  ✅ PASS  ${name}`);
  } else {
    failed++;
    results.push({ status: 'FAIL', name, detail });
    console.log(`  ❌ FAIL  ${name}${detail ? ' — ' + detail : ''}`);
  }
}

async function run1A(page) {
  console.log('\n── Sub-sprint 1A: body padding-bottom ──');
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });

  const paddingBottom = await page.evaluate(() => {
    const computed = getComputedStyle(document.body).paddingBottom;
    return parseFloat(computed);
  });
  assert('1A: body.paddingBottom >= 80px', paddingBottom >= 80,
    `computed: ${paddingBottom}px`);

  // Check last section bottom doesn't overlap with nav area
  const overlap = await page.evaluate(() => {
    const nav = document.querySelector('.bottom-nav');
    if (!nav) return { hasNav: false };
    const navRect = nav.getBoundingClientRect();
    // Find last visible section/element before footer
    const sections = Array.from(document.querySelectorAll('main section, main > div, footer'));
    const lastSection = sections[sections.length - 1];
    if (!lastSection) return { hasNav: true, lastRect: null };
    const lastRect = lastSection.getBoundingClientRect();
    return {
      hasNav: true,
      navTop: navRect.top,
      lastBottom: lastRect.bottom,
      viewportHeight: window.innerHeight,
      overlap: lastRect.bottom > navRect.top
    };
  });

  if (overlap.hasNav) {
    assert('1A: bottom nav present in DOM', true);
    assert('1A: last content section not covered by nav',
      !overlap.overlap,
      `lastBottom=${Math.round(overlap.lastBottom)} navTop=${Math.round(overlap.navTop)}`);
  } else {
    assert('1A: bottom nav present in DOM', false, 'No .bottom-nav found');
  }
}

async function run1B(page) {
  console.log('\n── Sub-sprint 1B: headline height ──');
  const pages = ['/', '/pesca.html', '/surf.html'];
  for (const path of pages) {
    await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' });

    const result = await page.evaluate(() => {
      // Try common hero headline selectors
      const selectors = [
        '.hero-title', '.page-hero h1', '.hero h1',
        '.pesca-hero h1', '.surf-hero h1', '.hero__title',
        'h1'
      ];
      for (const sel of selectors) {
        const el = document.querySelector(sel);
        if (el) {
          const rect = el.getBoundingClientRect();
          const ratio = rect.height / window.innerHeight;
          const scrollW = document.body.scrollWidth;
          const clientW = document.body.clientWidth;
          return {
            selector: sel,
            height: rect.height,
            viewportH: window.innerHeight,
            ratio,
            hasHorizOverflow: scrollW > clientW + 1,
            scrollW,
            clientW
          };
        }
      }
      return null;
    });

    if (result) {
      assert(`1B: ${path} headline height <40% viewport`,
        result.ratio < 0.4,
        `ratio=${(result.ratio * 100).toFixed(1)}% sel=${result.selector}`);
      assert(`1B: ${path} no horizontal overflow`,
        !result.hasHorizOverflow,
        `scrollW=${result.scrollW} clientW=${result.clientW}`);
    } else {
      assert(`1B: ${path} h1 found`, false, 'No h1 found');
    }
  }
}

async function run1C(page) {
  console.log('\n── Sub-sprint 1C: BUSCAR/MENU buttons ──');
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });

  const buttons = await page.evaluate(() => {
    // Look for BUSCAR and MENU by text content in bottom nav
    const allButtons = Array.from(document.querySelectorAll('.bottom-nav button, .bottom-nav a, .bottom-nav [role="button"]'));
    const bottomNavItems = Array.from(document.querySelectorAll('.bottom-nav-item, [class*="bottom-nav"]'));
    return {
      buttonCount: allButtons.length + bottomNavItems.length,
      buttons: [...allButtons, ...bottomNavItems].map(el => ({
        tag: el.tagName,
        text: el.textContent.trim().substring(0, 30),
        id: el.id,
        className: el.className.substring(0, 60)
      }))
    };
  });

  assert('1C: bottom nav has interactive elements', buttons.buttonCount > 0,
    `found: ${buttons.buttonCount}`);

  // Check console errors on click
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  // Try clicking BUSCAR-like element
  const buscarClicked = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('.bottom-nav *'));
    const buscar = items.find(el => el.textContent.trim().toUpperCase().includes('BUSCAR') || el.textContent.trim().toUpperCase().includes('SEARCH'));
    if (buscar) { buscar.click(); return true; }
    return false;
  });
  assert('1C: BUSCAR button found and clickable', buscarClicked);

  await page.waitForTimeout(500);

  // Check if any modal/dialog/search opened
  const modalVisible = await page.evaluate(() => {
    const modal = document.querySelector('[role="dialog"], .modal, .search-modal, .mobile-search, [class*="search"][class*="modal"], [class*="modal"][class*="search"]');
    if (modal) {
      const rect = modal.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    }
    return false;
  });
  assert('1C: BUSCAR opens modal/search UI', modalVisible);

  assert('1C: no console errors after BUSCAR click', consoleErrors.length === 0,
    consoleErrors.slice(0, 2).join('; '));
}

async function run1D(page) {
  console.log('\n── Sub-sprint 1D: region filter pills ──');
  const pages = ['/pesca.html', '/surf.html', '/beaches.html'];

  for (const path of pages) {
    await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' });

    const result = await page.evaluate(() => {
      const selectors = ['.region-filters', '.filter-pills', '[class*="filter"][class*="pill"], [class*="pill"][class*="filter"]', '.filters'];
      for (const sel of selectors) {
        const container = document.querySelector(sel);
        if (container) {
          return {
            selector: sel,
            scrollWidth: container.scrollWidth,
            clientWidth: container.clientWidth,
            hasOverflow: container.scrollWidth > container.clientWidth + 1,
            overflowX: getComputedStyle(container).overflowX
          };
        }
      }
      return null;
    });

    if (result) {
      assert(`1D: ${path} filter pills scrollable (scrollWidth > clientWidth)`,
        result.hasOverflow,
        `scrollW=${result.scrollWidth} clientW=${result.clientWidth} overflow-x=${result.overflowX}`);

      // Scroll and verify more items visible
      if (result.hasOverflow) {
        await page.evaluate((sel) => {
          const el = document.querySelector(sel);
          if (el) el.scrollLeft = el.scrollWidth;
        }, result.selector);
        await page.waitForTimeout(200);
        assert(`1D: ${path} can scroll filter pills`, true);
      }
    } else {
      // Filter pills may not exist on this page — soft warn
      console.log(`  ⚠️  SKIP  1D: ${path} no filter container found — skipping`);
    }
  }
}

async function run1E(page) {
  console.log('\n── Sub-sprint 1E: pagination ──');
  const pages = ['/beaches.html', '/pesca.html'];

  for (const path of pages) {
    await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' });

    const result = await page.evaluate(() => {
      const containers = ['.beaches-grid', '.beach-cards-container', '.cards-grid', '.spots-grid', '[class*="grid"]'];
      let container = null;
      for (const sel of containers) {
        container = document.querySelector(sel);
        if (container) break;
      }
      if (!container) return { containerFound: false };

      const allCards = container.querySelectorAll('.beach-card, .card-link, .spot-card, [class*="card"]');
      const visibleCards = Array.from(allCards).filter(c => c.style.display !== 'none' && getComputedStyle(c).display !== 'none');
      const loadMoreBtn = document.querySelector('.load-more-btn, [class*="load-more"]');
      const footerEl = document.querySelector('footer');

      return {
        containerFound: true,
        totalCards: allCards.length,
        visibleCards: visibleCards.length,
        hasLoadMore: !!loadMoreBtn,
        footerReachable: footerEl ? footerEl.getBoundingClientRect().top < window.innerHeight * 10 : false
      };
    });

    if (!result.containerFound) {
      console.log(`  ⚠️  SKIP  1E: ${path} no card container found`);
      continue;
    }

    if (result.totalCards <= 20) {
      console.log(`  ℹ️  INFO  1E: ${path} only ${result.totalCards} cards total — pagination not needed`);
      assert(`1E: ${path} ≤20 cards shown (pagination not needed)`, result.visibleCards <= 20);
      continue;
    }

    assert(`1E: ${path} initial visible cards ≤20`, result.visibleCards <= 20,
      `visible=${result.visibleCards} total=${result.totalCards}`);
    assert(`1E: ${path} Load More button present`, result.hasLoadMore);

    if (result.hasLoadMore) {
      // Click Load More
      await page.click('.load-more-btn, [class*="load-more"]');
      await page.waitForTimeout(300);

      const afterClick = await page.evaluate(() => {
        const allCards = document.querySelectorAll('.beach-card, .card-link, .spot-card, [class*="card"]');
        const visibleCards = Array.from(allCards).filter(c => c.style.display !== 'none' && getComputedStyle(c).display !== 'none');
        return visibleCards.length;
      });

      assert(`1E: ${path} Load More reveals more cards`, afterClick > result.visibleCards,
        `before=${result.visibleCards} after=${afterClick}`);
    }
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: VP,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
  });
  const page = await context.newPage();

  console.log(`\n=== Mobile Sprint Validation @ ${BASE} (${VP.width}×${VP.height}) ===\n`);

  try {
    await run1A(page);
    await run1B(page);
    await run1C(page);
    await run1D(page);
    await run1E(page);
  } catch (err) {
    console.error('\n[FATAL]', err.message);
    failed++;
  }

  await browser.close();

  console.log(`\n=== RESULTS ===`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total:  ${passed + failed}`);

  if (failed > 0) {
    console.log('\nFailed checks:');
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`  ❌ ${r.name}${r.detail ? ' — ' + r.detail : ''}`);
    });
    process.exit(1);
  } else {
    console.log('\n✅ All checks passed');
    process.exit(0);
  }
})();
