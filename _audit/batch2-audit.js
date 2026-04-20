/**
 * Batch 2 Audit — Portugal Travel Hub
 * Pages: webcams, pesca, surf, login, dashboard, precos, media-kit,
 *        parceiros (secondary), index (secondary), sw.js
 *
 * Run: node _audit/batch2-audit.js
 */

const { chromium } = require('playwright');
const http         = require('http');
const fs           = require('fs');
const path         = require('path');

// ── Config ────────────────────────────────────────────────────────────────────
const ROOT    = path.join(__dirname, '..');
const PORT    = 17335;
const BASE    = `http://localhost:${PORT}`;
const OUT     = path.join(__dirname, 'screenshots');
const SW_PATH = path.join(ROOT, 'sw.js');
fs.mkdirSync(OUT, { recursive: true });

// ── Results store ─────────────────────────────────────────────────────────────
const RESULTS = [];
function pass(id, msg) { RESULTS.push({ id, status: 'PASS', msg }); console.log(`  ✓ [PASS][${id}] ${msg}`); }
function fail(id, msg) { RESULTS.push({ id, status: 'FAIL', msg }); console.log(`  ✗ [FAIL][${id}] ${msg}`); }
function warn(id, msg) { RESULTS.push({ id, status: 'WARN', msg }); console.log(`  ⚠ [WARN][${id}] ${msg}`); }
function info(id, msg) { console.log(`  · [INFO][${id}] ${msg}`); }

// ── Tiny static HTTP server ───────────────────────────────────────────────────
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.json': 'application/json',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico':  'image/x-icon',
  '.txt':  'text/plain',
  '.xml':  'application/xml',
  '.woff2':'font/woff2',
  '.woff': 'font/woff',
};

function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let urlPath = req.url.split('?')[0];
      if (urlPath === '/') urlPath = '/index.html';
      const filePath = path.join(ROOT, urlPath);
      const ext      = path.extname(filePath).toLowerCase();
      const ct       = MIME[ext] || 'application/octet-stream';
      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('404 Not Found: ' + urlPath);
        } else {
          res.writeHead(200, { 'Content-Type': ct });
          res.end(data);
        }
      });
    });
    server.listen(PORT, () => {
      console.log(`\n  HTTP server running on ${BASE}\n`);
      resolve(server);
    });
  });
}

// ── Helpers ───────────────────────────────────────────────────────────────────

// Navigate + basic capture
async function auditPage(page, jsErrors, pageId, urlPath, waitMs = 1500) {
  jsErrors.length = 0;
  const url = `${BASE}/${urlPath}`;
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`  PAGE: ${pageId}  →  ${url}`);
  console.log(`${'─'.repeat(60)}`);

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(waitMs);

  const screenshot = path.join(OUT, `batch2-${pageId}.png`);
  await page.screenshot({ path: screenshot, fullPage: false });
  info(pageId, `screenshot → ${screenshot}`);

  return url;
}

// Check broken CTAs (href="#", href="", missing, or literal "#")
async function checkCTAs(page, pageId) {
  const broken = await page.evaluate(() =>
    Array.from(document.querySelectorAll('a'))
      .filter(a => {
        const h = a.getAttribute('href');
        return h === null || h === '' || h === '#' || h.trim() === '#';
      })
      .map(a => ({ text: (a.innerText || '').trim().slice(0, 50), href: a.getAttribute('href') }))
  );
  if (broken.length === 0) pass(pageId, `CTAs — nenhum link quebrado (href="#" ou vazio)`);
  else                     warn(pageId, `CTAs — ${broken.length} links quebrados: ${JSON.stringify(broken.slice(0,5))}`);
  return broken;
}

