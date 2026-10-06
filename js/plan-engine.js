/**
 * js/plan-engine.js — Planeador automatico (Fase A, 06/10/2026)
 * Motor de regras 100% no browser: transforma o pedido do formulario em links
 * de parceiros JA preenchidos (datas, pessoas, zona). Nunca usa IA para links.
 *
 * Parceiros (IDs verificados — ver claude/afiliados-2026-10.md):
 *  - Alojamento: Stay22 Allez (aid kaptarstudio) -> Booking.com. Usamos o link
 *    Allez direto com address/checkin/checkout/adults/rooms porque o LinkSwap
 *    automatico (booking.com -> stay22) DESCARTA datas e adultos (teste 06/10).
 *  - Surf camps: BookSurfCamps aid=11861
 *  - Atividades / pesca: GetYourGuide partner_id=0WTBHZE, cmp pthplanear(en)[-<origem>]
 *  - Atribuicao: data.origem -> sufixo na campanha Stay22 e no cmp GYG (ex.: -webcams)
 *  - data.base: vila-base escolhida pela pagina de origem (so vilas da regiao)
 *  - Carro: DiscoverCars a_aid=portalturismoportugal
 * Exposto: window.PTHPlanEngine.build(data, lang) e .render(plan, el)
 * Sem innerHTML (TrustedTypes — ver watchlist 11/05/2026).
 */
