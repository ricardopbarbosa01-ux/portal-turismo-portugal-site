import { test, expect } from '@playwright/test';

const EN_PAGES = [
  '/en/beaches',
  '/en/surf',
  '/en/pesca',
  '/en/webcams',
  '/en/planear',
  '/en/guides',
  '/en/precos',
  '/en/parceiros',
];

test.describe('nav.js i18n — EN pages', () => {
  for (const path of EN_PAGES) {
    test(`${path} — mobile menu shows Sign In / Sign Up`, async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(path);
      // Open mobile menu
      await page.locator('#nav-toggle').click();
      await expect(page.locator('#mobile-menu')).toBeVisible();
      // Check EN labels
      await expect(page.locator('.btn-mobile-login')).toHaveText('Sign In');
      await expect(page.locator('.btn-mobile-register')).toHaveText('Sign Up');
      // Check EN login hrefs
      await expect(page.locator('.btn-mobile-login')).toHaveAttribute('href', /\/en\/login/);
    });

    test(`${path} — mobile menu has lang switcher`, async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(path);
      await page.locator('#nav-toggle').click();
      const mobileLang = page.locator('#mobile-menu .mobile-lang');
      await expect(mobileLang).toBeVisible();
      // EN is active, PT is a link
      await expect(mobileLang.locator('.lang-btn--active')).toHaveText('EN');
      await expect(mobileLang.locator('a[data-lang="pt"]')).toBeVisible();
    });
  }
});

test.describe('nav.js i18n — PT smoke (no regression)', () => {
  for (const path of ['/', '/beaches', '/surf', '/planear']) {
    test(`${path} — mobile menu shows Entrar / Registar`, async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(path);
      await page.locator('#nav-toggle').click();
      await expect(page.locator('#mobile-menu')).toBeVisible();
      await expect(page.locator('.btn-mobile-login')).toHaveText('Entrar');
      await expect(page.locator('.btn-mobile-register')).toHaveText('Registar');
    });
  }
});
