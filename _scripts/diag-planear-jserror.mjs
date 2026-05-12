import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

const args = process.argv.slice(2);
const useLocal = args.includes('--local');
const urlArg = args.find(a => a.startsWith('--url='))?.split('=')[1];
const URL = urlArg || (useLocal ? 'http://localhost:3000/planear.html' : 'https://www.portalturismoportugal.com/planear.html');

const NOISE = [
  'chrome-extension://', 'moz-extension://', 'clarity.ms',
  'googletagmanager', 'google-analytics', '-moz-osx-font-smoothing',
  'gtag', 'analytics', 'facebook.net', 'doubleclick.net'
];
const isNoise = (s) => NOISE.some(n => s.includes(n));

async function runScenario(page, scenarioName) {
  const pageErrors = [];
  const consoleErrors = [];
  const requestFailed = [];
  const httpErrors = [];

  page.on('pageerror', e => {
    if (!isNoise(e.message)) pageErrors.push({ message: e.message, stack: e.stack, name: e.name });
  });
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (!isNoise(text)) consoleErrors.push({ text, location: msg.location() });
    }
  });
  page.on('requestfailed', req => {
    const u = req.url();
    if (!isNoise(u)) requestFailed.push({ url: u, failure: req.failure()?.errorText, method: req.method() });
  });
  page.on('response', resp => {
    if (resp.status() >= 400) {
      const u = resp.url();
      if (!isNoise(u)) httpErrors.push({ url: u, status: resp.status() });
    }
  });

  await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  // Scenario interactions
  if (scenarioName === 'submit-empty') {
    // Submit with minimal/empty fields to trigger || null paths
    const nameField = page.locator('input[name="nome"], input[id="nome"], #f-nome, input[placeholder*="nome" i]').first();
    const emailField = page.locator('input[type="email"]').first();
    if (await nameField.count()) await nameField.fill('Test User');
    if (await emailField.count()) await emailField.fill('test@example.com');
    // Leave date/pessoas/orcamento empty (null path)
    const submitBtn = page.locator('button[type="submit"], input[type="submit"], button:has-text("Enviar"), button:has-text("Planear")').first();
    if (await submitBtn.count()) await submitBtn.click();
    await page.waitForTimeout(2000);
  } else if (scenarioName === 'submit-valid') {
    const nameField = page.locator('input[name="nome"], input[id="nome"], #f-nome').first();
    const emailField = page.locator('input[type="email"]').first();
    if (await nameField.count()) await nameField.fill('Test User');
    if (await emailField.count()) await emailField.fill('test@example.com');
    const regionSel = page.locator('select[name="regiao"], select[id="regiao"], #f-regiao').first();
    if (await regionSel.count()) await regionSel.selectOption({ index: 1 });
    const submitBtn = page.locator('button[type="submit"], button:has-text("Enviar"), button:has-text("Planear")').first();
    if (await submitBtn.count()) await submitBtn.click();
    await page.waitForTimeout(2000);
  } else if (scenarioName === 'submit-invalid-email') {
    const nameField = page.locator('input[name="nome"], #f-nome').first();
    const emailField = page.locator('input[type="email"]').first();
    if (await nameField.count()) await nameField.fill('Test');
    if (await emailField.count()) await emailField.fill('not-an-email');
    const submitBtn = page.locator('button[type="submit"], button:has-text("Enviar")').first();
    if (await submitBtn.count()) await submitBtn.click();
    await page.waitForTimeout(2000);
  }

  return { scenarioName, url: URL, pageErrors, consoleErrors, requestFailed, httpErrors };
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const results = [];

  for (const scenario of ['pageload-only', 'submit-empty', 'submit-valid', 'submit-invalid-email']) {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();
    try {
      const result = await runScenario(page, scenario);
      results.push(result);
    } catch(e) {
      results.push({ scenarioName: scenario, url: URL, error: e.message });
    } finally {
      await context.close();
    }
  }

  await browser.close();

  const hasErrors = results.some(r =>
    (r.pageErrors?.length > 0) || (r.consoleErrors?.length > 0) ||
    (r.requestFailed?.length > 0) || (r.httpErrors?.length > 0)
  );

  const output = JSON.stringify({ url: URL, results }, null, 2);
  const suffix = useLocal ? 'local' : (urlArg ? 'prod' : 'prod');
  const outFile = `_scripts/diag-planear-jserror.${suffix}.json`;
  writeFileSync(outFile, output);
  console.log(output);
  process.exit(hasErrors ? 1 : 0);
})();