(function () {
  'use strict';

  var IDS = {
    stay22Aid: 'kaptarstudio',
    gygPartner: '0WTBHZE',
    bscAid: '11861',
    dcAid: 'portalturismoportugal'
  };

  // ── Zonas por regiao. town = base de alojamento por perfil ─────────────
  // car = slug DiscoverCars validado 06/10 (null = pagina Portugal generica)
  // bsc = slug BookSurfCamps validado 06/10 (PT e EN usam o mesmo slug)
  var REGIONS = {
    algarve:       { name: { pt: 'Algarve', en: 'Algarve' },                 town: { def: 'Albufeira', surf: 'Lagos', pesca: 'Portimão', luxo: 'Vilamoura' },
                     car: 'faro',   carCity: 'Faro',      bsc: 'algarve',            gyg: 'Benagil caves boat tour',      fish: 'Portimão' },
    alentejo:      { name: { pt: 'Costa Alentejana', en: 'Alentejo Coast' }, town: { def: 'Vila Nova de Milfontes', surf: 'Zambujeira do Mar', pesca: 'Vila Nova de Milfontes', luxo: 'Comporta' },
                     car: 'lisbon', carCity: 'Lisboa',    bsc: 'alentejo',           gyg: 'Comporta',                     fish: 'Sines' },
    setubal:       { name: { pt: 'Arrábida', en: 'Arrábida' }, town: { def: 'Setúbal', surf: 'Costa da Caparica', pesca: 'Sesimbra' },
                     car: 'lisbon', carCity: 'Lisboa',    bsc: 'costa-da-caparica',  gyg: 'Arrabida dolphin watching',   fish: 'Sesimbra' },
    cascais:       { name: { pt: 'Linha de Cascais', en: 'Cascais coast' }, town: { def: 'Cascais' },
                     car: 'lisbon', carCity: 'Lisboa',    bsc: 'regiao-de-lisboa',   gyg: 'Sintra Cascais',              fish: 'Cascais' },
    'costa-prata': { name: { pt: 'Costa de Prata', en: 'Silver Coast' },     town: { def: 'Nazaré' },
                     car: 'lisbon', carCity: 'Lisboa',    bsc: 'nazare',             gyg: 'Nazare',                      fish: 'Nazaré' },
    oeste:         { name: { pt: 'Oeste', en: 'West Coast' }, town: { def: 'Ericeira', surf: 'Peniche', pesca: 'Peniche' },
                     car: 'lisbon', carCity: 'Lisboa',    bsc: 'oeste',              gyg: 'Berlengas Peniche',           fish: 'Peniche' },
    minho:         { name: { pt: 'Minho', en: 'Minho' },                     town: { def: 'Viana do Castelo' },
                     car: 'porto',  carCity: 'Porto',     bsc: 'viana-do-castelo',   gyg: 'Viana do Castelo',            fish: 'Viana do Castelo' },
    acores:        { name: { pt: 'Açores', en: 'Azores' }, town: { def: 'Ponta Delgada' },
                     car: null,     carCity: 'Ponta Delgada', bsc: 'acores',         gyg: 'Sao Miguel whale watching',   fish: 'Ponta Delgada' },
    madeira:       { name: { pt: 'Madeira', en: 'Madeira' },                 town: { def: 'Funchal' },
                     car: 'madeira', carCity: 'Funchal',  bsc: 'madeira',            gyg: 'Madeira levada walk',         fish: 'Funchal' },
    '':            { name: { pt: 'Portugal', en: 'Portugal' },               town: { def: 'Albufeira', surf: 'Ericeira', pesca: 'Sesimbra', roteiro: 'Lisboa' },
                     car: 'lisbon', carCity: 'Lisboa',    bsc: '',                   gyg: 'Lisbon',                      fish: 'Sesimbra' }
  };
  // Quando a regiao e "qualquer", a base de alojamento define a zona do carro / surf camps
  var ANY_BY_TOWN = {
    'Albufeira': { car: 'faro', carCity: 'Faro', gyg: 'Benagil caves boat tour', region: { pt: 'Algarve', en: 'Algarve' } },
    'Ericeira':  { car: 'lisbon', carCity: 'Lisboa', bsc: 'ericeira', region: { pt: 'Oeste', en: 'West Coast' } },
    'Sesimbra':  { car: 'lisbon', carCity: 'Lisboa', region: { pt: 'Setúbal', en: 'Setúbal' } },
    'Lisboa':    { car: 'lisbon', carCity: 'Lisboa', gyg: 'Lisbon', region: { pt: 'Lisboa', en: 'Lisbon' } }
  };

  // Centro do mapa Stay22: lat/lng so onde foi validado (06/10/2026). Albufeira, Vilamoura,
  // Zambujeira do Mar, Comporta e Ericeira dao 404 com lat/lng -> usam so "address" (centra bem).
  // Peniche com "address" centra no mar -> lat/lng obrigatorio.
  var COORDS = {
    'Lagos': [37.1028, -8.6730], 'Portimão': [37.1366, -8.5377], 'Vila Nova de Milfontes': [37.7250, -8.7830],
    'Setúbal': [38.5244, -8.8882], 'Costa da Caparica': [38.6446, -9.2356], 'Sesimbra': [38.4445, -9.1015],
    'Cascais': [38.6979, -9.4215], 'Nazaré': [39.6012, -9.0700], 'Peniche': [39.3558, -9.3811],
    'Viana do Castelo': [41.6932, -8.8329], 'Ponta Delgada': [37.7412, -25.6756], 'Funchal': [32.6669, -16.9241],
    'Lisboa': [38.7223, -9.1393]
  };

  // Pessoas -> adultos / quartos (Booking via Stay22 aceita adults + rooms)
  var PEOPLE = { '1': [1, 1], '2': [2, 1], '3-4': [4, 1], '5-8': [6, 2], '8+': [8, 3] };

  var DESC = {
    pt: {
      surf: 'Ondas consistentes, escolas certificadas e alojamento perto dos spots — o essencial para uma semana de surf.',
      pesca: 'Porto de pesca ativo, saídas de barco com skipper e espécies variadas ao longo do ano.',
      roteiro: 'Ponto de partida ideal para a grande rota costeira — cidade, praias e gastronomia num só plano.',
      algarve: 'Águas claras, praias extensas e infraestrutura turística de qualidade em todas as épocas.',
      alentejo: 'Praias desertas, dunas de areia fina e natureza protegida sem multidões.',
      setubal: 'Baías de água cristalina, parque natural e mergulho entre os melhores da Europa.',
      cascais: 'Praias urbanas com boas condições, animação noturna e acesso fácil a partir de Lisboa.',
      'costa-prata': 'Ondas com força, aldeias de pescadores autênticas e paisagem atlântica intocada.',
      oeste: 'Duas das melhores ondas da Europa, vilas piscatórias e praias para todos os níveis.',
      minho: 'Praias atlânticas entre pinheiros, rio Lima e natureza do noroeste português.',
      acores: 'Piscinas naturais de basalto, observação de cetáceos e paisagem única no meio do Atlântico.',
      madeira: 'Piscinas naturais de rocha negra, levadas e água temperada todo o ano.',
      '': 'Praias curadas, webcams em tempo real e condições atualizadas diariamente.'
    },
    en: {
      surf: 'Consistent waves, certified schools and stays close to the breaks — everything for a surf week.',
      pesca: 'Active fishing harbour, skippered boat trips and a wide range of species all year round.',
      roteiro: 'The ideal starting point for the great coastal route — city, beaches and food in one plan.',
      algarve: 'Clear water, long beaches and quality tourist infrastructure in every season.',
      alentejo: 'Empty beaches, fine sand dunes and protected nature without the crowds.',
      setubal: 'Crystal-clear bays, a natural park and some of Europe\'s best diving.',
      cascais: 'Town beaches with good conditions, nightlife and easy access from Lisbon.',
      'costa-prata': 'Powerful waves, authentic fishing villages and untouched Atlantic scenery.',
      oeste: 'Two of Europe\'s best waves, fishing villages and beaches for every level.',
      minho: 'Atlantic beaches among pine forests, the Lima river and north-west nature.',
      acores: 'Basalt rock pools, whale watching and unique scenery in the middle of the Atlantic.',
      madeira: 'Black-rock natural pools, levada walks and mild water all year round.',
      '': 'Curated beaches, live webcams and conditions updated daily.'
    }
  };

  var BUDGET = {
    pt: { economico: 'Orçamento económico: no Booking ordene por "Preço (mais baixo primeiro)".',
          moderado:  'Orçamento moderado: no Booking filtre por 3 estrelas.',
          premium:   'Orçamento premium: no Booking filtre por 4 estrelas.',
          luxo:      'Orçamento de luxo: no Booking filtre por 5 estrelas.' },
    en: { economico: 'Budget trip: on Booking sort by "Price (lowest first)".',
          moderado:  'Mid-range: on Booking filter by 3 stars.',
          premium:   'Premium: on Booking filter by 4 stars.',
          luxo:      'Luxury: on Booking filter by 5 stars.' }
  };

  var T = {
    pt: {
      months: ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'],
      nights: function (n) { return n + (n === 1 ? ' noite' : ' noites'); },
      adults: function (n) { return n + (n === 1 ? ' adulto' : ' adultos'); },
      rooms:  function (n) { return n + (n === 1 ? ' quarto' : ' quartos'); },
      noDates: 'escolha as datas no site',
      stayTitle: function (t) { return 'Ver todos os alojamentos em ' + t; },
      campTitle: function (z) { return 'Surf camps — ' + z; },
      campMeta: 'Pacotes com alojamento e aulas · BookSurfCamps',
      surfTitle: function (t) { return 'Aulas de surf em ' + t; },
      fishTitle: function (t) { return 'Saídas de pesca em ' + t; },
      actTitle: function (z) { return 'Experiências — ' + z; },
      carTitle: function (c) { return 'Carro de aluguer em ' + c; },
      carMeta: 'Compare preços de várias rent-a-car · DiscoverCars',
      siteSurf: 'Condições de surf em direto', siteFish: 'Zonas e marés de pesca', siteBeach: 'Praias e condições do mar', siteCams: 'Webcams ao vivo',
      siteMeta: 'Grátis no Portal Turismo Portugal',
      listTitle: 'O seu plano, pronto a reservar',
      disclosure: 'Alguns links são de parceiros: podemos receber uma comissão, sem custo extra para si.',
      titleFor: function (n) { return 'O plano ideal para ' + n; },
      titleDefault: 'O seu plano está pronto',
      groupNote: 'Para grupos, reserve com antecedência.',
      site: { surf: 'surf.html', pesca: 'pesca.html', praia: 'beaches.html', webcams: 'webcams.html' },
      bookingLang: 'pt-pt', bscBase: 'https://www.booksurfcamps.com/pt/all/d/europa/portugal', dcBase: 'https://www.discovercars.com/pt/portugal',
      gygCmp: 'pthplanear', stayCampaign: 'portalturismoportugal-planear',
      sec: { sleep: function (t) { return 'Dormir em ' + t; }, do: 'O que fazer', move: 'Mover-se', site: 'Antes de ir' },
      steps: { sleep: 'Dormir', do: 'Fazer', move: 'Mover-se' },
      checklist: 'A sua viagem completa', of: 'de', next: 'Próximo passo:', allDone: 'Tudo tratado — boa viagem!',
      mapNote: 'Preços em tempo real para as suas datas. Toque num preço para ver o alojamento.',
      mapNoDates: 'Indique as datas no mapa para ver os preços da sua estadia.',
      mapTitle: 'Mapa de alojamentos com preços',
      share: 'Partilhar plano', copied: 'Link copiado — envie ao seu grupo', shareText: 'O nosso plano de viagem:',
      edit: 'Alterar pedido', lang: 'pt'
    },
    en: {
      months: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
      nights: function (n) { return n + (n === 1 ? ' night' : ' nights'); },
      adults: function (n) { return n + (n === 1 ? ' adult' : ' adults'); },
      rooms:  function (n) { return n + (n === 1 ? ' room' : ' rooms'); },
      noDates: 'pick your dates on the site',
      stayTitle: function (t) { return 'See all places to stay in ' + t; },
      campTitle: function (z) { return 'Surf camps — ' + z; },
      campMeta: 'Packages with lodging and lessons · BookSurfCamps',
      surfTitle: function (t) { return 'Surf lessons in ' + t; },
      fishTitle: function (t) { return 'Fishing trips in ' + t; },
      actTitle: function (z) { return 'Experiences — ' + z; },
      carTitle: function (c) { return 'Car hire in ' + c; },
      carMeta: 'Compare prices from many rental companies · DiscoverCars',
      siteSurf: 'Live surf conditions', siteFish: 'Fishing spots and tides', siteBeach: 'Beaches and sea conditions', siteCams: 'Live webcams',
      siteMeta: 'Free on Portal Turismo Portugal',
      listTitle: 'Your plan, ready to book',
      disclosure: 'Some links are partner links: we may earn a commission at no extra cost to you.',
      titleFor: function (n) { return 'The perfect plan for ' + n; },
      titleDefault: 'Your plan is ready',
      groupNote: 'For groups, book early.',
      site: { surf: 'surf.html', pesca: 'pesca.html', praia: 'beaches.html', webcams: 'webcams.html' },
      bookingLang: 'en-gb', bscBase: 'https://www.booksurfcamps.com/all/d/europe/portugal', dcBase: 'https://www.discovercars.com/portugal',
      gygCmp: 'pthplanearen', stayCampaign: 'portalturismoportugal-en-planear',
      sec: { sleep: function (t) { return 'Where to stay in ' + t; }, do: 'Things to do', move: 'Getting around', site: 'Before you go' },
      steps: { sleep: 'Stay', do: 'Do', move: 'Get around' },
      checklist: 'Your complete trip', of: 'of', next: 'Next step:', allDone: 'All sorted — have a great trip!',
      mapNote: 'Live prices for your dates. Tap a price to see the property.',
      mapNoDates: 'Set your dates on the map to see prices for your stay.',
      mapTitle: 'Map of places to stay with prices',
      share: 'Share plan', copied: 'Link copied — send it to your group', shareText: 'Our travel plan:',
      edit: 'Change request', lang: 'en'
    }
  };

  // ── Utilitarios ─────────────────────────────────────────────────────────
  function qs(obj) {
    var out = [];
    for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj, k) && obj[k] !== '' && obj[k] != null) {
      out.push(encodeURIComponent(k) + '=' + encodeURIComponent(obj[k]));
    }
    return out.join('&');
  }
  function parseDate(s) {
    if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
    var p = s.split('-'), d = new Date(+p[0], +p[1] - 1, +p[2]);
    return isNaN(d.getTime()) ? null : d;
  }
  // Datas so entram nos links se forem coerentes (fim > inicio, inicio >= hoje, <= 30 noites)
  function tripDates(a, b) {
    var d1 = parseDate(a), d2 = parseDate(b);
    if (!d1 || !d2) return null;
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var nights = Math.round((d2 - d1) / 86400000);
    if (d1 < today || nights < 1 || nights > 30) return null;
    return { checkin: a, checkout: b, nights: nights, d1: d1, d2: d2 };
  }
  function fmtRange(dt, t) {
    var m1 = t.months[dt.d1.getMonth()], m2 = t.months[dt.d2.getMonth()];
    return m1 === m2 ? dt.d1.getDate() + '–' + dt.d2.getDate() + ' ' + m2
                     : dt.d1.getDate() + ' ' + m1 + ' – ' + dt.d2.getDate() + ' ' + m2;
  }
  function regionTowns(r) {
    var o = (REGIONS[r] || {}).town || {}, out = [];
    for (var k in o) if (out.indexOf(o[k]) === -1) out.push(o[k]);
    return out;
  }
  function stripAccents(s) { return s.normalize ? s.normalize('NFD').replace(/[̀-ͯ]/g, '') : s; }

  // ── Motor ───────────────────────────────────────────────────────────────
  function build(data, lang) {
    lang = lang === 'en' ? 'en' : 'pt';
    var t = T[lang];
    var ints = data.interesses || [];
    var has = function (k) { return ints.indexOf(k) !== -1; };
    var regiao = REGIONS[data.regiao] ? data.regiao : '';
    var R = REGIONS[regiao];
    var budget = data.orcamento || '';

    var profile = has('surf') ? 'surf' : has('pesca') ? 'pesca' : has('roteiro') ? 'roteiro' : 'praia';
    var town = (budget === 'luxo' || budget === 'premium') && R.town.luxo && profile === 'praia' ? R.town.luxo
             : (R.town[profile] || R.town.def);
    // Base escolhida pela pagina de origem (ex.: vila mais perto da praia). So vilas desta regiao.
    var base = regiao && data.base && regionTowns(regiao).indexOf(data.base) !== -1 ? data.base : '';
    if (base) town = base;
    // Atribuicao por ponto de entrada (campanha Stay22 / cmp GYG): so [a-z0-9-], max. 24
    var origem = String(data.origem || '').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 24);
    var suf = origem && origem !== 'direto' ? '-' + origem : '';
    var any = regiao === '' ? (ANY_BY_TOWN[town] || {}) : {};
    var zoneName = regiao ? R.name[lang] : (any.region ? any.region[lang] : R.name[lang]);

    var ppl = PEOPLE[data.pessoas] || [2, 1];
    var dt = tripDates(data.data_inicio, data.data_fim);
    var dateTxt = dt ? fmtRange(dt, t) + ' · ' + t.nights(dt.nights) : t.noDates;
    var links = [];

    // 1. Alojamento — Stay22 Allez (preserva datas/adultos/quartos; testado 06/10)
    var stay = { aid: IDS.stay22Aid, campaign: t.stayCampaign + suf, address: town + ', Portugal', adults: ppl[0], rooms: ppl[1] };
    if (dt) { stay.checkin = dt.checkin; stay.checkout = dt.checkout; }
    links.push({ kind: 'stay', section: 'sleep', partner: 'stay22', primary: true, icon: 'home',
      title: t.stayTitle(town),
      meta: dateTxt + ' · ' + t.adults(ppl[0]) + (ppl[1] > 1 ? ' · ' + t.rooms(ppl[1]) : '') + ' · Booking.com',
      href: 'https://www.stay22.com/allez/booking?' + qs(stay) });

    // GYG base
    function gyg(q) {
      var p = { q: q, partner_id: IDS.gygPartner, cmp: t.gygCmp + suf };
      if (dt) { p.date_from = dt.checkin; p.date_to = dt.checkout; }
      return 'https://www.getyourguide.com/s/?' + qs(p);
    }
    var gygMeta = (dt ? fmtRange(dt, t) + ' · ' : '') + 'GetYourGuide';

    // 2. Surf: camp (BookSurfCamps) + aulas (GYG)
    if (has('surf')) {
      var bscSlug = regiao ? R.bsc : (any.bsc || '');
      links.push({ kind: 'surfcamp', section: 'do', partner: 'booksurfcamps', icon: 'wave',
        title: t.campTitle(zoneName), meta: t.campMeta,
        href: t.bscBase + (bscSlug ? '/' + bscSlug : '') + '?aid=' + IDS.bscAid });
      links.push({ kind: 'surf', section: 'do', partner: 'getyourguide', icon: 'star',
        title: t.surfTitle(town), meta: gygMeta, href: gyg('surf lessons ' + stripAccents(town)) });
    }
    // 3. Pesca (FishingBooker quando aprovado — ate la GYG)
    if (has('pesca')) {
      links.push({ kind: 'fish', section: 'do', partner: 'getyourguide', icon: 'fish',
        title: t.fishTitle(regiao ? R.fish : town), meta: gygMeta,
        href: gyg('fishing trip ' + stripAccents(regiao ? R.fish : town)) });
    }
    // 4. Atividades gerais (praia / roteiro / webcams / outro) — so se ainda nao ha GYG de surf/pesca
    if (!has('surf') && !has('pesca')) {
      var q = regiao ? R.gyg : (any.gyg || stripAccents(town));
      if (has('roteiro')) q = 'food tour ' + (regiao ? stripAccents(town) : 'Lisbon');
      links.push({ kind: 'activity', section: 'do', partner: 'getyourguide', icon: 'star',
        title: t.actTitle(regiao ? zoneName : town), meta: gygMeta, href: gyg(q) });
    }
    // 5. Carro — DiscoverCars
    var carSlug = regiao ? R.car : (any.car || 'lisbon');
    var carCity = regiao ? R.carCity : (any.carCity || 'Lisboa');
    if (lang === 'en' && carCity === 'Lisboa') carCity = 'Lisbon';
    links.push({ kind: 'car', section: 'move', partner: 'discovercars', icon: 'car',
      title: t.carTitle(carCity), meta: t.carMeta,
      href: t.dcBase + (carSlug ? '/' + carSlug : '') + '?a_aid=' + IDS.dcAid });
    // 6. Do site (confianca; nao fatura)
    var siteKey = has('surf') ? 'surf' : has('pesca') ? 'pesca' : has('webcams') ? 'webcams' : 'praia';
    var siteLabel = { surf: t.siteSurf, pesca: t.siteFish, webcams: t.siteCams, praia: t.siteBeach }[siteKey];
    links.push({ kind: 'site', section: 'site', partner: '', icon: 'pin', internal: true,
      title: siteLabel, meta: t.siteMeta, href: t.site[siteKey] });

    links = links.slice(0, 6);

    var first = (data.nome || '').trim().split(' ')[0];
    var note = BUDGET[lang][budget] || '';
    if (data.pessoas === '5-8' || data.pessoas === '8+') note = (note ? note + ' ' : '') + t.groupNote;

    var map = { aid: IDS.stay22Aid, campaign: t.stayCampaign + suf + '-mapa', address: town + ', Portugal',
                adults: ppl[0], rooms: ppl[1], currency: 'EUR', lang: lang, maincolor: '0A3D6B', zoom: 13 };
    if (dt) { map.checkin = dt.checkin; map.checkout = dt.checkout; }
    if (COORDS[town]) { map.lat = COORDS[town][0]; map.lng = COORDS[town][1]; }
    var share = { plano: '1', i: ints.join(','), r: regiao, n: data.pessoas || '', o: budget };
    if (base) share.b = base;
    if (dt) { share.de = dt.checkin; share.ate = dt.checkout; }

    return {
      lang: lang,
      town: town,
      hasDates: !!dt,
      mapUrl: 'https://www.stay22.com/embed/gm?' + qs(map),
      shareQuery: qs(share),
      progressKey: 'pth_plan_progress_' + [regiao || 'any', ints.join('-'), town, dt ? dt.checkin : ''].join('_'),
      title: first ? t.titleFor(first) : t.titleDefault,
      destination: town + (zoneName && zoneName !== town ? ' — ' + zoneName : ''),
      desc: DESC[lang][profile === 'praia' ? regiao : profile] || DESC[lang][regiao] || DESC[lang][''],
      budgetNote: note,
      listTitle: t.listTitle,
      disclosure: t.disclosure,
      links: links,
      analytics: { regiao: regiao || 'qualquer', interesses: ints.join(','), orcamento: budget || 'nd',
                   pessoas: data.pessoas || 'nd', noites: dt ? dt.nights : 0, base: town, n_links: links.length }
    };
  }

  // ── Render (DOM puro) ───────────────────────────────────────────────────
  var SVGNS = 'http://www.w3.org/2000/svg';
  var ICONS = {
    home: ['path', { d: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' }, 'polyline', { points: '9 22 9 12 15 12 15 22' }],
    wave: ['path', { d: 'M2 12c2-2 4-2 6 0s4 2 6 0 4-2 6 0' }, 'path', { d: 'M2 17c2-2 4-2 6 0s4 2 6 0 4-2 6 0' }],
    star: ['polygon', { points: '12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2' }],
    fish: ['line', { x1: '4', y1: '20', x2: '20', y2: '4' }, 'path', { d: 'M20 4h-6m6 0v6' }, 'path', { d: 'M8 20c0-4 4-8 8-8' }],
    car:  ['path', { d: 'M5 17h14M5 17a2 2 0 1 1-4 0v-5l2-5h14l2 5v5a2 2 0 1 1-4 0' }, 'circle', { cx: '7', cy: '17', r: '2' }, 'circle', { cx: '17', cy: '17', r: '2' }],
    pin:  ['path', { d: 'M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z' }],
    share: ['circle', { cx: '18', cy: '5', r: '3' }, 'circle', { cx: '6', cy: '12', r: '3' }, 'circle', { cx: '18', cy: '19', r: '3' }, 'line', { x1: '8.6', y1: '13.5', x2: '15.4', y2: '17.5' }, 'line', { x1: '15.4', y1: '6.5', x2: '8.6', y2: '10.5' }]
  };
  function icon(name) {
    var s = document.createElementNS(SVGNS, 'svg');
    var a = { width: '18', height: '18', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2.2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true', 'class': 'plan-link-ico' };
    for (var k in a) s.setAttribute(k, a[k]);
    var def = ICONS[name] || ICONS.star;
    for (var i = 0; i < def.length; i += 2) {
      var el = document.createElementNS(SVGNS, def[i]);
      for (var at in def[i + 1]) el.setAttribute(at, def[i + 1][at]);
      s.appendChild(el);
    }
    return s;
  }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function gaEvent(name, params) {
    if (typeof window.gtag === 'function') { try { window.gtag('event', name, params); } catch (e) { /* noop */ } }
  }
  function lsGet(k) { try { return JSON.parse(window.localStorage.getItem(k) || '{}') || {}; } catch (e) { return {}; } }
  function lsSet(k, v) { try { window.localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* noop */ } }

  function linkEl(l) {
    var a = el('a', (l.primary ? 'success-btn-primary' : 'success-btn-outline') + ' plan-link');
    a.href = l.href;
    a.setAttribute('data-plan-kind', l.kind);
    a.setAttribute('data-plan-section', l.section);
    if (!l.internal) { a.target = '_blank'; a.rel = 'sponsored noopener'; }
    a.appendChild(icon(l.icon));
    var txt = el('span', 'plan-link-txt');
    txt.appendChild(el('strong', 'plan-link-title', l.title));
    txt.appendChild(el('small', 'plan-link-meta', l.meta));
    a.appendChild(txt);
    a.appendChild(el('span', 'plan-link-go', '→')).setAttribute('aria-hidden', 'true');
    return a;
  }

  // opts: { onEdit: fn }  — devolve nada; constroi o "trip board" dentro de container
  function render(plan, container, opts) {
    opts = opts || {};
    var t = T[plan.lang];
    // Contentor novo a cada render: evita listeners duplicados ao "Alterar pedido"
    var fresh = container.cloneNode(false);
    if (container.parentNode) container.parentNode.replaceChild(fresh, container);
    container = fresh;
    container.classList.add('plan-links');

    // 1. Checklist "viagem completa" (Dormir · Fazer · Mover-se) — marca ao abrir cada link
    var steps = ['sleep', 'do', 'move'].filter(function (k) {
      return plan.links.some(function (l) { return l.section === k; });
    });
    var progress = lsGet(plan.progressKey);
    var chk = el('div', 'plan-check');
    var chkHead = el('div', 'plan-check-head');
    var chkTitle = el('strong', null, t.checklist);
    var chkCount = el('span', 'plan-check-count');
    chkHead.appendChild(chkTitle); chkHead.appendChild(chkCount);
    var chkRow = el('div', 'plan-check-row');
    var chkNext = el('p', 'plan-check-next');
    var chips = {};
    steps.forEach(function (k) {
      var c = el('span', 'plan-check-chip');
      c.appendChild(el('span', 'plan-check-dot'));
      c.appendChild(document.createTextNode(t.steps[k]));
      chips[k] = c; chkRow.appendChild(c);
    });
    chk.appendChild(chkHead); chk.appendChild(chkRow); chk.appendChild(chkNext);
    function paint() {
      var done = 0, next = null;
      steps.forEach(function (k) {
        var on = !!progress[k];
        chips[k].classList.toggle('is-done', on);
        if (on) done++; else if (!next) next = k;
      });
      chkCount.textContent = done + ' ' + t.of + ' ' + steps.length;
      if (!next) { chkNext.textContent = t.allDone; return; }
      var nl = plan.links.filter(function (l) { return l.section === next; })[0];
      chkNext.textContent = t.next + ' ' + (nl ? nl.title : t.steps[next]);
    }
    function mark(sec, how) {
      if (steps.indexOf(sec) === -1 || progress[sec]) return;
      progress[sec] = Date.now(); lsSet(plan.progressKey, progress); paint();
      gaEvent('plan_step_opened', { step: sec, via: how || 'link', regiao: plan.analytics.regiao });
    }
    paint();
    container.appendChild(chk);

    // 2. Secoes
    var order = ['sleep', 'do', 'move', 'site'];
    order.forEach(function (sec) {
      var ls = plan.links.filter(function (l) { return l.section === sec; });
      if (!ls.length) return;
      var box = el('section', 'plan-sec plan-sec--' + sec);
      box.appendChild(el('h4', 'plan-sec-title', sec === 'sleep' ? t.sec.sleep(plan.town) : t.sec[sec]));
      if (sec === 'sleep') {
        var wrap = el('div', 'plan-map');
        var ifr = document.createElement('iframe');
        ifr.src = plan.mapUrl;
        ifr.title = t.mapTitle;
        ifr.loading = 'lazy';
        ifr.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
        wrap.appendChild(ifr);
        box.appendChild(wrap);
        box.appendChild(el('p', 'plan-map-note', plan.hasDates ? t.mapNote : t.mapNoDates));
        // Cliques dentro do iframe nao chegam ao affiliate.js: detetar pelo blur da janela
        mapState.frame = ifr;
        mapState.onClick = function () {
          mark('sleep', 'map');
          gaEvent('affiliate_click', { partner: 'stay22_map', link_destination: 'stay22.com/embed/gm', page_path: location.pathname });
        };
        if (!mapState.bound) {
          mapState.bound = true;
          window.addEventListener('blur', function () {
            setTimeout(function () {
              if (mapState.frame && document.activeElement === mapState.frame && mapState.onClick) mapState.onClick();
            }, 0);
          });
        }
      }
      ls.forEach(function (l) { box.appendChild(linkEl(l)); });
      container.appendChild(box);
    });

    container.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[data-plan-section]');
      if (a) mark(a.getAttribute('data-plan-section'), 'link');
    });

    // 3. Partilhar / alterar
    var bar = el('div', 'plan-actions');
    var shareBtn = el('button', 'plan-share');
    shareBtn.type = 'button';
    shareBtn.appendChild(icon('share'));
    shareBtn.appendChild(document.createTextNode(t.share));
    var shareMsg = el('span', 'plan-share-msg');
    shareMsg.setAttribute('aria-live', 'polite');
    shareBtn.addEventListener('click', function () {
      var url = location.origin + location.pathname + '?' + plan.shareQuery;
      gaEvent('plan_shared', { regiao: plan.analytics.regiao, metodo: navigator.share ? 'native' : 'copy' });
      if (navigator.share) {
        navigator.share({ title: document.title, text: t.shareText + ' ' + plan.destination, url: url }).catch(function () {});
        return;
      }
      var done = function () { shareMsg.textContent = t.copied; };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(done, function () { shareMsg.textContent = url; });
      } else { shareMsg.textContent = url; }
    });
    bar.appendChild(shareBtn);
    if (typeof opts.onEdit === 'function') {
      var editBtn = el('button', 'plan-edit', t.edit);
      editBtn.type = 'button';
      editBtn.addEventListener('click', opts.onEdit);
      bar.appendChild(editBtn);
    }
    container.appendChild(bar);
    container.appendChild(shareMsg);
    container.appendChild(el('p', 'plan-disclosure', plan.disclosure));
    return container;
  }
  var mapState = { frame: null, onClick: null, bound: false };

  // Le um plano partilhado (?plano=1&i=&r=&n=&de=&ate=&o=) — so valores da lista branca
  function readShared(search) {
    var p = new URLSearchParams(search || location.search);
    if (p.get('plano') !== '1') return null;
    var okI = ['praia', 'surf', 'pesca', 'webcams', 'roteiro', 'outro'];
    var ints = (p.get('i') || '').split(',').filter(function (x) { return okI.indexOf(x) !== -1; });
    if (!ints.length) return null;
    var r = p.get('r') || '';
    var okN = ['1', '2', '3-4', '5-8', '8+'];
    var okO = ['economico', 'moderado', 'premium', 'luxo'];
    var d = function (k) { var v = p.get(k) || ''; return /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null; };
    return {
      interesses: ints,
      regiao: REGIONS[r] ? r : '',
      pessoas: okN.indexOf(p.get('n')) !== -1 ? p.get('n') : null,
      data_inicio: d('de'), data_fim: d('ate'),
      orcamento: okO.indexOf(p.get('o')) !== -1 ? p.get('o') : null,
      base: REGIONS[r] && regionTowns(r).indexOf(p.get('b')) !== -1 ? p.get('b') : '',
      nome: ''
    };
  }

  window.PTHPlanEngine = { build: build, render: render, readShared: readShared, regionTowns: regionTowns, _regions: REGIONS };
})();
