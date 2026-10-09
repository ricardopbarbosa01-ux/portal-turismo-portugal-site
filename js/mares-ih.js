/**
 * js/mares-ih.js — Mares oficiais do Instituto Hidrografico (Lote A2, 09/10/2026)
 * Le data/mares/<ano>/<porto>.json (gerados por _scripts/mares_ih_extract.py a partir da Tabela de Mares anual do IH):
 *   t = minutos desde 1 de janeiro UTC, h = decimetros acima do zero hidrografico.
 * Usa o porto de referencia mais proximo (ate 80 km). Lisboa fica de fora (porto dentro do rio).
 * Exposto: window.PTHMares.events(lat, lon) -> Promise<{mode:'ih', events:[{ts,h,type}], port, km} | null>
 *          window.PTHMares.now(lat, lon)    -> Promise<{rising, next:{ts,type,h}, port} | null>
 */
(function () {
  'use strict';
  var PORTS = [
    ['viana-do-castelo', 'Viana do Castelo', 41.685, -8.83967], ['leixoes', 'Leixões', 41.18667, -8.7045], ['aveiro', 'Aveiro', 40.64417, -8.74867],
    ['figueira-da-foz', 'Figueira da Foz', 40.14833, -8.85617], ['peniche', 'Peniche', 39.34983, -9.37467], ['cascais', 'Cascais', 38.69317, -9.41533],
    ['sesimbra', 'Sesimbra', 38.43817, -9.11283], ['setubal-troia', 'Setúbal (Tróia)', 38.4945, -8.90083], ['sines', 'Sines', 37.94817, -8.88783],
    ['lagos', 'Lagos', 37.09883, -8.66833], ['faro-olhao', 'Faro-Olhão', 36.97817, -7.86617], ['vila-real-de-santo-antonio', 'Vila Real de Santo António', 37.19333, -7.41333],
    ['funchal', 'Funchal', 32.644, -16.913], ['vila-do-porto', 'Vila do Porto (Santa Maria)', 36.94583, -25.14783], ['ponta-delgada', 'Ponta Delgada (São Miguel)', 37.736, -25.67117],
    ['angra-do-heroismo', 'Angra do Heroísmo (Terceira)', 38.64983, -27.22233], ['horta', 'Horta (Faial)', 38.53317, -28.62067], ['lajes-das-flores', 'Lajes das Flores (Flores)', 39.3785, -31.16867]
  ];
  var MAX_KM = 80, cache = {};
  function km(a, b, c, d) {
    var R = 6371, x = (c - a) * Math.PI / 180, y = (d - b) * Math.PI / 180;
    var q = Math.sin(x / 2) * Math.sin(x / 2) + Math.cos(a * Math.PI / 180) * Math.cos(c * Math.PI / 180) * Math.sin(y / 2) * Math.sin(y / 2);
    return 2 * R * Math.asin(Math.sqrt(q));
  }
  function nearest(lat, lon) {
    var best = null;
    PORTS.forEach(function (p) { var d = km(lat, lon, p[2], p[3]); if (!best || d < best.d) best = { p: p, d: d }; });
    return best && best.d <= MAX_KM ? best : null;
  }
  function year(slug, y) {
    var k = slug + y;
    if (!cache[k]) cache[k] = fetch('/data/mares/' + y + '/' + slug + '.json')
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        if (!j || !j.t) return [];
        var base = Date.UTC(y, 0, 1);
        return j.t.map(function (m, i) { return { ts: base + m * 60000, h: j.h[i] / 10 }; });
      })
      .catch(function () { return []; });
    return cache[k];
  }
  function events(lat, lon) {
    lat = +lat; lon = +lon;
    var b = isFinite(lat) && isFinite(lon) ? nearest(lat, lon) : null;
    if (!b) return Promise.resolve(null);
    var y = new Date().getUTCFullYear(), now = Date.now();
    return year(b.p[0], y).then(function (cur) {
      // ano anterior so nos primeiros minutos de janeiro (antes do 1.o extremo do ano); evita pedidos 404 inuteis
      return (cur.length && cur[0].ts > now ? year(b.p[0], y - 1) : Promise.resolve([])).then(function (prev) { return prev.slice(-4).concat(cur); });
    }).then(function (ev) {
      var ahead = ev.filter(function (e) { return e.ts >= now; }).length;
      return (ahead < 8 ? year(b.p[0], y + 1) : Promise.resolve([])).then(function (nx) {
        ev = ev.concat(nx);
        if (ev.length < 2) return null;
        if (!ev.filter(function (e) { return e.ts >= now; }).length) return null;
        ev = ev.map(function (e, i) { var n = ev[i + 1] || ev[i - 1]; return { ts: e.ts, h: e.h, type: e.h > n.h ? 'high' : 'low' }; });
        return { mode: 'ih', events: ev, port: b.p[1], km: Math.round(b.d) };
      });
    });
  }
  function now(lat, lon) {
    return events(lat, lon).then(function (src) {
      if (!src) return null;
      var t = Date.now(), ev = src.events, i = 0;
      while (i < ev.length && ev[i].ts < t) i++;
      if (i === 0 || i >= ev.length) return null;
      return { rising: ev[i].type === 'high', next: ev[i], port: src.port };
    });
  }
  window.PTHMares = { events: events, now: now, nearest: nearest };
})();
