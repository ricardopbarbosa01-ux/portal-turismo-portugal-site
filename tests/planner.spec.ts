import { test, expect } from '@playwright/test';

// ---------------------------------------------------------------------------
// Planner PT — presença e campos estáveis
// ---------------------------------------------------------------------------

test.describe('Planner PT — estrutura', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/planear.html');
  });

  test('formulário principal está presente', async ({ page }) => {
    await expect(page.locator('form#plan-form')).toBeVisible();
  });

  test('campo nome está presente e editável', async ({ page }) => {
    const input = page.locator('input#f-nome');
    await expect(input).toBeVisible();
    await input.fill('Teste Playwright');
    await expect(input).toHaveValue('Teste Playwright');
  });

  test('campo email está presente e editável', async ({ page }) => {
    const input = page.locator('input#f-email');
    await expect(input).toBeVisible();
    await input.fill('test@playwright.dev');
    await expect(input).toHaveValue('test@playwright.dev');
  });

  test('selector de região contém opções', async ({ page }) => {
    const select = page.locator('select#f-regiao');
    await expect(select).toBeVisible();
    const options = await select.locator('option').count();
    expect(options).toBeGreaterThan(1);
  });

  test('checkboxes de interesse existem e são clicáveis', async ({ page }) => {
    const grid = page.locator('div#interest-grid');
    await expect(grid).toBeVisible();
    // Inputs are visually hidden (custom CSS style) — click the label wrapper
    const labels = grid.locator('label.interest-item');
    const count = await labels.count();
    expect(count).toBeGreaterThan(0);
    await labels.first().click();
    const checkbox = labels.first().locator('input[type="checkbox"]');
    await expect(checkbox).toBeChecked();
  });

  test('radio de orçamento existe e é clicável', async ({ page }) => {
    const grid = page.locator('div#budget-grid');
    await expect(grid).toBeVisible();
    // Inputs are visually hidden — click the label wrapper
    const labels = grid.locator('label.budget-item');
    expect(await labels.count()).toBeGreaterThan(0);
    await labels.first().click();
    const radio = labels.first().locator('input[type="radio"]');
    await expect(radio).toBeChecked();
  });

  test('slider de confirmação está presente', async ({ page }) => {
    await expect(page.locator('div#sld-track')).toBeVisible();
  });

  test('h1 visível e não vazio', async ({ page }) => {
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
    const text = await h1.innerText();
    expect(text.trim().length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Planner EN — presença e campos estáveis
// ---------------------------------------------------------------------------

test.describe('Planner EN — estrutura', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/planear.html');
  });

  test('formulário principal está presente', async ({ page }) => {
    // EN page reuses the same form structure
    await expect(page.locator('form#plan-form')).toBeVisible();
  });

  test('campos nome e email presentes', async ({ page }) => {
    await expect(page.locator('input#f-nome')).toBeVisible();
    await expect(page.locator('input#f-email')).toBeVisible();
  });

  test('h1 visível', async ({ page }) => {
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('language switcher mostra EN activo', async ({ page }) => {
    const switcher = page.locator('div.lang-switcher');
    await expect(switcher).toBeVisible();
    await expect(switcher.locator('[aria-current="true"]')).toHaveText('EN');
  });
});
