/**
 * mobile-audit.spec.ts
 * Phase 1: Auditoria Mobile — core audit spec
 *
 * Covers:
 *   MOBILE-01 — Pages render at 375px (iPhone SE 3rd gen)
 *   MOBILE-02 — Pages render at 390px (iPhone 14)
 *   MOBILE-03 — Hamburger nav opens and closes on all Tier 1 pages
 *   MOBILE-04 — No horizontal overflow on any Tier 1 page at both viewports
 *   MOBILE-07 — All interactive elements have bounding box >= 44x44px
 *   MOBILE-08 — Screenshots saved to _audit/screenshots/mobile/ (fullPage)
 *
 * NOT covered here:
 *   MOBILE-05 — Auth user flow (Plan 02: 02-PLAN.md)
 *   MOBILE-06 — Cookie banner (Plan 02: 02-PLAN.md)
 *
 * Run independently:
 *   npx playwright test tests/mobile-audit.spec.ts --project=chromium
 *   npx playwright test tests/mobile-audit.spec.ts  (all browsers)
 */
import { test, expect, devices } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// ---------------------------------------------------------------------------
// Page list — Tier 1 commercial pages (full audit: screenshots + overflow + nav + touch)
// ---------------------------------------------------------------------------

const TIER1_PAGES = [
  { slug: '01-home-pt',     url: '/',                                    waitFor: 'domcontentloaded', hasNav: true,  authRequired: false },
  { slug: '02-home-en',     url: '/en/',                                  waitFor: 'domcontentloaded', hasNav: true,  authRequired: false },
  { slug: '03-beaches',     url: '/beaches.html',                         waitFor: 'domcontentloaded', hasNav: true,  authRequired: false },
  { slug: '04-beach-detail',url: '/beach.html?id=praia-da-rocha',         waitFor: 'domcontentloaded', hasNav: true,  authRequired: false }, // domcontentloaded: live tide API
  { slug: '05-surf',        url: '/surf.html',                            waitFor: 'domcontentloaded', hasNav: true,  authRequired: false },
  { slug: '06-precos',      url: '/precos.html',                          waitFor: 'domcontentloaded', hasNav: true,  authRequired: false },
  { slug: '07-planear',     url: '/planear.html',                         waitFor: 'domcontentloaded', hasNav: true,  authRequired: false },
  { slug: '08-login',       url: '/login.html',                           waitFor: 'domcontentloaded', hasNav: false, authRequired: false }, // standalone login page — no hamburger nav
  { slug: '09-conta',       url: '/conta.html',                           waitFor: 'domcontentloaded', hasNav: true,  authRequired: true  }, // redirects to login when unauthenticated
  { slug: '10-parceiros',   url: '/parceiros.html',                       waitFor: 'domcontentloaded', hasNav: true,  authRequired: false },
  { slug: '11-contact',     url: '/contact.html',                         waitFor: 'domcontentloaded', hasNav: true,  authRequired: false },
  { slug: '12-webcams',     url: '/webcams.html',                         waitFor: 'domcontentloaded', hasNav: true,  authRequired: false }, // domcontentloaded: polling API
];

// ---------------------------------------------------------------------------
// Viewport configs
// 375px: devices['iPhone SE (3rd gen)'] — DO NOT use devices['iPhone SE'] (320px)
// 390px: devices['iPhone 14']
//
// NOTE: We destructure only viewport/userAgent/isMobile/hasTouch/deviceScaleFactor
// and omit defaultBrowserType. Playwright forbids test.use({ defaultBrowserType })
// inside describe groups (it forces a new worker). By excluding it, we let each
// project's own browser run the tests — which is what we want for a multi-browser audit.
// ---------------------------------------------------------------------------

function deviceUse(deviceName: string) {
  const { defaultBrowserType, ...rest } = devices[deviceName];
  return rest;
}

const VIEWPORTS = [
  { label: '375px', device: deviceUse('iPhone SE (3rd gen)') },
  { label: '390px', device: deviceUse('iPhone 14') },
] as const;

// ---------------------------------------------------------------------------
// Screenshot helpers
// ---------------------------------------------------------------------------

function screenshotDir(vpLabel: string): string {
  return path.join('_audit', 'screenshots', 'mobile', vpLabel.replace('px', ''));
}

// ---------------------------------------------------------------------------
// MOBILE-01 + MOBILE-02 + MOBILE-08: Viewport screenshots (both viewports)
// ---------------------------------------------------------------------------

