/**
 * Cookie Consent – Google Consent Mode v2
 * Portugal Travel Hub
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'cookie_consent';
  var BANNER_ID   = 'cookie-consent-banner';

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
    el.setAttribute('aria-label', 'Preferências de cookies');
    el.setAttribute('aria-modal', 'false');

    el.innerHTML =
      '<div class="ccb-inner">' +
        '<div class="ccb-main">' +
          '<span class="ccb-icon" aria-hidden="true">' + COOKIE_SVG + '</span>' +
          '<p class="ccb-text">' +
            'Usamos cookies para analisar o tráfego do site. ' +
            '<a href="/cookies.html" class="ccb-link">Saber mais</a>' +
          '</p>' +
          '<div class="ccb-actions">' +
            '<button class="ccb-btn ccb-btn--accept" id="ccb-accept">Aceitar</button>' +
            '<button class="ccb-btn ccb-btn--reject"  id="ccb-reject">Rejeitar</button>' +
            '<button class="ccb-btn ccb-btn--customize" id="ccb-customize" aria-expanded="false" aria-controls="ccb-panel">Personalizar</button>' +
          '</div>' +
        '</div>' +
        '<div class="ccb-panel" id="ccb-panel" aria-hidden="true">' +
          '<div class="ccb-panel-inner">' +
            '<div class="ccb-toggle-row">' +
              '<div class="ccb-toggle-info">' +
                '<span class="ccb-toggle-name">Cookies essenciais</span>' +
                '<span class="ccb-toggle-desc">Necessários para o funcionamento do site.</span>' +
              '</div>' +
              '<label class="ccb-toggle ccb-toggle--disabled" aria-label="Cookies essenciais — sempre activos">' +
                '<input type="checkbox" checked disabled>' +
                '<span class="ccb-slider"></span>' +
                '<span class="ccb-toggle-label">Sempre activos</span>' +
              '</label>' +
            '</div>' +
            '<div class="ccb-toggle-row">' +
              '<div class="ccb-toggle-info">' +
                '<span class="ccb-toggle-name">Cookies de analytics</span>' +
                '<span class="ccb-toggle-desc">Google Analytics 4 — ajuda-nos a melhorar o site.</span>' +
              '</div>' +
              '<label class="ccb-toggle" aria-label="Cookies de analytics">' +
                '<input type="checkbox" id="ccb-analytics-toggle">' +
                '<span class="ccb-slider"></span>' +
              '</label>' +
            '</div>' +
            '<div class="ccb-panel-actions">' +
              '<button class="ccb-btn ccb-btn--accept" id="ccb-save">Guardar preferências</button>' +
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
    btn.textContent = 'Fechar';
  }

  function closePanel(btn) {
    var panel = document.getElementById('ccb-panel');
    if (!panel) return;
    panel.classList.remove('ccb-panel--open');
    panel.setAttribute('aria-hidden', 'true');
    btn.setAttribute('aria-expanded', 'false');
    btn.textContent = 'Personalizar';
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
  function showBanner() {
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
