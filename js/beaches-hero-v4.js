/* Hero de /beaches v4 — mapa em relevo + praias ao vivo — Portal Turismo Portugal — 2026-10-07
 * Pontos no viewBox 1250x2560 do mapa (portugal-relevo-*.webp). XY = posicao de cada praia colada a costa
 * (calculada a partir da lat/lng da BD, ajustada ao contorno do mapa). Praia nova sem XY -> projecao direta (FIT).
 * Cores = estado do mar agora (LiveCoast / Open-Meteo): <=0,6 m calmo, <=1,2 m moderado, acima agitado.
 * So DOM seguro (createElementNS/textContent). Sem dados do mar -> pontos dourados, resto funciona.
 */
(function (window, document) {
  'use strict';
  var root = document.querySelector('.bh4'); if (!root) return;
  var svg = root.querySelector('.bh4__svg'), stage = root.querySelector('.bh4__stage'), tip = root.querySelector('.bh4__tip');
  var NS = 'http://www.w3.org/2000/svg';
  var EN = (document.documentElement.lang || '').toLowerCase().indexOf('en') === 0;
  var T = EN ? { waves: 'waves', water: 'water', upd: 'Live · updated ', beaches: 'beaches', beach: function (id) { return '/en/beach.html?id=' + encodeURIComponent(id); }, dec: '.' }
             : { waves: 'ondas', water: 'água', upd: 'Ao vivo · atualizado às ', beaches: 'praias', beach: function (id) { return '/beach.html?id=' + encodeURIComponent(id); }, dec: ',' };
  var XY = {"e11188da-c19e-4c9d-a2a6-59f777412a05":[149,1780],"37ac39ea-0a07-480a-9147-5aed9a9ae388":[259,2376],"47af766c-c76f-483f-986b-5dbefd6f294a":[317,768],"10f7f046-fb30-493e-acf0-bf6b2a57858b":[284,266],"a6625ef3-a4ad-4e38-b74e-856ffc9fa724":[263,2354],"3be6e364-0660-4b97-be03-67b7c4053070":[764,2408],"07b0b2c3-f11d-474d-9f5f-02dc87a4be64":[274,1011],"a45ef0a4-98ff-4eb2-bc3d-3cee21ca5570":[679,2466],"508706d1-2ddd-4377-8319-75a5bb347435":[148,1760],"6cafdc55-fcea-4e55-b2a1-78995f44b609":[422,2443],"d8c2c61e-734a-41c5-aec1-66981023cfca":[245,1773],"0f616614-30d1-488a-986a-acd1caebbe6c":[88,1388],"fede421d-0f75-46f7-9248-9a374bc63c4c":[37,1676],"868b17e0-9f74-46b1-8f84-bacc0ff7db94":[248,2411],"52e176c2-b7e6-4a85-abcf-6cf871464967":[291,2106],"6b2661a4-4126-4ac4-8a03-ec2193cd4494":[288,2182],"4bd3bca5-6c5b-486d-87c0-bd21ea5435ce":[292,2244],"db7e9098-4293-4b44-a443-d42491916a91":[350,623],"304b2207-d81b-4fef-bdc3-74392d207133":[61,1538],"a8e9c668-f606-4100-87ea-b00ea61617e5":[291,2068],"62030703-6711-4653-bc35-b1284f35cd5e":[330,492],"eea6217b-2508-4c9b-b1a8-e9ed888f757d":[297,1930],"084b12c9-a27a-4865-98b4-6932918e3609":[508,2443],"53d1fa07-14d1-4806-8c8c-d0ec01f35b28":[81,1685],"754eb86f-0f1f-4675-89fc-82b8dc01a605":[452,2439],"a0529d77-b688-4293-ba11-8f023a69e4cf":[33,1644],"9b62bea8-e8c4-44f1-9ab5-9e9864cf6bb5":[334,2431],"f0fbf5a9-75d3-40d3-80be-62fc749588fd":[98,1683],"6a12acc8-f776-4b01-96f7-73f9fb096e6d":[291,2087],"d81736c8-0e7d-4d98-b369-377998fc5c2f":[41,1628],"513d687d-b8f9-4d87-b5a7-c6de1d7d695c":[50,1610],"0b9d2380-38cf-437d-a4e3-4b68158ba2a4":[255,1791],"dee27f4d-ec13-43b4-a618-4ac272d22cf2":[283,2050],"feead871-bb63-43d7-acf9-592d7d54b514":[782,2401],"d3bb1bb1-4e97-424d-9267-710673662975":[430,2443],"fd1474e1-7acb-4635-822d-df649332769e":[95,1422],"4b75fb06-7715-4b56-8b37-8f6eb332ae22":[598,2492],"dd37d1cd-8ecc-45af-b8d2-3ceabf881969":[302,326],"23467c12-84bc-4590-a3a8-32412c15fcde":[409,2442],"6b3928b3-4680-4051-b2f1-e3bdb41cab35":[307,807],"3d2dacea-cfcb-4086-9e15-a7b57ec9f2e7":[209,1791],"406a09d1-daa7-44b3-aa19-3a13b4aab711":[116,1677],"c627b1c9-8467-4729-aa26-15fb6e86e6af":[287,2282],"fefd19c5-2dad-4627-a476-daa13be99352":[136,1336],"d762875e-3d8a-467c-bb1b-efed5b1c42d0":[293,864],"b04adbca-20fc-44e0-b947-066978b8fffc":[250,2393],"24dba43c-02fb-40bc-b3a8-d39e1f8ea49e":[208,1189],"92de7432-12a1-4324-8ed2-932692b1e267":[284,1982],"f893e0a8-9f2e-4533-9093-001877541cf1":[50,1680],"2cb7aca0-9280-4405-8390-3f592e3ef0f5":[543,2453],"4325b4a7-62f3-46a7-a66d-ae0ad6e0d374":[290,2450],"b699e6b6-e0cb-4620-9355-e1f3074ddde9":[275,197],"885a3c2e-2f8d-424d-b98c-a8c7b8732bee":[378,2429],"66ee7f6b-018b-408b-8d48-c58d2f73bf8d":[440,2437],"26b8762d-0343-4a93-9670-9a86993e7dfd":[312,788],"63d09050-d513-474a-87f4-3658b18da09a":[355,589],"0e3bf570-263f-45c1-afd2-0f9ca232b07c":[399,2437],"e1e260e4-5094-4dee-8c90-11a43523e126":[263,2334],"9fd20503-ced1-4e4c-9069-d38c320ef247":[337,511],"74421a75-f67c-45d5-928f-b7fae44adc33":[191,1248],"59de93aa-066b-4d01-9c4e-27f3a40422f1":[477,2450],"f2061e77-2dfd-4817-bab6-2341672729a4":[525,2446],"c63cbf17-1445-4697-aa21-a5b9dff08851":[345,649],"5c45c033-1182-4e59-b0de-61ec81ab38f2":[256,2461],"d3b73c18-ff72-4f00-b556-0370fd549fd3":[239,2428],"cd38e95f-282e-4d59-bca9-5ff03d43cee8":[229,2445],"efdfab6a-36b9-42a6-8e11-019450a51c86":[800,2401],"b5d5f332-d553-49d9-ad92-77d658de945f":[266,959],"e5113c93-c469-489a-8db6-7d877c0de22c":[328,714],"885d20c0-e362-4825-b250-b63ffaaf9631":[238,1115],"2dd735c3-9317-45bb-aed7-c3832af7653d":[293,2152],"925ac239-db1f-432b-98ee-7a308ae9a6b8":[347,2426],"d723c15c-6b6b-4c47-8182-c06313e0e641":[464,2448],"4c907c07-8bbd-4c37-90f2-8f9e2696f5a0":[191,1267],"f400d000-20b2-414c-ba38-bae63856431f":[281,915],"6adf3ccd-9fd2-4bc0-894e-e4c775fb3e71":[305,346],"c4bea301-56f1-49b5-934d-f576e41f5132":[249,1083],"8d29adfa-7276-4074-bce6-dc1c6b49ae12":[42,1660],"9ff93289-f391-41aa-bdd1-d7d55637a9a2":[388,2435],"dee7ca71-0316-4254-a1db-6c8f79a6e380":[224,2480],"d9af39d6-f9ae-483d-ab1d-e48a026dfd53":[305,2444],"37fd270d-1dd5-4701-af07-f0ede1590069":[272,2453],"081ec673-aec2-4015-b711-4f88b2664914":[707,2447],"f7fa6d81-2872-4971-be81-42464b11ac9f":[316,425],"89fa1083-95bf-42e7-bd28-ad34740851cf":[619,2501],"cb7d55ac-702f-49ec-98f7-d2c8c8e62715":[225,1780],"91f9ac99-a4b2-4793-afba-5b7f79d72d54":[291,1840],"49839927-ee16-498b-80a8-f029627fd4c5":[132,1717],"010ffc15-3125-4156-aa4f-54b6198ae8e3":[364,2429],"51c5eb21-e534-4c5c-98e0-305c78721686":[309,365],"fa66de51-13bc-4088-8b94-942d33e525fc":[239,2469],"63806db3-12a1-4e83-b354-1ac4b44fcb2d":[258,977],"2b2b6f80-d16c-4689-87f8-4b799a24fd9e":[269,992],"91b63ef1-7d4f-483a-a8ca-ed2a60b65e00":[323,2443],"67e04297-3a9a-4e41-808f-cae811d0680b":[62,1576],"ffe1a91f-de57-4ff0-9ad5-d32951851730":[93,1370],"7b053b2b-f6f9-4d2b-b897-e4f4b52f463a":[65,1675],"6347e27e-d7fe-45bd-9fb8-ff3d7557d100":[168,1297],"3308ac4a-f42c-4c44-938b-cccbebb21afc":[489,2443],"9efe4cc6-cb4a-4265-83c3-c710917810c1":[182,1803],"f1f7b723-5ae7-457f-a810-6d5ad1f43c23":[723,2435],"8c523fc0-993c-4e0e-9d29-755d7257be50":[560,2463],"f940e21f-3169-486c-9438-30dd3e503eb3":[299,1908],"4b7f7ece-a91f-4ef0-bd4f-f8f280a6b78a":[162,1804],"a9b0eada-8f04-4862-85aa-2892039baecd":[63,1557],"43290bbc-db7f-4b1e-9cb5-a51b644c0ca6":[276,216]};
  var FIT = { C: 0.7705132427757891, X0: -7.318870276532866, Y0: -42.15420001833158, sx: 478.0891913909998, sy: 474.0765097728385, ox: 33, oy: 48.5 };
  function project(b) { return XY[b.id] || [(b.lng * FIT.C - FIT.X0) * FIT.sx + FIT.ox, (-b.lat - FIT.Y0) * FIT.sy + FIT.oy]; }
  function mk(tag, attrs, parent) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
  function f1(v) { return v.toFixed(1).replace('.', T.dec); }
  function $(k) { return root.querySelector('[data-bh="' + k + '"]'); }
  function set(k, v) { var e = $(k); if (e) e.textContent = v; }
  function track(n, x) { try { if (typeof window.track === 'function') window.track(n, x || {}); } catch (e) {} }

  // filtro de brilho (SVG, funciona em todos os browsers)
  var defs = mk('defs', {}, svg); var fl = mk('filter', { id: 'bh4-glow', x: '-200%', y: '-200%', width: '500%', height: '500%' }, defs);
  mk('feGaussianBlur', { stdDeviation: '10' }, fl);

  var pts = [], cur = null;
  function draw(list) {
    var g = $('dots'); g.textContent = '';
    var glow = mk('g', {}, g), core = mk('g', {}, g);
    list.forEach(function (b, i) {
      if (!isFinite(b.lat) || !isFinite(b.lng) || b.lng < -12) return; // Madeira: cartao proprio
      var xy = project(b), p = { b: b, x: xy[0], y: xy[1] };
      p.glow = mk('circle', { cx: xy[0].toFixed(1), cy: xy[1].toFixed(1), r: 26, class: 'bh4__glow', filter: 'url(#bh4-glow)' }, glow);
      var a = mk('a', { href: T.beach(b.id), class: 'bh4__dot', tabindex: '-1', 'aria-label': b.name }, core);
      a.style.setProperty('--i', String(i % 60));
      mk('circle', { cx: xy[0].toFixed(1), cy: xy[1].toFixed(1), r: 13, class: 'bh4__core' }, a);
      a.addEventListener('mouseenter', function () { show(p); });
      a.addEventListener('focus', function () { show(p); });
      a.addEventListener('mouseleave', function () { if (cur === p) hide(); });
      a.addEventListener('click', function () { track('beaches_map_dot', { beach: b.name }); });
      p.a = a; pts.push(p);
    });
  }
  function toStage(x, y) { // coordenadas do mapa -> pixeis dentro do .bh4__stage
    var r = svg.getBoundingClientRect(), s = stage.getBoundingClientRect();
    return [r.left - s.left + x * r.width / 1250, r.top - s.top + y * r.height / 2560];
  }
  function show(p) {
    if (!tip) return; cur = p; tip.textContent = '';
    var n = document.createElement('strong'); n.textContent = p.b.name; tip.appendChild(n);
    var m = document.createElement('span'), s = p.sea;
    m.textContent = p.b.region + (s && s.w != null ? ' · ' + T.waves + ' ' + f1(s.w) + ' m' + (s.t != null ? ' · ' + T.water + ' ' + Math.round(s.t) + ' °C' : '') : '');
    tip.appendChild(m);
    var r = svg.getBoundingClientRect(), fig = tip.parentNode.getBoundingClientRect();
    tip.style.left = (r.left - fig.left + p.x * r.width / 1250) + 'px'; tip.style.top = (r.top - fig.top + p.y * r.height / 2560) + 'px';
    tip.classList.add('is-on');
  }
  function hide() { cur = null; if (tip) tip.classList.remove('is-on'); }

  var picks = {};
  function card(kind, p) {
    var c = root.querySelector('[data-card="' + kind + '"]'); if (!c) return;
    if (p) { c.href = T.beach(p.b.id); c.addEventListener('click', function () { track('beaches_map_card', { card: kind, beach: p.b.name }); }); }
    c.hidden = false;
  }
  function mark(p, ping) {
    var g = $('marks');
    if (ping) mk('circle', { cx: p.x, cy: p.y, r: 24, class: 'bh4__ping' }, g);
    mk('circle', { cx: p.x, cy: p.y, r: 27, class: 'bh4__mark' }, g);
  }
  function leaders() { // linhas dos cartoes ate aos pontos (so no ecra largo)
    var wide = window.matchMedia('(min-width: 1181px)').matches;
    ['waves', 'calm'].forEach(function (k) {
      var path = root.querySelector('[data-leader="' + k + '"]'), c = root.querySelector('[data-card="' + k + '"]'), p = picks[k];
      if (!path) return; path.setAttribute('d', '');
      if (!wide || !p || !c || c.hidden) return;
      var d = toStage(p.x, p.y), s = stage.getBoundingClientRect(), cr = c.getBoundingClientRect();
      var top = Math.max(0, Math.min(stage.clientHeight - cr.height, d[1] - cr.height / 2));
      c.style.top = top + 'px';
      cr = c.getBoundingClientRect();
      var ex = k === 'waves' ? cr.right - s.left : cr.left - s.left, ey = d[1];
      var sx = d[0] + (k === 'waves' ? -9 : 9);
      path.setAttribute('d', 'M' + sx.toFixed(1) + ' ' + d[1].toFixed(1) + ' L' + ex.toFixed(1) + ' ' + ey.toFixed(1));
    });
  }

  function colour(all) {
    window.LiveCoast.sea(all).then(function (sea) {
      var n = { calm: 0, moderate: 0, rough: 0 }, at = '', isl = [];
      all.forEach(function (b) {
        var s = sea[b.id]; if (!s || s.w == null) return;
        n[window.LiveCoast.level(s.w)]++; at = at || s.at;
        if (b.lng < -12) isl.push(s);
      });
      var tot = n.calm + n.moderate + n.rough; if (!tot) return;
      pts.forEach(function (p) { var s = sea[p.b.id]; if (!s || s.w == null) return; p.sea = s; var lv = window.LiveCoast.level(s.w); p.a.setAttribute('data-level', lv); p.glow.style.fill = lv === 'calm' ? 'var(--calm)' : lv === 'moderate' ? 'var(--mod)' : 'var(--rough)'; });
      set('calm', String(n.calm)); set('moderate', String(n.moderate)); set('rough', String(n.rough));
      ['calm', 'moderate', 'rough'].forEach(function (k) { var e = root.querySelector('[data-bar="' + k + '"]'); if (e) e.style.width = (100 * n[k] / tot) + '%'; });
      set('time', T.upd + (at || new Date().toTimeString().slice(0, 5)));
      var seen = {}, live = pts.filter(function (p) { if (!p.sea || seen[p.b.name]) return false; seen[p.b.name] = 1; return true; });
      var calm = live.filter(function (p) { return p.sea.w <= 0.6; }).sort(function (a, b) { return (b.sea.t || 0) - (a.sea.t || 0) || a.sea.w - b.sea.w; })[0];
      var waves = live.slice().sort(function (a, b) { return b.sea.w - a.sea.w; })[0];
      if (calm) {
        picks.calm = calm; set('calm-name', calm.b.name);
        set('calm-meta', f1(calm.sea.w) + ' m' + (calm.sea.t != null ? ' · ' + T.water + ' ' + Math.round(calm.sea.t) + ' °C' : ''));
        card('calm', calm); mark(calm, true);
      }
      if (waves && waves !== calm) {
        picks.waves = waves; set('waves-name', waves.b.name);
        set('waves-meta', f1(waves.sea.w) + ' m' + (waves.sea.t != null ? ' · ' + T.water + ' ' + Math.round(waves.sea.t) + ' °C' : ''));
        card('waves', waves); mark(waves, false);
      }
      if (isl.length) {
        var t = isl.filter(function (s) { return s.t != null; }), avg = t.length ? Math.round(t.reduce(function (a, s) { return a + s.t; }, 0) / t.length) : null;
        set('islands', isl.length + ' ' + T.beaches + (avg != null ? ' · ' + T.water + ' ' + avg + ' °C' : '')); card('islands');
      }
      root.classList.add('is-live');
      requestAnimationFrame(leaders);
    });
  }

  var started = false;
  function start(list) {
    if (started || !list || !list.length || !window.LiveCoast) return; started = true;
    window.LiveCoast.setBeaches(list).then(function (l) { draw(l); colour(l); });
  }
  window.addEventListener('resize', function () { requestAnimationFrame(leaders); });
  var img = root.querySelector('.bh4__relief'); if (img && !img.complete) img.addEventListener('load', function () { requestAnimationFrame(leaders); });
  document.addEventListener('pth:beaches', function (e) { start(e.detail); });
  if (window.__pthBeaches) start(window.__pthBeaches);
  setTimeout(function () { if (!started && window.LiveCoast) window.LiveCoast.beaches().then(start); }, 6000);
})(window, document);
