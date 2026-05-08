const { chromium } = require('@playwright/test');

const CSP_ERROR_KEYWORDS = [
  'TrustedScript',
  'Content Security Policy',
  'Content-Security-Policy',
  'googletagmanager',
  'gtag',
  'dataLayer',
  'CSP',
];

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const cspErrors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (CSP_ERROR_KEYWORDS.some(kw => text.includes(kw))) {
        cspErrors.push(text);
      }
    }
  });

  page.on('pageerror', err => {
    const text = err.message;
    if (CSP_ERROR_KEYWORDS.some(kw => text.includes(kw))) {
      cspErrors.push(text);
    }
  });

  console.log('Loading https://www.portalturismoportugal.com/ ...');
  await page.goto('https://www.portalturismoportugal.com/', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(5000);

  await browser.close();

  console.log(`\nCSP/GTM-related console errors: ${cspErrors.length}`);
  if (cspErrors.length > 0) {
    cspErrors.forEach((e, i) => console.log(`  [${i + 1}] ${e}`));
    process.exit(1);
  } else {
    console.log('✅ No CSP/GTM errors detected');
    process.exit(0);
  }
}

main().catch(e => {
  console.error('Validation script failed:', e);
  process.exit(1);
});
