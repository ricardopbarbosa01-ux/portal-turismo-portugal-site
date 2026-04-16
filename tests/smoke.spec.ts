import { test, expect, type Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function assertNoFatalError(page: Page) {
  const h1 = await page.locator('h1').first().innerText().catch(() => '');
  // Only flag if the h1 itself is an error indicator (actual error pages)
  expect(h1).not.toMatch(/^(404|500|Page Not Found|Internal Server Error|Application Error)$/i);
  // Also check the title doesn't signal a CDN/host error page
  const title = await page.title();
  expect(title).not.toMatch(/\b(404|500|Error|Not Found|Bad Gateway|Service Unavailable)\b/i);
}

async function assertStructure(page: Page) {
  await expect(page.locator('nav#navbar, nav.navbar').first()).toBeVisible();
  await expect(page.locator('main, main#main').first()).toBeVisible();
  await expect(page.locator('footer').first()).toBeVisible();
}

// ---------------------------------------------------------------------------
// Homepage PT
// ---------------------------------------------------------------------------

test.describe('Homepage PT', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('carrega e mostra estrutura principal', async ({ page }) => {
    await assertStructure(page);
    await assertNoFatalError(page);
  });

  test('tem h1 visível', async ({ page }) => {
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('language switcher mostra PT activo e link EN', async ({ page }) => {
    const switcher = page.locator('div.lang-switcher');
    await expect(switcher).toBeVisible();
    await expect(switcher.locator('[aria-current="true"]')).toHaveText('PT');
    await expect(switcher.locator('a[data-lang="en"]')).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Homepage EN
// ---------------------------------------------------------------------------

test.describe('Homepage EN', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/');
  });

  test('carrega e mostra estrutura principal', async ({ page }) => {
    await assertStructure(page);
    await assertNoFatalError(page);
  });

  test('tem h1 visível', async ({ page }) => {
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('language switcher mostra EN activo e link PT', async ({ page }) => {
    const switcher = page.locator('div.lang-switcher');
    await expect(switcher).toBeVisible();
    await expect(switcher.locator('[aria-current="true"]')).toHaveText('EN');
    await expect(switcher.locator('a[data-lang="pt"]')).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Mudança de idioma PT → EN
// ---------------------------------------------------------------------------

test.describe('Troca de idioma', () => {
  test('clicar EN na homepage PT navega para /en/', async ({ page }) => {
    await page.goto('/');
    await page.locator('div.lang-switcher a[data-lang="en"]').click();
    await expect(page).toHaveURL(/\/en\//);
    await expect(page.locator('div.lang-switcher [aria-current="true"]')).toHaveText('EN');
  });

  test('clicar PT na homepage EN navega para /', async ({ page }) => {
    await page.goto('/en/');
    await page.locator('div.lang-switcher a[data-lang="pt"]').click();
    await expect(page).toHaveURL(/^[^/]*\/(?!en)/);
    await expect(page.locator('div.lang-switcher [aria-current="true"]')).toHaveText('PT');
  });
});

// ---------------------------------------------------------------------------
// /planear
// ---------------------------------------------------------------------------

test.describe('Página /planear', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/planear.html');
  });

  test('carrega e mostra estrutura principal', async ({ page }) => {
    await assertStructure(page);
    await assertNoFatalError(page);
  });

  test('tem h1 visível', async ({ page }) => {
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('tem pelo menos um CTA primário', async ({ page }) => {
    await expect(page.locator('a.btn-primary, button.btn-primary').first()).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// /precos
// ---------------------------------------------------------------------------

test.describe('Página /precos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/precos.html');
  });

  test('carrega e mostra estrutura principal', async ({ page }) => {
    await assertStructure(page);
    await assertNoFatalError(page);
  });

  test('tem h1 visível', async ({ page }) => {
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('mostra conteúdo de preços (main não está vazio)', async ({ page }) => {
    const main = page.locator('main, main#main').first();
    const text = await main.innerText();
    expect(text.trim().length).toBeGreaterThan(50);
  });
});

// ---------------------------------------------------------------------------
// /parceiros
// ---------------------------------------------------------------------------

test.describe('Página /parceiros', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/parceiros.html');
  });

  test('carrega e mostra estrutura principal', async ({ page }) => {
    await assertStructure(page);
    await assertNoFatalError(page);
  });

  test('tem h1 visível', async ({ page }) => {
    await expect(page.locator('h1').first()).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// /contact
// ---------------------------------------------------------------------------

test.describe('Página /contact', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact.html');
  });

  test('carrega e mostra estrutura principal', async ({ page }) => {
    await assertStructure(page);
    await assertNoFatalError(page);
  });

  test('tem h1 visível', async ({ page }) => {
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('mostra conteúdo de contacto (main não está vazio)', async ({ page }) => {
    const main = page.locator('main, main#main').first();
    const text = await main.innerText();
    expect(text.trim().length).toBeGreaterThan(50);
  });
});

// ---------------------------------------------------------------------------
// Página de praia representativa
// ---------------------------------------------------------------------------

test.describe('Página de praia — praias-algarve', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/praias-algarve.html');
  });

  test('carrega sem erro fatal', async ({ page }) => {
    await assertNoFatalError(page);
  });

  test('mostra estrutura principal', async ({ page }) => {
    await assertStructure(page);
  });

  test('tem h1 visível', async ({ page }) => {
    await expect(page.locator('h1').first()).toBeVisible();
  });
});
