const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE = 'file:///C:/Users/Powerpc/portal-turismo-site';
const OUT = path.join(__dirname, 'screenshots');
fs.mkdirSync(OUT, { recursive: true });

const PAGES = [
  { name: 'homepage', url: `${BASE}/index.html` },
  { name: 'beaches', url: `${BASE}/beaches.html` },
  { name: 'beach-detail', url: `${BASE}/beach.html` },
  { name: 'surf', url: `${BASE}/surf.html` },
  { name: 'planear', url: `${BASE}/planear.html` },
  { name: 'precos', url: `${BASE}/precos.html` },
  { name: 'parceiros', url: `${BASE}/parceiros.html` },
  { name: 'about', url: `${BASE}/about.html` },
  { name: 'contact', url: `${BASE}/contact.html` },
];

const ISSUES = [];

function log(type, page, msg, detail = '') {
  const entry = { type, page, msg, detail };
  ISSUES.push(entry);
  console.log(`[${type}] ${page}: ${msg}${detail ? ' | ' + detail : ''}`);
}

async function auditPage(page, name, url, viewport) {
  const tag = `${name}-${viewport.label}`;
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1500);

    // Screenshot full page
    await page.screenshot({ path: `${OUT}/${tag}-full.png`, fullPage: true });

    // ---- BROKEN IMAGES ----
    const brokenImgs = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img'));
      return imgs
        .filter(img => !img.naturalWidth || img.naturalWidth === 0)
        .map(img => img.getAttribute('src') || 'NO-SRC');
    });
    brokenImgs.forEach(src => log('BROKEN-IMG', tag, 'Imagem partida', src));

    // ---- EMPTY SECTIONS ----
    const emptySections = await page.evaluate(() => {
      const secs = Array.from(document.querySelectorAll('section, .section, main > div, .card, [class*="grid"] > div'));
      return secs
        .filter(s => {
          const txt = (s.innerText || '').trim();
          return txt.length < 8 && !s.querySelector('img, video, canvas, svg, iframe');
        })
        .map(s => (s.className || s.tagName).toString().slice(0, 60));
    });
    emptySections.forEach(s => log('EMPTY-SECTION', tag, 'Secção/card vazio', s));

    // ---- CTAs ----
    const ctas = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('a.btn, button, a[class*="cta"], a[class*="button"], .btn, [class*="btn"]'));
      return btns.map(b => ({
        text: (b.innerText || '').trim().slice(0, 60),
        href: b.getAttribute('href') || '',
        visible: b.offsetParent !== null,
      })).filter(c => c.text);
    });

    // CTAs with no href or only #
    ctas.filter(c => !c.href || c.href === '#' || c.href === '').forEach(c =>
      log('CTA-NO-DEST', tag, `CTA sem destino real: "${c.text}"`, c.href)
    );
    console.log(`  CTAs (${tag}): ${ctas.map(c => '"'+c.text+'"').join(', ')}`);

    // ---- NAV ITEMS ----
    const navLinks = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('nav a, header a, [class*="nav"] a'))
        .map(a => ({ text: (a.innerText || '').trim(), href: a.getAttribute('href') }))
        .filter(a => a.text);
    });
    console.log(`  NAV (${tag}): ${navLinks.map(l => l.text).join(' | ')}`);

    // ---- H1 ----
    const h1 = await page.evaluate(() => {
      const el = document.querySelector('h1');
      return el ? el.innerText.trim() : 'MISSING';
    });
    if (h1 === 'MISSING') log('SEO-UX', tag, 'H1 em falta na página');
    else console.log(`  H1 (${tag}): "${h1}"`);

    // ---- HERO TEXT ----
    const heroText = await page.evaluate(() => {
      const hero = document.querySelector('.hero, [class*="hero"], .banner, [class*="banner"], .jumbotron');
      return hero ? hero.innerText.trim().slice(0, 200) : 'NO HERO FOUND';
    });
    console.log(`  HERO (${tag}): ${heroText.slice(0, 150)}`);

    // ---- MOBILE OVERFLOW ----
    if (viewport.label === 'mobile') {
      const overflowInfo = await page.evaluate(() => {
        return {
          bodyWidth: document.body.scrollWidth,
          viewportWidth: window.innerWidth,
          overflow: document.body.scrollWidth > window.innerWidth + 5,
        };
      });
      if (overflowInfo.overflow) {
        log('MOBILE-OVERFLOW', tag, `Scroll horizontal (body=${overflowInfo.bodyWidth}px > viewport=${overflowInfo.viewportWidth}px)`);
        await page.screenshot({ path: `${OUT}/${tag}-overflow.png` });
      }
    }

    // ---- FORMS ----
    const forms = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('form')).map(f => ({
        action: f.getAttribute('action') || 'NO-ACTION',
        inputs: Array.from(f.querySelectorAll('input, textarea, select')).map(i => i.name || i.type).join(','),
      }));
    });
    forms.forEach(f => console.log(`  FORM (${tag}): action=${f.action} | fields=${f.inputs}`));

    // ---- PRICE ELEMENTS ----
    const priceEls = await page.evaluate(() => {
      const els = Array.from(document.querySelectorAll('[class*="price"], [class*="preco"], [class*="plan"], [class*="tarif"], [class*="cost"]'));
      return els.map(e => e.innerText.trim().slice(0, 80));
    });
    if (priceEls.length) console.log(`  PREÇOS (${tag}): ${priceEls.slice(0,5).join(' | ')}`);
    else console.log(`  PREÇOS (${tag}): nenhum elemento de preço encontrado`);

    // ---- TRUST SIGNALS ----
    const trust = await page.evaluate(() => {
      const t = (document.body.innerText || '').toLowerCase();
      return {
        reviews: t.includes('review') || t.includes('avalia') || t.includes('testem') || t.includes('★') || t.includes('estrela'),
        partners: t.includes('parceir') || t.includes('partner') || t.includes('sponsor'),
        security: t.includes('segur') || t.includes('ssl') || t.includes('https') || t.includes('certif'),
        socialProof: t.includes('utilizador') || t.includes('cliente') || t.includes('viajan') || t.includes('visita'),
      };
    });
    console.log(`  TRUST (${tag}): reviews=${trust.reviews} partners=${trust.partners} security=${trust.security} socialProof=${trust.socialProof}`);

    // Missing trust on homepage
    if (name === 'homepage' && !trust.reviews && !trust.socialProof) {
      log('COMMERCIAL', tag, 'Homepage sem prova social / reviews / testemunhos');
    }

    // ---- SECTIONS COUNT ----
    const sectionCount = await page.evaluate(() => {
      return document.querySelectorAll('section, .section, [class*="section"]').length;
    });
    console.log(`  SECTIONS (${tag}): ${sectionCount}`);

    // ---- FOOTER ----
    const footer = await page.evaluate(() => {
      const f = document.querySelector('footer');
      return f ? f.innerText.trim().slice(0, 200) : 'NO FOOTER';
    });
    if (footer === 'NO FOOTER') log('UX', tag, 'Footer em falta');
    else console.log(`  FOOTER (${tag}): ${footer.slice(0, 100)}`);

  } catch (err) {
    log('PAGE-ERROR', tag, `Erro ao carregar: ${err.message.slice(0, 100)}`);
    await page.screenshot({ path: `${OUT}/${tag}-error.png` }).catch(() => {});
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true });

  const VIEWPORTS = [
    { label: 'desktop', width: 1440, height: 900 },
    { label: 'mobile', width: 390, height: 844 },
  ];

  for (const vp of VIEWPORTS) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`VIEWPORT: ${vp.label} (${vp.width}x${vp.height})`);
    console.log('='.repeat(60));

    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      userAgent: vp.label === 'mobile'
        ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1'
        : undefined,
    });
    const page = await context.newPage();

    page.on('pageerror', err => {
      log('JS-ERROR', `_${vp.label}`, err.message.slice(0, 120));
    });

    for (const p of PAGES) {
      console.log(`\n--- Auditando: ${p.name} ---`);
      await auditPage(page, p.name, p.url, vp);
    }

    await context.close();
  }

  await browser.close();

  // ---- FINAL SUMMARY ----
  console.log('\n\n' + '='.repeat(60));
  console.log('ISSUES ENCONTRADOS:');
  console.log('='.repeat(60));

  const grouped = {};
  ISSUES.forEach(i => {
    grouped[i.type] = grouped[i.type] || [];
    grouped[i.type].push(i);
  });

  Object.entries(grouped).forEach(([type, items]) => {
    console.log(`\n[${type}] — ${items.length} ocorrência(s)`);
    items.forEach(i => console.log(`  • ${i.page}: ${i.msg}${i.detail ? ' → ' + i.detail : ''}`));
  });

  fs.writeFileSync(path.join(__dirname, 'issues.json'), JSON.stringify(ISSUES, null, 2));
  console.log(`\nTotal issues: ${ISSUES.length}`);
  console.log('Screenshots: _audit/screenshots/');
})();
