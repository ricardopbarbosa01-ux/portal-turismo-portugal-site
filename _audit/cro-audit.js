/**
 * Portugal Travel Hub — Browser CRO Audit
 * Tests: CTAs, forms, images, monetization surfaces, mobile, trust signals
 */
const { chromium } = require('playwright');
const BASE = 'http://127.0.0.1:17350';

const PAGES = [
  { id: 'index',      url: '/',               label: 'Homepage' },
  { id: 'precos',     url: '/precos.html',    label: 'Pricing' },
  { id: 'parceiros',  url: '/parceiros.html', label: 'Partners' },
  { id: 'planear',    url: '/planear.html',   label: 'Plan Trip' },
  { id: 'beaches',    url: '/beaches.html',   label: 'Beaches' },
  { id: 'surf',       url: '/surf.html',      label: 'Surf' },
  { id: 'pesca',      url: '/pesca.html',     label: 'Fishing' },
  { id: 'webcams',    url: '/webcams.html',   label: 'Webcams' },
  { id: 'media-kit',  url: '/media-kit.html', label: 'Media Kit' },
  { id: 'login',      url: '/login.html',     label: 'Login' },
];

const MOBILE = { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 3 };
const DESKTOP = { width: 1440, height: 900 };

const findings = [];

function log(page, severity, category, issue, evidence = '') {
  findings.push({ page, severity, category, issue, evidence });
  const icons = { CRIT: '🔴', HIGH: '🟠', MED: '🟡', LOW: '🔵', PASS: '✅' };
  console.log(`${icons[severity] || '⚪'} [${severity}] [${page}] [${category}] ${issue}${evidence ? ' — ' + evidence : ''}`);
}

async function checkLinks(page, pageId, selector) {
  const links = await page.evaluate((sel) => {
    return [...document.querySelectorAll(sel)].map(a => ({
      text: a.textContent.trim().slice(0, 60),
      href: a.href,
      visible: a.offsetParent !== null,
      ariaDisabled: a.getAttribute('aria-disabled'),
    }));
  }, selector);
  return links;
}

async function checkImages(page, pageId) {
  const imgs = await page.evaluate(() => {
    return [...document.querySelectorAll('img')].map(img => ({
      src: img.src,
      alt: img.alt,
      broken: img.naturalWidth === 0 && img.complete,
      loaded: img.complete,
      loading: img.getAttribute('loading'),
    }));
  });
  const broken = imgs.filter(i => i.broken);
  const noAlt = imgs.filter(i => !i.alt);
  if (broken.length) log(pageId, 'HIGH', 'Images', `${broken.length} broken image(s)`, broken.map(i => i.src.slice(-60)).join(', '));
  if (noAlt.length > 3) log(pageId, 'LOW', 'A11y', `${noAlt.length} images missing alt text`);
  return { total: imgs.length, broken: broken.length };
}

