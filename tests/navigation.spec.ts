import { test, expect } from '@playwright/test';

// ---------------------------------------------------------------------------
// Critical nav links — PT homepage
// ---------------------------------------------------------------------------

test.describe('Navegação PT — links críticos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  const criticalLinks: Array<{ label: string; href: string }> = [
    { label: 'Praias',     href: 'beaches.html' },
    { label: 'Surf',       href: 'surf.html' },
    { label: 'Planear',    href: 'planear.html' },
    { label: 'Preços',     href: 'precos.html' },
    { label: 'Parceiros',  href: 'parceiros.html' },
  ];

  for (const { label, href } of criticalLinks) {
    test(`link "${label}" presente e acessível`, async ({ page }) => {
      const link = page.locator(`nav .nav-links a[href="${href}"]`);
      await expect(link).toBeAttached();
      // Verify href is not empty / javascript: void
      const hrefAttr = await link.getAttribute('href');
      expect(hrefAttr).toBeTruthy();
      expect(hrefAttr).not.toMatch(/^javascript:/i);
    });
  }

  test('login e register não apontam para link vazio', async ({ page }) => {
    const login    = page.locator('a#nav-login-btn');
    const register = page.locator('a#nav-register-btn');
    await expect(login).toBeAttached();
    await expect(register).toBeAttached();
    expect(await login.getAttribute('href')).toBeTruthy();
    expect(await register.getAttribute('href')).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Critical nav links — EN homepage
// ---------------------------------------------------------------------------

test.describe('Navegação EN — links críticos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/');
  });

  const criticalLinksEN: Array<{ label: string; href: string }> = [
    { label: 'Beaches',  href: '/en/beaches.html' },
    { label: 'Surf',     href: '/en/surf.html' },
    { label: 'Fishing',  href: '/en/pesca.html' },
    { label: 'Webcams',  href: '/en/webcams.html' },
    { label: 'Plan',     href: '/en/planear.html' },
    { label: 'Pricing',  href: '/en/precos.html' },
    { label: 'Partners', href: '/en/parceiros.html' },
  ];

  for (const { label, href } of criticalLinksEN) {
    test(`link "${label}" presente e acessível`, async ({ page }) => {
      const link = page.locator(`nav .nav-links a[href="${href}"]`);
      await expect(link).toBeAttached();
      const hrefAttr = await link.getAttribute('href');
      expect(hrefAttr).toBeTruthy();
      expect(hrefAttr).not.toMatch(/^javascript:/i);
    });
  }
});

// ---------------------------------------------------------------------------
// Páginas críticas carregam sem erro (PT + EN)
// ---------------------------------------------------------------------------

const criticalPages = [
  { url: '/',              label: 'Homepage PT' },
  { url: '/en/',           label: 'Homepage EN' },
  { url: '/planear.html',  label: 'Planear PT' },
  { url: '/precos.html',   label: 'Precos PT' },
  { url: '/parceiros.html',label: 'Parceiros PT' },
  { url: '/contact.html',  label: 'Contact PT' },
  { url: '/en/planear.html',  label: 'Planear EN' },
  { url: '/en/precos.html',   label: 'Precos EN' },
  { url: '/en/parceiros.html',label: 'Parceiros EN' },
  { url: '/en/contact.html',  label: 'Contact EN' },
];

test.describe('Páginas críticas — sem erro de rota', () => {
  for (const { url, label } of criticalPages) {
    test(`${label} (${url}) carrega com h1 visível`, async ({ page }) => {
      const response = await page.goto(url);
      // Cloudflare Pages always returns 200 for static — guard against null
      if (response) {
        expect(response.status()).toBeLessThan(400);
      }
      await expect(page.locator('h1').first()).toBeVisible({ timeout: 10_000 });
      // Title must not signal a CDN error
      const title = await page.title();
      expect(title).not.toMatch(/\b(404|500|Not Found|Bad Gateway|Service Unavailable)\b/i);
    });
  }
});
