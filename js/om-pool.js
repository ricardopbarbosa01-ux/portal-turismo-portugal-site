/**
 * js/om-pool.js — PTHOpenMeteo: pedidos ao Open-Meteo partilhados, agrupados e com cache (Lote A2, 09/10/2026)
 * Porque: cada visita pedia centenas de pontos (webcams 338, /beaches 371, surf 252, pesca 234) e o limite gratuito
 * do Open-Meteo e por IP (600/min, 5 000/h, 10 000/dia) -> erro 429 com IP partilhado (redes moveis, empresas).
 * O que faz:
 *  1. Agrupa pontos que caem na MESMA celula do modelo: mar -> mapa ponto->celula em /data/om-cells.json (gerado por
 *     _scripts/om_cells.py) + aprendido em runtime; vento/ar -> grelha de 0,05 graus. ~780 pontos de mar -> ~130 celulas.
 *  2. Cache em localStorage partilhada entre paginas e visitas (45 min; dados com ate 3 h usados se o Open-Meteo falhar).
 *  3. Pedidos em curso partilhados (a mesma celula nunca e pedida 2 vezes ao mesmo tempo).
 *  4. 429: pausa de 2 min para todas as paginas (localStorage) e usa o que houver em cache; outros erros: 1 nova tentativa.
 *  Pede sempre o mesmo conjunto de variaveis (uniao do que as paginas usam) para a cache servir todas.
 * API (nunca rejeita):
 *   PTHOpenMeteo.marine(points) -> Promise<{id: {c: current, sl: {t:[iso horas], v:[nivel]} , ts}}>
 *   PTHOpenMeteo.weather(points) -> Promise<{id: {c: current, ts}}>
 *   points = [{id, lat, lng}]
 */
