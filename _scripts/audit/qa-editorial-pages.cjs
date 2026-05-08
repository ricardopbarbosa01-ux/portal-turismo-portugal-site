const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const PROD_BASE = 'https://www.portalturismoportugal.com';
const SCREENSHOTS_DIR = path.resolve(__dirname, 'screenshots-editorial');
const REPORT_PATH = path.resolve(__dirname, 'qa-editorial-report.md');

const EDITORIAL_PAGES = [
  'en/hidden-beaches-algarve.html',
  'en/hidden-beaches.html',
  'escondidas.html',
  'guias/melhores-praias-algarve.html',
  'guias/pesca-portugal.html',
  'guias/praias-perto-lisboa.html',
  'guias/quando-visitar-portugal.html',
  'guias/surf-portugal-iniciantes.html',
];

const VIEWPORTS = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'desktop', width: 1280, height: 800 },
];

if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

async function auditPage(browser, url, viewport) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    userAgent: viewport.name === 'mobile'
      ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)'
      : undefined,
  });

  const page = await context.newPage();
  const flags = [];
  const consoleErrors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', err => consoleErrors.push(err.message));

  try {
    const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

    if (!response.ok()) {
      flags.push(`HTTP ${response.status()}`);
      await context.close();
      return { url, viewport: viewport.name, flags, consoleErrors: 0, status: response.status() };
    }

    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(1000);

    // 1. Horizontal overflow
    const overflow = await page.evaluate(() => ({
      bodyScroll: document.body.scrollWidth,
      bodyClient: document.body.clientWidth,
      windowInner: window.innerWidth,
    }));
    if (overflow.bodyScroll > overflow.bodyClient + 5) {
      flags.push(`Horizontal overflow: body scrollWidth ${overflow.bodyScroll} > clientWidth ${overflow.bodyClient}`);
    }

    // 2. Headlines overflowing
    const headlines = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      if (!h1) return null;
      const rect = h1.getBoundingClientRect();
      return {
        height: rect.height,
        windowHeight: window.innerHeight,
        ratio: rect.height / window.innerHeight,
        text: h1.textContent.substring(0, 60),
      };
    });
    if (headlines && headlines.ratio > 0.45) {
      flags.push(`Headline ocupa ${Math.round(headlines.ratio * 100)}% do viewport: "${headlines.text}"`);
    }

    // 3. Footer height (mobile only)
    if (viewport.name === 'mobile') {
      const footerHeight = await page.evaluate(() => {
        const f = document.querySelector('.site-footer, footer.footer, footer');
        return f ? f.getBoundingClientRect().height : 0;
      });
      if (footerHeight > 350) {
        flags.push(`Footer altura ${Math.round(footerHeight)}px (esperado <250px após Hotfix 2)`);
      }
    }

    // 4. Tap targets <44x44 (mobile only)
    if (viewport.name === 'mobile') {
      const smallTaps = await page.evaluate(() => {
        const interactives = document.querySelectorAll('a, button, input[type=button], input[type=submit], [role=button]');
        const small = [];
        interactives.forEach(el => {
          const r = el.getBoundingClientRect();
          if (r.width > 0 && r.height > 0 && (r.width < 44 || r.height < 44)) {
            small.push({
              tag: el.tagName.toLowerCase(),
              text: (el.textContent || el.getAttribute('aria-label') || '').substring(0, 30).trim(),
              size: `${Math.round(r.width)}x${Math.round(r.height)}`,
            });
          }
        });
        return small.slice(0, 10);
      });
      if (smallTaps.length > 5) {
        flags.push(`${smallTaps.length}+ tap targets <44x44px (sample: ${smallTaps.slice(0, 3).map(t => `${t.tag}[${t.size}]`).join(', ')})`);
      }
    }

    // 5. Bottom nav coverage check (mobile)
    if (viewport.name === 'mobile') {
      const coverageCheck = await page.evaluate(() => {
        const nav = document.querySelector('.mobile-bottom-nav, nav[aria-label*="rápida"]');
        if (!nav) return null;
        const navRect = nav.getBoundingClientRect();
        const main = document.querySelector('main, #main');
        if (!main) return null;
        const mainRect = main.getBoundingClientRect();
        return {
          navTop: navRect.top,
          mainBottom: mainRect.bottom,
          covered: mainRect.bottom > navRect.top - 8,
        };
      });
      if (coverageCheck && coverageCheck.covered) {
        flags.push('Bottom nav fixa cobre fim do conteúdo (faltam ~80px padding-bottom?)');
      }
    }

    // 6. Console errors
    if (consoleErrors.length > 0) {
      const filtered = consoleErrors.filter(e =>
        !e.includes('TrustedScript') &&
        !e.includes('favicon') &&
        !e.includes('Failed to load resource: net::ERR_BLOCKED_BY_CLIENT')
      );
      if (filtered.length > 0) {
        flags.push(`${filtered.length} console error(s): ${filtered[0].substring(0, 100)}`);
      }
    }

    // 7. Broken images
    const brokenImgs = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img'));
      return imgs.filter(img => img.complete && img.naturalWidth === 0).map(img => ({
        src: img.src,
        alt: img.alt,
      })).slice(0, 5);
    });
    if (brokenImgs.length > 0) {
      flags.push(`${brokenImgs.length} broken image(s): ${brokenImgs[0].src.substring(0, 80)}`);
    }

    // 8. Empty H1 or missing
    const h1Count = await page.evaluate(() => document.querySelectorAll('h1').length);
    if (h1Count === 0) flags.push('Página sem <h1>');
    if (h1Count > 1) flags.push(`Múltiplos <h1> (${h1Count}) — mau para SEO`);

    // 9. Screenshot
    const slug = url.replace(PROD_BASE, '').replace(/[\/\.]/g, '_').replace(/^_/, '');
    const screenshotPath = path.join(SCREENSHOTS_DIR, `${slug}__${viewport.name}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    await context.close();

    return {
      url,
      viewport: viewport.name,
      flags,
      consoleErrors: consoleErrors.length,
      screenshot: path.relative(path.resolve(__dirname, '..', '..'), screenshotPath),
      status: 200,
    };

  } catch (err) {
    await context.close();
    return {
      url,
      viewport: viewport.name,
      flags: [`Audit error: ${err.message}`],
      consoleErrors: 0,
      status: 'error',
    };
  }
}

async function main() {
  console.log(`Auditing ${EDITORIAL_PAGES.length} editorial pages × 2 viewports = ${EDITORIAL_PAGES.length * 2} runs\n`);

  const browser = await chromium.launch({ headless: true });
  const allResults = [];

  try {
    for (const slug of EDITORIAL_PAGES) {
      const url = `${PROD_BASE}/${slug}`;
      console.log(`\n${slug}`);

      for (const vp of VIEWPORTS) {
        process.stdout.write(`  ${vp.name} (${vp.width}x${vp.height})... `);
        const result = await auditPage(browser, url, vp);
        allResults.push(result);

        if (result.flags.length === 0) {
          console.log('✅');
        } else {
          console.log(`⚠️ ${result.flags.length} flag(s)`);
          result.flags.forEach(f => console.log(`     - ${f}`));
        }
      }
    }
  } finally {
    await browser.close();
  }

  const totalFlags = allResults.reduce((sum, r) => sum + r.flags.length, 0);
  const pagesWithFlags = new Set(allResults.filter(r => r.flags.length > 0).map(r => r.url));

  let md = `# QA Editorial Pages — Mobile + Desktop Audit
**Generated:** ${new Date().toISOString()}
**Pages audited:** ${EDITORIAL_PAGES.length}
**Total runs:** ${allResults.length}
**Pages with flags:** ${pagesWithFlags.size} / ${EDITORIAL_PAGES.length}
**Total flags:** ${totalFlags}

---

## Resumo executivo

| Página | Mobile flags | Desktop flags | Status |
|--------|--------------|---------------|--------|
${EDITORIAL_PAGES.map(slug => {
  const m = allResults.find(r => r.url.endsWith(slug) && r.viewport === 'mobile');
  const d = allResults.find(r => r.url.endsWith(slug) && r.viewport === 'desktop');
  const mFlags = m ? m.flags.length : 0;
  const dFlags = d ? d.flags.length : 0;
  const status = (mFlags + dFlags) === 0 ? '✅ Clean' : `⚠️ ${mFlags + dFlags} flag(s)`;
  return `| ${slug} | ${mFlags} | ${dFlags} | ${status} |`;
}).join('\n')}

---

## Detalhe por página

${EDITORIAL_PAGES.map(slug => {
  const m = allResults.find(r => r.url.endsWith(slug) && r.viewport === 'mobile');
  const d = allResults.find(r => r.url.endsWith(slug) && r.viewport === 'desktop');

  let section = `### ${slug}\n\n**URL:** ${PROD_BASE}/${slug}\n\n`;

  for (const r of [m, d].filter(Boolean)) {
    section += `**${r.viewport.toUpperCase()}** ${r.status === 200 ? `(HTTP 200)` : `(${r.status})`}\n`;
    if (r.flags.length === 0) {
      section += `✅ No flags detected\n\n`;
    } else {
      section += `Flags (${r.flags.length}):\n`;
      r.flags.forEach(f => section += `- ${f}\n`);
      section += '\n';
    }
    if (r.screenshot) {
      section += `Screenshot: \`${r.screenshot}\`\n\n`;
    }
  }

  return section;
}).join('---\n\n')}

---

## Recomendação para Ricardo

${pagesWithFlags.size === 0
  ? '✅ Todas as 8 páginas editoriais passam audit automático. Não há flags estruturais.\n\nValidação visual humana opcional — confiar no audit ou fazer scan rápido das 8 páginas em DevTools 375×667.'
  : `${pagesWithFlags.size} páginas com flags detectadas. Priorizar validação visual nestas páginas:\n\n${[...pagesWithFlags].map(u => `- ${u.replace(PROD_BASE + '/', '')}`).join('\n')}\n\nPáginas sem flags podem ser pulladas (audit automático passou).\n\nApós validar, comunicar:\n- "Flag X em página Y é falso positivo" → ignorar\n- "Confirmo flag X" → adicionar a hotfix list\n- "Vejo bug não-detectado pelo audit (ex: cor errada, copy fraco)" → reportar manualmente`
}
`;

  fs.writeFileSync(REPORT_PATH, md, 'utf8');
  console.log(`\n\n✅ Report: ${REPORT_PATH}`);
  console.log(`Screenshots: ${SCREENSHOTS_DIR}`);
  console.log(`\nSummary: ${pagesWithFlags.size}/${EDITORIAL_PAGES.length} páginas com flags, ${totalFlags} flags totais`);
}

main().catch(e => { console.error(e); process.exit(1); });
