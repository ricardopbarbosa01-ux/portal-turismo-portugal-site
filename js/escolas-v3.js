/* js/escolas-v3.js — /escolas-de-surf v3: filtros (região, idioma, FPS, reserva online) com estado no URL,
 * mapa/legenda que filtram por região, contagem, e evento school_outbound_click {school, type} nas saídas.
 * Substitui js/partners-directory.js nesta página. Âncoras #<escola> e de secção: js/escolas-v2.js (sectionAnchor).
 */
(function () {
  'use strict';
  var root = document.querySelector('.esc3'); if (!root) return;
  var EN = (document.documentElement.lang || '').toLowerCase().indexOf('en') === 0;
  var rows = [].slice.call(root.querySelectorAll('.esc3-school'));
  var S = { region: '', lang: [], fps: false, gyg: false };
  function track(n, p) { try { if (typeof window.track === 'function') window.track(n, p || {}); else if (window.gtag) window.gtag('event', n, p || {}); } catch (e) {} }

  function readURL() {
    var q = new URLSearchParams(location.search);
    S.region = q.get('region') || '';
    S.lang = (q.get('lang') || '').split(',').filter(Boolean);
    S.fps = q.get('fps') === '1'; S.gyg = q.get('gyg') === '1';
  }
  function writeURL() {
    var q = new URLSearchParams(location.search);
    ['region', 'lang', 'fps', 'gyg'].forEach(function (k) { q.delete(k); });
    if (S.region) q.set('region', S.region);
    if (S.lang.length) q.set('lang', S.lang.join(','));
    if (S.fps) q.set('fps', '1'); if (S.gyg) q.set('gyg', '1');
    var s = q.toString();
    try { history.replaceState(null, '', location.pathname + (s ? '?' + s : '') + location.hash); } catch (e) {}
  }
  function apply() {
    var n = 0;
    rows.forEach(function (r) {
      var ok = (!S.region || r.getAttribute('data-region') === S.region)
        && S.lang.every(function (l) { return (',' + r.getAttribute('data-lang') + ',').indexOf(',' + l + ',') !== -1; })
        && (!S.fps || r.getAttribute('data-fps') === '1')
        && (!S.gyg || r.getAttribute('data-gyg') === '1');
      r.hidden = !ok; if (ok) n++;
    });
    var c = root.querySelector('[data-count]'), cl = root.querySelector('[data-count-l]');
    if (c) c.textContent = n;
    if (cl) cl.textContent = EN ? (n === 1 ? 'school' : 'schools') : (n === 1 ? 'escola' : 'escolas');
    var empty = root.querySelector('.esc3-empty'); if (empty) empty.hidden = n !== 0;
    [].forEach.call(root.querySelectorAll('[data-f-region]'), function (b) { b.setAttribute('aria-checked', b.getAttribute('data-f-region') === S.region ? 'true' : 'false'); });
    [].forEach.call(root.querySelectorAll('[data-f-lang]'), function (b) { b.setAttribute('aria-pressed', S.lang.indexOf(b.getAttribute('data-f-lang')) !== -1 ? 'true' : 'false'); });
    var f = root.querySelector('[data-f-fps]'); if (f) f.setAttribute('aria-pressed', S.fps ? 'true' : 'false');
    var g = root.querySelector('[data-f-gyg]'); if (g) g.setAttribute('aria-pressed', S.gyg ? 'true' : 'false');
    [].forEach.call(root.querySelectorAll('[data-set-region]'), function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-set-region') === S.region ? 'true' : 'false'); });
    // pinos do mapa: realça os que estão visíveis
    [].forEach.call(root.querySelectorAll('[data-pin]'), function (p) {
      var r = document.getElementById(p.getAttribute('data-pin'));
      p.classList.toggle('is-hl', !!(r && !r.hidden && (S.region || S.lang.length || S.fps || S.gyg)));
      p.style.opacity = r && r.hidden ? '.25' : '';
    });
  }
  function change(what) { writeURL(); apply(); track('schools_filter', { f: what, region: S.region, lang: S.lang.join(','), fps: S.fps ? 1 : 0, gyg: S.gyg ? 1 : 0 }); }

  root.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b || !root.contains(b)) return;
    if (b.hasAttribute('data-f-region')) { S.region = b.getAttribute('data-f-region'); change('region'); }
    else if (b.hasAttribute('data-f-lang')) { var l = b.getAttribute('data-f-lang'), i = S.lang.indexOf(l); if (i === -1) S.lang.push(l); else S.lang.splice(i, 1); change('lang'); }
    else if (b.hasAttribute('data-f-fps')) { S.fps = !S.fps; change('fps'); }
    else if (b.hasAttribute('data-f-gyg')) { S.gyg = !S.gyg; change('gyg'); }
    else if (b.hasAttribute('data-f-reset')) { S = { region: '', lang: [], fps: false, gyg: false }; change('reset'); }
    else if (b.hasAttribute('data-set-region')) {
      var r = b.getAttribute('data-set-region'); S.region = S.region === r ? '' : r; change('map');
      var dir = document.getElementById('escolas'); if (dir) dir.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    }
  });
  // pino do mapa -> vai à escola
  [].forEach.call(root.querySelectorAll('[data-pin]'), function (p) {
    p.addEventListener('click', function () { var r = document.getElementById(p.getAttribute('data-pin')); if (r) { if (r.hidden) { S = { region: '', lang: [], fps: false, gyg: false }; change('pin'); } r.scrollIntoView({ behavior: 'smooth', block: 'start' }); } });
  });

  // saídas para as escolas (base do resumo mensal: "enviámos-lhe N visitas")
  function onOut(e) {
    var a = e.target.closest && e.target.closest('a[data-esc-out]'); if (!a) return;
    var row = a.closest('.esc3-school'); if (!row) return;
    track('school_outbound_click', { school: row.getAttribute('data-id') || '', type: a.getAttribute('data-esc-out') });
  }
  root.addEventListener('click', onOut);
  root.addEventListener('auxclick', function (e) { if (e.button === 1) onOut(e); });

  readURL(); apply();
})();
