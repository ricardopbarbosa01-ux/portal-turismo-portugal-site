/**
 * Cookie Consent – Google Consent Mode v2
 * Portugal Travel Hub
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'cookie_consent';
  var BANNER_ID   = 'cookie-consent-banner';

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

  // ── Apply saved prefs on page load ────────────────────────────
  function applyPrefs(prefs) {
    if (prefs && prefs.analytics === true) {
      updateConsent(true);
    }
    // denied is already the Consent Mode v2 default set before GA4 loads
  }

  // ── Banner markup ─────────────────────────────────────────────
  function buildBanner() {
    var el = document.createElement('div');
    el.id = BANNER_ID;
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', 'Preferências de cookies');
    el.innerHTML =
      '<div class="ccb-inner">' +
        '<p class="ccb-text">' +
          'Este site usa <a href="/cookies.html" class="ccb-link">cookies</a> para melhorar a sua ' +
          'experiência e analisar o tráfego. Pode aceitar todos, rejeitar os não-essenciais, ou personalizar.' +
        '</p>' +
        '<div class="ccb-actions">' +
          '<button class="ccb-btn ccb-btn--accept" id="ccb-accept">Aceitar todos</button>' +
          '<button class="ccb-btn ccb-btn--reject" id="ccb-reject">Rejeitar não-essenciais</button>' +
          '<button class="ccb-btn ccb-btn--customize" id="ccb-customize">Personalizar</button>' +
        '</div>' +
        '<div class="ccb-panel" id="ccb-panel" hidden>' +
          '<div class="ccb-toggle-row">' +
            '<div class="ccb-toggle-info">' +
              '<span class="ccb-toggle-name">Essenciais</span>' +
              '<span class="ccb-toggle-desc">Necessários para o funcionamento do site. Não podem ser desactivados.</span>' +
            '</div>' +
            '<label class="ccb-toggle ccb-toggle--disabled" aria-label="Cookies essenciais sempre activos">' +
              '<input type="checkbox" checked disabled>' +
              '<span class="ccb-slider"></span>' +
            '</label>' +
          '</div>' +
          '<div class="ccb-toggle-row">' +
            '<div class="ccb-toggle-info">' +
              '<span class="ccb-toggle-name">Analytics (GA4)</span>' +
              '<span class="ccb-toggle-desc">Permite-nos perceber como usa o site (Google Analytics 4).</span>' +
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
      '</div>';
    return el;
  }

  // ── Banner lifecycle ──────────────────────────────────────────
  function removeBanner() {
    var b = document.getElementById(BANNER_ID);
    if (b) b.parentNode.removeChild(b);
  }

  function showBanner() {
    var banner = buildBanner();
    document.body.appendChild(banner);

    document.getElementById('ccb-accept').addEventListener('click', function () {
      savePrefs(true);
      updateConsent(true);
      removeBanner();
    });

    document.getElementById('ccb-reject').addEventListener('click', function () {
      savePrefs(false);
      updateConsent(false);
      removeBanner();
    });

    document.getElementById('ccb-customize').addEventListener('click', function () {
      var panel = document.getElementById('ccb-panel');
      var opening = panel.hasAttribute('hidden');
      if (opening) {
        panel.removeAttribute('hidden');
        this.textContent = 'Fechar';
      } else {
        panel.setAttribute('hidden', '');
        this.textContent = 'Personalizar';
      }
    });

    document.getElementById('ccb-save').addEventListener('click', function () {
      var analyticsOn = document.getElementById('ccb-analytics-toggle').checked;
      savePrefs(analyticsOn);
      updateConsent(analyticsOn);
      removeBanner();
    });
  }

  // ── Init ──────────────────────────────────────────────────────
  function init() {
    var prefs = getPrefs();
    if (prefs !== null) {
      applyPrefs(prefs);
      return; // consent already given — no banner
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', showBanner);
    } else {
      showBanner();
    }
  }

  init();
}());
