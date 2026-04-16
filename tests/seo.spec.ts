import { test, expect } from '@playwright/test';

// ---------------------------------------------------------------------------
// Canonical + hreflang — páginas principais
// ---------------------------------------------------------------------------

// canonical/hreflang domain corrected to portal-turismo-portugal-site.pages.dev in Batch 1 (2026-04-15)
const hreflangPages = [
  {
    label:     'Homepage PT',
    url:       '/',
    canonical: /portal-turismo-portugal[^/]*\.pages\.dev\/$/,
    hreflangPT:/portal-turismo-portugal[^/]*\.pages\.dev\/$/,
    hreflangEN:/portal-turismo-portugal[^/]*\.pages\.dev\/en\//,
  },
  {
    label:     'Homepage EN',
    url:       '/en/',
    canonical: /portal-turismo-portugal[^/]*\.pages\.dev\/en\//,
    hreflangPT:/portal-turismo-portugal[^/]*\.pages\.dev\/$/,
    hreflangEN:/portal-turismo-portugal[^/]*\.pages\.dev\/en\//,
  },
  {
    label:     'Planear PT',
    url:       '/planear.html',
    canonical: /planear\.html/,
    hreflangPT:/planear\.html/,
    hreflangEN:/en\/planear\.html/,
  },
];

test.describe('SEO — canonical e hreflang', () => {
  for (const p of hreflangPages) {
    test(`${p.label} — canonical presente e correcto`, async ({ page }) => {
      await page.goto(p.url);
      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(canonical).toBeTruthy();
      expect(canonical).toMatch(p.canonical);
    });

    test(`${p.label} — hreflang PT e EN presentes`, async ({ page }) => {
      await page.goto(p.url);
      const ptHref = await page
        .locator('link[rel="alternate"][hreflang="pt"]')
        .getAttribute('href');
      const enHref = await page
        .locator('link[rel="alternate"][hreflang="en"]')
        .getAttribute('href');
      expect(ptHref).toMatch(p.hreflangPT);
      expect(enHref).toMatch(p.hreflangEN);
    });

    test(`${p.label} — hreflang x-default presente`, async ({ page }) => {
      await page.goto(p.url);
      const xDefault = await page
        .locator('link[rel="alternate"][hreflang="x-default"]')
        .getAttribute('href');
      expect(xDefault).toBeTruthy();
    });
  }
});

// ---------------------------------------------------------------------------
// Console errors — páginas críticas
// ---------------------------------------------------------------------------

const pagesForConsole = [
  { url: '/',              label: 'Homepage PT' },
  { url: '/en/',           label: 'Homepage EN' },
  { url: '/planear.html',  label: 'Planear' },
  { url: '/precos.html',   label: 'Precos' },
];

test.describe('Console — sem erros graves nas páginas críticas', () => {
  for (const { url, label } of pagesForConsole) {
    test(`${label} — sem erros de JS bloqueantes`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (err) => errors.push(err.message));

      await page.goto(url);
      // Give scripts a moment to run
      await page.waitForLoadState('networkidle').catch(() => null);

      // Filter out known non-critical noise (e.g. extension errors, analytics)
      const blocking = errors.filter((msg) =>
        !msg.includes('extension') &&
        !msg.includes('clarity') &&
        !msg.includes('gtag') &&
        !msg.includes('analytics')
      );

      if (blocking.length > 0) {
        // Fail with a descriptive message listing all errors found
        throw new Error(
          `${blocking.length} JS error(s) on ${label}:\n${blocking.join('\n')}`
        );
      }
    });
  }
});
