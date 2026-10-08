/* Cartao de praia v2 (/beaches, /en/beaches) — Portal Turismo Portugal — 2026-10-06
 * BC2.card(beach, lang) -> HTML do cartao; BC2.after(grid, lang) -> condicoes ao vivo nas praias visiveis.
 * Mantem a classe .beach-card e todos os data-* que os filtros, a paginacao e o tracking usam.
 * Fotos: miniaturas locais /images/beaches/<id>-{480,800}.webp; se faltarem, volta a foto original da BD.
 * Condicoes: 1 pedido Open-Meteo (marine) por lote de praias visiveis; cache 30 min em sessionStorage; so textContent.
 */
(function (window, document) {
  'use strict';

  function esc(s) { return s == null ? '' : String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  var I = {
    pt: { hotels: 'Hotéis perto', prices: 'ver preços', plan: 'Planear', details: 'Ver praia', excellent: 'Água excelente',
          now: 'Agora', waves: 'ondas', water: 'água', photo: 'Foto',
          feats: { 'família': 'Família', surf: 'Surf', natureza: 'Natureza', ilhas: 'Ilhas', pesca: 'Pesca' },
          ariaHotels: function (n) { return 'Ver hotéis perto de ' + n + ' e preços'; },
          ariaPlan: function (n) { return 'Planear viagem a ' + n; }, ariaDetails: function (n) { return 'Ver a praia ' + n; },
          beach: function (id) { return 'beach.html?id=' + encodeURIComponent(id); }, planner: '/planear', booking: 'pt-pt' },
    en: { hotels: 'Hotels nearby', prices: 'see prices', plan: 'Plan trip', details: 'View beach', excellent: 'Excellent water',
          now: 'Now', waves: 'waves', water: 'sea', photo: 'Photo',
          feats: { 'família': 'Family', surf: 'Surf', natureza: 'Nature', ilhas: 'Islands', pesca: 'Fishing' },
          ariaHotels: function (n) { return 'See hotels near ' + n + ' and prices'; },
          ariaPlan: function (n) { return 'Plan a trip to ' + n; }, ariaDetails: function (n) { return 'View ' + n; },
          beach: function (id) { return '/en/beach.html?id=' + encodeURIComponent(id); }, planner: '/en/planear', booking: 'en-gb' }
  };
  var ICON = {
    bed: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 20V8"/><path d="M2 16h20v4"/><path d="M22 16v-4a3 3 0 0 0-3-3H10v7"/><circle cx="6" cy="12" r="2"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
    cal: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    eye: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
    check: '<svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>',
    wave: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 14c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/><path d="M2 19c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/></svg>',
    'família': '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="7" r="3"/><path d="M3 21v-2a6 6 0 0 1 12 0v2"/><circle cx="18" cy="9" r="2"/><path d="M16 21v-1a4 4 0 0 1 6-3.5"/></svg>',
    natureza: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 20A7 7 0 0 1 4 13c0-6 7-10 16-10 0 9-4 16-9 17z"/><path d="M4 21c4-4 7-7 10-10"/></svg>',
    ilhas: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M2 20c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/></svg>',
    pesca: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 12c3-5 9-5 12 0-3 5-9 5-12 0z"/><path d="M6.5 12L3 9v6z"/></svg>',
    pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 14c0 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2"/><path d="M2 18c0 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2"/><line x1="12" y1="2" x2="12" y2="8"/></svg>'
  };
  ICON.surf = ICON.wave;

  /* Mesma logica de etiquetas que a pagina ja usava (deriveTags) */
  function tags(b, lang) {
    var t = [];
    var desc = (((b.i18n && b.i18n.description && b.i18n.description[lang]) || '') + ' ' + (b.description || '')).toLowerCase();
    var region = (b.region || '').toLowerCase(), fac = Array.isArray(b.facilities) ? b.facilities : [];
    if (b.is_surf_spot || desc.indexOf('surf') > -1 || desc.indexOf('onda') > -1 || region === 'porto') t.push('surf');
    if (fac.indexOf('lifeguard') > -1 || desc.indexOf('famil') > -1 || desc.indexOf('famíl') > -1 || desc.indexOf('criança') > -1 || region === 'algarve') t.push('família');
    if (desc.indexOf('naturez') > -1 || desc.indexOf('isolad') > -1 || region === 'alentejo') t.push('natureza');
    if (region === 'madeira' || region === 'açores') t.push('ilhas');
    if (desc.indexOf('pesc') > -1) t.push('pesca');
    return t;
  }
  function credit(b, L) {
    if (b.id && PHOTO_CREDIT[b.id]) return L.photo + ': ' + PHOTO_CREDIT[b.id];
    var s = b.image_source, a = b.image_photographer || '';
    if (b.image_curated_url) return b.image_curated_author ? L.photo + ': ' + b.image_curated_author : '';
    if (s === 'wikipedia_infobox') return L.photo + ': Wikipedia';
    if (s === 'pexels') return a ? L.photo + ': ' + a + ' / Pexels' : L.photo + ': Pexels';
    if (s === 'manual' && a) return L.photo + ': ' + a;
    return '';
  }

  /* Fotos verificadas (Wikimedia Commons, revisao 2026-10-07): miniaturas em /images/beaches/<id>-{480,800}.webp.
     Substituem as fotos automaticas do Pexels (muitas de outros sitios) e 4 da Wikipedia erradas. Credito = autor + licenca.
     Lista completa com links: docs/FOTOS-CREDITOS.md */
  var PHOTO_CREDIT = {
    // Lote B1 de praias (08/10/2026)
    '24ef6f3c-123f-4cda-9ed7-53b372fe4790': "Vitor Oliveira · CC BY-SA 2.0",
    '97427a14-7439-4672-8589-9139d7cb5abe': "Vitor Oliveira · CC BY-SA 2.0",
    'c4e37952-73a1-42b7-b36f-b4fd60291102': "Vitor Oliveira · CC BY-SA 2.0",
    '23be37b8-dc27-4a24-b91f-a24e2dd76b3d': "Pacopac · CC BY-SA 4.0",
    'bdd9928f-c4b0-4e06-95b9-9ccead088030': "Vitor Oliveira · CC BY-SA 2.0",
    'd298db41-b072-4fcb-9bbb-d6ad9c5bf1f0': "Bosc d'Anjou · CC BY 2.0",
    '64b383cd-da9c-496c-bc43-77908e175f8d': "Vitor Oliveira · CC BY-SA 2.0",
    '6116b10b-1e12-4d54-b9ce-86bb6792fa6b': "Vitor Oliveira · CC BY-SA 2.0",
    'b543a3dd-bfe8-40d7-8d5e-2ac453daf76e': "Jules Verne Times Two · CC BY-SA 4.0",
    '7f17154c-8b05-4c15-82ae-d14dc121bc21': "Vitor Oliveira · CC BY-SA 2.0",
    '4a454a94-b132-44dc-a15b-3733e85d52f2': "Vitor Oliveira · CC BY-SA 2.0",
    '56c6175b-966c-4d7f-a459-9db79d78734c': "Vitor Oliveira · CC BY-SA 2.0",
    '580c0d76-51d5-476b-94a4-31ce0435471b': "Vitor Oliveira · CC BY-SA 2.0",
    '5ed26c4c-0979-4497-a021-253ef66f6aeb': "Vitor Oliveira · CC BY-SA 2.0",
    'f434fab5-7b9b-4587-8397-1614df91d007': "Vitor Oliveira · CC BY-SA 2.0",
    'c0b66706-af15-47b5-adc4-6ff208c3b855': "Vitor Oliveira · CC BY-SA 2.0",
    '6541d792-54dd-4b32-b89c-02ef4c7c9f90': "Vitor Oliveira · CC BY-SA 2.0",
    'e927161a-02ad-4e1c-89f0-541a9e0d99ba': "Kolforn · CC BY-SA 4.0",
    'aa950882-863f-42db-81b8-0c5e9d64ba24': "Nuno Capelo Caldeira · CC BY-SA 4.0",
    '47af766c-c76f-483f-986b-5dbefd6f294a': "jfcfar · CC BY 2.0",
    '10f7f046-fb30-493e-acf0-bf6b2a57858b': "Vitor Oliveira · CC BY-SA 2.0",
    '07b0b2c3-f11d-474d-9f5f-02dc87a4be64': "Joehawkins · CC BY-SA 4.0",
    'a45ef0a4-98ff-4eb2-bc3d-3cee21ca5570': "Cornelius Kibelka · CC BY-SA 2.0",
    '508706d1-2ddd-4377-8319-75a5bb347435': "Vitor Oliveira · CC BY-SA 2.0",
    'd8c2c61e-734a-41c5-aec1-66981023cfca': "Aabasch · CC BY-SA 4.0",
    '0f616614-30d1-488a-986a-acd1caebbe6c': "Vitor Oliveira · CC BY-SA 2.0",
    'fede421d-0f75-46f7-9248-9a374bc63c4c': "flowcomm · CC BY 2.0",
    '868b17e0-9f74-46b1-8f84-bacc0ff7db94': "Filipe Rocha, Sacavem · CC BY-SA 3.0",
    '6b2661a4-4126-4ac4-8a03-ec2193cd4494': "Vitor Oliveira · CC BY-SA 2.0",
    'db7e9098-4293-4b44-a443-d42491916a91': "Vitor Oliveira · CC BY-SA 2.0",
    '304b2207-d81b-4fef-bdc3-74392d207133': "Alexkom000 · CC BY 4.0",
    'a8e9c668-f606-4100-87ea-b00ea61617e5': "Vitor Oliveira · CC BY-SA 2.0",
    '53d1fa07-14d1-4806-8c8c-d0ec01f35b28': "Jorge Franganillo · CC BY 2.0",
    '9b62bea8-e8c4-44f1-9ab5-9e9864cf6bb5': "Manuelvbotelho · CC BY-SA 3.0",
    '6a12acc8-f776-4b01-96f7-73f9fb096e6d': "Vitor Oliveira · CC BY-SA 4.0",
    '513d687d-b8f9-4d87-b5a7-c6de1d7d695c': "GualdimG · CC BY-SA 4.0",
    '0b9d2380-38cf-437d-a4e3-4b68158ba2a4': "Vitor Oliveira · CC BY-SA 2.0",
    'feead871-bb63-43d7-acf9-592d7d54b514': "Vitor Oliveira · CC BY-SA 2.0",
    '4b75fb06-7715-4b56-8b37-8f6eb332ae22': "Vitor Oliveira · CC BY-SA 2.0",
    '6b3928b3-4680-4051-b2f1-e3bdb41cab35': "Vitor Oliveira · CC BY-SA 2.0",
    '3d2dacea-cfcb-4086-9e15-a7b57ec9f2e7': "Aabasch · CC BY-SA 4.0",
    'fefd19c5-2dad-4627-a476-daa13be99352': "Vitor Oliveira · CC BY-SA 2.0",
    'f893e0a8-9f2e-4533-9093-001877541cf1': "Vitor Oliveira · CC BY-SA 2.0",
    'b699e6b6-e0cb-4620-9355-e1f3074ddde9': "Sergei Gussev · CC BY 2.0",
    '26b8762d-0343-4a93-9670-9a86993e7dfd': "CardosoSousa1988 · CC BY-SA 4.0",
    '0e3bf570-263f-45c1-afd2-0f9ca232b07c': "Glen Bowman · CC BY 2.0",
    '9fd20503-ced1-4e4c-9069-d38c320ef247': "Edgar Jiménez · CC BY-SA 2.0",
    '74421a75-f67c-45d5-928f-b7fae44adc33': "Luis Ascenso · CC BY 2.0",
    '5c45c033-1182-4e59-b0de-61ec81ab38f2': "Vitor Oliveira · CC BY-SA 2.0",
    'd3b73c18-ff72-4f00-b556-0370fd549fd3': "Kolforn · CC BY-SA 4.0",
    'efdfab6a-36b9-42a6-8e11-019450a51c86': "Vitor Oliveira · CC BY-SA 2.0",
    'b5d5f332-d553-49d9-ad92-77d658de945f': "Vitor Oliveira · CC BY-SA 2.0",
    '2dd735c3-9317-45bb-aed7-c3832af7653d': "Vitor Oliveira · CC BY-SA 2.0",
    '925ac239-db1f-432b-98ee-7a308ae9a6b8': "Tiago J. G. Fernandes · CC BY 2.0",
    'f400d000-20b2-414c-ba38-bae63856431f': "Dario · CC BY-SA 1.0",
    '6adf3ccd-9fd2-4bc0-894e-e4c775fb3e71': "Vitor Oliveira · CC BY-SA 2.0",
    'dee7ca71-0316-4254-a1db-6c8f79a6e380': "Vitor Oliveira · CC BY-SA 2.0",
    '081ec673-aec2-4015-b711-4f88b2664914': "Vitor Oliveira · CC BY-SA 2.0",
    'cb7d55ac-702f-49ec-98f7-d2c8c8e62715': "Diego Delso · CC BY-SA 3.0",
    '91f9ac99-a4b2-4793-afba-5b7f79d72d54': "Vitor Oliveira · CC BY-SA 2.0",
    '49839927-ee16-498b-80a8-f029627fd4c5': "Vitor Oliveira · CC BY-SA 2.0",
    '51c5eb21-e534-4c5c-98e0-305c78721686': "Joseolgon · CC BY-SA 4.0",
    'fa66de51-13bc-4088-8b94-942d33e525fc': "Vitor Oliveira · CC BY-SA 2.0",
    '67e04297-3a9a-4e41-808f-cae811d0680b': "Juntas · CC BY-SA 4.0",
    'ffe1a91f-de57-4ff0-9ad5-d32951851730': "Acscosta · CC BY-SA 3.0",
    '7b053b2b-f6f9-4d2b-b897-e4f4b52f463a': "Vitor Oliveira · CC BY-SA 2.0",
    '9efe4cc6-cb4a-4265-83c3-c710917810c1': "Vitor Oliveira · CC BY-SA 2.0",
    'f1f7b723-5ae7-457f-a810-6d5ad1f43c23': "Vitor Oliveira · CC BY-SA 2.0",
    '8c523fc0-993c-4e0e-9d29-755d7257be50': "OAM7717 · CC BY-SA 4.0",
    'f940e21f-3169-486c-9438-30dd3e503eb3': "Vitor Oliveira · CC BY-SA 2.0",
    'b7c02df5-a01e-40e3-8a13-342d56058eb4': "Alberto-g-rovi · CC BY 3.0",
    'a9b0eada-8f04-4862-85aa-2892039baecd': "Towiki60 · Domínio público",
    '43290bbc-db7f-4b1e-9cb5-a51b644c0ca6': "Joseolgon · CC BY-SA 4.0",
    '62030703-6711-4653-bc35-b1284f35cd5e': "Vitor Oliveira · CC BY-SA 2.0",
    '24dba43c-02fb-40bc-b3a8-d39e1f8ea49e': "Vitor Oliveira · CC BY-SA 2.0",
    '63d09050-d513-474a-87f4-3658b18da09a': "Sergei Gussev · CC BY 2.0",
    '63806db3-12a1-4e83-b354-1ac4b44fcb2d': "Vitor Oliveira · CC BY-SA 2.0",
    '6347e27e-d7fe-45bd-9fb8-ff3d7557d100': "Alexkom000 · CC BY 4.0",
    '010ffc15-3125-4156-aa4f-54b6198ae8e3': "Tiago J. G. Fernandes · CC BY 2.0",
    '2b2b6f80-d16c-4689-87f8-4b799a24fd9e': "Vitor Oliveira · CC BY-SA 2.0"
  };
  /* Sem foto verificavel no Commons: cartao sem foto (nunca mostrar outra praia) */
  var NO_PHOTO = {
    '781cff5a-f003-4f55-a381-f9e94fd2bdc2': 1, /* Praia do Osso da Baleia */
    'e3da620e-beaf-4a4a-80e3-d3f94c3a311e': 1, /* Praia da Crismina */
    '52e176c2-b7e6-4a85-abcf-6cf871464967': 1 /* Praia da Samoqueira */
  };

  function card(b, lang) {
    lang = lang === 'en' ? 'en' : 'pt'; var L = I[lang];
    var name = b.name || '', id = b.id ? String(b.id) : '';
    var orig = b.image_curated_url || b.image_storage_url_webp || b.image_storage_url || b.image_url || '';
    var detail = id ? L.beach(id) : '#';
    var planner = L.planner + '?beach=' + encodeURIComponent(name) + '&i=praia&ref=beaches';
    var booking = 'https://www.booking.com/searchresults.' + L.booking + '.html?ss=' + encodeURIComponent(name + ', Portugal');
    var slug = name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    var desc = (b.i18n && b.i18n.description && b.i18n.description[lang]) || b.description || '';
    var feats = tags(b, lang).slice(0, 3).map(function (t) { return '<li>' + (ICON[t] || '') + esc(L.feats[t] || t) + '</li>'; }).join('');
    var cr = NO_PHOTO[id] ? '' : credit(b, L);
    var img = (id && !NO_PHOTO[id])
      ? '<img src="/images/beaches/' + esc(id) + '-480.webp" srcset="/images/beaches/' + esc(id) + '-480.webp 480w, /images/beaches/' + esc(id) + '-800.webp 800w" sizes="(max-width: 640px) 92vw, 380px" width="480" height="320" alt="' + esc(name) + '" loading="lazy" decoding="async" data-orig="' + esc(orig) + '" onerror="BC2.imgErr(this)">'
      : '';
    var h = '';
    h += '<article class="beach-card bc2" role="listitem" data-beach-id="' + esc(id) + '" data-region="' + esc(b.region || '') + '" data-quality="' + esc(b.water_quality || '') + '" data-name="' + esc(name) + '" data-slug="' + esc(slug) + '" data-tags="' + esc((Array.isArray(b.tags) ? b.tags : []).join(',')) + '" data-editorial-rank="' + esc(b.editorial_rank || '') + '" data-lat="' + esc(b.latitude || '') + '" data-lng="' + esc(b.longitude || '') + '" tabindex="0" onclick="window.location.href=\'' + detail + '\'" onkeydown="if(event.target===this&&(event.key===\'Enter\'||event.key===\' \')){event.preventDefault();window.location.href=\'' + detail + '\'}">';
    h += '<figure class="bc2__media">' + img +
         '<div class="bc2__fallback"' + (img ? ' style="display:none"' : '') + '>' + ICON.wave + '<span>' + esc(name) + '</span></div>' +
         (b.region ? '<span class="bc2__chip bc2__chip--region">' + esc(b.region) + '</span>' : '') +
         (b.water_quality === 'Excelente' ? '<span class="bc2__chip bc2__chip--quality">' + ICON.check + esc(L.excellent) + '</span>' : '') +
         '<p class="bc2__live" aria-live="polite"><span class="bc2__dot" aria-hidden="true"></span><span class="bc2__live-t"></span></p>' +
         (cr ? '<figcaption class="bc2__credit">' + esc(cr) + '</figcaption>' : '') +
         '</figure>';
    h += '<div class="bc2__body"><h2 class="bc2__name">' + esc(name) + '</h2>' +
         (desc ? '<p class="bc2__hook">' + esc(desc) + '</p>' : '') +
         (feats ? '<ul class="bc2__feats">' + feats + '</ul>' : '') +
         '<div class="bc2__actions">' +
           '<a class="bc2__hotels" href="' + esc(booking) + '" target="_blank" rel="sponsored noopener noreferrer" onclick="event.stopPropagation()" aria-label="' + esc(L.ariaHotels(name)) + '">' +
             '<span class="bc2__hotels-l">' + ICON.bed + esc(L.hotels) + '</span><span class="bc2__hotels-r"><span class="bc2__pr">' + esc(L.prices) + '</span>' + ICON.arrow + '</span></a>' +
           '<a class="bc2__ghost" href="' + esc(planner) + '" onclick="event.stopPropagation()" aria-label="' + esc(L.ariaPlan(name)) + '">' + ICON.cal + esc(L.plan) + '</a>' +
           '<a class="bc2__ghost" href="' + esc(detail) + '" onclick="event.stopPropagation()" aria-label="' + esc(L.ariaDetails(name)) + '">' + ICON.eye + esc(L.details) + '</a>' +
         '</div></div></article>';
    return h;
  }

  function imgErr(img) {
    var o = img.getAttribute('data-orig');
    if (o && img.getAttribute('src') !== o) { img.removeAttribute('srcset'); img.src = o; return; }
    img.style.display = 'none';
    var fb = img.parentNode && img.parentNode.querySelector('.bc2__fallback'); if (fb) fb.style.display = 'flex';
  }

  /* ── Condicoes ao vivo ─────────────────────────────────────────────────── */
  var KEY = 'pth_bc2_live_v1', TTL = 30 * 60 * 1000, mem = null, queue = [], timer = null, observer = null, LANG = 'pt';
  function load() {
    if (mem) return mem;
    try { mem = JSON.parse(sessionStorage.getItem(KEY) || '{}') || {}; } catch (e) { mem = {}; }
    return mem;
  }
  function save() { try { sessionStorage.setItem(KEY, JSON.stringify(mem)); } catch (e) {} }
  function fmt(v) { return (LANG === 'en' ? v.toFixed(1) : v.toFixed(1).replace('.', ',')); }
  function paint(cardEl, d) {
    var p = cardEl.querySelector('.bc2__live'); if (!p || !d || d.w == null) return;
    var L = I[LANG], parts = [L.waves + ' ' + fmt(d.w) + ' m'];
    if (d.t != null) parts.push(L.water + ' ' + Math.round(d.t) + ' °C');
    p.querySelector('.bc2__live-t').textContent = L.now + ' · ' + parts.join(' · ');
    p.setAttribute('data-level', d.w <= 0.6 ? 'calm' : (d.w <= 1.2 ? 'moderate' : 'rough'));
    p.classList.add('is-on');
  }
  function flush() {
    timer = null; var cache = load(), now = Date.now(), need = [];
    queue.splice(0).forEach(function (el) {
      var id = el.getAttribute('data-beach-id'), c = cache[id];
      if (c && now - c.ts < TTL) paint(el, c); else need.push(el);
    });
    if (!need.length) return;
    // Se o LiveCoast existir (hero v3), usar o pedido partilhado (o mapa ja pediu as 111 praias de uma vez)
    if (window.LiveCoast) {
      window.LiveCoast.sea(need.map(function (el) { return { id: el.getAttribute('data-beach-id'), lat: parseFloat(el.getAttribute('data-lat')), lng: parseFloat(el.getAttribute('data-lng')) }; }))
        .then(function (res) { need.forEach(function (el) { var d = res[el.getAttribute('data-beach-id')]; if (d) paint(el, d); }); });
      return;
    }
    var lat = [], lng = [];
    need.forEach(function (el) { lat.push(el.getAttribute('data-lat')); lng.push(el.getAttribute('data-lng')); });
    var url = 'https://marine-api.open-meteo.com/v1/marine?latitude=' + lat.join(',') + '&longitude=' + lng.join(',') + '&current=wave_height,sea_surface_temperature&timezone=Europe%2FLisbon';
    var ctrl = window.AbortController ? new AbortController() : null; var to = ctrl ? setTimeout(function () { ctrl.abort(); }, 8000) : null;
    fetch(url, ctrl ? { signal: ctrl.signal } : {}).then(function (r) { if (to) clearTimeout(to); if (!r.ok) throw 0; return r.json(); }).then(function (res) {
      var arr = Array.isArray(res) ? res : [res];
      need.forEach(function (el, i) {
        var c = arr[i] && arr[i].current; if (!c) return;
        var d = { w: typeof c.wave_height === 'number' ? c.wave_height : null, t: typeof c.sea_surface_temperature === 'number' ? c.sea_surface_temperature : null, ts: Date.now() };
        mem[el.getAttribute('data-beach-id')] = d; paint(el, d);
      });
      save();
    }).catch(function () { /* sem dados: o selo fica escondido */ });
  }
  function after(grid, lang) {
    LANG = lang === 'en' ? 'en' : 'pt';
    if (!grid || !('IntersectionObserver' in window)) return;
    if (observer) observer.disconnect();
    observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        observer.unobserve(e.target);
        var la = parseFloat(e.target.getAttribute('data-lat')), ln = parseFloat(e.target.getAttribute('data-lng'));
        if (!isFinite(la) || !isFinite(ln)) return;
        queue.push(e.target);
      });
      if (queue.length && !timer) timer = setTimeout(flush, 120);
    }, { rootMargin: '200px 0px' });
    grid.querySelectorAll('.bc2').forEach(function (el) { observer.observe(el); });
  }

  window.BC2 = { card: card, after: after, imgErr: imgErr };
})(window, document);