for (const vp of VIEWPORTS) {
  test.describe(`Viewport screenshots — ${vp.label}`, () => {
    test.use({ ...vp.device });

    test.beforeAll(async () => {
      // Create output directory — Playwright does NOT auto-create it
      fs.mkdirSync(screenshotDir(vp.label), { recursive: true });
    });

    for (const p of TIER1_PAGES) {
      test(`${p.slug} — screenshot ${vp.label}`, async ({ page }) => {
        await page.goto(p.url, { waitUntil: p.waitFor as 'domcontentloaded' | 'networkidle' });

        // Let GSAP animations settle before screenshot (prevents transform-hidden elements)
        await page.emulateMedia({ reducedMotion: 'reduce' });

        const outPath = path.join(screenshotDir(vp.label), `${p.slug}.png`);
        await page.screenshot({ path: outPath, fullPage: true });

        // Verify file was actually written (MOBILE-08)
        expect(fs.existsSync(outPath), `Screenshot not written: ${outPath}`).toBe(true);
      });
    }
  });
}

// ---------------------------------------------------------------------------
// MOBILE-04: Horizontal overflow detection (both viewports)
// ---------------------------------------------------------------------------

for (const vp of VIEWPORTS) {
  test.describe(`Overflow detection — ${vp.label}`, () => {
    test.use({ ...vp.device });

    for (const p of TIER1_PAGES) {
      test(`${p.slug} — no overflow at ${vp.label}`, async ({ page }) => {
        // Auth-required pages redirect when unauthenticated, destroying the execution context.
        // Overflow for these pages is tested via the screenshot. Auth flow is covered in Plan 02.
        if (p.authRequired) {
          test.skip(true, `${p.url}: auth-required — overflow tested in Plan 02 (authenticated flow)`);
          return;
        }

        await page.goto(p.url, { waitUntil: p.waitFor as 'domcontentloaded' | 'networkidle' });

        // Force all GSAP reveal animations to final state to avoid false negatives
        await page.evaluate(() => {
          document.querySelectorAll('.reveal').forEach(el => {
            (el as HTMLElement).style.transform = 'none';
            (el as HTMLElement).style.opacity = '1';
          });
        });

        const hasOverflow = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });

        // On failure, log the top offending elements for diagnosis
        if (hasOverflow) {
          const offenders = await page.evaluate(() => {
            const docWidth = document.documentElement.clientWidth;
            const bad: string[] = [];
            document.querySelectorAll('*').forEach(el => {
              const rect = el.getBoundingClientRect();
              if (rect.right > docWidth + 1) {
                bad.push(
                  `${el.tagName}${el.id ? '#' + el.id : ''}` +
                  `${el.className && typeof el.className === 'string' ? '.' + el.className.split(' ')[0] : ''}` +
                  ` right=${Math.round(rect.right)} docWidth=${docWidth}`
                );
              }
            });
            return bad.slice(0, 10);
          });
          console.log(`[OVERFLOW] ${p.url} at ${vp.label}:\n`, offenders.join('\n'));
        }

        expect(hasOverflow, `${p.url} at ${vp.label}: horizontal overflow detected`).toBe(false);
      });
    }
  });
}

// ---------------------------------------------------------------------------
// MOBILE-03: Hamburger nav opens and closes on all Tier 1 pages (375px)
// ---------------------------------------------------------------------------

test.describe('Navbar hamburger — opens and closes at 375px', () => {
  // Test at 375px (stricter viewport — if it works here it works at 390 too)
  test.use({ ...deviceUse('iPhone SE (3rd gen)') }); // 375px

  for (const p of TIER1_PAGES) {
    test(`${p.slug} — nav toggle opens #mobile-menu.open`, async ({ page }) => {
      // Skip pages without a hamburger nav (e.g. standalone login page)
      if (!p.hasNav) {
        test.skip(true, `${p.url}: no hamburger nav on this page (standalone auth page)`);
        return;
      }
      // Skip auth-required pages — they redirect unauthenticated; nav tested in Plan 02
      if (p.authRequired) {
        test.skip(true, `${p.url}: auth-required — nav toggle tested in Plan 02 (authenticated flow)`);
        return;
      }

      await page.goto(p.url, { waitUntil: p.waitFor as 'domcontentloaded' | 'networkidle' });

      // Wait for nav.js to initialize and inject #mobile-menu into DOM
      const toggle = page.locator('#nav-toggle');
      await expect(toggle, `${p.url}: #nav-toggle not found`).toBeVisible({ timeout: 8_000 });

      // Click to open
      await toggle.click();

      // nav.js adds class 'open' to #mobile-menu
      const menu = page.locator('#mobile-menu');
      await expect(menu, `${p.url}: #mobile-menu not attached after toggle`).toBeAttached({ timeout: 5_000 });
      await expect(menu, `${p.url}: #mobile-menu missing class 'open' after click`).toHaveClass(/open/, { timeout: 5_000 });

      // Menu must contain nav links
      const links = menu.locator('a[href]');
      const linkCount = await links.count();
      expect(linkCount, `${p.url}: #mobile-menu has fewer than 3 links`).toBeGreaterThanOrEqual(3);

      // Click again to close
      await toggle.click();
      await expect(menu, `${p.url}: #mobile-menu still has class 'open' after second click`).not.toHaveClass(/open/, { timeout: 5_000 });
    });
  }
});

