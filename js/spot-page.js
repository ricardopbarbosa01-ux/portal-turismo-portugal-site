/* Paginas de spot de webcam (condicoes ao vivo) — Portal Turismo Portugal — 2026-10-06
 * Le <section data-spot-lat data-spot-lng data-spot-lang> e preenche os elementos [data-spot="..."].
 * So escreve texto (textContent), nunca HTML externo. Se a Open-Meteo falhar, mostra aviso e a pagina fica intacta.
 * Reutilizavel: uma pagina por camara, mesmo script.
 */
(function (window, document) {
  'use strict';

  var root = document.querySelector('[data-spot-lat]');
  if (!root) return;
  var lat = parseFloat(root.getAttribute('data-spot-lat'));
  var lng = parseFloat(root.getAttribute('data-spot-lng'));
  var EN = root.getAttribute('data-spot-lang') === 'en';
  if (!isFinite(lat) || !isFinite(lng)) return;

  var T = EN ? {
    updated: 'Updated at ', unavailable: 'Live data unavailable right now — check the camera before you go.',
    calm: 'Calm sea — a good day for swimming and families.',
    moderate: 'Moderate swell — keep an eye on children near the shore break.',
    rough: 'Rough sea or strong wind — check the camera before you go.',
    period: 'period', from: 'from', gusts: 'gusts', now: 'now', today: 'today', max: 'max today', surface: 'sea surface'
  } : {
    updated: 'Atualizado às ', unavailable: 'Dados ao vivo indisponíveis neste momento — veja a câmara antes de ir.',
    calm: 'Mar calmo — bom dia para banhos e famílias.',
    moderate: 'Ondulação moderada — atenção às crianças junto à rebentação.',
    rough: 'Mar agitado ou vento forte — veja a câmara antes de ir.',
    period: 'período', from: 'de', gusts: 'rajadas', now: 'agora', today: 'hoje', max: 'máximo hoje', surface: 'à superfície'
  };
  var DIRS = EN ? ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'] : ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];

  function el(k) { return root.querySelector('[data-spot="' + k + '"]'); }
  function set(k, txt) { var e = el(k); if (e) e.textContent = txt; }
  function num(v) { return (typeof v === 'number' && isFinite(v)) ? v : null; }
  function dir(deg) { deg = num(deg); return deg === null ? '' : DIRS[Math.round(deg / 45) % 8]; }
  function hhmm(iso) { return (typeof iso === 'string' && iso.length >= 16) ? iso.slice(11, 16) : '—'; }
  function fmt1(v) { return v === null ? '—' : v.toFixed(1).replace('.', EN ? '.' : ','); }

  function getJSON(url) {
    var ctrl = ('AbortController' in window) ? new AbortController() : null;
    var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, 9000) : null;
    return fetch(url, ctrl ? { signal: ctrl.signal } : {}).then(function (r) {
      if (timer) clearTimeout(timer);
      if (!r.ok) throw new Error('http ' + r.status);
      return r.json();
    });
  }

  var q = 'latitude=' + lat + '&longitude=' + lng + '&timezone=Europe%2FLisbon&forecast_days=2';
  var marineUrl = 'https://marine-api.open-meteo.com/v1/marine?' + q +
    '&current=wave_height,wave_period,wave_direction,sea_surface_temperature&hourly=wave_height';
  var weatherUrl = 'https://api.open-meteo.com/v1/forecast?' + q +
    '&current=temperature_2m,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=wind_speed_10m&daily=sunset,uv_index_max';

  function settle(p) { return p.then(function (v) { return v; }, function () { return null; }); }

  Promise.all([settle(getJSON(marineUrl)), settle(getJSON(weatherUrl))]).then(function (res) {
    var m = res[0], w = res[1];
    var mc = (m && m.current) || {}, wc = (w && w.current) || {};
    if (!m && !w) { root.classList.add('is-unavailable'); set('verdict', T.unavailable); set('updated', '—'); return; }

    var wave = num(mc.wave_height), per = num(mc.wave_period), sst = num(mc.sea_surface_temperature);
    var wind = num(wc.wind_speed_10m), gust = num(wc.wind_gusts_10m), air = num(wc.temperature_2m);

    set('wave', wave === null ? '—' : fmt1(wave) + ' m');
    set('wave-sub', [per === null ? '' : T.period + ' ' + Math.round(per) + ' s', dir(mc.wave_direction) ? T.from + ' ' + dir(mc.wave_direction) : ''].filter(Boolean).join(' · ') || '—');
    set('wind', wind === null ? '—' : Math.round(wind) + ' km/h');
    set('wind-sub', [gust === null ? '' : T.gusts + ' ' + Math.round(gust), dir(wc.wind_direction_10m) ? T.from + ' ' + dir(wc.wind_direction_10m) : ''].filter(Boolean).join(' · ') || '—');
    set('sst', sst === null ? '—' : fmt1(sst) + ' °C');
    set('air', air === null ? '—' : Math.round(air) + ' °C');
    var d = (w && w.daily) || {};
    set('sunset', d.sunset && d.sunset[0] ? hhmm(d.sunset[0]) : '—');
    var uv = d.uv_index_max ? num(d.uv_index_max[0]) : null;
    set('uv', uv === null ? '—' : String(Math.round(uv)));
    set('updated', T.updated + hhmm(mc.time || wc.time));

    var verdict = T.unavailable, level = 'na';
    if (wave !== null) {
      var wnd = wind === null ? 0 : wind;
      if (wave <= 0.6 && wnd < 20) { verdict = T.calm; level = 'calm'; }
      else if (wave <= 1.2 && wnd < 30) { verdict = T.moderate; level = 'moderate'; }
      else { verdict = T.rough; level = 'rough'; }
    }
    set('verdict', verdict);
    root.setAttribute('data-spot-level', level);

    // Proximas horas: 6 marcas de 3 em 3 horas a partir da hora atual
    var list = el('hours');
    var mt = (m && m.hourly && m.hourly.time) || [], mh = (m && m.hourly && m.hourly.wave_height) || [];
    var wt = (w && w.hourly && w.hourly.time) || [], wh = (w && w.hourly && w.hourly.wind_speed_10m) || [];
    var nowIso = (mc.time || wc.time || '').slice(0, 13);
    var start = -1;
    for (var i = 0; i < mt.length; i++) { if (mt[i].slice(0, 13) >= nowIso) { start = i; break; } }
    if (list && start < 0) { var hb = list.closest('.spot-hours'); if (hb) hb.hidden = true; }
    if (list && start >= 0) {
      var items = list.querySelectorAll('li');
      for (var k = 0; k < items.length; k++) {
        var idx = start + 3 * (k + 1);
        var li = items[k];
        if (idx >= mt.length) { li.hidden = true; continue; }
        var wi = wt.indexOf(mt[idx]);
        var hv = num(mh[idx]), wv = wi >= 0 ? num(wh[wi]) : null;
        var parts = li.querySelectorAll('span');
        if (parts.length >= 3) {
          parts[0].textContent = hhmm(mt[idx]);
          parts[1].textContent = hv === null ? '—' : fmt1(hv) + ' m';
          parts[2].textContent = wv === null ? '—' : Math.round(wv) + ' km/h';
        }
      }
      list.classList.add('is-ready');
    }
    root.classList.add('is-ready');
  });
})(window, document);
