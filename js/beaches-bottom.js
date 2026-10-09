/* js/beaches-bottom.js — /beaches e /en/beaches: secções depois da lista (Lote E, 09/10/2026)
 * 1) "Que praia procura?": cada perfil aplica o filtro real da lista (chips de js/beaches-filters.js) e sobe até aos filtros;
 *    a contagem de cada perfil vem dos próprios chips (mesmos dados da lista, sem pedidos extra).
 * 2) "Onde dormir": formulário -> link Stay22 Allez com datas (o CSP tem form-action 'self': monta-se o link e abre-se com <a>,
 *    que passa pelo js/affiliate.js e regista o affiliate_click).
 */
(function () {
  'use strict';
  var root = document.querySelector('.bb'); if (!root) return;
  var EN = (document.documentElement.lang || '').toLowerCase().indexOf('en') === 0;
  function track(n, p) { try { if (window.track) window.track(n, p || {}); else if (window.gtag) window.gtag('event', n, p || {}); } catch (e) {} }

  // ── 1. perfis ──
  var tiles = [].slice.call(document.querySelectorAll('.bb-tile[data-pick]'));
  function chipFor(t) {
    var k = t.getAttribute('data-pick'), v = t.getAttribute('data-v');
    if (k === 'tag') return document.querySelector('.chip-group[data-category="tags"] .chip[data-tag="' + v + '"]');
    if (k === 'quality') return document.querySelector('.chip-group[data-category="quality"] .chip[data-quality="' + v + '"]');
    return null;
  }
  tiles.forEach(function (t) {
    t.addEventListener('click', function () {
      var chip = chipFor(t); if (!chip) return;
      if (window.BeachFilters && window.BeachFilters.reset) window.BeachFilters.reset();
      chip.click();
      tiles.forEach(function (x) { x.setAttribute('aria-pressed', x === t ? 'true' : 'false'); });
      var bar = document.querySelector('.filters-bar') || document.getElementById('beaches-grid');
      if (bar) window.scrollTo({ top: bar.getBoundingClientRect().top + window.pageYOffset - 80, behavior: 'smooth' });
      track('beaches_pick', { profile: t.getAttribute('data-v') });
    });
  });
  var tries = 0;
  (function counts() {
    var done = 0;
    tiles.forEach(function (t) {
      var chip = chipFor(t), n = chip && chip.querySelector('.chip-n'), out = t.querySelector('.bb-tile__n');
      if (n && out && /\d/.test(n.textContent)) {
        var c = parseInt(n.textContent, 10);
        out.textContent = c + ' ' + (EN ? (c === 1 ? 'beach' : 'beaches') : (c === 1 ? 'praia' : 'praias'));
        done++;
      }
    });
    if (done < tiles.length && ++tries < 40) setTimeout(counts, 500);
  })();

  // ── 2. Stay22 ──
  var form = document.getElementById('bb-stay-form'); if (!form) return;
  function iso(d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function add(d, n) { var x = new Date(d.getTime()); x.setDate(x.getDate() + n); return x; }
  var today; try { today = new Date(new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Lisbon' }) + 'T12:00:00'); } catch (e) { today = new Date(); }
  var fri = add(today, ((5 - today.getDay() + 7) % 7) || 7);
  var a = form.querySelector('[name="checkin"]'), b = form.querySelector('[name="checkout"]');
  if (a && b) {
    a.min = iso(today); a.value = iso(fri); b.min = iso(add(fri, 1)); b.value = iso(add(fri, 2));
    a.addEventListener('change', function () {
      var d = a.value ? new Date(a.value + 'T12:00:00') : null; if (!d) return;
      b.min = iso(add(d, 1)); if (!b.value || b.value <= a.value) b.value = iso(add(d, 2));
    });
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (a && b && a.value && b.value && b.value <= a.value) b.value = iso(add(new Date(a.value + 'T12:00:00'), 2));
    var u = new URL(form.getAttribute('action'));
    [].forEach.call(form.elements, function (el) { if (el.name && el.value !== '') u.searchParams.set(el.name, el.value); });
    var link = document.createElement('a'); link.href = u.href; link.target = '_blank'; link.rel = 'noopener noreferrer sponsored'; link.style.display = 'none';
    document.body.appendChild(link); link.click(); setTimeout(function () { link.remove(); }, 0);
    track('beaches_stay_search', { address: (form.querySelector('[name="address"]') || {}).value || '' });
  });
})();