// Check broken images (naturalWidth === 0 or not complete)
async function checkImages(page, pageId) {
  const broken = await page.evaluate(() =>
    Array.from(document.images)
      .filter(img => !img.complete || img.naturalWidth === 0)
      .map(img => img.src.slice(0, 80))
  );
  if (broken.length === 0) pass(pageId, `Images — nenhuma imagem quebrada`);
  else                     warn(pageId, `Images — ${broken.length} imagens quebradas: ${JSON.stringify(broken.slice(0,5))}`);
  return broken;
}

// Check meaningful content (page not blank)
async function checkContent(page, pageId) {
  const bodyText = await page.evaluate(() => (document.body.innerText || '').trim().length);
  if (bodyText > 200) pass(pageId, `Content — página tem conteúdo (${bodyText} chars)`);
  else                 fail(pageId, `Content — página parece em branco ou vazia (${bodyText} chars)`);
  return bodyText;
}

// Evaluate JS errors
function checkJsErrors(jsErrors, pageId) {
  const errs = [...jsErrors];
  if (errs.length === 0) pass(pageId, `JS — nenhum erro de JS`);
  else                   fail(pageId, `JS — ${errs.length} erros: ${errs.slice(0,3).join(' | ')}`);
  return errs;
}

// ── Main audit ────────────────────────────────────────────────────────────────
(async () => {
  const server  = await startServer();
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page    = await context.newPage();

  const jsErrors    = [];
  const consoleErrs = [];

  page.on('pageerror', e => jsErrors.push(e.message));
  page.on('console',   m => { if (m.type() === 'error') consoleErrs.push(m.text()); });

  // ════════════════════════════════════════════════════════════════════
  // 1. webcams.html
  // ════════════════════════════════════════════════════════════════════
  await auditPage(page, jsErrors, 'webcams', 'webcams.html');

  checkJsErrors(jsErrors, 'webcams');
  await checkContent(page, 'webcams');
  await checkCTAs(page, 'webcams');
  await checkImages(page, 'webcams');

  // Check iframes — are they real URLs or placeholders?
  const iframes = await page.evaluate(() =>
    Array.from(document.querySelectorAll('iframe'))
      .map(f => ({ src: f.src || f.getAttribute('src') || '', title: f.title || '' }))
  );
  info('webcams', `iframes encontrados: ${iframes.length}`);
  if (iframes.length === 0) {
    warn('webcams', 'Webcams — nenhum iframe encontrado (sem embeds de webcam)');
  } else {
    const realIframes = iframes.filter(f =>
      f.src && f.src !== '' && !f.src.includes('example.com') && !f.src.includes('placeholder')
    );
    const badIframes  = iframes.filter(f =>
      !f.src || f.src === '' || f.src.includes('example.com') || f.src.includes('placeholder')
    );
    realIframes.forEach(f => info('webcams', `  iframe real: ${f.src.slice(0, 80)}`));
    badIframes.forEach(f  => warn('webcams',  `  iframe placeholder/vazio: "${f.src.slice(0, 80)}"`));
    if (badIframes.length === 0 && realIframes.length > 0)
      pass('webcams', `Webcams — ${realIframes.length} iframes com URLs reais`);
    else if (realIframes.length > 0)
      warn('webcams', `Webcams — ${realIframes.length} reais / ${badIframes.length} placeholders`);
    else
      fail('webcams', `Webcams — todos os iframes são placeholders ou vazios`);
  }

  // Check for webcam link patterns (non-iframe approach)
  const webcamLinks = await page.evaluate(() =>
    Array.from(document.querySelectorAll('a[href]'))
      .filter(a => {
        const h = a.href || '';
        return h.includes('youtube') || h.includes('earthcam') || h.includes('windguru') ||
               h.includes('magicseaweed') || h.includes('surf-forecast') || h.includes('webcam');
      })
      .map(a => ({ text: a.innerText.trim().slice(0, 40), href: a.href.slice(0, 80) }))
  );
  if (webcamLinks.length > 0)
    info('webcams', `Links de webcam externos: ${JSON.stringify(webcamLinks.slice(0, 5))}`);

  // ════════════════════════════════════════════════════════════════════
  // 2. pesca.html
  // ════════════════════════════════════════════════════════════════════
  await auditPage(page, jsErrors, 'pesca', 'pesca.html');

  checkJsErrors(jsErrors, 'pesca');
  await checkContent(page, 'pesca');
  await checkCTAs(page, 'pesca');
  await checkImages(page, 'pesca');

  // Check booking / external links
  const pescaBooking = await page.evaluate(() =>
    Array.from(document.querySelectorAll('a[href]'))
      .filter(a => {
        const h = a.href || '';
        return h.includes('book') || h.includes('reserv') || h.includes('comprar') ||
               h.includes('ticket') || h.includes('viator') || h.includes('getyourguide') ||
               h.includes('mail') || h.includes('tel:') || h.includes('whatsapp');
      })
      .map(a => ({ text: a.innerText.trim().slice(0, 40), href: a.href.slice(0, 80) }))
  );
  info('pesca', `CTAs de reserva/contacto: ${JSON.stringify(pescaBooking.slice(0, 5))}`);
  if (pescaBooking.length > 0)
    pass('pesca', `Pesca — ${pescaBooking.length} CTAs de reserva/contacto encontrados`);
  else
    warn('pesca', `Pesca — nenhum CTA de reserva/contacto externo encontrado`);

  // ════════════════════════════════════════════════════════════════════
  // 3. surf.html
  // ════════════════════════════════════════════════════════════════════
  await auditPage(page, jsErrors, 'surf', 'surf.html');

  checkJsErrors(jsErrors, 'surf');
  await checkContent(page, 'surf');
  await checkCTAs(page, 'surf');
  await checkImages(page, 'surf');

  // ════════════════════════════════════════════════════════════════════
  // 4. login.html
  // ════════════════════════════════════════════════════════════════════
  await auditPage(page, jsErrors, 'login', 'login.html');

  checkJsErrors(jsErrors, 'login');
  await checkContent(page, 'login');
  await checkImages(page, 'login');

  // Check if a real login form exists
  const loginFormData = await page.evaluate(() => {
    const form = document.querySelector('form');
    const emailInput    = document.querySelector('input[type="email"], input[name="email"]');
    const passwordInput = document.querySelector('input[type="password"]');
    const submitBtn     = document.querySelector('button[type="submit"], input[type="submit"]');
    return {
      formExists:     !!form,
      emailExists:    !!emailInput,
      passwordExists: !!passwordInput,
      submitExists:   !!submitBtn,
      submitText:     submitBtn ? submitBtn.innerText.trim() : null,
    };
  });
  info('login', `Form data: ${JSON.stringify(loginFormData)}`);

  if (loginFormData.formExists && loginFormData.emailExists && loginFormData.passwordExists && loginFormData.submitExists)
    pass('login', `Form — formulário de login real com email+password+submit`);
  else
    fail('login', `Form — formulário incompleto: ${JSON.stringify(loginFormData)}`);

  // Check if the page source (inline scripts) calls Supabase auth
  const loginUsesSupabase = await page.evaluate(() => {
    const scripts = Array.from(document.querySelectorAll('script:not([src])'))
      .map(s => s.textContent);
    const combined = scripts.join('\n');
    return {
      hasSignIn:          combined.includes('signIn') || combined.includes('signInWithPassword'),
      hasSupabaseCDN:     !!document.querySelector('script[src*="supabase"]'),
      hasConfigScript:    !!document.querySelector('script[src*="config"]'),
      hasDbAuth:          combined.includes('db.auth') || combined.includes('supabase.auth'),
    };
  });
  info('login', `Supabase auth: ${JSON.stringify(loginUsesSupabase)}`);

  if (loginUsesSupabase.hasSignIn || loginUsesSupabase.hasDbAuth)
    pass('login', `Auth — login chama Supabase auth (signIn/db.auth detectado)`);
  else
    fail('login', `Auth — login NÃO chama Supabase auth — pode ser mock`);

  if (!loginUsesSupabase.hasSupabaseCDN && !loginUsesSupabase.hasConfigScript)
    warn('login', `Auth — sem CDN Supabase nem config.js carregado`);
  else
    pass('login', `Auth — Supabase CDN ou config.js presente`);

  // ════════════════════════════════════════════════════════════════════
  // 5. dashboard.html
  // ════════════════════════════════════════════════════════════════════
  await auditPage(page, jsErrors, 'dashboard', 'dashboard.html');

  checkJsErrors(jsErrors, 'dashboard');
  await checkContent(page, 'dashboard');
  await checkImages(page, 'dashboard');

  // Check auth protection
  const dashboardAuthData = await page.evaluate(() => {
    const scripts = Array.from(document.querySelectorAll('script:not([src])'))
      .map(s => s.textContent).join('\n');
    const redirected = window.location.href.includes('login');
    return {
      hasRequireAuth:   scripts.includes('requireAuth') || scripts.includes('getUser') || scripts.includes('getSession'),
      hasAuthCheck:     scripts.includes('db.auth') || scripts.includes('supabase.auth'),
      hasRedirectToLogin: scripts.includes('login.html') || scripts.includes('/login'),
      currentUrl:       window.location.href,
      isOnLoginPage:    window.location.href.includes('login'),
    };
  });
  info('dashboard', `Auth protection: ${JSON.stringify(dashboardAuthData)}`);

  if (dashboardAuthData.isOnLoginPage)
    pass('dashboard', `Auth — dashboard redirecionou para login (correto — sem sessão)`);
  else if (dashboardAuthData.hasRequireAuth || dashboardAuthData.hasAuthCheck)
    pass('dashboard', `Auth — dashboard tem verificação de autenticação`);
  else
    fail('dashboard', `Auth — dashboard sem verificação de auth — acessível sem sessão`);

  // Check for real data vs mock
  const dashboardDataSource = await page.evaluate(() => {
    const scripts = Array.from(document.querySelectorAll('script:not([src])'))
      .map(s => s.textContent).join('\n');
    return {
      hasMockData:    scripts.includes('mockData') || scripts.includes('mock_data') || scripts.includes('// mock') || scripts.includes('MOCK'),
      hasSupabaseQuery: scripts.includes('.from(') || scripts.includes('.select(') || scripts.includes('.rpc('),
      hasHardcodedData: scripts.includes('João Silva') || scripts.includes('dummy') || scripts.includes('Lorem ipsum'),
    };
  });
  info('dashboard', `Fonte de dados: ${JSON.stringify(dashboardDataSource)}`);

  if (dashboardDataSource.hasMockData || dashboardDataSource.hasHardcodedData)
    warn('dashboard', `Data — dashboard usa dados mock/hardcoded`);
  else if (dashboardDataSource.hasSupabaseQuery)
    pass('dashboard', `Data — dashboard faz queries reais ao Supabase`);
  else
    warn('dashboard', `Data — não detetada fonte de dados clara (mock nem real)`);

  // ════════════════════════════════════════════════════════════════════
  // 6. precos.html
  // ════════════════════════════════════════════════════════════════════
  await auditPage(page, jsErrors, 'precos', 'precos.html');

  checkJsErrors(jsErrors, 'precos');
  await checkContent(page, 'precos');
  await checkCTAs(page, 'precos');
  await checkImages(page, 'precos');

  // Check pricing cards
  const pricingData = await page.evaluate(() => {
    const priceEls = Array.from(document.querySelectorAll('[class*="price"], [class*="plan"], [class*="prec"]'));
    const ctaLinks = Array.from(document.querySelectorAll('a[href]'))
      .filter(a => {
        const t = (a.innerText || '').toLowerCase();
        const h = a.href || '';
        return t.includes('registar') || t.includes('ativar') || t.includes('comecar') ||
               t.includes('começar') || t.includes('subscribe') || t.includes('comprar') ||
               h.includes('stripe') || h.includes('payment') || h.includes('checkout') ||
               h.includes('register') || h.includes('login');
      })
      .map(a => ({ text: a.innerText.trim().slice(0, 50), href: a.href.slice(0, 80) }));

    // Look for actual currency/price text
    const bodyText = document.body.innerText;
    const hasEuros   = bodyText.includes('€') || bodyText.includes('EUR');
    const hasStripe  = !!document.querySelector('script[src*="stripe"]');
    const hasFree    = bodyText.toLowerCase().includes('grátis') || bodyText.toLowerCase().includes('free');

    return { priceElCount: priceEls.length, ctaLinks, hasEuros, hasStripe, hasFree };
  });

  info('precos', `Pricing: hasEuros=${pricingData.hasEuros}, hasStripe=${pricingData.hasStripe}, hasFree=${pricingData.hasFree}`);
  info('precos', `CTAs de pagamento: ${JSON.stringify(pricingData.ctaLinks.slice(0, 5))}`);

  if (pricingData.hasEuros) pass('precos', `Prices — preços em euros presentes`);
  else                       warn('precos', `Prices — sem valores em euros na página`);

  if (pricingData.hasStripe) pass('precos', `Payment — Stripe integrado`);
  else                       warn('precos', `Payment — sem integração Stripe (CTAs podem ser só para login/registo)`);

  const paymentCTAs = pricingData.ctaLinks.filter(c =>
    c.href.includes('stripe') || c.href.includes('payment') || c.href.includes('checkout')
  );
  const loginCTAs = pricingData.ctaLinks.filter(c =>
    c.href.includes('login') || c.href.includes('register')
  );

  if (paymentCTAs.length > 0)
    pass('precos', `CTAs — ${paymentCTAs.length} CTAs apontam para pagamento real`);
  else if (loginCTAs.length > 0)
    warn('precos', `CTAs — CTAs de preços apontam para login/registo (sem payment gateway): ${JSON.stringify(loginCTAs.slice(0,3))}`);
  else
    fail('precos', `CTAs — nenhum CTA de pagamento ou registo encontrado`);

  // ════════════════════════════════════════════════════════════════════
  // 7. media-kit.html
  // ════════════════════════════════════════════════════════════════════
  await auditPage(page, jsErrors, 'media-kit', 'media-kit.html');

  checkJsErrors(jsErrors, 'media-kit');
  await checkContent(page, 'media-kit');
  await checkCTAs(page, 'media-kit');
  await checkImages(page, 'media-kit');

  // Check download links
  const downloadLinks = await page.evaluate(() =>
    Array.from(document.querySelectorAll('a[href]'))
      .filter(a => {
        const h = a.href || '';
        const t = (a.innerText || '').toLowerCase();
        return h.includes('.pdf') || h.includes('.zip') || h.includes('.png') ||
               h.includes('download') || h.includes('drive.google') ||
               t.includes('download') || t.includes('descarregar') || t.includes('pdf');
      })
      .map(a => ({ text: a.innerText.trim().slice(0, 50), href: a.href.slice(0, 80) }))
  );
  info('media-kit', `Download links: ${JSON.stringify(downloadLinks.slice(0, 6))}`);

  if (downloadLinks.length > 0)
    pass('media-kit', `Downloads — ${downloadLinks.length} links de download/ficheiros encontrados`);
  else
    warn('media-kit', `Downloads — nenhum link de download real encontrado`);

  // Check stats/audience data (real or placeholder)
  const mediaStats = await page.evaluate(() => {
    const body = document.body.innerText;
    const hasPlaceholder = body.includes('XXX') || body.includes('TBD') ||
                           body.includes('000 visitas') || body.includes('[insert');
    const hasNumbers     = /\d{1,3}[.,]\d{3}|\d{4,}/.test(body); // 4+ digit numbers
    return { hasPlaceholder, hasNumbers };
  });
  if (mediaStats.hasPlaceholder)
    warn('media-kit', `Content — tem placeholders (XXX/TBD) nos dados`);
  else if (mediaStats.hasNumbers)
    pass('media-kit', `Content — tem dados numéricos reais`);
  else
    warn('media-kit', `Content — sem dados numéricos detectados`);

  // Check commercial contact
  const contactCTAs = await page.evaluate(() =>
    Array.from(document.querySelectorAll('a[href]'))
      .filter(a => {
        const h = a.href || '';
        return h.includes('mailto:') || h.includes('contact') || h.includes('parceiros');
      })
      .map(a => ({ text: a.innerText.trim().slice(0, 40), href: a.href.slice(0, 80) }))
  );
  if (contactCTAs.length > 0)
    pass('media-kit', `Contact — ${contactCTAs.length} CTAs de contacto comercial`);
  else
    warn('media-kit', `Contact — sem CTA de contacto comercial`);

  // ════════════════════════════════════════════════════════════════════
  // 8. parceiros.html — secondary flows
  // ════════════════════════════════════════════════════════════════════
  await auditPage(page, jsErrors, 'parceiros', 'parceiros.html');

  checkJsErrors(jsErrors, 'parceiros');
  await checkContent(page, 'parceiros');
  await checkCTAs(page, 'parceiros');
  await checkImages(page, 'parceiros');

  // Check B2B form
  const parceirosForm = await page.evaluate(() => {
    const form = document.getElementById('b2b-form') ||
                 document.querySelector('form[id*="partner"], form[id*="parceiro"], form[class*="partner"]');
    const allForms = Array.from(document.querySelectorAll('form'));
    return {
      b2bFormExists: !!form,
      allFormsCount: allForms.length,
      formIds: allForms.map(f => f.id || f.className.slice(0, 30)),
    };
  });
  info('parceiros', `Forms: ${JSON.stringify(parceirosForm)}`);

  if (parceirosForm.b2bFormExists)
    pass('parceiros', `Form — formulário B2B encontrado`);
  else if (parceirosForm.allFormsCount > 0)
    warn('parceiros', `Form — ${parceirosForm.allFormsCount} form(s) mas sem #b2b-form: ${JSON.stringify(parceirosForm.formIds)}`);
  else
    fail('parceiros', `Form — nenhum formulário de parceiro encontrado`);

  // Check form has submit handler via Supabase
  const parceirosFormHandler = await page.evaluate(() => {
    const scripts = Array.from(document.querySelectorAll('script:not([src])'))
      .map(s => s.textContent).join('\n');
    return {
      hasSubmitListener: scripts.includes('addEventListener') && (scripts.includes('submit') || scripts.includes('Submit')),
      hasSupabaseInsert: scripts.includes('.insert(') || scripts.includes('.upsert(') || scripts.includes('db.from('),
    };
  });
  info('parceiros', `Form handler: ${JSON.stringify(parceirosFormHandler)}`);

  if (parceirosFormHandler.hasSubmitListener && parceirosFormHandler.hasSupabaseInsert)
    pass('parceiros', `Form handler — submit listener + Supabase insert detetados`);
  else if (parceirosFormHandler.hasSubmitListener)
    warn('parceiros', `Form handler — submit listener existe mas sem insert Supabase`);
  else
    warn('parceiros', `Form handler — sem submit listener ou handler Supabase detetado`);

  // ════════════════════════════════════════════════════════════════════
  // 9. index.html — secondary CTAs + service worker
  // ════════════════════════════════════════════════════════════════════
  await auditPage(page, jsErrors, 'index', 'index.html');

  checkJsErrors(jsErrors, 'index');
  await checkContent(page, 'index');
  await checkCTAs(page, 'index');
  await checkImages(page, 'index');

  // Check service worker registration in page
  const swRegistration = await page.evaluate(() => {
    const scripts = Array.from(document.querySelectorAll('script:not([src])'))
      .map(s => s.textContent).join('\n');
    return {
      hasRegister:    scripts.includes('serviceWorker.register') || scripts.includes('navigator.serviceWorker'),
      registerPath:   (scripts.match(/register\s*\(\s*['"]([^'"]+)['"]/)?.[1]) || null,
    };
  });
  info('index', `Service Worker: ${JSON.stringify(swRegistration)}`);

  if (swRegistration.hasRegister)
    pass('index', `SW — service worker registado no index.html (${swRegistration.registerPath || 'path não detectado'})`);
  else
    warn('index', `SW — service worker NÃO registado no index.html`);

  // Check secondary CTAs (hero, monetization)
  const secondaryCTAs = await page.evaluate(() => {
    const ctas = Array.from(document.querySelectorAll('.btn, [class*="cta"], [class*="hero"] a'))
      .filter(el => el.tagName === 'A' || el.tagName === 'BUTTON')
      .map(el => ({
        tag:  el.tagName,
        text: (el.innerText || '').trim().slice(0, 50),
        href: el.getAttribute('href') || null,
      }));
    return ctas;
  });
  info('index', `Secondary CTAs encontrados: ${secondaryCTAs.length}`);
  secondaryCTAs.slice(0, 6).forEach(c => info('index', `  CTA: [${c.tag}] "${c.text}" → ${c.href}`));

  const brokenSecondaryCTAs = secondaryCTAs.filter(c => c.tag === 'A' && (!c.href || c.href === '#'));
  if (brokenSecondaryCTAs.length === 0)
    pass('index', `Secondary CTAs — todos os CTAs âncora têm href real`);
  else
    warn('index', `Secondary CTAs — ${brokenSecondaryCTAs.length} CTAs sem href: ${JSON.stringify(brokenSecondaryCTAs.slice(0, 3))}`);

  // ════════════════════════════════════════════════════════════════════
  // 10. sw.js — static analysis
  // ════════════════════════════════════════════════════════════════════
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`  PAGE: sw.js  →  static file analysis`);
  console.log(`${'─'.repeat(60)}`);

  const swContent = fs.readFileSync(SW_PATH, 'utf8');

  // Extract CACHE_NAME
  const cacheNameMatch = swContent.match(/const\s+CACHE_NAME\s*=\s*['"]([^'"]+)['"]/);
  const cacheName = cacheNameMatch ? cacheNameMatch[1] : 'unknown';
  info('sw.js', `CACHE_NAME: ${cacheName}`);

  // Extract SHELL (precache list)
  const shellMatch = swContent.match(/const\s+SHELL\s*=\s*\[([\s\S]*?)\]/);
  let shellFiles = [];
  if (shellMatch) {
    shellFiles = shellMatch[1]
      .split('\n')
      .map(l => l.trim().replace(/^['"]|['"],?$/g, '').trim())
      .filter(l => l.startsWith('/'));
  }
  info('sw.js', `SHELL precache list (${shellFiles.length} files): ${shellFiles.join(', ')}`);

  // Check each precached file exists on disk
  const missing = [];
  const present = [];
  for (const f of shellFiles) {
    const localPath = path.join(ROOT, f === '/' ? 'index.html' : f);
    if (fs.existsSync(localPath)) present.push(f);
    else                          missing.push(f);
  }

  if (missing.length === 0)
    pass('sw.js', `Precache — todos os ${present.length} ficheiros da SHELL existem em disco`);
  else
    fail('sw.js', `Precache — ${missing.length} ficheiros em SHELL não existem: ${missing.join(', ')}`);

  // Check for new pages NOT in SW precache
  const htmlFiles = fs.readdirSync(ROOT)
    .filter(f => f.endsWith('.html') && !f.startsWith('case-study') && !f.startsWith('proposal') && !f.startsWith('partner-demo'))
    .map(f => '/' + f);
  const notPrecached = htmlFiles.filter(f => !shellFiles.includes(f));
  if (notPrecached.length > 0)
    warn('sw.js', `Precache — ${notPrecached.length} páginas HTML não estão no SHELL: ${notPrecached.join(', ')}`);
  else
    pass('sw.js', `Precache — todas as páginas HTML principais estão no SHELL`);

  // Check strategy logic
  const hasNetworkFirstHTML = swContent.includes('isHTML') && swContent.includes('fetch(request)');
  const hasCacheFirstStatic = swContent.includes('caches.match(request)');
  const hasSkipWaiting      = swContent.includes('skipWaiting');
  const hasClientsClaim     = swContent.includes('clients.claim');
  const hasOfflineFallback  = swContent.includes('offline.html');

  info('sw.js', `Strategy: networkFirstHTML=${hasNetworkFirstHTML}, cacheFirstStatic=${hasCacheFirstStatic}`);
  info('sw.js', `Controls: skipWaiting=${hasSkipWaiting}, clientsClaim=${hasClientsClaim}, offlineFallback=${hasOfflineFallback}`);

  if (hasNetworkFirstHTML && hasCacheFirstStatic)
    pass('sw.js', `Strategy — network-first HTML + cache-first static implementados`);
  else
    warn('sw.js', `Strategy — estratégia de cache não segue padrão esperado`);

  if (hasOfflineFallback)
    pass('sw.js', `Offline — fallback para offline.html implementado`);
  else
    fail('sw.js', `Offline — sem fallback offline detetado`);

  if (hasSkipWaiting)
    warn('sw.js', `skipWaiting — skipWaiting() ativo (pode causar atualizações abruptas para utilizadores)`);

  // Check for stale cache risk (static version vs new files)
  const cacheVersion = (cacheName.match(/v(\d+)$/) || [, '?'])[1];
  info('sw.js', `Cache version: v${cacheVersion} — se SHELL mudar, incrementar versão`);

  // ════════════════════════════════════════════════════════════════════
  // Console errors summary
  // ════════════════════════════════════════════════════════════════════
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`  CONSOLE ERRORS ACROSS ALL PAGES`);
  console.log(`${'═'.repeat(60)}`);
  if (consoleErrs.length === 0) {
    pass('console', `Nenhum erro de console em todas as páginas`);
  } else {
    warn('console', `${consoleErrs.length} erros de console acumulados:`);
    consoleErrs.forEach((e, i) => info('console', `  [${i+1}] ${e.slice(0, 120)}`));
  }

  // ════════════════════════════════════════════════════════════════════
  // Final summary
  // ════════════════════════════════════════════════════════════════════
  await browser.close();
  server.close();

  console.log(`\n${'═'.repeat(60)}`);
  console.log('  BATCH 2 AUDIT — RESULTADO FINAL');
  console.log(`${'═'.repeat(60)}`);

  const passes = RESULTS.filter(r => r.status === 'PASS').length;
  const fails  = RESULTS.filter(r => r.status === 'FAIL').length;
  const warns  = RESULTS.filter(r => r.status === 'WARN').length;

  console.log(`\n  PASS: ${passes}  |  FAIL: ${fails}  |  WARN: ${warns}`);
  console.log('');

  if (fails > 0) {
    console.log('  ── FAILS ──');
    RESULTS.filter(r => r.status === 'FAIL').forEach(r =>
      console.log(`  ✗ [${r.id}] ${r.msg}`)
    );
    console.log('');
  }

  if (warns > 0) {
    console.log('  ── WARNS ──');
    RESULTS.filter(r => r.status === 'WARN').forEach(r =>
      console.log(`  ⚠ [${r.id}] ${r.msg}`)
    );
    console.log('');
  }

  console.log(`\n  Screenshots saved to: ${OUT}`);
  console.log(`  Total checks: ${RESULTS.length}`);
})();
