import { test } from '@playwright/test';

const TEST_EMAIL = process.env.TEST_USER_EMAIL ?? 'test-mobile@portalturismoportugal.com';
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD ?? 'PTH-test-m0bile-2026!';

test('inspect LS checkout DOM — find card input selectors', async ({ page, context }) => {
  test.setTimeout(90_000);

  // Login
  await page.goto('/login.html');
  await page.waitForSelector('#login-email', { state: 'visible', timeout: 10_000 });
  await page.fill('#login-email', TEST_EMAIL);
  await page.fill('#login-password', TEST_PASSWORD);
  await page.click('#btn-login');
  // Cloudflare serves /login.html at /login (strips .html) so we must wait for the
  // actual post-login destination, not just "not login.html"
  await page.waitForURL(/\/(dashboard|conta)/, { timeout: 20_000 });
  console.log('Login OK —', page.url());

  // Go to precos, click CTA
  await page.goto('/precos.html');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  const [popup] = await Promise.all([
    context.waitForEvent('page', { timeout: 5000 }).catch(() => null),
    page.locator('#cta-pro').click(),
  ]);

  const checkout = popup ?? page;
  // Wait until we're actually on the LS domain
  // Must check hostname, not full href (redirect param also contains lemonsqueezy.com)
  await checkout.waitForURL(url => url.hostname.includes('lemonsqueezy.com'), { timeout: 30_000 });
  await checkout.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => {});
  await checkout.waitForTimeout(5000); // let Stripe JS fully initialize

  console.log('On checkout URL:', checkout.url());
  await checkout.screenshot({ path: 'test-results/inspect-checkout.png', fullPage: true });

  // Dump iframes
  const iframes = await checkout.evaluate(() =>
    Array.from(document.querySelectorAll('iframe')).map(f => ({
      src: (f.src ?? '').substring(0, 120),
      name: f.name,
      title: f.title,
      id: f.id,
      allow: f.allow,
    }))
  );
  console.log('=== IFRAMES ===\n', JSON.stringify(iframes, null, 2));

  // Dump all input elements
  const inputs = await checkout.evaluate(() =>
    Array.from(document.querySelectorAll('input')).map(i => ({
      type: i.type,
      name: i.name,
      id: i.id,
      placeholder: i.placeholder,
      autocomplete: i.autocomplete,
      className: (i.className ?? '').substring(0, 80),
    }))
  );
  console.log('=== INPUTS ===\n', JSON.stringify(inputs, null, 2));

  // Dump buttons
  const buttons = await checkout.evaluate(() =>
    Array.from(document.querySelectorAll('button')).map(b => ({
      type: b.type,
      disabled: b.disabled,
      dusk: b.getAttribute('dusk'),
      text: (b.textContent ?? '').trim().substring(0, 60),
    }))
  );
  console.log('=== BUTTONS ===\n', JSON.stringify(buttons, null, 2));

  // Count frames
  console.log('=== PAGE FRAMES ===\n', checkout.frames().map(f => `name="${f.name()}" url="${f.url().substring(0, 100)}"`).join('\n'));
});
