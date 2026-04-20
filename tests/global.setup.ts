/**
 * global.setup.ts
 * Authenticates once with a real Supabase account and saves storageState
 * to playwright/.auth/user.json for use by auth-dependent tests in Plan 02.
 *
 * Run independently: npx playwright test --project=setup
 * Prerequisites: TEST_USER_EMAIL and TEST_USER_PASSWORD in .env.local
 */
import { test as setup, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const AUTH_FILE = path.join('playwright', '.auth', 'user.json');

setup('authenticate test user', async ({ page }) => {
  // Ensure auth directory exists
  fs.mkdirSync(path.join('playwright', '.auth'), { recursive: true });

  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'TEST_USER_EMAIL and TEST_USER_PASSWORD must be set in .env.local before running auth flow tests. ' +
      'Create a test account in Supabase Dashboard first.'
    );
  }

  await page.goto('/login.html', { waitUntil: 'domcontentloaded' });

  // Dismiss cookie consent if present
  const acceptBtn = page.locator('button:has-text("Aceitar"), button:has-text("Accept")').first();
  if (await acceptBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await acceptBtn.click();
  }

  // Fill login form — selectors from login.html (#login-email / #login-password)
  await page.fill('#login-email', email);
  await page.fill('#login-password', password);
  await page.click('[type="submit"]');

  // Wait for redirect away from login.html (regular users land on / via dashboard guard)
  await page.waitForURL(/conta\.html|dashboard\.html|dashboard$|dashboard\/$|pages\.dev\/$|pages\.dev$|portalturismoportugal\.com\/$|portalturismoportugal\.com$/, { timeout: 15_000 });

  // Save authenticated state
  await page.context().storageState({ path: AUTH_FILE });
});
