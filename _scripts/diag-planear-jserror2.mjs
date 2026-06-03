/**
 * Diagnostic script v2 — uses domcontentloaded + shorter settle, captures all errors
 */
import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

const args = process.argv.slice(2);
const urlArg = args.find(a => a.startsWith('--url='))?.split('=')[1];
const useLocal = args.includes('--local');
const URL_BASE = urlArg || (useLocal ? 'http://localhost:3000' : 'https://www.portalturismoportugal.com');

const PAGES = [
  URL_BASE + '/planear.html',
  URL_BASE + '/en/planear.html'
];

const NOISE = [
  'chrome-extension://', 'moz-extension://', 'clarity.ms',
  'googletagmanager', 'google-analytics', '-moz-osx-font-smoothing',
  'gtag', 'analytics', 'facebook.net', 'doubleclick.net',
  'supabase.co/auth', 'supabase.co/realtime',
  'Permissions-Policy', 'Partitioned cookie', 'favicon',
  'ERR_BLOCKED_BY_CLIENT'
];
const isNoise = (s) => s && NOISE.some(n => s.includes(n));

async function auditPage(browser, url) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  const pageErrors = [];
  const consoleErrors = [];
  const requestFailed = [];
  const httpErrors = [];
  const networkActivity = [];

  page.on('pageerror', e => {
    if (!isNoise(e.message)) {
      pageErrors.push({ message: e.message, stack: e.stack?.split('\n').slice(0,5).join('\n') });
    }
  });
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (!isNoise(text)) consoleErrors.push({ text, location: msg.location() });
    }
  });
  page.on('requestfailed', req => {
    const u = req.url();
    if (!isNoise(u)) requestFailed.push({ url: u, failure: req.failure()?.errorText });
  });
  page.on('response', resp => {
    const status = resp.status();
    const u = resp.url();
    if (status >= 400 && !isNoise(u)) {
      httpErrors.push({ url: u, status });
    }
    // Track long-running requests
    if (!isNoise(u)) networkActivity.push(u);
  });

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
  } catch(e) {
    // Try with load
    try { await page.goto(url, { waitUntil: 'load', timeout: 15000 }); } catch(e2) {}
  }
  await page.waitForTimeout(4000);

  await context.close();
  return { url, pageErrors, consoleErrors, requestFailed, httpErrors, networkActivity: networkActivity.slice(0,20) };
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const results = [];

  for (const url of PAGES) {
    console.error(`Auditing: ${url}`);
    const result = await auditPage(browser, url);
    results.push(result);
    const hasErrors = result.pageErrors.length > 0 || result.consoleErrors.length > 0 || result.requestFailed.length > 0;
    console.error(`  pageErrors: ${result.pageErrors.length}, consoleErrors: ${result.consoleErrors.length}, requestFailed: ${result.requestFailed.length}`);
    if (result.pageErrors.length) console.error('  PAGE ERRORS:', JSON.stringify(result.pageErrors, null, 2));
    if (result.consoleErrors.length) console.error('  CONSOLE ERRORS:', JSON.stringify(result.consoleErrors, null, 2));
    if (result.requestFailed.length) console.error('  REQUEST FAILED:', JSON.stringify(result.requestFailed, null, 2));
  }

  await browser.close();

  const output = JSON.stringify({ results }, null, 2);
  const suffix = useLocal ? 'local' : 'prod';
  const outFile = `_scripts/diag-planear-jserror.${suffix}.json`;
  writeFileSync(outFile, output);
  console.log(output);
})();
