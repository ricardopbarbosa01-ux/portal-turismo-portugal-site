/**
 * Cookie Consent – Google Consent Mode v2
 * Portugal Travel Hub
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'cookie_consent';
  var BANNER_ID   = 'cookie-consent-banner';

  // Lote B 09/10/2026: textos PT/EN (antes so PT, tambem nas /en/) + estilos proprios nas paginas sem style.css (ex.: /planear)
  var EN = (document.documentElement.lang || '').toLowerCase().indexOf('en') === 0;
  var T = EN ? {
    aria: 'Cookie preferences', text: 'We use cookies to analyse site traffic.', more: 'Learn more', href: '/en/cookies',
    accept: 'Accept', reject: 'Reject', customize: 'Customise', close: 'Close',
    essName: 'Essential cookies', essDesc: 'Needed for the site to work.', essAria: 'Essential cookies — always on', always: 'Always on',
    anaName: 'Analytics cookies', anaDesc: 'Google Analytics 4 — helps us improve the site.', anaAria: 'Analytics cookies', save: 'Save preferences'
  } : {
    aria: 'Preferências de cookies', text: 'Usamos cookies para analisar o tráfego do site.', more: 'Saber mais', href: '/cookies',
    accept: 'Aceitar', reject: 'Rejeitar', customize: 'Personalizar', close: 'Fechar',
    essName: 'Cookies essenciais', essDesc: 'Necessários para o funcionamento do site.', essAria: 'Cookies essenciais — sempre ativos', always: 'Sempre ativos',
    anaName: 'Cookies de analytics', anaDesc: 'Google Analytics 4 — ajuda-nos a melhorar o site.', anaAria: 'Cookies de analytics', save: 'Guardar preferências'
  };
  function hasSiteCss() {
    var l = document.querySelectorAll('link[rel="stylesheet"]');
    for (var i = 0; i < l.length; i++) { if (/\/css\/(style|cookie-consent)\.css/.test(l[i].getAttribute('href') || '')) return true; }
    return false;
  }
  function ensureCss(done) {
    if (hasSiteCss()) { done(); return; }
    var link = document.createElement('link'); link.rel = 'stylesheet'; link.href = '/css/cookie-consent.css?v=20261009b';
    var fired = false; function go() { if (!fired) { fired = true; done(); } }
    link.onload = go; link.onerror = go; setTimeout(go, 1500);
    document.head.appendChild(link);
  }

  // SVG cookie icon — inline, no external dependency, no emoji
  var COOKIE_SVG =
    '<svg class="ccb-icon-svg" width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" focusable="false" ' +
      'fill="none" stroke="#1B3A6B" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M21 12a9 9 0 1 1-9-9c.49 0 .97.04 1.44.1"/>' +
      '<path d="M15.5 3.5c0 1.1.9 2 2 2s2-.9 2-2-.9-2-2-2-2 .9-2 2z" fill="#1B3A6B" stroke="none"/>' +
      '<circle cx="9"  cy="9"  r="1" fill="#1B3A6B" stroke="none"/>' +
      '<circle cx="9"  cy="15" r="1" fill="#1B3A6B" stroke="none"/>' +
      '<circle cx="14" cy="14" r="1" fill="#1B3A6B" stroke="none"/>' +
    '</svg>';

  // ── Consent Mode v2 helpers ───────────────────────────────────
  function updateConsent(analyticsGranted) {
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        analytics_storage: analyticsGranted ? 'granted' : 'denied'
      });
    }
  }

  // ── Storage ───────────────────────────────────────────────────
  function getPrefs() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch (_) { return null; }
  }

  function savePrefs(analytics) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ analytics: analytics, ts: Date.now() }));
    } catch (_) {}
  }

  // ── Apply saved prefs on page load (no banner) ────────────────
  function applyPrefs(prefs) {
    if (prefs && prefs.analytics === true) updateConsent(true);
    // 'denied' is already the Consent Mode v2 default set before GA4 loads
  }

  // ── Banner markup ─────────────────────────────────────────────
  function buildBanner() {
    var el = document.createElement('div');
    el.id = BANNER_ID;
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', T.aria);
    el.setAttribute('aria-modal', 'false');

    el.innerHTML =
      '<div class="ccb-inner">' +
        '<div class="ccb-main">' +
          '<span class="ccb-icon" aria-hidden="true">' + COOKIE_SVG + '</span>' +
          '<p class="ccb-text">' +
            T.text + ' ' +
            '<a href="' + T.href + '" class="ccb-link">' + T.more + '</a>' +
          '</p>' +
          '<div class="ccb-actions">' +
            '<button class="ccb-btn ccb-btn--accept" id="ccb-accept">' + T.accept + '</button>' +
            '<button class="ccb-btn ccb-btn--reject"  id="ccb-reject">' + T.reject + '</button>' +
            '<button class="ccb-btn ccb-btn--customize" id="ccb-customize" aria-expanded="false" aria-controls="ccb-panel">' + T.customize + '</button>' +
          '</div>' +
        '</div>' +
        '<div class="ccb-panel" id="ccb-panel" aria-hidden="true">' +
          '<div class="ccb-panel-inner">' +
            '<div class="ccb-toggle-row">' +
              '<div class="ccb-toggle-info">' +
                '<span class="ccb-toggle-name">' + T.essName + '</span>' +
                '<span class="ccb-toggle-desc">' + T.essDesc + '</span>' +
              '</div>' +
              '<label class="ccb-toggle ccb-toggle--disabled" aria-label="' + T.essAria + '">' +
                '<input type="checkbox" checked disabled>' +
                '<span class="ccb-slider"></span>' +
                '<span class="ccb-toggle-label">' + T.always + '</span>' +
              '</label>' +
            '</div>' +
            '<div class="ccb-toggle-row">' +
              '<div class="ccb-toggle-info">' +
                '<span class="ccb-toggle-name">' + T.anaName + '</span>' +
                '<span class="ccb-toggle-desc">' + T.anaDesc + '</span>' +
              '</div>' +
              '<label class="ccb-toggle" aria-label="' + T.anaAria + '">' +
                '<input type="checkbox" id="ccb-analytics-toggle">' +
                '<span class="ccb-slider"></span>' +
              '</label>' +
            '</div>' +
            '<div class="ccb-panel-actions">' +
              '<button class="ccb-btn ccb-btn--accept" id="ccb-save">' + T.save + '</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';

    return el;
  }

  // ── Panel expand / collapse ───────────────────────────────────
  function openPanel(btn) {
    var panel = document.getElementById('ccb-panel');
    if (!panel) return;
    panel.classList.add('ccb-panel--open');
    panel.setAttribute('aria-hidden', 'false');
    btn.setAttribute('aria-expanded', 'true');
    btn.textContent = T.close;
  }

  function closePanel(btn) {
    var panel = document.getElementById('ccb-panel');
    if (!panel) return;
    panel.classList.remove('ccb-panel--open');
    panel.setAttribute('aria-hidden', 'true');
    btn.setAttribute('aria-expanded', 'false');
    btn.textContent = T.customize;
  }

  // ── Banner dismiss with slide-down animation ──────────────────
  function dismissBanner() {
    var b = document.getElementById(BANNER_ID);
    if (!b) return;
    b.classList.add('ccb--dismissing');
    // duration matches CSS (0.3s) — remove after animation
    var delay = prefersReducedMotion() ? 0 : 320;
    setTimeout(function () {
      if (b && b.parentNode) b.parentNode.removeChild(b);
    }, delay);
  }

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  // ── Wire events ───────────────────────────────────────────────
  function showBanner() { ensureCss(showBannerNow); }
  function showBannerNow() {
    if (document.getElementById(BANNER_ID)) return;
    var banner = buildBanner();
    document.body.appendChild(banner);

    document.getElementById('ccb-accept').addEventListener('click', function () {
      savePrefs(true);
      updateConsent(true);
      dismissBanner();
    });

    document.getElementById('ccb-reject').addEventListener('click', function () {
      savePrefs(false);
      updateConsent(false);
      dismissBanner();
    });

    document.getElementById('ccb-customize').addEventListener('click', function () {
      var panel = document.getElementById('ccb-panel');
      if (panel && panel.classList.contains('ccb-panel--open')) {
        closePanel(this);
      } else {
        openPanel(this);
      }
    });

    document.getElementById('ccb-save').addEventListener('click', function () {
      var analyticsOn = document.getElementById('ccb-analytics-toggle').checked;
      savePrefs(analyticsOn);
      updateConsent(analyticsOn);
      dismissBanner();
    });
  }

  // ── Init ──────────────────────────────────────────────────────
  function init() {
    var prefs = getPrefs();
    if (prefs !== null) {
      applyPrefs(prefs);
      return;
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', showBanner);
    } else {
      showBanner();
    }
  }

  init();
}());
