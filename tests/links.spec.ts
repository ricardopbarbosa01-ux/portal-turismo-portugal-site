/**
 * links.spec.ts
 * Lightweight crawl: validates critical internal nav links actually land on
 * the correct language version and return a live page (visible h1, no 4xx).
 *
 * Strategy: navigate to each page, follow each nav link, verify:
 *   1. The destination loads without a fatal error title
 *   2. A visible h1 exists
 *   3. PT links don't silently land on EN pages and vice versa
 *
 * Run only on Chromium (crawl, not cross-browser UI test).
 */
import { test, expect } from '@playwright/test';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function assertLivePage(page: import('@playwright/test').Page, url: string, lang: 'PT' | 'EN') {
  const response = await page.goto(url, { waitUntil: 'domcontentloaded' });
  // Cloudflare Pages always returns 200 for static files; guard against null
  if (response) {
    expect(response.status(), `${url} returned ${response.status()}`).toBeLessThan(400);
  }
  const title = await page.title();
  expect(title, `${url} title signals error`).not.toMatch(
    /\b(404|500|Not Found|Bad Gateway|Service Unavailable)\b/i
  );
  await expect(page.locator('h1').first(), `${url} has no visible h1`).toBeVisible({ timeout: 10_000 });

  // Language check: PT pages must have lang="pt", EN pages must have lang="en"
  const htmlLang = await page.locator('html').getAttribute('lang');
  const expectedLang = lang === 'PT' ? 'pt' : 'en';
  expect(
    htmlLang?.toLowerCase().startsWith(expectedLang),
    `${url} html[lang]="${htmlLang}" — expected lang="${expectedLang}"`
  ).toBe(true);
}

// ---------------------------------------------------------------------------
// PT nav links — every visible nav link on PT homepage resolves to a PT page
// ---------------------------------------------------------------------------

test.describe('PT nav — all links resolve to live PT pages', () => {
  test.use({ /* Chromium only — fast crawl */ });

  const ptNavLinks: Array<{ label: string; href: string }> = [
    { label: 'Praias',    href: 'beaches.html' },
    { label: 'Surf',      href: 'surf.html' },
    { label: 'Pesca',     href: 'pesca.html' },
    { label: 'Webcams',   href: 'webcams.html' },
    { label: 'Planear',   href: 'planear.html' },
    { label: 'Preços',    href: 'precos.html' },
    { label: 'Parceiros', href: 'parceiros.html' },
  ];

  for (const { label, href } of ptNavLinks) {
    test(`"${label}" → /${href} is a live PT page`, async ({ page }) => {
      await assertLivePage(page, `/${href}`, 'PT');
    });
  }
});

// ---------------------------------------------------------------------------
// EN nav links — every visible nav link on EN homepage resolves to a EN page
// ---------------------------------------------------------------------------

test.describe('EN nav — all links resolve to live EN pages', () => {
  const enNavLinks: Array<{ label: string; href: string }> = [
    { label: 'Beaches',  href: '/en/beaches.html' },
    { label: 'Surf',     href: '/en/surf.html' },
    { label: 'Fishing',  href: '/en/pesca.html' },
    { label: 'Webcams',  href: '/en/webcams.html' },
    { label: 'Plan',     href: '/en/planear.html' },
    { label: 'Pricing',  href: '/en/precos.html' },
    { label: 'Partners', href: '/en/parceiros.html' },
  ];

  for (const { label, href } of enNavLinks) {
    test(`"${label}" → ${href} is a live EN page`, async ({ page }) => {
      await assertLivePage(page, href, 'EN');
    });
  }
});

// ---------------------------------------------------------------------------
// Nav link href integrity — links in the actual DOM match expected values
// (regression guard: catches copy-paste regressions in nav HTML)
// ---------------------------------------------------------------------------

test.describe('Nav href integrity — DOM matches expected values', () => {
  test('PT homepage nav hrefs all point to PT pages (no /en/ prefix)', async ({ page }) => {
    await page.goto('/');
    const links = await page.locator('nav .nav-links a[role="listitem"]').all();
    for (const link of links) {
      const href = await link.getAttribute('href') ?? '';
      // PT nav links are relative (beaches.html) or root-relative (/beaches.html)
      // They must NOT start with /en/
      expect(href, `PT nav link "${href}" has /en/ prefix — regression`).not.toMatch(/^\/en\//);
      // Must not be dead (javascript:, #, empty)
      expect(href).not.toMatch(/^javascript:/i);
      expect(href.trim()).not.toBe('');
      expect(href.trim()).not.toBe('#');
    }
  });

  test('EN homepage nav hrefs all point to EN pages (/en/ prefix)', async ({ page }) => {
    await page.goto('/en/');
    const links = await page.locator('nav .nav-links a[role="listitem"]').all();
    expect(links.length, 'EN nav has fewer links than expected').toBeGreaterThanOrEqual(5);
    for (const link of links) {
      const href = await link.getAttribute('href') ?? '';
      // EN nav links must start with /en/
      expect(href, `EN nav link "${href}" missing /en/ prefix — regression`).toMatch(/^\/en\//);
      expect(href).not.toMatch(/^javascript:/i);
    }
  });
});

// ---------------------------------------------------------------------------
// Critical funnel pages load in both languages (smoke for nav destination)
// ---------------------------------------------------------------------------

test.describe('Critical funnel pages — PT and EN both live', () => {
  const funnelPairs: Array<{ ptPath: string; enPath: string; label: string }> = [
    { ptPath: '/planear.html',  enPath: '/en/planear.html',  label: 'Planear/Plan' },
    { ptPath: '/precos.html',   enPath: '/en/precos.html',   label: 'Preços/Pricing' },
    { ptPath: '/parceiros.html',enPath: '/en/parceiros.html',label: 'Parceiros/Partners' },
    { ptPath: '/contact.html',  enPath: '/en/contact.html',  label: 'Contacto/Contact' },
    { ptPath: '/beaches.html',  enPath: '/en/beaches.html',  label: 'Praias/Beaches' },
  ];

  for (const { ptPath, enPath, label } of funnelPairs) {
    test(`${label} — PT page live`, async ({ page }) => {
      await assertLivePage(page, ptPath, 'PT');
    });
    test(`${label} — EN page live`, async ({ page }) => {
      await assertLivePage(page, enPath, 'EN');
    });
  }
});
