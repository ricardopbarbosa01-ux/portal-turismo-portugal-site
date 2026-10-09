/* /webcams e /en/webcams v2 — "Portugal ao vivo" — Portal Turismo Portugal — 2026-10-07
 * Dados: window.WebcamsCams (js/webcams-cams.js, gerado por _scripts/build_webcams_data.py).
 * - Camaras MEO Beachcam: SO LINK (abre beachcam.meo.pt num separador novo). Nunca incorporar.
 * - Diretos YouTube (cam.yt): o dono permite incorporar -> leitor youtube-nocookie so depois de clicar (fachada).
 * - Condicoes: Open-Meteo (marine + forecast), pedidos multi-ponto (<=90 por pedido), cache 30 min em sessionStorage.
 * - Painel da camara (dialogo): condicoes, proximas horas, mare, por do sol + planear (hoteis, atividades, carro, planeador).
 *   Ao voltar do separador da MEO, o painel dessa camara abre com "como esta o mar?" (momento de maior intencao).
 * - Tudo com createElement/textContent (sem HTML de dados). Movimento so decorativo; prefers-reduced-motion respeitado no CSS.
 */
(function (window, document) {
  'use strict';
  var DATA = window.WebcamsCams;
  if (!DATA || !DATA.cams) return;
  var CAMS = DATA.cams;
  var EN = (document.documentElement.lang || '').toLowerCase().indexOf('en') === 0;
  var L = EN ? 'en' : 'pt';
  var BY = {}; CAMS.forEach(function (c) { BY[c.id] = c; });

  /* ── Textos ─────────────────────────────────────────────────────────── */
  var T = EN ? {
    reg: { norte: 'North', centro: 'Centre', oeste: 'West coast', lisboa: 'Lisbon & Setúbal', alentejo: 'Alentejo', algarve: 'Algarve', madeira: 'Madeira', acores: 'Azores', rios: 'Rivers & lakes' },
    all: 'All', live: 'Live', meo: 'MEO', here: 'Watch here', liveOn: 'Live on MEO', open: 'Watch live', plan: 'Plan', more: 'Show more cameras',
    count: function (n) { return n + (n === 1 ? ' camera' : ' cameras'); }, none: 'No cameras match. Try another name or region.', reset: 'Show all',
    calm: 'Calm sea', mod: 'Moderate swell', rough: 'Rough sea', windy: 'Strong wind', nodata: 'No live data',
    sGood: 'Good for surf', sFair: 'Surfable', sSmall: 'Too small', sBig: 'Big — experts only', sWind: 'Wind is spoiling it', sPoor: 'Poor',
    wind: 'Wind', water: 'Water', air: 'Air', waves: 'Waves', period: 'Period', tide: 'Tide', rising: 'rising', falling: 'falling', tideEst: 'Model estimate (Open-Meteo), not the official tide table', tideIH: 'Official tide table (Instituto Hidrográfico) · reference port: ',
    photo: 'Photo', upd: 'Live · updated ', cams: 'cameras', loading: 'Reading the sea…', est: 'Estimate from Open-Meteo for this stretch of coast — always check on site and follow the flags.',
    beach: 'Beach', surf: 'Surf', best: 'Best right now', biggest: 'Biggest waves', sunset: 'Sunset in Lisbon', inMin: function (h, m) { return 'in ' + (h ? h + ' h ' : '') + m + ' min'; }, gone: 'tomorrow (already set today)',
    near: 'Near me', nearBusy: 'Finding you…', nearFail: 'Location not available', km: ' km away',
    sortTop: 'Featured', sortCalm: 'Calmest now', sortBig: 'Biggest waves', sortNear: 'Nearest',
    ytOnly: 'Watch on this page', islands: 'Madeira & Azores', islandsMeta: function (n) { return n + ' cameras · see list'; },
    pClose: 'Close', pNow: 'Right now', pNext: 'Next hours', pBest: 'Best time today', pSunset: 'Sunset', pAngles: 'Other angles',
    pPlan: 'Plan around ', pHotels: 'Hotels nearby', pHotelsS: 'Compare prices for tonight', doIn: 'Things to do in ', pDo: 'Things to do', pDoS: 'Tours & activities nearby', pCar: 'Hire a car', pCarS: 'Pick up at ', pTrip: 'Plan the trip', pTripS: 'Route, stay & budget in 60 s',
    pBeach: 'Beach guide', pShare: 'Share', pCopied: 'Link copied', pAsk: 'Missing a camera? Ask us',
    pSrcMeo: 'Camera by MEO Beachcam — opens on their site (free, may show ads). We are not MEO.', pSrcYt: function (by) { return 'YouTube live stream by ' + by + ', shown with the owner\'s embed permission.'; },
    pPlay: 'Play the live stream here', pYtBy: 'via YouTube · ', pNoLive: 'Live data unavailable right now.',
    back: function (t) { return 'So, how does ' + t + ' look?'; }, backGood: 'Looks good — I\'m going', backNo: 'Not today',
    backGoodMsg: 'Great. Everything for today is right here:', backNoMsg: 'Calmer options nearby right now:', backNoNone: 'Nothing calmer nearby right now — try another region.',
    nearPovoa: 'Closest camera to Póvoa de Varzim', min: 'min', h: 'h', now: 'Now', dirs: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'],
    from: 'from ', hi: 'High tide', lo: 'Low tide', at: ' at ', river: 'River / lake view — no sea data',
    fSent: 'Thank you! We read every message and reply by email.', fErr: 'It didn\'t go through. Please try again in a moment.', fCaptcha: 'Please complete the check above.', fMissing: 'Please fill in name, email and message.'
  } : {
    reg: { norte: 'Norte', centro: 'Centro', oeste: 'Oeste', lisboa: 'Lisboa e Setúbal', alentejo: 'Alentejo', algarve: 'Algarve', madeira: 'Madeira', acores: 'Açores', rios: 'Rios e lagos' },
    all: 'Todas', live: 'Direto', meo: 'MEO', here: 'Ver aqui', liveOn: 'Direto na MEO', open: 'Ver em direto', plan: 'Planear', more: 'Ver mais câmaras',
    count: function (n) { return n + (n === 1 ? ' câmara' : ' câmaras'); }, none: 'Nenhuma câmara encontrada. Tente outro nome ou região.', reset: 'Ver todas',
    calm: 'Mar calmo', mod: 'Ondulação moderada', rough: 'Mar agitado', windy: 'Vento forte', nodata: 'Sem dados ao vivo',
    sGood: 'Bom para surf', sFair: 'Dá para surfar', sSmall: 'Pequeno demais', sBig: 'Grande — só experientes', sWind: 'Vento a estragar', sPoor: 'Fraco',
    wind: 'Vento', water: 'Água', air: 'Ar', waves: 'Ondas', period: 'Período', tide: 'Maré', rising: 'a encher', falling: 'a vazar', tideEst: 'Estimativa de modelo (Open-Meteo), não é a tabela oficial', tideIH: 'Tabela oficial do Instituto Hidrográfico · porto de referência: ',
    photo: 'Foto', upd: 'Ao vivo · atualizado às ', cams: 'câmaras', loading: 'A ler o mar…', est: 'Estimativa Open-Meteo para esta zona da costa — confirme sempre no local e respeite as bandeiras.',
    beach: 'Praia', surf: 'Surf', best: 'Melhores agora', biggest: 'Maiores ondas', sunset: 'Pôr do sol em Lisboa', inMin: function (h, m) { return 'daqui a ' + (h ? h + ' h ' : '') + m + ' min'; }, gone: 'amanhã (hoje já foi)',
    near: 'Perto de mim', nearBusy: 'A localizar…', nearFail: 'Localização indisponível', km: ' km de si',
    sortTop: 'Em destaque', sortCalm: 'Mar mais calmo', sortBig: 'Maiores ondas', sortNear: 'Mais perto',
    ytOnly: 'Ver nesta página', islands: 'Madeira e Açores', islandsMeta: function (n) { return n + ' câmaras · ver lista'; },
    pClose: 'Fechar', pNow: 'Agora', pNext: 'Próximas horas', pBest: 'Melhor hora hoje', pSunset: 'Pôr do sol', pAngles: 'Outros ângulos',
    pPlan: 'Planear à volta de ', pHotels: 'Hotéis perto', pHotelsS: 'Compare preços para hoje', doIn: 'O que fazer em ', pDo: 'O que fazer', pDoS: 'Passeios e atividades perto', pCar: 'Alugar carro', pCarS: 'Levantar em ', pTrip: 'Planear a viagem', pTripS: 'Roteiro, alojamento e custo em 60 s',
    pBeach: 'Guia da praia', pShare: 'Partilhar', pCopied: 'Link copiado', pAsk: 'Falta uma câmara? Peça-nos',
    pSrcMeo: 'Câmara da MEO Beachcam — abre no site deles (grátis, pode ter publicidade). Não somos a MEO.', pSrcYt: function (by) { return 'Direto do YouTube publicado por ' + by + ', mostrado com a autorização de incorporação do dono.'; },
    pPlay: 'Ver o direto aqui', pYtBy: 'via YouTube · ', pNoLive: 'Dados ao vivo indisponíveis neste momento.',
    back: function (t) { return 'Então, como está o mar em ' + t + '?'; }, backGood: 'Parece bom — vou lá', backNo: 'Hoje não',
    backGoodMsg: 'Boa! Tem aqui tudo para hoje:', backNoMsg: 'Alternativas com mar mais calmo perto, agora:', backNoNone: 'Nada mais calmo por perto agora — experimente outra região.',
    nearPovoa: 'Câmara mais perto da Póvoa de Varzim', min: 'min', h: 'h', now: 'Agora', dirs: ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'],
    from: 'de ', hi: 'Preia-mar', lo: 'Baixa-mar', at: ' às ', river: 'Vista de rio / lago — sem dados de mar',
    fSent: 'Obrigado! Lemos todas as mensagens e respondemos por email.', fErr: 'Não foi possível enviar. Tente outra vez daqui a pouco.', fCaptcha: 'Complete a verificação acima.', fMissing: 'Preencha nome, email e mensagem.'
  };
  var REGIONS = ['norte', 'centro', 'oeste', 'lisboa', 'alentejo', 'algarve', 'madeira', 'acores', 'rios'];

  /* ── Utilitarios ────────────────────────────────────────────────────── */
  function h(tag, attrs, kids) {
    var e = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      var v = attrs[k]; if (v == null || v === false) continue;
      if (k === 'class') e.className = v; else if (k === 'text') e.textContent = v; else e.setAttribute(k, v === true ? '' : v);
    }
    if (kids) (Array.isArray(kids) ? kids : [kids]).forEach(function (c) { if (c == null) return; e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return e;
  }
  var NS = 'http://www.w3.org/2000/svg';
  function s(tag, attrs, parent) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
  var ICON = {
    ext: 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3',
    play: 'M8 5v14l11-7z',
    wind: 'M3 8h11a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h8',
    drop: 'M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z',
    temp: 'M14 14.76V5a2 2 0 0 0-4 0v9.76a4 4 0 1 0 4 0z',
    wave: 'M2 12c2-2 4-2 6 0s4 2 6 0 4-2 6 0M2 17c2-2 4-2 6 0s4 2 6 0 4-2 6 0',
    bed: 'M2 20V8M2 16h20v4M22 16v-4a3 3 0 0 0-3-3H10v7M6 12a2 2 0 1 0 0-.01',
    star: 'M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z',
    car: 'M5 17h14M6 17v2M18 17v2M3 13l2-6h14l2 6v4H3zM7 13h.01M17 13h.01',
    cal: 'M3 5h18v16H3zM16 3v4M8 3v4M3 10h18',
    pin: 'M12 22s7-7.75 7-13a7 7 0 0 0-14 0c0 5.25 7 13 7 13zM12 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
    x: 'M18 6L6 18M6 6l12 12',
    share: 'M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7M16 6l-4-4-4 4M12 2v13',
    sun: 'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4',
    arrow: 'M5 12h14M13 5l7 7-7 7',
    book: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5v14zM4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5',
    msg: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
    search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.35-4.35',
    loc: 'M12 2v3M12 19v3M2 12h3M19 12h3M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z'
  };
  function ico(name, cls) { var v = s('svg', { viewBox: '0 0 24 24', 'aria-hidden': 'true', class: cls || 'wi' }); s('path', { d: ICON[name] }, v); return v; }
  function track(action, extra) {
    var p = { action: action, page_path: location.pathname }; if (extra) for (var k in extra) p[k] = extra[k];
    try { if (typeof window.track === 'function') window.track('webcam_action', p); else if (window.gtag) window.gtag('event', 'webcam_action', p); } catch (e) {}
  }
  function norm(x) { return String(x || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim(); }
  function fmt1(n) { return n == null || isNaN(n) ? '—' : (Math.round(n * 10) / 10).toLocaleString(EN ? 'en-GB' : 'pt-PT', { minimumFractionDigits: 1, maximumFractionDigits: 1 }); }
  function fmt0(n) { return n == null || isNaN(n) ? '—' : String(Math.round(n)); }
  function dirName(deg) { return deg == null ? '' : T.dirs[Math.round(((deg % 360) + 360) % 360 / 45) % 8]; }
  function hm(d) { return d.toLocaleTimeString(EN ? 'en-GB' : 'pt-PT', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Lisbon' }); }
  function dist(a, b, c, d) { var p = Math.PI / 180, x = (d - b) * p * Math.cos((a + c) / 2 * p), y = (c - a) * p; return 6371 * Math.sqrt(x * x + y * y); }
  function place(c) { return c.p || T.reg[c.r] || ''; }
  function placeShort(c) { return (c.p || c.t).replace(/,.*$/, ''); }
  function meoUrl(slug) { return 'https://beachcam.meo.pt/livecams/' + slug + '/'; }
  var PREFIX = EN ? '/en' : '';

  /* ── Avaliacao (estimativa) ─────────────────────────────────────────── */
  var MODE = 'praia';
  try { var sv = localStorage.getItem('pth_wcam_mode'); if (sv === 'surf' || sv === 'praia') MODE = sv; } catch (e) {}
  // devolve {k: calm|mod|rough|na, label}
  function rateBeach(c) {
    if (!c || c.wh == null) return null;
    var w = c.ws || 0, hs = c.wh;
    if (hs >= 1.6) return { k: 'rough', label: T.rough, sc: 3 + hs };
    if (w >= 30) return { k: 'mod', label: T.windy, sc: 2 + w / 40 };
    if (hs < 0.8 && w < 20) return { k: 'calm', label: T.calm, sc: hs + w / 40 };
    return { k: 'mod', label: T.mod, sc: 1 + hs + w / 40 };
  }
  function rateSurf(c) {
    if (!c || c.wh == null) return null;
    var hs = c.wh, p = c.wp || 0, w = c.ws || 0;
    if (hs < 0.5) return { k: 'na', label: T.sSmall, sc: 0 };
    if (hs > 3.2) return { k: 'rough', label: T.sBig, sc: 1 };
    if (w >= 25) return { k: 'rough', label: T.sWind, sc: 1.5 };
    var q = Math.min(hs, 2.2) * 1.2 + Math.min(p, 14) / 6 - w / 18;
    if (hs >= 0.9 && p >= 9 && w < 20) return { k: 'calm', label: T.sGood, sc: 5 + q };
    if (q > 1.6) return { k: 'mod', label: T.sFair, sc: 3 + q };
    return { k: 'rough', label: T.sPoor, sc: 2 + q };
  }
  function rate(c) { return MODE === 'surf' ? rateSurf(c) : rateBeach(c); }

  /* ── Dados ao vivo (Open-Meteo) ─────────────────────────────────────── */
  var LIVE = null, LIVE_AT = null, LIVE_FAIL = false, KEY = 'pth_wcam_live_v1';
  function chunk(a, n) { var r = []; for (var i = 0; i < a.length; i += n) r.push(a.slice(i, i + n)); return r; }
  function getJSON(url) { return fetch(url, { credentials: 'omit' }).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }); }
  function loadLive() {
    try {
      var c = JSON.parse(sessionStorage.getItem(KEY) || 'null');
      if (c && Date.now() - c.t < 30 * 60 * 1000 && c.d) { LIVE = c.d; LIVE_AT = new Date(c.t); return Promise.resolve(LIVE); }
    } catch (e) {}
    var sea = CAMS.filter(function (c) { return c.k === 'mar'; }), all = CAMS;
    // Lote A2 09/10: com js/om-pool.js os pontos na mesma celula do modelo sao pedidos uma so vez (cache partilhada com
    // /beaches, /surf e /pesca). So guarda em sessionStorage quando ha dados de mar (antes: falha do mar = 30 min 'sem dados', W04).
    if (window.PTHOpenMeteo) {
      var pts = function (l) { return l.map(function (c) { return { id: c.id, lat: c.lat, lng: c.lng }; }); };
      return Promise.all([window.PTHOpenMeteo.marine(pts(sea)), window.PTHOpenMeteo.weather(pts(all))]).then(function (r) {
        var d = {}, nSea = 0, any = false;
        all.forEach(function (c) {
          var m = r[0][c.id] && r[0][c.id].c, f = r[1][c.id] && r[1][c.id].c, o = {};
          if (m) { o.wh = m.wave_height; o.wp = m.wave_period; o.wd = m.wave_direction; o.sst = m.sea_surface_temperature; if (o.wh != null) { nSea++; any = true; } }
          if (f) { o.ta = f.temperature_2m; o.ws = f.wind_speed_10m; o.wdir = f.wind_direction_10m; any = true; }
          if (m || f) d[c.id] = o;
        });
        if (!any) throw new Error('no live data');
        LIVE = d; LIVE_AT = new Date();
        if (nSea >= sea.length * 0.8) { try { sessionStorage.setItem(KEY, JSON.stringify({ t: Date.now(), d: d })); } catch (e) {} }
        return d;
      });
    }
    var reqs = [];
    chunk(sea, 90).forEach(function (g) {
      reqs.push(getJSON('https://marine-api.open-meteo.com/v1/marine?latitude=' + g.map(function (c) { return c.lat; }).join(',') + '&longitude=' + g.map(function (c) { return c.lng; }).join(',') +
        '&current=wave_height,wave_period,wave_direction,sea_surface_temperature').then(function (j) { return { kind: 'm', g: g, j: Array.isArray(j) ? j : [j] }; }));
    });
    chunk(all, 90).forEach(function (g) {
      reqs.push(getJSON('https://api.open-meteo.com/v1/forecast?latitude=' + g.map(function (c) { return c.lat; }).join(',') + '&longitude=' + g.map(function (c) { return c.lng; }).join(',') +
        '&current=temperature_2m,wind_speed_10m,wind_direction_10m&wind_speed_unit=kmh').then(function (j) { return { kind: 'f', g: g, j: Array.isArray(j) ? j : [j] }; }));
    });
    return Promise.all(reqs.map(function (p) { return p.catch(function () { return null; }); })).then(function (res) {
      var d = {}, any = false;
      res.forEach(function (r) {
        if (!r) return;
        r.g.forEach(function (c, i) {
          var cur = r.j[i] && r.j[i].current; if (!cur) return;
          var o = d[c.id] || (d[c.id] = {});
          if (r.kind === 'm') { o.wh = cur.wave_height; o.wp = cur.wave_period; o.wd = cur.wave_direction; o.sst = cur.sea_surface_temperature; if (o.wh != null) any = true; }
          else { o.ta = cur.temperature_2m; o.ws = cur.wind_speed_10m; o.wdir = cur.wind_direction_10m; any = true; }
        });
      });
      if (!any) throw new Error('no live data');
      LIVE = d; LIVE_AT = new Date();
      try { sessionStorage.setItem(KEY, JSON.stringify({ t: Date.now(), d: d })); } catch (e) {}
      return d;
    });
  }

  /* ── Por do sol (NOAA simplificado) ─────────────────────────────────── */
  function sunset(date, lat, lng) {
    var rad = Math.PI / 180, day = Math.floor((Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) - Date.UTC(date.getUTCFullYear(), 0, 0)) / 864e5);
    var g = 2 * Math.PI / 365 * (day - 1);
    var eq = 229.18 * (0.000075 + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g) - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g));
    var decl = 0.006918 - 0.399912 * Math.cos(g) + 0.070257 * Math.sin(g) - 0.006758 * Math.cos(2 * g) + 0.000907 * Math.sin(2 * g) - 0.002697 * Math.cos(3 * g) + 0.00148 * Math.sin(3 * g);
    var ha = Math.acos(Math.cos(90.833 * rad) / (Math.cos(lat * rad) * Math.cos(decl)) - Math.tan(lat * rad) * Math.tan(decl)) / rad;
    var min = 720 - 4 * (lng - ha) - eq; // UTC minutos
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) + min * 60000);
  }

  /* ── Estado da lista ────────────────────────────────────────────────── */
  var ST = { q: '', r: '', yt: false, sort: 'top', shown: 18, me: null };
  var PAGE = window.matchMedia && window.matchMedia('(max-width: 640px)').matches ? 8 : 18;
  function matches(c, q) {
    if (!q) return true;
    var hay = c._h || (c._h = norm(c.t + ' ' + c.p + ' ' + (c.al || '') + ' ' + T.reg[c.r] + ' ' + (c.yt ? 'youtube' : '')));
    return q.split(' ').every(function (w) { return hay.indexOf(w) >= 0; });
  }
  function relevance(c, q) {
    var t = norm(c.t), p = norm(c.p), a = norm(c.al || ''), sc = 0;
    if (p === q || t === q) sc += 6;
    if (t.indexOf(q) === 0 || p.indexOf(q) === 0) sc += 3;
    if ((' ' + a + ' ').indexOf(' ' + q) >= 0) sc += 2;
    if (c.yt) sc += 0.5;
    return sc;
  }
  function rank(q) { return CAMS.filter(function (c) { return matches(c, q); }).sort(function (a, b) { return relevance(b, q) - relevance(a, q) || b.pop - a.pop; }); }
  function filtered() {
    var q = norm(ST.q);
    var list = CAMS.filter(function (c) { return (!ST.r || c.r === ST.r) && (!ST.yt || c.yt) && matches(c, q); });
    var sc = function (c) { var r = rate(LIVE && LIVE[c.id]); return r ? r.sc : 99; };
    if (ST.sort === 'calm' && LIVE) list.sort(function (a, b) { return (MODE === 'surf' ? sc(b) - sc(a) : sc(a) - sc(b)) || b.pop - a.pop; });
    else if (ST.sort === 'big' && LIVE) list.sort(function (a, b) { var x = LIVE[a.id] || {}, y = LIVE[b.id] || {}; return (y.wh || -1) - (x.wh || -1); });
    else if (ST.sort === 'near' && ST.me) list.sort(function (a, b) { return dist(ST.me[0], ST.me[1], a.lat, a.lng) - dist(ST.me[0], ST.me[1], b.lat, b.lng); });
    else if (q) list.sort(function (a, b) { return relevance(b, q) - relevance(a, q) || b.pop - a.pop; });
    else list.sort(function (a, b) { return b.pop - a.pop; });
    return list;
  }

  /* ── Cartao ─────────────────────────────────────────────────────────── */
  function media(c, size, eager) {
    var box = h('span', { class: 'wm' + (c.ph || c.yt ? '' : ' wm--sea') + ' wm--' + c.r });
    if (c.yt) { // fotograma recente do proprio direto (YouTube)
      box.appendChild(h('img', { class: 'wm__yt', src: 'https://i.ytimg.com/vi/' + c.yt[0] + '/hqdefault_live.jpg', alt: '', loading: eager ? 'eager' : 'lazy', decoding: 'async', width: '480', height: '360' }));
    } else if (c.ph) {
      box.appendChild(h('img', { src: c.ph[0] + '-480.webp', srcset: c.ph[0] + '-480.webp 480w, ' + c.ph[0] + '-800.webp 800w', sizes: size || '(max-width: 640px) 100vw, 400px',
        alt: '', loading: eager ? 'eager' : 'lazy', decoding: 'async', width: '480', height: '300' }));
    } else {
      var v = s('svg', { class: 'wm__waves', viewBox: '0 0 400 250', preserveAspectRatio: 'none', 'aria-hidden': 'true' });
      for (var i = 0; i < 4; i++) {
        var y = 120 + i * 32;
        s('path', { d: 'M-400 ' + y + ' C-300 ' + (y - 14) + ' -300 ' + (y - 14) + ' -200 ' + y + ' S-100 ' + (y + 14) + ' 0 ' + y + ' C100 ' + (y - 14) + ' 100 ' + (y - 14) + ' 200 ' + y + ' S300 ' + (y + 14) + ' 400 ' + y + ' C500 ' + (y - 14) + ' 500 ' + (y - 14) + ' 600 ' + y + ' S700 ' + (y + 14) + ' 800 ' + y + ' L800 260 L-400 260 Z', style: '--d:' + (14 + i * 5) + 's' }, v);
      }
      box.appendChild(v);
      box.appendChild(h('span', { class: 'wm__mono', 'aria-hidden': 'true', text: c.t.split(' · ')[0] }));
    }
    var top = h('span', { class: 'wm__top' }, [
      h('span', { class: 'wm__live' }, [h('i'), T.live]),
      c.yt ? h('span', { class: 'wm__src wm__src--yt' }, [ico('play'), T.here]) : h('span', { class: 'wm__src' }, ['MEO', ico('ext')])
    ]);
    box.appendChild(top);
    var bot = h('span', { class: 'wm__data', 'data-live': c.id });
    box.appendChild(bot);
    return box;
  }
  function fillMediaData(el, c) {
    var d = LIVE && LIVE[c.id]; el.textContent = '';
    if (!d) return;
    if (d.wh != null) el.appendChild(h('span', { class: 'wm__wave' }, [h('b', { text: fmt1(d.wh) }), ' m', d.wp != null ? h('small', { text: ' · ' + fmt0(d.wp) + ' s' }) : null]));
    if (d.sst != null) el.appendChild(h('span', { class: 'wm__sst' }, [ico('drop'), fmt0(d.sst) + '°']));
    else if (d.ta != null) el.appendChild(h('span', { class: 'wm__sst' }, [ico('temp'), fmt0(d.ta) + '°']));
  }
  function verdictEl(c, cls) {
    var d = LIVE && LIVE[c.id], r = c.k === 'rio' ? null : rate(d);
    var e = h('p', { class: cls || 'wc__v', 'data-k': r ? r.k : 'na' });
    if (c.k === 'rio') { e.appendChild(h('i')); e.appendChild(h('span', { text: T.river })); return e; }
    if (!LIVE) { e.appendChild(h('i')); e.appendChild(h('span', { class: 'wc__skel', text: T.loading })); return e; }
    if (!r) { e.appendChild(h('i')); e.appendChild(h('span', { text: T.nodata })); return e; }
    e.appendChild(h('i')); e.appendChild(h('b', { text: r.label }));
    if (d.ws != null) e.appendChild(h('span', { text: ' · ' + T.wind.toLowerCase() + ' ' + fmt0(d.ws) + ' km/h ' + dirName(d.wdir) }));
    return e;
  }
  function card(c, i) {
    var a = h('article', { class: 'wc', id: 'cam-' + c.id, 'data-id': c.id, role: 'listitem', style: '--i:' + (i % PAGE) });
    var btn = h('button', { type: 'button', class: 'wc__media', 'data-open': c.id, 'aria-label': (EN ? 'Conditions and details — ' : 'Condições e detalhes — ') + c.t });
    btn.appendChild(media(c, null, i < 3));
    a.appendChild(btn);
    var body = h('div', { class: 'wc__body' });
    body.appendChild(h('h3', { class: 'wc__t' }, [h('button', { type: 'button', 'data-open': c.id, text: c.t })]));
    var sub = [place(c)];
    if (c.p && T.reg[c.r] && c.p.indexOf(T.reg[c.r]) < 0) sub.push(T.reg[c.r]);
    var meta = h('p', { class: 'wc__p', text: sub.join(' · ') });
    if (ST.me) meta.appendChild(h('span', { class: 'wc__km', text: ' · ' + fmt0(dist(ST.me[0], ST.me[1], c.lat, c.lng)) + T.km }));
    body.appendChild(meta);
    if (c.near) body.appendChild(h('p', { class: 'wc__near', text: c.near[L] }));
    body.appendChild(verdictEl(c));
    var cta = h('div', { class: 'wc__cta' });
    if (c.yt) cta.appendChild(h('button', { type: 'button', class: 'wc__go', 'data-open': c.id, 'data-play': '1' }, [ico('play'), T.here]));
    else cta.appendChild(h('a', { class: 'wc__go', href: meoUrl(c.meo), target: '_blank', rel: 'noopener', 'data-golive': c.id }, [T.open, ico('ext')]));
    cta.appendChild(h('button', { type: 'button', class: 'wc__more', 'data-open': c.id, 'data-focus': 'plan' }, [ico('cal'), T.plan]));
    body.appendChild(cta);
    // Lote H2 09/10: atividades GetYourGuide desta praia em cada cartao (antes so um link generico 'passeio de barco Portugal')
    var whereDo = placeShort(c);
    body.appendChild(h('a', { class: 'wc__do', href: 'https://www.getyourguide.com/s/?q=' + encodeURIComponent(whereDo + (c.r === 'madeira' && whereDo !== 'Madeira' ? ' Madeira' : c.r === 'acores' ? ' Azores' : '') + ' Portugal') + '&partner_id=0WTBHZE&cmp=wcard-' + encodeURIComponent(c.id.slice(0, 40)) + '&locale_autoredirect_optout=true',
      target: '_blank', rel: 'noopener noreferrer sponsored', 'data-gyg-card': c.id }, [ico('star'), T.doIn + whereDo, h('span', { 'aria-hidden': 'true', text: ' →' })]));
    if (c.yt) body.appendChild(h('p', { class: 'wc__cr', text: (EN ? 'Live frame: ' : 'Imagem do direto: ') + c.yt[1] }));
    else if (c.ph) body.appendChild(h('p', { class: 'wc__cr', text: T.photo + ': ' + c.ph[1] }));
    a.appendChild(body);
    fillMediaData(btn.querySelector('.wm__data'), c);
    return a;
  }

  /* ── Lista ──────────────────────────────────────────────────────────── */
  var grid = document.getElementById('wc-grid'), countEl = document.getElementById('wc-count'), moreBtn = document.getElementById('wc-more');
  function render(keep) {
    if (!grid) return;
    var list = filtered();
    if (!keep) ST.shown = PAGE;
    grid.textContent = '';
    if (!list.length) {
      grid.appendChild(h('div', { class: 'wc-empty', role: 'status' }, [h('p', { text: T.none }), h('button', { type: 'button', class: 'wf__chip', 'data-reset': '1', text: T.reset })]));
    }
    var frag = document.createDocumentFragment();
    list.slice(0, ST.shown).forEach(function (c, i) { frag.appendChild(card(c, i)); });
    grid.appendChild(frag);
    if (countEl) countEl.textContent = T.count(list.length);
    if (moreBtn) {
      var rest = list.length - ST.shown;
      moreBtn.hidden = rest <= 0;
      moreBtn.textContent = T.more + ' (' + rest + ')';
    }
  }
  function refreshLiveBits() {
    document.querySelectorAll('.wc').forEach(function (a) {
      var c = BY[a.getAttribute('data-id')]; if (!c) return;
      var d = a.querySelector('.wm__data'); if (d) fillMediaData(d, c);
      var v = a.querySelector('.wc__v'); if (v) v.replaceWith(verdictEl(c));
    });
  }

  /* ── Filtros ────────────────────────────────────────────────────────── */
  function buildFilters() {
    var bar = document.getElementById('wf-regions'); if (!bar) return;
    var counts = {}; CAMS.forEach(function (c) { counts[c.r] = (counts[c.r] || 0) + 1; });
    var mk = function (key, label, n) { var b = h('button', { type: 'button', class: 'wf__chip', 'data-region': key, 'aria-pressed': key === ST.r ? 'true' : 'false' }, [label, h('small', { text: String(n) })]); return b; };
    bar.appendChild(mk('', T.all, CAMS.length));
    REGIONS.forEach(function (k) { if (counts[k]) bar.appendChild(mk(k, T.reg[k], counts[k])); });
    var ytn = CAMS.filter(function (c) { return c.yt; }).length;
    var yt = document.getElementById('wf-yt'); if (yt) { yt.appendChild(document.createTextNode(' ')); yt.appendChild(h('small', { text: String(ytn) })); }
  }
  function setRegion(r, scroll) {
    ST.r = r;
    document.querySelectorAll('#wf-regions .wf__chip').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-region') === r ? 'true' : 'false'); });
    render();
    if (scroll) { var t = document.getElementById('cams'); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  }
  function setQuery(q, from) {
    ST.q = q;
    document.querySelectorAll('[data-wsearch]').forEach(function (i) { if (i !== from) i.value = q; });
    render();
  }

  /* ── Pesquisa com sugestoes (hero) ──────────────────────────────────── */
  function initSuggest(input) {
    var list = document.getElementById(input.getAttribute('aria-controls')); if (!list) return;
    var act = -1, items = [];
    function close() { list.hidden = true; input.setAttribute('aria-expanded', 'false'); act = -1; input.removeAttribute('aria-activedescendant'); }
    function open(q) {
      var nq = norm(q); list.textContent = ''; items = [];
      if (!nq) { close(); return; }
      items = rank(nq).slice(0, 6);
      if (!items.length) { list.appendChild(h('li', { class: 'ws__none', role: 'option', 'aria-disabled': 'true', text: T.none })); }
      items.forEach(function (c, i) {
        var d = LIVE && LIVE[c.id], r = c.k === 'rio' ? null : rate(d);
        var li = h('li', { id: input.id + '-o' + i, role: 'option', 'data-open': c.id, class: 'ws__opt', 'data-k': r ? r.k : 'na' }, [
          h('span', { class: 'ws__dot' }), h('span', { class: 'ws__n' }, [h('b', { text: c.t }), h('small', { text: place(c) + (c.yt ? ' · ' + T.here : '') })]),
          h('span', { class: 'ws__m', text: d && d.wh != null ? fmt1(d.wh) + ' m' : '' })
        ]);
        list.appendChild(li);
      });
      list.hidden = false; input.setAttribute('aria-expanded', 'true');
    }
    input.addEventListener('input', function () { open(input.value); setQuery(input.value, input); });
    input.addEventListener('focus', function () { if (input.value) open(input.value); });
    input.addEventListener('keydown', function (e) {
      var opts = list.querySelectorAll('.ws__opt');
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        if (!opts.length) return; e.preventDefault();
        act = (act + (e.key === 'ArrowDown' ? 1 : -1) + opts.length) % opts.length;
        opts.forEach(function (o, i) { o.classList.toggle('is-act', i === act); });
        input.setAttribute('aria-activedescendant', opts[act].id);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        var pick = opts[act >= 0 ? act : 0];
        if (pick) { close(); openPanel(pick.getAttribute('data-open')); track('search_pick', { cam: pick.getAttribute('data-open'), q: input.value.slice(0, 40) }); }
        else { var t = document.getElementById('cams'); if (t) t.scrollIntoView({ behavior: 'smooth' }); }
      } else if (e.key === 'Escape') close();
    });
    document.addEventListener('click', function (e) { if (!list.contains(e.target) && e.target !== input) close(); });
    list.addEventListener('mousedown', function (e) { e.preventDefault(); });
    list.addEventListener('click', function (e) { var li = e.target.closest('[data-open]'); if (li) { close(); track('search_pick', { cam: li.getAttribute('data-open'), q: input.value.slice(0, 40) }); } });
  }

  /* ── Hero: ecra em direto + canais + fita de condicoes ─────────────── */
  // A imagem grande e o fotograma recente do direto do YouTube (i.ytimg.com, *_live.jpg). "Ver em video" troca-a pelo leitor.
  var hero = document.querySelector('.wv');
  var CH = CAMS.filter(function (c) { return c.yt; });
  var CH_ORDER = ['praia-do-norte-canhao-nazare', 'yt-porto-ribeira', 'yt-caparica-arriba', 'yt-caparica-infante', 'praia-do-meco', 'praia-da-rocha-marina', 'yt-funchal-formosa', 'yt-funchal-baia', 'yt-funchal-barreirinha', 'yt-funchal-marina', 'yt-canico-reis-magos', 'yt-ponta-do-sol', 'yt-porto-moniz'];
  CH.sort(function (a, b) { var x = CH_ORDER.indexOf(a.id), y = CH_ORDER.indexOf(b.id); return (x < 0 ? 99 : x) - (y < 0 ? 99 : y); });
  var onAir = null, playing = false, frameTimer = null;
  var NO_MAX = { 'lfrjNVD10RU': 1 }; // sem fotograma 1280 (07/10): usar o de 480
  function ytImg(id, size) { return 'https://i.ytimg.com/vi/' + id + '/' + size + '_live.jpg'; }
  function setFrame(img, c, bust) {
    var q = bust ? '?t=' + Math.floor(Date.now() / 60000) : '';
    img.onload = function () { if (img.naturalWidth <= 120 && img.src.indexOf('maxres') >= 0) img.src = ytImg(c.yt[0], 'hqdefault') + q; else img.classList.add('is-ready'); };
    img.onerror = function () { img.classList.remove('is-ready'); };
    img.src = ytImg(c.yt[0], NO_MAX[c.yt[0]] ? 'hqdefault' : 'maxresdefault') + q;
  }
  function tune(id, user) {
    if (!hero) return;
    var c = BY[id]; if (!c || !c.yt) return;
    var prev = onAir; onAir = c;
    var a = hero.querySelector('[data-wv="frame-a"]'), b = hero.querySelector('[data-wv="frame-b"]');
    var on = a.classList.contains('is-on') ? a : b, off = on === a ? b : a;
    if (prev && prev.id !== c.id) {
      off.classList.remove('is-ready');
      setFrame(off, c, true);
      off.classList.add('is-on'); on.classList.remove('is-on');
    } else if (!prev && !on.getAttribute('src')) setFrame(on, c, false);
    else if (!prev) { on.onload = null; on.classList.add('is-ready'); }
    var nm = hero.querySelector('[data-wv="now-name"]'); if (nm) nm.textContent = c.t + ' · ' + placeShort(c);
    var cr = hero.querySelector('[data-wv="credit"]'); if (cr) cr.textContent = (EN ? 'Recent frame from the live stream by ' : 'Imagem recente do direto de ') + c.yt[1] + (EN ? ', via YouTube' : ', via YouTube');
    hero.querySelectorAll('[data-ch]').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-ch') === c.id ? 'true' : 'false'); });
    var det = hero.querySelector('[data-wv="details"]'); if (det) det.setAttribute('data-open', c.id);
    if (playing) play(true);
    nowLine();
    if (user) track('channel', { cam: c.id });
  }
  function play(silent) {
    if (!hero || !onAir) return;
    var box = hero.querySelector('[data-wv="video"]'); if (!box) return;
    box.textContent = '';
    box.appendChild(h('iframe', { src: 'https://www.youtube-nocookie.com/embed/' + onAir.yt[0] + '?autoplay=1&mute=1&playsinline=1&rel=0', title: onAir.t + ' — YouTube', allow: 'autoplay; encrypted-media; picture-in-picture; fullscreen', allowfullscreen: true, referrerpolicy: 'strict-origin-when-cross-origin' }));
    box.hidden = false; playing = true; hero.classList.add('is-playing');
    var pb = hero.querySelector('[data-wv="play"]'); if (pb) { pb.setAttribute('aria-pressed', 'true'); pb.lastChild.textContent = EN ? 'Back to picture' : 'Voltar à imagem'; }
    if (!silent) track('yt_play', { cam: onAir.id, where: 'hero' });
  }
  function stop() {
    var box = hero && hero.querySelector('[data-wv="video"]'); if (!box) return;
    box.textContent = ''; box.hidden = true; playing = false; hero.classList.remove('is-playing');
    var pb = hero.querySelector('[data-wv="play"]'); if (pb) { pb.setAttribute('aria-pressed', 'false'); pb.lastChild.textContent = EN ? 'Watch the video' : 'Ver em vídeo'; }
  }
  function buildChannels() {
    var ol = hero && hero.querySelector('[data-wv="channels"]'); if (!ol) return;
    CH.forEach(function (c) {
      var b = h('button', { type: 'button', class: 'wv__chb', 'data-ch': c.id, 'aria-pressed': 'false', 'aria-label': (EN ? 'Show ' : 'Mostrar ') + c.t + ', ' + place(c) }, [
        h('span', { class: 'wv__chimg' }, [h('img', { src: ytImg(c.yt[0], 'mqdefault'), alt: '', loading: 'lazy', decoding: 'async', width: '320', height: '180' }), h('i', { class: 'wv__chdot' })]),
        h('span', { class: 'wv__cht' }, [h('b', { text: c.t }), h('small', { 'data-chm': c.id, text: placeShort(c) })])
      ]);
      ol.appendChild(h('li', {}, b));
    });
    var meoN = CAMS.filter(function (c) { return c.meo; }).length;
    ol.appendChild(h('li', {}, h('a', { class: 'wv__chmore', href: '#cams' }, [h('b', { text: '+' + meoN }), h('span', { text: EN ? 'more cameras on MEO' : 'câmaras na MEO' })])));
  }
  function refreshChannelThumbs() {
    if (!hero || document.visibilityState !== 'visible') return;
    var q = '?t=' + Math.floor(Date.now() / 60000);
    hero.querySelectorAll('.wv__chb img').forEach(function (img) { var id = img.closest('[data-ch]').getAttribute('data-ch'), c = BY[id]; if (c) img.src = ytImg(c.yt[0], 'mqdefault') + q; });
    if (onAir && !playing) { var on = hero.querySelector('.wv__frame.is-on'); if (on) setFrame(on, onAir, true); }
  }
  function nowLine() {
    if (!hero || !onAir) return;
    var el = hero.querySelector('[data-wv="now-data"]'); if (!el) return;
    var d = LIVE && LIVE[onAir.id], r = onAir.k === 'rio' ? null : rate(d);
    el.textContent = '';
    if (!d) return;
    if (d.wh != null && onAir.k !== 'rio') el.appendChild(h('span', { text: fmt1(d.wh) + ' m' }));
    if (d.ws != null) el.appendChild(h('span', { text: T.wind.toLowerCase() + ' ' + fmt0(d.ws) + ' km/h' }));
    if (d.sst != null) el.appendChild(h('span', { text: T.water.toLowerCase() + ' ' + fmt0(d.sst) + ' °C' }));
    else if (d.ta != null) el.appendChild(h('span', { text: fmt0(d.ta) + ' °C' }));
    if (r) el.setAttribute('data-k', r.k);
  }
  function clock() {
    var el = hero && hero.querySelector('[data-wv="clock"]'); if (!el) return;
    var tick = function () { el.textContent = new Date().toLocaleTimeString(EN ? 'en-GB' : 'pt-PT', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Europe/Lisbon' }); };
    tick(); setInterval(tick, 1000);
  }
  function heroPicks() {
    if (!hero) return;
    var box = hero.querySelector('[data-wv="picks"]'), lab = hero.querySelector('[data-wv="picks-k"]'); if (!box) return;
    if (lab) lab.textContent = MODE === 'surf' ? (EN ? 'Good for surf right now:' : 'Bom para surf agora:') : (EN ? 'Calm sea right now:' : 'Mar calmo agora:');
    box.textContent = '';
    if (!LIVE) { box.appendChild(h('li', { class: 'wv__none', text: LIVE_FAIL ? T.nodata : T.loading })); return; }
    var top = CAMS.filter(function (c) { return c.k === 'mar' && c.pop >= 150; }).map(function (c) { return { c: c, r: rate(LIVE[c.id]) }; }).filter(function (x) { return x.r && x.r.k === 'calm'; });
    top.sort(function (a, b) { return MODE === 'surf' ? (b.r.sc - a.r.sc || b.c.pop - a.c.pop) : b.c.pop - a.c.pop; });
    if (!top.length) { box.appendChild(h('li', { class: 'wv__none', text: MODE === 'surf' ? (EN ? 'No spot looks good right now.' : 'Nenhum spot está bom agora.') : (EN ? 'No calm sea at the busiest beaches right now.' : 'Sem mar calmo nas praias mais vistas agora.') })); return; }
    top.slice(0, 4).forEach(function (x) {
      box.appendChild(h('li', {}, h('button', { type: 'button', class: 'wv__pick', 'data-open': x.c.id }, [h('i'), x.c.t, h('small', { text: fmt1(LIVE[x.c.id].wh) + ' m' })])));
    });
  }
  function ticker() {
    var el = hero && hero.querySelector('[data-wv="ticker"]'); if (!el || !LIVE) return;
    var items = CAMS.filter(function (c) { return c.k === 'mar' && LIVE[c.id] && LIVE[c.id].wh != null; }).sort(function (a, b) { return b.pop - a.pop; }).slice(0, 60);
    var row = function () {
      var f = h('span', { class: 'wv__row' });
      items.forEach(function (c) { var r = rate(LIVE[c.id]); f.appendChild(h('span', { class: 'wv__ti', 'data-k': r ? r.k : 'na' }, [h('i'), c.t, h('b', { text: fmt1(LIVE[c.id].wh) + ' m' })])); });
      return f;
    };
    el.textContent = ''; el.appendChild(row()); el.appendChild(row());
    el.style.setProperty('--dur', Math.max(40, items.length * 2.2) + 's');
    var wrap = el.parentNode; if (wrap) wrap.hidden = false;
  }
  function heroSunset() {
    var el = hero && hero.querySelector('[data-wv="sunset"]'); if (!el) return;
    var now = new Date(), set = sunset(now, 38.72, -9.14);
    if (set > now) { var m = Math.round((set - now) / 60000); el.textContent = (EN ? 'Sunset in Lisbon ' : 'Pôr do sol em Lisboa às ') + hm(set) + ' (' + T.inMin(Math.floor(m / 60), m % 60) + ')'; }
    else el.textContent = (EN ? 'Sunset in Lisbon tomorrow ' : 'Pôr do sol em Lisboa amanhã às ') + hm(sunset(new Date(now.getTime() + 864e5), 38.72, -9.14));
  }
  function initHero() {
    if (!hero) return;
    buildChannels();
    var first = hero.getAttribute('data-first');
    tune(first && BY[first] ? first : (CH[0] && CH[0].id));
    clock(); heroSunset(); heroPicks();
    setInterval(refreshChannelThumbs, 180000);
    hero.addEventListener('click', function (e) {
      var ch = e.target.closest('[data-ch]'); if (ch) { tune(ch.getAttribute('data-ch'), true); return; }
      if (e.target.closest('[data-wv="play"]')) { if (playing) stop(); else play(); }
    });
  }
  function colorMap() {}
  function setMode(m) {
    MODE = m; try { localStorage.setItem('pth_wcam_mode', m); } catch (e) {}
    document.querySelectorAll('[data-mode]').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-mode') === m ? 'true' : 'false'); });
    heroPicks(); ticker(); nowLine(); refreshLiveBits(); track('mode', { mode: m });
  }

  /* ── Painel ─────────────────────────────────────────────────────────── */
  var panel = null, lastFocus = null, current = null, HOURLY = {};
  function buildPanel() {
    panel = h('div', { class: 'wp', id: 'wp', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'wp-t', hidden: true });
    panel.appendChild(h('div', { class: 'wp__back', 'data-close': '1' }));
    var sheet = h('div', { class: 'wp__sheet', tabindex: '-1' });
    panel.appendChild(sheet);
    document.body.appendChild(panel);
    panel.addEventListener('click', function (e) { if (e.target.closest('[data-close]')) closePanel(); });
    document.addEventListener('keydown', function (e) {
      if (panel.hidden) return;
      if (e.key === 'Escape') closePanel();
      if (e.key === 'Tab') { // foco preso no painel
        var f = sheet.querySelectorAll('a[href],button:not([disabled]),iframe,[tabindex="0"]'); if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }
  function linkTile(href, icon, t, sub, partner, id, ext) {
    var a = h('a', { class: 'wp__tile', href: href, 'data-act': partner, 'data-cam': id }, [h('span', { class: 'wp__ti' }, ico(icon)), h('span', { class: 'wp__tt' }, [h('b', { text: t }), h('small', { text: sub })]), ico('arrow', 'wi wp__ta')]);
    if (ext) { a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener sponsored'); }
    return a;
  }
  function carCity(c) {
    if (c.r === 'madeira') return ['madeira', 'Madeira'];
    if (c.r === 'acores') return ['', EN ? 'Portugal' : 'Portugal'];
    if (c.lat >= 40) return ['porto', EN ? 'Porto airport' : 'aeroporto do Porto'];
    if (c.lat < 37.6) return ['faro', EN ? 'Faro airport' : 'aeroporto de Faro'];
    return ['lisbon', EN ? 'Lisbon airport' : 'aeroporto de Lisboa'];
  }
  function planBlock(c) {
    var where = placeShort(c);
    var box = h('section', { class: 'wp__plan', id: 'wp-plan', 'aria-labelledby': 'wp-plan-h' });
    box.appendChild(h('h3', { class: 'wp__h', id: 'wp-plan-h', text: T.pPlan + where }));
    box.appendChild(h('p', { class: 'wp__msg', hidden: true }));
    var tiles = h('div', { class: 'wp__tiles' });
    var ss = where + (c.r === 'madeira' && where !== 'Madeira' ? ', Madeira' : '') + ', Portugal';
    tiles.appendChild(linkTile('https://www.stay22.com/allez/booking?aid=kaptarstudio&campaign=portalturismoportugal-' + (EN ? 'en-' : '') + 'webcams&address=' + encodeURIComponent(ss), 'bed', T.pHotels, T.pHotelsS, 'hotel', c.id, true));
    tiles.appendChild(linkTile('https://www.getyourguide.com/s/?q=' + encodeURIComponent(where + (c.r === 'madeira' && where !== 'Madeira' ? ' Madeira' : '') + ' Portugal') + '&partner_id=0WTBHZE&cmp=webcam-' + encodeURIComponent(c.id.slice(0, 40)) + '&locale_autoredirect_optout=true', 'star', T.pDo, T.pDoS, 'gyg', c.id, true));
    var cc = carCity(c);
    tiles.appendChild(linkTile('https://www.discovercars.com/' + (EN ? '' : 'pt/') + 'portugal' + (cc[0] ? '/' + cc[0] : '') + '?a_aid=portalturismoportugal', 'car', T.pCar, T.pCarS + cc[1], 'car', c.id, true));
    tiles.appendChild(linkTile(PREFIX + '/planear?' + (c.pr ? 'r=' + c.pr + '&' : '') + 'ref=webcam-' + encodeURIComponent(c.id.slice(0, 40)), 'cal', T.pTrip, T.pTripS, 'plan', c.id, false));
    box.appendChild(tiles);
    return box;
  }
  function nowBlock(c) {
    var d = LIVE && LIVE[c.id], box = h('section', { class: 'wp__now', 'aria-labelledby': 'wp-now-h' });
    box.appendChild(h('h3', { class: 'wp__h', id: 'wp-now-h', text: T.pNow }));
    if (!d) { box.appendChild(h('p', { class: 'wp__note', text: (LIVE || LIVE_FAIL) ? T.pNoLive : T.loading })); return box; }
    if (c.k !== 'rio') box.appendChild(verdictEl(c, 'wp__v'));
    var g = h('dl', { class: 'wp__grid' });
    function cell(icon, k, v, sub) { g.appendChild(h('div', { class: 'wp__cell' }, [h('dt', {}, [ico(icon), k]), h('dd', {}, [h('b', { text: v }), sub ? h('small', { text: sub }) : null])])); }
    if (c.k !== 'rio') {
      cell('wave', T.waves, fmt1(d.wh) + ' m', d.wp != null ? T.period.toLowerCase() + ' ' + fmt0(d.wp) + ' s' : '');
      cell('drop', T.water, d.sst != null ? fmt0(d.sst) + ' °C' : '—');
    }
    cell('wind', T.wind, fmt0(d.ws) + ' km/h', dirName(d.wdir) ? T.from + dirName(d.wdir) : '');
    cell('temp', T.air, fmt0(d.ta) + ' °C');
    box.appendChild(g);
    box.appendChild(h('div', { class: 'wp__hours', 'data-hours': c.id }, h('p', { class: 'wp__note', text: T.loading })));
    if (c.k !== 'rio') box.appendChild(h('p', { class: 'wp__est', text: T.est }));
    return box;
  }
  function loadHourly(c) {
    if (HOURLY[c.id]) return Promise.resolve(HOURLY[c.id]);
    var fc = getJSON('https://api.open-meteo.com/v1/forecast?latitude=' + c.lat + '&longitude=' + c.lng + '&hourly=wind_speed_10m,temperature_2m&daily=sunset&timezone=auto&forecast_days=2&wind_speed_unit=kmh');
    var mr = c.k === 'mar' ? getJSON('https://marine-api.open-meteo.com/v1/marine?latitude=' + c.lat + '&longitude=' + c.lng + '&hourly=wave_height,wave_period,sea_level_height_msl&minutely_15=sea_level_height_msl&timezone=auto&forecast_days=2').catch(function () { return null; }) : Promise.resolve(null);
    return Promise.all([fc, mr]).then(function (r) { HOURLY[c.id] = { f: r[0], m: r[1] }; return HOURLY[c.id]; });
  }
  function hoursBlock(c, H) {
    var wrap = panel.querySelector('[data-hours="' + c.id + '"]'); if (!wrap) return;
    wrap.textContent = '';
    var f = H.f, m = H.m; if (!f || !f.hourly) return;
    var off = (f.utc_offset_seconds || 0) * 1000, nowLocal = new Date(Date.now() + off).toISOString().slice(0, 13);
    var idx = f.hourly.time.findIndex(function (t) { return t.slice(0, 13) >= nowLocal; }); if (idx < 0) idx = 0;
    var N = 12, rows = [];
    for (var i = idx; i < Math.min(idx + N, f.hourly.time.length); i++) {
      var mi = m && m.hourly ? m.hourly.time.indexOf(f.hourly.time[i]) : -1;
      rows.push({ full: f.hourly.time[i], t: f.hourly.time[i].slice(11, 16), ws: f.hourly.wind_speed_10m[i], wh: mi >= 0 ? m.hourly.wave_height[mi] : null, wp: mi >= 0 ? m.hourly.wave_period[mi] : null });
    }
    wrap.appendChild(h('h4', { class: 'wp__h4', text: T.pNext }));
    var maxW = Math.max.apply(null, rows.map(function (r) { return r.wh || 0; }).concat([1]));
    var bars = h('ol', { class: 'wp__bars', style: '--n:' + rows.length });
    rows.forEach(function (r, i) {
      var rt = c.k === 'rio' ? null : rate({ wh: r.wh, wp: r.wp, ws: r.ws });
      var ht = c.k === 'rio' || r.wh == null ? Math.min(1, (r.ws || 0) / 50) : r.wh / maxW;
      bars.appendChild(h('li', { 'data-k': rt ? rt.k : 'na', title: r.t + ' — ' + (r.wh != null ? fmt1(r.wh) + ' m · ' : '') + fmt0(r.ws) + ' km/h' }, [
        h('span', { class: 'wp__bar', style: 'height:' + Math.max(8, Math.round(ht * 100)) + '%' }),
        h('small', { text: i === 0 ? T.now : (i % 3 === 0 ? r.t.slice(0, 2) + 'h' : '') })
      ]));
    });
    wrap.appendChild(bars);
    // melhor hora (ate ao por do sol) + por do sol + mare
    var facts = h('ul', { class: 'wp__facts' });
    var setStr = f.daily && f.daily.sunset && f.daily.sunset[0];
    var setH = setStr ? setStr.slice(11, 16) : null;
    var day = rows.filter(function (r) { return setStr && r.full <= setStr && r.t >= '07:00'; });
    if (day.length > 1) {
      var best = day.slice().sort(function (a, b) { var x = rate({ wh: a.wh, wp: a.wp, ws: a.ws }), y = rate({ wh: b.wh, wp: b.wp, ws: b.ws }); return MODE === 'surf' ? (y ? y.sc : 0) - (x ? x.sc : 0) : (x ? x.sc : a.ws / 10) - (y ? y.sc : b.ws / 10); })[0];
      facts.appendChild(h('li', {}, [ico('star'), h('span', {}, [T.pBest + ': ', h('b', { text: best.t }), ' · ' + (best.wh != null ? fmt1(best.wh) + ' m · ' : '') + fmt0(best.ws) + ' km/h'])]));
    }
    if (setH) facts.appendChild(h('li', {}, [ico('sun'), h('span', {}, [T.pSunset + ': ', h('b', { text: setH })])]));
    // Mare (Lote A 08/10, auditoria W01): o codigo antigo comparava a hora cheia atual com a anterior e procurava o extremo
    // so a partir da hora seguinte -> perto de um extremo dizia "a vazar · baixa-mar as 08:00" quando ja estava a encher.
    // Agora: serie de 15 min (hora de recurso), tendencia entre as amostras que rodeiam o momento atual, extremo seguinte >= agora.
    var tideLi = null;
    var mq = m && m.minutely_15 && m.minutely_15.sea_level_height_msl ? m.minutely_15 : (m && m.hourly && m.hourly.sea_level_height_msl ? m.hourly : null);
    if (mq) {
      var sl = mq.sea_level_height_msl, mt = mq.time;
      var nowMin = new Date(Date.now() + (m.utc_offset_seconds || 0) * 1000).toISOString().slice(0, 16);
      var j0 = -1; for (var q = 0; q < mt.length - 1; q++) { if (mt[q] <= nowMin && mt[q + 1] > nowMin) { j0 = q; break; } }
      if (j0 >= 0 && sl[j0] != null && sl[j0 + 1] != null && sl[j0 + 1] !== sl[j0]) {
        var rising = sl[j0 + 1] > sl[j0], ext = null;
        for (var j = j0 + 1; j < sl.length - 1; j++) { if (sl[j] == null || sl[j + 1] == null) break; if ((rising && sl[j] >= sl[j - 1] && sl[j] > sl[j + 1]) || (!rising && sl[j] <= sl[j - 1] && sl[j] < sl[j + 1])) { ext = mt[j].slice(11, 16); break; } }
        tideLi = h('li', { title: T.tideEst }, [ico('wave'), h('span', {}, [T.tide + ': ', h('b', { text: rising ? T.rising : T.falling }), ext ? ' · ' + (rising ? T.hi : T.lo) + T.at + '\u2248' + ext : ''])]);
        facts.appendChild(tideLi);
      }
    }
    // Lote A2 09/10: com a tabela oficial do IH (js/mares-ih.js) a linha da mare passa a usar o porto de referencia
    if (c.k === 'mar' && window.PTHMares) window.PTHMares.now(c.lat, c.lng).then(function (r) {
      if (!r) return;
      var tz = c.lng < -20 ? 'Atlantic/Azores' : 'Europe/Lisbon';
      var hm = new Date(r.next.ts).toLocaleTimeString(EN ? 'en-GB' : 'pt-PT', { hour: '2-digit', minute: '2-digit', timeZone: tz });
      var li = h('li', { title: T.tideIH + r.port }, [ico('wave'), h('span', {}, [T.tide + ': ', h('b', { text: r.rising ? T.rising : T.falling }), ' · ' + (r.rising ? T.hi : T.lo) + T.at + hm])]);
      if (tideLi && tideLi.parentNode) tideLi.parentNode.replaceChild(li, tideLi); else facts.appendChild(li);
    }).catch(function () {});
    wrap.appendChild(facts);
  }
  function ytBlock(c, autoplay) {
    var box = h('div', { class: 'wp__yt' });
    var btn = h('button', { type: 'button', class: 'wp__ytbtn', 'aria-label': T.pPlay + ' — ' + c.t }, [
      h('img', { src: 'https://i.ytimg.com/vi/' + c.yt[0] + '/hqdefault.jpg', alt: '', loading: 'lazy', width: '480', height: '360' }),
      h('span', { class: 'wp__ytplay' }, [ico('play'), T.pPlay]),
      h('span', { class: 'wp__ytby', text: T.pYtBy + c.yt[1] })
    ]);
    function play() {
      var f = h('iframe', { src: 'https://www.youtube-nocookie.com/embed/' + c.yt[0] + '?autoplay=1&mute=1&playsinline=1&rel=0', title: c.t + ' — YouTube', allow: 'autoplay; encrypted-media; picture-in-picture; fullscreen', allowfullscreen: true, loading: 'lazy', referrerpolicy: 'strict-origin-when-cross-origin' });
      box.textContent = ''; box.appendChild(f); track('yt_play', { cam: c.id });
    }
    btn.addEventListener('click', play);
    box.appendChild(btn);
    if (autoplay) setTimeout(play, 0);
    return box;
  }
  function openPanel(id, opt) {
    var c = BY[id]; if (!c) return;
    opt = opt || {};
    if (!panel) buildPanel();
    current = c; var sheet = panel.querySelector('.wp__sheet'); sheet.textContent = '';
    if (panel.hidden) lastFocus = document.activeElement;
    // topo
    var head = h('header', { class: 'wp__head' });
    head.appendChild(media(c, '(max-width: 640px) 100vw, 480px', true));
    fillMediaData(head.querySelector('.wm__data'), c);
    head.appendChild(h('button', { type: 'button', class: 'wp__x', 'data-close': '1', 'aria-label': T.pClose }, ico('x')));
    head.appendChild(h('div', { class: 'wp__title' }, [h('p', { class: 'wp__eye', text: T.reg[c.r] }), h('h2', { id: 'wp-t', text: c.t }), h('p', { class: 'wp__place', text: place(c) })]));
    sheet.appendChild(head);
    var body = h('div', { class: 'wp__body' });
    if (opt.back) {
      var bk = h('div', { class: 'wp__ret', role: 'status' }, [h('p', { class: 'wp__retq', text: T.back(c.t) }), h('div', { class: 'wp__retb' }, [
        h('button', { type: 'button', class: 'wp__btn wp__btn--gold', 'data-ret': 'go', text: T.backGood }), h('button', { type: 'button', class: 'wp__btn', 'data-ret': 'no', text: T.backNo })])]);
      body.appendChild(bk);
    }
    if (c.near) body.appendChild(h('p', { class: 'wc__near', text: c.near[L] }));
    if (c.yt) body.appendChild(ytBlock(c, !!opt.play));
    var go = h('div', { class: 'wp__go' });
    if (c.meo) {
      go.appendChild(h('a', { class: 'wp__btn wp__btn--gold wp__btn--big', href: meoUrl(c.meo), target: '_blank', rel: 'noopener', 'data-golive': c.id }, [ico('play'), T.liveOn, ico('ext')]));
      if (c.alt) {
        var al = h('p', { class: 'wp__alt' }, [h('span', { text: T.pAngles + ': ' })]);
        c.alt.forEach(function (x) { al.appendChild(h('a', { href: meoUrl(x[0]), target: '_blank', rel: 'noopener', 'data-golive': c.id, text: x[1] })); });
        go.appendChild(al);
      }
    }
    body.appendChild(go);
    body.appendChild(nowBlock(c));
    body.appendChild(planBlock(c));
    var more = h('div', { class: 'wp__links' });
    if (c.bp) {
      var bh = c.bp[0] === 'p' ? (EN && c.bp[2] ? '/en/praias/' + c.bp[1] + '/' : '/praias/' + c.bp[1] + '/') : PREFIX + '/beach?id=' + c.bp[1];
      more.appendChild(h('a', { href: bh, 'data-act': 'beach', 'data-cam': c.id }, [ico('book'), T.pBeach]));
    }
    var sh = h('button', { type: 'button', class: 'wp__share' }, [ico('share'), T.pShare]);
    sh.addEventListener('click', function () {
      var url = location.origin + location.pathname + '#cam-' + c.id;
      if (navigator.share) navigator.share({ title: c.t + ' — ' + (EN ? 'live webcam' : 'webcam em direto'), url: url }).catch(function () {});
      else if (navigator.clipboard) navigator.clipboard.writeText(url).then(function () { sh.lastChild.textContent = T.pCopied; });
      track('share', { cam: c.id });
    });
    more.appendChild(sh);
    more.appendChild(h('a', { href: '#pedir', 'data-close': '1' }, [ico('msg'), T.pAsk]));
    body.appendChild(more);
    var p = c.ph ? T.photo + ': ' + c.ph[1] + '. ' : '';
    body.appendChild(h('p', { class: 'wp__src', text: p + (c.yt ? T.pSrcYt(c.yt[1]) + ' ' : '') + (c.meo ? T.pSrcMeo : '') }));
    sheet.appendChild(body);
    panel.hidden = false;
    requestAnimationFrame(function () { panel.classList.add('is-open'); });
    document.documentElement.classList.add('wp-lock');
    if (history.replaceState) history.replaceState(null, '', '#cam-' + c.id);
    if (opt.focus === 'plan') { var pl = sheet.querySelector('#wp-plan'); if (pl) setTimeout(function () { pl.scrollIntoView({ block: 'start' }); }, 60); }
    sheet.focus({ preventScroll: true });
    loadHourly(c).then(function (H) { if (current === c) hoursBlock(c, H); }).catch(function () { var w = panel.querySelector('[data-hours]'); if (w) w.textContent = ''; });
    track(opt.back ? 'return' : 'panel', { cam: c.id });
  }
  function refreshPanelNow() {
    if (!panel || panel.hidden || !current) return;
    var old = panel.querySelector('.wp__now'); if (!old) return;
    var c = current, nb = nowBlock(c); old.replaceWith(nb);
    if (HOURLY[c.id]) hoursBlock(c, HOURLY[c.id]);
    var dd = panel.querySelector('.wp__head .wm__data'); if (dd) fillMediaData(dd, c);
  }
  function closePanel() {
    if (!panel || panel.hidden) return;
    panel.classList.remove('is-open');
    document.documentElement.classList.remove('wp-lock');
    var yt = panel.querySelector('iframe'); if (yt) yt.remove();
    setTimeout(function () { panel.hidden = true; }, 220);
    if (history.replaceState && /^#cam-/.test(location.hash)) history.replaceState(null, '', location.pathname + location.search);
    current = null;
    if (lastFocus && lastFocus.focus) try { lastFocus.focus({ preventScroll: true }); } catch (e) {}
  }
  function onReturnChoice(kind) {
    if (!current || !panel) return;
    var c = current, msg = panel.querySelector('.wp__msg'), ret = panel.querySelector('.wp__ret');
    if (ret) ret.remove();
    track('return_' + kind, { cam: c.id });
    if (kind === 'go') {
      msg.textContent = T.backGoodMsg; msg.hidden = false;
      var pl = panel.querySelector('#wp-plan'); if (pl) { pl.classList.add('is-hot'); pl.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      return;
    }
    // alternativas mais calmas na mesma regiao (modo praia) ou melhor surf (modo surf)
    var alts = CAMS.filter(function (x) { return x.id !== c.id && x.k === 'mar' && LIVE && LIVE[x.id]; }).map(function (x) { return { c: x, r: rate(LIVE[x.id]), d: dist(c.lat, c.lng, x.lat, x.lng) }; })
      .filter(function (x) { return x.r && x.r.k === 'calm' && x.d < 60; }).sort(function (a, b) { return a.d - b.d; }).slice(0, 3);
    var box = h('div', { class: 'wp__alts' }, [h('p', { class: 'wp__h4', text: alts.length ? T.backNoMsg : T.backNoNone })]);
    alts.forEach(function (x) { box.appendChild(h('button', { type: 'button', class: 'wp__altb', 'data-open': x.c.id }, [h('span', {}, [h('b', { text: x.c.t }), h('small', { text: place(x.c) + ' · ' + fmt0(x.d) + ' km · ' + fmt1(LIVE[x.c.id].wh) + ' m' })]), h('em', { text: x.r.label })])); });
    var body = panel.querySelector('.wp__body'); body.insertBefore(box, body.firstChild);
  }

  /* ── Delegacao de cliques ───────────────────────────────────────────── */
  var pending = null;
  document.addEventListener('click', function (e) {
    var t = e.target;
    var ret = t.closest && t.closest('[data-ret]'); if (ret) { onReturnChoice(ret.getAttribute('data-ret')); return; }
    var live = t.closest && t.closest('[data-golive]');
    if (live) { pending = { id: live.getAttribute('data-golive'), t: Date.now() }; track('open_live', { cam: pending.id }); return; }
    var act = t.closest && t.closest('[data-act]');
    if (act) { track('go_' + act.getAttribute('data-act'), { cam: act.getAttribute('data-cam') }); return; }
    var op = t.closest && t.closest('[data-open]');
    if (op) {
      if (op.tagName === 'A') e.preventDefault();
      openPanel(op.getAttribute('data-open'), { focus: op.getAttribute('data-focus'), play: op.getAttribute('data-play') === '1' });
      return;
    }
    var rg = t.closest && t.closest('[data-region]');
    if (rg && rg.closest('#wf-regions')) { setRegion(rg.getAttribute('data-region')); track('region', { region: rg.getAttribute('data-region') || 'all' }); return; }
    var go = t.closest && t.closest('[data-goregion]');
    if (go) { e.preventDefault(); setRegion(go.getAttribute('data-goregion'), true); return; }
    var md = t.closest && t.closest('[data-mode]'); if (md) { setMode(md.getAttribute('data-mode')); return; }
    if (t.closest && t.closest('[data-reset]')) { ST.q = ''; ST.r = ''; ST.yt = false; document.querySelectorAll('[data-wsearch]').forEach(function (i) { i.value = ''; }); var y = document.getElementById('wf-yt'); if (y) y.setAttribute('aria-pressed', 'false'); setRegion(''); return; }
    var qk = t.closest && t.closest('[data-q]');
    if (qk) { var q = qk.getAttribute('data-q'); var c = rank(norm(q))[0]; if (c) { openPanel(c.id); track('quick', { cam: c.id }); } return; }
  });
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState !== 'visible' || !pending) return;
    var p = pending; pending = null;
    if (Date.now() - p.t < 2500) return;
    openPanel(p.id, { back: true });
  });

  /* ── Perto de mim ───────────────────────────────────────────────────── */
  function nearMe(btn) {
    if (!navigator.geolocation) { btn.textContent = T.nearFail; return; }
    var lab = btn.querySelector('span'); if (lab) lab.textContent = T.nearBusy;
    navigator.geolocation.getCurrentPosition(function (pos) {
      ST.me = [pos.coords.latitude, pos.coords.longitude]; ST.sort = 'near';
      var sel = document.getElementById('wf-sort'); if (sel) { var o = sel.querySelector('option[value="near"]'); if (o) o.disabled = false; sel.value = 'near'; }
      if (lab) lab.textContent = T.near; setRegion('', true); track('near_me');
    }, function () { if (lab) lab.textContent = T.nearFail; }, { timeout: 10000, maximumAge: 600000 });
  }

  /* ── Formulario "peca uma camara" (submit-contact + Turnstile) ──────── */
  function initForm() {
    var f = document.getElementById('ws-form'); if (!f) return;
    var loaded = false;
    function loadTurnstile() {
      if (loaded) return; loaded = true;
      var sc = document.createElement('script'); sc.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'; sc.async = true; sc.defer = true; document.head.appendChild(sc);
    }
    f.addEventListener('focusin', loadTurnstile);
    if ('IntersectionObserver' in window) { var io = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { loadTurnstile(); io.disconnect(); } }, { rootMargin: '300px' }); io.observe(f); }
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var out = f.querySelector('.ws__out'), btn = f.querySelector('button[type="submit"]');
      var name = f.elements.name.value.trim(), email = f.elements.email.value.trim(), msg = f.elements.message.value.trim(), news = f.elements.news && f.elements.news.checked;
      if (!name || !email || !msg || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { out.textContent = T.fMissing; out.setAttribute('data-k', 'err'); return; }
      var tok = (f.querySelector('[name="cf-turnstile-response"]') || {}).value || '';
      if (!tok) { out.textContent = T.fCaptcha; out.setAttribute('data-k', 'err'); return; }
      btn.disabled = true;
      var base = (window.SUPABASE_URL || 'https://glupdjvdvunogkqgxoui.supabase.co');
      fetch(base + '/functions/v1/submit-contact', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ turnstileToken: tok, name: name.slice(0, 120), email: email.slice(0, 160), subject: 'webcams-sugestao', message: (msg.slice(0, 2000) + '\n\n[pagina: ' + location.pathname + ' · novidades: ' + (news ? 'sim' : 'nao') + ']'), timestamp: new Date().toISOString() }) })
        .then(function (r) { if (!r.ok) throw new Error(r.status); out.textContent = T.fSent; out.setAttribute('data-k', 'ok'); f.reset(); track('suggest_sent', { news: news ? 1 : 0 }); })
        .catch(function () { out.textContent = T.fErr; out.setAttribute('data-k', 'err'); })
        .then(function () { btn.disabled = false; try { if (window.turnstile) window.turnstile.reset(); } catch (e) {} });
    });
  }

  /* ── Arranque ───────────────────────────────────────────────────────── */
  function init() {
    if (window.matchMedia && window.matchMedia('(max-width: 640px)').matches) document.querySelectorAll('details.wd__reg').forEach(function (d) { d.removeAttribute('open'); });
    buildFilters();
    render();
    initHero();
    setMode(MODE);
    document.querySelectorAll('[data-wsearch]').forEach(function (i) { if (i.getAttribute('aria-controls')) initSuggest(i); else i.addEventListener('input', function () { setQuery(i.value, i); }); });
    var sel = document.getElementById('wf-sort'); if (sel) sel.addEventListener('change', function () { if (sel.value === 'near' && !ST.me) { var nb = document.querySelector('[data-near]'); if (nb) nearMe(nb); return; } ST.sort = sel.value; render(); track('sort', { sort: sel.value }); });
    var yt = document.getElementById('wf-yt'); if (yt) yt.addEventListener('click', function () { ST.yt = !ST.yt; yt.setAttribute('aria-pressed', ST.yt ? 'true' : 'false'); render(); });
    if (moreBtn) moreBtn.addEventListener('click', function () { ST.shown += PAGE * 2; render(true); track('more'); });
    document.querySelectorAll('[data-near]').forEach(function (b) { b.addEventListener('click', function () { nearMe(b); }); });
    initForm();
    loadLive().then(function () { heroPicks(); ticker(); nowLine(); refreshLiveBits(); if (ST.sort !== 'top') render(true); refreshPanelNow(); })
      
      .catch(function () { LIVE = null; LIVE_FAIL = true; refreshPanelNow(); heroPicks(); document.querySelectorAll('.wc__v').forEach(function (v) { v.textContent = ''; v.appendChild(h('i')); v.appendChild(h('span', { text: T.nodata })); }); });
    var m = /^#cam-(.+)$/.exec(location.hash); if (m && BY[m[1]]) setTimeout(function () { openPanel(m[1]); }, 50);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  window.WebcamsPage = { open: openPanel, close: closePanel };
})(window, document);