async function auditPage(context, pageConfig, viewport, viewportLabel) {
  const page = await context.newPage();
  await page.setViewportSize(viewport);

  let consoleErrors = [];
  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text().slice(0, 100)); });

  try {
    const resp = await page.goto(`${BASE}${pageConfig.url}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    if (!resp || resp.status() >= 400) {
      log(pageConfig.id, 'CRIT', 'Load', `Page returned ${resp?.status() || 'no response'}`, pageConfig.url);
      return;
    }
    await page.waitForTimeout(1500);

    const pid = `${pageConfig.id}[${viewportLabel}]`;

    // ── Images ──────────────────────────────────────────────────────
    await checkImages(page, pid);

    // ── Nav Login/Register CTAs ──────────────────────────────────────
    const navLogin  = await page.$('#nav-login-btn');
    const navReg    = await page.$('#nav-register-btn');
    if (!navLogin) log(pid, 'HIGH', 'Nav', 'Missing #nav-login-btn');
    if (!navReg)   log(pid, 'HIGH', 'Nav', 'Missing #nav-register-btn');

    // ── Page-specific checks ─────────────────────────────────────────
    if (pageConfig.id === 'index') {
      // Hero CTAs
      const heroBtns = await page.$$('.hero-actions a');
      if (heroBtns.length < 2) {
        log(pid, 'HIGH', 'CRO', 'Hero has fewer than 2 CTAs');
      } else {
        const hrefs = await Promise.all(heroBtns.map(b => b.getAttribute('href')));
        const texts = await Promise.all(heroBtns.map(b => b.textContent()));
        const primaryOk = hrefs[0] === 'planear.html';
        log(pid, primaryOk ? 'PASS' : 'MED', 'CRO',
          `Hero primary CTA: "${texts[0].trim()}" → ${hrefs[0]}`,
          !primaryOk ? 'Primary CTA should point to planear.html for high-intent flow' : '');
      }

      // Conditions cards — are they clickable?
      const condCards = await page.$$('.condition-card');
      let deadCards = 0;
      for (const card of condCards) {
        const tag = await card.evaluate(el => el.tagName);
        const onclick = await card.evaluate(el => el.onclick || el.getAttribute('onclick'));
        const parent = await card.evaluate(el => el.parentElement.tagName);
        if (tag !== 'A' && !onclick) deadCards++;
      }
      if (deadCards > 0) log(pid, 'HIGH', 'CRO', `${deadCards} condition card(s) have no click action (dead interactive elements)`);

      // Planear CTA section
      const planearCta = await page.$('#planear-cta a.btn-primary');
      if (planearCta) {
        const href = await planearCta.getAttribute('href');
        log(pid, 'PASS', 'CRO', `Planear CTA → ${href}`);
      }

      // B2B strip
      const b2bStrip = await page.$('.b2b-strip');
      if (!b2bStrip) log(pid, 'MED', 'Monetization', 'B2B strip not found on homepage');

      // Featured beaches loaded?
      await page.waitForTimeout(2000);
      const fbCards = await page.$$('#fb-grid > *');
      if (fbCards.length === 0) {
        log(pid, 'HIGH', 'Data', 'Featured beach cards did not load (JS / Supabase dependency)');
      } else {
        log(pid, 'PASS', 'Data', `Featured beach grid loaded ${fbCards.length} card(s)`);
      }

      // Mobile: nav toggle
      if (viewportLabel === 'mobile') {
        const toggle = await page.$('#nav-toggle');
        if (toggle) {
          await toggle.click();
          await page.waitForTimeout(400);
          const navLinks = await page.$('.nav-links');
          const visible = await navLinks?.isVisible();
          if (!visible) log(pid, 'HIGH', 'Mobile', 'Nav toggle clicked but nav-links not visible');
          else log(pid, 'PASS', 'Mobile', 'Nav toggle opens correctly');
        }
      }
    }

    if (pageConfig.id === 'precos') {
      // Billing toggle
      const toggle = await page.$('#billing-toggle');
      if (!toggle) {
        log(pid, 'CRIT', 'Feature', 'Billing toggle #billing-toggle not found');
      } else {
        await toggle.click();
        await page.waitForTimeout(300);
        const pricePro = await page.$eval('#price-pro', el => el.textContent).catch(() => null);
        log(pid, pricePro ? 'PASS' : 'HIGH', 'Feature', `After toggle, #price-pro shows: "${pricePro}"`);
        const notePro = await page.$eval('#note-pro', el => el.textContent.trim()).catch(() => null);
        log(pid, notePro && notePro.length > 2 ? 'PASS' : 'MED', 'CRO', `Annual note for Pro: "${notePro}"`);
        await toggle.click(); // reset
        await page.waitForTimeout(200);
      }

      // Pro CTA
      const ctaPro = await page.$('#cta-pro');
      if (!ctaPro) {
        log(pid, 'CRIT', 'Monetization', '#cta-pro not found');
      } else {
        const href = await ctaPro.getAttribute('href');
        const ariaDisabled = await ctaPro.getAttribute('aria-disabled');
        if (!href || href === '#') {
          log(pid, ariaDisabled ? 'MED' : 'CRIT', 'Monetization',
            `Pro CTA href="${href}"${ariaDisabled ? ' (aria-disabled set — guarded)' : ' (no guard — dead click)'}`,
            'LemonSqueezy URLs not configured');
        } else if (href.startsWith('COLE_')) {
          log(pid, 'CRIT', 'Monetization', `Pro CTA href is placeholder: "${href.slice(0,40)}"`, 'LIVE BUG: navigates to broken URL');
        } else {
          log(pid, 'PASS', 'Monetization', `Pro CTA href configured: ${href.slice(0,60)}`);
        }
      }

      // Partner CTA
      const ctaPartner = await page.$$eval('.plan-cta.outline', els => els.map(e => ({ text: e.textContent.trim(), href: e.href })));
      for (const cta of ctaPartner) {
        const isBroadPartner = cta.href.includes('parceiros.html') && !cta.href.includes('#');
        log(pid, isBroadPartner ? 'MED' : 'PASS', 'CRO',
          `Partner CTA: "${cta.text}" → ${cta.href}`,
          isBroadPartner ? 'Sends to pitch page, not form anchor' : '');
      }

      // Microcopy trust line
      const trustLine = await page.$eval('.plan-card.featured p[style]', el => el.textContent.trim()).catch(() => null);
      log(pid, trustLine ? 'PASS' : 'MED', 'Trust', `Pro card microcopy: "${trustLine}"`);

      // Mobile: do cards stack?
      if (viewportLabel === 'mobile') {
        const planGrid = await page.$('.plans-grid');
        const style = await planGrid?.evaluate(el => window.getComputedStyle(el).gridTemplateColumns);
        log(pid, 'PASS', 'Mobile', `Plans grid on mobile: gridTemplateColumns = "${style}"`);
        const featuredCard = await page.$('.plan-card.featured');
        const box = await featuredCard?.boundingBox();
        if (box && box.width > viewport.width) log(pid, 'HIGH', 'Mobile', `Featured plan card overflows viewport (${box.width}px > ${viewport.width}px)`);
      }
    }

    if (pageConfig.id === 'parceiros') {
      // Form present?
      const form = await page.$('form');
      if (!form) {
        log(pid, 'CRIT', 'Form', 'No form found on parceiros.html');
      } else {
        // Required fields
        const inputs = await page.$$eval('form input, form select, form textarea', els =>
          els.map(e => ({ name: e.name || e.id, type: e.type, required: e.required, visible: e.offsetParent !== null }))
        );
        const requiredFields = inputs.filter(i => i.required);
        log(pid, 'PASS', 'Form', `Partner form has ${inputs.length} fields, ${requiredFields.length} required`);

        // Pricing tiers visible?
        const pricingOnPage = await page.evaluate(() => document.body.innerText.includes('19,99'));
        log(pid, pricingOnPage ? 'PASS' : 'MED', 'Monetization', `Partner pricing €19,99 visible on page: ${pricingOnPage}`);
      }

      // Hero CTAs
      const heroBtns = await page.$$('.hero-btn-gold, .hero-btn-ghost');
      log(pid, heroBtns.length >= 2 ? 'PASS' : 'MED', 'CRO', `Partner hero CTA buttons: ${heroBtns.length}`);

      // Trust stats band
      const statsBand = await page.$('.stats-band');
      log(pid, statsBand ? 'PASS' : 'MED', 'Trust', `Stats band present: ${!!statsBand}`);
    }

    if (pageConfig.id === 'planear') {
      // Form present?
      const form = await page.$('#plan-form');
      if (!form) {
        log(pid, 'CRIT', 'Form', '#plan-form not found on planear.html');
      } else {
        log(pid, 'PASS', 'Form', 'Plan form #plan-form present');
        // Email field
        const emailField = await page.$('input[type="email"]');
        log(pid, emailField ? 'PASS' : 'HIGH', 'Form', `Email field: ${!!emailField}`);
      }
      // Post-submit affiliate / upsell?
      const successSection = await page.$('#form-success, .form-success, [class*="success"]');
      // We check what happens post-submit by looking at success state HTML
      const successHtml = await page.evaluate(() => {
        const el = document.querySelector('#form-success') || document.querySelector('.plan-success');
        return el ? el.innerHTML.slice(0, 300) : null;
      });
      if (!successHtml) {
        log(pid, 'MED', 'Monetization', 'Success state HTML not found in DOM (may be hidden) — cannot verify post-submit affiliate/upsell');
      } else {
        const hasAffiliate = successHtml.includes('gyg.me') || successHtml.includes('booking.com') || successHtml.includes('mailto');
        log(pid, hasAffiliate ? 'PASS' : 'HIGH', 'Monetization',
          `Success state has affiliate/upsell: ${hasAffiliate}`,
          hasAffiliate ? '' : 'Dead-end after form submit — no next action for user');
      }
    }

    if (pageConfig.id === 'surf') {
      // GYG affiliate on surf?
      const bodyText = await page.evaluate(() => document.body.innerHTML);
      const hasGYG = bodyText.includes('gyg.me');
      log(pid, hasGYG ? 'PASS' : 'HIGH', 'Monetization', `GetYourGuide affiliate present: ${hasGYG}`);

      // Paywall / upgrade trigger?
      const hasPaywall = bodyText.includes('Pro') && (bodyText.includes('Desbloquear') || bodyText.includes('blur') || bodyText.includes('lock'));
      log(pid, hasPaywall ? 'PASS' : 'HIGH', 'Monetization', `Contextual Pro paywall trigger: ${hasPaywall}`);

      // Email capture?
      const hasEmailCapture = await page.$('input[type="email"]');
      log(pid, hasEmailCapture ? 'PASS' : 'HIGH', 'Lead', `Email capture on surf.html: ${!!hasEmailCapture}`, hasEmailCapture ? '' : 'High-intent page with no lead capture');
    }

    if (pageConfig.id === 'pesca') {
      const bodyText = await page.evaluate(() => document.body.innerHTML);
      const hasGYG = bodyText.includes('gyg.me');
      log(pid, hasGYG ? 'PASS' : 'HIGH', 'Monetization', `GetYourGuide affiliate present: ${hasGYG}`);
      const hasPaywall = bodyText.includes('Pro') && (bodyText.includes('Desbloquear') || bodyText.includes('Alerta'));
      log(pid, hasPaywall ? 'PASS' : 'MED', 'Monetization', `Contextual Pro paywall/upsell present: ${hasPaywall}`);
    }

    if (pageConfig.id === 'webcams') {
      // Any sponsor slot?
      const bodyText = await page.evaluate(() => document.body.innerHTML);
      const hasSponsor = bodyText.toLowerCase().includes('patrocin') || bodyText.toLowerCase().includes('sponsor');
      log(pid, hasSponsor ? 'PASS' : 'MED', 'Monetization', `Sponsor slot on webcams: ${hasSponsor}`, hasSponsor ? '' : 'High-frequency page with zero commercial inventory');

      // External links (to beachcam) present?
      const externalLinks = await page.$$eval('a[target="_blank"]', links => links.map(l => l.href));
      const beachcamLinks = externalLinks.filter(l => l.includes('beachcam'));
      log(pid, beachcamLinks.length > 0 ? 'PASS' : 'HIGH', 'Content', `Beachcam external links: ${beachcamLinks.length}`);
    }

    if (pageConfig.id === 'media-kit') {
      // PDF download link present?
      const pdfLinks = await page.$$eval('a[download], a[href$=".pdf"]', links =>
        links.map(l => ({ text: l.textContent.trim(), href: l.href }))
      );
      log(pid, pdfLinks.length > 0 ? 'PASS' : 'HIGH', 'Monetization',
        `PDF download links: ${pdfLinks.length}`,
        pdfLinks.map(l => l.text).join(', '));

      // Rate card / pricing visible?
      const bodyText = await page.evaluate(() => document.body.innerText);
      const hasRateCard = bodyText.includes('€') && (bodyText.includes('/mês') || bodyText.includes('mês') || bodyText.includes('package') || bodyText.includes('Pacote'));
      log(pid, hasRateCard ? 'PASS' : 'HIGH', 'Monetization', `Rate card / pricing on media-kit: ${hasRateCard}`, hasRateCard ? '' : 'Advertiser page has no price list');

      // Rate card section present with 4 rows?
      const ratecardRows = await page.$$('.ratecard-row');
      log(pid, ratecardRows.length >= 4 ? 'PASS' : 'HIGH', 'Monetization', `Rate card rows: ${ratecardRows.length}`, ratecardRows.length < 4 ? 'Expected 4 pricing rows' : '');

      // Prices visible (€149, €199, €249, €349)?
      const prices = ['149', '199', '249', '349'].filter(p => bodyText.includes('€' + p));
      log(pid, prices.length === 4 ? 'PASS' : 'HIGH', 'Monetization', `Rate card prices visible: ${prices.map(p => '€' + p).join(', ')}`, prices.length < 4 ? 'Some prices missing' : '');

      // Rate card CTA present?
      const ratecardCta = await page.$('.ratecard-cta a');
      log(pid, ratecardCta ? 'PASS' : 'HIGH', 'CRO', `Rate card CTA present: ${!!ratecardCta}`, !ratecardCta ? 'Missing CTA in rate card section' : '');

      // Contact email present?
      const hasEmail = bodyText.toLowerCase().includes('@') || bodyText.toLowerCase().includes('contacto');
      log(pid, hasEmail ? 'PASS' : 'HIGH', 'CRO', `Advertiser contact visible on page: ${hasEmail}`);
    }

    if (pageConfig.id === 'login') {
      const form = await page.$('form');
      log(pid, form ? 'PASS' : 'CRIT', 'Form', `Login form present: ${!!form}`);
      const tabRegister = await page.$('[data-tab="register"], #tab-register, button[onclick*="register"]');
      log(pid, tabRegister ? 'PASS' : 'MED', 'Form', `Register tab accessible: ${!!tabRegister}`);

      // #register hash auto-switch
      await page.goto(`${BASE}/login.html#register`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(600);
      const activeTab = await page.evaluate(() => {
        const active = document.querySelector('.tab-btn.active, .tab.active, [aria-selected="true"]');
        return active ? active.textContent.trim() : null;
      });
      log(pid, activeTab && activeTab.toLowerCase().includes('regist') ? 'PASS' : 'MED',
        'Feature', `#register hash auto-selects register tab: "${activeTab}"`);
    }

    if (pageConfig.id === 'beaches') {
      await page.waitForTimeout(2000);
      const cards = await page.$$('.beach-card, [class*="beach-card"], article');
      log(pid, cards.length > 0 ? 'PASS' : 'HIGH', 'Data', `Beach cards loaded: ${cards.length}`, cards.length === 0 ? 'Supabase dependency — check in browser with network' : '');

      // Booking.com affiliate anywhere?
      const bodyText = await page.evaluate(() => document.body.innerHTML);
      const hasBooking = bodyText.includes('booking.com');
      log(pid, hasBooking ? 'PASS' : 'HIGH', 'Monetization', `Booking.com affiliate present: ${hasBooking}`, hasBooking ? '' : 'High-traffic browse page — zero affiliate monetization');
    }

    // Console errors
    if (consoleErrors.length > 0) {
      const significant = consoleErrors.filter(e => !e.includes('favicon') && !e.includes('supabase') && !e.includes('ERR_NAME_NOT_RESOLVED'));
      if (significant.length > 0) {
        log(pid, 'MED', 'JS', `${significant.length} console error(s)`, significant[0]);
      }
    }

  } catch (err) {
    log(pageConfig.id, 'CRIT', 'Audit', `Audit threw: ${err.message}`);
  } finally {
    await page.close();
  }
}

