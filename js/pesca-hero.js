/* Hero de /pesca "Pesca hoje" + linha "agora" nos cartoes de pesca — Portal Turismo Portugal — 2026-10-07
 * Mesmo componente visual do hero de /beaches e /surf (.bh4 + css/surf-hero.css). Dados: SurfPescaData (FISH_SPOTS, FISH_GEO) + PescaLive.
 * - Mapa: spots continentais (costa, rias, rios e albufeiras) coloridos pela avaliacao de agora; Acores e Madeira num cartao.
 * - "Que pesca?": costa e rocha / barco / ria e rio -> 3 melhores agora. Cartao da lua (fase calculada no browser).
 * - Cartoes (.sc2--fish): preenche .sc2__now no evento pth:fish-render (js/surf-pesca-page.js). So DOM seguro.
 */
(function (window, document) {
  'use strict';
  if (!window.SurfPescaData || !window.PescaLive) return;
  var D = window.SurfPescaData, PL = window.PescaLive, SPOTS = D.FISH_SPOTS, G = D.FISH_GEO || {};
  var EN = (document.documentElement.lang || '').toLowerCase().indexOf('en') === 0, lang = EN ? 'en' : 'pt';
  var T = EN ? { upd: 'Live · updated ', now: 'now', isl: 'spots', none: 'No live data right now — try again in a few minutes.', illum: 'lit', goodPl: 'good now' }
             : { upd: 'Ao vivo · atualizado às ', now: 'agora', isl: 'spots', none: 'Sem dados ao vivo neste momento — tenta daqui a uns minutos.', illum: 'iluminada', goodPl: 'bons agora' };
  var MODES = { costa: ['costeira', 'rocha'], barco: ['embarcacao'], ria: ['ria', 'fluvial'] };
  var ORDER = { good: 0, fair: 1, poor: 2 };
  var LVCOL = { good: 'calm', fair: 'moderate', poor: 'rough' };
  var FIT = { C: 0.7705132427757891, X0: -7.318870276532866, Y0: -42.15420001833158, sx: 478.0891913909998, sy: 474.0765097728385, ox: 33, oy: 48.5 };
  function project(id) { var g = G[id]; return g ? [(g[1] * FIT.C - FIT.X0) * FIT.sx + FIT.ox, (-g[0] - FIT.Y0) * FIT.sy + FIT.oy] : null; }
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function track(n, x) { try { if (typeof window.track === 'function') window.track(n, x || {}); } catch (e) {} }
  function byId(id) { for (var i = 0; i < SPOTS.length; i++) if (SPOTS[i].id === id) return SPOTS[i]; return null; }
  function regionLabel(s) { var m = { Norte: 'North', Centro: 'Centre', Lisboa: 'Lisbon', 'Açores': 'Azores' }; return EN ? (m[s.region] || s.region) : s.region; }
  function goTo(id) {
    var card = document.getElementById('spot-' + id);
    if (!card) {
      var all = document.querySelector('#region-chips .chip[data-region=""]'), tp = document.querySelector('#tipo-tabs .tipo-tab[data-tipo=""]');
      if (all) all.click(); if (tp) tp.click(); card = document.getElementById('spot-' + id);
    }
    if (!card) return;
    if (card.style.display === 'none') card.style.display = '';
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    card.classList.remove('is-flash'); void card.offsetWidth; card.classList.add('is-flash');
  }

  var live = null;
  function rated() {
    var out = [];
    SPOTS.forEach(function (s) { var c = live && live[s.id]; if (!c) return; var r = PL.rate(s, c); if (r) out.push({ s: s, c: c, r: r }); });
    return out;
  }
  function fillCards() {
    if (!live) return;
    document.querySelectorAll('.sc2--fish[data-spot-id]').forEach(function (card) {
      var id = card.getAttribute('data-spot-id'), s = byId(id), c = live[id], box = card.querySelector('.sc2__now');
      if (!s || !c || !box) return;
      var r = PL.rate(s, c); if (!r) return;
      box.textContent = ''; box.setAttribute('data-k', r.k);
      box.appendChild(el('i')); box.appendChild(el('b', null, PL.label(r.k, lang, r) + ' ' + T.now));
      box.appendChild(el('span', null, ' · ' + PL.line(c, lang, s)));
      box.hidden = false;
    });
  }
  document.addEventListener('pth:fish-render', fillCards);

  var root = document.querySelector('.ph');
  var NS = 'http://www.w3.org/2000/svg', pts = [], cur = null;
  function mk(tag, attrs, parent) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
  function $(k) { return root.querySelector('[data-ph="' + k + '"]'); }
  function set(k, v) { var e = $(k); if (e) e.textContent = v; }

  function drawMap() {
    var svg = root.querySelector('.bh4__svg'), g = $('dots'); if (!svg || !g) return;
    var defs = mk('defs', {}, svg), fl = mk('filter', { id: 'ph-glow', x: '-200%', y: '-200%', width: '500%', height: '500%' }, defs);
    mk('feGaussianBlur', { stdDeviation: '10' }, fl);
    var glow = mk('g', {}, g), core = mk('g', {}, g);
    SPOTS.forEach(function (s, i) {
      var g0 = G[s.id]; if (!g0 || g0[1] < -12) return;
      var xy = project(s.id); if (!xy) return;
      var p = { s: s, x: xy[0], y: xy[1] };
      p.glow = mk('circle', { cx: xy[0], cy: xy[1], r: 30, class: 'bh4__glow', filter: 'url(#ph-glow)' }, glow);
      var a = mk('a', { href: '#spot-' + s.id, class: 'bh4__dot' + (s.tipoKey === 'fluvial' || s.tipoKey === 'ria' ? ' ph__dot--fresh' : ''), 'aria-label': s.name }, core);
      a.style.setProperty('--i', String(i));
      mk('circle', { cx: xy[0], cy: xy[1], r: 16, class: 'bh4__core' }, a);
      a.addEventListener('mouseenter', function () { show(p); });
      a.addEventListener('focus', function () { show(p); });
      a.addEventListener('mouseleave', function () { if (cur === p) hide(); });
      a.addEventListener('click', function (e) { e.preventDefault(); track('fish_map_dot', { spot: s.id }); goTo(s.id); });
      p.a = a; pts.push(p);
    });
  }
  function show(p) {
    var tip = root.querySelector('.bh4__tip'), svg = root.querySelector('.bh4__svg'); if (!tip || !svg) return;
    cur = p; tip.textContent = '';
    tip.appendChild(el('strong', null, p.s.name));
    var c = live && live[p.s.id], r = c && PL.rate(p.s, c);
    tip.appendChild(el('span', null, regionLabel(p.s) + (r ? ' · ' + PL.label(r.k, lang, r) + ' · ' + PL.line(c, lang, p.s) : '')));
    var R = svg.getBoundingClientRect(), F = tip.parentNode.getBoundingClientRect();
    tip.style.left = (R.left - F.left + p.x * R.width / 1250) + 'px'; tip.style.top = (R.top - F.top + p.y * R.height / 2560) + 'px';
    tip.classList.add('is-on');
  }
  function hide() { cur = null; var tip = root.querySelector('.bh4__tip'); if (tip) tip.classList.remove('is-on'); }

  function colourMap() {
    var n = { good: 0, fair: 0, poor: 0 };
    pts.forEach(function (p) {
      var c = live[p.s.id], r = c && PL.rate(p.s, c); if (!r) return;
      p.a.setAttribute('data-level', LVCOL[r.k]);
      p.glow.style.fill = r.k === 'good' ? 'var(--calm)' : r.k === 'fair' ? 'var(--mod)' : 'var(--rough)';
    });
    rated().forEach(function (x) { n[x.r.k]++; });
    set('n-good', String(n.good)); set('n-fair', String(n.fair)); set('n-poor', String(n.poor));
  }
  function mapCards() {
    var all = rated();
    var best = all.filter(function (x) { return G[x.s.id][1] > -12; }).sort(function (a, b) { return ORDER[a.r.k] - ORDER[b.r.k] || (b.s.quality - a.s.quality) || ((a.c.ws || 0) - (b.c.ws || 0)); })[0];
    if (best) {
      var c = root.querySelector('[data-card="calm"]');
      set('calm-name', best.s.name); set('calm-meta', PL.label(best.r.k, lang, best.r) + ' · ' + PL.line(best.c, lang, best.s));
      c.href = '#spot-' + best.s.id; c.hidden = false;
      c.addEventListener('click', function (e) { e.preventDefault(); track('fish_map_card', { card: 'best', spot: best.s.id }); goTo(best.s.id); });
    }
    var isl = all.filter(function (x) { return G[x.s.id][1] < -12; });
    if (isl.length) {
      var good = isl.filter(function (x) { return x.r.k === 'good'; }).length;
      set('islands', isl.length + ' ' + T.isl + ' · ' + good + ' ' + T.goodPl);
      var ic = root.querySelector('[data-card="islands"]'); if (ic) ic.hidden = false;
    }
  }
  function moonCard() {
    var m = PL.moon(new Date(), lang), c = root.querySelector('[data-card="moon"]'); if (!c) return;
    set('moon-name', m.name); set('moon-meta', m.illum + '% ' + T.illum);
    var disc = c.querySelector('.ph__moon'); if (disc) disc.style.setProperty('--x', ((m.frac < 0.5 ? 1 : -1) * 34 * (1 - m.illum / 100)).toFixed(1) + 'px');
    c.hidden = false;
  }

  var LKEY = 'pth_fish_mode', mode = 'costa';
  try { mode = localStorage.getItem(LKEY) || mode; } catch (e) {}
  if (!MODES[mode]) mode = 'costa';
  function picks() {
    var ol = $('picks'); if (!ol) return;
    ol.textContent = '';
    if (!live) { ol.appendChild(el('li', 'sh__empty', T.none)); return; }
    var want = MODES[mode];
    var list = rated().filter(function (x) { return (x.s.tipos || [x.s.tipoKey]).some(function (t) { return want.indexOf(t) !== -1; }); })
      .sort(function (a, b) { return ORDER[a.r.k] - ORDER[b.r.k] || (b.s.quality - a.s.quality) || ((a.c.ws || 0) - (b.c.ws || 0)); }).slice(0, 3);
    if (!list.length) { ol.appendChild(el('li', 'sh__empty', T.none)); return; }
    list.forEach(function (x, i) {
      var li = el('li'), a = el('a', 'sh__pick'); a.href = '#spot-' + x.s.id; a.setAttribute('data-k', x.r.k);
      a.appendChild(el('span', 'sh__rank', String(i + 1)));
      var t = el('span', 'sh__pt'); t.appendChild(el('b', null, x.s.name)); t.appendChild(el('small', null, regionLabel(x.s) + ' · ' + PL.line(x.c, lang, x.s))); a.appendChild(t);
      a.appendChild(el('span', 'sh__badge', PL.label(x.r.k, lang, x.r)));
      a.addEventListener('click', function (e) { e.preventDefault(); track('fish_hero_pick', { mode: mode, spot: x.s.id, rank: i + 1 }); goTo(x.s.id); });
      li.appendChild(a); ol.appendChild(li);
    });
  }
  function initModes() {
    root.querySelectorAll('[data-mode]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-mode') === mode));
      b.addEventListener('click', function () {
        mode = b.getAttribute('data-mode');
        try { localStorage.setItem(LKEY, mode); } catch (e) {}
        root.querySelectorAll('[data-mode]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        track('fish_hero_mode', { mode: mode }); picks();
      });
    });
  }
  // Atalhos fora do hero (chips de spots e "ver spots deste tipo")
  document.addEventListener('click', function (e) {
    var j = e.target.closest && e.target.closest('[data-spot-jump]');
    if (j) { e.preventDefault(); goTo(j.getAttribute('data-spot-jump')); return; }
    var t = e.target.closest && e.target.closest('[data-fish-tipo]');
    if (t) {
      var tab = document.querySelector('#tipo-tabs .tipo-tab[data-tipo="' + t.getAttribute('data-fish-tipo') + '"]'), all = document.querySelector('#region-chips .chip[data-region=""]');
      if (tab) { e.preventDefault(); if (all) all.click(); tab.click(); track('fish_path_tipo', { tipo: t.getAttribute('data-fish-tipo') });
        var f = document.getElementById('spot-filters'); if (f) f.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    }
  });

  if (root) { drawMap(); initModes(); moonCard(); }
  PL.get(SPOTS).then(function (d) {
    var any = false; for (var k in d) { any = true; break; }
    live = any ? d : null;
    if (root) {
      if (live) {
        var at = ''; for (var k2 in live) { at = live[k2].at; if (at) break; }
        set('time', T.upd + (at || new Date().toTimeString().slice(0, 5)));
        colourMap(); mapCards(); root.classList.add('is-live');
      }
      picks();
    }
    fillCards();
  });
})(window, document);