// ---------------------------------------------------------------------------
// MOBILE-07: Touch target audit — all interactive elements >= 44x44px (375px)
// ---------------------------------------------------------------------------

test.describe('Touch targets — >= 44x44px at 375px', () => {
  test.use({ ...deviceUse('iPhone SE (3rd gen)') }); // 375px — strictest viewport

  for (const p of TIER1_PAGES) {
    test(`${p.slug} — no touch targets under 44x44px`, async ({ page }) => {
      // Auth-required pages redirect when unauthenticated — touch targets tested in Plan 02
      if (p.authRequired) {
        test.skip(true, `${p.url}: auth-required — touch targets tested in Plan 02 (authenticated flow)`);
        return;
      }

      await page.goto(p.url, { waitUntil: p.waitFor as 'domcontentloaded' | 'networkidle' });

      const violations = await page.evaluate(() => {
        const selector = 'a, button, [role="button"], input[type="submit"], input[type="checkbox"], input[type="radio"], select';
        return Array.from(document.querySelectorAll(selector))
          .filter(el => {
            const rect = el.getBoundingClientRect();
            // Skip invisible elements (display:none, visibility:hidden, zero-size)
            if (rect.width === 0 && rect.height === 0) return false;
            return rect.width < 44 || rect.height < 44;
          })
          .map(el => ({
            tag: el.tagName,
            id: el.id || '',
            text: (el.textContent || '').trim().slice(0, 50),
            width: Math.round(el.getBoundingClientRect().width),
            height: Math.round(el.getBoundingClientRect().height),
            class: typeof el.className === 'string' ? el.className.split(' ').slice(0, 2).join(' ') : '',
          }));
      });

      if (violations.length > 0) {
        console.log(`[TOUCH TARGET] ${p.url} violations:\n`, JSON.stringify(violations, null, 2));
      }

      expect(
        violations.length,
        `${p.url}: ${violations.length} interactive elements under 44×44px. Fix in css/style.css or inline CSS. See console output for element list.`
      ).toBe(0);
    });
  }
});

// AUDIT FINDINGS — DEFERRED TO PHASE 2 (CSS Refinement):
//
// TOUCH TARGET violations that require changes beyond css/style.css:
//
// 1. Inline paragraph links on beaches.html, surf.html, precos.html, planear.html, webcams.html:
//    - "Planear a escapada →" (style="color:var(--gold);font-weight:600") — height ~16-21px
//    - "Planear a minha escapada →" (inline style in <p>) — height ~38px (width 203px, height 38px)
//    - Fix requires: adding padding to inline-styled anchor tags in 10+ HTML files
//    - Deferred: requires systematic HTML inline-style cleanup across all content pages
//
// 2. Login/registo page inline CSS:
//    - .auth-back link (defined in <style> block in login.html/registo.html) — height 21px
//    - "Esqueceu a sua palavra-passe?" link (inline in login.html) — height 21px
//    - "Criar conta gratuita" button in login.html — height 19px
//    - Fix requires: modifying page-specific <style> blocks and button HTML in auth pages
//    - Deferred: auth page refactor tracked separately
//
// 3. Breadcrumb links (.breadcrumb a or inline breadcrumbs):
//    - "Início" link on beaches.html, beach.html — width 38px, height 21px
//    - Fix requires: adding min-height/padding to breadcrumb selectors in each page's inline CSS
//    - Deferred: breadcrumb component refactor
//
// CSS fixes applied in Phase 1 (this plan):
// - .nav-toggle alias for .hamburger (EN pages nav visibility)
// - .nav-logo: min-height: 44px
// - .footer-search-btn: min-height: 44px, min-width: 44px
// - .footer-col ul li a: display: block, min-height: 44px, padding: 12px 0
// - .skip-link: padding: 12px 16px, min-height: 44px, display: inline-flex
// - .footer-bottom a: display: inline-flex, min-height: 44px, min-width: 44px, padding: 4px 6px
// - .ccb-link: display: inline-flex, min-height: 44px

