/**
 * tools/test-navbar-overflow.js
 * Playwright visual audit for navbar overflow across viewport widths.
 * Usage:
 *   node tools/test-navbar-overflow.js [base-url]
 *   node tools/test-navbar-overflow.js https://www.portalturismoportugal.com
 *   node tools/test-navbar-overflow.js http://localhost:8080
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = process.argv[2] || 'https://www.portalturismoportugal.com';
const PAGE_PATH = '/en/guides.html';
const WIDTHS = [375, 800, 1024, 1100, 1200, 1280, 1366, 1440, 1920];
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots-navbar');

fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

async function auditWidth(page, width) {
  await page.setViewportSize({ width, height: 800 });
  await page.goto(`${BASE_URL}${PAGE_PATH}`, { waitUntil: 'networkidle', timeout: 30000 });

  // Wait for navbar to be visible
  await page.waitForSelector('.navbar', { timeout: 5000 });

  // Screenshot of top 100px (navbar area)
  const screenshotPath = path.join(SCREENSHOT_DIR, `${width}px.png`);
  await page.screenshot({
    path: screenshotPath,
    clip: { x: 0, y: 0, width, height: 100 },
  });

  // Measure Register button
  const registerBtn = await page.$('#nav-register-btn');
  const loginBtn = await page.$('#nav-login-btn');
  const hamburger = await page.$('.hamburger, .nav-toggle, #nav-toggle');

  let registerBBox = null;
  let registerVisible = false;
  let registerInsideViewport = false;

  if (registerBtn) {
    registerBBox = await registerBtn.boundingBox();
    const isVisible = await registerBtn.isVisible();
    registerVisible = isVisible;
    if (registerBBox) {
      registerInsideViewport = registerBBox.x >= 0 && (registerBBox.x + registerBBox.width) <= width;
    }
  }

  // Compute styles for key elements
  const styles = await page.evaluate(() => {
    const get = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const cs = window.getComputedStyle(el);
      return {
        display: cs.display,
        gap: cs.gap,
        padding: cs.padding,
        fontSize: cs.fontSize,
        visibility: cs.visibility,
        overflow: cs.overflow,
        flexWrap: cs.flexWrap,
        minWidth: cs.minWidth,
      };
    };
    return {
      navbar: get('.navbar'),
      navLinks: get('.nav-links'),
      navActions: get('.nav-actions'),
      registerBtn: get('#nav-register-btn'),
      loginBtn: get('#nav-login-btn'),
      hamburger: get('.hamburger') || get('#nav-toggle') || get('.nav-toggle'),
    };
  });

  // Check for horizontal overflow
  const hasOverflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > window.innerWidth;
  });

  const hamburgerVisible = await page.evaluate(() => {
    const el = document.querySelector('.hamburger, .nav-toggle, #nav-toggle');
    if (!el) return false;
    const cs = window.getComputedStyle(el);
    return cs.display !== 'none' && cs.visibility !== 'hidden';
  });

  let diagnosis = '';
  if (width <= 768) {
    if (hamburgerVisible) {
      diagnosis = 'OK — mobile: hamburger visible';
    } else {
      diagnosis = 'BUG — mobile: hamburger should be visible but is not';
    }
  } else if (width <= 1100) {
    if (hamburgerVisible && !registerVisible) {
      diagnosis = 'OK — hamburger active, Register hidden (in mobile menu)';
    } else if (!hamburgerVisible && registerVisible) {
      if (registerInsideViewport) {
        diagnosis = 'OK — desktop mode, Register inside viewport';
      } else {
        diagnosis = 'BUG — Register visible but outside viewport!';
      }
    } else if (hamburgerVisible && registerVisible) {
      if (registerInsideViewport) {
        diagnosis = 'WARN — both hamburger and Register visible (redundant)';
      } else {
        diagnosis = 'BUG — both hamburger and Register visible, Register outside viewport!';
      }
    } else {
      diagnosis = 'WARN — neither hamburger nor Register visible';
    }
  } else if (width <= 1280) {
    if (!registerVisible) {
      diagnosis = 'BUG — Register should be visible at this width but is hidden';
    } else if (registerInsideViewport) {
      diagnosis = 'OK — compressed desktop, Register inside viewport';
    } else {
      diagnosis = 'BUG — Register outside viewport at ' + width + 'px!';
    }
  } else {
    if (registerVisible && registerInsideViewport) {
      diagnosis = 'OK — full desktop, Register inside viewport';
    } else if (!registerVisible) {
      diagnosis = 'BUG — Register should be visible at this width';
    } else {
      diagnosis = 'BUG — Register outside viewport at ' + width + 'px!';
    }
  }

  const hasBug = diagnosis.startsWith('BUG');

  return {
    width,
    diagnosis,
    hasBug,
    hasHorizontalOverflow: hasOverflow,
    hamburgerVisible,
    registerVisible,
    registerInsideViewport,
    registerBBox: registerBBox
      ? { left: Math.round(registerBBox.x), right: Math.round(registerBBox.x + registerBBox.width), width: Math.round(registerBBox.width) }
      : null,
    styles: {
      navLinksDisplay: styles.navLinks?.display,
      navLinksGap: styles.navLinks?.gap,
      navActionsDisplay: styles.navActions?.display,
      registerPadding: styles.registerBtn?.padding,
      registerFontSize: styles.registerBtn?.fontSize,
      hamburgerDisplay: styles.hamburger?.display,
    },
    screenshotPath,
  };
}

async function main() {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(` NAVBAR OVERFLOW AUDIT — ${BASE_URL}${PAGE_PATH}`);
  console.log(`${'═'.repeat(60)}\n`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const results = [];
  for (const width of WIDTHS) {
    process.stdout.write(`  Testing ${width}px...`);
    try {
      const result = await auditWidth(page, width);
      results.push(result);
      const icon = result.hasBug ? '✗' : '✓';
      console.log(` ${icon} ${result.diagnosis}`);
    } catch (err) {
      console.log(` ERROR: ${err.message}`);
      results.push({ width, hasBug: true, diagnosis: `ERROR: ${err.message}` });
    }
  }

  await browser.close();

  console.log(`\n${'─'.repeat(60)}`);
  console.log(' DETAILED REPORT');
  console.log(`${'─'.repeat(60)}\n`);

  for (const r of results) {
    const icon = r.hasBug ? '✗' : '✓';
    console.log(`${icon} ${r.width}px`);
    console.log(`   Diagnosis:          ${r.diagnosis}`);
    if (r.registerBBox) {
      console.log(`   Register BBox:      left=${r.registerBBox.left} right=${r.registerBBox.right} width=${r.registerBBox.width}px`);
      console.log(`   Register in viewport: ${r.registerInsideViewport ? 'YES' : 'NO'}`);
    } else {
      console.log(`   Register:           not in DOM or not measurable`);
    }
    console.log(`   Hamburger visible:  ${r.hamburgerVisible ? 'YES' : 'no'}`);
    console.log(`   H-scroll overflow:  ${r.hasHorizontalOverflow ? 'YES (bug)' : 'no'}`);
    if (r.styles) {
      console.log(`   .nav-links gap:     ${r.styles.navLinksGap || 'n/a'}`);
      console.log(`   Register padding:   ${r.styles.registerPadding || 'n/a'}`);
      console.log(`   Register font-size: ${r.styles.registerFontSize || 'n/a'}`);
    }
    console.log(`   Screenshot:         ${r.screenshotPath}`);
    console.log();
  }

  const bugs = results.filter((r) => r.hasBug);
  console.log(`${'═'.repeat(60)}`);
  if (bugs.length === 0) {
    console.log(' RESULT: ALL WIDTHS PASS — no navbar overflow detected');
  } else {
    console.log(` RESULT: ${bugs.length} BUG(S) FOUND at widths: ${bugs.map((r) => r.width + 'px').join(', ')}`);
  }
  console.log(`${'═'.repeat(60)}\n`);

  process.exit(bugs.length > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
