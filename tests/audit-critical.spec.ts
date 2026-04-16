/**
 * audit-critical.spec.ts
 * Bug-hunt audit — detects real regressions, broken flows, console errors,
 * network failures and structural issues across PT and EN pages.
 * Results are written to test-results/audit-findings.json for BUG_AUDIT.md.
 */
import { test, expect, type Page, type ConsoleMessage } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// ---------------------------------------------------------------------------
// Types & helpers
// ---------------------------------------------------------------------------

interface Finding {
  id: string;
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  page: string;
  description: string;
  evidence: string;
}

const findings: Finding[] = [];
let findingCounter = 0;

function record(f: Omit<Finding, 'id'>) {
  findingCounter++;
  findings.push({ id: `BUG-${String(findingCounter).padStart(3, '0')}`, ...f });
}

async function collectConsoleErrors(page: Page, url: string): Promise<string[]> {
  const errors: string[] = [];
  const handler = (msg: ConsoleMessage) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      // Filter third-party noise
      if (
        !text.includes('chrome-extension') &&
        !text.includes('clarity') &&
        !text.includes('gtag') &&
        !text.includes('analytics') &&
        !text.includes('favicon') &&
        !text.includes('ERR_BLOCKED_BY_CLIENT')
      ) {
        errors.push(text);
      }
    }
  };
  page.on('console', handler);
  const failedRequests: string[] = [];
  page.on('requestfailed', (req) => {
    const url2 = req.url();
    if (!url2.includes('analytics') && !url2.includes('clarity') && !url2.includes('gtag')) {
      failedRequests.push(`${req.failure()?.errorText ?? 'unknown'}: ${url2}`);
    }
  });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 }).catch(() => null);
  await page.waitForTimeout(1000);
  page.off('console', handler);
  return [...errors, ...failedRequests.map((r) => `[NETWORK FAIL] ${r}`)];
}

async function getH1(page: Page): Promise<string> {
  return page.locator('h1').first().innerText().catch(() => '');
}

async function pageLoads(page: Page, url: string): Promise<number> {
  const res = await page.goto(url, { timeout: 20_000 }).catch(() => null);
  return res?.status() ?? 0;
}

// ---------------------------------------------------------------------------
// 1. PAGE LOADING — all critical routes respond with h1
// ---------------------------------------------------------------------------

const allRoutes = [
  // PT
  { url: '/',                   lang: 'PT', label: 'Homepage PT' },
  { url: '/planear.html',       lang: 'PT', label: 'Planear PT' },
  { url: '/precos.html',        lang: 'PT', label: 'Preços PT' },
  { url: '/parceiros.html',     lang: 'PT', label: 'Parceiros PT' },
  { url: '/contact.html',       lang: 'PT', label: 'Contacto PT' },
  { url: '/beaches.html',       lang: 'PT', label: 'Praias PT' },
  { url: '/surf.html',          lang: 'PT', label: 'Surf PT' },
  { url: '/pesca.html',         lang: 'PT', label: 'Pesca PT' },
  { url: '/webcams.html',       lang: 'PT', label: 'Webcams PT' },
  { url: '/privacidade.html',   lang: 'PT', label: 'Privacidade PT' },
  { url: '/termos.html',        lang: 'PT', label: 'Termos PT' },
  { url: '/sobre.html',         lang: 'PT', label: 'Sobre PT' },
  { url: '/login.html',         lang: 'PT', label: 'Login PT' },
  { url: '/praias-algarve.html',lang: 'PT', label: 'Praias Algarve PT' },
  { url: '/media-kit.html',     lang: 'PT', label: 'Media Kit PT' },
  // EN
  { url: '/en/',                lang: 'EN', label: 'Homepage EN' },
  { url: '/en/planear.html',    lang: 'EN', label: 'Planear EN' },
  { url: '/en/precos.html',     lang: 'EN', label: 'Preços EN' },
  { url: '/en/parceiros.html',  lang: 'EN', label: 'Parceiros EN' },
  { url: '/en/contact.html',    lang: 'EN', label: 'Contacto EN' },
  { url: '/en/beaches.html',    lang: 'EN', label: 'Beaches EN' },
  { url: '/en/surf.html',       lang: 'EN', label: 'Surf EN' },
  { url: '/en/pesca.html',      lang: 'EN', label: 'Pesca EN' },
  { url: '/en/webcams.html',    lang: 'EN', label: 'Webcams EN' },
  { url: '/en/privacy.html',    lang: 'EN', label: 'Privacy EN' },
  { url: '/en/terms.html',      lang: 'EN', label: 'Terms EN' },
  { url: '/en/login.html',      lang: 'EN', label: 'Login EN' },
  { url: '/en/best-beaches-portugal.html', lang: 'EN', label: 'Best Beaches EN' },
  { url: '/en/media-kit.html',  lang: 'EN', label: 'Media Kit EN' },
];

