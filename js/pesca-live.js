/* PescaLive — condicoes de pesca agora por spot — Portal Turismo Portugal — 2026-10-07
 * PescaLive.get(spots)        -> Promise<{id:{h,t,tide,ws,wd,air,at}}>  Open-Meteo: marine (ondas, agua, mare horaria) + forecast (vento, ar).
 *                                Cache 30 min em sessionStorage (pth_fish_live_v1). Nunca rejeita. Rios/albufeiras: so vento e ar (marine = null).
 * PescaLive.rate(spot, c)     -> {k:'good'|'fair'|'poor', danger:bool}  estimativa automatica e transparente:
 *                                costa/rocha = altura do mar + vento; barco = mar + vento; ria/rio = vento.
 * PescaLive.line(c, lang, spot) / label(k, lang, r) / moon(date, lang) -> textos curtos PT/EN (ria/rio sem altura do mar).
 * Coordenadas: SurfPescaData.FISH_GEO. So dados; nunca escreve HTML.
 */
(function (window) {
  'use strict';
  var KEY = 'pth_fish_live_v1', TTL = 30 * 60 * 1000, mem = null, inflight = null;
  var TXT = {
    pt: { good: 'Bom', fair: 'Razoável', poor: 'Difícil', danger: 'Mar perigoso', sea: 'mar', wind: 'vento', water: 'água', air: 'ar',
          up: 'maré a encher', down: 'maré a vazar', dec: ',',
          moon: ['Lua nova', 'Lua crescente', 'Quarto crescente', 'Crescente gibosa', 'Lua cheia', 'Minguante gibosa', 'Quarto minguante', 'Lua minguante'] },
    en: { good: 'Good', fair: 'Fair', poor: 'Tough', danger: 'Dangerous sea', sea: 'sea', wind: 'wind', water: 'water', air: 'air',
          up: 'rising tide', down: 'falling tide', dec: '.',
          moon: ['New moon', 'Waxing crescent', 'First quarter', 'Waxing gibbous', 'Full moon', 'Waning gibbous', 'Last quarter', 'Waning crescent'] }
  };
  function sget() { try { return JSON.parse(sessionStorage.getItem(KEY) || 'null'); } catch (e) { return null; } }
  function sset(v) { try { sessionStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {} }
  function num(v) { return (typeof v === 'number' && isFinite(v)) ? v : null; }
  function timed(url, ms) {
    var c = window.AbortController ? new AbortController() : null, t = c ? setTimeout(function () { c.abort(); }, ms) : null;
    return fetch(url, c ? { signal: c.signal } : undefined).then(function (r) { if (t) clearTimeout(t); if (!r.ok) throw new Error(r.status); return r.json(); });
  }
  function once(u) { return timed(u, 12000).catch(function () { return new Promise(function (r) { setTimeout(r, 700); }).then(function () { return timed(u, 18000); }); }).catch(function () { return null; }); }
  function geo() { return (window.SurfPescaData && window.SurfPescaData.FISH_GEO) || {}; }
  function nowLisbon() { // 'AAAA-MM-DDTHH:MM' na hora de Lisboa (as series do Open-Meteo vem com timezone=Europe/Lisbon)
    try { return new Date().toLocaleString('sv-SE', { timeZone: 'Europe/Lisbon' }).replace(' ', 'T').slice(0, 16); } catch (e) { return new Date().toISOString().slice(0, 16); }
  }
  function tideTrend(m) {
    var h = m && m.hourly, cur = m && m.current; if (!h || !h.time || !h.sea_level_height_msl || !cur || !cur.time) return null;
    var i = h.time.indexOf(cur.time.slice(0, 13) + ':00'); if (i < 0 || i + 1 >= h.time.length) return null;
    var a = num(h.sea_level_height_msl[i]), b = num(h.sea_level_height_msl[i + 1]); if (a == null || b == null || Math.abs(b - a) < 0.02) return null;
    return b > a ? 'up' : 'down';
  }
  function chunk(ids, G) {
    // Lote A2 09/10: pedidos agrupados por celula + cache partilhada (js/om-pool.js); mare pela serie horaria guardada
    if (window.PTHOpenMeteo) {
      var pts = ids.map(function (id) { return { id: id, lat: G[id][0], lng: G[id][1] }; });
      return Promise.all([window.PTHOpenMeteo.marine(pts), window.PTHOpenMeteo.weather(pts)]).then(function (r) {
        var out = {};
        ids.forEach(function (id) {
          var me = r[0][id], a = me && me.c, b = r[1][id] && r[1][id].c; if (!a && !b) return;
          var tide = me && me.sl ? tideTrend({ hourly: { time: me.sl.t, sea_level_height_msl: me.sl.v }, current: { time: nowLisbon() } }) : null;
          out[id] = { h: a ? num(a.wave_height) : null, t: a ? num(a.sea_surface_temperature) : null, tide: tide,
                      ws: b ? num(b.wind_speed_10m) : null, wd: b ? num(b.wind_direction_10m) : null, air: b ? num(b.temperature_2m) : null,
                      at: ((a && a.time) || (b && b.time) || '').slice(11, 16) };
          if (out[id].ws == null && out[id].h == null) delete out[id];
        });
        return out;
      });
    }
    var lat = ids.map(function (id) { return G[id][0]; }).join(','), lng = ids.map(function (id) { return G[id][1]; }).join(',');
    var mu = 'https://marine-api.open-meteo.com/v1/marine?latitude=' + lat + '&longitude=' + lng +
      '&current=wave_height,sea_surface_temperature&hourly=sea_level_height_msl&forecast_days=2&timezone=Europe%2FLisbon';
    var wu = 'https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lng +
      '&current=wind_speed_10m,wind_direction_10m,temperature_2m&wind_speed_unit=kmh&timezone=Europe%2FLisbon';
    return Promise.all([once(mu), once(wu)]).then(function (r) {
      var A = r[0] ? (Array.isArray(r[0]) ? r[0] : [r[0]]) : [], B = r[1] ? (Array.isArray(r[1]) ? r[1] : [r[1]]) : [], out = {};
      ids.forEach(function (id, i) {
        var m = A[i], a = m && m.current, b = B[i] && B[i].current; if (!a && !b) return;
        out[id] = { h: a ? num(a.wave_height) : null, t: a ? num(a.sea_surface_temperature) : null, tide: tideTrend(m),
                    ws: b ? num(b.wind_speed_10m) : null, wd: b ? num(b.wind_direction_10m) : null, air: b ? num(b.temperature_2m) : null,
                    at: ((a && a.time) || (b && b.time) || '').slice(11, 16) };
        if (out[id].ws == null && out[id].h == null) delete out[id];
      });
      return out;
    });
  }
  function get(spots) {
    var ids = (spots || []).map(function (s) { return typeof s === 'string' ? s : s.id; }), G = geo();
    if (!mem) { var c = sget(); mem = (c && Date.now() - c.ts < TTL) ? c : { ts: 0, d: {} }; }
    var need = ids.filter(function (id) { return !mem.d[id] && G[id]; });
    if (!need.length) return Promise.resolve(mem.d);
    if (inflight) return inflight.then(function () { return get(ids); });
    var jobs = []; for (var i = 0; i < need.length; i += 100) jobs.push(chunk(need.slice(i, i + 100), G));
    inflight = Promise.all(jobs).then(function (parts) {
      parts.forEach(function (o) { for (var k in o) mem.d[k] = o[k]; });
      if (!mem.ts) mem.ts = Date.now(); sset(mem); inflight = null; return mem.d;
    }, function () { inflight = null; return mem.d; });
    return inflight;
  }
  function rate(spot, c) {
    if (!c) return null;
    var tipo = spot.tipoKey, h = c.h, w = c.ws, s = 0, danger = false;
    if (tipo === 'rocha' || tipo === 'costeira') {
      if (h != null) { if (h <= 1.0) s += 2; else if (h <= 1.6) s += 1; else if (h > 2.2) { s -= 3; danger = true; } else s -= 1; }
      if (w != null) { if (w <= 15) s += 1; else if (w > 30) s -= 2; else if (w > 22) s -= 1; }
      return { k: danger ? 'poor' : (s >= 3 ? 'good' : (s >= 1 ? 'fair' : 'poor')), danger: danger };
    }
    if (tipo === 'embarcacao') {
      var hh = h == null ? 1 : h, ww = w == null ? 15 : w;
      return { k: (hh <= 1.2 && ww <= 20) ? 'good' : ((hh <= 2 && ww <= 30) ? 'fair' : 'poor'), danger: false };
    }
    if (w == null) return null; // ria / fluvial
    return { k: w <= 18 ? 'good' : (w <= 30 ? 'fair' : 'poor'), danger: false };
  }
  function f1(v, L) { return v.toFixed(1).replace('.', L.dec); }
  function label(k, lang, r) { var L = TXT[lang] || TXT.pt; return r && r.danger ? L.danger : (L[k] || k); }
  function line(c, lang, spot) {
    var L = TXT[lang] || TXT.pt, out = [], sheltered = spot && (spot.tipoKey === 'ria' || spot.tipoKey === 'fluvial');
    if (c.h != null && !sheltered) out.push(L.sea + ' ' + f1(c.h, L) + ' m');  // ria/rio: altura do mar aberto nao interessa
    if (c.ws != null) out.push(L.wind + ' ' + Math.round(c.ws) + ' km/h');
    if (c.t != null) out.push(L.water + ' ' + Math.round(c.t) + ' °C'); else if (c.air != null) out.push(L.air + ' ' + Math.round(c.air) + ' °C');
    if (c.tide) out.push(L[c.tide]);
    return out.join(' · ');
  }
  function moon(d, lang) { // fase da lua (algoritmo simples, erro < 1 dia)
    var L = TXT[lang] || TXT.pt, syn = 29.530588853, ref = Date.UTC(2000, 0, 6, 18, 14);
    var age = (((d.getTime() - ref) / 864e5) % syn + syn) % syn, frac = age / syn;
    var illum = Math.round((1 - Math.cos(2 * Math.PI * frac)) / 2 * 100);
    var idx = Math.floor((frac * 8) + 0.5) % 8;
    return { name: L.moon[idx], illum: illum, frac: frac };
  }
  window.PescaLive = { get: get, rate: rate, label: label, line: line, moon: moon };
})(window);
