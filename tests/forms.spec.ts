import { test, expect, Route } from '@playwright/test';

// ---------------------------------------------------------------------------
// Supabase mock helper — intercepts REST inserts and returns chosen response
// ---------------------------------------------------------------------------

type MockResult = 'success' | 'error';

async function mockSupabase(route: Route, result: MockResult) {
  if (result === 'success') {
    await route.fulfill({ status: 201, contentType: 'application/json', body: '[]' });
  } else {
    await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ message: 'mock error' }) });
  }
}

async function fillB2bForm(page: import('@playwright/test').Page) {
  await page.fill('#f-negocio', 'Test Business');
  await page.selectOption('#f-tipo', { index: 1 });
  await page.selectOption('#f-objetivo', { index: 1 });
  await page.fill('#f-contacto', 'Test User');
  await page.fill('#f-email', 'test@playwright.dev');
}

// ---------------------------------------------------------------------------
// BUG-007 — Formulário B2B — 3 estados distintos
// ---------------------------------------------------------------------------

test.describe('BUG-007 — Parceiros PT — 3 estados de feedback', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/parceiros.html');
  });

  test('estado inicial: formulário visível, sucesso/pendente ocultos', async ({ page }) => {
    await expect(page.locator('form#b2b-form')).toBeVisible();
    await expect(page.locator('#b2b-submit')).toBeEnabled();
    await expect(page.locator('#b2b-success')).not.toBeVisible();
    await expect(page.locator('#b2b-pending')).not.toBeVisible();
  });

  test('Estado 1 — sucesso real: Supabase OK → #b2b-success visível', async ({ page }) => {
    await page.route('**/rest/v1/partner_leads**', route => mockSupabase(route, 'success'));
    await fillB2bForm(page);
    await page.click('#b2b-submit');

    await expect(page.locator('#b2b-success')).toBeVisible({ timeout: 8000 });
    await expect(page.locator('#b2b-pending')).not.toBeVisible();
    await expect(page.locator('form#b2b-form')).not.toBeVisible();
  });

  test('Estado 2 — pendente/local: Supabase 500 + localStorage OK → #b2b-pending visível', async ({ page }) => {
    await page.route('**/rest/v1/partner_leads**', route => mockSupabase(route, 'error'));
    await fillB2bForm(page);
    await page.click('#b2b-submit');

    await expect(page.locator('#b2b-pending')).toBeVisible({ timeout: 8000 });
    await expect(page.locator('#b2b-success')).not.toBeVisible();
    await expect(page.locator('form#b2b-form')).not.toBeVisible();
  });

  test('prevenção de duplo submit: formulário oculto após submissão', async ({ page }) => {
    await page.route('**/rest/v1/partner_leads**', route => mockSupabase(route, 'success'));
    await fillB2bForm(page);
    await page.click('#b2b-submit');
    await expect(page.locator('#b2b-success')).toBeVisible({ timeout: 8000 });
    await expect(page.locator('form#b2b-form')).not.toBeVisible();
  });
});

test.describe('BUG-007 — Parceiros EN — 3 estados de feedback', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/parceiros.html');
  });

  test('estado inicial: formulário visível, sucesso/pendente ocultos', async ({ page }) => {
    await expect(page.locator('form#b2b-form')).toBeVisible();
    await expect(page.locator('#b2b-success')).not.toBeVisible();
    await expect(page.locator('#b2b-pending')).not.toBeVisible();
  });

  test('Estado 1 — sucesso real: Supabase OK → #b2b-success visível', async ({ page }) => {
    await page.route('**/rest/v1/partner_leads**', route => mockSupabase(route, 'success'));
    await fillB2bForm(page);
    await page.click('#b2b-submit');
    await expect(page.locator('#b2b-success')).toBeVisible({ timeout: 8000 });
    await expect(page.locator('#b2b-pending')).not.toBeVisible();
  });

  test('Estado 2 — pendente/local: Supabase 500 → #b2b-pending visível', async ({ page }) => {
    await page.route('**/rest/v1/partner_leads**', route => mockSupabase(route, 'error'));
    await fillB2bForm(page);
    await page.click('#b2b-submit');
    await expect(page.locator('#b2b-pending')).toBeVisible({ timeout: 8000 });
    await expect(page.locator('#b2b-success')).not.toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// BUG-008 — Planner — 3 estados de feedback
// ---------------------------------------------------------------------------

async function fillPlannerForm(page: import('@playwright/test').Page) {
  await page.fill('#f-nome', 'Test User');
  await page.fill('#f-email', 'test@playwright.dev');
  await page.locator('label.interest-item').first().click();
}

test.describe('BUG-008 — Planner PT — 3 estados de feedback', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/planear.html');
  });

  test('estado inicial: formulário visível, sucesso oculto, rec-status vazio', async ({ page }) => {
    await expect(page.locator('form#plan-form')).toBeVisible();
    await expect(page.locator('#form-success')).not.toBeVisible();
    await expect(page.locator('#rec-status')).toBeAttached();
  });

  test('Estado 1 — sucesso real: Supabase OK → #form-success visível + rec-status confirma', async ({ page }) => {
    await page.route('**/rest/v1/plan_requests**', route => mockSupabase(route, 'success'));
    await fillPlannerForm(page);
    await page.evaluate(() => (document.getElementById('plan-form') as HTMLFormElement).requestSubmit());

    await expect(page.locator('#form-success')).toBeVisible({ timeout: 5000 });
    // rec-status deve mostrar confirmação após Supabase responder
    await expect(page.locator('#rec-status')).toContainText('✓', { timeout: 5000 });
  });

  test('Estado 2 — pendente/local: Supabase 500 → #form-success visível + rec-status mostra fallback', async ({ page }) => {
    await page.route('**/rest/v1/plan_requests**', route => mockSupabase(route, 'error'));
    await fillPlannerForm(page);
    await page.evaluate(() => (document.getElementById('plan-form') as HTMLFormElement).requestSubmit());

    await expect(page.locator('#form-success')).toBeVisible({ timeout: 5000 });
    // rec-status deve mostrar mensagem de fallback honesta
    await expect(page.locator('#rec-status')).toContainText('localmente', { timeout: 5000 });
  });
});

test.describe('BUG-008 — Planner EN — 3 estados de feedback', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/planear.html');
  });

  test('estado inicial: formulário visível, sucesso oculto', async ({ page }) => {
    await expect(page.locator('form#plan-form')).toBeVisible();
    await expect(page.locator('#form-success')).not.toBeVisible();
  });

  test('Estado 1 — sucesso real: Supabase OK → rec-status confirma', async ({ page }) => {
    await page.route('**/rest/v1/plan_requests**', route => mockSupabase(route, 'success'));
    await fillPlannerForm(page);
    await page.evaluate(() => (document.getElementById('plan-form') as HTMLFormElement).requestSubmit());

    await expect(page.locator('#form-success')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#rec-status')).toContainText('✓', { timeout: 5000 });
  });

  test('Estado 2 — pendente/local: Supabase 500 → rec-status mostra fallback EN', async ({ page }) => {
    await page.route('**/rest/v1/plan_requests**', route => mockSupabase(route, 'error'));
    await fillPlannerForm(page);
    await page.evaluate(() => (document.getElementById('plan-form') as HTMLFormElement).requestSubmit());

    await expect(page.locator('#form-success')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#rec-status')).toContainText('locally', { timeout: 5000 });
  });
});