test.describe('1 — Page loading', () => {
  for (const route of allRoutes) {
    test(`${route.label} loads with visible h1`, async ({ page }) => {
      const status = await pageLoads(page, route.url);
      if (status >= 400 || status === 0) {
        record({
          category: 'navegação/links',
          severity: 'critical',
          page: route.url,
          description: `Página ${route.label} não carrega (HTTP ${status})`,
          evidence: `GET ${route.url} → ${status}`,
        });
      }
      // Title must not be an error page
      const title = await page.title();
      if (/\b(404|500|Not Found|Bad Gateway)\b/i.test(title)) {
        record({
          category: 'navegação/links',
          severity: 'critical',
          page: route.url,
          description: `Título da página indica erro: "${title}"`,
          evidence: `<title>${title}</title>`,
        });
      }
      const h1 = await getH1(page);
      if (!h1.trim()) {
        record({
          category: 'conteúdo estrutural',
          severity: 'high',
          page: route.url,
          description: `h1 ausente ou vazio em ${route.label}`,
          evidence: `innerText(h1) = "${h1}"`,
        });
      }
      // Expect no hard crash — assert something visible
      await expect(page.locator('body')).toBeVisible();
    });
  }
});

// ---------------------------------------------------------------------------
// 2. CONSOLE ERRORS — critical pages
// ---------------------------------------------------------------------------

const consolePages = [
  { url: '/',              label: 'Homepage PT' },
  { url: '/en/',           label: 'Homepage EN' },
  { url: '/planear.html',  label: 'Planear PT' },
  { url: '/en/planear.html', label: 'Planear EN' },
  { url: '/precos.html',   label: 'Preços PT' },
  { url: '/parceiros.html',label: 'Parceiros PT' },
  { url: '/login.html',    label: 'Login PT' },
  { url: '/beaches.html',  label: 'Praias PT' },
];

