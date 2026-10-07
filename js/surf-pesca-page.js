/** js/surf-pesca-page.js — Shared renderer for surf.html + pesca.html (+ EN variants).
 * Requires: window.BeachRenderer (beach-renderer.js), window.SurfPescaData (surf-pesca-data.js).
 * Exposes: window.SurfPescaPage
 * TrustedHTML: uses trustedTypes.createPolicy('pth-html') — regression watchlist commit 6163e21
 * 2026-10-07: cartao de surf v2 (.sc2, css/surf-card-v2.css) com fotos verificadas; cartao de pesca inalterado.
 */
(function (window, document) {
  'use strict';

  // ── Dependency guard ──────────────────────────────────────────────────────────
  if (!window.BeachRenderer || !window.SurfPescaData) {
    console.error('[surf-pesca-page] missing dependency: BeachRenderer or SurfPescaData');
    return;
  }

  // ── TrustedHTML helper — same policy name as nav.js / en/surf.html (commit 6163e21) ──
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

  // ── Utility helpers ───────────────────────────────────────────────────────────
  function esc(s) {
    if (s == null) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function dots(q) {
    return Array.from({ length: 5 }, function (_, i) {
      return '<span class="spot-quality-dot' + (i < q ? ' filled' : '') + '"></span>';
    }).join('');
  }

  // ── Lang resolver ─────────────────────────────────────────────────────────────
  function pickLang(field, lang) {
    if (field == null) return '';
    if (typeof field === 'string') return field;
    if (typeof field === 'object' && (field.pt !== undefined || field.en !== undefined)) {
      return field[lang] || field.pt || field.en || '';
    }
    return String(field);
  }

  // ── Level label resolvers ─────────────────────────────────────────────────────
  function surfLevelLabel(spot, T) {
    if (spot.levelLabelKey && T.surf.levelLabelComposite && T.surf.levelLabelComposite[spot.levelLabelKey]) {
      return T.surf.levelLabelComposite[spot.levelLabelKey];
    }
    return (T.surf.levelLabel && T.surf.levelLabel[spot.levelKey]) || spot.levelKey || '';
  }

  function fishingLevelLabel(spot, T) {
    return (T.fishing.levelLabel && T.fishing.levelLabel[spot.levelKey]) || spot.levelKey || '';
  }

  function fishingTipoLabel(spot, T) {
    return (T.fishing.tipoLabel && T.fishing.tipoLabel[spot.tipoKey]) || spot.tipoKey || '';
  }

  // ── Surf card v2 (2026-10-07) ─────────────────────────────────────────────────
  // Fotos verificadas (Wikimedia Commons): /images/spots/surf-<id>-{480,800}.webp. Lista com links: docs/FOTOS-CREDITOS.md
  var SURF_PHOTO = {
    'supertubos': "Vitor Oliveira · CC BY-SA 2.0",
    'praia-da-nazare': "Luis Ascenso · CC BY 2.0",
    'praia-do-amado': "Vitor Oliveira · CC BY-SA 2.0",
    'costa-da-caparica': "Alvesgaspar · CC BY-SA 3.0",
    'praia-do-guincho': "Alvesgaspar · CC BY-SA 3.0",
    'praia-de-matosinhos': "Vitor Oliveira · CC BY-SA 2.0",
    'praia-da-arrifana-algarve': "Pedro Ponce Asensio · CC BY-SA 4.0",
    'praia-de-santa-barbara-acores-1': "Kritzolina · CC BY-SA 4.0",
    'praia-de-moledo': "Joseolgon · CC BY-SA 4.0",
    'praia-de-afife': "Joseolgon · CC BY 4.0",
    'praia-de-cabedelo': "Ycomet · CC BY-SA 3.0",
    'praia-de-ancora': "Vitor Oliveira · CC BY-SA 2.0",
    'praia-de-esposende-surf': "Vitor Oliveira · CC BY-SA 2.0",
    'praia-de-ofir': "Francisco Restivo · CC BY 2.0",
    'praia-do-furadouro': "Pacopac · CC BY-SA 4.0",
    'praia-de-mira': "Vitor Oliveira · CC BY-SA 2.0",
    'praia-da-tocha': "Vitor Oliveira · CC BY-SA 2.0",
    'praia-de-buarcos': "Vitor Oliveira · CC BY-SA 2.0",
    'praia-do-castelejo': "manjerix · CC BY-SA 2.0",
    'praia-da-zavial': "Marty B · CC BY-SA 2.0",
    'praia-da-salema': "Joseolgon · CC BY-SA 4.0",
    'praia-de-odeceixe': "Beeston · CC BY 3.0",
    'ribeira-grande-reef': "Ajay Suresh · CC BY 2.0"
  };
  // Pagina estatica da praia (praias/<slug>/ e en/praias/<slug>/), quando existe
  var SURF_BEACH = {
    'supertubos': 'supertubos-peniche', 'praia-da-nazare': 'praia-do-norte-nazare', 'praia-do-amado': 'praia-do-amado',
    'costa-da-caparica': 'costa-de-caparica', 'praia-do-guincho': 'praia-do-guincho', 'praia-de-matosinhos': 'praia-de-matosinhos',
    'praia-da-arrifana-algarve': 'praia-da-arrifana', 'praia-de-moledo': 'praia-de-moledo', 'praia-de-esposende-surf': 'praia-de-esposende',
    'praia-de-mira': 'praia-de-mira', 'praia-do-castelejo': 'praia-do-castelejo', 'praia-de-odeceixe': 'praia-de-odeceixe'
  };
  // Regiao do planeador (js/planner-v3.js) e regiao da BD de praias (/beaches?region=)
  var SURF_PLAN_R = { Norte: 'minho', Porto: 'minho', Centro: 'costa-prata', Lisboa: 'cascais', Alentejo: 'alentejo', Algarve: 'algarve', 'Açores': 'acores' };
  var SURF_PLAN_R_ID = { 'supertubos': 'oeste', 'costa-da-caparica': 'setubal' };
  var SURF_DB_REGION = { Norte: 'Norte', Porto: 'Norte', Centro: 'Centro', Lisboa: 'Lisboa e Setúbal', Alentejo: 'Alentejo', Algarve: 'Algarve' };
  var SURF_LEVELS = ['iniciante', 'intermedio', 'avancado', 'profissional'];
  var SURF_REGION_EN = { Norte: 'North', Centro: 'Centre', Lisboa: 'Lisbon', 'Açores': 'Azores' };
  var SC2 = {
    pt: { photo: 'Foto', level: 'Nível', season: 'Melhor época', swell: 'Swell ideal', wind: 'Vento ideal', beach: 'Ver praia',
          zone: 'Praias da zona', plan: 'Planear', worldClass: 'Classe mundial',
          short: { iniciante: 'Iniciante', intermedio: 'Intermédio', avancado: 'Avançado', profissional: 'Pro' },
          ariaLevel: function (t) { return 'Nível recomendado: ' + t; }, ariaBeach: function (n) { return 'Ver a página da praia ' + n; },
          ariaZone: function (r) { return 'Ver praias da região ' + r; }, ariaPlan: function (n) { return 'Planear uma viagem de surf a ' + n; } },
    en: { photo: 'Photo', level: 'Level', season: 'Best season', swell: 'Best swell', wind: 'Best wind', beach: 'View beach',
          zone: 'Beaches nearby', plan: 'Plan trip', worldClass: 'World-class',
          short: { iniciante: 'Beginner', intermedio: 'Intermediate', avancado: 'Advanced', profissional: 'Pro' },
          ariaLevel: function (t) { return 'Recommended level: ' + t; }, ariaBeach: function (n) { return 'View the beach page for ' + n; },
          ariaZone: function (r) { return 'See beaches in ' + r; }, ariaPlan: function (n) { return 'Plan a surf trip to ' + n; } }
  };
  var SC2_ICON = {
    pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>',
    wave: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 14c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/><path d="M2 19c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/></svg>',
    arrow: '<svg class="sc2__arr" viewBox="0 0 24 24" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
    cal: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>'
  };

  function surfPhotoHtml(s, lang, L) {
    var c = SURF_PHOTO[s.id];
    if (!c) return '<div class="sc2__fallback ' + esc(s.bgClass) + '">' + SC2_ICON.wave + '</div>';
    var base = '/images/spots/surf-' + encodeURIComponent(s.id);
    return '<img src="' + base + '-480.webp" srcset="' + base + '-480.webp 480w, ' + base + '-800.webp 800w" sizes="(max-width: 640px) 94vw, (max-width: 1100px) 46vw, 380px" width="480" height="320" alt="' + esc(s.name || s.id) + '" loading="lazy" decoding="async" onerror="this.remove()">' +
      '<figcaption class="sc2__credit">' + esc(L.photo + ': ' + c) + '</figcaption>';
  }

  function surfCardHtml(s, T, lang) {
    var L = SC2[lang] || SC2.pt;
    var name = s.name || s.id;
    var levelLabel = surfLevelLabel(s, T);
    var levels = s.levels || [s.levelKey];
    var meter = SURF_LEVELS.map(function (k) {
      var on = levels.indexOf(k) !== -1;
      return '<li class="sc2__lv sc2__lv--' + k + (on ? ' is-on' : '') + '"' + (on ? '' : ' aria-hidden="true"') + '>' + esc(L.short[k]) + '</li>';
    }).join('');
    var pre = lang === 'en' ? '/en/' : '/';
    var slug = SURF_BEACH[s.id];
    var planR = SURF_PLAN_R_ID[s.id] || SURF_PLAN_R[s.region] || '';
    var planHref = pre + 'planear?' + (planR ? 'r=' + planR + '&' : '') + 'i=surf&ref=surf';
    var dbRegion = SURF_DB_REGION[s.region];
    var primary = slug
      ? '<a class="sc2__btn sc2__btn--primary" href="' + pre + 'praias/' + slug + '/" aria-label="' + esc(L.ariaBeach(name)) + '">' + esc(L.beach) + SC2_ICON.arrow + '</a>'
      : dbRegion
        ? '<a class="sc2__btn sc2__btn--primary" href="' + pre + 'beaches?region=' + encodeURIComponent(dbRegion) + '" aria-label="' + esc(L.ariaZone(s.region)) + '">' + esc(L.zone) + SC2_ICON.arrow + '</a>'
        : '';
    var plan = '<a class="sc2__btn' + (primary ? '' : ' sc2__btn--primary') + '" href="' + planHref + '" aria-label="' + esc(L.ariaPlan(name)) + '">' + SC2_ICON.cal + esc(L.plan) + '</a>';
    return (
      '<article class="spot-card sc2' + (primary ? '' : ' sc2--one') + '" role="listitem" data-spot-id="' + esc(s.id) + '">' +
        '<figure class="sc2__media">' + surfPhotoHtml(s, lang, L) +
          '<span class="sc2__chip sc2__chip--region">' + esc(lang === 'en' ? (SURF_REGION_EN[s.region] || s.region) : s.region) + '</span>' +
          (s.quality >= 5 ? '<span class="sc2__chip sc2__chip--wc">' + esc(L.worldClass) + '</span>' : '') +
          '<span class="sc2__type">' + SC2_ICON.wave + esc(pickLang(s.type, lang)) + '</span>' +
        '</figure>' +
        '<div class="sc2__body">' +
          '<div class="sc2__head"><h2 class="sc2__name">' + esc(name) + '</h2>' +
          '<p class="sc2__loc">' + SC2_ICON.pin + esc(pickLang(s.location, lang)) + '</p></div>' +
          '<div class="sc2__level"><span class="sc2__k">' + esc(L.level) + '</span>' +
            '<ul class="sc2__meter" aria-label="' + esc(L.ariaLevel(levelLabel)) + '">' + meter + '</ul></div>' +
          '<p class="sc2__hook">' + esc(pickLang(s.desc, lang)) + '</p>' +
          '<dl class="sc2__specs">' +
            '<div><dt>' + esc(L.season) + '</dt><dd>' + esc(pickLang(s.season, lang)) + '</dd></div>' +
            '<div><dt>' + esc(L.swell) + '</dt><dd>' + esc(pickLang(s.best_swell, lang)) + '</dd></div>' +
            '<div><dt>' + esc(L.wind) + '</dt><dd>' + esc(pickLang(s.best_wind, lang)) + '</dd></div>' +
          '</dl>' +
          '<div class="sc2__actions">' + primary + plan + '</div>' +
        '</div>' +
      '</article>'
    );
  }

  // ── Fishing card template ─────────────────────────────────────────────────────
  // ── Fotos dos spots de pesca (Wikimedia Commons, verificadas 2026-10-07) ──────────
  // Ficheiros: /images/spots/pesca-<id>-{480,800}.webp. Sem entrada -> fica o fundo de cor (bgClass).
  var FISH_PHOTO = {
    'sagres-ponta': "The Cosmonaut · CC BY-SA 2.5 ca",
    'ria-formosa': "Vitor Oliveira · CC BY-SA 2.0",
    'costa-de-sines': "Vitor Oliveira · CC BY-SA 2.0",
    'sesimbra-mar-alto': "Pedro Ribeiro Simões · CC BY 2.0",
    'ria-de-aveiro': "Inês Severiano · CC BY-SA 4.0",
    'viana-rio-lima': "Krzysztof Golik · CC BY-SA 4.0",
    'portimao-barco': "Vitor Oliveira · CC BY-SA 2.0",
    'acores-sao-miguel': "Ravi Sarma · CC BY 2.0",
    'rio-lima-ponte-de-lima': "Joseolgon · CC BY-SA 4.0",
    'albufeira-canicada': "Joseolgon · CC BY-SA 4.0",
    'rio-douro-peso-regua': "Joseolgon · CC BY-SA 4.0",
    'praia-esposende-costa': "Joseolgon · CC BY-SA 4.0",
    'foz-mondego': "Vitor Oliveira · CC BY-SA 2.0",
    'albufeira-castelo-de-bode': "Vitor Oliveira · CC BY-SA 2.0",
    'albufeira-maranhao': "Vitor Oliveira · CC BY 2.0",
    'costa-sines-rocha': "Tiago J. G. Fernandes · CC BY 2.0",
    'porto-covo': "Paulrocha · CC BY-SA 4.0",
    'costa-vicentina-odeceixe': "Vitor Oliveira · CC BY-SA 2.0",
    'ria-de-alvor': "Joseolgon · CC0",
    'praia-da-rocha-portimao': "CesareBonaparte · CC BY-SA 4.0",
    'lagoa-dos-salgados': "Kolforn · CC BY-SA 4.0",
    'ilha-da-culatra': "Tristanm70 · CC BY-SA 4.0",
    'baia-de-setubal': "DavidFerreira20048 · CC BY-SA 4.0",
    'ribeira-grande-acores-mar': "Anton Zelenov · CC BY-SA 4.0",
    'madeira-canical': "Asurnipal · CC BY-SA 4.0"
  };
  function fishPhotoHtml(s, lang) {
    var c = FISH_PHOTO[s.id]; if (!c) return '';
    var base = '/images/spots/pesca-' + encodeURIComponent(s.id);
    return '<img class="spot-photo" src="' + base + '-480.webp" srcset="' + base + '-480.webp 480w, ' + base + '-800.webp 800w" sizes="(max-width: 640px) 92vw, 380px" width="480" height="320" alt="' + esc(s.name || s.id) + '" loading="lazy" decoding="async" onerror="this.remove()">' +
      '<span class="spot-photo-credit">' + esc((lang === 'en' ? 'Photo: ' : 'Foto: ') + c) + '</span>';
  }

  function fishingCardHtml(s, T, lang) {
    var levelLabel = fishingLevelLabel(s, T);
    var tipoLabel  = fishingTipoLabel(s, T);
    var desc       = pickLang(s.desc, lang);
    var season     = pickLang(s.season, lang);
    var especies   = pickLang(s.especies, lang);
    var tecnica    = pickLang(s.tecnica, lang);
    var location   = pickLang(s.location, lang);
    var tagsArr    = (s.tags && s.tags[lang]) ? s.tags[lang] : (s.tags && s.tags.pt) ? s.tags.pt : [];
    var loginHref  = (lang === 'en' ? '/en/' : '/') + 'login.html#register';
    return (
      '<article class="spot-card' + (FISH_PHOTO[s.id] ? ' spot-card--photo' : '') + '" role="listitem">' +
        '<div class="spot-visual">' +
          '<div class="spot-visual-bg ' + esc(s.bgClass) + '">' + fishPhotoHtml(s, lang) +
            '<svg class="spot-visual-wave" viewBox="0 0 400 120" preserveAspectRatio="xMidYMax slice" aria-hidden="true">' +
              '<path d="M0,80 C80,40 160,100 240,70 C320,40 370,90 400,70 L400,120 L0,120 Z" fill="rgba(255,255,255,0.05)"/>' +
              '<path d="M0,96 C60,68 140,106 240,86 C320,66 365,102 400,86 L400,120 L0,120 Z" fill="rgba(255,255,255,0.04)"/>' +
            '</svg>' +
          '</div>' +
          '<div class="spot-visual-content">' +
            '<span class="spot-region-badge">' + esc(s.region) + '</span>' +
            '<div class="spot-quality" aria-label="' + s.quality + ' / 5">' + dots(s.quality) + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="spot-body">' +
          '<h2 class="spot-name">' + esc(s.name || s.id) + '</h2>' +
          '<div class="spot-location"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>' + esc(location) + '</div>' +
          '<div class="spot-meta">' +
            '<span class="spot-meta-tag spot-level--' + esc(s.levelKey) + '">' + esc(levelLabel) + '</span>' +
            '<span class="spot-meta-tag spot-tipo-label">' + esc(tipoLabel) + '</span>' +
          '</div>' +
          '<div class="spot-detail"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>' + esc(tecnica) + '</div>' +
          '<div class="spot-season">' + esc(T.fishing.seasonLabel) + ': <strong>' + esc(season) + '</strong></div>' +
          '<p class="spot-desc">' + esc(desc) + '</p>' +
          '<div class="spot-tags">' + tagsArr.map(function (t) { return '<span class="spot-tag">' + esc(t) + '</span>'; }).join('') + '</div>' +
        '</div>' +
        '<div class="spot-footer">' +
          '<div class="spot-especies">' + esc(T.fishing.especiesLabel) + ': <strong>' + esc(especies) + '</strong></div>' +
          '<a href="' + loginHref + '" class="spot-link">' + esc(T.fishing.saveCta) + '<svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg></a>' +
        '</div>' +
      '</article>'
    );
  }

  // ── Surf spot renderer ────────────────────────────────────────────────────────
  function renderSurfSpots(spots, opts) {
    opts = opts || {};
    var T    = window.BeachRenderer.getT();
    var lang = window.BeachRenderer.detectLang();
    var grid  = document.getElementById('spots-grid');
    var count = document.getElementById('spot-count');
    var n = spots.length;
    if (count) _setHTML(count, T.surf.spotCount(n));
    if (!grid) return;
    if (!n) {
      _setHTML(grid,
        '<div class="spots-empty" role="status">' +
          '<div class="spots-empty-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 14c0 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2"/><path d="M2 18c0 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2"/><line x1="12" y1="2" x2="12" y2="8"/></svg></div>' +
          '<p class="spots-empty-title">' + esc(T.surf.emptyTitle) + '</p>' +
          '<p class="spots-empty-sub">' + esc(T.surf.emptySub) + '</p>' +
          '<button class="btn-reset" id="btn-reset-filters">' + esc(T.surf.emptyCta) + '</button>' +
        '</div>'
      );
      var btn = document.getElementById('btn-reset-filters');
      if (btn && typeof opts.onReset === 'function') btn.addEventListener('click', opts.onReset);
      return;
    }
    _setHTML(grid, spots.map(function (s) { return surfCardHtml(s, T, lang); }).join(''));
  }

  // ── Fishing spot renderer ─────────────────────────────────────────────────────
  function renderFishSpots(spots, opts) {
    opts = opts || {};
    var T    = window.BeachRenderer.getT();
    var lang = window.BeachRenderer.detectLang();
    var grid  = document.getElementById('spots-grid');
    var count = document.getElementById('spot-count');
    var n = spots.length;
    if (count) _setHTML(count, T.fishing.spotCount(n));
    if (!grid) return;
    if (!n) {
      _setHTML(grid,
        '<div class="spots-empty" role="status">' +
          '<div class="spots-empty-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 14c0 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2"/><path d="M2 18c0 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2"/><line x1="12" y1="2" x2="12" y2="8"/></svg></div>' +
          '<p class="spots-empty-title">' + esc(T.fishing.emptyTitle) + '</p>' +
          '<p class="spots-empty-sub">' + esc(T.fishing.emptySub) + '</p>' +
          '<button class="btn-reset" id="btn-reset-filters">' + esc(T.fishing.emptyCta) + '</button>' +
        '</div>'
      );
      var btn = document.getElementById('btn-reset-filters');
      if (btn && typeof opts.onReset === 'function') btn.addEventListener('click', opts.onReset);
      return;
    }
    _setHTML(grid, spots.map(function (s) { return fishingCardHtml(s, T, lang); }).join(''));
  }

  // ── FAQ renderer ─────────────────────────────────────────────────────────────
  function renderFaqs(kind) {
    var T    = window.BeachRenderer.getT();
    var list = document.getElementById('faq-list');
    if (!list) return;
    var faqs = (T[kind] && T[kind].faqs) ? T[kind].faqs : [];
    _setHTML(list, faqs.map(function (f, i) {
      var isFirst = (kind === 'surf' && i === 0);
      return (
        '<div class="faq-item' + (isFirst ? ' open' : '') + '" id="faq-' + i + '">' +
          '<button class="faq-header" data-faq-idx="' + i + '" aria-expanded="' + (isFirst ? 'true' : 'false') + '" aria-controls="faq-body-' + i + '">' +
            '<span class="faq-question">' + esc(f.q) + '</span>' +
            '<svg class="faq-chevron" viewBox="0 0 24 24" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>' +
          '</button>' +
          '<div class="faq-body" id="faq-body-' + i + '" role="region"><p class="faq-answer">' + esc(f.a) + '</p></div>' +
        '</div>'
      );
    }).join(''));
    list.querySelectorAll('.faq-header').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var item = btn.closest('.faq-item');
        var open = item.classList.contains('open');
        item.classList.toggle('open', !open);
        btn.setAttribute('aria-expanded', String(!open));
      });
    });
  }

  // ── Meta tag updater ──────────────────────────────────────────────────────────
  function updateMetaTags(kind) {
    var T = window.BeachRenderer.getT();
    var m = T[kind];
    if (!m) return;
    if (m.metaTitle) document.title = m.metaTitle;
    var md = document.querySelector('meta[name="description"]');
    if (md && m.metaDescription) md.setAttribute('content', m.metaDescription);
  }

  // ── Surf filter state + handlers ──────────────────────────────────────────────
  function initSurfFilters() {
    var data = window.SurfPescaData.SURF_SPOTS;
    var activeRegion = '';
    var activeLevel  = '';

    function apply() {
      var filtered = data.filter(function (s) {
        var r = !activeRegion || s.region === activeRegion;
        var l = !activeLevel  || (s.levels || [s.levelKey]).indexOf(activeLevel) !== -1;
        return r && l;
      });
      renderSurfSpots(filtered, { onReset: clear });
    }

    function clear() {
      activeRegion = '';
      activeLevel  = '';
      document.querySelectorAll('#region-chips .chip').forEach(function (c) {
        c.classList.toggle('active', c.dataset.region === '');
      });
      document.querySelectorAll('#level-tabs .level-tab').forEach(function (t) {
        t.classList.toggle('active', t.dataset.level === '');
      });
      renderSurfSpots(data, { onReset: clear });
    }

    document.querySelectorAll('#region-chips .chip').forEach(function (c) {
      c.addEventListener('click', function () {
        activeRegion = c.dataset.region || '';
        document.querySelectorAll('#region-chips .chip').forEach(function (x) {
          x.classList.toggle('active', x === c);
        });
        apply();
      });
    });

    document.querySelectorAll('#level-tabs .level-tab').forEach(function (t) {
      t.addEventListener('click', function () {
        activeLevel = t.dataset.level || '';
        document.querySelectorAll('#level-tabs .level-tab').forEach(function (x) {
          x.classList.toggle('active', x === t);
        });
        apply();
      });
    });

    // URL pre-filters (?region=Centro&level=avancado)
    var p  = new URLSearchParams(window.location.search);
    var pr = p.get('region');
    var pl = p.get('level');
    if (pr) {
      activeRegion = pr;
      var chip = document.querySelector('#region-chips .chip[data-region="' + CSS.escape(pr) + '"]');
      if (chip) { chip.classList.add('active'); apply(); }
      else { apply(); }
    } else if (pl) {
      activeLevel = pl;
      var tab = document.querySelector('#level-tabs .level-tab[data-level="' + CSS.escape(pl) + '"]');
      if (tab) { tab.classList.add('active'); apply(); }
      else { apply(); }
    } else {
      apply();
    }
  }

  // ── Fishing filter state + handlers ───────────────────────────────────────────
  function initFishingFilters() {
    var data = window.SurfPescaData.FISH_SPOTS;
    var activeRegion = '';
    var activeTipo   = '';

    function apply() {
      var filtered = data.filter(function (s) {
        var r = !activeRegion || s.region === activeRegion;
        var t = !activeTipo   || (s.tipos || [s.tipoKey]).indexOf(activeTipo) !== -1;
        return r && t;
      });
      renderFishSpots(filtered, { onReset: clear });
    }

    function clear() {
      activeRegion = '';
      activeTipo   = '';
      document.querySelectorAll('#region-chips .chip').forEach(function (c) {
        c.classList.toggle('active', c.dataset.region === '');
      });
      document.querySelectorAll('#tipo-tabs .tipo-tab').forEach(function (t) {
        t.classList.toggle('active', t.dataset.tipo === '');
      });
      renderFishSpots(data, { onReset: clear });
    }

    document.querySelectorAll('#region-chips .chip').forEach(function (c) {
      c.addEventListener('click', function () {
        activeRegion = c.dataset.region || '';
        document.querySelectorAll('#region-chips .chip').forEach(function (x) {
          x.classList.toggle('active', x === c);
        });
        apply();
      });
    });

    document.querySelectorAll('#tipo-tabs .tipo-tab').forEach(function (t) {
      t.addEventListener('click', function () {
        activeTipo = t.dataset.tipo || '';
        document.querySelectorAll('#tipo-tabs .tipo-tab').forEach(function (x) {
          x.classList.toggle('active', x === t);
        });
        apply();
      });
    });

    // URL pre-filters (?region=Algarve&tipo=rocha)
    var p  = new URLSearchParams(window.location.search);
    var pr = p.get('region');
    var pt = p.get('tipo');
    if (pr) {
      activeRegion = pr;
      var chip = document.querySelector('#region-chips .chip[data-region="' + CSS.escape(pr) + '"]');
      if (chip) { chip.classList.add('active'); apply(); }
      else { apply(); }
    } else if (pt) {
      activeTipo = pt;
      var tab = document.querySelector('#tipo-tabs .tipo-tab[data-tipo="' + CSS.escape(pt) + '"]');
      if (tab) { tab.classList.add('active'); apply(); }
      else { apply(); }
    } else {
      apply();
    }
  }

  // ── renderAll — single entry point per page ───────────────────────────────────
  function renderAll(kind) {
    updateMetaTags(kind);
    renderFaqs(kind);
    if (kind === 'surf')    initSurfFilters();
    if (kind === 'fishing') initFishingFilters();
    var revealEls = document.querySelectorAll('.reveal-sec');
    if ('IntersectionObserver' in window) {
      var obs = new IntersectionObserver(function(entries) {
        entries.forEach(function(e) {
          if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
        });
      }, { threshold: 0.07 });
      revealEls.forEach(function(el) { obs.observe(el); });
    } else {
      revealEls.forEach(function(el) { el.classList.add('visible'); });
    }
  }

  // ── Public API ────────────────────────────────────────────────────────────────
  window.SurfPescaPage = {
    renderAll:        renderAll,
    renderSurfSpots:  renderSurfSpots,
    renderFishSpots:  renderFishSpots,
    renderFaqs:       renderFaqs,
    updateMetaTags:   updateMetaTags,
  };

})(window, document);
