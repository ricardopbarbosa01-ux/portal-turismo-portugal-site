/** js/surf-pesca-page.js — Shared renderer for surf.html + pesca.html (+ EN variants).
 * Requires: window.BeachRenderer (beach-renderer.js), window.SurfPescaData (surf-pesca-data.js).
 * Exposes: window.SurfPescaPage
 * TrustedHTML: uses trustedTypes.createPolicy('pth-html') — regression watchlist commit 6163e21
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

  // ── Surf card template ────────────────────────────────────────────────────────
  function surfCardHtml(s, T, lang) {
    var levelLabel = surfLevelLabel(s, T);
    var desc       = pickLang(s.desc, lang);
    var type       = pickLang(s.type, lang);
    var season     = pickLang(s.season, lang);
    var swell      = pickLang(s.best_swell, lang);
    var wind       = pickLang(s.best_wind, lang);
    var location   = pickLang(s.location, lang);
    var tagsArr    = (s.tags && s.tags[lang]) ? s.tags[lang] : (s.tags && s.tags.pt) ? s.tags.pt : [];
    var regionUrl  = encodeURIComponent(s.region);
    var beachesHref = (lang === 'en' ? '/en/' : '/') + 'beaches.html?region=' + regionUrl;
    return (
      '<article class="spot-card" role="listitem">' +
        '<div class="spot-visual">' +
          '<div class="spot-visual-bg ' + esc(s.bgClass) + '">' +
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
          '<div class="spot-meta"><span class="spot-meta-tag spot-level--' + esc(s.levelKey) + '">' + esc(levelLabel) + '</span></div>' +
          '<div class="spot-type"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 14c0 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2"/></svg>' + esc(type) + '</div>' +
          '<div class="spot-season">' + esc(T.surf.seasonLabel) + ': <strong>' + esc(season) + '</strong></div>' +
          '<p class="spot-desc">' + esc(desc) + '</p>' +
          '<div class="spot-tags">' + tagsArr.map(function (t) { return '<span class="spot-tag">' + esc(t) + '</span>'; }).join('') + '</div>' +
        '</div>' +
        '<div class="spot-footer">' +
          '<div class="spot-conditions">' + esc(T.surf.swellLabel) + ': <strong>' + esc(swell) + '</strong> &nbsp;&middot;&nbsp; ' + esc(T.surf.windLabel) + ': <strong>' + esc(wind) + '</strong></div>' +
          '<a href="' + beachesHref + '" class="spot-link" aria-label="' + esc(T.surf.exploreRegionAria(s.region)) + '">' + esc(T.surf.exploreRegion) + '<svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg></a>' +
        '</div>' +
      '</article>'
    );
  }

  // ── Fishing card template ─────────────────────────────────────────────────────
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
      '<article class="spot-card" role="listitem">' +
        '<div class="spot-visual">' +
          '<div class="spot-visual-bg ' + esc(s.bgClass) + '">' +
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