(function (window) {
  'use strict';
  var M_VARS = 'wave_height,wave_period,wave_direction,swell_wave_height,swell_wave_period,swell_wave_direction,sea_surface_temperature';
  var W_VARS = 'temperature_2m,wind_speed_10m,wind_direction_10m,wind_gusts_10m';
  var TTL = 45 * 60 * 1000, STALE = 3 * 3600 * 1000, KEEP = 6 * 3600 * 1000, BLOCK_MS = 120 * 1000, CHUNK = 100;
  var K = { m: 'pth_om_m_v1', w: 'pth_om_w_v1', map: 'pth_om_cellmap_v1', block: 'pth_om_block_v1' };
  var mem = {}, inflight = { m: {}, w: {} }, cellsP = null, STATIC = {};

  function lget(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } }
  function lset(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* cheio ou bloqueado: so memoria */ } }
  function store(kind) { if (!mem[kind]) mem[kind] = lget(K[kind]) || {}; return mem[kind]; }
  function save(kind) {
    var s = store(kind), now = Date.now();
    for (var c in s) if (!s[c] || now - s[c].ts > KEEP) delete s[c];
    lset(K[kind], s);
  }
  function coord(lat, lng) { return (+lat).toFixed(4) + ',' + (+lng).toFixed(4); }
  function blocked() { var b = lget(K.block); return b && Date.now() < b; }
  function block() { lset(K.block, Date.now() + BLOCK_MS); }

  function loadCells() {
    if (cellsP) return cellsP;
    var ctl = window.AbortController ? new AbortController() : null, to = ctl ? setTimeout(function () { ctl.abort(); }, 2500) : null;
    cellsP = fetch('/data/om-cells.json?v=20261009', ctl ? { signal: ctl.signal } : undefined)
      .then(function (r) { if (to) clearTimeout(to); return r.ok ? r.json() : {}; })
      .then(function (j) { STATIC = (j && j.cells) || {}; }, function () { STATIC = {}; });
    return cellsP;
  }
  function cellOf(kind, p) {
    if (kind === 'w') return (Math.round(p.lat * 20) / 20).toFixed(2) + ',' + (Math.round(p.lng * 20) / 20).toFixed(2);
    var k = coord(p.lat, p.lng), learned = store('map');
    if (STATIC[k] === 0) return null; // ponto sem mar no modelo (rio/albufeira): nao pedir
    return STATIC[k] || learned[k] || k;
  }

  function timed(url, ms) {
    var c = window.AbortController ? new AbortController() : null, t = c ? setTimeout(function () { c.abort(); }, ms) : null;
    return fetch(url, c ? { signal: c.signal, credentials: 'omit' } : { credentials: 'omit' }).then(function (r) {
      if (t) clearTimeout(t);
      if (r.status === 429) { block(); var e = new Error('429'); e.rate = true; throw e; }
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    });
  }
  function request(kind, cells, retry) {
    var lat = cells.map(function (c) { return c.split(',')[0]; }).join(','), lng = cells.map(function (c) { return c.split(',')[1]; }).join(',');
    var url = kind === 'm'
      ? 'https://marine-api.open-meteo.com/v1/marine?latitude=' + lat + '&longitude=' + lng + '&current=' + M_VARS + '&hourly=sea_level_height_msl&forecast_days=2&timezone=Europe%2FLisbon'
      : 'https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lng + '&current=' + W_VARS + '&wind_speed_unit=kmh&timezone=Europe%2FLisbon';
    return timed(url, retry ? 16000 : 10000).then(function (res) {
      var arr = Array.isArray(res) ? res : [res], s = store(kind), now = Date.now(), map = store('map'), learn = false;
      cells.forEach(function (c, i) {
        var o = arr[i]; if (!o || !o.current) return;
        var e = { ts: now, c: o.current };
        if (kind === 'm') {
          if (o.hourly && o.hourly.sea_level_height_msl) e.sl = { t: o.hourly.time, v: o.hourly.sea_level_height_msl };
          if (o.current.wave_height == null) e.dry = 1; // celula sem mar no modelo
          // aprender a celula real do modelo (o pedido seguinte vai direto a ela)
          var real = coord(o.latitude, o.longitude);
          if (real !== c && !STATIC[c] && !map[c]) { map[c] = real; learn = true; s[real] = e; }
        }
        s[c] = e;
      });
      save(kind); if (learn) lset(K.map, map);
    }).catch(function (err) {
      if (err && err.rate) return;            // 429: nao insistir; a pausa vale para todas as paginas
      if (!retry) return new Promise(function (r) { setTimeout(r, 2500 + Math.random() * 1500); }).then(function () { return request(kind, cells, true); });
    });
  }
  function get(kind, points) {
    var pts = (points || []).filter(function (p) { return p && p.id != null && isFinite(p.lat) && isFinite(p.lng); });
    return (kind === 'm' ? loadCells() : Promise.resolve()).then(function () {
      var s = store(kind), now = Date.now(), want = {}, need = [], waits = [];
      pts.forEach(function (p) { var c = cellOf(kind, p); if (c) want[p.id] = c; });
      Object.keys(want).forEach(function (id) {
        var c = want[id];
        if (s[c] && now - s[c].ts < TTL) return;
        if (inflight[kind][c]) { waits.push(inflight[kind][c]); return; }
        if (need.indexOf(c) === -1) need.push(c);
      });
      if (need.length && !blocked()) {
        for (var i = 0; i < need.length; i += CHUNK) {
          var part = need.slice(i, i + CHUNK), job = request(kind, part);
          part.forEach(function (c) { inflight[kind][c] = job; });
          (function (part, job) { job.then(function () { part.forEach(function (c) { if (inflight[kind][c] === job) delete inflight[kind][c]; }); }); })(part, job);
          waits.push(job);
        }
      }
      return Promise.all(waits).then(function () {
        var s2 = store(kind), t = Date.now(), out = {};
        Object.keys(want).forEach(function (id) {
          var e = s2[want[id]];
          if (e && t - e.ts < STALE && !e.dry) out[id] = e;
        });
        return out;
      });
    }).catch(function () { return {}; });
  }

  window.PTHOpenMeteo = {
    marine: function (points) { return get('m', points); },
    weather: function (points) { return get('w', points); }
  };
})(window);
