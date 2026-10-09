/* Hero da pagina inicial v3 — cartao "Hoje na costa" — Portal Turismo Portugal — 2026-10-07
 * Usa LiveCoast (js/live-coast.js): 1 pedido Supabase (lista de praias) + 1 pedido Open-Meteo (mar nas 111 praias).
 * Escolhe: mar mais calmo agora (com a agua mais quente entre as calmas), agua mais quente, melhores ondas (continente).
 * So DOM seguro (createElement/textContent). Se algo falhar, o cartao fica escondido e o hero continua completo.
 */
(function (window, document) {
  'use strict';
  var root = document.querySelector('.lh'); if (!root || !window.LiveCoast) return;
  var EN = (document.documentElement.lang || '').toLowerCase().indexOf('en') === 0;
  var T = EN ? {
    calm: 'Calmest sea right now', warm: 'Warmest water', surf: 'Best waves for surfing', waves: 'waves', water: 'water',
    hotels: 'Hotels nearby', view: 'View beach', upd: 'updated ', kicker: function (n, c) { return n + ' beaches live · ' + c + ' with calm sea now'; },
    beach: function (id) { return '/en/beach.html?id=' + encodeURIComponent(id); }, booking: 'en-gb', dec: '.'
  } : {
    calm: 'Mar mais calmo agora', warm: 'Água mais quente', surf: 'Melhores ondas para surf', waves: 'ondas', water: 'água',
    hotels: 'Hotéis perto', view: 'Ver praia', upd: 'atualizado às ', kicker: function (n, c) { return n + ' praias ao vivo · ' + c + ' com mar calmo agora'; },
    beach: function (id) { return '/beach.html?id=' + encodeURIComponent(id); }, booking: 'pt-pt', dec: ','
  };
  function $(k) { return root.querySelector('[data-lh="' + k + '"]'); }
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function f1(v) { return v.toFixed(1).replace('.', T.dec); }
  function icon(paths) {
    var s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('aria-hidden', 'true');
    paths.forEach(function (d) { var p = document.createElementNS('http://www.w3.org/2000/svg', 'path'); p.setAttribute('d', d); s.appendChild(p); });
    return s;
  }
  function track(name, extra) { try { if (typeof window.track === 'function') window.track(name, extra || {}); } catch (e) {} }

  var card = $('card');
  function run() {
    card.classList.add('is-loading');
    window.LiveCoast.beaches().then(function (list) {
      if (!list.length) throw 0;
      return window.LiveCoast.sea(list).then(function (sea) { return { list: list, sea: sea }; });
    }).then(function (r) {
      var seen = {}, rows = [];
      r.list.forEach(function (b) {
        var d = r.sea[b.id]; if (!d || d.w == null || seen[b.name]) return; seen[b.name] = 1;
        rows.push({ b: b, w: d.w, t: d.t, at: d.at });
      });
      if (rows.length < 3) throw 0;
      var calm = rows.filter(function (x) { return x.w <= 0.6; });
      var best = (calm.length ? calm : rows.slice()).sort(function (a, b) { return (b.t || 0) - (a.t || 0) || a.w - b.w; })[0];
      var rest = rows.filter(function (x) { return x !== best; });
      var warm = rest.slice().sort(function (a, b) { return (b.t || 0) - (a.t || 0); })[0];
      var surf = rest.filter(function (x) { return x !== warm && x.b.lat > 36.5; }).sort(function (a, b) { return b.w - a.w; })[0];

      card.classList.remove('is-loading');
      $('time').textContent = T.upd + (best.at || new Date().toTimeString().slice(0, 5));
      // Contagem sobre todas as praias com dados (a BD tem 3 nomes repetidos; a lista de destaques usa nomes unicos)
      var all = r.list.filter(function (b) { var d = r.sea[b.id]; return d && d.w != null; });
      var nCalm = all.filter(function (b) { return r.sea[b.id].w <= 0.6; }).length;
      var k = $('kicker'); if (k) k.textContent = T.kicker(all.length, nCalm);

      // Destaque: mar mais calmo
      var B = $('best'); B.textContent = '';
      var th = el('div', 'lh__thumb'), img = el('img');
      img.src = '/images/beaches/' + encodeURIComponent(best.b.id) + '-480.webp'; img.alt = best.b.name; img.width = 92; img.height = 92; img.decoding = 'async';
      img.onerror = function () { this.remove(); };
      th.appendChild(img); B.appendChild(th);
      var info = el('div');
      info.appendChild(el('p', 'lh__eyebrow', T.calm));
      var h = el('p', 'lh__name'), a = el('a', null, best.b.name); a.href = T.beach(best.b.id); h.appendChild(a); info.appendChild(h);
      var meta = el('p', 'lh__meta');
      meta.appendChild(el('span', null, best.b.region));
      meta.appendChild(el('span', null, T.waves + ' ' + f1(best.w) + ' m'));
      if (best.t != null) meta.appendChild(el('span', null, T.water + ' ' + Math.round(best.t) + ' °C'));
      info.appendChild(meta); B.appendChild(info);
      var acts = el('div', 'lh__acts');
      var ho = el('a', 'lh__hotels'); ho.href = 'https://www.stay22.com/allez/booking?aid=kaptarstudio&campaign=portalturismoportugal-' + (EN ? 'en-' : '') + 'home&address=' + encodeURIComponent(best.b.name + ', Portugal'); /* Lote A 08/10: a home nao carrega o Stay22 -> link ja com ID */
      ho.target = '_blank'; ho.rel = 'sponsored noopener noreferrer';
      ho.appendChild(icon(['M2 20V8', 'M2 16h20v4', 'M22 16v-4a3 3 0 0 0-3-3H10v7'])); ho.appendChild(document.createTextNode(T.hotels));
      ho.addEventListener('click', function () { track('home_live_hotels', { beach: best.b.name }); });
      var vw = el('a', 'lh__view'); vw.href = T.beach(best.b.id); vw.appendChild(document.createTextNode(T.view)); vw.appendChild(icon(['M5 12h14', 'M12 5l7 7-7 7']));
      vw.addEventListener('click', function () { track('home_live_view', { beach: best.b.name }); });
      acts.appendChild(ho); acts.appendChild(vw); B.appendChild(acts);

      // Linhas: agua mais quente + melhores ondas
      var R = $('rows'); R.textContent = '';
      [[T.warm, warm, warm && warm.t != null ? Math.round(warm.t) + ' °C' : ''], [T.surf, surf, surf ? f1(surf.w) + ' m' : '']].forEach(function (x) {
        if (!x[1] || !x[2]) return;
        var li = el('li'), l = el('a'); l.href = T.beach(x[1].b.id);
        l.appendChild(el('small', null, x[0])); l.appendChild(el('b', null, x[1].b.name)); l.appendChild(el('em', null, x[2]));
        l.addEventListener('click', function () { track('home_live_row', { beach: x[1].b.name }); });
        li.appendChild(l); R.appendChild(li);
      });
    }).catch(function () { card.hidden = true; });
  }
  // Depois da pagina carregar (nao compete com o video nem com o LCP)
  function later() { ('requestIdleCallback' in window) ? requestIdleCallback(run, { timeout: 1500 }) : setTimeout(run, 300); }
  if (document.readyState === 'complete') later(); else window.addEventListener('load', later);
})(window, document);
