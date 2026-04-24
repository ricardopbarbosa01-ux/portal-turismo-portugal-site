import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'fs';

const PAGES = ['/pesca', '/surf', '/beaches', '/webcams'];
const ZOOMS = [0.80, 1.00, 1.25];

test.describe.configure({ mode: 'serial' });

const allResults = [];

for (const path of PAGES) {
  for (const zoom of ZOOMS) {
    test(`${path} @ ${zoom*100}%`, async ({ page }) => {
      await page.goto(`http://localhost:3000${path}`);
      await page.evaluate((z) => {
        document.body.style.zoom = z;
      }, zoom);
      await page.waitForTimeout(1000);

      const results = await new AxeBuilder({ page })
        .withRules(['color-contrast'])
        .analyze();

      const shotName = `${path.slice(1)}-${zoom*100}pct.png`;
      await page.screenshot({
        path: `tests/visual/screenshots/${shotName}`,
        fullPage: true
      });

      allResults.push({
        page: path,
        zoom: `${zoom*100}%`,
        violations: results.violations,
        screenshot: shotName
      });

      if (results.violations.length > 0) {
        console.log(`\n❌ ${path} @ ${zoom*100}%: ${results.violations.length} violações`);
        results.violations.forEach(v => {
          v.nodes.forEach(n => {
            console.log(`  - ${n.target}`);
            console.log(`    ${n.failureSummary}`);
          });
        });
      } else {
        console.log(`✅ ${path} @ ${zoom*100}%: tudo OK`);
      }
    });
  }
}

test.afterAll(async () => {
  fs.writeFileSync(
    'tests/visual/screenshots/axe-report.json',
    JSON.stringify(allResults, null, 2)
  );
});