async function run() {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(' PORTUGAL TRAVEL HUB — CRO / QA BROWSER AUDIT');
  console.log('═══════════════════════════════════════════════════════════\n');

  const browser = await chromium.launch({ headless: true });

  for (const pg of PAGES) {
    console.log(`\n── ${pg.label.toUpperCase()} ─────────────────────────────`);

    const deskCtx = await browser.newContext();
    await auditPage(deskCtx, pg, DESKTOP, 'desktop');
    await deskCtx.close();

    // Mobile only for high-stakes pages
    if (['index','precos','parceiros','planear','login'].includes(pg.id)) {
      const mobCtx = await browser.newContext({ ...MOBILE });
      await auditPage(mobCtx, pg, MOBILE, 'mobile');
      await mobCtx.close();
    }
  }

  await browser.close();

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('\n\n═══════════════════════════════════════════════════════════');
  console.log(' AUDIT SUMMARY');
  console.log('═══════════════════════════════════════════════════════════\n');

  const bySev = { CRIT: [], HIGH: [], MED: [], LOW: [], PASS: [] };
  for (const f of findings) {
    if (f.severity !== 'PASS') (bySev[f.severity] || []).push(f);
  }

  const passes = findings.filter(f => f.severity === 'PASS').length;
  const total  = findings.length;
  console.log(`Total checks: ${total} | Passes: ${passes} | Issues: ${total - passes}\n`);

  for (const sev of ['CRIT','HIGH','MED','LOW']) {
    const items = bySev[sev];
    if (!items.length) continue;
    const icons = { CRIT: '🔴', HIGH: '🟠', MED: '🟡', LOW: '🔵' };
    console.log(`${icons[sev]} ${sev} (${items.length}):`);
    for (const f of items) {
      console.log(`   [${f.page}] [${f.category}] ${f.issue}${f.evidence ? ' — ' + f.evidence : ''}`);
    }
    console.log('');
  }

  // Priority backlog
  console.log('── PRIORITIZED BACKLOG ──────────────────────────────────────\n');
  const backlog = [...bySev.CRIT, ...bySev.HIGH, ...bySev.MED].slice(0, 15);
  backlog.forEach((f, i) => {
    console.log(`${i+1}. [${f.severity}] ${f.page} — ${f.issue}`);
  });
}

run().catch(console.error);
