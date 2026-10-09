/* js/home-v4.js — Pagina inicial v4: "Praias em destaque" com rotacao diaria (Lote H2, 09/10/2026)
 * Porque estao em destaque: agua "Excelente" (APA/EEA 2025) + foto verificada + uma por zona da costa (do Minho as ilhas).
 * Rotacao: cada zona tem um grupo; todos os dias (data de Lisboa) escolhe-se outra praia de cada grupo. O HTML estatico
 * mantem a selecao da publicacao (sem JS / motores de busca). Se o hero ja tiver o mar de agora (LiveCoast, cache),
 * as praias com mar calmo sobem e levam a etiqueta "Mar calmo agora".
 */
(function () {
  'use strict';
  var ul = document.querySelector('#destaque .hv-ft__grid'); if (!ul) return;
  var EN = (document.documentElement.lang || '').toLowerCase().indexOf('en') === 0;
  var BEACH = EN ? '/en/beach?id=' : '/beach?id=';
  var CAMP = 'portalturismoportugal-' + (EN ? 'en-' : '') + 'home-destaque';
  var T = EN ? { q: 'Excellent water', view: 'View beach', stay: 'Hotels nearby', photo: 'Photo', calm: 'Calm sea now', dec: '.' }
             : { q: 'Água excelente', view: 'Ver praia', stay: 'Hotéis perto', photo: 'Foto', calm: 'Mar calmo agora', dec: ',' };
  // [id, nome, zona pt, zona en, texto pt, texto en, credito, morada Stay22, lat, lng]
  var G = {
    algarve: [
      ['66ee7f6b-018b-408b-8d48-c58d2f73bf8d', 'Praia da Marinha', 'Algarve · Lagoa', 'Algarve · Lagoa', 'Falésias douradas e água transparente; das mais fotografadas da Europa.', 'Golden cliffs and clear water; one of Europe’s most photographed beaches.', 'Wikipedia', 'Praia da Marinha, Lagoa, Portugal', 37.08958, -8.41284],
      ['2cb7aca0-9280-4405-8390-3f592e3ef0f5', 'Praia da Falésia', 'Algarve · Albufeira', 'Algarve · Albufeira', 'Seis quilómetros de areia sob falésias vermelhas.', 'Six kilometres of sand under red cliffs.', 'Wikipedia', 'Albufeira, Portugal', 37.08335, -8.15912],
      ['9ff93289-f391-41aa-bdd1-d7d55637a9a2', 'Praia da Rocha', 'Algarve · Portimão', 'Algarve · Portimão', 'Areal largo, rochedos e marginal com tudo à mão.', 'Wide sand, sea stacks and a seafront with everything close by.', 'Wikipedia', 'Praia da Rocha, Portimão, Portugal', 37.11605, -8.53737],
      ['23467c12-84bc-4590-a3a8-32412c15fcde', 'Praia de Carvoeiro', 'Algarve · Lagoa', 'Algarve · Lagoa', 'Praia da aldeia de pescadores, entre falésias.', 'The fishing village beach, framed by cliffs.', 'Wikipedia', 'Carvoeiro, Portugal', 37.09617, -8.47227],
      ['081ec673-aec2-4015-b711-4f88b2664914', 'Ilha de Tavira', 'Algarve · Tavira', 'Algarve · Tavira', 'Ilha-barreira de dunas e mar morno, a barco desde Tavira.', 'Barrier island of dunes and warm sea, by boat from Tavira.', 'Wikipedia', 'Tavira, Portugal', 37.10979, -7.61985],
      ['37fd270d-1dd5-4701-af07-f0ede1590069', 'Praia do Zavial', 'Algarve · Vila do Bispo', 'Algarve · Vila do Bispo', 'Enseada abrigada perto de Sagres.', 'Sheltered cove near Sagres.', 'Wikipedia', 'Sagres, Portugal', 37.04615, -8.87158]
    ],
    vicentina: [
      ['c627b1c9-8467-4729-aa26-15fb6e86e6af', 'Praia de Odeceixe', 'Costa Vicentina', 'Vicentine Coast', 'Rio e mar no mesmo areal, entre Algarve e Alentejo.', 'River meets ocean on one beach, between the Algarve and Alentejo.', 'Wikipedia', 'Odeceixe, Portugal', 37.44193, -8.79957],
      ['a6625ef3-a4ad-4e38-b74e-856ffc9fa724', 'Praia da Arrifana', 'Costa Vicentina · Aljezur', 'Vicentine Coast · Aljezur', 'Baía em ferradura, berço do surf no Algarve.', 'Horseshoe bay and the Algarve’s surf heartland.', 'Wikipedia', 'Aljezur, Portugal', 37.29455, -8.86632],
      ['37ac39ea-0a07-480a-9147-5aed9a9ae388', 'Praia da Bordeira', 'Costa Vicentina · Carrapateira', 'Vicentine Coast · Carrapateira', 'Ribeira, dunas e um areal imenso e selvagem.', 'A stream, dunes and a huge wild beach.', 'Wikipedia', 'Carrapateira, Portugal', 37.19851, -8.90459],
      ['b04adbca-20fc-44e0-b947-066978b8fffc', 'Praia do Amado', 'Costa Vicentina · Carrapateira', 'Vicentine Coast · Carrapateira', 'Ondas consistentes e escolas de surf no areal.', 'Consistent waves and surf schools on the sand.', 'Wikipedia', 'Carrapateira, Portugal', 37.16698, -8.90345],
      ['cd38e95f-282e-4d59-bca9-5ff03d43cee8', 'Praia da Cordoama', 'Costa Vicentina · Vila do Bispo', 'Vicentine Coast · Vila do Bispo', 'Falésias altas e pôr do sol sobre o Atlântico.', 'Tall cliffs and sunsets over the Atlantic.', 'Wikipedia', 'Vila do Bispo, Portugal', 37.10942, -8.93782]
    ],
    alentejo: [
      ['4bd3bca5-6c5b-486d-87c0-bd21ea5435ce', 'Zambujeira do Mar', 'Alentejo', 'Alentejo', 'Aldeia branca sobre a falésia e praia em concha.', 'White village on the cliff above a sheltered cove.', 'Wikipedia', 'Zambujeira do Mar, Portugal', 37.52198, -8.78672]
    ],
    lisboa: [
      ['3d2dacea-cfcb-4086-9e15-a7b57ec9f2e7', 'Praia dos Galapinhos', 'Arrábida · Setúbal', 'Arrábida · Setúbal', 'Água verde-esmeralda no parque natural da Arrábida.', 'Emerald water inside the Arrábida natural park.', 'Ricardo Costa / Pexels', 'Setúbal, Portugal', 38.4822, -8.96676],
      ['8d29adfa-7276-4074-bce6-dc1c6b49ae12', 'Praia do Guincho', 'Cascais', 'Cascais', 'Vento, dunas e a serra de Sintra ao fundo.', 'Wind, dunes and the Sintra hills behind.', 'Wikipedia', 'Cascais, Portugal', 38.73067, -9.4749]
    ],
    sintra: [
      ['d81736c8-0e7d-4d98-b369-377998fc5c2f', 'Praia das Maçãs', 'Sintra', 'Sintra', 'Vila de praia com elétrico histórico desde Sintra.', 'Seaside village reached by a historic tram from Sintra.', 'Wikipedia', 'Colares, Sintra, Portugal', 38.82576, -9.4705],
      ['513d687d-b8f9-4d87-b5a7-c6de1d7d695c', 'Praia Grande', 'Sintra', 'Sintra', 'Areal grande, piscina oceânica e pegadas de dinossauro.', 'Big beach, ocean pool and dinosaur footprints.', 'Wikipedia', 'Colares, Sintra, Portugal', 38.81335, -9.47964]
    ],
    centro: [
      ['4c907c07-8bbd-4c37-90f2-8f9e2696f5a0', 'Praia da Nazaré', 'Centro · Nazaré', 'Centre · Nazaré', 'A vila das ondas gigantes, com um areal enorme em frente.', 'Home of the giant waves, with a huge town beach.', 'Wikipedia', 'Nazaré, Portugal', 39.60158, -9.07548]
    ],
    norte: [
      ['b699e6b6-e0cb-4620-9355-e1f3074ddde9', 'Praia de Moledo', 'Norte · Caminha', 'North · Caminha', 'Areia fina junto à foz do Minho e ao monte de Santa Tecla.', 'Fine sand at the Minho river mouth, facing Mount Santa Tecla.', 'Emily DeNio / Pexels', 'Moledo, Caminha, Portugal', 41.84889, -8.86611]
    ],
    ilhas: [
      ['de8ce91b-729b-451d-9eac-1eedd1d62790', 'Praia de Porto Santo', 'Madeira · Porto Santo', 'Madeira · Porto Santo', 'Nove quilómetros de areia dourada e mar calmo.', 'Nine kilometres of golden sand and calm sea.', 'Wikipedia', 'Porto Santo, Madeira, Portugal', 33.0556, -16.3375]
    ]
  };
  var ORDER = ['algarve', 'vicentina', 'alentejo', 'lisboa', 'sintra', 'centro', 'norte', 'ilhas'];

  function dayNumber() {
    var d; try { d = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Lisbon' }); } catch (e) { d = new Date().toISOString().slice(0, 10); }
    return Math.floor(Date.parse(d + 'T00:00:00Z') / 864e5);
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var BED = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 20V8"/><path d="M2 16h20v4"/><path d="M22 16v-4a3 3 0 0 0-3-3H10v7"/><circle cx="6" cy="11.5" r="1.5"/></svg>';
  function cardHtml(b, live) {
    var href = BEACH + b[0], stay = 'https://www.stay22.com/allez/booking?aid=kaptarstudio&amp;campaign=' + CAMP + '&amp;address=' + encodeURIComponent(b[7]);
    var chip = live ? '<span class="hv-bc__q hv-bc__q--calm">' + T.calm + ' · ' + live.w.toFixed(1).replace('.', T.dec) + ' m</span>' : '<span class="hv-bc__q">' + T.q + '</span>';
    return '<li class="hv-bc"><a class="hv-bc__m" href="' + href + '" tabindex="-1" aria-hidden="true"><img src="/images/beaches/' + b[0] + '-480.webp" srcset="/images/beaches/' + b[0] + '-480.webp 480w, /images/beaches/' + b[0] + '-800.webp 800w" sizes="(max-width:760px) 84vw, 290px" alt="' + esc(b[1]) + '" loading="lazy" decoding="async" width="480" height="360">' +
      chip + '<span class="hv-bc__cr">' + T.photo + ': ' + esc(b[6]) + '</span></a><div class="hv-bc__b"><p class="hv-bc__r">' + esc(EN ? b[3] : b[2]) + '</p><h3 class="hv-bc__n"><a href="' + href + '">' + esc(b[1]) + '</a></h3><p class="hv-bc__d">' + esc(EN ? b[5] : b[4]) + '</p>' +
      '<div class="hv-bc__a"><a class="hv-bc__view" href="' + href + '">' + T.view + '</a><a class="hv-bc__stay" href="' + stay + '" target="_blank" rel="noopener noreferrer sponsored">' + BED + T.stay + '</a></div></div></li>';
  }
  var n = dayNumber();
  var picks = ORDER.map(function (k, i) { var g = G[k]; return g[(n + i) % g.length]; });
  function paint(sea) {
    var rows = picks.map(function (b, i) { var d = sea && sea[b[0]]; return { b: b, i: i, live: d && d.w != null && d.w <= 0.6 ? d : null }; });
    rows.sort(function (a, b) { return (b.live ? 1 : 0) - (a.live ? 1 : 0) || a.i - b.i; });
    var html = rows.map(function (r) { return cardHtml(r.b, r.live); }).join('');
    try { if (window.trustedTypes && trustedTypes.createPolicy) { var p = window.__hv4p || (window.__hv4p = trustedTypes.createPolicy('pth-hv4', { createHTML: function (s) { return s; } })); ul.innerHTML = p.createHTML(html); return; } } catch (e) {}
    ul.innerHTML = html;
  }
  paint(null);
  // Mar de agora: so a partir da cache/pedido partilhado do hero (nao faz pedidos extra se o hero ja os fez)
  if (window.LiveCoast && window.LiveCoast.sea) {
    window.LiveCoast.sea(picks.map(function (b) { return { id: b[0], lat: b[8], lng: b[9] }; })).then(function (sea) {
      if (sea && Object.keys(sea).length) paint(sea);
    }).catch(function () {});
  }
})();

/* Balcao "Reservar a viagem" (Lote H2): separadores + formularios dos parceiros.
 * - O CSP tem form-action 'self' -> nao se submete o formulario; constroi-se o link e abre-se com um <a> (passa pelo
 *   js/affiliate.js, que regista o affiliate_click como em qualquer outro link de parceiro).
 * - Datas por defeito: proxima sexta -> domingo (data de Lisboa); saida sempre depois da chegada; nada antes de hoje.
 * - DiscoverCars: o link nao aceita datas -> vai para a pagina da cidade escolhida (base + slug); chan/data1 ja no HTML.
 * - GetYourGuide: date_to = date_from (um dia). BookSurfCamps: /sr?d=<zona>&aid=11861.
 */
(function () {
  'use strict';
  var desk = document.querySelector('#reservar .tk-desk'); if (!desk) return;
  var EN = (document.documentElement.lang || '').toLowerCase().indexOf('en') === 0;
  var tabs = [].slice.call(desk.querySelectorAll('.tk-tab'));
  var panels = tabs.map(function (t) { return document.getElementById(t.getAttribute('aria-controls')); });

  function select(i, focus) {
    tabs.forEach(function (t, k) {
      var on = k === i; t.setAttribute('aria-selected', on ? 'true' : 'false'); t.tabIndex = on ? 0 : -1;
      if (panels[k]) panels[k].hidden = !on;
    });
    if (focus) tabs[i].focus();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { select(i, false); });
    t.addEventListener('keydown', function (e) {
      var n = tabs.length, j = null;
      if (e.key === 'ArrowRight') j = (i + 1) % n; else if (e.key === 'ArrowLeft') j = (i - 1 + n) % n;
      else if (e.key === 'Home') j = 0; else if (e.key === 'End') j = n - 1;
      if (j !== null) { e.preventDefault(); select(j, true); }
    });
  });

  // ── datas ──
  function lisbonToday() {
    var s; try { s = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Lisbon' }); } catch (e) { s = null; }
    var d = s ? new Date(s + 'T12:00:00') : new Date(); d.setHours(12, 0, 0, 0); return d;
  }
  function iso(d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function add(d, n) { var x = new Date(d.getTime()); x.setDate(x.getDate() + n); return x; }
  function parse(v) { return v ? new Date(v + 'T12:00:00') : null; }
  var today = lisbonToday();
  var fri = add(today, ((5 - today.getDay() + 7) % 7) || 7);
  var inp = desk.querySelector('[data-tk="in"]'), out = desk.querySelector('[data-tk="out"]'), day = desk.querySelector('[data-tk="day"]');
  var dayTouched = false;
  if (inp && out) {
    inp.min = iso(today); inp.value = iso(fri);
    out.min = iso(add(fri, 1)); out.value = iso(add(fri, 2));
    inp.addEventListener('change', function () {
      var a = parse(inp.value); if (!a) return;
      out.min = iso(add(a, 1));
      var b = parse(out.value); if (!b || b <= a) out.value = iso(add(a, 2));
      if (day && !dayTouched) day.value = inp.value;
    });
  }
  if (day) { day.min = iso(today); day.value = inp ? inp.value : iso(fri); day.addEventListener('change', function () { dayTouched = true; }); }

  // ── envio ──
  function err(form, msg) {
    var p = form.querySelector('.tk-err');
    if (!msg) { if (p) p.remove(); return; }
    if (!p) { p = document.createElement('p'); p.className = 'tk-err'; p.setAttribute('role', 'alert'); form.querySelector('.tk-row').insertAdjacentElement('afterend', p); }
    p.textContent = msg;
  }
  function open(url) {
    var a = document.createElement('a'); a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer sponsored'; a.style.display = 'none';
    document.body.appendChild(a); a.click(); setTimeout(function () { a.remove(); }, 0);
  }
  panels.forEach(function (form) {
    if (!form || form.tagName !== 'FORM') return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var partner = form.getAttribute('data-partner');
      var action = form.getAttribute('action');
      var skip = {};
      if (partner === 'stay22') {
        var a = parse(inp && inp.value), b = parse(out && out.value);
        if (!a || !b) { err(form, EN ? 'Choose the check-in and check-out dates.' : 'Escolha as datas de chegada e de saída.'); return; }
        if (b <= a) { err(form, EN ? 'Check-out must be after check-in.' : 'A saída tem de ser depois da chegada.'); return; }
      }
      if (partner === 'discovercars') {
        var dc = form.querySelector('[name="dc"]');
        var base = form.getAttribute('data-base') || action, slug = dc ? dc.value : 'faro';
        // Acores: a DiscoverCars tem-nos fora de /portugal/ (valor com caminho completo a comecar por '/')
        action = slug.charAt(0) === '/' ? base.replace(/\/portugal\/?$/, '') + slug : base + slug; skip.dc = 1;
      }
      err(form, null);
      var u; try { u = new URL(action); } catch (x) { return; }
      [].forEach.call(form.elements, function (el) {
        if (!el.name || skip[el.name] || el.disabled) return;
        if (el.value === '') return;
        u.searchParams.set(el.name, el.value);
      });
      if (partner === 'getyourguide' && u.searchParams.get('date_from')) u.searchParams.set('date_to', u.searchParams.get('date_from'));
      try { if (window.track) window.track('home_desk_search', { partner: partner }); else if (window.gtag) window.gtag('event', 'home_desk_search', { partner: partner }); } catch (x) {}
      open(u.href);
    });
  });
})();
