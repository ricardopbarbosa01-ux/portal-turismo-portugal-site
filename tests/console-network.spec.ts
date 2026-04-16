/**
 * console-network.spec.ts
 * Hard-failing checks for console errors and network failures on critical pages.
 *
 * Design principles:
 * - Tests FAIL on real errors (not just record them like audit-critical.spec.ts)
 * - Third-party noise filtered at the source (analytics, extensions, Supabase auth)
 * - Network 404/500 on site-owned resources fail the test
 * - External CDN failures (Unsplash, fonts) are recorded but not fatal
 *   (they degrade experience but don't break the funnel)
 */
import { test, expect, type Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns true if the URL is a third-party resource we can't control. */
function isThirdParty(url: string): boolean {
  return (
    url.includes('google-analytics') ||
    url.includes('googletagmanager') ||
    url.includes('clarity.ms') ||
    url.includes('gtag') ||
    url.includes('analytics') ||
    url.includes('facebook.net') ||
    url.includes('chrome-extension') ||
    url.includes('moz-extension') ||
    // Supabase auth refresh calls can fail in test env — not a funnel blocker
    url.includes('supabase.co/auth') ||
    url.includes('supabase.co/realtime')
  );
}

/** Returns true if the console message is ignorable noise. */
function isIgnorableConsoleMsg(msg: string): boolean {
  return (
    msg.includes('chrome-extension') ||
    msg.includes('moz-extension') ||
    msg.includes('clarity') ||
    msg.includes('gtag') ||
    msg.includes('analytics') ||
    msg.includes('favicon') ||
    msg.includes('ERR_BLOCKED_BY_CLIENT') ||
    // Browser security heuristics — not our bug
    msg.includes('Permissions-Policy') ||
    msg.includes('Partitioned cookie')
  );
}

interface PageIssues {
  consoleErrors: string[];
  networkFails: string[];          // requestfailed events
  resourceErrors: string[];        // 4xx/5xx on site-owned resources
  externalWarnings: string[];      // 4xx on third-party (informational only)
}

async function auditPage(page: Page, url: string): Promise<PageIssues> {
  const issues: PageIssues = {
    consoleErrors: [],
    networkFails: [],
    resourceErrors: [],
    externalWarnings: [],
  };

  page.on('pageerror', (err) => {
    const msg = err.message;
    if (!isIgnorableConsoleMsg(msg)) {
      issues.consoleErrors.push(msg);
    }
  });

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (!isIgnorableConsoleMsg(text)) {
        issues.consoleErrors.push(`[console.error] ${text}`);
      }
    }
  });

  page.on('requestfailed', (req) => {
    const reqUrl = req.url();
    const errorText = req.failure()?.errorText ?? 'unknown';
    if (isThirdParty(reqUrl)) return;
    // ERR_BLOCKED_BY_ORB on external images is not our server — classify separately
    if (errorText.includes('ERR_BLOCKED_BY_ORB') && !reqUrl.includes(new URL(page.url()).hostname)) {
      issues.externalWarnings.push(`ORB blocked: ${reqUrl}`);
      return;
    }
    issues.networkFails.push(`${errorText}: ${reqUrl}`);
  });

  page.on('response', (response) => {
    const status = response.status();
    const reqUrl = response.url();
    if (status >= 400 && !isThirdParty(reqUrl)) {
      if (status >= 500) {
        issues.resourceErrors.push(`HTTP ${status}: ${reqUrl}`);
      } else if (status === 404) {
        issues.resourceErrors.push(`HTTP 404: ${reqUrl}`);
      }
    }
  });

  await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 }).catch(() =>
    page.goto(url, { waitUntil: 'domcontentloaded' })
  );
  // Brief settle for deferred scripts
  await page.waitForTimeout(800);

  return issues;
}

// ---------------------------------------------------------------------------
// Critical pages to audit
// ---------------------------------------------------------------------------

const criticalPages = [
  { url: '/',                    label: 'Homepage PT',     lang: 'PT' },
  { url: '/en/',                 label: 'Homepage EN',     lang: 'EN' },
  { url: '/planear.html',        label: 'Planear PT',      lang: 'PT' },
  { url: '/en/planear.html',     label: 'Plan EN',         lang: 'EN' },
  { url: '/precos.html',         label: 'Preços PT',       lang: 'PT' },
  { url: '/en/precos.html',      label: 'Pricing EN',      lang: 'EN' },
  { url: '/parceiros.html',      label: 'Parceiros PT',    lang: 'PT' },
  { url: '/en/parceiros.html',   label: 'Partners EN',     lang: 'EN' },
  { url: '/contact.html',        label: 'Contacto PT',     lang: 'PT' },
  { url: '/en/contact.html',     label: 'Contact EN',      lang: 'EN' },
  { url: '/login.html',          label: 'Login PT',        lang: 'PT' },
  { url: '/en/login.html',       label: 'Login EN',        lang: 'EN' },
];

// ---------------------------------------------------------------------------
// Console errors
// ---------------------------------------------------------------------------

test.describe('Console errors — critical pages', () => {
  for (const p of criticalPages) {
    test(`${p.label} — no blocking JS errors`, async ({ page }) => {
      const issues = await auditPage(page, p.url);

      if (issues.externalWarnings.length > 0) {
        console.log(`[INFO] ${p.label} external warnings (not fatal): ${issues.externalWarnings.join(' | ')}`);
      }

      if (issues.consoleErrors.length > 0) {
        throw new Error(
          `${issues.consoleErrors.length} JS error(s) on ${p.label} (${p.url}):\n` +
          issues.consoleErrors.join('\n')
        );
      }
    });
  }
});

// ---------------------------------------------------------------------------
// Network failures — site-owned resources only
// ---------------------------------------------------------------------------

test.describe('Network failures — site-owned resources', () => {
  for (const p of criticalPages) {
    test(`${p.label} — no network failures on own resources`, async ({ page }) => {
      const issues = await auditPage(page, p.url);

      const allProblems = [...issues.networkFails, ...issues.resourceErrors];

      if (issues.externalWarnings.length > 0) {
        console.log(`[INFO] ${p.label} external resource warnings: ${issues.externalWarnings.join(' | ')}`);
      }

      if (allProblems.length > 0) {
        throw new Error(
          `${allProblems.length} network/resource error(s) on ${p.label} (${p.url}):\n` +
          allProblems.join('\n')
        );
      }
    });
  }
});
