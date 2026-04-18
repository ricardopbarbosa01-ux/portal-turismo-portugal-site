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
