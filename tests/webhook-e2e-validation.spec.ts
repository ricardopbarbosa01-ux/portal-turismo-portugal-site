import { test, expect, Page } from '@playwright/test';

const TEST_EMAIL = process.env.TEST_USER_EMAIL ?? 'test-mobile@portalturismoportugal.com';
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD ?? 'PTH-test-m0bile-2026!';

test.describe('Webhook E2E — Pro activation after payment', () => {
  test.setTimeout(180_000);

  test('login → checkout → confirm Pro activated in UI', async ({ page, context }) => {
    // ── 1. Login and wait for actual redirect (not just URL change) ───────────
    await page.goto('/login.html');
    await page.waitForSelector('#login-email', { state: 'visible', timeout: 10_000 });
    await page.fill('#login-email', TEST_EMAIL);
    await page.fill('#login-password', TEST_PASSWORD);
    await page.click('#btn-login');

    // Cloudflare serves /login.html at /login — must wait for post-login destination
    await page.waitForURL(/\/(dashboard|conta)/, { timeout: 20_000 });
    console.log('✓ Login —', page.url());
    await page.screenshot({ path: 'test-results/01-logged-in.png' });

    // ── 2. Precos → click CTA ─────────────────────────────────────────────────
    // Wait for dashboard JS to settle before navigating away
    await page.waitForTimeout(2000);
    await page.goto('/precos.html', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(2000);

    const [popup] = await Promise.all([
      context.waitForEvent('page', { timeout: 5000 }).catch(() => null),
      page.locator('#cta-pro').click(),
    ]);

    const checkout: Page = popup ?? page;
    // Must check hostname, NOT full href (redirect param also contains lemonsqueezy.com)
    await checkout.waitForURL(url => url.hostname.includes('lemonsqueezy.com'), { timeout: 30_000 });
    await checkout.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => {});
    await checkout.waitForTimeout(5000); // let Stripe JS fully initialize
    console.log('✓ Checkout loaded —', checkout.url());
    await checkout.screenshot({ path: 'test-results/02-checkout-loaded.png', fullPage: true });

    // ── 3. Fill email via Stripe email iframe ────────────────────────────────
    // The #email in the main page is a hidden backing input; visible field is in iframe
    const emailFrame = checkout.frameLocator('iframe[title="Secure email input frame"]');
    try {
      const emailInput = emailFrame.locator('input[type="email"], input[autocomplete="email"], input').first();
      await emailInput.fill(TEST_EMAIL, { timeout: 8000 });
      console.log('✓ Email filled via iframe');
    } catch {
      // fallback: try JS on the hidden backing input
      await checkout.evaluate((email) => {
        const el = document.getElementById('email') as HTMLInputElement;
        if (el) { el.value = email; el.dispatchEvent(new Event('input', { bubbles: true })); }
      }, TEST_EMAIL);
      console.log('✓ Email set via JS fallback');
    }

    // ── 4. Fill card via Stripe Payment Element iframe ────────────────────────
    // All card fields (number, expiry, CVC) are in one combined iframe
    const cardFrame = checkout.frameLocator('iframe[title="Secure payment input frame"]');

    // Click first input in the payment frame and type card number
    try {
      const firstInput = cardFrame.locator('input').first();
      await firstInput.click({ timeout: 5000 });
    } catch {
      // click on the iframe element itself
      const iframeEl = checkout.locator('iframe[title="Secure payment input frame"]');
      await iframeEl.click({ timeout: 5000 });
    }
    await checkout.keyboard.type('4242424242424242', { delay: 40 });
    await checkout.waitForTimeout(600);
    await checkout.keyboard.type('1229', { delay: 40 }); // expiry MM/YY
    await checkout.waitForTimeout(400);
    await checkout.keyboard.type('123', { delay: 40 });  // CVC
    await checkout.waitForTimeout(500);
    console.log('✓ Card details typed');

    // ── 5. Fill cardholder name ───────────────────────────────────────────────
    await checkout.fill('#name', 'Test User');
    console.log('✓ Cardholder name filled');

    // ── 6. Fill billing address (US defaults; fill minimum required fields) ───
    // Address line 1
    await checkout.fill('input[placeholder="Address line 1"]', '123 Test Street');
    // State — search-type input
    const stateSearch = checkout.locator('input[placeholder="Select a state…"]');
    await stateSearch.fill('New York');
    await checkout.waitForTimeout(1000);
    const stateOption = checkout.locator('[class*="option"], li, [role="option"]').filter({ hasText: 'New York' }).first();
    if (await stateOption.isVisible({ timeout: 3000 }).catch(() => false)) {
      await stateOption.click();
    } else {
      await checkout.keyboard.press('Enter'); // try keyboard select
    }
    await checkout.fill('#city', 'New York');
    await checkout.fill('#postal_code', '10001');
    console.log('✓ Billing address filled');

    await checkout.screenshot({ path: 'test-results/03-form-filled.png', fullPage: true });

    // ── 7. Wait for submit button to become enabled ───────────────────────────
    const submitBtn = checkout.locator('button[dusk="checkout-form-submit"]');
    await submitBtn.waitFor({ state: 'visible', timeout: 10_000 });
    // Poll until enabled (Stripe validates asynchronously)
    for (let i = 0; i < 20; i++) {
      const disabled = await submitBtn.getAttribute('disabled');
      if (disabled === null) break;
      await checkout.waitForTimeout(500);
    }
    const isEnabled = await submitBtn.isEnabled();
    console.log('Submit button enabled:', isEnabled);
    await checkout.screenshot({ path: 'test-results/04-before-submit.png', fullPage: true });

    if (!isEnabled) {
      throw new Error('Submit button still disabled after form fill — check screenshot 04');
    }

    // ── 8. Submit ─────────────────────────────────────────────────────────────
    const t0 = Date.now();
    await submitBtn.click();
    console.log('✓ Payment submitted');

    // ── 9. Wait for payment confirmation — modal or auto-redirect ────────────
    // In LS test mode, the success_url auto-redirect may not fire.
    // We detect the "Thanks for your order" modal and navigate to conta directly.
    const thanksAppeared = await checkout.waitForSelector('text=Thanks for your order', { timeout: 60_000 })
      .then(() => true)
      .catch(() => false);

    if (thanksAppeared) {
      console.log(`✓ Payment confirmed via modal in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
      await checkout.screenshot({ path: 'test-results/05a-thanks-modal.png' });
    } else if (checkout.url().includes('conta')) {
      console.log(`✓ Auto-redirected to conta in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
    } else {
      throw new Error(`Payment outcome unclear after 60s. URL: ${checkout.url()}`);
    }

    // Navigate directly to conta.html — the webhook should have fired and set plan=pro
    // Give LS 3s to dispatch the webhook before we navigate
    await checkout.waitForTimeout(3000);
    await checkout.goto('/conta.html', { waitUntil: 'domcontentloaded' });
    await checkout.waitForLoadState('networkidle').catch(() => {});
    await checkout.screenshot({ path: 'test-results/05-conta-post-payment.png', fullPage: true });

    // ── 10. Wait for Pro polling (MAX_ATTEMPTS × 2s = up to 12s) ─────────────
    await checkout.waitForTimeout(14_000);
    await checkout.screenshot({ path: 'test-results/06-conta-after-polling.png', fullPage: true });

    // ── 11. Validate Pro state in UI ──────────────────────────────────────────
    const body = await checkout.textContent('body') ?? '';
    const hasPro = /\bpro\b/i.test(body);
    console.log('Pro visible in UI:', hasPro ? '✓ YES' : '✗ NO');
    expect(hasPro, 'conta.html should display Pro status after webhook activation').toBe(true);

    // ── 12. Reload — state must persist ───────────────────────────────────────
    await checkout.reload();
    await checkout.waitForLoadState('networkidle');
    await checkout.waitForTimeout(3000);
    await checkout.screenshot({ path: 'test-results/07-conta-reloaded.png', fullPage: true });
    const bodyReload = await checkout.textContent('body') ?? '';
    expect(/\bpro\b/i.test(bodyReload), 'Pro state must persist after page reload').toBe(true);
    console.log('✓ Pro state persists after reload');
  });
});
