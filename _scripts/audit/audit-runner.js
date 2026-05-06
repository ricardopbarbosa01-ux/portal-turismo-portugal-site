const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const PREVIEW_URL = 'https://portalturismoportugal.com';

const VIEWPORTS = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'desktop', width: 1280, height: 800 }
];

const SCREENSHOT_DIR = path.resolve(__dirname, 'screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

const results = {
  pages: [],
  brokenLinks: [],
  consoleErrors: [],
  visualIssues: [],
  summary: {}
};

async function auditPage(browser, pagePath, viewport) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    userAgent: viewport.name === 'mobile'
      ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
      : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
  });

  const page = await context.newPage();
  const fullUrl = PREVIEW_URL + pagePath;
  const pageResult = {
    path: pagePath,
    viewport: viewport.name,
    statusCode: null,
    consoleErrors: [],
    failedRequests: [],
    links: [],
    issues: []
  };

  page.on('console', msg => {
    if (msg.type() === 'error') {
      pageResult.consoleErrors.push(msg.text());
    }
  });

  page.on('requestfailed', req => {
    pageResult.failedRequests.push({
      url: req.url(),
      reason: req.failure()?.errorText
    });
  });

  try {
    const response = await page.goto(fullUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    pageResult.statusCode = response?.status() || null;

    await page.waitForTimeout(2000);

    // Detect horizontal overflow
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth + 2;
    });
    if (hasHorizontalScroll) {
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const viewportWidth = await page.evaluate(() => window.innerWidth);
      pageResult.issues.push({
        type: 'horizontal-overflow',
        severity: 'high',
        description: `Horizontal scroll: scrollWidth=${scrollWidth}px > viewport=${viewportWidth}px (overflow=${scrollWidth - viewportWidth}px)`
      });
    }

    // Detect bottom nav covering content (mobile only)
    if (viewport.name === 'mobile') {
      const bottomNavInfo = await page.evaluate(() => {
        const nav = document.querySelector('.mobile-nav, .bottom-nav, nav[class*="bottom"], [class*="mobile-nav"]');
        if (!nav) return null;
        const rect = nav.getBoundingClientRect();
        const bodyPB = parseInt(window.getComputedStyle(document.body).paddingBottom) || 0;
        return { exists: true, height: Math.round(rect.height), bodyPaddingBottom: bodyPB };
      });
      if (bottomNavInfo && bottomNavInfo.exists && bottomNavInfo.bodyPaddingBottom < 60) {
        pageResult.issues.push({
          type: 'bottom-nav-overlap',
          severity: 'critical',
          description: `Bottom nav (h=${bottomNavInfo.height}px) but body padding-bottom=${bottomNavInfo.bodyPaddingBottom}px — content may be hidden`
        });
      }
    }

    // Check tap targets (mobile)
    if (viewport.name === 'mobile') {
      const smallTargets = await page.evaluate(() => {
        const interactives = document.querySelectorAll('a, button, [role="button"], input[type="submit"], input[type="button"]');
        const small = [];
        interactives.forEach(el => {
          const rect = el.getBoundingClientRect();
          if ((rect.width < 44 || rect.height < 44) && rect.width > 0 && rect.height > 0) {
            small.push({
              tag: el.tagName.toLowerCase(),
              text: (el.textContent || el.getAttribute('aria-label') || '').slice(0, 50).trim(),
              size: `${Math.round(rect.width)}x${Math.round(rect.height)}`
            });
          }
        });
        return small.slice(0, 8);
      });
      if (smallTargets.length > 0) {
        pageResult.issues.push({
          type: 'small-tap-targets',
          severity: 'medium',
          description: `${smallTargets.length}+ tap targets below 44x44px (WCAG 2.5.5)`,
          examples: smallTargets
        });
      }
    }

    // Check for images with broken src (404)
    const brokenImages = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img'));
      return imgs
        .filter(img => !img.complete || img.naturalWidth === 0)
        .map(img => ({ src: img.src, alt: img.alt }))
        .slice(0, 5);
    });
    if (brokenImages.length > 0) {
      pageResult.issues.push({
        type: 'broken-images',
        severity: 'medium',
        description: `${brokenImages.length} broken/unloaded images detected`,
        examples: brokenImages
      });
    }

    // Check for missing meta description (SEO)
    const hasMeta = await page.evaluate(() => {
      const meta = document.querySelector('meta[name="description"]');
      return meta && meta.getAttribute('content') && meta.getAttribute('content').trim().length > 0;
    });
    if (!hasMeta) {
      pageResult.issues.push({
        type: 'missing-meta-description',
        severity: 'low',
        description: 'No meta[name="description"] found — SEO issue'
      });
    }

    // Check for missing page title
    const pageTitle = await page.evaluate(() => document.title);
    if (!pageTitle || pageTitle.trim().length === 0) {
      pageResult.issues.push({
        type: 'missing-title',
        severity: 'medium',
        description: 'Page has no <title> tag'
      });
    } else {
      pageResult.title = pageTitle;
    }

    // Collect all internal links for cross-page validation
    const links = await page.evaluate((baseUrl) => {
      const all = Array.from(document.querySelectorAll('a[href]'));
      return all.map(a => ({
        href: a.getAttribute('href'),
        text: (a.textContent || '').slice(0, 60).trim(),
        resolvedHref: a.href
      })).filter(l =>
        l.href &&
        !l.href.startsWith('#') &&
        !l.href.startsWith('mailto:') &&
        !l.href.startsWith('tel:') &&
        !l.href.startsWith('javascript:') &&
        !l.href.startsWith('data:')
      );
    }, PREVIEW_URL);
    pageResult.links = links;

    // Screenshot (only if has issues or is a key page)
    const KEY_PAGES = ['/', '/index.html', '/beaches.html', '/planear.html', '/precos.html', '/login.html', '/surf.html', '/pesca.html', '/webcams.html', '/en/index.html'];
    const isKeyPage = KEY_PAGES.includes(pagePath);
    const hasIssues = pageResult.issues.length > 0;

    if (isKeyPage || hasIssues) {
      const screenshotName = `${pagePath.replace(/[/\\]/g, '_').replace(/^_/, '')}_${viewport.name}.png`;
      try {
        await page.screenshot({
          path: path.join(SCREENSHOT_DIR, screenshotName),
          fullPage: false
        });
        pageResult.screenshot = screenshotName;
      } catch (ssErr) {
        pageResult.screenshotError = ssErr.message;
      }
    }

  } catch (err) {
    pageResult.error = err.message;
    if (err.message.includes('net::ERR') || err.message.includes('timeout')) {
      pageResult.issues.push({
        type: 'page-load-failure',
        severity: 'critical',
        description: `Failed to load: ${err.message.slice(0, 100)}`
      });
    }
  } finally {
    await context.close();
  }

  return pageResult;
}

