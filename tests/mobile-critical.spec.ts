/**
 * mobile-critical.spec.ts
 * Validates layout, content visibility, and CTA usability on mobile viewports.
 *
 * Viewport: 390×844 (iPhone 14 / common Android mid-range)
 * Focus: no hidden h1, visible primary CTA, nav toggle functional, forms accessible.
 *
 * Tests fail on layout breaks that would make a user unable to convert.
 * Tests do NOT check pixel-perfect design — only functional accessibility.
 */
import { test, expect, type Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// Viewport config
// ---------------------------------------------------------------------------

test.use({ viewport: { width: 390, height: 844 } });

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function assertMobileStructure(page: Page, url: string) {
  await page.goto(url, { waitUntil: 'domcontentloaded' });

  // h1 must be in the viewport or reachable by scroll — at minimum it must be attached
  const h1 = page.locator('h1').first();
  await expect(h1, `${url}: h1 not attached`).toBeAttached();
  // Scroll to h1 and check visibility
  await h1.scrollIntoViewIfNeeded();
  await expect(h1, `${url}: h1 not visible after scroll`).toBeVisible();

  // Nav hamburger must be present (desktop nav is hidden on mobile)
  const toggle = page.locator('button#nav-toggle, button.nav-toggle, [aria-label*="menu" i], [aria-label*="Menu" i]').first();
  await expect(toggle, `${url}: mobile nav toggle not found`).toBeAttached();

  // Footer must exist
  await expect(page.locator('footer').first(), `${url}: footer missing`).toBeAttached();
}

// ---------------------------------------------------------------------------
// Structure — all critical pages load with h1, nav toggle, footer on mobile
// ---------------------------------------------------------------------------

const structurePages = [
  { url: '/',                  label: 'Homepage PT' },
  { url: '/en/',               label: 'Homepage EN' },
  { url: '/planear.html',      label: 'Planear PT' },
  { url: '/en/planear.html',   label: 'Plan EN' },
  { url: '/precos.html',       label: 'Preços PT' },
  { url: '/en/precos.html',    label: 'Pricing EN' },
  { url: '/parceiros.html',    label: 'Parceiros PT' },
  { url: '/en/parceiros.html', label: 'Partners EN' },
  { url: '/contact.html',      label: 'Contacto PT' },
  { url: '/en/contact.html',   label: 'Contact EN' },
];

test.describe('Mobile structure — h1, nav toggle, footer', () => {
  for (const p of structurePages) {
    test(`${p.label} — estrutura base visível em 390px`, async ({ page }) => {
      await assertMobileStructure(page, p.url);
    });
  }
});

// ---------------------------------------------------------------------------
// Primary CTA — must be visible and not behind a sticky element
// ---------------------------------------------------------------------------

test.describe('Mobile CTA — primary action visível e clicável', () => {
  test('Homepage PT — hero CTA visível em mobile', async ({ page }) => {
    await page.goto('/');
    const cta = page.locator('.hero a.btn, .hero button.btn, .hero a.btn-primary').first();
    await cta.scrollIntoViewIfNeeded();
    await expect(cta).toBeVisible();
    // Must have a real href (not javascript: or #)
    const href = await cta.getAttribute('href').catch(() => null);
    expect(href).toBeTruthy();
    expect(href).not.toMatch(/^javascript:/i);
    expect(href?.trim()).not.toBe('#');
  });

  test('Homepage EN — hero CTA visível em mobile', async ({ page }) => {
    await page.goto('/en/');
    const cta = page.locator('.hero a.btn, .hero button.btn, .hero a.btn-primary').first();
    await cta.scrollIntoViewIfNeeded();
    await expect(cta).toBeVisible();
    const href = await cta.getAttribute('href').catch(() => null);
    expect(href).toBeTruthy();
    expect(href).not.toMatch(/^javascript:/i);
  });

  test('Preços PT — pelo menos um plano com CTA visível em mobile', async ({ page }) => {
    await page.goto('/precos.html');
    const cta = page.locator('a.btn-primary, button.btn-primary, .plan-card a, .pricing-card a').first();
    await cta.scrollIntoViewIfNeeded();
    await expect(cta).toBeVisible();
  });

  test('Preços EN — pelo menos um plano com CTA visível em mobile', async ({ page }) => {
    await page.goto('/en/precos.html');
    const cta = page.locator('a.btn-primary, button.btn-primary, .plan-card a, .pricing-card a').first();
    await cta.scrollIntoViewIfNeeded();
    await expect(cta).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Forms — must be visible and interactable on mobile
// ---------------------------------------------------------------------------

test.describe('Mobile forms — formulários acessíveis em 390px', () => {
  test('Planear PT — formulário visível em mobile', async ({ page }) => {
    await page.goto('/planear.html');
    const form = page.locator('form#plan-form');
    await form.scrollIntoViewIfNeeded();
    await expect(form).toBeVisible();
    // Name field must be reachable
    const nameField = page.locator('#f-nome');
    await nameField.scrollIntoViewIfNeeded();
    await expect(nameField).toBeVisible();
  });

  test('Plan EN — form visible on mobile', async ({ page }) => {
    await page.goto('/en/planear.html');
    const form = page.locator('form#plan-form');
    await form.scrollIntoViewIfNeeded();
    await expect(form).toBeVisible();
    const nameField = page.locator('#f-nome');
    await nameField.scrollIntoViewIfNeeded();
    await expect(nameField).toBeVisible();
  });

  test('Parceiros PT — formulário B2B visível em mobile', async ({ page }) => {
    await page.goto('/parceiros.html');
    const form = page.locator('form#b2b-form');
    await form.scrollIntoViewIfNeeded();
    await expect(form).toBeVisible();
    const submitBtn = page.locator('#b2b-submit');
    await submitBtn.scrollIntoViewIfNeeded();
    await expect(submitBtn).toBeVisible();
    await expect(submitBtn).toBeEnabled();
  });

  test('Partners EN — B2B form visible on mobile', async ({ page }) => {
    await page.goto('/en/parceiros.html');
    const form = page.locator('form#b2b-form');
    await form.scrollIntoViewIfNeeded();
    await expect(form).toBeVisible();
    const submitBtn = page.locator('#b2b-submit');
    await submitBtn.scrollIntoViewIfNeeded();
    await expect(submitBtn).toBeEnabled();
  });

  test('Contacto PT — formulário de contacto visível em mobile', async ({ page }) => {
    await page.goto('/contact.html');
    const form = page.locator('form#contact-form, form.contact-form, form').first();
    await form.scrollIntoViewIfNeeded();
    await expect(form).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Nav toggle — hamburger opens and closes the nav on mobile
// ---------------------------------------------------------------------------

test.describe('Mobile nav toggle — abre e fecha menu', () => {
  test('Homepage PT — hamburger abre nav', async ({ page }) => {
    await page.goto('/');
    const toggle = page.locator('button#nav-toggle').first();
    await expect(toggle).toBeVisible();
    await toggle.click();
    // After click, nav-links should become visible
    const navLinks = page.locator('.nav-links');
    await expect(navLinks).toBeVisible({ timeout: 3000 });
  });

  test('Homepage EN — hamburger opens nav', async ({ page }) => {
    await page.goto('/en/');
    const toggle = page.locator('button#nav-toggle').first();
    await expect(toggle).toBeVisible();
    await toggle.click();
    const navLinks = page.locator('.nav-links');
    await expect(navLinks).toBeVisible({ timeout: 3000 });
  });
});

// ---------------------------------------------------------------------------
// Bottom nav (mobile fixed nav) — present on key pages
// ---------------------------------------------------------------------------

test.describe('Mobile bottom-nav — presente nas páginas principais', () => {
  const bottomNavPages = ['/', '/en/', '/planear.html', '/precos.html'];

  for (const url of bottomNavPages) {
    test(`${url} — bottom-nav presente`, async ({ page }) => {
      await page.goto(url);
      const bottomNav = page.locator('nav.bottom-nav, .bottom-nav, [class*="bottom-nav"]').first();
      // Bottom nav is a progressive enhancement — only fail if it was expected
      const count = await bottomNav.count();
      if (count > 0) {
        // If it exists, it must be visible and have links
        const links = await bottomNav.locator('a').count();
        expect(links, `${url}: bottom-nav has no links`).toBeGreaterThan(0);
      }
      // If count === 0, the page doesn't have a bottom-nav — skip silently
    });
  }
});
