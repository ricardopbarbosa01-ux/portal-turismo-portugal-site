/**
 * generate-media-kit-pdf.js
 * Generates media-kit.pdf (PT) and media-kit-en.pdf (EN) via Playwright.
 *
 * Usage:
 *   node generate-media-kit-pdf.js          → production URLs
 *   node generate-media-kit-pdf.js --local  → file:// URLs (no deploy needed)
 */

import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const args = process.argv.slice(2);
const LOCAL = args.includes('--local');

function toFileUrl(absPath) {
  // Windows: C:\foo\bar → file:///C:/foo/bar
  return 'file:///' + absPath.replace(/\\/g, '/');
}

const PAGES = [
  {
    url: LOCAL
      ? toFileUrl(path.join(ROOT, 'media-kit-print.html'))
      : 'https://www.portalturismoportugal.com/media-kit-print.html',
    output: path.join(ROOT, 'media-kit.pdf'),
    label: 'media-kit.pdf (PT)',
  },
  {
    url: LOCAL
      ? toFileUrl(path.join(ROOT, 'en', 'media-kit-print.html'))
      : 'https://www.portalturismoportugal.com/en/media-kit-print.html',
    output: path.join(ROOT, 'media-kit-en.pdf'),
    label: 'media-kit-en.pdf (EN)',
  },
];

async function generatePDF({ url, output, label }) {
  console.log(`\n→ Generating ${label}`);
  console.log(`  URL: ${url}`);

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 794, height: 1123 },
    deviceScaleFactor: 2,
  });

  const page = await context.newPage();
  await page.emulateMedia({ media: 'print' });

  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

  // Wait for fonts to load
  await page.waitForFunction(() => document.fonts.ready.then(() => true));

  // Extra buffer for render settle
  await page.waitForTimeout(2000);

  await page.pdf({
    path: output,
    format: 'A4',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    preferCSSPageSize: true,
  });

  await browser.close();

  const stat = fs.statSync(output);
  const kb = Math.round(stat.size / 1024);
  console.log(`  ✓ Saved: ${output} (${kb} KB)`);
  return kb;
}

async function main() {
  const start = Date.now();
  console.log('\n╔═══════════════════════════════════════╗');
  console.log('║   Portugal Travel Hub · PDF Generator ║');
  console.log('╚═══════════════════════════════════════╝');
  console.log(`\nMode: ${LOCAL ? 'LOCAL (file://)' : 'PRODUCTION (https://)'}`);

  const results = [];
  for (const p of PAGES) {
    const kb = await generatePDF(p);
    results.push({ label: p.label, kb });
  }

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log('\n─────────────────────────────────────────');
  results.forEach(r => console.log(`  ${r.label}: ${r.kb} KB`));
  console.log(`\n✓ Done in ${elapsed}s`);

  // Warn if sizes look wrong
  for (const r of results) {
    if (r.kb < 100) console.warn(`  ⚠ ${r.label} is very small — check for render errors`);
    if (r.kb > 10000) console.warn(`  ⚠ ${r.label} is very large — check for unexpected content`);
  }
}

main().catch(err => {
  console.error('\n✗ Error:', err.message);
  process.exit(1);
});