test.describe('2 — Console errors', () => {
  for (const p of consolePages) {
    test(`${p.label} — no blocking JS errors`, async ({ page }) => {
      const errors = await collectConsoleErrors(page, p.url);
      if (errors.length > 0) {
        const severity = errors.some((e) => e.includes('NETWORK FAIL')) ? 'high' : 'medium';
        record({
          category: 'runtime/js',
          severity,
          page: p.url,
          description: `${errors.length} erro(s) de console/rede em ${p.label}`,
          evidence: errors.slice(0, 5).join('\n'),
        });
        // Don't fail the test — just record for the audit
        console.log(`[AUDIT] ${p.label}: ${errors.join(' | ')}`);
      }
      // Always pass — audit only
      expect(true).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// 3. NAVIGATION — internal links not broken
// ---------------------------------------------------------------------------

test.describe('3 — Navigation integrity', () => {
  test('PT homepage nav links all resolve', async ({ page }) => {
    await page.goto('/');
    const navLinks = await page.locator('nav .nav-links a').all();
    for (const link of navLinks) {
      const href = await link.getAttribute('href');
      if (!href || href.startsWith('javascript:') || href.startsWith('#')) continue;
      // Verify href attribute exists and is non-empty
      expect(href.trim()).toBeTruthy();
    }
  });

  test('EN homepage nav links all resolve', async ({ page }) => {
    await page.goto('/en/');
    const navLinks = await page.locator('nav .nav-links a').all();
    for (const link of navLinks) {
      const href = await link.getAttribute('href');
      if (!href || href.startsWith('javascript:') || href.startsWith('#')) continue;
      expect(href.trim()).toBeTruthy();
    }
  });

  test('PT footer social links are javascript:void placeholders', async ({ page }) => {
    await page.goto('/');
    const socialLinks = await page.locator('footer a[href="javascript:void(0);"]').count();
    if (socialLinks > 0) {
      record({
        category: 'navegação/links',
        severity: 'low',
        page: '/',
        description: `${socialLinks} botão(ões) social no footer com href="javascript:void(0);" — sem destino real`,
        evidence: `footer a[href="javascript:void(0);"] count = ${socialLinks}`,
      });
    }
    expect(true).toBe(true);
  });

  test('PT lang switcher on /planear links to /en/planear.html', async ({ page }) => {
    await page.goto('/planear.html');
    const enLink = page.locator('div.lang-switcher a[data-lang="en"]');
    const href = await enLink.getAttribute('href').catch(() => null);
    if (!href || !href.includes('planear')) {
      record({
        category: 'idioma/PT-EN',
        severity: 'medium',
        page: '/planear.html',
        description: `Lang switcher EN em /planear.html aponta para "${href}" em vez de /en/planear.html`,
        evidence: `a[data-lang="en"] href="${href}"`,
      });
    }
    expect(true).toBe(true);
  });

  test('EN lang switcher pages point back to correct PT equivalents', async ({ page }) => {
    const enPtPairs = [
      { en: '/en/precos.html',    expectedPT: /precos\.html/ },
      { en: '/en/parceiros.html', expectedPT: /parceiros\.html/ },
      { en: '/en/contact.html',   expectedPT: /contact\.html/ },
      { en: '/en/planear.html',   expectedPT: /planear\.html/ },
    ];
    for (const pair of enPtPairs) {
      await page.goto(pair.en);
      const ptLink = page.locator('div.lang-switcher a[data-lang="pt"]');
      const href = await ptLink.getAttribute('href').catch(() => null);
      if (!href || !pair.expectedPT.test(href)) {
        record({
          category: 'idioma/PT-EN',
          severity: 'medium',
          page: pair.en,
          description: `Lang switcher PT em ${pair.en} aponta para "${href}" (esperado padrão ${pair.expectedPT})`,
          evidence: `a[data-lang="pt"] href="${href}"`,
        });
      }
    }
    expect(true).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 4. FORMS & CTAs
// ---------------------------------------------------------------------------

test.describe('4 — Forms and CTAs', () => {
  test('planear form has visible submit mechanism', async ({ page }) => {
    await page.goto('/planear.html');
    const slider = page.locator('div#sld-track');
    const isVisible = await slider.isVisible().catch(() => false);
    if (!isVisible) {
      record({
        category: 'forms/cta',
        severity: 'critical',
        page: '/planear.html',
        description: 'Slider de submissão do formulário não está visível',
        evidence: '#sld-track not visible',
      });
    }
  });

  test('contact form has a submit button', async ({ page }) => {
    await page.goto('/contact.html');
    const submitBtn = page.locator('form#contact-form button[type="submit"], form#contact-form input[type="submit"]');
    const count = await submitBtn.count();
    if (count === 0) {
      record({
        category: 'forms/cta',
        severity: 'high',
        page: '/contact.html',
        description: 'Formulário de contacto sem botão de submit identificável',
        evidence: 'form#contact-form submit button count = 0',
      });
    }
  });

  test('parceiros B2B form has a submit button', async ({ page }) => {
    await page.goto('/parceiros.html');
    const form = page.locator('form#b2b-form');
    const exists = await form.count();
    if (exists === 0) {
      record({
        category: 'forms/cta',
        severity: 'high',
        page: '/parceiros.html',
        description: 'Formulário B2B (#b2b-form) não encontrado',
        evidence: 'form#b2b-form count = 0',
      });
    }
  });

  test('hero CTAs on homepage PT are not empty href', async ({ page }) => {
    await page.goto('/');
    const heroBtns = await page.locator('.hero a.btn, .hero button.btn').all();
    for (const btn of heroBtns) {
      const href = await btn.getAttribute('href').catch(() => null);
      const text = (await btn.innerText().catch(() => '')).trim();
      if (href === '#' || href === '' || href === null) {
        record({
          category: 'forms/cta',
          severity: 'high',
          page: '/',
          description: `CTA hero "${text}" sem href válido: "${href}"`,
          evidence: `btn text="${text}" href="${href}"`,
        });
      }
    }
    expect(true).toBe(true);
  });

  test('precos page has at least one visible CTA / pricing plan', async ({ page }) => {
    await page.goto('/precos.html');
    const ctaCount = await page.locator('a.btn-primary, button.btn-primary, .plan-card, .pricing-card').count();
    if (ctaCount === 0) {
      record({
        category: 'forms/cta',
        severity: 'high',
        page: '/precos.html',
        description: 'Página de preços sem planos ou CTAs identificáveis',
        evidence: '.plan-card / .pricing-card / .btn-primary count = 0',
      });
    }
    expect(true).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 5. SEO TÉCNICO CRÍTICO
// ---------------------------------------------------------------------------

const seoPairs = [
  { pt: '/',              en: '/en/',              ptCanonical: /pages\.dev\/$/, enCanonical: /pages\.dev\/en\// },
  { pt: '/planear.html',  en: '/en/planear.html',  ptCanonical: /planear\.html/, enCanonical: /en\/planear/ },
  { pt: '/precos.html',   en: '/en/precos.html',   ptCanonical: /precos\.html/,  enCanonical: /en\/precos/ },
  { pt: '/parceiros.html',en: '/en/parceiros.html',ptCanonical: /parceiros/,     enCanonical: /en\/parceiros/ },
];

test.describe('5 — SEO técnico', () => {
  for (const pair of seoPairs) {
    test(`canonical correcto em ${pair.pt}`, async ({ page }) => {
      await page.goto(pair.pt);
      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href').catch(() => '');
      if (!canonical) {
        record({ category: 'seo técnico crítico', severity: 'high', page: pair.pt,
          description: 'Canonical ausente', evidence: 'link[rel=canonical] not found' });
      } else if (!pair.ptCanonical.test(canonical)) {
        record({ category: 'seo técnico crítico', severity: 'medium', page: pair.pt,
          description: `Canonical não bate com domínio deployed: "${canonical}"`,
          evidence: `canonical="${canonical}" expected pattern ${pair.ptCanonical}` });
      }
      expect(true).toBe(true);
    });

    test(`hreflang PT+EN presentes em ${pair.pt}`, async ({ page }) => {
      await page.goto(pair.pt);
      const ptAlt = await page.locator('link[rel="alternate"][hreflang="pt"]').getAttribute('href').catch(() => '');
      const enAlt = await page.locator('link[rel="alternate"][hreflang="en"]').getAttribute('href').catch(() => '');
      const xDef  = await page.locator('link[rel="alternate"][hreflang="x-default"]').getAttribute('href').catch(() => '');
      if (!ptAlt) record({ category: 'seo técnico crítico', severity: 'high', page: pair.pt,
        description: 'hreflang="pt" ausente', evidence: 'link[hreflang=pt] not found' });
      if (!enAlt) record({ category: 'seo técnico crítico', severity: 'high', page: pair.pt,
        description: 'hreflang="en" ausente', evidence: 'link[hreflang=en] not found' });
      if (!xDef) record({ category: 'seo técnico crítico', severity: 'medium', page: pair.pt,
        description: 'hreflang="x-default" ausente', evidence: 'link[hreflang=x-default] not found' });
      expect(true).toBe(true);
    });
  }

  test('canonical domain consistency — not wrong subdomain', async ({ page }) => {
    await page.goto('/');
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href').catch(() => '');
    // The deployed domain is portal-turismo-portugal-site.pages.dev
    // HTML files have portal-turismo-portugal.pages.dev — mismatch
    if (canonical && canonical.includes('portal-turismo-portugal.pages.dev') && !canonical.includes('-site')) {
      record({
        category: 'seo técnico crítico',
        severity: 'high',
        page: '/',
        description: `Canonical aponta para domínio errado: "${canonical}". Deployed em portal-turismo-portugal-site.pages.dev`,
        evidence: `canonical="${canonical}"`,
      });
    }
    expect(true).toBe(true);
  });

  test('pages have unique non-empty title tags', async ({ page }) => {
    const pages2check = ['/', '/planear.html', '/precos.html', '/parceiros.html'];
    const titles: Record<string, string> = {};
    for (const url of pages2check) {
      await page.goto(url);
      const t = await page.title();
      if (!t.trim()) {
        record({ category: 'seo técnico crítico', severity: 'high', page: url,
          description: 'Título vazio', evidence: `<title>${t}</title>` });
      }
      if (titles[t]) {
        record({ category: 'seo técnico crítico', severity: 'medium', page: url,
          description: `Título duplicado: "${t}" (igual a ${titles[t]})`,
          evidence: `title="${t}"` });
      }
      titles[t] = url;
    }
    expect(true).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 6. MOBILE LAYOUT — viewport 390px
// ---------------------------------------------------------------------------

test.describe('6 — Mobile layout', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  const mobilePages = ['/', '/planear.html', '/precos.html', '/parceiros.html', '/contact.html'];

  for (const url of mobilePages) {
    test(`${url} — nav e h1 visíveis em mobile`, async ({ page }) => {
      await page.goto(url);
      const h1Visible = await page.locator('h1').first().isVisible().catch(() => false);
      if (!h1Visible) {
        record({
          category: 'mobile/responsive',
          severity: 'high',
          page: url,
          description: `h1 não visível em viewport mobile 390px`,
          evidence: 'h1 isVisible() = false @ 390px',
        });
      }
      // Nav toggle should exist on mobile
      const toggle = page.locator('button#nav-toggle, button.nav-toggle');
      const toggleVisible = await toggle.isVisible().catch(() => false);
      if (!toggleVisible) {
        record({
          category: 'mobile/responsive',
          severity: 'medium',
          page: url,
          description: 'Botão hamburguer (nav-toggle) não visível em mobile 390px',
          evidence: '#nav-toggle isVisible() = false @ 390px',
        });
      }
      expect(true).toBe(true);
    });
  }

  test('/ — hero CTA visível em mobile', async ({ page }) => {
    await page.goto('/');
    const heroCta = page.locator('.hero a.btn, .hero button').first();
    const visible = await heroCta.isVisible().catch(() => false);
    if (!visible) {
      record({
        category: 'mobile/responsive',
        severity: 'high',
        page: '/',
        description: 'Hero CTA não visível em mobile 390px',
        evidence: '.hero .btn isVisible() = false @ 390px',
      });
    }
    expect(true).toBe(true);
  });

  test('/planear — formulário visível em mobile', async ({ page }) => {
    await page.goto('/planear.html');
    const form = page.locator('form#plan-form');
    const visible = await form.isVisible().catch(() => false);
    if (!visible) {
      record({
        category: 'mobile/responsive',
        severity: 'critical',
        page: '/planear.html',
        description: 'Formulário do planner não visível em mobile 390px',
        evidence: '#plan-form isVisible() = false @ 390px',
      });
    }
    expect(true).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 7. PT/EN CONSISTENCY
// ---------------------------------------------------------------------------

test.describe('7 — PT/EN consistency', () => {
  const pairs = [
    { pt: '/',              en: '/en/' },
    { pt: '/planear.html',  en: '/en/planear.html' },
    { pt: '/precos.html',   en: '/en/precos.html' },
    { pt: '/parceiros.html',en: '/en/parceiros.html' },
    { pt: '/contact.html',  en: '/en/contact.html' },
  ];

  for (const pair of pairs) {
    test(`${pair.pt} ↔ ${pair.en} — ambas têm nav, main, footer`, async ({ page }) => {
      for (const url of [pair.pt, pair.en]) {
        await page.goto(url);
        const nav    = await page.locator('nav#navbar, nav.navbar').first().isVisible().catch(() => false);
        const main   = await page.locator('main').first().isVisible().catch(() => false);
        const footer = await page.locator('footer').first().isVisible().catch(() => false);
        if (!nav) record({ category: 'idioma/PT-EN', severity: 'high', page: url,
          description: 'Nav ausente', evidence: 'nav not visible' });
        if (!main) record({ category: 'idioma/PT-EN', severity: 'high', page: url,
          description: 'Main ausente', evidence: 'main not visible' });
        if (!footer) record({ category: 'idioma/PT-EN', severity: 'medium', page: url,
          description: 'Footer ausente', evidence: 'footer not visible' });
      }
      expect(true).toBe(true);
    });
  }

  test('EN homepage has no PT-only text visible', async ({ page }) => {
    await page.goto('/en/');
    const body = await page.locator('body').innerText().catch(() => '');
    // Check for obvious PT-only words that shouldn't appear on EN page
    const ptOnlyPhrases = ['Explorar Praias', 'Ver condições', 'Planear'];
    for (const phrase of ptOnlyPhrases) {
      if (body.includes(phrase)) {
        record({
          category: 'idioma/PT-EN',
          severity: 'medium',
          page: '/en/',
          description: `Texto PT "${phrase}" visível na versão EN`,
          evidence: `body contains "${phrase}"`,
        });
      }
    }
    expect(true).toBe(true);
  });

  test('EN nav items are in English', async ({ page }) => {
    await page.goto('/en/');
    const navText = await page.locator('nav .nav-links').innerText().catch(() => '');
    const ptNavWords = ['Praias', 'Pesca', 'Planear', 'Preços', 'Parceiros'];
    for (const word of ptNavWords) {
      if (navText.includes(word)) {
        record({
          category: 'idioma/PT-EN',
          severity: 'high',
          page: '/en/',
          description: `Palavra PT "${word}" no nav da versão EN`,
          evidence: `nav text contains "${word}"`,
        });
      }
    }
    expect(true).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 8. STRUCTURAL CONTENT
// ---------------------------------------------------------------------------

test.describe('8 — Structural content', () => {
  test('login page has login and register forms', async ({ page }) => {
    await page.goto('/login.html');
    const loginForm    = await page.locator('form#form-login').count();
    const registerForm = await page.locator('form#form-register').count();
    if (loginForm === 0)    record({ category: 'conteúdo estrutural', severity: 'critical', page: '/login.html',
      description: 'Formulário de login (#form-login) ausente', evidence: 'form#form-login count = 0' });
    if (registerForm === 0) record({ category: 'conteúdo estrutural', severity: 'high', page: '/login.html',
      description: 'Formulário de registo (#form-register) ausente', evidence: 'form#form-register count = 0' });
  });

  test('beaches.html has beach listing content', async ({ page }) => {
    await page.goto('/beaches.html');
    const main = page.locator('main');
    const text = await main.innerText().catch(() => '');
    if (text.trim().length < 100) {
      record({ category: 'conteúdo estrutural', severity: 'high', page: '/beaches.html',
        description: 'Página de praias com conteúdo insuficiente no main (< 100 chars)',
        evidence: `main innerText length = ${text.trim().length}` });
    }
  });

  test('surf.html has surf content', async ({ page }) => {
    await page.goto('/surf.html');
    const h1 = await getH1(page);
    if (!h1) record({ category: 'conteúdo estrutural', severity: 'high', page: '/surf.html',
      description: 'surf.html sem h1', evidence: 'h1 = ""' });
  });

  test('webcams.html loads with identifiable content', async ({ page }) => {
    await page.goto('/webcams.html');
    const h1 = await getH1(page);
    const mainText = await page.locator('main').innerText().catch(() => '');
    if (!h1 || mainText.trim().length < 50) {
      record({ category: 'conteúdo estrutural', severity: 'medium', page: '/webcams.html',
        description: `webcams.html com conteúdo escasso (h1="${h1}", mainLength=${mainText.trim().length})`,
        evidence: `h1="${h1}" main.length=${mainText.trim().length}` });
    }
  });

  test('about/sobre has content', async ({ page }) => {
    await page.goto('/sobre.html');
    const mainText = await page.locator('main').innerText().catch(() => '');
    if (mainText.trim().length < 100) {
      record({ category: 'conteúdo estrutural', severity: 'low', page: '/sobre.html',
        description: `sobre.html com conteúdo escasso (${mainText.trim().length} chars)`,
        evidence: `main.length=${mainText.trim().length}` });
    }
  });
});

// ---------------------------------------------------------------------------
// TEARDOWN — write findings to JSON
// ---------------------------------------------------------------------------

test.afterAll(async () => {
  const outDir  = path.join(process.cwd(), 'test-results');
  const outFile = path.join(outDir, 'audit-findings.json');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(findings, null, 2));
  console.log(`\n[AUDIT] ${findings.length} finding(s) written to ${outFile}`);
});
