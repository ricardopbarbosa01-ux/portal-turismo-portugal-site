/** js/webcams-guias-page.js — Shared renderer for webcams.html + guias.html (+ EN variants).
 * Requires: window.BeachRenderer (beach-renderer.js), window.WebcamsGuiasData (webcams-guias-data.js).
 * Exposes: window.WebcamsGuiasPage = { initWebcams, initGuias }
 * TrustedHTML: uses trustedTypes.createPolicy('pth-html') — regression watchlist commit 6163e21
 */
(function (window, document) {
  'use strict';

  // ── Dependency guard ──────────────────────────────────────────────────────────
  if (!window.BeachRenderer || !window.WebcamsGuiasData) {
    console.error('[webcams-guias-page] missing dependency: BeachRenderer or WebcamsGuiasData');
    return;
  }

  // ── TrustedHTML helper ────────────────────────────────────────────────────────
  var _policy = null;
  try {
    if (window.trustedTypes && window.trustedTypes.createPolicy) {
      _policy = window.trustedTypes.createPolicy('pth-html', { createHTML: function (s) { return s; } });
    }
  } catch (_) {}

  function _setHTML(el, html) {
    if (!el) return;
    el.innerHTML = _policy ? _policy.createHTML(html) : html;
  }

  // ── XSS helper ────────────────────────────────────────────────────────────────
  function esc(s) {
    if (s == null) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ── Pick locale field ({pt,en} or plain string) ───────────────────────────────
  function pick(field, lang) {
    if (field == null) return '';
    if (typeof field === 'string') return field;
    if (typeof field === 'object' && (field.pt !== undefined || field.en !== undefined)) {
      return field[lang] || field.pt || field.en || '';
    }
    return String(field);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // WEBCAMS
  // ─────────────────────────────────────────────────────────────────────────────

  var WEBCAMS = window.WebcamsGuiasData.WEBCAMS;

  // ── Conditions cache ──────────────────────────────────────────────────────────
  var conditionsCache = {};

  function conditionsHtml(name, T) {
    var d = conditionsCache[name];
    if (d === undefined) return '<div class="wcam-cond-skeleton" aria-hidden="true"></div>';
    if (d === null) return '<span class="wcam-cond-unavail">' + esc(T.webcams.condUnavail) + '</span>';
    var waveAlert = d.wave_height !== null && d.wave_height > 2 ? ' wcam-cond-alert' : '';
    return '<div class="wcam-cond-row">' +
      '<span class="wcam-cond-item' + waveAlert + '">🌊 ' + (d.wave_height !== null ? d.wave_height.toFixed(1) + 'm' : '—') + '</span>' +
      '<span class="wcam-cond-item">💨 ' + (d.wind_speed !== null ? Math.round(d.wind_speed) + ' km/h' : '—') + '</span>' +
      '<span class="wcam-cond-item">🌡️ ' + (d.temperature !== null ? Math.round(d.temperature) + '°C' : '—') + '</span>' +
      '</div>';
  }

  function applyConditionsToDom(name, T) {
    document.querySelectorAll('[data-cond-spot="' + CSS.escape(name) + '"]').forEach(function (el) {
      _setHTML(el, conditionsHtml(name, T));
    });
  }

  async function fetchConditionsForWebcam(w, T) {
    try {
      var results = await Promise.all([
        fetch('https://marine-api.open-meteo.com/v1/marine?latitude=' + w.lat + '&longitude=' + w.lng + '&current=wave_height,wave_period&timezone=Europe/Lisbon'),
        fetch('https://api.open-meteo.com/v1/forecast?latitude=' + w.lat + '&longitude=' + w.lng + '&current=wind_speed_10m,temperature_2m&timezone=Europe/Lisbon'),
      ]);
      var marine  = await results[0].json();
      var weather = await results[1].json();
      conditionsCache[w.name] = {
        wave_height: (marine && marine.current && marine.current.wave_height  != null) ? marine.current.wave_height  : null,
        wind_speed:  (weather && weather.current && weather.current.wind_speed_10m != null) ? weather.current.wind_speed_10m : null,
        temperature: (weather && weather.current && weather.current.temperature_2m != null) ? weather.current.temperature_2m : null,
      };
    } catch (_) {
      conditionsCache[w.name] = null;
    }
    applyConditionsToDom(w.name, T);
  }

  async function fetchAllConditions(T) {
    var pending = WEBCAMS.filter(function (w) { return w.lat && w.lng && !(w.name in conditionsCache); });
    for (var i = 0; i < pending.length; i++) {
      if (i > 0) await new Promise(function (r) { setTimeout(r, 200); });
      fetchConditionsForWebcam(pending[i], T); // fire-and-forget per webcam
    }
  }

  // ── Render grid ───────────────────────────────────────────────────────────────
  function renderWebcams(list, lang, T) {
    var grid  = document.getElementById('wcam-grid');
    var count = document.getElementById('wcam-count');
    if (!grid) return;

    var n = list.length;
    if (count) _setHTML(count, T.webcams.countTemplate(n));

    if (!n) {
      _setHTML(grid, '<div class="wcam-empty" role="status">' +
        '<div class="wcam-empty-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg></div>' +
        '<p class="wcam-empty-title">' + esc(T.webcams.emptyTitle) + '</p>' +
        '<p class="wcam-empty-sub">' + esc(T.webcams.emptySub) + '</p>' +
        '<button class="btn-reset" onclick="WebcamsGuiasPage._clearFilters()">' + esc(T.webcams.emptyReset) + '</button>' +
        '</div>');
      return;
    }

    var html = list.map(function (w) {
      var isLive    = w.state === 'live';
      var stateKey  = w.state || 'soon';
      var btnClass  = 'wcam-btn wcam-btn--' + esc(stateKey);
      var stateText = T.webcams.stateLabel[stateKey] || stateKey;
      var wDesc     = esc(pick(w.desc, lang));
      var wTags     = (Array.isArray(w.tags) ? w.tags : (w.tags && w.tags[lang]) || w.tags.pt || []);
      var explorerT = w.tipo === 'surf' ? T.webcams.actionExplore.surf
                    : w.tipo === 'pesca' ? T.webcams.actionExplore.pesca
                    : T.webcams.actionExplore.default;
      var explorerHref = w.tipo === 'surf'
        ? (lang === 'en' ? '/en/surf.html' : '/surf.html')
        : w.tipo === 'pesca'
        ? (lang === 'en' ? '/en/pesca.html' : '/pesca.html')
        : (lang === 'en' ? '/en/beaches.html?region=' + encodeURIComponent(w.region) : '/beaches.html?region=' + encodeURIComponent(w.region));
      var planearHref = (lang === 'en' ? '/en/planear.html' : '/planear.html') +
        '?source=webcams&webcam_spot=' + encodeURIComponent(w.name) + '&region=' + encodeURIComponent(w.region) + '&tipo=' + encodeURIComponent(w.tipo || '');
      var actionEl = isLive
        ? '<a href="' + esc(w.url) + '" class="' + btnClass + '" target="_blank" rel="noopener noreferrer" aria-label="' + esc(T.webcams.actionLive + ' ' + w.name) + '">' +
          '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>' +
          esc(T.webcams.actionLive) + '</a>'
        : '<a href="' + esc(lang === 'en' ? '/en/beaches.html?region=' + encodeURIComponent(w.region) : '/beaches.html?region=' + encodeURIComponent(w.region)) + '" class="wcam-btn wcam-btn--region" aria-label="' + esc(T.webcams.actionBeaches + ' ' + w.region) + '">' +
          '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 14c0 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2"/><path d="M2 18c0 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2"/></svg>' +
          esc(T.webcams.actionBeaches) + '</a>';

      return '<article class="wcam-card" role="listitem" data-spot="' + esc(w.name) + '" data-region="' + esc(w.region) + '" data-tipo="' + esc(w.tipo || '') + '" data-state="' + esc(stateKey) + '">' +
        '<div class="wcam-visual">' +
          '<div class="wcam-visual-bg ' + esc(w.bgClass) + '">' +
            '<svg class="wcam-visual-wave" viewBox="0 0 400 120" preserveAspectRatio="xMidYMax slice" aria-hidden="true">' +
              '<path d="M0,80 C80,40 160,100 240,70 C320,40 370,90 400,70 L400,120 L0,120 Z" fill="rgba(255,255,255,0.05)"/>' +
              '<path d="M0,96 C60,68 140,106 240,86 C320,66 365,102 400,86 L400,120 L0,120 Z" fill="rgba(255,255,255,0.04)"/>' +
            '</svg>' +
          '</div>' +
          '<div class="wcam-visual-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg></div>' +
          '<div class="wcam-visual-meta">' +
            '<span class="wcam-region-badge">' + esc(w.region) + '</span>' +
            '<span class="wcam-status wcam-status--' + esc(stateKey) + '">' + esc(stateText) + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="wcam-body">' +
          '<h2 class="wcam-name">' + esc(w.name) + '</h2>' +
          '<div class="wcam-location">' +
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>' +
            esc(w.location) +
          '</div>' +
          '<p class="wcam-desc">' + wDesc + '</p>' +
          '<div class="wcam-tags">' + wTags.map(function (t) { return '<span class="wcam-tag">' + esc(t) + '</span>'; }).join('') + '</div>' +
        '</div>' +
        '<div class="wcam-conditions" data-cond-spot="' + esc(w.name) + '" aria-label="' + esc(lang === 'en' ? 'Weather conditions' : 'Condições meteorológicas') + '">' + conditionsHtml(w.name, T) + '</div>' +
        '<div class="wcam-footer">' + actionEl + '</div>' +
        '<div class="wcam-footer-secondary">' +
          '<a href="' + esc(explorerHref) + '" class="wcam-sec-link" aria-label="' + esc(explorerT) + '">' +
            esc(explorerT) + '<svg viewBox="0 0 24 24" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>' +
          '</a>' +
          '<a href="' + esc(planearHref) + '" class="wcam-sec-link" aria-label="' + esc(T.webcams.actionPlan) + '">' +
            esc(T.webcams.actionPlan) + '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' +
          '</a>' +
        '</div>' +
      '</article>';
    }).join('');

    _setHTML(grid, html);
  }

  // ── Filter state ──────────────────────────────────────────────────────────────
  var _lang   = 'pt';
  var _T      = null;
  var _activeRegion = '';
  var _searchQuery  = '';
  var _activeTipo   = '';

  function _applyFilters() {
    var filtered = WEBCAMS.filter(function (w) {
      var matchRegion = !_activeRegion || w.region === _activeRegion;
      var q = _searchQuery;
      var matchSearch = !q ||
        w.name.toLowerCase().includes(q) ||
        w.location.toLowerCase().includes(q) ||
        (Array.isArray(w.tags) ? w.tags : (w.tags[_lang] || w.tags.pt || [])).some(function (t) { return t.toLowerCase().includes(q); });
      var matchTipo = !_activeTipo || w.tipo === _activeTipo ||
        (_activeTipo === 'praia' && (w.tipo === 'praia' || w.tipo === 'familia'));
      return matchRegion && matchSearch && matchTipo;
    });
    renderWebcams(filtered, _lang, _T);
  }

  function _clearFilters() {
    _activeRegion = '';
    _searchQuery  = '';
    _activeTipo   = '';
    var s = document.getElementById('wcam-search');
    if (s) s.value = '';
    document.querySelectorAll('#region-chips .chip').forEach(function (c) { c.classList.toggle('active', c.dataset.region === ''); });
    document.querySelectorAll('#tipo-chips .chip').forEach(function (c) { c.classList.toggle('active', c.dataset.tipo === ''); });
    renderWebcams(WEBCAMS, _lang, _T);
  }

  function _filterByWhenUse(tipo) {
    _activeTipo = tipo;
    document.querySelectorAll('#tipo-chips .chip').forEach(function (c) { c.classList.toggle('active', c.dataset.tipo === tipo); });
    _applyFilters();
    var el = document.getElementById('webcams');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }

  // ── initWebcams ───────────────────────────────────────────────────────────────
  function initWebcams() {
    _lang = window.BeachRenderer.detectLang();
    _T    = window.BeachRenderer.getT();

    // Expose globals for inline onclick handlers in HTML shell
    window.clearFilters     = _clearFilters;
    window.filterByWhenUse  = _filterByWhenUse;

    // Read URL params before first render
    (function () {
      var p = new URLSearchParams(window.location.search);
      var r = p.get('region') || '';
      var q = p.get('q')      || '';
      var t = p.get('tipo')   || '';
      if (r) {
        _activeRegion = r;
        var chip = document.querySelector('#region-chips .chip[data-region="' + CSS.escape(r) + '"]');
        if (chip) {
          document.querySelectorAll('#region-chips .chip').forEach(function (c) { c.classList.remove('active'); });
          chip.classList.add('active');
        }
      }
      if (q) {
        _searchQuery = q.toLowerCase();
        var s = document.getElementById('wcam-search');
        if (s) s.value = q;
      }
      if (t) {
        _activeTipo = t;
        var tc = document.querySelector('#tipo-chips .chip[data-tipo="' + CSS.escape(t) + '"]');
        if (tc) {
          document.querySelectorAll('#tipo-chips .chip').forEach(function (c) { c.classList.remove('active'); });
          tc.classList.add('active');
        }
      }
    })();

    // Wire chip filters
    document.querySelectorAll('#region-chips .chip').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('#region-chips .chip').forEach(function (c) { c.classList.remove('active'); });
        btn.classList.add('active');
        _activeRegion = btn.dataset.region;
        _applyFilters();
      });
    });
    document.querySelectorAll('#tipo-chips .chip').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('#tipo-chips .chip').forEach(function (c) { c.classList.remove('active'); });
        btn.classList.add('active');
        _activeTipo = btn.dataset.tipo;
        _applyFilters();
      });
    });
    var searchEl = document.getElementById('wcam-search');
    if (searchEl) {
      searchEl.addEventListener('input', function (e) {
        _searchQuery = e.target.value.trim().toLowerCase();
        _applyFilters();
      });
    }

    _applyFilters();
    fetchAllConditions(_T);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GUIAS HUB
  // ─────────────────────────────────────────────────────────────────────────────

  function renderGuias(lang, T) {
    var grid = document.getElementById('guides-grid');
    if (!grid) return;

    var cards = (window.WebcamsGuiasData.GUIA_CARDS[lang] || window.WebcamsGuiasData.GUIA_CARDS.pt);
    var html = cards.map(function (c, idx) {
      var isFeatured = !!c.featured;
      var isFullWidth = !!c.fullWidth;
      var badgeNew = c.isNew
        ? '<span class="badge-novo">' + esc(T.guias.badgeNew) + '</span>'
        : '';
      var cardClass = 'guide-card' + (isFeatured ? ' guide-card--featured' : '');
      var cardStyle = isFullWidth ? ' style="grid-column: 1 / -1; max-width: 580px; margin: 0 auto; width: 100%;"' : '';
      var loadingAttr = idx === 0 ? 'eager' : 'lazy';
      return '<a href="' + esc(c.href) + '" class="' + cardClass + '"' + cardStyle +
             ' aria-label="' + esc((lang === 'en' ? 'Guide: ' : 'Guia: ') + c.title) + '">' +
        '<div class="guide-card__img-wrap">' +
          '<img src="' + esc(c.img) + '" alt="' + esc(c.alt) + '"' +
          ' width="800" height="450" loading="' + loadingAttr + '"' +
          ' onerror="if(typeof autoFixImage===\'function\')autoFixImage(this)"' +
          ' data-fallback-keyword="' + esc(c.fallbackKeyword || '') + '">' +
        '</div>' +
        '<div class="guide-card__body">' +
          '<div class="guide-card__badges">' +
            badgeNew +
            '<span class="badge-time">' +
              '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' +
              esc(c.readTime) + ' ' + esc(T.guias.readTimeUnit) +
            '</span>' +
          '</div>' +
          '<h2 class="guide-card__title">' + esc(c.title) + '</h2>' +
          '<p class="guide-card__desc">' + esc(c.desc) + '</p>' +
          '<span class="guide-card__cta">' +
            esc(T.guias.readCta) +
            '<svg viewBox="0 0 24 24" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>' +
          '</span>' +
        '</div>' +
      '</a>';
    }).join('');

    _setHTML(grid, html);
  }

  // ── initGuias ─────────────────────────────────────────────────────────────────
  function initGuias() {
    var lang = window.BeachRenderer.detectLang();
    var T    = window.BeachRenderer.getT();
    renderGuias(lang, T);
  }

  // ── Public API ────────────────────────────────────────────────────────────────
  window.WebcamsGuiasPage = {
    initWebcams:    initWebcams,
    initGuias:      initGuias,
    _clearFilters:  _clearFilters,
    _filterByWhenUse: _filterByWhenUse,
  };

})(window, document);
