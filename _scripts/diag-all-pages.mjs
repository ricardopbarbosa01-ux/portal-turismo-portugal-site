/**
 * Diagnostic: check all critical pages for console errors, showing full error text + location
 */
import { chromium } from 'playwright';

const BASE = process.argv[2] || 'https://www.portalturismoportugal.com';

const PAGES = [
  BASE + '/planear.html',
  BASE + '/en/planear.html',
  BASE + '/parceiros.html',
  BASE + '/en/parceiros.html',
  BASE + '/contact.html',
  BASE + '/login.html',
  BASE + '/en/login.html',
];

const FILTERED = [
  'chrome-extension', 'moz-extension', 'clarity', 'gtag', 'analytics', 'favicon',
  'ERR_BLOCKED_BY_CLIENT', 'Permissions-Policy', 'Partitioned cookie',
  // Our new filters:
  'TrustedHTML', 'TrustedScript', 'TrustedScriptURL', 'xr-spatial-tracking',
  'challenge-platform', 'challenges.cloudflare.com', 'srcdoc',
];
const isFiltered = (s) => s && FILTERED.some(f => s.includes(f));

async function auditPage(browser, url) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  const pageErrors = [];
  const consoleErrors = [];

  page.on('pageerror', e => {
    if (!isFiltered(e.message)) pageErrors.push({ message: e.message, stack: e.stack?.split('\n').slice(0,3).join('\n') });
  });
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (!isFiltered(text)) consoleErrors.push({ text, loc: msg.location()?.url });
    }
  });

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  } catch(e) {
    try { await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 }); } catch(e2) {}
  }
  await page.waitForTimeout(2000);
  await context.close();

  const clean = pageErrors.length === 0 && consoleErrors.length === 0;
  console.log(`${clean ? 'PASS' : 'FAIL'} ${url}`);
  if (pageErrors.length) console.log('  pageerrors:', JSON.stringify(pageErrors, null, 2));
  if (consoleErrors.length) console.log('  console errors:', JSON.stringify(consoleErrors, null, 2));
  return { url, pageErrors, consoleErrors };
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  for (const url of PAGES) {
    await auditPage(browser, url);
  }
  await browser.close();
})();
