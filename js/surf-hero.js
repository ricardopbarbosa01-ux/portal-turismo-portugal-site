/* Hero de /surf "Surf hoje" + linha "agora" nos cartoes — Portal Turismo Portugal — 2026-10-07
 * Usa o mesmo componente visual do hero de /beaches (css/beaches-hero-v4.css, classes .bh4*) + css/surf-hero.css.
 * Dados: SurfPescaData (spots + SURF_GEO) e SurfLive (Open-Meteo, estimativa automatica). So DOM seguro (createElement/textContent).
 * - Mapa: pontos dos spots continentais coloridos pela avaliacao de agora (bom/razoavel/fraco); Acores num cartao.
 * - "O meu nivel": 3 melhores spots agora para o nivel escolhido (lembra a escolha em localStorage, se houver).
 * - Cartoes (.sc2): preenche .sc2__now depois de cada render (evento pth:surf-render de js/surf-pesca-page.js).
 */
(function (window, document) {
  'use strict';
  if (!window.SurfPescaData || !window.SurfLive) return;
  var D = window.SurfPescaData, SL = window.SurfLive, SPOTS = D.SURF_SPOTS, G = D.SURF_GEO || {};
  var EN = (document.documentElement.lang || '').toLowerCase().indexOf('en') === 0, lang = EN ? 'en' : 'pt';
  var T = EN ? { upd: 'Live · updated ', spots: 'surf spots', now: 'now', isl: 'surf spots', waves: 'waves', none: 'No live data right now — try again in a few minutes.', loading: 'Reading the sea…' }
             : { upd: 'Ao vivo · atualizado às ', spots: 'spots de surf', now: 'agora', isl: 'spots de surf', waves: 'ondas', none: 'Sem dados ao vivo neste momento — tenta daqui a uns minutos.', loading: 'A ler o mar…' };
  var ORDER = { good: 0, fair: 1, poor: 2, small: 3, big: 3 };
  var LVCOL = { good: 'calm', fair: 'moderate', poor: 'rough', big: 'rough', small: 'na' };
  // Posicao no mapa (viewBox 1250x2560 de /images/map/portugal-relevo-*): as mesmas da praia em js/beaches-hero-v4.js quando existe; resto ajustado a costa.
  var XY = {"supertubos":[100,1392],"praia-da-nazare":[191,1248],"praia-do-amado":[240,2414],"costa-da-caparica":[132,1717],"praia-do-guincho":[42,1660],"praia-de-matosinhos":[334,514],"praia-de-moledo":[275,197],"praia-de-cabedelo":[284,266],"praia-de-ancora":[276,216],"praia-de-esposende-surf":[305,346],"praia-de-ofir":[300,334],"praia-do-furadouro":[341,657],"praia-de-mira":[291,853],"praia-da-tocha":[275,911],"praia-de-buarcos":[264,993],"praia-da-arrifana-algarve":[263,2354],"praia-do-castelejo":[239,2428],"praia-da-zavial":[257,2458],"praia-de-odeceixe":[282,2278],"praia-de-afife":[276,227],"praia-da-salema":[274,2449],"tonel":[232,2487],"beliche":[230,2480],"mareta":[231,2488],"martinhal":[239,2480],"bordeira":[252,2397],"monte-clerigo":[270,2329],"amoreira":[273,2325],"praia-da-rocha":[388,2438],"ponta-ruiva":[229,2459],"sao-torpes":[288,2055],"porto-covo":[292,2087],"malhao":[289,2122],"vila-nova-de-milfontes-farol":[292,2150],"almograve":[289,2183],"zambujeira-do-mar":[294,2244],"carvalhal":[298,1873],"burrinho":[291,2067],"espinho":[349,592],"leca-da-palmeira":[327,508],"povoa-de-varzim":[304,412],"azurara":[311,433],"praia-da-barra":[308,764],"cabedelo-figueira-da-foz":[266,1002],"sao-pedro-de-moel":[204,1185],"praia-da-vieira":[227,1129],"pedrogao":[234,1106],"murtinheira":[256,971],"santa-cruz":[77,1477],"areia-branca":[92,1419],"sao-juliao":[62,1576],"matadouro":[61,1555],"praia-do-sul-ericeira":[63,1563],"reef-ericeira":[61,1552],"cave-ericeira":[59,1545],"praia-do-norte-ericeira":[62,1560],"crazy-left-ericeira":[60,1545],"magoito":[51,1608],"adraga":[38,1637],"cresmina":[41,1673],"parede":[84,1691],"santo-amaro-oeiras":[97,1691],"azarujinha":[73,1686],"sao-joao-da-caparica":[123,1707],"praia-do-meco":[148,1786],"lagoa-de-albufeira":[149,1777],"comporta":[289,1838],"praia-da-foz-cabo-espichel":[143,1802],"canal-das-barcas":[290,2143],"nazare-praia-da-vila":[189,1259],"paredes-da-vitoria":[199,1212],"foz-do-arelho":[132,1338],"praia-azul":[71,1492],"santa-rita":[84,1463],"porto-batel":[85,1392],"almagreira":[101,1364],"apulia":[300,362],"angeiras":[320,471],"barra-do-douro":[342,530],"canidelo":[343,543],"miramar-gaia":[346,563],"cortegaca":[345,624],"torreira":[324,709],"sao-jacinto":[312,752],"vagueira":[302,805],"cova-gala":[268,1010],"ingrina":[257,2470],"praia-da-luz":[318,2451],"alvor":[365,2434],"praia-de-faro":[587,2489]};
  var FIT = { C: 0.7705132427757891, X0: -7.318870276532866, Y0: -42.15420001833158, sx: 478.0891913909998, sy: 474.0765097728385, ox: 33, oy: 48.5 };
  function project(id) { if (XY[id]) return XY[id]; var g = G[id]; return g ? [(g[1] * FIT.C - FIT.X0) * FIT.sx + FIT.ox, (-g[0] - FIT.Y0) * FIT.sy + FIT.oy] : null; }
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function track(n, x) { try { if (typeof window.track === 'function') window.track(n, x || {}); } catch (e) {} }
  function byId(id) { for (var i = 0; i < SPOTS.length; i++) if (SPOTS[i].id === id) return SPOTS[i]; return null; }
  function regionLabel(s) { var m = { Norte: 'North', Centro: 'Centre', Lisboa: 'Lisbon', 'Açores': 'Azores' }; return EN ? (m[s.region] || s.region) : s.region; }
  function goTo(id) {
    var card = document.getElementById('spot-' + id);
    if (!card) { // filtros ativos escondem o spot -> repor e tentar outra vez
      var all = document.querySelector('#region-chips .chip[data-region=""]'), lv = document.querySelector('#level-tabs .level-tab[data-level=""]');
      if (all) all.click(); if (lv) lv.click(); card = document.getElementById('spot-' + id);
    }
    if (!card) return;
    if (card.style.display === 'none') card.style.display = '';
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    card.classList.remove('is-flash'); void card.offsetWidth; card.classList.add('is-flash');
  }

  var live = null;
  function rated(lvl) {
    var out = [];
    SPOTS.forEach(function (s) { var c = live && live[s.id]; if (!c) return; var r = SL.rate(s, c, lvl); if (r) out.push({ s: s, c: c, r: r }); });
    return out;
  }

  /* ── Cartoes ─────────────────────────────────────────────────────────── */
  function fillCards() {
    if (!live) return;
    document.querySelectorAll('.sc2[data-spot-id]').forEach(function (card) {
      var id = card.getAttribute('data-spot-id'), s = byId(id), c = live[id], box = card.querySelector('.sc2__now');
      if (!s || !c || !box) return;
      var r = SL.rate(s, c); if (!r) return;
      box.textContent = ''; box.setAttribute('data-k', r.k);
      box.appendChild(el('i')); box.appendChild(el('b', null, SL.label(r.k, lang) + ' ' + T.now));
      box.appendChild(el('span', null, ' · ' + SL.line(c, r, lang)));
      box.hidden = false;
    });
  }
  document.addEventListener('pth:surf-render', fillCards);

  /* ── Hero ────────────────────────────────────────────────────────────── */
  var root = document.querySelector('.sh');
  var NS = 'http://www.w3.org/2000/svg', pts = [], cur = null;
  function mk(tag, attrs, parent) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
  function $(k) { return root.querySelector('[data-sh="' + k + '"]'); }
  function set(k, v) { var e = $(k); if (e) e.textContent = v; }

  function drawMap() {
    var svg = root.querySelector('.bh4__svg'), g = $('dots'); if (!svg || !g) return;
    var defs = mk('defs', {}, svg), fl = mk('filter', { id: 'sh-glow', x: '-200%', y: '-200%', width: '500%', height: '500%' }, defs);
    mk('feGaussianBlur', { stdDeviation: '10' }, fl);
    var glow = mk('g', {}, g), core = mk('g', {}, g);
    // Spots muito juntos (Ericeira, Peniche): desenhar por qualidade crescente para os de classe mundial ficarem por cima (2026-10-08)
    SPOTS.slice().sort(function (a, b) { return (a.quality || 0) - (b.quality || 0); }).forEach(function (s, i) {
      var g0 = G[s.id]; if (!g0 || g0[1] < -12) return; // ilhas: cartao proprio
      var xy = project(s.id); if (!xy) return;
      var p = { s: s, x: xy[0], y: xy[1] };
      p.glow = mk('circle', { cx: xy[0], cy: xy[1], r: 30, class: 'bh4__glow', filter: 'url(#sh-glow)' }, glow);
      var a = mk('a', { href: '#spot-' + s.id, class: 'bh4__dot', 'aria-label': s.name }, core);
      a.style.setProperty('--i', String(i));
      mk('circle', { cx: xy[0], cy: xy[1], r: 16, class: 'bh4__core' }, a);
      a.addEventListener('mouseenter', function () { show(p); });
      a.addEventListener('focus', function () { show(p); });
      a.addEventListener('mouseleave', function () { if (cur === p) hide(); });
      a.addEventListener('click', function (e) { e.preventDefault(); track('surf_map_dot', { spot: s.id }); goTo(s.id); });
      p.a = a; pts.push(p);
    });
  }
  function show(p) {
    var tip = root.querySelector('.bh4__tip'), svg = root.querySelector('.bh4__svg'); if (!tip || !svg) return;
    cur = p; tip.textContent = '';
    tip.appendChild(el('strong', null, p.s.name));
    var c = live && live[p.s.id], r = c && SL.rate(p.s, c);
    tip.appendChild(el('span', null, regionLabel(p.s) + (r ? ' · ' + SL.label(r.k, lang) + ' · ' + SL.line(c, r, lang) : '')));
    var R = svg.getBoundingClientRect(), F = tip.parentNode.getBoundingClientRect();
    tip.style.left = (R.left - F.left + p.x * R.width / 1250) + 'px'; tip.style.top = (R.top - F.top + p.y * R.height / 2560) + 'px';
    tip.classList.add('is-on');
  }
  function hide() { cur = null; var tip = root.querySelector('.bh4__tip'); if (tip) tip.classList.remove('is-on'); }

  function colourMap() {
    var n = { good: 0, fair: 0, poor: 0 };
    pts.forEach(function (p) {
      var c = live[p.s.id], r = c && SL.rate(p.s, c); if (!r) return;
      p.a.setAttribute('data-level', LVCOL[r.k]);
      if (LVCOL[r.k] !== 'na') p.glow.style.fill = r.k === 'good' ? 'var(--calm)' : r.k === 'fair' ? 'var(--mod)' : 'var(--rough)';
    });
    rated().forEach(function (x) { if (x.r.k === 'good') n.good++; else if (x.r.k === 'fair') n.fair++; else n.poor++; });
    set('n-good', String(n.good)); set('n-fair', String(n.fair)); set('n-poor', String(n.poor));
  }
  function mapCards() {
    var all = rated();
    var best = all.slice().sort(function (a, b) { return ORDER[a.r.k] - ORDER[b.r.k] || b.r.s - a.r.s; })[0];
    var big = all.filter(function (x) { return G[x.s.id][1] > -12; }).sort(function (a, b) { return b.c.h - a.c.h; })[0];
    function fill(kind, x, eye) {
      var c = root.querySelector('[data-card="' + kind + '"]'); if (!c || !x) return;
      set(kind + '-name', x.s.name); set(kind + '-meta', (kind === 'waves' ? '' : SL.label(x.r.k, lang) + ' · ') + SL.line(x.c, x.r, lang));
      c.href = '#spot-' + x.s.id; c.hidden = false;
      c.addEventListener('click', function (e) { e.preventDefault(); track('surf_map_card', { card: kind, spot: x.s.id }); goTo(x.s.id); });
    }
    fill('calm', best); if (big && big !== best) fill('waves', big);
    var isl = all.filter(function (x) { return G[x.s.id][1] < -12; });
    if (isl.length) {
      var h = isl.reduce(function (m, x) { return Math.max(m, x.c.h); }, 0);
      set('islands', isl.length + ' ' + T.isl + ' · ' + T.waves + ' ' + h.toFixed(1).replace('.', EN ? '.' : ',') + ' m');
      var ic = root.querySelector('[data-card="islands"]'); if (ic) ic.hidden = false;
    }
  }

  var LKEY = 'pth_surf_level', level = 'iniciante';
  try { level = localStorage.getItem(LKEY) || level; } catch (e) {}
  function picks() {
    var ol = $('picks'); if (!ol) return;
    ol.textContent = '';
    if (!live) { ol.appendChild(el('li', 'sh__empty', T.none)); return; }
    var list = rated(level).filter(function (x) { return (x.s.levels || [x.s.levelKey]).indexOf(level) !== -1; })
      .sort(function (a, b) { return ORDER[a.r.k] - ORDER[b.r.k] || b.r.s - a.r.s; }).slice(0, 3);
    if (!list.length) { ol.appendChild(el('li', 'sh__empty', T.none)); return; }
    list.forEach(function (x, i) {
      var li = el('li'), a = el('a', 'sh__pick'); a.href = '#spot-' + x.s.id; a.setAttribute('data-k', x.r.k);
      a.appendChild(el('span', 'sh__rank', String(i + 1)));
      var t = el('span', 'sh__pt'); t.appendChild(el('b', null, x.s.name)); t.appendChild(el('small', null, regionLabel(x.s) + ' · ' + SL.line(x.c, x.r, lang))); a.appendChild(t);
      a.appendChild(el('span', 'sh__badge', SL.label(x.r.k, lang)));
      a.addEventListener('click', function (e) { e.preventDefault(); track('surf_hero_pick', { level: level, spot: x.s.id, rank: i + 1 }); goTo(x.s.id); });
      li.appendChild(a); ol.appendChild(li);
    });
  }
  function initLevels() {
    root.querySelectorAll('[data-lv]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-lv') === level));
      b.addEventListener('click', function () {
        level = b.getAttribute('data-lv');
        try { localStorage.setItem(LKEY, level); } catch (e) {}
        root.querySelectorAll('[data-lv]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        track('surf_hero_level', { level: level }); picks();
      });
    });
  }

  // Atalhos fora do hero: chips de spots (data-spot-jump) e "spots para o nivel X" (data-surf-level)
  document.addEventListener('click', function (e) {
    var j = e.target.closest && e.target.closest('[data-spot-jump]');
    if (j) { e.preventDefault(); track('surf_path_spot', { spot: j.getAttribute('data-spot-jump') }); goTo(j.getAttribute('data-spot-jump')); return; }
    var l = e.target.closest && e.target.closest('[data-surf-level]');
    if (l) {
      var tab = document.querySelector('#level-tabs .level-tab[data-level="' + l.getAttribute('data-surf-level') + '"]');
      var all = document.querySelector('#region-chips .chip[data-region=""]');
      if (tab) { e.preventDefault(); if (all) all.click(); tab.click(); track('surf_path_level', { level: l.getAttribute('data-surf-level') });
        var f = document.getElementById('spot-filters'); if (f) f.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    }
  });
  if (root) { drawMap(); initLevels(); }
  SL.get(SPOTS).then(function (d) {
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
