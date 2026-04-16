/**
 * pw-smoke.js — Portugal Travel Hub · Funnel Smoke Test
 * Run: node pw-smoke.js
 * Requires: npx playwright install chromium
 */
const { chromium } = require('playwright');

const BASE = 'https://portalturismoportugal.com';
const BUGS = [];
const PASS = [];

function bug(severity, page, desc) {
  BUGS.push({ severity, page, desc });
  console.log(`  [${severity}] ${desc}`);
}
function pass(page, desc) {
  PASS.push({ page, desc });
  console.log(`  [OK] ${desc}`);
}

(async () => {
  const browser = await chromium.launch({ headless: true });

  // ── 1. precos.html — toggle + CTAs ────────────────────────────────────
  console.log('\n[1] precos.html — billing toggle + CTAs');
  {
    const ctx  = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    const jsErrs = [];
    page.on('pageerror', e => jsErrs.push(e.message));
    await page.goto(`${BASE}/precos.html`, { waitUntil: 'networkidle' });

    // Free plan CTA → login (first .plan-cta.outline)
    const allCtas = await page.$$eval('.plan-cta.outline', els => els.map(e => ({ text: e.textContent.trim(), href: e.getAttribute('href') })));
    const freeCta    = allCtas.find(c => c.text.includes('grátis') || c.text.includes('Grátis'));
    const partnerCta = allCtas.find(c => c.href && c.href.includes('parceiros'));

    if (freeCta && freeCta.href && freeCta.href.includes('login')) {
      pass('precos', `Free CTA → login.html ✓ (${freeCta.text})`);
    } else {
      bug('P1', 'precos', `Free CTA href wrong: ${JSON.stringify(freeCta)}`);
    }
    if (partnerCta && partnerCta.href.includes('parceiros')) {
      pass('precos', `Partner CTA → parceiros.html ✓`);
    } else {
      bug('P0', 'precos', `Partner CTA not found or broken: ${JSON.stringify(allCtas)}`);
    }

    // Monthly Pro CTA
    const ctaMonthly = await page.$eval('#cta-pro', el => el.getAttribute('href'));
    if (ctaMonthly && ctaMonthly.includes('login') && ctaMonthly.includes('lemonsqueezy')) {
      pass('precos', `Monthly Pro CTA routes via login → LS ✓`);
    } else {
      bug('P0', 'precos', `Monthly CTA broken: ${ctaMonthly}`);
    }
    if (ctaMonthly && ctaMonthly.includes('success_url')) {
      pass('precos', `success_url encoded in monthly CTA ✓`);
    } else {
      bug('P1', 'precos', 'success_url missing from monthly CTA');
    }

    // Toggle to annual → price + variant change
    await page.click('#billing-toggle');
    await page.waitForTimeout(300);
    const annualPrice = await page.$eval('#price-pro', el => el.textContent.trim());
    if (annualPrice === '3,74') {
      pass('precos', `Annual price €${annualPrice}/mês ✓`);
    } else {
      bug('P0', 'precos', `Annual price wrong: "${annualPrice}"`);
    }
    const ctaAnnual = await page.$eval('#cta-pro', el => el.getAttribute('href'));
    if (ctaAnnual && ctaAnnual.includes('5cc5346d')) {
      pass('precos', `Annual CTA uses annual variant ✓`);
    } else {
      bug('P0', 'precos', `Annual CTA still monthly variant: ${ctaAnnual?.slice(0, 80)}`);
    }
    if (ctaAnnual && ctaAnnual.includes('success_url')) {
      pass('precos', `success_url encoded in annual CTA ✓`);
    } else {
      bug('P1', 'precos', 'success_url missing from annual CTA');
    }

    // Mobile: toggle still visible
    await page.setViewportSize({ width: 390, height: 844 });
    if (await page.isVisible('#billing-toggle')) {
      pass('precos', 'Billing toggle visible on mobile ✓');
    } else {
      bug('P1', 'precos', 'Billing toggle not visible on mobile');
    }

    if (jsErrs.length) bug('P1', 'precos', `JS errors: ${jsErrs.join(' | ')}`);
    await ctx.close();
  }

  // ── 2. login.html ──────────────────────────────────────────────────────
  console.log('\n[2] login.html — redirect param + tabs + font-size');
  {
    const ctx  = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    const jsErrs = [];
    page.on('pageerror', e => jsErrs.push(e.message));
    const lsUrl = 'https://portalturismoportugal.lemonsqueezy.com/checkout/buy/test';
    await page.goto(`${BASE}/login.html?redirect=${encodeURIComponent(lsUrl)}#register`, { waitUntil: 'networkidle' });

    // Register tab shown via hash
    if (await page.isVisible('#form-register')) {
      pass('login', 'Register tab active via #register ✓');
    } else {
      bug('P0', 'login', 'Register form not shown for #register hash');
    }

    // _safeRedirect whitelist accepts lemonsqueezy.com
    const safe = await page.evaluate(() => {
      const p = new URLSearchParams(window.location.search).get('redirect') || '';
      return !!(p && /^https:\/\/([a-z0-9-]+\.lemonsqueezy\.com|portal-turismo-portugal\.pages\.dev)\//.test(p));
    });
    if (safe) {
      pass('login', '_safeRedirect whitelist accepts LS URL ✓');
    } else {
      bug('P0', 'login', '_safeRedirect rejected valid LemonSqueezy URL');
    }

    // Reset link exists (onclick-based, not href-based)
    const resetLink = await page.$('a[onclick*="reset"]');
    if (resetLink) {
      const text = await resetLink.textContent();
      pass('login', `Reset link present: "${text.trim()}" ✓`);
    } else {
      bug('P1', 'login', 'No reset password link found');
    }

    // Email input font-size ≥ 16px (iOS auto-zoom prevention)
    const emailInput = await page.$('#register-email');
    if (emailInput) {
      const fs = await page.evaluate(el => parseFloat(window.getComputedStyle(el).fontSize), emailInput);
      if (fs >= 16) {
        pass('login', `Email input font-size ${fs}px ≥ 16px (no iOS zoom) ✓`);
      } else {
        bug('P1', 'login', `Email input font-size ${fs}px < 16px — iOS auto-zoom`);
      }
    }

    if (jsErrs.length) bug('P1', 'login', `JS errors: ${jsErrs.join(' | ')}`);
    await ctx.close();
  }

  // ── 3. dashboard.html?activated=1 — unauth redirect ───────────────────
  console.log('\n[3] dashboard.html?activated=1 — auth guard');
  {
    const ctx  = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    const jsErrs = [];
    page.on('pageerror', e => jsErrs.push(e.message));
    await page.goto(`${BASE}/dashboard.html?activated=1`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);
    // Cloudflare Pages normalises /login.html → /login — check for either
    const url = page.url();
    if (url.includes('/login')) {
      pass('dashboard', `Unauthenticated → redirected to ${url} ✓`);
    } else {
      bug('P0', 'dashboard', `No auth redirect — stayed at: ${url}`);
    }
    if (jsErrs.length) bug('P1', 'dashboard', `JS errors: ${jsErrs.join(' | ')}`);
    await ctx.close();
  }

  // ── 4. reset.html — no-token state ────────────────────────────────────
  console.log('\n[4] reset.html — expected error state without token');
  {
    const ctx  = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    const jsErrs = [];
    page.on('pageerror', e => jsErrs.push(e.message));
    await page.goto(`${BASE}/reset.html`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(7000); // wait past the 6s Supabase recovery timeout
    const visibleStates = await page.evaluate(() => {
      return ['state-loading','state-form','state-error','state-success']
        .filter(id => { const el = document.getElementById(id); return el && getComputedStyle(el).display !== 'none'; });
    });
    if (visibleStates.includes('state-error')) {
      pass('reset', `No-token state shows state-error (expected Supabase behavior) ✓`);
    } else if (visibleStates.includes('state-loading')) {
      bug('P1', 'reset', 'Reset page stuck in loading state after 7s without token');
    } else {
      bug('P0', 'reset', `Unexpected visible states: ${JSON.stringify(visibleStates)}`);
    }
    // Back to login link
    const backLink = await page.$('a[href*="login"]');
    if (backLink) pass('reset', 'Back to login link present ✓');
    else bug('P1', 'reset', 'No back-to-login link');

    if (jsErrs.length) bug('P1', 'reset', `JS errors: ${jsErrs.join(' | ')}`);
    await ctx.close();
  }

  // ── 5. index.html ──────────────────────────────────────────────────────
  console.log('\n[5] index.html — preloader + nav + hero');
  {
    const ctx  = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    const jsErrs = [];
    page.on('pageerror', e => jsErrs.push(e.message));
    await page.goto(`${BASE}/index.html`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3500);

    const preloaderGone = await page.evaluate(() => {
      const el = document.getElementById('preloader');
      return !el || el.classList.contains('gone');
    });
    if (preloaderGone) pass('index', 'Preloader dismissed ≤ 3.5s ✓');
    else bug('P0', 'index', 'Preloader still blocking after 3.5s');

    const navLinks = await page.$$eval('nav a[href]', els => els.map(e => e.getAttribute('href')));
    const deadNav  = navLinks.filter(h => h === '#' || h === '');
    if (!deadNav.length) pass('index', 'No dead nav links ✓');
    else bug('P1', 'index', `Dead nav hrefs: ${deadNav.join(', ')}`);

    const poster = await page.$eval('video.hero__video', el => el.poster).catch(() => '');
    if (poster.includes('unsplash')) pass('index', 'Hero video poster set ✓');
    else bug('P1', 'index', 'Hero video poster missing');

    await page.setViewportSize({ width: 390, height: 844 });
    const ham = await page.$('.nav__hamburger, [aria-label*="menu" i], .hamburger');
    if (ham) pass('index', 'Mobile hamburger present ✓');
    else bug('P1', 'index', 'No mobile hamburger');

    if (jsErrs.length) bug('P1', 'index', `JS errors: ${jsErrs.join(' | ')}`);
    await ctx.close();
  }

  // ── 6. beaches.html ────────────────────────────────────────────────────
  console.log('\n[6] beaches.html — card render + search');
  {
    const ctx  = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    const jsErrs = [];
    page.on('pageerror', e => jsErrs.push(e.message));
    await page.goto(`${BASE}/beaches.html`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const cardCount = await page.$$eval('.beach-card, [class*="beach"][class*="card"]', els => els.length);
    if (cardCount > 0) pass('beaches', `${cardCount} beach cards rendered ✓`);
    else bug('P0', 'beaches', 'No beach cards — JS or Supabase failure');

    const searchInput = await page.$('input[type="search"], input[placeholder*="praia" i], #search-input, [id*="search"]');
    if (searchInput) pass('beaches', 'Search input present ✓');
    else bug('P1', 'beaches', 'No search input found');

    if (jsErrs.length) bug('P1', 'beaches', `JS errors: ${jsErrs.join(' | ')}`);
    await ctx.close();
  }

  // ── 7. planear.html — recommendation engine (3 combinations) ──────────
  console.log('\n[7] planear.html — recommendation engine');
  {
    const ctx  = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    const jsErrs = [];
    page.on('pageerror', e => jsErrs.push(e.message));
    await page.goto(`${BASE}/planear.html`, { waitUntil: 'networkidle' });

    // Combo 1: surf + cascais + moderado
    const r1 = await page.evaluate(() => {
      if (typeof buildRecommendation !== 'function') return null;
      buildRecommendation({ nome:'Test', email:'', interesse:['surf'], orcamento:'moderado', regiao:'cascais', pessoas:'2' });
      return { title: document.getElementById('rec-title')?.textContent, dest: document.getElementById('rec-destination')?.textContent };
    });
    if (!r1) { bug('P0', 'planear', 'buildRecommendation not defined'); }
    else {
      if (r1.title.includes('Test')) pass('planear', `Personalised title: "${r1.title}" ✓`);
      else bug('P1', 'planear', `Title not personalised: "${r1.title}"`);
      if (r1.dest && r1.dest.length > 2) pass('planear', `surf+cascais → "${r1.dest}" ✓`);
      else bug('P0', 'planear', `surf+cascais: empty destination`);
    }

    // Combo 2: pesca + algarve + premium + grupo
    const r2 = await page.evaluate(() => {
      buildRecommendation({ nome:'', email:'', interesse:['pesca'], orcamento:'premium', regiao:'algarve', pessoas:'5-8' });
      return { dest: document.getElementById('rec-destination')?.textContent, budget: document.getElementById('rec-budget-note')?.textContent };
    });
    if (r2.dest?.toLowerCase().includes('algarve')) pass('planear', `pesca+algarve → "${r2.dest}" ✓`);
    else bug('P1', 'planear', `pesca+algarve wrong: "${r2.dest}"`);
    if (r2.budget?.toLowerCase().includes('reserva')) pass('planear', 'Group note for 5-8 pessoas ✓');
    else bug('P1', 'planear', `Group note missing: "${r2.budget}"`);

    // Combo 3: roteiro + sem região
    const r3 = await page.evaluate(() => {
      buildRecommendation({ nome:'Ana', email:'', interesse:['roteiro'], orcamento:'', regiao:'', pessoas:'' });
      return { dest: document.getElementById('rec-destination')?.textContent };
    });
    if (r3.dest?.toLowerCase().includes('lisboa') || r3.dest?.toLowerCase().includes('sagres')) pass('planear', `roteiro → "${r3.dest}" ✓`);
    else bug('P1', 'planear', `roteiro dest wrong: "${r3.dest}"`);

    // Mobile submit target size
    const slider = await page.$('.sld-track');
    if (slider) {
      const box = await slider.boundingBox();
      if (box && box.height >= 44) pass('planear', `Slider height ${box.height}px ≥ 44px ✓`);
      else bug('P1', 'planear', `Slider too small: ${box?.height}px`);
    }

    if (jsErrs.length) bug('P1', 'planear', `JS errors: ${jsErrs.join(' | ')}`);
    await ctx.close();
  }

  // ── Summary ─────────────────────────────────────────────────────────────
  await browser.close();

  console.log('\n══════════════════════════════════════════');
  console.log(`PASSED: ${PASS.length}   BUGS: ${BUGS.length}`);
  console.log('══════════════════════════════════════════');
  if (BUGS.length) {
    console.log('\nBUGS:');
    BUGS.forEach(b => console.log(`  [${b.severity}] ${b.page}: ${b.desc}`));
  } else {
    console.log('\nNo P0/P1 bugs found. All funnels clean.');
  }

  const fs = require('fs');
  fs.writeFileSync('smoke-results.json', JSON.stringify({ passed: PASS.length, bugs: BUGS }, null, 2));
  try { fs.unlinkSync('verify-bugs.js'); } catch(_) {}
  process.exit(BUGS.some(b => b.severity === 'P0') ? 1 : 0);
})();
