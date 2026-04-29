/**
 * tools/test-navbar-consistency.js
 * Navbar consistency validator — 8 pages × 5 viewports = 40 checks
 *
 * Usage:
 *   node tools/test-navbar-consistency.js [baseUrl]
 *
 * baseUrl defaults to https://portal-turismo-portugal-site.pages.dev
 * Pass https://portalturismoportugal.com to validate production.
 */

const { chromium } = require('playwright');

const BASE_URL = process.argv[2] || 'https://portal-turismo-portugal-site.pages.dev';

const PAGES = [
  '/',
  '/precos.html',
  '/guias.html',
  '/parceiros.html',
  '/planear.html',
  '/en/',
  '/en/guides.html',
  '/guias/melhores-praias-algarve.html',
];

const VIEWPORTS = [768, 1100, 1280, 1440, 1920];

// Expected behaviour per viewport
const EXPECT = {
  768:  { navLinksVisible: false, langSwitcherVisible: false, hamburgerVisible: true },
  1100: { navLinksVisible: false, langSwitcherVisible: false, hamburgerVisible: true },
  1280: { navLinksVisible: true,  langSwitcherVisible: false, hamburgerVisible: false },
  1440: { navLinksVisible: true,  langSwitcherVisible: true,  hamburgerVisible: false },
  1920: { navLinksVisible: true,  langSwitcherVisible: true,  hamburgerVisible: false },
};

// Tolerance for navbar height comparison (pixels)
const HEIGHT_TOLERANCE = 4;

async function measureNavbar(page, url, viewportWidth) {
  await page.setViewportSize({ width: viewportWidth, height: 800 });
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(300);

  return await page.evaluate(() => {
    const navbar = document.getElementById('navbar') || document.querySelector('.navbar');
    if (!navbar) return null;

    const navbarRect = navbar.getBoundingClientRect();
    const navLinks   = navbar.querySelector('.nav-links');
    const langSw     = navbar.querySelector('.lang-switcher');
    const hamburger  = navbar.querySelector('.hamburger, #nav-toggle');
    const loginBtn   = document.getElementById('nav-login-btn');
    const registerBtn = document.getElementById('nav-register-btn');

    function isVisible(el) {
      if (!el) return false;
      const r = el.getBoundingClientRect();
      const cs = window.getComputedStyle(el);
      return cs.display !== 'none' && cs.visibility !== 'hidden' && r.width > 0 && r.height > 0;
    }

    function inViewport(el) {
      if (!el) return false;
      const r = el.getBoundingClientRect();
      return r.right <= window.innerWidth + 2 && r.left >= -2;
    }

    return {
      height: Math.round(navbarRect.height),
      navLinksVisible:   isVisible(navLinks),
      langSwitcherVisible: isVisible(langSw),
      hamburgerVisible:  isVisible(hamburger),
      loginInViewport:   inViewport(loginBtn),
      registerInViewport: inViewport(registerBtn),
      loginDisplay:      loginBtn  ? window.getComputedStyle(loginBtn).display  : 'missing',
      registerDisplay:   registerBtn ? window.getComputedStyle(registerBtn).display : 'missing',
    };
  });
}

async function run() {
  const browser = await chromium.launch();
  const results = [];
  let passed = 0;
  let failed = 0;

  console.log(`\nNavbar Consistency Test — ${BASE_URL}`);
  console.log('='.repeat(72));
  console.log(`${'Page'.padEnd(40)} ${'VP'.padEnd(6)} ${'NavLinks'.padEnd(10)} ${'LangSw'.padEnd(8)} ${'Burger'.padEnd(8)} Height Status`);
  console.log('-'.repeat(72));

  // Collect baseline height at 1440px from /precos.html (reference page)
  const page = await browser.newPage();
  let baselineHeight = null;
  try {
    const baseline = await measureNavbar(page, BASE_URL + '/precos.html', 1440);
    baselineHeight = baseline ? baseline.height : 64;
  } catch (_) {
    baselineHeight = 64;
  }

  for (const pagePath of PAGES) {
    for (const vp of VIEWPORTS) {
      const url = BASE_URL + pagePath;
      let result = { page: pagePath, vp, status: 'ERROR', error: null, data: null };
      try {
        const data = await measureNavbar(page, url, vp);
        if (!data) {
          result.status = 'FAIL';
          result.error = 'navbar element not found';
        } else {
          const exp = EXPECT[vp];
          const checks = [];

          if (data.navLinksVisible !== exp.navLinksVisible)
            checks.push(`navLinks: got ${data.navLinksVisible} want ${exp.navLinksVisible}`);
          if (data.langSwitcherVisible !== exp.langSwitcherVisible)
            checks.push(`langSw: got ${data.langSwitcherVisible} want ${exp.langSwitcherVisible}`);
          if (data.hamburgerVisible !== exp.hamburgerVisible)
            checks.push(`hamburger: got ${data.hamburgerVisible} want ${exp.hamburgerVisible}`);
          if (Math.abs(data.height - baselineHeight) > HEIGHT_TOLERANCE && vp >= 1101)
            checks.push(`height: got ${data.height}px want ~${baselineHeight}px`);
          if (vp >= 1101) {
            if (data.loginDisplay !== 'none' && !data.loginInViewport)
              checks.push('login btn outside viewport');
            if (data.registerDisplay !== 'none' && !data.registerInViewport)
              checks.push('register btn outside viewport');
          }

          result.status = checks.length === 0 ? 'PASS' : 'FAIL';
          result.error = checks.join(' | ');
          result.data = data;
        }
      } catch (e) {
        result.status = 'ERROR';
        result.error = e.message.slice(0, 60);
      }

      results.push(result);
      if (result.status === 'PASS') passed++;
      else failed++;

      const d = result.data || {};
      const row = [
        pagePath.padEnd(40),
        String(vp).padEnd(6),
        String(d.navLinksVisible ?? '?').padEnd(10),
        String(d.langSwitcherVisible ?? '?').padEnd(8),
        String(d.hamburgerVisible ?? '?').padEnd(8),
        String(d.height ?? '?').padEnd(7),
        result.status === 'PASS' ? '✓ PASS' : `✗ FAIL${result.error ? ' — ' + result.error : ''}`,
      ];
      console.log(row.join(' '));
    }
  }

  await browser.close();

  console.log('='.repeat(72));
  console.log(`\nResult: ${passed} PASS / ${failed} FAIL out of ${results.length} checks`);
  if (failed === 0) {
    console.log('\n✓ 40/40 PASS — navbar is consistent across all pages and viewports.');
  } else {
    console.log('\n✗ Some checks failed — see rows above.');
  }
  process.exit(failed > 0 ? 1 : 0);
}

run().catch(err => {
  console.error('Fatal:', err);
  process.exit(2);
});
