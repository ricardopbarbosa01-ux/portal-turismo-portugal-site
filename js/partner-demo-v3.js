/* js/partner-demo-v3.js — /partner-demo v3: mar em direto (PTHOpenMeteo), indicação para aulas, botões de exemplo, notas.
 * Textos em window.PD3_T (definido na página, PT ou EN). Se o Open-Meteo falhar, os valores ficam "—".
 */
(function () {
  'use strict';
  var root = document.querySelector('.pd3'); if (!root) return;
  var T = window.PD3_T || {};
  var EN = (document.documentElement.lang || '').toLowerCase().indexOf('en') === 0;
  function track(n, p) { try { if (typeof window.track === 'function') window.track(n, p || {}); } catch (e) {} }
  function num(v, d) { return (Math.round(v * Math.pow(10, d)) / Math.pow(10, d)).toFixed(d).replace('.', EN ? '.' : ','); }

  // ── notas "o que está incluído" ──
  var tog = document.querySelector('[data-notes-toggle]');
  if (tog) tog.addEventListener('click', function () {
    var on = tog.getAttribute('aria-pressed') !== 'true';
    tog.setAttribute('aria-pressed', on ? 'true' : 'false');
    root.classList.toggle('pd3--notes', on);
    track('partner_demo_notes', { on: on ? 1 : 0, lang: EN ? 'en' : 'pt' });
  });
  try { if (window.matchMedia('(max-width: 640px)').matches && tog) { tog.click(); } } catch (e) {}

  // ── botões de exemplo ──
  var pop = root.querySelector('.pd3-pop'), popT;
  [].forEach.call(root.querySelectorAll('[data-demo-act]'), function (b) {
    b.addEventListener('click', function () {
      var a = b.getAttribute('data-demo-act');
      if (pop) {
        pop.textContent = T['demo_' + a] || '';
        pop.hidden = false; clearTimeout(popT); popT = setTimeout(function () { pop.hidden = true; }, 4500);
        if (!b.closest('.pd3-hero')) { var r = b.getBoundingClientRect(); if (r.top > 120) window.scrollTo({ top: window.pageYOffset + pop.getBoundingClientRect().top - 140, behavior: 'smooth' }); }
      }
      track('partner_demo_click', { placement: a, lang: EN ? 'en' : 'pt' });
    });
  });

  // ── mar em direto ──
  var boxes = [].slice.call(root.querySelectorAll('[data-om]'));
  if (!boxes.length || !window.PTHOpenMeteo) return;
  var pts = [], seen = {};
  boxes.forEach(function (b) {
    var id = b.getAttribute('data-om'); if (seen[id]) return; seen[id] = 1;
    pts.push({ id: id, lat: +b.getAttribute('data-lat'), lng: +b.getAttribute('data-lng') });
  });
  function set(box, k, html) { var el = box.querySelector('[data-v="' + k + '"]'); if (el) el.innerHTML = html; }
  Promise.all([window.PTHOpenMeteo.marine(pts), window.PTHOpenMeteo.weather(pts)]).then(function (res) {
    var m = res[0] || {}, w = res[1] || {};
    boxes.forEach(function (box) {
      var id = box.getAttribute('data-om'), mc = m[id] && m[id].c, wc = w[id] && w[id].c;
      if (mc && mc.wave_height != null) set(box, 'wave', num(mc.wave_height, 1) + '<small>m</small>');
      if (mc && mc.wave_period != null) set(box, 'period', Math.round(mc.wave_period) + '<small>s</small>');
      if (mc && mc.sea_surface_temperature != null) set(box, 'sst', Math.round(mc.sea_surface_temperature) + '<small>°C</small>');
      if (wc && wc.wind_speed_10m != null) set(box, 'wind', Math.round(wc.wind_speed_10m) + '<small>km/h</small>');
      if (box.classList.contains('pd3-now')) {
        var verdict = box.querySelector('[data-v="verdict"]');
        if (mc && mc.wave_height != null) {
          var h = mc.wave_height;
          var txt = h < 1.0 ? T.verdict_beg : (h < 1.8 ? T.verdict_mid : T.verdict_big);
          if (verdict) verdict.innerHTML = txt + '<small>' + (T.verdict_note || '') + '</small>';
          box.style.setProperty('--g', Math.max(2, Math.min(98, h / 3 * 100)) + '%');
          var g = box.querySelector('.pd3-gauge'); if (g) g.style.setProperty('--g', Math.max(2, Math.min(98, h / 3 * 100)) + '%');
          var mark = box.querySelector('.pd3-gauge__mark'); if (mark) mark.style.left = Math.max(2, Math.min(98, h / 3 * 100)) + '%';
        } else if (verdict) verdict.textContent = T.nodata || '';
        var ts = (m[id] && m[id].ts) || Date.now(), d = new Date(ts);
        set(box, 'time', (T.updated || '') + ' ' + ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2));
      }
    });
  });
})();
