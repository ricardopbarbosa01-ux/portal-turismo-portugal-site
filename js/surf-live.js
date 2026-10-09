/* SurfLive — condicoes de surf agora por spot — Portal Turismo Portugal — 2026-10-07
 * SurfLive.get(spots)          -> Promise<{id:{h,p,sp,sd,ws,wd,t,at}}>  2 pedidos Open-Meteo (marine + vento) por ate 100 spots,
 *                                  cache 30 min em sessionStorage (pth_surf_live_v1). Nunca rejeita.
 * SurfLive.rate(spot, c, lvl)  -> {k:'good'|'fair'|'poor'|'small'|'big', s:score, wind:'glassy'|'off'|'cross'|'on'}
 *                                  Estimativa automatica e transparente (tamanho vs nivel, periodo, vento vs vento ideal do spot,
 *                                  direcao do swell vs swell ideal). NAO e uma previsao profissional: o texto na pagina diz isso.
 * SurfLive.label(k|wind, lang) / SurfLive.line(c, rating, lang) -> textos curtos PT/EN.
 * Coordenadas: SurfPescaData.SURF_GEO. So dados + texto; nunca escreve HTML.
 */
(function (window) {
  'use strict';
  var KEY = 'pth_surf_live_v1', TTL = 30 * 60 * 1000, mem = null, inflight = null;
  var DIR = { N: 0, NNE: 22.5, NE: 45, ENE: 67.5, E: 90, ESE: 112.5, SE: 135, SSE: 157.5, S: 180, SSO: 202.5, SSW: 202.5,
              SO: 225, SW: 225, OSO: 247.5, WSW: 247.5, O: 270, W: 270, ONO: 292.5, WNW: 292.5, NO: 315, NW: 315, NNO: 337.5, NNW: 337.5 };
  var RANGE = { iniciante: [0.4, 1.2], intermedio: [0.7, 2.0], avancado: [1.2, 3.5], profissional: [2.5, 15] };
  var TXT = {
    pt: { good: 'Bom', fair: 'Razoável', poor: 'Fraco', small: 'Pequeno', big: 'Grande demais', glassy: 'sem vento', off: 'vento terral',
          cross: 'vento lateral', on: 'vento do mar', now: 'Agora', dec: ',' },
    en: { good: 'Good', fair: 'Fair', poor: 'Poor', small: 'Too small', big: 'Too big', glassy: 'glassy', off: 'offshore wind',
          cross: 'cross-shore wind', on: 'onshore wind', now: 'Now', dec: '.' }
  };

  function sget() { try { return JSON.parse(sessionStorage.getItem(KEY) || 'null'); } catch (e) { return null; } }
  function sset(v) { try { sessionStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {} }
  function num(v) { return (typeof v === 'number' && isFinite(v)) ? v : null; }
  function timed(url, ms) {
    var c = window.AbortController ? new AbortController() : null, t = c ? setTimeout(function () { c.abort(); }, ms) : null;
    return fetch(url, c ? { signal: c.signal } : undefined).then(function (r) { if (t) clearTimeout(t); if (!r.ok) throw new Error(r.status); return r.json(); });
  }
  function geo() { return (window.SurfPescaData && window.SurfPescaData.SURF_GEO) || {}; }

  function fetchAll(ids) {
    var G = geo(), pts = ids.filter(function (id) { return G[id]; });
    if (!pts.length) return Promise.resolve({});
    var jobs = [];
    for (var i = 0; i < pts.length; i += 100) jobs.push(chunk(pts.slice(i, i + 100), G));
    return Promise.all(jobs).then(function (parts) {
      var out = {}; parts.forEach(function (o) { for (var k in o) out[k] = o[k]; }); return out;
    });
  }
  function chunk(ids, G) {
    // Lote A2 09/10: pedidos agrupados por celula + cache partilhada (js/om-pool.js)
    if (window.PTHOpenMeteo) {
      var pts = ids.map(function (id) { return { id: id, lat: G[id][0], lng: G[id][1] }; });
      return Promise.all([window.PTHOpenMeteo.marine(pts), window.PTHOpenMeteo.weather(pts)]).then(function (r) {
        var out = {};
        ids.forEach(function (id) {
          var a = r[0][id] && r[0][id].c, b = r[1][id] && r[1][id].c; if (!a || num(a.wave_height) == null) return;
          out[id] = { h: num(a.wave_height), p: num(a.wave_period), sp: num(a.swell_wave_period), sd: num(a.swell_wave_direction),
                      t: num(a.sea_surface_temperature), ws: b ? num(b.wind_speed_10m) : null, wd: b ? num(b.wind_direction_10m) : null,
                      at: (a.time || '').slice(11, 16) };
        });
        return out;
      });
    }
    var lat = ids.map(function (id) { return G[id][0]; }).join(','), lng = ids.map(function (id) { return G[id][1]; }).join(',');
    var m = 'https://marine-api.open-meteo.com/v1/marine?latitude=' + lat + '&longitude=' + lng +
      '&current=wave_height,wave_period,swell_wave_period,swell_wave_direction,sea_surface_temperature&timezone=Europe%2FLisbon';
    var w = 'https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lng +
      '&current=wind_speed_10m,wind_direction_10m&wind_speed_unit=kmh&timezone=Europe%2FLisbon';
    function once(u) { return timed(u, 12000).catch(function () { return new Promise(function (r) { setTimeout(r, 700); }).then(function () { return timed(u, 18000); }); }).catch(function () { return null; }); }
    return Promise.all([once(m), once(w)]).then(function (r) {
      var A = r[0] ? (Array.isArray(r[0]) ? r[0] : [r[0]]) : [], B = r[1] ? (Array.isArray(r[1]) ? r[1] : [r[1]]) : [], out = {};
      ids.forEach(function (id, i) {
        var a = A[i] && A[i].current, b = B[i] && B[i].current; if (!a || num(a.wave_height) == null) return;
        out[id] = { h: num(a.wave_height), p: num(a.wave_period), sp: num(a.swell_wave_period), sd: num(a.swell_wave_direction),
                    t: num(a.sea_surface_temperature), ws: b ? num(b.wind_speed_10m) : null, wd: b ? num(b.wind_direction_10m) : null,
                    at: (a.time || '').slice(11, 16) };
      });
      return out;
    });
  }
  function get(spots) {
    var ids = (spots || []).map(function (s) { return typeof s === 'string' ? s : s.id; });
    if (!mem) { var c = sget(); mem = (c && Date.now() - c.ts < TTL) ? c : { ts: 0, d: {} }; }
    var need = ids.filter(function (id) { return !mem.d[id]; });
    if (!need.length) return Promise.resolve(mem.d);
    if (inflight) return inflight.then(function () { return get(ids); });
    inflight = fetchAll(need).then(function (o) {
      for (var k in o) mem.d[k] = o[k];
      if (!mem.ts) mem.ts = Date.now();
      sset(mem); inflight = null; return mem.d;
    }, function () { inflight = null; return mem.d; });
    return inflight;
  }

  function dirs(field) {
    var s = field && typeof field === 'object' ? (field.pt || field.en || '') : (field || '');
    return String(s).toUpperCase().split(/[^A-Z]+/).map(function (t) { return DIR[t]; }).filter(function (v) { return v != null; });
  }
  function diff(a, b) { var d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; }
  function minDiff(x, list) { return list.reduce(function (m, v) { return Math.min(m, diff(x, v)); }, 999); }

  function rate(spot, c, lvl) {
    if (!c || c.h == null) return null;
    var level = lvl || spot.levelKey || 'intermedio', R = RANGE[level] || RANGE.intermedio, h = c.h, s = 0, wind = 'cross';
    if (h >= R[0] && h <= R[1]) s += 2; else if (h >= R[0] * 0.8 && h <= R[1] * 1.15) s += 1;
    var per = Math.max(c.p || 0, c.sp || 0);
    if (per >= 11) s += 2; else if (per >= 9) s += 1; else if (per < 7) s -= 1;
    var good = dirs(spot.best_wind);
    if (c.ws != null) {
      if (c.ws < 8) { wind = 'glassy'; s += 2; }
      else if (c.wd != null && good.length) {
        var off = minDiff(c.wd, good), on = minDiff(c.wd, good.map(function (v) { return (v + 180) % 360; }));
        if (off <= 45) { wind = 'off'; s += c.ws <= 30 ? 2 : 0; }
        else if (on <= 60) { wind = 'on'; s -= c.ws > 20 ? 3 : (c.ws > 12 ? 2 : 1); }
        else { wind = 'cross'; if (c.ws > 20) s -= 1; }
      }
    }
    var sw = dirs(spot.best_swell);
    if (c.sd != null && sw.length) { var dd = minDiff(c.sd, sw); if (dd <= 45) s += 1; else if (dd > 100) s -= 1; }
    var k = s >= 5 ? 'good' : (s >= 2 ? 'fair' : 'poor');
    if (h < R[0] * 0.7) k = 'small';
    else if (h > R[1] * 1.3) k = 'big';
    return { k: k, s: s, wind: wind };
  }
  function f1(v, L) { return v.toFixed(1).replace('.', L.dec); }
  function label(k, lang) { var L = TXT[lang] || TXT.pt; return L[k] || k; }
  function line(c, r, lang) {
    var L = TXT[lang] || TXT.pt, out = [f1(c.h, L) + ' m'];
    var per = Math.max(c.p || 0, c.sp || 0); if (per) out.push(Math.round(per) + ' s');
    if (r && c.ws != null) out.push(L[r.wind] + (r.wind === 'glassy' ? '' : ' ' + Math.round(c.ws) + ' km/h'));
    return out.join(' · ');
  }
  window.SurfLive = { get: get, rate: rate, label: label, line: line, RANGE: RANGE };
})(window);
