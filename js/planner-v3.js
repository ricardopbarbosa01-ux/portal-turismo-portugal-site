/**
 * js/planner-v3.js — Planeador v3 (06/10/2026) · PT + EN · instalável como app (PWA)
 * Experiencia propria (app-like). Links de parceiros: SEMPRE via js/plan-engine.js
 * (IDs garantidos). Dados reais: mapa Stay22 com precos, praias da BD (Supabase),
 * condicoes do mar/meteo (open-meteo). Sem innerHTML com dados externos.
 * Lingua: <html lang="en..."> -> ingles; caso contrario portugues.
 */
(function () {
  'use strict';

  var SB_URL = 'https://glupdjvdvunogkqgxoui.supabase.co';
  var SB_KEY = 'sb_publishable_HKdE2IRmz9lMDcg4p3l1tw_HiTdD4nw'; // publishable (igual a js/config.js)
  var TURNSTILE_KEY = '0x4AAAAAADFrwvqNt1FGaqkB';
  // Condições ao vivo (Open-Meteo). ATENÇÃO: a API gratuita só permite uso NÃO comercial
  // (open-meteo.com/en/terms). Pôr a false se não houver subscrição comercial.
  var LIVE_CONDITIONS = true;

  var LANG = /^en/i.test(document.documentElement.lang || '') ? 'en' : 'pt';
  var EN = LANG === 'en';

  // ── Textos (PT / EN) ──────────────────────────────────────────────────────
  var I18N = {
    pt: {
      regions: { algarve: ['Algarve', 'Falésias e água calma'], alentejo: ['Costa Alentejana', 'Praias selvagens'], setubal: ['Arrábida', 'Baías turquesa'], cascais: ['Cascais e Lisboa', 'Cidade e praia'], oeste: ['Oeste', 'Peniche e Ericeira'], 'costa-prata': ['Costa de Prata', 'Nazaré e ondas gigantes'], minho: ['Minho', 'Verde e atlântico'], madeira: ['Madeira', 'Primavera todo o ano'], acores: ['Açores', 'Natureza vulcânica'], '': ['Surpreendam-me', 'Escolhemos por si'] },
      interests: { praia: ['Praia', 'Sol, mar e descanso'], surf: ['Surf', 'Aulas, camps e spots'], pesca: ['Pesca', 'Barco ou costa'], roteiro: ['Cidade e sabores', 'Cultura e gastronomia'] },
      people: { '1': ['Só eu', '1 adulto'], '2': ['A dois', '2 adultos'], '3-4': ['Família', '3 a 4 pessoas'], '5-8': ['Grupo', '5 a 8 pessoas'], '8+': ['Grupo grande', 'Mais de 8'] },
      budgets: { economico: ['Económico', 'Hostels, AL e boa relação preço'], moderado: ['Confortável', 'Hotéis 3★ e casas com carácter'], premium: ['Premium', 'Hotéis 4★ e boutique'], luxo: ['Sem limite', 'Resorts e 5★'] },
      steps: { interesses: ['O que lhe apetece fazer?', 'Pode escolher mais do que um.'], regiao: ['Para onde quer ir?', 'Escolhemos a melhor base para dormir.'], datas: ['Quando?', 'Com datas, mostramos preços reais da sua estadia.'], pessoas: ['Quem vai?', ''], orcamento: ['Que estilo de viagem?', ''] },
      stepOf: function (a, b) { return 'Passo ' + a + ' de ' + b; },
      arrival: 'Chegada', departure: 'Partida', dateErr: 'A partida tem de ser depois da chegada.',
      quickWeekend: 'Próximo fim de semana', quick2w: 'Daqui a 2 semanas · 7 noites',
      quickMonth: function (m) { return 'Início de ' + m + ' · 4 noites'; }, quickUnknown: 'Ainda não sei',
      monthsLong: ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'],
      months: ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],
      nights: function (n) { return n + (n === 1 ? ' noite' : ' noites'); },
      next: 'Continuar', create: 'Criar o meu plano',
      prevLabels: ['Interesse', 'Destino', 'Datas', 'Viajantes', 'Estilo'], flexible: 'Flexível',
      prevTitle: ['A sua viagem começa aqui', 'A sua viagem está a tomar forma', 'Tudo pronto — vamos montar o seu plano'],
      engineErr: 'Não foi possível carregar o planeador. Recarregue a página — se persistir, veja os nossos guias de onde ficar.',
      kickerOwn: 'O seu plano está pronto', kickerShared: 'Plano partilhado consigo',
      flexDates: 'Datas flexíveis', anyStyle: 'Qualquer estilo', twoAdults: '2 adultos',
      share: 'Partilhar', edit: 'Alterar', copied: 'Link copiado — envie ao seu grupo.', shareTitle: 'Plano de viagem: ',
      photo: 'Foto: ', photos: 'Fotos: ', unknownAuthor: 'autor desconhecido',
      nowIn: 'Agora em ', air: 'Ar', forecastFor: 'Previsão p/ ', water: 'Água', waves: 'Ondas', dec: ',',
      sleepIn: 'Onde dormir em ', pricesFor: function (r, p) { return 'Preços reais para ' + r + ' · ' + p + '. Toque num preço para ver o alojamento.'; },
      pickDates: 'Escolha as datas no mapa para ver os preços da sua estadia.', mapTitle: 'Mapa de alojamentos com preços em ',
      ctaAvail: 'Ver disponibilidade', ctaPrices: 'Ver preços', ctaCompare: 'Comparar preços', ctaOptions: 'Ver opções',
      doTitle: 'O que fazer', doSub: 'Experiências com reserva online', doSubDates: ', já filtradas para as suas datas.',
      beachesNear: 'Praias a não perder perto de ', beachMeta: ' km · condições e webcam', beachUrl: '/beach.html?id=',
      moveTitle: 'Como se deslocar', moveSub: 'Compare dezenas de rent-a-car num só sítio.',
      tripDone: 'A sua viagem completa', tripDoneSub: 'Reserve cada parte e marcamos aqui.',
      stepNames: { sleep: 'Alojamento', do: 'Experiências', move: 'Carro' },
      nextStep: { sleep: function (t) { return 'Próximo: alojamento em ' + t; }, move: function () { return 'Próximo: carro de aluguer'; }, do: function () { return 'Próximo: experiências'; } },
      nextBtn: { sleep: 'Ver alojamento', move: 'Ver carros', do: 'Ver experiências' }, allDone: 'Viagem completa — boa viagem!',
      saveTitle: 'Guardar este plano', saveSub: 'Receba o link do plano no seu email e sugestões da nossa equipa local. Sem spam.',
      emailPh: 'o.seu@email.com', saveBtn: 'Guardar plano', legal1: 'Ao guardar, aceita a nossa ', legalLink: 'Política de Privacidade',
      legal2: '. Pode pedir a remoção a qualquer momento.', privacyUrl: '/privacidade.html',
      emailBad: 'Indique um email válido.', robot: 'A verificar que não é um robô… tente de novo dentro de 2 segundos.',
      saving: 'A guardar…', saved: '✓ Plano guardado. Obrigado — a nossa equipa pode enviar-lhe sugestões.', saveFail: 'Não foi possível guardar agora. O plano continua disponível acima.',
      trust: [['shield', 'Paga o mesmo preço', 'Reserva diretamente nos parceiros. Se reservar por estes links, recebemos uma pequena comissão que mantém o portal gratuito.'],
        ['bolt', 'Preços em tempo real', 'O mapa mostra a disponibilidade e os preços atuais dos parceiros para as suas datas.'],
        ['pin', 'Conhecimento local', 'Praias, webcams e condições do mar acompanhadas diariamente pelo Portal Turismo Portugal.']],
      partners: 'Parceiros: Booking.com · Vrbo · GetYourGuide · DiscoverCars · BookSurfCamps',
      resume: function (t) { return 'Continuar o meu plano para ' + t; },
      appTitle: 'Leve o plano consigo', appSub: 'Instale a app do planeador no telemóvel: abre num toque, sem loja de apps.',
      appBtn: 'Instalar app', appTop: 'Instalar app',
      iosTitle: 'Adicionar ao ecrã principal', iosSteps: ['Toque no botão Partilhar', 'Escolha "Adicionar ao ecrã principal"', 'Toque em "Adicionar"'],
      iosClose: 'Percebi', installed: '✓ App instalada.'
    },
    en: {
      regions: { algarve: ['Algarve', 'Cliffs and calm water'], alentejo: ['Alentejo Coast', 'Wild beaches'], setubal: ['Arrábida', 'Turquoise bays'], cascais: ['Cascais & Lisbon', 'City and beach'], oeste: ['West Coast', 'Peniche & Ericeira'], 'costa-prata': ['Silver Coast', 'Nazaré & giant waves'], minho: ['Minho', 'Green and Atlantic'], madeira: ['Madeira', 'Spring all year'], acores: ['Azores', 'Volcanic nature'], '': ['Surprise me', 'We pick for you'] },
      interests: { praia: ['Beach', 'Sun, sea and rest'], surf: ['Surf', 'Lessons, camps and spots'], pesca: ['Fishing', 'Boat or shore'], roteiro: ['City & food', 'Culture and cuisine'] },
      people: { '1': ['Just me', '1 adult'], '2': ['Couple', '2 adults'], '3-4': ['Family', '3 to 4 people'], '5-8': ['Group', '5 to 8 people'], '8+': ['Large group', 'More than 8'] },
      budgets: { economico: ['Budget', 'Hostels, rentals, good value'], moderado: ['Comfortable', '3★ hotels and charming stays'], premium: ['Premium', '4★ and boutique hotels'], luxo: ['No limit', 'Resorts and 5★'] },
      steps: { interesses: ['What do you feel like doing?', 'You can pick more than one.'], regiao: ['Where do you want to go?', 'We pick the best base to stay.'], datas: ['When?', 'With dates, we show real prices for your stay.'], pessoas: ['Who is going?', ''], orcamento: ['What travel style?', ''] },
      stepOf: function (a, b) { return 'Step ' + a + ' of ' + b; },
      arrival: 'Check-in', departure: 'Check-out', dateErr: 'Check-out must be after check-in.',
      quickWeekend: 'Next weekend', quick2w: 'In 2 weeks · 7 nights',
      quickMonth: function (m) { return 'Early ' + m + ' · 4 nights'; }, quickUnknown: 'Not sure yet',
      monthsLong: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      nights: function (n) { return n + (n === 1 ? ' night' : ' nights'); },
      next: 'Continue', create: 'Create my plan',
      prevLabels: ['Interest', 'Destination', 'Dates', 'Travellers', 'Style'], flexible: 'Flexible',
      prevTitle: ['Your trip starts here', 'Your trip is taking shape', 'All set — let’s build your plan'],
      engineErr: 'The planner could not load. Please reload the page — if it persists, see our where-to-stay guides.',
      kickerOwn: 'Your plan is ready', kickerShared: 'A plan shared with you',
      flexDates: 'Flexible dates', anyStyle: 'Any style', twoAdults: '2 adults',
      share: 'Share', edit: 'Edit', copied: 'Link copied — send it to your group.', shareTitle: 'Travel plan: ',
      photo: 'Photo: ', photos: 'Photos: ', unknownAuthor: 'unknown author',
      nowIn: 'Now in ', air: 'Air', forecastFor: 'Forecast ', water: 'Water', waves: 'Waves', dec: '.',
      sleepIn: 'Where to stay in ', pricesFor: function (r, p) { return 'Live prices for ' + r + ' · ' + p + '. Tap a price to see the property.'; },
      pickDates: 'Set your dates on the map to see prices for your stay.', mapTitle: 'Map of places to stay with prices in ',
      ctaAvail: 'Check availability', ctaPrices: 'See prices', ctaCompare: 'Compare prices', ctaOptions: 'See options',
      doTitle: 'Things to do', doSub: 'Experiences you can book online', doSubDates: ', already filtered for your dates.',
      beachesNear: 'Beaches not to miss near ', beachMeta: ' km · conditions and webcam', beachUrl: '/en/beach.html?id=',
      moveTitle: 'Getting around', moveSub: 'Compare dozens of car rental companies in one place.',
      tripDone: 'Your complete trip', tripDoneSub: 'Book each part and we tick it off here.',
      stepNames: { sleep: 'Place to stay', do: 'Experiences', move: 'Car' },
      nextStep: { sleep: function (t) { return 'Next: places to stay in ' + t; }, move: function () { return 'Next: car hire'; }, do: function () { return 'Next: experiences'; } },
      nextBtn: { sleep: 'See places', move: 'See cars', do: 'See experiences' }, allDone: 'Trip complete — have a great time!',
      saveTitle: 'Save this plan', saveSub: 'Get the plan link by email plus tips from our local team. No spam.',
      emailPh: 'your@email.com', saveBtn: 'Save plan', legal1: 'By saving, you accept our ', legalLink: 'Privacy Policy',
      legal2: '. You can ask us to delete it at any time.', privacyUrl: '/en/privacy.html',
      emailBad: 'Please enter a valid email.', robot: 'Checking you are not a robot… please try again in 2 seconds.',
      saving: 'Saving…', saved: '✓ Plan saved. Thank you — our team may send you some tips.', saveFail: 'Could not save right now. Your plan is still available above.',
      trust: [['shield', 'You pay the same price', 'You book directly with our partners. If you book through these links, we earn a small commission that keeps the site free.'],
        ['bolt', 'Live prices', 'The map shows partners’ current availability and prices for your dates.'],
        ['pin', 'Local knowledge', 'Beaches, webcams and sea conditions tracked daily by Portal Turismo Portugal.']],
      partners: 'Partners: Booking.com · Vrbo · GetYourGuide · DiscoverCars · BookSurfCamps',
      resume: function (t) { return 'Continue my plan for ' + t; },
      appTitle: 'Take your plan with you', appSub: 'Install the planner app on your phone: one tap to open, no app store.',
      appBtn: 'Install app', appTop: 'Install app',
      iosTitle: 'Add to Home Screen', iosSteps: ['Tap the Share button', 'Choose “Add to Home Screen”', 'Tap “Add”'],
      iosClose: 'Got it', installed: '✓ App installed.'
    }
  };
  var L = I18N[LANG];
  var TOWN_LABEL = EN ? { 'Lisboa': 'Lisbon' } : {};
  function townLabel(t) { return TOWN_LABEL[t] || t; }

  // ── Geografia ─────────────────────────────────────────────────────────────
  var TOWN_GEO = {
    'Albufeira': [37.0885, -8.2503], 'Lagos': [37.1028, -8.6730], 'Portimão': [37.1366, -8.5377],
    'Vilamoura': [37.0770, -8.1170], 'Vila Nova de Milfontes': [37.7250, -8.7830],
    'Zambujeira do Mar': [37.5250, -8.7850], 'Comporta': [38.3800, -8.7860], 'Setúbal': [38.5244, -8.8882],
    'Costa da Caparica': [38.6446, -9.2356], 'Sesimbra': [38.4445, -9.1015], 'Cascais': [38.6979, -9.4215],
    'Nazaré': [39.6012, -9.0700], 'Ericeira': [38.9631, -9.4153], 'Peniche': [39.3558, -9.3811],
    'Viana do Castelo': [41.6932, -8.8329], 'Ponta Delgada': [37.7412, -25.6756],
    'Funchal': [32.6669, -16.9241], 'Lisboa': [38.7223, -9.1393]
  };
  function opts(map, extra) { return Object.keys(map).map(function (k) { var o = { v: k, t: map[k][0], s: map[k][1] }; if (extra) for (var x in extra[k]) o[x] = extra[k][x]; return o; }); }
  var REGIONS = opts(L.regions, { algarve: { town: 'Lagos' }, alentejo: { town: 'Vila Nova de Milfontes' }, setubal: { town: 'Sesimbra' }, cascais: { town: 'Cascais' }, oeste: { town: 'Peniche' }, 'costa-prata': { town: 'Nazaré' }, minho: { town: 'Viana do Castelo' }, madeira: { town: 'Funchal' }, acores: { town: 'Ponta Delgada' }, '': { town: 'Albufeira' } });
  // Object.keys poe '' em primeiro em alguns motores? Nao: chaves string mantem a ordem de insercao. Garantir '' no fim:
  REGIONS.sort(function (a, b) { return (a.v === '') - (b.v === ''); });
  var INTERESTS = opts(L.interests, { praia: { i: 'sun' }, surf: { i: 'wave' }, pesca: { i: 'fish' }, roteiro: { i: 'map' } });
  var PEOPLE = opts(L.people);
  PEOPLE.sort(function (a, b) { return ['1', '2', '3-4', '5-8', '8+'].indexOf(a.v) - ['1', '2', '3-4', '5-8', '8+'].indexOf(b.v); });
  var BUDGETS = opts(L.budgets);
  var STEPS = ['interesses', 'regiao', 'datas', 'pessoas', 'orcamento'].map(function (k) { return { k: k, q: L.steps[k][0], h: L.steps[k][1] }; });

  // ── Estado ────────────────────────────────────────────────────────────────
  var state = { step: 0, interesses: [], regiao: null, base: '', data_inicio: '', data_fim: '', pessoas: null, orcamento: null, nome: '' };
  var beaches = [];
  var $ = function (id) { return document.getElementById(id); };

  // ── Utilitarios DOM ───────────────────────────────────────────────────────
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  var SVGNS = 'http://www.w3.org/2000/svg';
  var ICONS = {
    sun: [['circle', { cx: 12, cy: 12, r: 4 }], ['path', { d: 'M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4' }]],
    wave: [['path', { d: 'M2 12c2-2 4-2 6 0s4 2 6 0 4-2 6 0' }], ['path', { d: 'M2 17c2-2 4-2 6 0s4 2 6 0 4-2 6 0' }], ['path', { d: 'M2 7c2-2 4-2 6 0s4 2 6 0 4-2 6 0' }]],
    fish: [['path', { d: 'M2.5 12C5 8.5 8.5 6.5 12.5 6.5s6 2.5 7.5 5.5c-1.5 3-3.5 5.5-7.5 5.5S5 15.5 2.5 12z' }], ['path', { d: 'm20 12 2.5-3v6z' }], ['circle', { cx: 7.5, cy: 11, r: 1 }]],
    map: [['path', { d: 'M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2z' }], ['path', { d: 'M9 4v14M15 6v14' }]],
    bed: [['path', { d: 'M3 18V7M3 13h18v5M21 18v-3a3 3 0 0 0-3-3h-8v4' }], ['circle', { cx: 7, cy: 10.5, r: 1.6 }]],
    star: [['path', { d: 'm12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z' }]],
    car: [['path', { d: 'M5 17h14M5 17a2 2 0 1 1-4 0v-5l2-5h14l2 5v5a2 2 0 1 1-4 0' }], ['circle', { cx: 7, cy: 17, r: 2 }], ['circle', { cx: 17, cy: 17, r: 2 }]],
    pin: [['path', { d: 'M12 22s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z' }], ['circle', { cx: 12, cy: 10, r: 2.5 }]],
    check: [['path', { d: 'm5 12 5 5 9-10' }]],
    arrow: [['path', { d: 'M5 12h14M13 6l6 6-6 6' }]],
    back: [['path', { d: 'M19 12H5M11 6l-6 6 6 6' }]],
    share: [['circle', { cx: 18, cy: 5, r: 3 }], ['circle', { cx: 6, cy: 12, r: 3 }], ['circle', { cx: 18, cy: 19, r: 3 }], ['path', { d: 'm8.6 13.5 6.8 4M15.4 6.5l-6.8 4' }]],
    ios: [['path', { d: 'M12 3v12M8 7l4-4 4 4' }], ['path', { d: 'M6 11H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1' }]],
    phone: [['rect', { x: 7, y: 2, width: 10, height: 20, rx: 2 }], ['path', { d: 'M11 18h2' }]],
    download: [['path', { d: 'M12 3v12M7 10l5 5 5-5M5 21h14' }]],
    edit: [['path', { d: 'M4 20h4L19 9l-4-4L4 16z' }]],
    mail: [['rect', { x: 3, y: 5, width: 18, height: 14, rx: 2 }], ['path', { d: 'm3 7 9 6 9-6' }]],
    shield: [['path', { d: 'M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z' }], ['path', { d: 'm9 12 2 2 4-4' }]],
    bolt: [['path', { d: 'M13 2 4 14h7l-1 8 9-12h-7z' }]],
    euro: [['path', { d: 'M18 7a6 6 0 1 0 0 10M4 10h9M4 14h9' }]],
    temp: [['path', { d: 'M14 14.8V4a2 2 0 0 0-4 0v10.8a4 4 0 1 0 4 0z' }]],
    drop: [['path', { d: 'M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z' }]],
    cal: [['rect', { x: 3, y: 5, width: 18, height: 16, rx: 2 }], ['path', { d: 'M3 10h18M8 3v4M16 3v4' }]],
    users: [['circle', { cx: 9, cy: 8, r: 3.5 }], ['path', { d: 'M2 20c0-3.5 3-6 7-6s7 2.5 7 6M16 4a3.5 3.5 0 0 1 0 7M18 14c2.5.6 4 2.8 4 6' }]],
    spark: [['path', { d: 'M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6' }]]
  };
  function icon(name, size) {
    var s = document.createElementNS(SVGNS, 'svg');
    var a = { width: size || 20, height: size || 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true', focusable: 'false' };
    for (var k in a) s.setAttribute(k, a[k]);
    (ICONS[name] || ICONS.star).forEach(function (d) {
      var n = document.createElementNS(SVGNS, d[0]);
      for (var at in d[1]) n.setAttribute(at, d[1][at]);
      s.appendChild(n);
    });
    return s;
  }
  function ga(name, params) { params = params || {}; params.lang = LANG; if (typeof window.gtag === 'function') { try { window.gtag('event', name, params); } catch (e) {} } }
  function lsGet(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function ssGet(k) { try { return JSON.parse(sessionStorage.getItem(k) || 'null'); } catch (e) { return null; } }
  function ssSet(k, v) { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

  function pd(s) { if (!/^\d{4}-\d{2}-\d{2}$/.test(s || '')) return null; var p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function iso(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function nightsOf() { var a = pd(state.data_inicio), b = pd(state.data_fim); return a && b ? Math.round((b - a) / 864e5) : 0; }
  function rangeTxt() {
    var a = pd(state.data_inicio), b = pd(state.data_fim);
    if (!a || !b) return '';
    var m1 = L.months[a.getMonth()], m2 = L.months[b.getMonth()];
    if (EN) return m1 === m2 ? m2 + ' ' + a.getDate() + '–' + b.getDate() : m1 + ' ' + a.getDate() + ' – ' + m2 + ' ' + b.getDate();
    return m1 === m2 ? a.getDate() + '–' + b.getDate() + ' ' + m2 : a.getDate() + ' ' + m1 + ' – ' + b.getDate() + ' ' + m2;
  }
  function haversine(a, b) {
    var R = 6371, toR = Math.PI / 180;
    var dLat = (b[0] - a[0]) * toR, dLng = (b[1] - a[1]) * toR;
    var x = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(a[0] * toR) * Math.cos(b[0] * toR) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return 2 * R * Math.asin(Math.sqrt(x));
  }
  // Curadoria de fotos (06/10/2026, revisao visual das imagens da BD).
  // BAD = imagens erradas na BD (pintura, textura de areia, igreja) — nunca mostrar.
  var BAD = ['fede421d', '10f7f046', '0b9d2380', '43290bbc'];
  var TOWN_PHOTO = {
    'Lagos': '91b63ef1', 'Albufeira': '3308ac4a', 'Portimão': '925ac239', 'Vilamoura': '2cb7aca0',
    'Vila Nova de Milfontes': '6b2661a4', 'Zambujeira do Mar': '4bd3bca5', 'Setúbal': '9efe4cc6',
    'Sesimbra': '9efe4cc6', 'Cascais': 'f0fbf5a9', 'Lisboa': 'f0fbf5a9', 'Peniche': '0f616614',
    'Nazaré': '4c907c07', 'Viana do Castelo': 'f7fa6d81', 'Funchal': 'ebf82db0'
  };
  function byId(prefix) { return prefix ? beaches.filter(function (b) { return b.id.indexOf(prefix) === 0; })[0] : null; }
  function townPhoto(town) {
    var b = byId(TOWN_PHOTO[town]);
    if (b && beachImg(b)) return b;
    var nb = nearBeaches(town, 1, 60)[0];
    return nb ? nb.b : null;
  }
  // Fotos curadas servidas localmente em WebP otimizado (480 px tiles, 1280 px fundos) — ~20 KB vs ~200 KB
  var LOCAL = ['91b63ef1', '3308ac4a', '925ac239', '2cb7aca0', '6b2661a4', '4bd3bca5', '9efe4cc6', 'f0fbf5a9', '0f616614', '4c907c07', 'f7fa6d81', 'ebf82db0'];
  function localImg(b, w) { var k = b && b.id ? b.id.slice(0, 8) : ''; return LOCAL.indexOf(k) !== -1 ? '/images/planner/' + k + '-' + (w || 1280) + '.webp' : ''; }
  function beachImg(b, w) { return localImg(b, w) || b.image_curated_url || b.image_storage_url_webp || b.image_storage_url || ''; }
  function beachCredit(b) {
    var who = b.image_curated_author || b.image_photographer || '';
    return who ? who + (b.image_license ? ' · ' + b.image_license : '') : '';
  }
  function nearBeaches(town, n, maxKm) {
    var g = TOWN_GEO[town]; if (!g || !beaches.length) return [];
    return beaches.map(function (b) { return { b: b, d: haversine(g, [parseFloat(b.latitude), parseFloat(b.longitude)]) }; })
      .filter(function (x) { return x.d <= (maxKm || 45) && beachImg(x.b) && !BAD.some(function (p) { return x.b.id.indexOf(p) === 0; }); })
      .sort(function (x, y) {
        var rx = x.b.editorial_rank ? +x.b.editorial_rank : 99, ry = y.b.editorial_rank ? +y.b.editorial_rank : 99;
        return (x.d + rx * 3) - (y.d + ry * 3);
      })
      .slice(0, n || 3);
  }

  // ── Dados: praias (imagens e conteudo do proprio site) ────────────────────
  var beachesP = null;
  function loadBeaches() {
    if (beachesP) return beachesP;
    var cached = ssGet('pth_v3_beaches_v2'); // v2 (Lote A 08/10): a cache antiga tinha so 300 praias
    if (cached && cached.length) { beaches = cached; beachesP = Promise.resolve(); return beachesP; }
    var cols = 'id,name,region,latitude,longitude,image_curated_url,image_storage_url_webp,image_storage_url,image_curated_author,image_photographer,image_license,image_source_url,image_curated_source_url,editorial_rank,is_surf_spot';
    // Timeout de 6 s: se a BD falhar, o planeador continua (sem fotos) e o link partilhado abre na mesma
    var ctl = window.AbortController ? new AbortController() : null;
    var to = setTimeout(function () { if (ctl) ctl.abort(); }, 6000);
    beachesP = fetch(SB_URL + '/rest/v1/beaches?select=' + cols + '&is_active=eq.true&order=name&limit=1000' /* Lote A 08/10: eram 300 de 522 -> 222 praias sem destino */, { headers: { apikey: SB_KEY }, signal: ctl ? ctl.signal : undefined })
      .then(function (r) { clearTimeout(to); return r; })
      .then(function (r) { return r.ok ? r.json() : []; })
      .then(function (d) { beaches = Array.isArray(d) ? d : []; ssSet('pth_v3_beaches_v2', beaches); })
      .catch(function () { beaches = []; });
    return beachesP;
  }

  // ── Fundo do hero (foto da regiao escolhida) ──────────────────────────────
  var bgA, bgB, bgFront = 0;
  function setBg(town) {
    var tb = townPhoto(town);
    var nb = tb ? { b: tb } : null;
    var url = nb ? beachImg(nb.b) : '';
    if (!url) return;
    var front = bgFront ? bgA : bgB, back = bgFront ? bgB : bgA;
    if (front.getAttribute('data-src') === url) return;
    var img = new Image();
    img.onload = function () {
      front.style.backgroundImage = 'url("' + url.replace(/"/g, '%22') + '")';
      front.setAttribute('data-src', url);
      front.classList.add('is-on'); back.classList.remove('is-on');
      bgFront = 1 - bgFront;
      var c = $('pv3-credit'); if (c) c.textContent = nb.b.name + (beachCredit(nb.b) ? ' · ' + L.photo + beachCredit(nb.b) : '');
    };
    img.src = url;
  }

  // ── Wizard ────────────────────────────────────────────────────────────────
  function optionTile(o, selected, onPick, opt) {
    opt = opt || {};
    var b = el('button', 'pv3-opt' + (opt.photo ? ' pv3-opt--photo' : '') + (selected ? ' is-sel' : ''));
    b.type = 'button';
    b.setAttribute('aria-pressed', selected ? 'true' : 'false');
    if (opt.photo) {
      var ph = el('span', 'pv3-opt-ph');
      if (opt.photoUrl) ph.style.backgroundImage = 'url("' + opt.photoUrl.replace(/"/g, '%22') + '")';
      b.appendChild(ph);
    } else if (o.i) {
      var ic = el('span', 'pv3-opt-ic'); ic.appendChild(icon(o.i, 22)); b.appendChild(ic);
    }
    var tx = el('span', 'pv3-opt-tx');
    tx.appendChild(el('strong', null, o.t));
    if (o.s) tx.appendChild(el('small', null, o.s));
    b.appendChild(tx);
    var ck = el('span', 'pv3-opt-ck'); ck.appendChild(icon('check', 14)); b.appendChild(ck);
    b.addEventListener('click', onPick);
    return b;
  }

  function renderStep() {
    var s = STEPS[state.step];
    $('pv3-q').textContent = s.q;
    $('pv3-h').textContent = s.h;
    $('pv3-h').hidden = !s.h;
    $('pv3-count').textContent = L.stepOf(state.step + 1, STEPS.length);
    Array.prototype.forEach.call(document.querySelectorAll('.pv3-seg'), function (sg, i) { sg.classList.toggle('is-on', i <= state.step); });
    var body = $('pv3-body');
    while (body.firstChild) body.removeChild(body.firstChild);
    var grid = el('div', 'pv3-grid');
    if (s.k === 'interesses') {
      grid.classList.add('pv3-grid--2');
      INTERESTS.forEach(function (o) {
        grid.appendChild(optionTile(o, state.interesses.indexOf(o.v) !== -1, function () {
          var i = state.interesses.indexOf(o.v);
          if (i === -1) state.interesses.push(o.v); else state.interesses.splice(i, 1);
          renderStep(); renderPreview();
        }));
      });
    } else if (s.k === 'regiao') {
      grid.classList.add('pv3-grid--regions');
      REGIONS.forEach(function (o) {
        var tb = o.v ? townPhoto(o.town) : null;
        grid.appendChild(optionTile(o, state.regiao === o.v, function () {
          if (state.regiao !== o.v) state.base = '';
          state.regiao = o.v; setBg(state.base || o.town); renderPreview(); next(true);
        }, { photo: true, photoUrl: tb ? beachImg(tb, 480) : '' }));
      });
    } else if (s.k === 'datas') {
      var wrap = el('div', 'pv3-dates');
      var f1 = el('label', 'pv3-field'); f1.appendChild(el('span', null, L.arrival));
      var i1 = el('input'); i1.type = 'date'; i1.id = 'pv3-d1'; i1.value = state.data_inicio; i1.min = iso(new Date());
      f1.appendChild(i1);
      var f2 = el('label', 'pv3-field'); f2.appendChild(el('span', null, L.departure));
      var i2 = el('input'); i2.type = 'date'; i2.id = 'pv3-d2'; i2.value = state.data_fim; i2.min = state.data_inicio || iso(new Date());
      f2.appendChild(i2);
      var err = el('p', 'pv3-err'); err.id = 'pv3-derr';
      var upd = function () {
        state.data_inicio = i1.value; state.data_fim = i2.value;
        if (i1.value) i2.min = i1.value;
        if (i1.value && (!i2.value || i2.value <= i1.value)) {
          var d = pd(i1.value); d.setDate(d.getDate() + 3); i2.value = iso(d); state.data_fim = i2.value;
        }
        err.textContent = ''; renderPreview(); syncQuick(); updateNav();
      };
      i1.addEventListener('change', upd); i2.addEventListener('change', function () {
        state.data_fim = i2.value;
        err.textContent = (state.data_inicio && i2.value && i2.value <= state.data_inicio) ? L.dateErr : '';
        renderPreview(); syncQuick(); updateNav();
      });
      wrap.appendChild(f1); wrap.appendChild(f2);
      body.appendChild(wrap); body.appendChild(err);
      var quick = el('div', 'pv3-quick');
      var today = new Date(); today.setHours(0, 0, 0, 0);
      var fri = new Date(today); fri.setDate(today.getDate() + ((5 - today.getDay() + 7) % 7 || 7));
      var sun = new Date(fri); sun.setDate(fri.getDate() + 2);
      var w2 = new Date(today); w2.setDate(today.getDate() + 14);
      var w2e = new Date(w2); w2e.setDate(w2.getDate() + 7);
      var m1 = new Date(today.getFullYear(), today.getMonth() + 1, 1);
      var m1e = new Date(m1); m1e.setDate(m1.getDate() + 4);
      var QUICK = [
        [L.quickWeekend, iso(fri), iso(sun)],
        [L.quick2w, iso(w2), iso(w2e)],
        [L.quickMonth(L.monthsLong[m1.getMonth()]), iso(m1), iso(m1e)],
        [L.quickUnknown, '', '']
      ];
      var qbtns = [];
      var syncQuick = function () {
        qbtns.forEach(function (x) { x[0].classList.toggle('is-sel', x[1] === state.data_inicio && x[2] === state.data_fim && !(x[1] === '' && state.step !== 2)); });
      };
      QUICK.forEach(function (q) {
        var c = el('button', 'pv3-chip', q[0]); c.type = 'button';
        c.addEventListener('click', function () {
          state.data_inicio = q[1]; state.data_fim = q[2]; i1.value = q[1]; i2.value = q[2];
          err.textContent = ''; renderPreview(); syncQuick(); updateNav();
          if (!q[1]) next(true);
        });
        qbtns.push([c, q[1], q[2]]); quick.appendChild(c);
      });
      body.appendChild(quick); syncQuick();
      updateNav(); return;
    } else if (s.k === 'pessoas') {
      grid.classList.add('pv3-grid--people');
      PEOPLE.forEach(function (o) {
        grid.appendChild(optionTile(o, state.pessoas === o.v, function () { state.pessoas = o.v; renderPreview(); next(true); }));
      });
    } else if (s.k === 'orcamento') {
      grid.classList.add('pv3-grid--2');
      BUDGETS.forEach(function (o) {
        grid.appendChild(optionTile(o, state.orcamento === o.v, function () { state.orcamento = o.v; renderPreview(); renderStep(); }));
      });
    }
    body.appendChild(grid);
    updateNav();
  }
  function stepOk(i) {
    var k = STEPS[i].k;
    if (k === 'interesses') return state.interesses.length > 0;
    if (k === 'regiao') return state.regiao !== null;
    if (k === 'datas') return !state.data_inicio || (state.data_fim && state.data_fim > state.data_inicio);
    if (k === 'pessoas') return !!state.pessoas;
    if (k === 'orcamento') return !!state.orcamento;
    return true;
  }
  function updateNav() {
    var last = state.step === STEPS.length - 1;
    $('pv3-back').hidden = state.step === 0;
    var nx = $('pv3-next');
    nx.disabled = !stepOk(state.step);
    nx.querySelector('.pv3-next-t').textContent = last ? L.create : L.next;
    nx.classList.toggle('pv3-next--go', last);
  }
  function next(auto) {
    if (!stepOk(state.step)) {
      if (STEPS[state.step].k === 'datas') $('pv3-derr').textContent = L.dateErr;
      return;
    }
    if (state.step === STEPS.length - 1) return generate();
    var go = function () { state.step++; renderStep(); focusQ(); ga('planear_passo', { passo: state.step + 1, versao: 'v3', origem: origin }); };
    if (auto) setTimeout(go, 220); else go();
  }
  function back() { if (state.step > 0) { state.step--; renderStep(); focusQ(); } }
  function focusQ() {
    var q = $('pv3-q'); if (!q) return;
    try { q.focus({ preventScroll: true }); } catch (e) { q.focus(); }
    var card = $('pv3-card'); if (card && card.getBoundingClientRect().top < 0) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ── Pre-visualizacao (goal gradient) ──────────────────────────────────────
  function find(list, v) { return list.filter(function (o) { return o.v === v; })[0]; }
  function interestsTxt() { return state.interesses.map(function (v) { return find(INTERESTS, v).t; }).join(' + '); }
  function renderPreview() {
    var reg = find(REGIONS, state.regiao);
    var rows = [
      ['spark', L.prevLabels[0], interestsTxt()],
      ['pin', L.prevLabels[1], reg ? reg.t + (state.base ? ' · ' + townLabel(state.base) : '') : ''],
      ['cal', L.prevLabels[2], state.data_inicio ? rangeTxt() + ' · ' + L.nights(nightsOf()) : (state.step > 2 ? L.flexible : '')],
      ['users', L.prevLabels[3], state.pessoas ? find(PEOPLE, state.pessoas).s : ''],
      ['euro', L.prevLabels[4], state.orcamento ? find(BUDGETS, state.orcamento).t : '']
    ];
    var done = rows.filter(function (r) { return !!r[2]; }).length;
    var list = $('pv3-prev-rows');
    while (list.firstChild) list.removeChild(list.firstChild);
    rows.forEach(function (r) {
      var li = el('li', r[2] ? 'is-done' : '');
      var ic = el('span', 'pv3-prev-ic'); ic.appendChild(icon(r[2] ? 'check' : r[0], 15)); li.appendChild(ic);
      var tx = el('span', 'pv3-prev-tx');
      tx.appendChild(el('small', null, r[1]));
      tx.appendChild(el('strong', null, r[2] || '—'));
      li.appendChild(tx); list.appendChild(li);
    });
    $('pv3-ring-n').textContent = done + '/5';
    var ring = $('pv3-ring-fg');
    ring.setAttribute('stroke-dasharray', (done / 5 * 113.1).toFixed(1) + ' 113.1');
    $('pv3-prev-title').textContent = done === 5 ? L.prevTitle[2] : done === 0 ? L.prevTitle[0] : L.prevTitle[1];
  }

  // ── Geracao (com passos visiveis) ─────────────────────────────────────────
  function payload() {
    return { interesses: state.interesses.slice(), regiao: state.regiao || '', base: state.base || '', origem: origin, pessoas: state.pessoas, data_inicio: state.data_inicio || null, data_fim: state.data_fim || null, orcamento: state.orcamento, nome: state.nome || '' };
  }
  var busy = false;
  function generate(via) {
    if (busy) return;
    if (!window.PTHPlanEngine) {
      $('pv3-h').hidden = false;
      $('pv3-h').textContent = L.engineErr;
      return;
    }
    busy = true;
    var plan = window.PTHPlanEngine.build(payload(), LANG);
    // Datas invalidas/passadas (ex.: link antigo) nao entram nos links -> nao as mostrar
    if (!plan.hasDates) { state.data_inicio = ''; state.data_fim = ''; }
    var ov = $('pv3-gen');
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var lines = ov.querySelectorAll('li');
    ov.hidden = false; document.body.classList.add('pv3-busy');
    Array.prototype.forEach.call(lines, function (l) { l.classList.remove('is-done'); });
    $('pv3-gen-town').textContent = townLabel(plan.town);
    var i = 0, gap = reduce || via === 'link' || via === 'restore' ? 60 : 420;
    (function tick() {
      if (i < lines.length) { lines[i].classList.add('is-done'); i++; setTimeout(tick, gap); return; }
      ov.hidden = true; document.body.classList.remove('pv3-busy'); busy = false;
      renderResults(plan, via);
    })();
  }

  // ── Resultados ────────────────────────────────────────────────────────────
  var PARTNER = { stay22: 'Booking.com · Vrbo', booksurfcamps: 'BookSurfCamps', getyourguide: 'GetYourGuide', discovercars: 'DiscoverCars' };
  var progress = {};
  function stepsDone() { return ['sleep', 'do', 'move'].filter(function (k) { return progress[k]; }).length; }

  function partnerCard(l, opt) {
    opt = opt || {};
    var a = el('a', 'r-card' + (opt.big ? ' r-card--big' : ''));
    a.href = l.href; a.target = '_blank'; a.rel = 'sponsored noopener';
    a.setAttribute('data-plan-kind', l.kind); a.setAttribute('data-plan-section', l.section);
    var ic = el('span', 'r-card-ic'); ic.appendChild(icon({ stay: 'bed', surfcamp: 'wave', surf: 'wave', fish: 'fish', activity: 'star', car: 'car' }[l.kind] || 'star', 22)); a.appendChild(ic);
    var tx = el('span', 'r-card-tx');
    tx.appendChild(el('small', 'r-card-partner', PARTNER[l.partner] || ''));
    tx.appendChild(el('strong', null, l.title));
    tx.appendChild(el('span', 'r-card-meta', l.meta.replace(/ · (Booking\.com|GetYourGuide|DiscoverCars|BookSurfCamps)$/, '')));
    a.appendChild(tx);
    var go = el('span', 'r-card-go'); go.appendChild(el('span', null, opt.cta || L.ctaOptions)); go.appendChild(icon('arrow', 16)); a.appendChild(go);
    a.addEventListener('click', function () { mark(l.section); });
    return a;
  }

  var plan = null;
  function mark(sec) {
    if (!plan || progress[sec] || ['sleep', 'do', 'move'].indexOf(sec) === -1) return;
    progress[sec] = Date.now(); lsSet(plan.progressKey, progress);
    ga('plan_step_opened', { step: sec, regiao: plan.analytics.regiao, versao: 'v3' });
    paintProgress();
  }
  function nextLink() {
    var order = ['sleep', 'move', 'do'];
    for (var i = 0; i < order.length; i++) {
      if (!progress[order[i]]) {
        var l = plan.links.filter(function (x) { return x.section === order[i]; })[0];
        if (l) return l;
      }
    }
    return null;
  }
  function paintProgress() {
    var n = stepsDone();
    var ring = $('r-ring-fg'); if (ring) ring.setAttribute('stroke-dasharray', (n / 3 * 113.1).toFixed(1) + ' 113.1');
    var t = $('r-ring-n'); if (t) t.textContent = n + '/3';
    ['sleep', 'do', 'move'].forEach(function (k) { var r = $('r-step-' + k); if (r) r.classList.toggle('is-done', !!progress[k]); });
    var nl = nextLink();
    var sb = $('r-sticky-go'), st = $('r-sticky-t');
    if (sb && st) {
      if (nl) {
        sb.href = nl.href; sb.setAttribute('data-plan-section', nl.section); sb.setAttribute('data-plan-kind', nl.kind);
        st.textContent = L.nextStep[nl.section](townLabel(plan.town));
        sb.querySelector('span').textContent = L.nextBtn[nl.section];
        $('r-sticky').classList.remove('is-done');
      } else {
        // Viagem completa: mostra a mensagem uns segundos e esconde a barra (e tira o link para nao abrir o ultimo parceiro outra vez)
        st.textContent = L.allDone;
        sb.removeAttribute('href'); sb.removeAttribute('data-plan-section');
        var bar = $('r-sticky');
        bar.classList.add('is-done');
        if (!bar.hidden && !bar.getAttribute('data-done-timer')) {
          bar.setAttribute('data-done-timer', '1');
          setTimeout(function () { bar.hidden = true; bar.removeAttribute('data-done-timer'); }, 4000);
        }
      }
    }
  }

  function liveConditions(town, box) {
    var g = TOWN_GEO[town]; if (!g) { box.hidden = true; return; }
    function pill(ic, label, val) {
      var p = el('span', 'r-live-pill'); p.appendChild(icon(ic, 16));
      p.appendChild(el('span', null, label + ' ')); p.appendChild(el('strong', null, val));
      box.appendChild(p);
    }
    var head = el('span', 'r-live-head'); head.appendChild(el('span', 'r-live-dot')); head.appendChild(document.createTextNode(L.nowIn + townLabel(town))); box.appendChild(head);
    var lat = g[0], lng = g[1];
    var dt = state.data_inicio && state.data_fim;
    var fc = 'https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lng + '&current=temperature_2m&timezone=Europe%2FLisbon';
    var a = pd(state.data_inicio), today = new Date(); today.setHours(0, 0, 0, 0);
    var inRange = dt && a && (a - today) / 864e5 <= 14;
    if (inRange) fc += '&daily=temperature_2m_max&start_date=' + state.data_inicio + '&end_date=' + state.data_fim;
    fetch(fc).then(function (r) { return r.json(); }).then(function (d) {
      if (d && d.current && typeof d.current.temperature_2m === 'number') pill('temp', L.air, Math.round(d.current.temperature_2m) + ' °C');
      if (inRange && d.daily && d.daily.temperature_2m_max) {
        var mx = d.daily.temperature_2m_max.filter(function (x) { return typeof x === 'number'; });
        if (mx.length) pill('sun', L.forecastFor + rangeTxt(), Math.round(Math.min.apply(null, mx)) + '–' + Math.round(Math.max.apply(null, mx)) + ' °C');
      }
    }).catch(function () {});
    fetch('https://marine-api.open-meteo.com/v1/marine?latitude=' + lat + '&longitude=' + (lng - 0.05).toFixed(4) + '&current=wave_height,sea_surface_temperature&timezone=Europe%2FLisbon')
      .then(function (r) { return r.json(); }).then(function (d) {
        if (!d || !d.current) return;
        if (typeof d.current.sea_surface_temperature === 'number') pill('drop', L.water, Math.round(d.current.sea_surface_temperature) + ' °C');
        if (typeof d.current.wave_height === 'number') pill('wave', L.waves, d.current.wave_height.toFixed(1).replace('.', L.dec) + ' m');
      }).catch(function () {});
  }

  function renderResults(p, via) {
    plan = p;
    progress = lsGet(plan.progressKey) || {};
    var root = $('resultado');
    while (root.firstChild) root.removeChild(root.firstChild);
    root.hidden = false;
    $('planner').classList.add('is-collapsed');
    document.body.classList.add('pv3-has-results');
    var ppl = find(PEOPLE, state.pessoas);
    var bud = find(BUDGETS, state.orcamento);
    var reg = find(REGIONS, state.regiao);
    var town = townLabel(plan.town);
    var nbs = nearBeaches(plan.town, 4, 40);
    var tp = townPhoto(plan.town);
    if (tp) { nbs = [{ b: tp, d: TOWN_GEO[plan.town] ? haversine(TOWN_GEO[plan.town], [parseFloat(tp.latitude), parseFloat(tp.longitude)]) : 0 }].concat(nbs.filter(function (x) { return x.b.id !== tp.id; })); }

    // HERO
    var hero = el('header', 'r-hero');
    var heroImg = nbs[0] ? beachImg(nbs[0].b) : '';
    if (heroImg) hero.style.setProperty('--r-hero-img', 'url("' + heroImg.replace(/"/g, '%22') + '")');
    var hin = el('div', 'r-hero-in');
    hin.appendChild(el('p', 'r-kicker', via === 'link' ? L.kickerShared : L.kickerOwn));
    var h = el('h2', 'r-title'); h.id = 'r-title'; h.tabIndex = -1; h.appendChild(document.createTextNode(town));
    var sm = el('span', null, (reg && reg.v ? reg.t : plan.destination.split(' — ')[1] || 'Portugal')); h.appendChild(sm);
    hin.appendChild(h);
    var chips = el('div', 'r-chips');
    [['cal', state.data_inicio ? rangeTxt() + ' · ' + L.nights(nightsOf()) : L.flexDates], ['users', ppl ? ppl.s : L.twoAdults], ['euro', bud ? bud.t : L.anyStyle], ['spark', interestsTxt()]]
      .forEach(function (c) { var x = el('span', 'r-chip'); x.appendChild(icon(c[0], 15)); x.appendChild(document.createTextNode(c[1])); chips.appendChild(x); });
    hin.appendChild(chips);
    var acts = el('div', 'r-actions');
    var bShare = el('button', 'r-btn r-btn--light'); bShare.type = 'button'; bShare.appendChild(icon('share', 16)); bShare.appendChild(document.createTextNode(L.share));
    var bEdit = el('button', 'r-btn r-btn--ghost'); bEdit.type = 'button'; bEdit.appendChild(icon('edit', 16)); bEdit.appendChild(document.createTextNode(L.edit));
    var shareMsg = el('span', 'r-share-msg'); shareMsg.setAttribute('aria-live', 'polite');
    bShare.addEventListener('click', function () {
      var url = location.origin + location.pathname + '?' + plan.shareQuery + '&ref=partilha';
      ga('plan_shared', { regiao: plan.analytics.regiao, versao: 'v3', metodo: navigator.share ? 'native' : 'copy' });
      if (navigator.share) { navigator.share({ title: L.shareTitle + town, url: url }).catch(function () {}); return; }
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(function () { shareMsg.textContent = L.copied; }, function () { shareMsg.textContent = url; });
      else shareMsg.textContent = url;
    });
    bEdit.addEventListener('click', function () {
      root.hidden = true; $('planner').classList.remove('is-collapsed'); $('r-sticky').hidden = true;
      document.body.classList.remove('pv3-has-results');
      state.step = 0; renderStep(); $('planner').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    acts.appendChild(bShare); acts.appendChild(bEdit); acts.appendChild(shareMsg);
    hin.appendChild(acts);
    hero.appendChild(hin);
    if (nbs[0] && beachCredit(nbs[0].b)) hero.appendChild(el('p', 'r-credit', nbs[0].b.name + ' · ' + L.photo + beachCredit(nbs[0].b)));
    root.appendChild(hero);

    // CONDICOES AO VIVO
    if (LIVE_CONDITIONS) { var live = el('div', 'r-live'); root.appendChild(live); liveConditions(plan.town, live); }

    // GRELHA
    var grid = el('div', 'r-grid');
    var main = el('div', 'r-main');
    var side = el('aside', 'r-side');

    // Dormir
    var stay = plan.links.filter(function (l) { return l.section === 'sleep'; })[0];
    var bs = el('section', 'r-block');
    var bh = el('div', 'r-block-h');
    bh.appendChild(el('span', 'r-step', '1'));
    var bht = el('div'); bht.appendChild(el('h3', null, L.sleepIn + town));
    bht.appendChild(el('p', null, plan.hasDates ? L.pricesFor(rangeTxt(), ppl ? ppl.s : L.twoAdults) : L.pickDates));
    bh.appendChild(bht); bs.appendChild(bh);
    var map = el('div', 'r-map');
    var ifr = document.createElement('iframe'); ifr.src = plan.mapUrl; ifr.title = L.mapTitle + town; ifr.loading = 'lazy';
    map.appendChild(ifr); bs.appendChild(map);
    if (stay) bs.appendChild(partnerCard(stay, { big: true, cta: L.ctaAvail }));
    if (plan.budgetNote) bs.appendChild(el('p', 'r-note', plan.budgetNote));
    main.appendChild(bs);
    mapClickWatch(ifr);

    // Fazer
    var doLinks = plan.links.filter(function (l) { return l.section === 'do'; });
    var bd = el('section', 'r-block');
    var dh = el('div', 'r-block-h'); dh.appendChild(el('span', 'r-step', '2'));
    var dht = el('div'); dht.appendChild(el('h3', null, L.doTitle));
    dht.appendChild(el('p', null, L.doSub + (plan.hasDates ? L.doSubDates : '.')));
    dh.appendChild(dht); bd.appendChild(dh);
    var dl = el('div', 'r-cards'); doLinks.forEach(function (l) { dl.appendChild(partnerCard(l, { cta: L.ctaPrices })); }); bd.appendChild(dl);
    if (nbs.length) {
      bd.appendChild(el('h4', 'r-sub', L.beachesNear + town));
      var bg = el('div', 'r-beaches');
      nbs.slice(0, 3).forEach(function (x) {
        var a = el('a', 'r-beach'); a.href = L.beachUrl + encodeURIComponent(x.b.id);
        var im = el('span', 'r-beach-img'); im.style.backgroundImage = 'url("' + beachImg(x.b, 480).replace(/"/g, '%22') + '")'; a.appendChild(im);
        var t = el('span', 'r-beach-tx'); t.appendChild(el('strong', null, x.b.name)); t.appendChild(el('small', null, Math.max(1, Math.round(x.d)) + L.beachMeta)); a.appendChild(t);
        bg.appendChild(a);
      });
      bd.appendChild(bg);
    }
    main.appendChild(bd);

    // Mover-se
    var car = plan.links.filter(function (l) { return l.section === 'move'; })[0];
    if (car) {
      var bm = el('section', 'r-block');
      var mh = el('div', 'r-block-h'); mh.appendChild(el('span', 'r-step', '3'));
      var mht = el('div'); mht.appendChild(el('h3', null, L.moveTitle));
      mht.appendChild(el('p', null, L.moveSub));
      mh.appendChild(mht); bm.appendChild(mh);
      bm.appendChild(partnerCard(car, { cta: L.ctaCompare }));
      main.appendChild(bm);
    }

    // Lateral: progresso
    var pc = el('section', 'r-side-card r-progress');
    var ph = el('div', 'r-progress-h');
    var ringW = document.createElementNS(SVGNS, 'svg'); ringW.setAttribute('viewBox', '0 0 44 44'); ringW.setAttribute('class', 'r-ring'); ringW.setAttribute('aria-hidden', 'true');
    var c1 = document.createElementNS(SVGNS, 'circle'); c1.setAttribute('cx', 22); c1.setAttribute('cy', 22); c1.setAttribute('r', 18); c1.setAttribute('class', 'r-ring-bg');
    var c2 = document.createElementNS(SVGNS, 'circle'); c2.setAttribute('cx', 22); c2.setAttribute('cy', 22); c2.setAttribute('r', 18); c2.setAttribute('class', 'r-ring-fg'); c2.id = 'r-ring-fg'; c2.setAttribute('stroke-dasharray', '0 113.1');
    ringW.appendChild(c1); ringW.appendChild(c2);
    var rw = el('div', 'r-ring-wrap'); rw.appendChild(ringW); var rn = el('span', 'r-ring-n', '0/3'); rn.id = 'r-ring-n'; rw.appendChild(rn);
    ph.appendChild(rw);
    var pht = el('div'); pht.appendChild(el('strong', null, L.tripDone)); pht.appendChild(el('small', null, L.tripDoneSub));
    ph.appendChild(pht); pc.appendChild(ph);
    var ul = el('ul', 'r-steps');
    [['sleep', 'bed'], ['do', 'star'], ['move', 'car']].forEach(function (s) {
      var l = plan.links.filter(function (x) { return x.section === s[0]; })[0];
      if (!l) return;
      var li = el('li'); li.id = 'r-step-' + s[0];
      var a = el('a'); a.href = l.href; a.target = '_blank'; a.rel = 'sponsored noopener';
      a.setAttribute('data-plan-section', s[0]); a.setAttribute('data-plan-kind', l.kind);
      var ic = el('span', 'r-steps-ic'); ic.appendChild(icon(s[1], 16)); a.appendChild(ic);
      a.appendChild(el('span', 'r-steps-t', L.stepNames[s[0]]));
      var ck = el('span', 'r-steps-ck'); ck.appendChild(icon('check', 13)); a.appendChild(ck);
      a.addEventListener('click', function () { mark(s[0]); });
      li.appendChild(a); ul.appendChild(li);
    });
    pc.appendChild(ul); side.appendChild(pc);

    // Lateral: instalar app (so se o browser permitir e ainda nao estiver instalada)
    var appCard = installCard();
    if (appCard) side.appendChild(appCard);

    // Lateral: email (lead depois do valor)
    var ec = el('section', 'r-side-card r-email');
    var eh = el('div', 'r-email-h'); eh.appendChild(icon('mail', 18)); eh.appendChild(el('strong', null, L.saveTitle));
    ec.appendChild(eh);
    ec.appendChild(el('p', null, L.saveSub));
    var form = el('form', 'r-email-f'); form.noValidate = true;
    var inp = el('input'); inp.type = 'email'; inp.placeholder = L.emailPh; inp.autocomplete = 'email'; inp.required = true; inp.setAttribute('aria-label', 'Email');
    var ts = el('div', 'r-ts'); ts.id = 'r-ts';
    var sb = el('button', 'r-btn r-btn--gold', L.saveBtn); sb.type = 'submit';
    var em = el('p', 'r-email-msg'); em.setAttribute('aria-live', 'polite');
    var cons = el('p', 'r-email-legal');
    cons.appendChild(document.createTextNode(L.legal1));
    var pl = el('a', null, L.legalLink); pl.href = L.privacyUrl; pl.target = '_blank'; pl.rel = 'noopener';
    cons.appendChild(pl); cons.appendChild(document.createTextNode(L.legal2));
    form.appendChild(inp); form.appendChild(ts); form.appendChild(sb); form.appendChild(cons); form.appendChild(em);
    inp.addEventListener('focus', loadTurnstile, { once: true });
    form.addEventListener('submit', function (e) { e.preventDefault(); submitLead(inp, sb, em); });
    ec.appendChild(form); side.appendChild(ec);

    // Lateral: confianca
    var tc = el('section', 'r-side-card r-trust');
    L.trust.forEach(function (t) {
      var r = el('div', 'r-trust-row'); var ic = el('span', 'r-trust-ic'); ic.appendChild(icon(t[0], 18)); r.appendChild(ic);
      var tx = el('div'); tx.appendChild(el('strong', null, t[1])); tx.appendChild(el('p', null, t[2])); r.appendChild(tx); tc.appendChild(r);
    });
    tc.appendChild(el('p', 'r-trust-partners', L.partners));
    side.appendChild(tc);

    grid.appendChild(main); grid.appendChild(side);
    root.appendChild(grid);

    // Barra fixa "proximo passo"
    var st = $('r-sticky'); st.hidden = false;
    paintProgress();

    if (via !== 'link' && via !== 'restore') {
      try { history.replaceState(null, '', location.pathname + '?' + plan.shareQuery); } catch (e) {}
      try { sessionStorage.setItem('pth_v3_own', plan.shareQuery); } catch (e) {}
    }
    if (via !== 'link') lsSet('pth_v3_last_' + LANG, { q: plan.shareQuery, town: plan.town, ts: Date.now() });
    plan.analytics.via = via || 'form'; plan.analytics.versao = 'v3'; plan.analytics.origem = origin;
    ga('plan_generated', plan.analytics);
    requestAnimationFrame(function () {
      window.scrollTo(0, 0);
      var t = $('r-title'); if (t) { try { t.focus({ preventScroll: true }); } catch (e) {} }
    });
  }

  var mapFrame = null, mapBound = false;
  function mapClickWatch(ifr) {
    mapFrame = ifr;
    if (mapBound) return; mapBound = true;
    window.addEventListener('blur', function () {
      setTimeout(function () {
        if (mapFrame && document.activeElement === mapFrame) {
          mark('sleep');
          ga('affiliate_click', { partner: 'stay22_map', link_destination: 'stay22.com/embed/gm', page_path: location.pathname });
        }
      }, 0);
    });
  }

  // ── Instalar como app (PWA) ───────────────────────────────────────────────
  var deferredPrompt = null;
  function isStandalone() { return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true; }
  function isIOS() { return /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); }
  function canInstall() { return !isStandalone() && (!!deferredPrompt || isIOS()); }
  function doInstall(where) {
    ga('pwa_install_click', { onde: where, plataforma: deferredPrompt ? 'prompt' : 'ios' });
    if (deferredPrompt) {
      var dp = deferredPrompt; deferredPrompt = null;
      dp.prompt();
      if (dp.userChoice) dp.userChoice.then(function (c) { ga('pwa_install_choice', { resultado: c && c.outcome }); refreshInstallUI(); });
      return;
    }
    if (isIOS()) openIosSheet();
  }
  function openIosSheet() {
    var sh = $('pv3-ios'); if (!sh) return;
    sh.hidden = false; document.body.classList.add('pv3-busy');
    var btn = sh.querySelector('button'); if (btn) btn.focus();
  }
  function installCard() {
    if (!canInstall()) return null;
    var c = el('section', 'r-side-card r-app');
    var h = el('div', 'r-app-h'); h.appendChild(icon('phone', 18)); h.appendChild(el('strong', null, L.appTitle));
    c.appendChild(h);
    c.appendChild(el('p', null, L.appSub));
    var b = el('button', 'r-btn r-btn--dark'); b.type = 'button'; b.id = 'r-app-btn';
    b.appendChild(icon(isIOS() && !deferredPrompt ? 'ios' : 'download', 16)); b.appendChild(document.createTextNode(L.appBtn));
    b.addEventListener('click', function () { doInstall('plano'); });
    c.appendChild(b);
    return c;
  }
  function refreshInstallUI() {
    var top = $('pv3-install');
    if (top) top.hidden = !canInstall();
    var card = document.querySelector('.r-app');
    if (card && !canInstall()) card.remove();
  }
  function initPWA() {
    window.addEventListener('beforeinstallprompt', function (e) {
      e.preventDefault(); deferredPrompt = e; refreshInstallUI();
      if (plan && !document.querySelector('.r-app')) {
        var side = document.querySelector('.r-side'), card = installCard();
        if (side && card) side.insertBefore(card, side.children[1] || null);
      }
    });
    window.addEventListener('appinstalled', function () {
      deferredPrompt = null; ga('pwa_installed', {}); refreshInstallUI();
    });
    var top = $('pv3-install');
    if (top) top.addEventListener('click', function () { doInstall('topo'); });
    var sh = $('pv3-ios');
    if (sh) {
      var close = function () { sh.hidden = true; document.body.classList.remove('pv3-busy'); };
      sh.addEventListener('click', function (e) { if (e.target === sh || e.target.closest('[data-close]')) close(); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !sh.hidden) close(); });
    }
    refreshInstallUI();
    if (isStandalone()) { document.body.classList.add('pv3-standalone'); if (origin === 'direto') origin = 'app'; }
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function () { navigator.serviceWorker.register('/sw.js').catch(function () {}); });
    }
  }

  // ── Creditos das fotos (CC BY-SA exige autor + licenca + fonte) ─────────────
  function renderCredits() {
    var box = $('pv3-credits'); if (!box || !beaches.length) return;
    var seen = {}, items = [];
    Object.keys(TOWN_PHOTO).forEach(function (t) {
      var b = byId(TOWN_PHOTO[t]); if (!b || seen[b.id]) return; seen[b.id] = 1; items.push(b);
    });
    while (box.firstChild) box.removeChild(box.firstChild);
    box.appendChild(document.createTextNode(L.photos));
    items.forEach(function (b, i) {
      var src = b.image_curated_source_url || b.image_source_url;
      var who = (b.image_curated_author || b.image_photographer || L.unknownAuthor) + (b.image_license ? ' (' + b.image_license + ')' : '');
      var node = src ? el('a', null, b.name) : el('span', null, b.name);
      if (src) { node.href = src; node.target = '_blank'; node.rel = 'noopener nofollow'; }
      box.appendChild(node); box.appendChild(document.createTextNode(' — ' + who + (i < items.length - 1 ? ' · ' : '.')));
    });
  }

  // ── Lead (opcional, depois do plano) ──────────────────────────────────────
  var tsLoaded = false, tsToken = '';
  function loadTurnstile() {
    if (tsLoaded) return; tsLoaded = true;
    window.__pv3TsReady = function () {
      try { window.turnstile.render('#r-ts', { sitekey: TURNSTILE_KEY, size: 'flexible', language: LANG, callback: function (t) { tsToken = t; } }); } catch (e) {}
    };
    var s = document.createElement('script');
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=__pv3TsReady';
    s.async = true; s.defer = true; document.head.appendChild(s);
  }
  function submitLead(inp, btn, msg) {
    var email = inp.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { msg.textContent = L.emailBad; inp.focus(); return; }
    var token = tsToken || (document.querySelector('#r-ts [name="cf-turnstile-response"]') || {}).value || '';
    if (!token) { msg.textContent = L.robot; loadTurnstile(); return; }
    btn.disabled = true; msg.textContent = L.saving;
    var p = payload();
    var body = Object.assign({ turnstileToken: token, nome: 'Sem nome', email: email, notas: 'Planeador v3 (' + LANG + ') — ' + location.origin + location.pathname + '?' + plan.shareQuery }, p, { nome: p.nome || 'Sem nome' });
    fetch(SB_URL + '/functions/v1/submit-plan-request', { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: SB_KEY }, body: JSON.stringify(body) })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json().catch(function () { return {}; }); })
      .then(function () {
        msg.textContent = L.saved;
        ga('lead_planear_submetido', { regiao: p.regiao, pessoas: p.pessoas, orcamento: p.orcamento, interesses: p.interesses, versao: 'v3' });
      })
      .catch(function () { btn.disabled = false; msg.textContent = L.saveFail; });
  }

  // ── Continuar o ultimo plano (util sobretudo na app instalada) ────────────
  function renderResume() {
    var last = lsGet('pth_v3_last_' + LANG);
    var box = $('pv3-resume');
    if (!box || !last || !last.q || !last.town || Date.now() - last.ts > 60 * 864e5) return;
    while (box.firstChild) box.removeChild(box.firstChild);
    var a = el('a', 'pv3-resume-btn'); a.href = location.pathname + '?' + last.q;
    a.appendChild(icon('pin', 16)); a.appendChild(document.createTextNode(L.resume(townLabel(last.town)))); a.appendChild(icon('arrow', 16));
    a.addEventListener('click', function () { try { sessionStorage.setItem('pth_v3_own', last.q); } catch (e) {} ga('plan_resume', {}); });
    box.appendChild(a); box.hidden = false;
  }

  // ── Origem e pre-preenchimento (links de outras paginas do site) ──────────
  // Formato novo: ?i=surf,praia&r=oeste&n=2&ref=webcams
  // Formato antigo (ainda usado em ~50 links e nas paginas de praia):
  //   ?source=pesca&tipo=pesca|surf&subtipo=..&nivel=iniciante&region=Algarve|Centro|Lisboa e Setúbal|Açores&beach=<nome>&intent=..
  var origin = 'direto';
  var pendingBeach = '';
  var LEGACY_REGION = { 'algarve': ['algarve'], 'alentejo': ['alentejo'], 'lisboa e setubal': ['cascais', 'setubal'], 'lisboa': ['cascais', 'setubal'], 'setubal': ['setubal'],
    'oeste': ['oeste'], 'centro': ['costa-prata'], 'norte': ['minho'], 'porto': ['minho'], 'minho': ['minho'], 'madeira': ['madeira'], 'acores': ['acores'], 'azores': ['acores'] };
  function norm(x) { x = String(x || '').toLowerCase().trim(); return x.normalize ? x.normalize('NFD').replace(/[\u0300-\u036f]/g, '') : x; }
  function readPrefill() {
    var p = new URLSearchParams(location.search);
    var ref = (p.get('ref') || p.get('source') || '').toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 24);
    // A origem fica na sessao: quem recarrega ou edita o plano continua atribuido a pagina de onde veio
    if (ref) { origin = ref; try { sessionStorage.setItem('pth_v3_origin', ref); } catch (e) {} }
    else { try { origin = sessionStorage.getItem('pth_v3_origin') || origin; } catch (e) {} }
    if (p.get('plano') === '1') return;
    var okI = INTERESTS.map(function (o) { return o.v; });
    var ints = (p.get('i') || '').split(',').filter(function (x) { return okI.indexOf(x) !== -1; });
    var tipo = norm(p.get('tipo'));
    if (!ints.length && (tipo === 'pesca' || tipo === 'surf')) ints = [tipo];
    if (!ints.length && p.get('nivel')) ints = ['surf'];
    var r = p.get('r');
    var okR = REGIONS.map(function (o) { return o.v; });
    if (ints.length) state.interesses = ints;
    if (r !== null && okR.indexOf(r) !== -1) state.regiao = r;
    else if (p.get('region')) {
      var cand = LEGACY_REGION[norm(p.get('region'))];
      if (cand) state.regiao = cand[0];
    }
    var beach = (p.get('beach') || '').slice(0, 80);
    if (beach) { pendingBeach = beach; if (!state.interesses.length) state.interesses = ['praia']; }
    var n = p.get('n'); if (PEOPLE.some(function (o) { return o.v === n; })) state.pessoas = n;
    for (var i = 0; i < STEPS.length; i++) { if (!stepOk(i) || STEPS[i].k === 'datas') { state.step = i; break; } }
  }
  // Praia de origem -> vila-base mais proxima que o motor conhece (ate 60 km) e a regiao dessa vila
  function km(a, b, c, d) { var R = 6371, x = (c - a) * Math.PI / 180, y = (d - b) * Math.PI / 180;
    var h = Math.sin(x / 2) * Math.sin(x / 2) + Math.cos(a * Math.PI / 180) * Math.cos(c * Math.PI / 180) * Math.sin(y / 2) * Math.sin(y / 2);
    return 2 * R * Math.asin(Math.sqrt(h)); }
  function applyBeach() {
    if (!pendingBeach || !beaches.length || !window.PTHPlanEngine || !window.PTHPlanEngine.regionTowns) return;
    var want = norm(pendingBeach); pendingBeach = '';
    var b = beaches.filter(function (x) { return norm(x.name) === want; })[0];
    if (!b || b.latitude == null || b.longitude == null) return;
    // Vila mais proxima entre todas as regioes (a regiao da BD tem erros, ex.: Guincho = "Oeste")
    var best = null;
    REGIONS.map(function (o) { return o.v; }).filter(Boolean).forEach(function (rg) {
      window.PTHPlanEngine.regionTowns(rg).forEach(function (t) {
        var g = TOWN_GEO[t]; if (!g) return;
        var d = km(+b.latitude, +b.longitude, g[0], g[1]);
        if (!best || d < best.d) best = { r: rg, t: t, d: d };
      });
    });
    if (!best) return;
    if (best.d <= 60) { state.regiao = best.r; state.base = best.t; }
    else { var cand = LEGACY_REGION[norm(b.region)]; if (cand) state.regiao = cand[0]; state.base = ''; }
    if (!state.interesses.length) state.interesses = ['praia'];
    for (var i = 0; i < STEPS.length; i++) { if (!stepOk(i) || STEPS[i].k === 'datas') { state.step = Math.max(state.step, i); break; } }
  }

  // ── Arranque ──────────────────────────────────────────────────────────────
  function init() {
    readPrefill();
    initPWA();
    bgA = $('pv3-bg-a'); bgB = $('pv3-bg-b');
    $('pv3-next').addEventListener('click', function () { next(false); });
    $('pv3-back').addEventListener('click', back);
    var sg = $('r-sticky-go');
    // O link ja abriu o parceiro certo: so depois do clique (setTimeout) se marca o passo e se troca o href para o passo seguinte.
    // Antes, mark() corria durante o clique e mudava o href ANTES da navegacao -> "Ver alojamento" abria o DiscoverCars, etc.
    if (sg) sg.addEventListener('click', function () { var sec = sg.getAttribute('data-plan-section'); setTimeout(function () { mark(sec); paintProgress(); }, 0); });
    renderStep(); renderPreview();
    var shared0 = window.PTHPlanEngine && window.PTHPlanEngine.readShared();
    if (!shared0) renderResume();
    var waitBeaches = shared0 ? Promise.race([loadBeaches(), new Promise(function (r) { setTimeout(r, 1500); })]) : loadBeaches();
    if (shared0) loadBeaches().then(function () { renderCredits(); if (STEPS[state.step].k === 'regiao') renderStep(); });
    waitBeaches.then(function () {
      var hadBeach = !!pendingBeach;
      applyBeach();
      setBg(state.base || (state.regiao !== null ? (find(REGIONS, state.regiao) || REGIONS[0]).town : 'Lagos'));
      if (hadBeach) { renderStep(); renderPreview(); }
      else if (STEPS[state.step].k === 'regiao') renderStep();
      renderCredits();
      var shared = window.PTHPlanEngine && window.PTHPlanEngine.readShared();
      if (shared) {
        var own = null; try { own = sessionStorage.getItem('pth_v3_own'); } catch (e) {}
        var last = lsGet('pth_v3_last_' + LANG);
        var isOwn = (own && location.search.indexOf(own) !== -1) || (last && last.q && location.search.indexOf(last.q) !== -1);
        state.interesses = shared.interesses; state.regiao = shared.regiao; state.base = shared.base || ''; state.pessoas = shared.pessoas || '2';
        state.data_inicio = shared.data_inicio || ''; state.data_fim = shared.data_fim || ''; state.orcamento = shared.orcamento || 'moderado';
        state.step = STEPS.length - 1; renderStep(); renderPreview();
        generate(isOwn ? 'restore' : 'link');
      }
    });
    ga('planear_passo', { passo: state.step + 1, versao: 'v3', origem: origin });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