async function checkInternalLinks(browser, allLinks) {
  console.log(`\nChecking ${allLinks.length} unique internal links for 404s...`);
  const context = await browser.newContext();
  const page = await context.newPage();
  const broken = [];

  for (let i = 0; i < allLinks.length; i++) {
    const link = allLinks[i];
    let url;
    if (link.startsWith('http')) {
      // Only check links pointing to our own domain
      if (!link.includes('portalturismoportugal.com') && !link.includes('portal-turismo-portugal-site.pages.dev')) {
        continue;
      }
      url = link;
    } else if (link.startsWith('/')) {
      url = PREVIEW_URL + link;
    } else {
      url = PREVIEW_URL + '/' + link;
    }

    try {
      const response = await page.goto(url, { timeout: 15000, waitUntil: 'domcontentloaded' });
      const status = response?.status();
      if (!status || status >= 400) {
        broken.push({ href: link, status, resolvedUrl: url });
        process.stdout.write(`  ❌ ${status} ${link}\n`);
      }
    } catch (err) {
      broken.push({ href: link, error: err.message.slice(0, 80), resolvedUrl: url });
    }

    if ((i + 1) % 20 === 0) {
      process.stdout.write(`  [${i + 1}/${allLinks.length}] links checked...\n`);
    }
  }

  await context.close();
  return broken;
}

async function main() {
  const rawJson = fs.readFileSync(path.join(__dirname, 'pages.json'), 'utf-8');
  const pages = JSON.parse(rawJson.trim().split('\nTotal:')[0]);
  console.log(`Auditing ${pages.length} pages × ${VIEWPORTS.length} viewports = ${pages.length * VIEWPORTS.length} runs...`);
  console.log(`Target: ${PREVIEW_URL}`);
  console.log(`Screenshots saved to: ${SCREENSHOT_DIR}\n`);

  const browser = await chromium.launch({ headless: true });
  const allLinks = new Set();

  for (let i = 0; i < pages.length; i++) {
    const pagePath = pages[i];
    process.stdout.write(`[${i + 1}/${pages.length}] ${pagePath}`);

    for (const viewport of VIEWPORTS) {
      const result = await auditPage(browser, pagePath, viewport);
      results.pages.push(result);

      result.links?.forEach(l => allLinks.add(l.href));

      result.consoleErrors.forEach(err => {
        results.consoleErrors.push({ page: pagePath, viewport: viewport.name, error: err });
      });
    }

    const mobileResult = results.pages.find(p => p.path === pagePath && p.viewport === 'mobile');
    const desktopResult = results.pages.find(p => p.path === pagePath && p.viewport === 'desktop');
    const totalIssues = (mobileResult?.issues?.length || 0) + (desktopResult?.issues?.length || 0);
    process.stdout.write(` → issues=${totalIssues}, status=${mobileResult?.statusCode || 'ERR'}\n`);
  }

  // Check all unique links
  const uniqueLinks = Array.from(allLinks).filter(l => l && l.trim());
  results.brokenLinks = await checkInternalLinks(browser, uniqueLinks);

  // Summary
  const allIssues = results.pages.flatMap(p => p.issues || []);
  const byType = {};
  allIssues.forEach(issue => {
    byType[issue.type] = (byType[issue.type] || 0) + 1;
  });

  results.summary = {
    targetUrl: PREVIEW_URL,
    pagesAudited: pages.length,
    viewportsAudited: VIEWPORTS.length,
    totalRuns: results.pages.length,
    totalIssues: allIssues.length,
    criticalIssues: allIssues.filter(i => i.severity === 'critical').length,
    highIssues: allIssues.filter(i => i.severity === 'high').length,
    mediumIssues: allIssues.filter(i => i.severity === 'medium').length,
    lowIssues: allIssues.filter(i => i.severity === 'low').length,
    issuesByType: byType,
    consoleErrors: results.consoleErrors.length,
    brokenLinks: results.brokenLinks.length,
    linksChecked: uniqueLinks.length,
    timestamp: new Date().toISOString()
  };

  await browser.close();

  fs.writeFileSync(
    path.join(__dirname, 'audit-results.json'),
    JSON.stringify(results, null, 2)
  );

  console.log('\n=== AUDIT COMPLETE ===');
  console.log(JSON.stringify(results.summary, null, 2));
  console.log(`\nResults: ${path.join(__dirname, 'audit-results.json')}`);
  console.log(`Screenshots: ${SCREENSHOT_DIR}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
