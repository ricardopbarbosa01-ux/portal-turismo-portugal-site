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

  // Fill login form — selectors confirmed from login.html
  await page.fill('#email', email);
  await page.fill('#password', password);
  await page.click('[type="submit"]');

  // Wait for redirect to conta.html or dashboard
  await page.waitForURL(/conta\.html|dashboard\.html/, { timeout: 15_000 });

  // Save authenticated state
  await page.context().storageState({ path: AUTH_FILE });
});