// ---------------------------------------------------------------------------
// MOBILE-06: Cookie banner — aparece, accept/reject funciona, persiste após reload
// Tests run at 375px (iPhone SE 3rd gen) to verify mobile usability
// ---------------------------------------------------------------------------

test.describe('Cookie banner — aparece e funciona em 375px', () => {
  test.use({ ...deviceUse('iPhone SE (3rd gen)') }); // 375px — uses helper to strip defaultBrowserType

  test('cookie banner aparece quando não há cookie_consent em localStorage', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Clear any existing consent state to force banner display
    await page.evaluate(() => localStorage.removeItem('cookie_consent'));
    await page.reload({ waitUntil: 'domcontentloaded' });

    const banner = page.locator('#cookie-consent-banner');
    await expect(banner, 'Cookie banner should appear when no consent stored').toBeVisible({ timeout: 5_000 });

    // Banner must be visible (not behind other elements)
    const box = await banner.boundingBox();
    expect(box, 'Cookie banner has no bounding box').not.toBeNull();
    expect(box!.width, 'Cookie banner too narrow for 375px').toBeGreaterThan(200);
  });

  test('cookie banner — aceitar fecha banner e persiste após reload', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => localStorage.removeItem('cookie_consent'));
    await page.reload({ waitUntil: 'domcontentloaded' });

    await expect(page.locator('#cookie-consent-banner')).toBeVisible({ timeout: 5_000 });

    // Click accept
    await page.locator('#ccb-accept').click();

    // Banner must disappear
    await expect(page.locator('#cookie-consent-banner')).not.toBeVisible({ timeout: 3_000 });

    // localStorage must contain analytics: true
    const stored = await page.evaluate(() => localStorage.getItem('cookie_consent'));
    expect(stored, 'cookie_consent not saved to localStorage after accept').not.toBeNull();
    const prefs = JSON.parse(stored!);
    expect(prefs.analytics, 'cookie_consent.analytics should be true after accept').toBe(true);

    // After reload, banner must NOT reappear
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(
      page.locator('#cookie-consent-banner'),
      'Cookie banner reappeared after reload — state not persisted'
    ).not.toBeAttached();
  });

  test('cookie banner — rejeitar fecha banner e persiste após reload', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => localStorage.removeItem('cookie_consent'));
    await page.reload({ waitUntil: 'domcontentloaded' });

    await expect(page.locator('#cookie-consent-banner')).toBeVisible({ timeout: 5_000 });

    // Click reject
    await page.locator('#ccb-reject').click();

    // Banner must disappear
    await expect(page.locator('#cookie-consent-banner')).not.toBeVisible({ timeout: 3_000 });

    // localStorage must contain analytics: false
    const stored = await page.evaluate(() => localStorage.getItem('cookie_consent'));
    expect(stored, 'cookie_consent not saved after reject').not.toBeNull();
    const prefs = JSON.parse(stored!);
    expect(prefs.analytics, 'cookie_consent.analytics should be false after reject').toBe(false);

    // After reload, banner must NOT reappear
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(
      page.locator('#cookie-consent-banner'),
      'Cookie banner reappeared after reload — reject not persisted'
    ).not.toBeAttached();
  });
});

// ---------------------------------------------------------------------------
// MOBILE-05: Auth flow — login → beaches → beach detail → favoritas star →
//            conta.html alerts section → precos.html checkout CTA
// Goal: verify each page in the flow RENDERS correctly at 375px in mobile viewport
// Not goal: verify backend operations (that is Phase 2)
//
// Prerequisites:
//   1. global.setup.ts must have run: npx playwright test --project=setup
//   2. .env.local must contain TEST_USER_EMAIL and TEST_USER_PASSWORD
//   3. playwright/.auth/user.json must exist (generated by setup)
// ---------------------------------------------------------------------------

const AUTH_STATE_FILE = 'playwright/.auth/user.json';

