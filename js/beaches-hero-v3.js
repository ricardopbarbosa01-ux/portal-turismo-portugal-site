/* Hero de /beaches v3 — "Mapa do mar, agora" — Portal Turismo Portugal — 2026-10-07
 * As 111 praias (lat/lng da BD) desenham a costa portuguesa num SVG; cada ponto ganha a cor do mar agora
 * (calmo / moderado / agitado, Open-Meteo via LiveCoast). Continente + Madeira/Porto Santo em destaque.
 * Recebe a lista que a pagina ja carrega (evento 'pth:beaches' ou window.__pthBeaches) — sem pedido extra.
 * So DOM seguro (createElementNS/textContent). Sem dados -> mapa fica dourado e o resto do hero funciona.
 */
(function (window, document) {
  'use strict';
  var root = document.querySelector('.bh'); if (!root) return;
  var svg = root.querySelector('.bh__map svg'); if (!svg) return;
  var NS = 'http://www.w3.org/2000/svg';
  var EN = (document.documentElement.lang || '').toLowerCase().indexOf('en') === 0;
  var T = EN ? { calm: 'calm', moderate: 'moderate', rough: 'rough', waves: 'waves', water: 'water', upd: 'Live · updated ',
                 best: 'Calmest sea right now:', beach: function (id) { return '/en/beach.html?id=' + encodeURIComponent(id); }, dec: '.' }
             : { calm: 'calmo', moderate: 'moderado', rough: 'agitado', waves: 'ondas', water: 'água', upd: 'Ao vivo · atualizado às ',
                 best: 'Mar mais calmo agora:', beach: function (id) { return '/beach.html?id=' + encodeURIComponent(id); }, dec: ',' };
  var W = 420, H = 640;
  // Continente: lat 36.9..42.2 / lng -9.75..-7.25  (escala real: 1 grau lng = cos(39.5) graus lat)
  var M = { lat0: 42.2, lat1: 36.85, lng0: -9.85, lng1: -7.15, x0: 150, y0: 24, h: 590 };
  M.k = M.h / (M.lat0 - M.lat1); M.kx = M.k * Math.cos(39.5 * Math.PI / 180);
  function pMain(b) { return [M.x0 + (b.lng - M.lng0) * M.kx, M.y0 + (M.lat0 - b.lat) * M.k]; }
  // Madeira + Porto Santo: caixa a esquerda em baixo (escala propria)
  var I = { lat0: 33.15, lng0: -17.35, x0: 22, y0: 470, k: 92 }; I.kx = I.k * Math.cos(32.8 * Math.PI / 180);
  function pIsl(b) { return [I.x0 + (b.lng - I.lng0) * I.kx, I.y0 + (I.lat0 - b.lat) * I.k]; }
  function isIsland(b) { return b.lng < -12; }

  function mk(tag, attrs, parent) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
  function f1(v) { return v.toFixed(1).replace('.', T.dec); }

  // Linha de costa suave: costa oeste (N->S) + costa sul (O->E), pontos agregados por faixas para nao fazer zig-zag
  function coastPath(pts) {
    var west = pts.filter(function (p) { return p.b.lat > 37.12; }).sort(function (a, b) { return b.b.lat - a.b.lat; });
    var south = pts.filter(function (p) { return p.b.lat <= 37.12; }).sort(function (a, b) { return a.b.lng - b.b.lng; });
    function bin(arr, key, step) {
      var out = [], cur = null;
      arr.forEach(function (p) { var k = Math.floor(p.xy[key] / step); if (!cur || cur.k !== k) { cur = { k: k, xs: [], ys: [] }; out.push(cur); } cur.xs.push(p.xy[0]); cur.ys.push(p.xy[1]); });
      return out.map(function (c) {
        var x = key === 1 ? Math.min.apply(null, c.xs) : c.xs.reduce(function (s, v) { return s + v; }, 0) / c.xs.length; // costa oeste: o ponto mais a oeste
        var y = c.ys.reduce(function (s, v) { return s + v; }, 0) / c.ys.length; return [x, y];
      });
    }
    var line = bin(west, 1, 26).concat(bin(south, 0, 24));
    if (line.length < 3) return '';
    var d = 'M' + line[0][0].toFixed(1) + ' ' + line[0][1].toFixed(1);
    for (var i = 0; i < line.length - 1; i++) { // Catmull-Rom -> Bezier
      var p0 = line[i - 1] || line[i], p1 = line[i], p2 = line[i + 1], p3 = line[i + 2] || p2;
      d += ' C' + (p1[0] + (p2[0] - p0[0]) / 6).toFixed(1) + ' ' + (p1[1] + (p2[1] - p0[1]) / 6).toFixed(1) + ' ' +
           (p2[0] - (p3[0] - p1[0]) / 6).toFixed(1) + ' ' + (p2[1] - (p3[1] - p1[1]) / 6).toFixed(1) + ' ' + p2[0].toFixed(1) + ' ' + p2[1].toFixed(1);
    }
    return d;
  }

  var tip = root.querySelector('.bh__tip'), cur = null;
  var dots = {};
  function draw(list) {
    var seen = {}, pts = [];
    list.forEach(function (b) {
      if (!isFinite(b.lat) || !isFinite(b.lng) || seen[b.name]) return; seen[b.name] = 1;
      pts.push({ b: b, xy: isIsland(b) ? pIsl(b) : pMain(b), isl: isIsland(b) });
    });
    var g = svg.querySelector('[data-bh="layer"]'); g.textContent = '';
    var main = pts.filter(function (p) { return !p.isl; });
    var d = coastPath(main);
    if (d) {
      var c = mk('path', { d: d, class: 'bh__coast', pathLength: '1' }, g);
    }
    var ins = mk('g', { 'data-bh': 'inset' }, g);
    mk('rect', { x: 10, y: 452, width: 132, height: 92, rx: 14, class: 'bh__inset' }, ins);
    var lab = mk('text', { x: 22, y: 470 - 6, class: 'bh__lbl' }, ins); lab.textContent = 'Madeira · Porto Santo';
    [['NORTE', 41.55], ['CENTRO', 40.25], ['LISBOA', 38.9], ['ALENTEJO', 37.95]].forEach(function (r) {
      var t = mk('text', { x: 310, y: pMain({ lat: r[1], lng: -8 })[1], class: 'bh__reg' }, g); t.textContent = r[0];
    });
    var t2 = mk('text', { x: 250, y: 632, class: 'bh__reg' }, g); t2.textContent = 'ALGARVE';
    var dg = mk('g', { class: 'bh__dots' }, g), di = mk('g', { class: 'bh__dots' }, ins);
    pts.forEach(function (p, i) {
      var a = mk('a', { href: T.beach(p.b.id), class: 'bh__dot', tabindex: '-1', 'aria-label': p.b.name }, p.isl ? di : dg);
      a.style.setProperty('--i', String(i % 40));
      mk('circle', { cx: p.xy[0].toFixed(1), cy: p.xy[1].toFixed(1), r: 9, class: 'bh__halo' }, a);
      mk('circle', { cx: p.xy[0].toFixed(1), cy: p.xy[1].toFixed(1), r: 3.6, class: 'bh__core' }, a);
      a.addEventListener('mouseenter', function () { showTip(p); });
      a.addEventListener('focus', function () { showTip(p); });
      a.addEventListener('mouseleave', function () { if (cur === p) hideTip(); });
      a.addEventListener('blur', function () { if (cur === p) hideTip(); });
      dots[p.b.id] = { a: a, p: p };
    });
    root.classList.add('is-drawn');
    return pts;
  }
  function showTip(p) {
    if (!tip) return; cur = p;
    var s = p.sea, box = svg.getBoundingClientRect(), vb = svg.viewBox.baseVal;
    var sc = Math.min(box.width / vb.width, box.height / vb.height);           // preserveAspectRatio meet
    var ox = (box.width - vb.width * sc) / 2, oy = (box.height - vb.height * sc) / 2;
    tip.textContent = '';
    var n = document.createElement('strong'); n.textContent = p.b.name; tip.appendChild(n);
    var m = document.createElement('span');
    m.textContent = p.b.region + (s && s.w != null ? ' · ' + T.waves + ' ' + f1(s.w) + ' m' + (s.t != null ? ' · ' + T.water + ' ' + Math.round(s.t) + ' °C' : '') : '');
    tip.appendChild(m);
    tip.style.left = (ox + (p.xy[0] - vb.x) * sc) + 'px'; tip.style.top = (oy + (p.xy[1] - vb.y) * sc) + 'px';
    tip.classList.add('is-on');
  }
  function hideTip() { cur = null; if (tip) tip.classList.remove('is-on'); }

  function colour(pts, all) {
    window.LiveCoast.sea(all).then(function (sea) {
      var n = { calm: 0, moderate: 0, rough: 0 }, best = null, at = '';
      pts.forEach(function (p) {
        var s = sea[p.b.id]; if (!s || s.w == null) return;
        p.sea = s; var lv = window.LiveCoast.level(s.w); n[lv]++; at = at || s.at;
        dots[p.b.id].a.setAttribute('data-level', lv);
        if (lv === 'calm' && (!best || (s.t || 0) > (best.sea.t || 0))) best = p;
      });
      // Contagem sobre as 111 praias da BD (igual ao hero da pagina inicial); o mapa mostra 1 ponto por nome
      n = { calm: 0, moderate: 0, rough: 0 };
      all.forEach(function (b) { var s = sea[b.id]; if (s && s.w != null) n[window.LiveCoast.level(s.w)]++; });
      if (!(n.calm + n.moderate + n.rough)) return;
      root.classList.add('is-live');
      var set = function (k, v) { var e = root.querySelector('[data-bh="' + k + '"]'); if (e) e.textContent = v; };
      set('calm', String(n.calm)); set('moderate', String(n.moderate)); set('rough', String(n.rough));
      set('time', T.upd + (at || new Date().toTimeString().slice(0, 5)));
      var bl = root.querySelector('[data-bh="best"]');
      if (bl && best) {
        bl.textContent = '';
        bl.appendChild(document.createTextNode(T.best + ' '));
        var a = document.createElement('a'); a.href = T.beach(best.b.id); a.textContent = best.b.name; bl.appendChild(a);
        bl.appendChild(document.createTextNode(' · ' + f1(best.sea.w) + ' m' + (best.sea.t != null ? ' · ' + Math.round(best.sea.t) + ' °C' : '')));
        bl.hidden = false;
      }
    });
  }

  function fitView() { svg.setAttribute('viewBox', window.matchMedia('(max-width:900px)').matches ? '150 12 255 625' : '0 0 420 640'); }
  fitView(); window.addEventListener('resize', fitView);

  var started = false;
  function start(list) {
    if (started || !list || !list.length || !window.LiveCoast) return; started = true;
    var norm = window.LiveCoast.setBeaches(list);
    norm.then(function (l) { var pts = draw(l); colour(pts, l); });
  }
  document.addEventListener('pth:beaches', function (e) { start(e.detail); });
  if (window.__pthBeaches) start(window.__pthBeaches);
  // Rede: se a pagina nao entregar dados em 6 s, vai buscar sozinho
  setTimeout(function () { if (!started && window.LiveCoast) window.LiveCoast.beaches().then(start); }, 6000);
})(window, document);
