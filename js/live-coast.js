/* LiveCoast — dados partilhados "a costa agora" — Portal Turismo Portugal — 2026-10-07
 * LiveCoast.beaches()      -> Promise<[{id,name,region,lat,lng,quality}]>  (Supabase REST, cache 1 h em sessionStorage)
 * LiveCoast.setBeaches(l)  -> usa a lista que a pagina ja carregou (evita 2.o pedido em /beaches)
 * LiveCoast.sea(points)    -> Promise<{id:{w,t,ts}}>  (Open-Meteo marine, 1 pedido por ate 120 pontos,
 *                             pedidos em curso partilhados, cache 30 min na MESMA chave do cartao v2: pth_bc2_live_v1)
 * LiveCoast.level(w)       -> 'calm' | 'moderate' | 'rough'
 * So dados; nunca escreve HTML. Falhas resolvem com o que houver (nunca rejeitam).
 */
(function (window) {
  'use strict';
  var SB_URL = 'https://glupdjvdvunogkqgxoui.supabase.co';
  var SB_KEY = 'sb_publishable_HKdE2IRmz9lMDcg4p3l1tw_HiTdD4nw'; /* chave publica (a mesma de js/config.js) */
  var KEY_SEA = 'pth_bc2_live_v1', KEY_B = 'pth_beaches_min_v1', TTL_SEA = 30 * 60 * 1000, TTL_B = 60 * 60 * 1000;
  var mem = null, inflight = [], beachesP = null;

  function sget(k) { try { return JSON.parse(sessionStorage.getItem(k) || 'null'); } catch (e) { return null; } }
  function sset(k, v) { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function cache() { if (!mem) mem = sget(KEY_SEA) || {}; return mem; }
  function num(v) { return (typeof v === 'number' && isFinite(v)) ? v : null; }
  function timed(url, opts, ms) {
    var c = window.AbortController ? new AbortController() : null, t = c ? setTimeout(function () { c.abort(); }, ms) : null;
    var o = opts || {}; if (c) o.signal = c.signal;
    return fetch(url, o).then(function (r) { if (t) clearTimeout(t); if (!r.ok) throw new Error(r.status); return r.json(); });
  }
  function norm(b) {
    var lat = parseFloat(b.latitude != null ? b.latitude : b.lat), lng = parseFloat(b.longitude != null ? b.longitude : b.lng);
    return { id: String(b.id), name: b.name || '', region: b.region || '', lat: lat, lng: lng, quality: b.water_quality || b.quality || '' };
  }

  function setBeaches(list) {
    var l = (list || []).map(norm).filter(function (b) { return isFinite(b.lat) && isFinite(b.lng); });
    beachesP = Promise.resolve(l);
    sset(KEY_B, { ts: Date.now(), list: l });
    return beachesP;
  }
  function beaches() {
    if (beachesP) return beachesP;
    var c = sget(KEY_B);
    if (c && c.list && Date.now() - c.ts < TTL_B) return (beachesP = Promise.resolve(c.list));
    var u = SB_URL + '/rest/v1/beaches?select=id,name,region,latitude,longitude,water_quality&is_active=eq.true&order=name';
    beachesP = timed(u, { headers: { apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY } }, 9000)
      .then(function (rows) { return setBeaches(rows); })
      .catch(function () { beachesP = null; return []; });
    return beachesP;
  }

  function fetchChunk(pts, retry) {
    var url = 'https://marine-api.open-meteo.com/v1/marine?latitude=' + pts.map(function (p) { return p.lat; }).join(',') +
      '&longitude=' + pts.map(function (p) { return p.lng; }).join(',') + '&current=wave_height,sea_surface_temperature&timezone=Europe%2FLisbon';
    return timed(url, null, retry ? 14000 : 8000).then(function (res) {
      var arr = Array.isArray(res) ? res : [res], c = cache(), now = Date.now();
      pts.forEach(function (p, i) {
        var cur = arr[i] && arr[i].current; if (!cur) return;
        c[p.id] = { w: num(cur.wave_height), t: num(cur.sea_surface_temperature), ts: now, at: (cur.time || '').slice(11, 16) };
      });
      sset(KEY_SEA, c);
    }).catch(function () { if (!retry) return new Promise(function (r) { setTimeout(r, 600); }).then(function () { return fetchChunk(pts, true); }); });
  }
  function sea(points) {
    var pts = (points || []).filter(function (p) { return p && p.id && isFinite(p.lat) && isFinite(p.lng); });
    var wait = inflight.slice();
    return Promise.all(wait).then(function () {
      var c = cache(), now = Date.now();
      var need = pts.filter(function (p) { var d = c[p.id]; return !d || now - d.ts > TTL_SEA; });
      var jobs = [];
      for (var i = 0; i < need.length; i += 120) jobs.push(fetchChunk(need.slice(i, i + 120)));
      var all = Promise.all(jobs);
      inflight.push(all);
      return all.then(function () {
        inflight.splice(inflight.indexOf(all), 1);
        var out = {}; pts.forEach(function (p) { if (c[p.id]) out[p.id] = c[p.id]; }); return out;
      });
    });
  }
  function level(w) { return w == null ? 'na' : (w <= 0.6 ? 'calm' : (w <= 1.2 ? 'moderate' : 'rough')); }

  window.LiveCoast = { beaches: beaches, setBeaches: setBeaches, sea: sea, level: level };
})(window);