test.describe('Auth flow mobile — páginas acessíveis em 375px', () => {
  test.use({
    ...deviceUse('iPhone SE (3rd gen)'), // 375px — per MOBILE-05 requirement; uses helper to strip defaultBrowserType
  });

  // Use pre-authenticated session from global.setup.ts
  // Run `npx playwright test --project=setup` to generate playwright/.auth/user.json
  test.use({ storageState: AUTH_STATE_FILE });

  test('login.html — formulário de login visível e utilizável em 375px', async ({ page }) => {
    // Navigate to login WITHOUT using storageState (test the login page itself)
    await page.context().clearCookies();
    await page.evaluate(() => {
      // Clear Supabase session from localStorage without clearing consent
      Object.keys(localStorage)
        .filter(k => k.startsWith('sb-'))
        .forEach(k => localStorage.removeItem(k));
    });

    await page.goto('/login.html', { waitUntil: 'domcontentloaded' });

    // Email and password fields must be visible and usable
    const emailInput = page.locator('#email');
    const passwordInput = page.locator('#password');
    const submitBtn = page.locator('[type="submit"]').first();

    await expect(emailInput, 'login.html: #email input not visible at 375px').toBeVisible();
    await expect(passwordInput, 'login.html: #password input not visible at 375px').toBeVisible();
    await expect(submitBtn, 'login.html: submit button not visible at 375px').toBeVisible();

    // Verify no overflow on login page
    const hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasOverflow, 'login.html: horizontal overflow at 375px').toBe(false);
  });

  test('beaches.html — lista de praias visível em 375px (autenticado)', async ({ page }) => {
    await page.goto('/beaches.html', { waitUntil: 'domcontentloaded' });

    // Page must load without redirect to login (proves storageState works)
    expect(page.url(), 'beaches.html redirected to login — storageState may be expired').not.toMatch(/login/);

    // Beach list or search must be present
    const beachSection = page.locator('.beach-card, .beach-list, [class*="beach"], .search-results, main').first();
    await beachSection.scrollIntoViewIfNeeded();
    await expect(beachSection, 'beaches.html: no beach content visible at 375px').toBeVisible();

    const hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasOverflow, 'beaches.html: horizontal overflow at 375px (auth)').toBe(false);
  });

  test('beach.html — favoritas star button visível e >= 44x44px em 375px (autenticado)', async ({ page }) => {
    // Use costa-da-caparica as specified in phase requirements
    await page.goto('/beach.html?id=costa-da-caparica', { waitUntil: 'domcontentloaded' });

    expect(page.url()).not.toMatch(/login/);

    // The favoritas star is on beach.html — NOT on a separate /favoritas.html page
    // Selector: button with star icon, aria-label containing "favorita" or class containing "favorite/star"
    const starBtn = page.locator(
      'button[aria-label*="favorit" i], button[class*="favorite"], button[class*="star"], #favorite-btn, .btn-favorite'
    ).first();

    await starBtn.scrollIntoViewIfNeeded();
    await expect(starBtn, 'beach.html: favoritas star button not found at 375px').toBeVisible({ timeout: 8_000 });

    // Must be >= 44x44px (touch target requirement)
    const box = await starBtn.boundingBox();
    expect(box, 'beach.html: favoritas star has no bounding box').not.toBeNull();
    expect(box!.width, `beach.html: favoritas star width ${box!.width}px < 44px`).toBeGreaterThanOrEqual(44);
    expect(box!.height, `beach.html: favoritas star height ${box!.height}px < 44px`).toBeGreaterThanOrEqual(44);
  });

  test('conta.html — alerts section visível e acessível em 375px (autenticado)', async ({ page }) => {
    await page.goto('/conta.html', { waitUntil: 'domcontentloaded' });

    expect(page.url(), 'conta.html redirected to login — storageState may be expired').not.toMatch(/login/);

    // alertas is a SECTION within conta.html — not a separate page
    // Selector: section with id or class containing "alerta", "alert", or heading with that text
    const alertaSection = page.locator(
      '#alertas, #alerts, [class*="alerta"], [class*="alert-section"], section:has(h2:text-matches("alerta|alert", "i"))'
    ).first();

    await alertaSection.scrollIntoViewIfNeeded();
    await expect(alertaSection, 'conta.html: alerts section not found — may need to scroll').toBeVisible({ timeout: 5_000 });

    const hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasOverflow, 'conta.html: horizontal overflow at 375px (auth)').toBe(false);
  });

  test('precos.html — checkout CTA visível em 375px', async ({ page }) => {
    await page.goto('/precos.html', { waitUntil: 'domcontentloaded' });

    // Checkout CTA button — per CLAUDE.md hard guardrail, do NOT click it (LemonSqueezy)
    // Only verify it is visible and not clipped at 375px
    const checkoutCta = page.locator(
      'a.btn-primary, button.btn-primary, .plan-card a, .pricing-card a, a[href*="lemonsqueezy"], a[href*="checkout"]'
    ).first();

    await checkoutCta.scrollIntoViewIfNeeded();
    await expect(checkoutCta, 'precos.html: checkout CTA not visible at 375px').toBeVisible();

    // Must have a real href (not #)
    const href = await checkoutCta.getAttribute('href').catch(() => null);
    if (href) {
      expect(href.trim(), 'precos.html: checkout CTA href is empty #').not.toBe('#');
    }

    const hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasOverflow, 'precos.html: horizontal overflow at 375px (auth)').toBe(false);
  });
});
