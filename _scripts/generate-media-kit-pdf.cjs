const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const URL = 'https://www.portalturismoportugal.com/media-kit.html';
const OUTPUT_PATH = path.resolve(__dirname, '..', 'media-kit.pdf');

async function main() {
  console.log(`Generating PDF from: ${URL}`);
  console.log(`Output: ${OUTPUT_PATH}\n`);

  const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });

  try {
    const context = await browser.newContext({ deviceScaleFactor: 2 });
    const page = await context.newPage();
    await page.setViewportSize({ width: 1200, height: 1600 });

    await page.goto(URL, { waitUntil: 'networkidle', timeout: 60000 });
    await page.evaluateHandle('document.fonts.ready');

    await page.addStyleTag({
      content: `
        @page { size: A4; margin: 16mm 14mm; }

        .site-header, .mobile-bottom-nav, .footer,
        nav.navbar, nav.mobile-bottom-nav,
        .i18n-banner, .i18n-notice, .pro-upsell-modal, .cookie-banner,
        .skip-link, [data-banner="en-translation"] {
          display: none !important;
        }

        body {
          padding: 0 !important;
          margin: 0 !important;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        main, .page-content { padding: 0 !important; }

        .ratecard-row, .product-card, section { page-break-inside: avoid; }

        h1, h2, h3 { page-break-after: avoid; }
      `,
    });

    await page.pdf({
      path: OUTPUT_PATH,
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: '16mm', right: '14mm', bottom: '16mm', left: '14mm' },
      displayHeaderFooter: false,
    });

    const stats = fs.statSync(OUTPUT_PATH);
    const sizeKB = (stats.size / 1024).toFixed(1);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
    console.log(`PDF generated: ${sizeKB} KB (${sizeMB} MB)`);

    if (stats.size > 2 * 1024 * 1024) {
      console.error('WARNING: PDF exceeds 2MB limit. Re-run with deviceScaleFactor=1 (edit script line 14).');
      process.exit(1);
    }

    console.log('PDF generated successfully.');
  } finally {
    await browser.close();
  }
}

main().catch(e => {
  console.error('PDF generation failed:', e);
  process.exit(1);
});
