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
          feats: { fluvial: 'Praia fluvial', 'família': 'Família', surf: 'Surf', natureza: 'Natureza', ilhas: 'Ilhas', pesca: 'Pesca' },
          ariaHotels: function (n) { return 'Ver hotéis perto de ' + n + ' e preços'; },
          ariaPlan: function (n) { return 'Planear viagem a ' + n; }, ariaDetails: function (n) { return 'Ver a praia ' + n; },
          beach: function (id) { return 'beach.html?id=' + encodeURIComponent(id); }, planner: '/planear', booking: 'pt-pt' },
    en: { hotels: 'Hotels nearby', prices: 'see prices', plan: 'Plan trip', details: 'View beach', excellent: 'Excellent water',
          now: 'Now', waves: 'waves', water: 'sea', photo: 'Photo',
          feats: { fluvial: 'River beach', 'família': 'Family', surf: 'Surf', natureza: 'Nature', ilhas: 'Islands', pesca: 'Fishing' },
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
  ICON.surf = ICON.wave; ICON.fluvial = ICON.pin;

  /* Mesma logica de etiquetas que a pagina ja usava (deriveTags) */
  function tags(b, lang) {
    var t = [];
    var desc = (((b.i18n && b.i18n.description && b.i18n.description[lang]) || '') + ' ' + (b.description || '')).toLowerCase();
    var region = (b.region || '').toLowerCase(), fac = Array.isArray(b.facilities) ? b.facilities : [];
    if (b.is_surf_spot || desc.indexOf('surf') > -1 || desc.indexOf('onda') > -1 || region === 'porto') t.push('surf');
    // Lote C 09/10 (PL-02): 'Nao recomendada para criancas' dava etiqueta Familia (a palavra 'crianca' aparecia na frase negativa)
    var notFam = /n[ãa]o\s+(é\s+)?(recomendad|aconselhad|indicad)\w*\s+(para|a)\s+(crian|famíl|famil)|desaconselhad\w*\s+(para|a)\s+(crian|famíl|famil)|not\s+(recommended|suitable)\s+for\s+(children|kids|families)/.test(desc);
    if (!notFam && (fac.indexOf('lifeguard') > -1 || desc.indexOf('famil') > -1 || desc.indexOf('famíl') > -1 || desc.indexOf('criança') > -1 || region === 'algarve')) t.push('família');
    if (desc.indexOf('naturez') > -1 || desc.indexOf('isolad') > -1 || region === 'alentejo') t.push('natureza');
    if (region === 'madeira' || region === 'açores') t.push('ilhas');
    if (desc.indexOf('pesc') > -1) t.push('pesca');
    if (b.beach_type === 'fluvial') t = ['fluvial'].concat(t.filter(function (x) { return x !== 'surf' && x !== 'ilhas'; }));
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
    // Praias fluviais B6 (08/10/2026)
    'd69441fd-89c2-433d-9754-a88f52e5816c': "Vitor Oliveira · CC BY-SA 2.0",
    '3c236118-430c-4f99-a366-3affe99ac81d': "tiago186703274 · CC BY-SA 3.0",
    'ac769631-d8b0-47e3-b500-627f8895154d': "Vitor Oliveira · CC BY-SA 2.0",
    'bf314ac0-7003-4dba-a906-59bfe51abafa': "Vitor Oliveira · CC BY-SA 2.0",
    '3897b9c3-88da-4859-a5f1-2e6605fb46d4': "Vitor Oliveira · CC BY-SA 2.0",
    '0418baf9-99f8-4c91-badd-7a05d5bc1b98': "Vitor Oliveira · CC BY-SA 4.0",
    '63787289-52bd-4a85-950b-11f81edb5763': "Joseolgon · CC BY-SA 4.0",
    'a0894825-7bb4-4c38-a94c-7d1e22c19f53': "Vitor Oliveira · CC BY-SA 4.0",
    '50c53b1c-ee03-46fe-8ea1-225dc8ea4cc9': "Joseolgon · CC BY-SA 4.0",
    '4c948cd0-8542-4f06-9042-ea0c1184ab3b': "Vitor Oliveira · CC BY-SA 2.0",
    '617c8b79-ba40-404f-a4d0-0daaea7502f9': "Vitor Oliveira · CC BY-SA 2.0",
    '3832dad2-bcda-4faa-b308-05ccafed5132': "Vitor Oliveira · CC BY-SA 2.0",
    'bb421e7b-a80d-46b2-9519-7142a6fec6cd': "Vitor Oliveira · CC BY-SA 2.0",
    '1f0d3caa-52c7-469e-a983-e96f60d2d4b3': "Vitor Oliveira · CC BY-SA 2.0",
    '8cd04ca0-d5b0-4e2a-9c01-8e03d0511404': "Vitor Oliveira · CC BY-SA 2.0",
    '6d929aae-425a-4443-9e2e-b3ae38545823': "Vitor Oliveira · CC BY-SA 2.0",
    'b6214cb6-8bda-4e78-a3e9-e9f88c1a44a1': "Vitor Oliveira · CC BY-SA 2.0",
    '73b2e239-4e41-4846-b544-fbdcb8079419': "Vitor Oliveira · CC BY-SA 2.0",
    'b37cac89-3e52-49a2-883e-b6438d218e4d': "Vitor Oliveira · CC BY-SA 2.0",
    'ba416c4f-ea36-4e72-9f39-30e8dbfb9a1a': "Vitor Oliveira · CC BY-SA 2.0",
    '53d1c305-b0d8-4b5e-84c1-535a9a28be4a': "Vitor Oliveira · CC BY-SA 2.0",
    'a4c1e46c-8ee8-4c0f-8d3e-5987dd6203b4': "Vitor Oliveira · CC BY-SA 2.0",
    '3030e902-d1ea-4836-b7cc-2673adece120': "Vitor Oliveira · CC BY-SA 2.0",
    '2b101b40-62a2-4b92-98fd-ba8080d606f4': "Vitor Oliveira · CC BY-SA 2.0",
    '3f82ecdf-2929-4b08-85b6-435ed8e66a9a': "Hipersyl · CC BY-SA 4.0",
    '09ed9e2a-873c-4ced-9523-2be28784e238': "DiogoBaptista · CC BY-SA 4.0",
    '7c56e770-6460-494e-a79c-5dec748dfc2d': "Hipersyl · CC BY-SA 4.0",
    'f7f1b6d8-26f9-4f8d-b23f-1b3f00b60244': "Vitor Oliveira · CC BY-SA 2.0",
    'b31e8924-d13d-452b-8755-648f8b7fc50f': "DiogoBaptista · CC BY-SA 4.0",
    'f8a2db74-11c1-4454-bea9-a97ffc5aa4d3': "Vitor Oliveira · CC BY-SA 2.0",
    'b865aad4-9976-4eb8-9998-85d189759adf': "Vitor Oliveira · CC BY-SA 2.0",
    '4bc3877c-8cca-4e8a-a495-5a786ef04b7e': "Vitor Oliveira · CC BY-SA 2.0",
    'cc954d3f-13d9-4df5-a5f2-1eaee1cd3156': "Vitor Oliveira · CC BY-SA 2.0",
    '0a50fc5e-c47a-455f-83ce-d591e1936e28': "Vitor Oliveira · CC BY-SA 2.0",
    '8f91cf8e-465f-4a36-ba88-c1ddcad5fc28': "Vitor Oliveira · CC BY-SA 2.0",
    '393b934a-4182-48e1-a41b-aa3cc76874b8': "Vitor Oliveira · CC BY-SA 2.0",
    'b0c46c35-ec59-4c6e-929f-8386e93950ad': "Vitor Oliveira · CC BY-SA 2.0",
    '46d0bed0-98e6-4d85-828a-30269de38219': "Vitor Oliveira · CC BY-SA 2.0",
    '95d5f701-d9a7-4578-9653-b5f4a966aacf': "Vitor Oliveira · CC BY-SA 2.0",
    'a3a240f3-6564-49a4-9539-4dbc1677169b': "Vitor Oliveira · CC BY-SA 2.0",
    '4c1f2b21-5d87-46ed-bfd9-bd49557b985d': "Vitor Oliveira · CC BY-SA 2.0",
    '845b72d5-3417-4847-aeab-453c857a45a9': "Vitor Oliveira · CC BY-SA 2.0",
    'ac00493b-8784-4aff-b3be-1a33fd2125c8': "Vitor Oliveira · CC BY-SA 2.0",
    '6d773184-c625-4b17-8573-d1feefa8efcf': "Vitor Oliveira · CC BY-SA 2.0",
    '7a9a1edf-3236-48b6-9f56-22098d0a1880': "Vitor Oliveira · CC BY-SA 2.0",
    '2ab6aba1-ce86-43d2-a0b9-18f55a06e796': "Vitor Oliveira · CC BY-SA 2.0",
    '2cd16507-3536-45cb-9f29-a84fdcc3d7bb': "Vitor Oliveira · CC BY-SA 2.0",
    '1698508a-7190-450e-9021-61b6ba227f47': "Vitor Oliveira · CC BY-SA 2.0",
    '3548e3b8-ce48-48cd-8a81-338ae015f809': "Vitor Oliveira · CC BY-SA 2.0",
    '7719cc26-30ea-4bd2-891d-79e76db204cb': "Vitor Oliveira · CC BY-SA 2.0",
    'd30135f5-5525-4f3a-a8ee-17174ae788db': "Vitor Oliveira · CC BY-SA 2.0",
    '2a2468d2-b830-46ec-8bb4-d41751bf51a8': "Vitor Oliveira · CC BY-SA 2.0",
    '5e16a49e-553e-48bc-bb82-093a6126ebbb': "Vitor Oliveira · CC BY-SA 2.0",
    '41858b36-d73c-4a71-8f2c-b02623363a33': "SartagoSternitSartagineHostes · CC BY-SA 4.0",
    'b749bf41-ec1b-4fa3-9973-f19011506f47': "Vitor Oliveira · CC BY-SA 2.0",
    '642eefb0-efe0-4fca-9fa5-47ebef8262e4': "Vitor Oliveira · CC BY-SA 2.0",
    '1167225e-cedc-4acd-b72a-a08817830c0c': "Vitor Oliveira · CC BY-SA 2.0",
    'ef8e0a92-1e4a-4b5c-b483-05dc2754859e': "Vitor Oliveira · CC BY-SA 2.0",
    '452065a5-d56c-4ec7-b8de-53735e6a66d4': "Vitor Oliveira · CC BY-SA 2.0",
    'e17fd8df-3dbe-448c-ad7b-15245641fcb5': "Vitor Oliveira · CC BY-SA 2.0",
    '114d03a5-b9f3-44ee-9701-98b438c6c47b': "Vitor Oliveira · CC BY-SA 2.0",
    '28302e25-c73e-428d-94a9-928fffc166c1': "Vitor Oliveira · CC BY-SA 2.0",
    'ec0245de-9edc-47f5-94c0-2ca318371172': "Vitor Oliveira · CC BY-SA 2.0",
    'decd7e63-95ab-4aea-b7c5-08ece0446860': "Vitor Oliveira · CC BY-SA 2.0",
    '1e968526-3406-4fa9-b573-f986a6fb6f0b': "Vitor Oliveira · CC BY-SA 2.0",
    '9128483f-6da4-4b70-9b29-1129ad099dee': "Vitor Oliveira · CC BY-SA 2.0",
    '887c5461-ef30-43dc-8ed4-1086cf714978': "Vitor Oliveira · CC BY-SA 2.0",
    'fb1c03dd-37a1-48d9-9ca8-3cd33bfebc77': "Vitor Oliveira · CC BY-SA 2.0",
    'ac0c735a-418c-4bd5-b8ab-c08df50284e9': "Vitor Oliveira · CC BY-SA 2.0",
    '84058a9b-a361-4ee9-b738-fcf9eb0af4fc': "Panegyrics of Granovetter · CC BY-SA 4.0",
    '0401e475-0b3f-4a20-8f7c-e2399a7e8bd4': "Vitor Oliveira · CC BY-SA 2.0",
    '004cc2ac-510e-4246-a32e-ee3cec8be170': "Vitor Oliveira · CC BY-SA 2.0",
    '90add15e-cb1b-4121-909d-c63dec21fb49': "Vitor Oliveira · CC BY-SA 2.0",
    '60ddab73-f7ab-4215-8032-649e0a9b93af': "Vitor Oliveira · CC BY-SA 2.0",
    '972aa56d-f547-4740-9108-829901737a4f': "José Carlos Oliveira · CC BY-SA 2.0",
    'a1ac8752-1d9e-4c5f-8583-6a2962a76bdf': "Vitor Oliveira · CC BY-SA 2.0",
    'ed336295-4319-45ff-90df-03c0c1b3a947': "Vitor Oliveira · CC BY-SA 2.0",
    '52b1cf94-125e-419d-b7bb-626f8a9d7300': "Vitor Oliveira · CC BY-SA 2.0",
    'e9887042-af56-4f22-a72e-1e16f993d0ad': "DiogoBaptista · CC BY-SA 4.0",
    '70007136-e8de-41eb-a7f0-42b334cfc42f': "Vitor Oliveira · CC BY-SA 2.0",
    'cfc5dae4-cf02-4df1-970c-245c49e1869e': "Vitor Oliveira · CC BY-SA 2.0",
    // Lote B5 de praias (08/10/2026)
    '155d7724-e194-428d-8bf4-7e18abb2aed7': "Vitor Oliveira · CC BY-SA 2.0",
    '055cca4d-ee7d-4ef6-8204-ea9265ec704e': "Sergei Gussev · CC BY 2.0",
    'bc1e4246-a8e1-42c5-8577-119318b3fbb9': "Krzysztof Golik · CC BY-SA 4.0",
    '37c4cd58-a82c-4f38-9710-48d3dd24660b': "Isabel L. Silva · CC BY-SA 4.0",
    '6ce5992f-4bd3-42c3-a710-d2d987c8363c': "Vitor Oliveira · CC BY-SA 2.0",
    '65cf5f44-de44-41c0-a419-00e0554f607f': "Lucas Martínez Farra… · CC BY-SA 3.0",
    '7cf2d44f-99d9-4338-a8c7-5894e891137f': "Vitor Oliveira · CC BY-SA 2.0",
    '61887f8a-8922-4ba5-ad0a-45f881c351bf': "Vitor Oliveira · CC BY-SA 2.0",
    '46869249-375b-4a32-9adb-c372544414ba': "Vitor Oliveira · CC BY-SA 2.0",
    'eab15399-eeb4-48a2-a798-eba7a12e0d28': "Vitor Oliveira · CC BY-SA 2.0",
    'e4fb473e-c931-412b-89a3-f165663cc0df': "Vitor Oliveira · CC BY-SA 2.0",
    '03fbf94b-0b57-4dc6-b591-c0c6e3741a4d': "Vitor Oliveira · CC BY-SA 2.0",
    '865a8bf2-f14c-4162-b617-c30fe5e8df5d': "Vitor Oliveira · CC BY-SA 2.0",
    '73903aa6-2381-4de2-bb7e-711c3f7eeedb': "Vitor Oliveira · CC BY-SA 2.0",
    '57526254-1697-4e4e-bccb-8aad4845637c': "Vitor Oliveira · CC BY-SA 2.0",
    '5b6a2683-e641-4d24-ab09-8344ab155721': "Vitor Oliveira · CC BY-SA 2.0",
    '7191f050-c51a-4b02-be5d-f05e2cf9e26e': "Vitor Oliveira · CC BY-SA 2.0",
    '58f01940-1eba-48f6-9f31-3b9a085a8e84': "Vitor Oliveira · CC BY-SA 2.0",
    '8e8b1a53-d25b-4819-bbb2-a5ea088797e6': "Rui T. Pinto · CC BY-SA 4.0",
    'd6ed45a0-b239-4478-bd96-dc730241b2c7': "Vitor Oliveira · CC BY-SA 2.0",
    '47ae4764-a60d-4ec5-a7c5-00a21e871fdb': "Vitor Oliveira · CC BY-SA 2.0",
    '01e58d32-5fe4-4700-9772-5cc1cd9760fc': "Vitor Oliveira · CC BY-SA 2.0",
    '1c240aa4-6970-4f9d-8635-80cb7422cb35': "Vitor Oliveira · CC BY-SA 2.0",
    '06b247da-0079-4522-a065-25add87fb95f': "Vitor Oliveira · CC BY-SA 2.0",
    '00788621-1158-4184-9bcd-43c1d8755977': "Vitor Oliveira · CC BY-SA 2.0",
    'f18f80b9-9924-469d-818d-c23488065d31': "Vitor Oliveira · CC BY-SA 2.0",
    'f0074430-0747-4d08-a8e9-162468afc3d8': "Vitor Oliveira · CC BY-SA 2.0",
    '6fcea0e0-eed8-4e71-b4ad-33c24815692e': "Vitor Oliveira · CC BY 2.0",
    '18030e2e-70b5-4e6e-9a5c-7935cdd13f6f': "Vitor Oliveira · CC BY-SA 4.0",
    'dc0629c2-fb75-4706-bafd-08d8cf4466be': "Vitor Oliveira · CC BY-SA 2.0",
    '06d98cdf-b310-4dfb-ac51-89ba00cdf277': "Vitor Oliveira · CC BY-SA 2.0",
    '400e7e4d-66b0-4efc-baf0-d3b79f694039': "Vitor Oliveira · CC BY-SA 2.0",
    '71adeb03-5026-4bba-b65f-8d79125e3c5d': "Vitor Oliveira · CC BY-SA 4.0",
    'e0c0455f-3e2c-4d90-95c9-01b28f661172': "Vitor Oliveira · CC BY-SA 2.0",
    // Lote B4 de praias (08/10/2026)
    '355ab513-1b15-455d-8086-3a80000ee407': "Vitor Oliveira · CC BY-SA 4.0",
    '3cd439e0-b726-44dd-a01c-6409f7bf0391': "Vitor Oliveira · CC BY-SA 2.0",
    '1eea8666-dbde-4e31-9120-54dbeec9ac9b': "Jose A. · CC BY 2.0",
    '441cccc7-a339-4aee-8d56-a1f6ea55110f': "Jose A. · CC BY 2.0",
    'a3e5153c-c183-4f20-9956-f0778a0d4a9f': "Vitor Oliveira · CC BY-SA 2.0",
    'ab40961d-ba81-4ff7-89c8-1fa587732736': "Freebird · CC BY-SA 2.0",
    '5b120139-4f37-47dd-8d50-5fb4ddd36b73': "21milo21 · CC0",
    'bea66bea-81ab-4445-aa6d-22b3e550e899': "Vitor Oliveira · CC BY-SA 2.0",
    'e57489e7-d222-43b6-ae14-24a234b01dc3': "Vitor Oliveira · CC BY-SA 2.0",
    '3bb185de-eede-4a8e-b226-39dd3db5b786': "Vitor Oliveira · CC BY-SA 2.0",
    'bea79a0d-6d7f-4862-b4cc-82160dfe4a3f': "Vitor Oliveira · CC BY-SA 2.0",
    '5097bad4-6949-44f5-850c-a9247037b7d2': "Jose A. · CC BY 2.0",
    '9add8697-72c4-41b1-8b99-d1e8df418c11': "Vitor Oliveira · CC BY-SA 2.0",
    '546c5b59-edfb-4b37-9fce-ec101c6e6e3e': "Vitor Oliveira · CC BY-SA 4.0",
    '96f0a86a-bbcf-42df-83f2-21155e17fb6f': "Vitor Oliveira · CC BY-SA 2.0",
    '98c701a2-5e43-4111-b2e8-0f92c26a1346': "Cossel · CC BY 3.0",
    '56f1dd06-d13d-4b36-a1cd-88ba284f2393': "Kolforn · CC BY-SA 4.0",
    '1baee7dc-bebd-4475-a12d-8c35fdcfdeec': "Vitor Oliveira · CC BY-SA 2.0",
    '0901e8ca-9e6e-4836-a79c-f4d3d776217a': "Vitor Oliveira · CC BY-SA 2.0",
    '7121018a-364b-4671-9553-a1485b172b25': "Vitor Oliveira · CC BY-SA 2.0",
    '272691c6-2056-402d-820b-d6a150d524dc': "Alexkom000 · CC BY 4.0",
    'a34d36c9-4662-423f-93f8-1fee61f022ee': "Vitor Oliveira · CC BY-SA 2.0",
    '96fd7eba-85f1-4446-a09d-d4d75beb21d7': "Vitor Oliveira · CC BY-SA 2.0",
    '1a101766-8f4b-4360-8bd0-bfc4b35525ee': "Michael Gaylard · CC BY 2.0",
    'acdfa7d4-fae4-46fd-b173-6f9af62bec5d': "Vitor Oliveira · CC BY-SA 2.0",
    'b6014c0c-3d29-429b-9a7d-e82960197424': "Alexey Komarov · CC BY 3.0",
    '1434131a-a8f8-4a7f-bdd7-a7162b004448': "GualdimG · CC BY-SA 4.0",
    '7b04f50d-d271-4ca3-8d11-0ce374c53561': "Alexkom000 · CC BY 4.0",
    '616f794b-efe6-4801-897f-584de39e045c': "Vitor Oliveira · CC BY-SA 2.0",
    'fbc425ba-cfc6-4fe3-8ebd-2c8abf6ef90c': "Vitor Oliveira · CC BY-SA 2.0",
    '4281168e-4992-4e5d-ba84-ebd1c3a26c1b': "LuisMAfonso · CC BY-SA 4.0",
    'd315a110-c292-445e-aefe-3ff6ce7ef307': "Vitor Oliveira · CC BY-SA 2.0",
    '05a79eec-ebc3-4eec-81ea-9574169e17e8': "Vitor Oliveira · CC BY-SA 2.0",
    '08c91075-52f8-44c7-a189-aa220cafff4d': "Vitor Oliveira · CC BY-SA 2.0",
    '2173718e-68cd-474e-a67e-0861d13700be': "Vitor Oliveira · CC BY-SA 2.0",
    'e442d81b-ad73-4790-bbb2-fdbeac7cacf8': "Vitor Oliveira · CC BY-SA 2.0",
    '1fac19e2-190d-4d89-a39f-f1280d166894': "Artur Malinowski · CC BY 2.0",
    '4e7964bf-1efa-4e28-b232-70818b6bb7c7': "Alberto-g-rovi · CC BY 3.0",
    'bf016917-24ac-4a91-a372-568b5162e4e5': "Alberto-g-rovi · CC BY 3.0",
    '78e04293-478f-4902-b6d6-5162ae3bf6a8': "Vitor Oliveira · CC BY-SA 2.0",
    'f8fd0b5c-1ef0-4280-bf68-3b3f5f8773be': "Mariakolago · CC BY-SA 4.0",
    '73f94858-2712-4aa0-837c-447fffe65203': "btvarusko · CC BY 2.0",
    'e5e15004-b3de-4472-b282-f5e202edee75': "JCNazza · CC BY 3.0",
    '94cbb1f7-2d8d-47a9-ab58-cf29ff762691': "Vitor Oliveira · CC BY 2.0",
    '4a325cf9-711b-4c00-93c3-c3dc0c03c367': "Vitor Oliveira · CC BY 2.0",
    '9ff2dc6d-bc05-4ed5-8027-4d3cdbfb74a6': "Hansueli Krapf This file was uploaded with Commonist. · CC BY-SA 3.0",
    'c3ef242d-38a4-4356-9b1b-c9cf89125f8a': "Ruben JC Furtado · CC BY-SA 3.0",
    '881143d4-ca37-4389-a00f-c946ec437b0b': "jad99 · CC BY-SA 2.0",
    'b028bbf8-0d41-4207-adac-bcd75cdecbeb': "JCNazza · CC BY 3.0",
    '80dfe159-a47a-4b1a-8c4f-258b0922a6d1': "JCNazza · CC BY 3.0",
    '806455ab-60f5-4763-bc10-78f668482f15': "Ruben JC Furtado · CC BY-SA 3.0",
    '15a383e5-fbc2-4f96-a8b4-ecfb9a1d8339': "Jules Verne Times Two · CC BY-SA 4.0",
    '4a36047b-a99f-4f47-a7d3-a075cf734449': "Vitor Oliveira · CC BY-SA 4.0",
    '1546bb1f-f07c-4350-bc42-eb10d342ddc2': "unukorno · CC BY 2.0",
    'd7be708f-89f8-487f-8d49-402209a43a67': "Vitor Oliveira · CC BY-SA 2.0",
    '6064d9d2-cec5-4656-9f43-fb054174bd41': "Jules Verne Times Two · CC BY-SA 4.0",
    '07c25604-dafc-45a9-9ce4-6b73c3a68328': "Vitor Oliveira · CC BY-SA 2.0",
    '22b63bb2-4d82-4595-9820-31bec89fd877': "Vitor Oliveira · CC BY-SA 2.0",
    '730f7ae0-8ad5-4731-9c11-6cd20365bd5c': "Vitor Oliveira · CC BY-SA 2.0",
    '6f4b3742-fd4a-40c2-ac69-0d3f8ad06051': "Vitor Oliveira · CC BY-SA 2.0",
    'dca4c5c1-821a-48df-ae06-b10c26d6321e': "Vitor Oliveira · CC BY-SA 2.0",
    'd92de58b-8541-4ba8-878f-eb8de05bca85': "Vitor Oliveira · CC BY-SA 2.0",
    '166e1a3f-5b01-4f6f-84f8-aa30f0f241f0': "Vitor Oliveira · CC BY-SA 2.0",
    '3bbde140-5134-4cd0-9120-ac524ef4446d': "Vitor Oliveira · CC BY-SA 2.0",
    '3797c9b2-00d4-4212-9674-af8d5694ab06': "José Luís Ávila Silveira/Pedro Noronha e Costa · Public domain",
    '34328e50-4d4a-45ed-a5c4-a70632802b4e': "Vitor Oliveira · CC BY-SA 2.0",
    '92bbaa95-69a1-4955-b67c-6c248d89af38': "Vitor Oliveira · CC BY-SA 4.0",
    '2b754a93-d447-4d76-9d72-2e99b496c8cd': "José Luís Ávila Silveira/Pedro Noronha e Costa · Public domain",
    'd445a202-f0cd-46aa-befe-02fd248b22a4': "Vitor Oliveira · CC BY-SA 2.0",
    'aa3d54bd-7a03-4a7d-bbda-e9149a39b8ac': "Vitor Oliveira · CC BY-SA 2.0",
    'ed6ec57f-adb7-4c36-a0c4-f129776cbe13': "Eduardo Manchon · CC BY-SA 3.0",
    '02127e50-2944-4840-a526-a89dd05dafec': "Vitor Oliveira · CC BY-SA 2.0",
    '2cbc1521-5c47-4bf0-b769-33b48bfa7eb6': "Vitor Oliveira · CC BY-SA 2.0",
    '1c89b458-523a-4014-945a-c390463aa194': "Eduardo Manchon · CC BY-SA 3.0",
    '586da732-8832-4c78-b746-b4854f3c1c9f': "Vitor Oliveira · CC BY-SA 2.0",
    'face1374-cf12-4e54-8fca-7701c362efd3': "Vitor Oliveira · CC BY-SA 2.0",
    // Lote B3 de praias (08/10/2026)
    '6210643d-f82a-458c-948e-7de143c49b55': "Fermion · CC BY 2.0",
    '88102fe2-62d3-4721-a27a-bab4d2ffe15c': "Vitor Oliveira · CC BY-SA 2.0",
    'd2e0de6e-e891-45a7-b2e2-c78441bdd3f6': "Vitor Oliveira · CC BY-SA 2.0",
    'dde3f623-1fbf-4bcd-8e1d-0381f78b94ad': "muffinn · CC BY 2.0",
    'a229d3bb-c089-45f9-82c6-31efc93122af': "Vitor Oliveira · CC BY-SA 2.0",
    '2934e6c6-ef59-4172-b973-cd7936da3873': "Vitor Oliveira · CC BY-SA 2.0",
    '619ef9eb-6f91-4cf1-9625-b4dbcf2dfd8b': "Vitor Oliveira · CC BY-SA 2.0",
    '0d6e382a-d336-4e04-9448-05a7f7d39673': "Kolforn · CC BY-SA 4.0",
    '7bd5d617-e577-4823-9269-d328d2631a20': "Kolforn · CC BY-SA 4.0",
    '15aaafb9-4ae2-494f-bc72-9778158ac76b': "Vitor Oliveira · CC BY-SA 2.0",
    '2af0d507-0af5-460b-aff2-b605eafa1f1b': "Beeston · CC BY 3.0",
    'b507c2ca-9975-457e-aed9-cced33668edc': "Kolforn · CC BY-SA 4.0",
    'a9704160-3d35-4ab7-942c-41599421f540': "Kolforn · CC BY-SA 4.0",
    '319974fc-4030-4330-91ce-1685eaff5667': "Kolforn · CC BY-SA 4.0",
    '3ce11a3d-c4cc-4cce-9abb-8b9e6ccf7b3e': "Vitor Oliveira · CC BY-SA 2.0",
    'fba6e728-cb2f-41f6-b921-a6dba551fe7e': "Vitor Oliveira · CC BY-SA 2.0",
    '771ff429-1b17-4e45-adff-5f3b3cdcc6e1': "Vitor Oliveira · CC BY-SA 2.0",
    '34f62e39-b5b7-4540-bdcd-cd35d8972aa9': "Vitor Oliveira · CC BY-SA 2.0",
    '53fe5a38-1a93-46d0-939e-eb08cd42ba68': "Vitor Oliveira · CC BY-SA 2.0",
    '500bb1ab-5ec5-436d-b555-e48444ec548e': "Vitor Oliveira · CC BY-SA 2.0",
    '23028eea-b000-45df-a625-a990cd2a53cc': "Jose A. · CC BY 2.0",
    '74de97fc-f3ff-4a28-a9b8-92517fa64eb9': "Vitor Oliveira · CC BY-SA 2.0",
    '9e3a79be-222c-4b05-b90f-3ab4017857c8': "Vitor Oliveira · CC BY-SA 4.0",
    'a6961662-b204-4fef-9916-c529f21a85e2': "Vitor Oliveira · CC BY-SA 4.0",
    'bb37684d-b534-4914-9f11-09e66daed740': "Vitor Oliveira · CC BY-SA 2.0",
    '4b3ec6e5-35f3-41d4-b6e8-3454cf3d601a': "Vitor Oliveira · CC BY-SA 2.0",
    'e7a9f6a0-35ee-4332-be39-a8d37c78fe3f': "Vitor Oliveira · CC BY-SA 2.0",
    '72084e6e-d230-428a-b053-9efadcbcf7fc': "Vitor Oliveira · CC BY-SA 2.0",
    '541f339e-9287-452d-80be-56e0ce86c70a': "Vitor Oliveira · CC BY-SA 2.0",
    '1bd1690d-613e-471d-aafd-c508b5d8eaa4': "Jacques Paysan · CC BY 2.0",
    '2016cd68-2f90-4c10-8c6b-30cd5562cede': "Vitor Oliveira · CC BY-SA 2.0",
    '88233a0a-3a55-4a95-9ff2-144f5459647c': "Vitor Oliveira · CC BY-SA 2.0",
    'e2ee3da8-358d-4b95-9d36-011d4f1de6d4': "Vitor Oliveira · CC BY-SA 2.0",
    'e7b054de-28b8-444a-8aa6-6289678417e1': "Vitor Oliveira · CC BY-SA 2.0",
    'b0010c2a-4024-442a-9509-38ef8dec73e2': "Vitor Oliveira · CC BY-SA 2.0",
    '415fb78a-a6c5-40dd-98d9-563dfb337f5c': "Vitor Oliveira · CC BY-SA 2.0",
    '1575a838-150e-4360-bbf9-37453dc0ca52': "Vitor Oliveira · CC BY-SA 2.0",
    '1e7bcce8-d99c-437b-8ddb-b8ce0d811d01': "Alexkom000 · CC BY 4.0",
    '1841fa6a-f713-455a-8cec-2207abe40e02': "Vitor Oliveira · CC BY-SA 2.0",
    '025349fa-956a-448e-ad3a-ff58cfacb514': "Vitor Oliveira · CC BY-SA 2.0",
    '0947d29b-b01c-479a-ba28-98b72cd94ea7': "Vitor Oliveira · CC BY-SA 2.0",
    '743712e3-2b1b-4f99-87b7-c68eea975e84': "Vitor Oliveira · CC BY-SA 2.0",
    '87a70b78-c18b-4d6b-9381-3b306c75d08a': "Vitor Oliveira · CC BY-SA 2.0",
    '7ef38114-8772-463d-ab1f-ec9ff6a39536': "Vitor Oliveira · CC BY-SA 2.0",
    '7853505f-e1ff-4f21-8354-8e4982566c32': "Vitor Oliveira · CC BY-SA 2.0",
    '40d75401-bc0e-42d0-b6b3-669d3dca265d': "Vitor Oliveira · CC BY-SA 2.0",
    '3dd3cbd8-3697-4e94-962a-a8c3dca76bda': "Vitor Oliveira · CC BY-SA 2.0",
    '544485fc-eba3-478d-a265-cbab78f2a04c': "Vitor Oliveira · CC BY-SA 2.0",
    'eeb38a67-35a7-4a42-9d69-9a22c00d2a0b': "Vitor Oliveira · CC BY-SA 2.0",
    '5c9c8e50-d300-4187-8c0e-db8895bc6ebc': "Vitor Oliveira · CC BY-SA 2.0",
    '12cccb8f-e54b-4bdd-a5c1-138af0b1fb8f': "Vitor Oliveira · CC BY-SA 2.0",
    'ef50355c-7860-4236-a6da-d30e412a4dea': "Vitor Oliveira · CC BY-SA 2.0",
    'bf5ae99f-b6cc-43ec-841d-eeae1099c0d7': "Vitor Oliveira · CC BY-SA 2.0",
    '3c9a075b-ea72-4616-b4ec-5965210268f0': "JCNazza · CC BY 3.0",
    '8a63da83-8856-4a66-bb31-c168790ae7e8': "The Cosmonaut · CC BY-SA 4.0",
    '6d319eca-d238-4fd3-8e31-085c60e9403c': "JCNazza · CC BY 3.0",
    'c3f48c57-0e24-4746-b128-8abd6110bfd3': "JCNazza · CC BY 3.0",
    '0da1d9ed-858e-4011-9506-4a9bfe6653eb': "JCNazza · CC BY 3.0",
    '46e04a13-4162-4af4-b4d0-4da7464824ff': "JCNazza · CC BY 3.0",
    '3f211578-418a-4d6e-a188-74c646868687': "Vitor Oliveira · CC BY-SA 2.0",
    'e77557d4-842b-4e59-9f63-7d806ea7e40d': "JCNazza · CC BY 3.0",
    'faa511fe-388d-470d-915f-f3e3b2a98938': "JCNazza · CC BY 3.0",
    'f97bf7d0-4068-4538-bb42-047dff69c1ed': "Mickey Løgitmark · CC BY 3.0",
    'deedac89-7307-470e-b01a-49dcf1fcb4b6': "Vitor Oliveira · CC BY-SA 2.0",
    '68688402-f32e-4b92-8fc6-5b2bb48da295': "Vitor Oliveira · CC BY-SA 2.0",
    'c8ff115e-e7cf-45fc-b5e9-9df5e4020a30': "Vitor Oliveira · CC BY-SA 2.0",
    '6c571168-88c7-4e2f-9254-bb7c17494887': "Vitor Oliveira · CC BY-SA 2.0",
    '13bf3b0b-2153-4845-a051-78c1d9ba9d65': "Vitor Oliveira · CC BY-SA 2.0",
    '1f303bba-6f7f-409b-88b4-94d92652f20c': "Vitor Oliveira · CC BY-SA 2.0",
    '1db377c8-ff89-4931-9b7c-a4de1b7eeea3': "Vitor Oliveira · CC BY-SA 2.0",
    'e3db5c95-2d2a-4a03-aa1d-49daa9ed5ee6': "Vitor Oliveira · CC BY-SA 2.0",
    'e33c2485-15d8-419c-9e4d-f904c109c724': "JCNazza · CC BY 3.0",
    'e4a7a649-7037-4cd7-bd7f-911aae1c4d95': "Vitor Oliveira · CC BY-SA 2.0",
    '38d04433-d2fe-4b87-97a4-72ff169f2177': "Vitor Oliveira · CC BY-SA 2.0",
    '53466cb1-5297-4ca4-bd4b-887be1c31120': "Vitor Oliveira · CC BY-SA 4.0",
    '85b78ee3-7b8e-4633-825f-d03d80c7dc68': "Carlos Luis Cruz (talk) · Public domain",
    '9cde4c55-2448-4d7a-a9fe-ec3b31b16618': "Jules Verne Times Two · CC BY-SA 4.0",
    '7193bc61-2a99-4e32-880b-58bfc4d7fd5a': "Manuel Menezes de Se… · CC BY 3.0",
    // Lote B2 de praias (08/10/2026)
    '4f522dae-6e43-4d05-b439-36c01909aa5e': "Vitor Oliveira · CC BY-SA 2.0",
    '2f8ed1a4-a6e6-4ced-bc7f-3986ce468221': "Vitor Oliveira · CC BY-SA 2.0",
    '1da81451-1187-4895-8c9e-ddb4d58a2f82': "Vitor Oliveira · CC BY-SA 2.0",
    '0746921c-411a-46b6-a8a2-9df52412abee': "Sergei Gussev · CC BY 2.0",
    '98bb3a39-2cff-4041-bef4-8ae9ef322ab1': "Vitor Oliveira · CC BY-SA 2.0",
    '36eaa5a8-095d-443b-adf4-09ab24da88aa': "Vitor Oliveira · CC BY-SA 4.0",
    '4bca34ad-ea87-48bf-9e93-2e60ba80e687': "Vitor Oliveira · CC BY-SA 2.0",
    '2dcab437-ca9b-44b2-9b4e-022bbad98cf0': "Vitor Oliveira · CC BY-SA 2.0",
    '6013ec3e-6d45-4060-a59f-55952d81b191': "Vitor Oliveira · CC BY-SA 2.0",
    'afd03a2d-9ded-4768-aeb9-d894e78943ad': "Lopatalopez · CC0",
    'fbbb80b4-a16c-48a7-9680-ea234a3f3289': "Vitor Oliveira · CC BY-SA 2.0",
    '48e61e35-c391-48a1-8566-6b2ef5a8a101': "Vitor Oliveira · CC BY-SA 2.0",
    '05ea6670-d128-4903-9778-a53d64c568db': "Vitor Oliveira · CC BY-SA 2.0",
    '1604913a-e163-4989-ad7a-87061e065e45': "Dietmar Rabich · CC BY-SA 4.0",
    '13490d00-010e-40ef-9060-26ab4c5a4bd2': "EduardoGui · CC BY 4.0",
    '47daa628-809d-490d-b248-2ae54538b90a': "Rikki Mitterer · CC BY-SA 4.0",
    '182596b9-05cb-4f89-8076-93668e7086fa': "Michael Gaylard · CC BY 2.0",
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
    '3d050ae0-0971-4022-8782-e446fc75ba46': 1, /* Ponte Frades (Vinhais) */
    'edc26ed2-7818-416d-9596-bc8790e7b594': 1, /* Praia Fluvial de Verim */
    '825e23f2-d6e7-4ccc-a6cb-ce796125c5cf': 1, /* Praia Fluvial do Rabaçal (Valpaços) */
    '2b152650-3282-4b28-8a31-c33e31c53443': 1, /* Praia Fluvial do Cavadinho */
    '75e73717-9129-467f-baca-7e4c2b259c81': 1, /* Praia Fluvial de Adaúfe */
    '03db63fd-994c-4d1f-a570-bc77f4d77ab9': 1, /* Praia Fluvial do Faial (Vila Verde) */
    'bb6b9637-91e2-43eb-bcb3-140b7bf5df04': 1, /* Praia Fluvial de Quintas */
    'd120bba7-6d3e-432e-a0b6-4487ec9403ba': 1, /* Praia Fluvial do Ermal */
    '5a4dc692-c6fb-4f41-b6b9-de7ff7875890': 1, /* Praia Fluvial de Vale de Juncal */
    '9e1d9133-5b46-442f-8d1b-949c5e7226c2': 1, /* Praia Fluvial da Albufeira da Queimadela */
    '482497f5-b8f2-4714-a48a-e7a670eef48d': 1, /* Praia Fluvial da Maravilha (Mirandela) */
    '3adc15a2-9e07-402f-be4f-d9efb27886ac': 1, /* Praia Fluvial da Congida */
    'e9f3217c-0e61-4793-9b8b-b75d88062bbf': 1, /* Praia Fluvial de Bitetos */
    '30276a4e-2034-4e5d-86f5-6be718ae4ba8': 1, /* Zona Balnear da Barragem de Vilar (Moimenta da Beira) */
    '0c7e0fa9-249e-47ec-897c-80889383a90a': 1, /* Praia Fluvial da Mâmoa */
    'e22b2d3e-2fee-481d-8aeb-2c890694bd32': 1, /* Praia Fluvial de Burgães */
    '29a0a0f4-b5b6-4353-ab16-cbbb152730be': 1, /* Praia Fluvial do Açude de Vais */
    'bc0148e8-31b0-4e22-a022-87ecf61466b0': 1, /* Praia Fluvial da Barragem do Caldeirão */
    '4883aa5e-2354-42bb-b7bc-942a2b95d45f': 1, /* Praia Fluvial de Badamalos */
    '00e7d4ff-80a6-4382-a26d-89efffbffc51': 1, /* Praia Fluvial de Vale das Éguas (Ínsua) */
    'a772005a-a44a-4db0-887a-24746a6dc983': 1, /* Praia Fluvial de Rapoula do Côa */
    'ca33aff4-d5e9-4b9b-8546-62b90b76a2fa': 1, /* Praia Fluvial de Valhelhas */
    '1e9d795c-410d-48bb-94c8-f664850ea924': 1, /* Praia Fluvial do Sabugueiro */
    '34234ca8-9855-44b2-9c1e-075af6ebc34a': 1, /* Praia Fluvial da Albufeira de Alfaiates */
    '82f5ee9b-2862-4ee5-ba37-07a003b0470d': 1, /* Praia Fluvial de Vila Cova à Coelheira */
    '13a521be-daa3-45fc-bdff-316f3b76f579': 1, /* Praia Fluvial das Sete Fontes (Cantanhede) */
    '1360ff98-df5b-4a51-8b3a-8f933e0393d1': 1, /* Praia Fluvial de Quadrazais */
    '6d2a95e8-cba3-457f-9d46-b47725f20714': 1, /* Praia Fluvial do Cornicovo */
    'bc91846d-fb69-42dd-ab0c-d70c743d6039': 1, /* Praia Fluvial do Poço do Lagar */
    'fb319a05-653b-4d75-9709-6a609b530de9': 1, /* Praia Fluvial do Vimieiro (Penacova) */
    'c05734ce-a8f7-43bf-9f85-d451aaa7fb0c': 1, /* Praia Fluvial de Benfeita */
    '0bca9fdd-734a-4d66-8112-d85516eb9771': 1, /* Zona Balnear do Meimão (Albufeira da Meimoa) */
    'd1978858-1dba-4c5c-ac87-19de955ead99': 1, /* Praia Fluvial de Unhais da Serra */
    'afb01794-bdda-43c8-ad69-52f19c1d0e05': 1, /* Zona Balnear da Peneda Talhada */
    'b752b91e-f0b3-4bdf-b6cc-d0276a85e9cd': 1, /* Praia Fluvial do Rebolim */
    '9c5f9c15-87ec-4f47-9058-262fa54faec5': 1, /* Praia Fluvial da Peneda/Pêgo Escuro */
    'b3615ef1-04cd-4467-a8f3-dfd16eb87c5d': 1, /* Zona Balnear da Ponte Velha (Cabreira, Góis) */
    '5bd1b50e-6966-49e8-b1e6-26505a8a0bd3': 1, /* Praia Fluvial da Ponte do Sótão */
    '6a3c0e42-0776-4dcb-bc7f-8df79fc14f5b': 1, /* Zona Balnear da Ponte (Colmeal, Góis) */
    '880612de-a3f3-4670-a339-f7e95966a5f1': 1, /* Praia Fluvial da Senhora da Piedade (Lousã) */
    '4e121916-bf77-440c-b019-30f9fc0955db': 1, /* Praia Fluvial de Castelo Novo */
    'b27f8d0e-b8c9-4134-a060-3020a8024001': 1, /* Praia Fluvial do Pessegueiro (Pampilhosa da Serra) */
    '19e1ec66-2e25-43df-8788-5fe7664f4188': 1, /* Praia Fluvial de Pampilhosa da Serra */
    'f404a1f3-4bfd-4ad5-bf69-0e453f5a91fd': 1, /* Praia Fluvial de Alvares */
    'e892b051-0d3b-4eea-847c-846590315d7f': 1, /* Praia Fluvial de Almaceda */
    'c426b02a-9fdf-4ac0-89c1-36dbc5ed9eb8': 1, /* Praia Fluvial de Mega Fundeira */
    'c557ded4-c26f-45ca-894b-4db7a6d278d4': 1, /* Praia Fluvial de Álvaro */
    '01e9c37f-4911-4639-89dd-63c5930b8583': 1, /* Praia Fluvial do Sesmo */
    '41fdbb12-bc0c-48be-bad5-55aacfcb60ea': 1, /* Praia Fluvial da Ribeira Grande (Sertã) */
    '85f79df4-36e2-46ec-b9b1-351571fce9fc': 1, /* Praia Fluvial da Fróia */
    '7989d71e-8aac-467a-a39d-08330760d97e': 1, /* Praia Fluvial da Aldeia Ruiva */
    '044023d0-0318-4003-93d0-757aec44f726': 1, /* Praia Fluvial do Bostelim */
    'e3c28b9a-554a-4388-93e1-869826df0888': 1, /* Praia Fluvial de Cardigos */
    '86bbc548-8e7f-46f9-8e27-dedf830f138f': 1, /* Praia Fluvial do Agroal (Ourém) */
    'bbaf7b71-1cd4-43df-ae4a-b1aca4a12cfe': 1, /* Praia Fluvial da Bairrada/Bairradinha */
    'a2e6faa1-1a05-4e1f-94e0-6fd48851380f': 1, /* Praia Fluvial do Carvoeiro (Mação) */
    'd2c7c90c-fc31-4c83-8b40-fb1ee6f0cc70': 1, /* Praia Fluvial de Montes (Tomar) */
    '86dcf59d-6f02-4ee2-bfaf-8a1e6efd4997': 1, /* Praia Fluvial de Fontes (Abrantes) */
    '5899bee3-c493-40fa-8de8-f18320dca8a3': 1, /* Praia Fluvial de Vila Nova da Serra (Tomar) */
    'a60a4260-0b3b-4215-b6b7-1b6a81dbb110': 1, /* Praia Fluvial de Constância */
    '22b74913-a8be-4ed6-b1d7-8a3a2120ca9d': 1, /* Praia Fluvial de Montalvo/Tesos */
    'e1885c3e-cc2f-4bc9-be00-9d54affc6c33': 1, /* Praia Fluvial do Sorraia */
    '069a235a-ffde-4be8-a119-15f1f4106a6b': 1, /* Praia Fluvial de Azenhas d'El Rei */
    '678f6bd3-d345-405f-9261-16197aae9a59': 1, /* Praia Fluvial de Oriola */
    'fd9d685a-7be8-4341-804f-e7a40ccc8123': 1, /* Praia Fluvial da Amieira (Portel) */
    '7280cc32-c682-4a50-ad03-baf4cf5628d6': 1, /* Praia Fluvial de Alqueva */
    '1329b76f-d2a6-4b8b-9f50-ec03f45bca41': 1, /* Praia do Lago (Moura) */
    'd7e0ca48-cd77-4bd4-a74f-4f68645a6a59': 1, /* Praia Fluvial da Tapada Grande */
    '00849a9b-a176-4978-bd9e-91cf2755a47a': 1, /* Praia Fluvial de Santa Clara */
    '22acd435-bbe7-4854-b04c-ad0983731de4': 1, /* Praia Fluvial de Odeleite */
    'cc5562a4-a203-4797-89bf-b8703ff615c4': 1, /* Praia do Rodanho */
    '2ee1dd1f-3e70-46cc-8e65-ef7e035a78f8': 1, /* Praia da Amorosa */
    'f1e950a5-61b6-41e3-b173-22153898c3b3': 1, /* Praia de Rio de Moinhos */
    '9cf66c0f-974c-475b-9668-88731057e69f': 1, /* Praia da Ramalha */
    'dfd873aa-3fc6-48d4-9cd1-1b64e235af9a': 1, /* Praia de Paimó */
    'f058fd9e-b587-41d2-bc5a-de0385aa8b73': 1, /* Praia do Quião */
    '12507b31-9a7c-41c4-a13a-306fe86756bb': 1, /* Praia das Pedras Brancas */
    '2bc9625b-be86-4e05-8863-9cc2bb287a79': 1, /* Praia de Francelos */
    '781cff5a-f003-4f55-a381-f9e94fd2bdc2': 1, /* Praia do Osso da Baleia */
    'e3da620e-beaf-4a4a-80e3-d3f94c3a311e': 1, /* Praia da Crismina */
    '52e176c2-b7e6-4a85-abcf-6cf871464967': 1, /* Praia da Samoqueira */
    '7b667795-a26d-459d-a543-553834f68914': 1, /* Praia da Arda */
    '0b50908b-fe98-4945-8374-1de9494e5c83': 1, /* Praia de Tróia-Galé */
    '68c4ba70-f6b6-4c44-8987-8cf3b409c431': 1 /* Praia das Camarinhas (Tróia) */,
    '44f4e2d5-5ac1-4a04-941c-a4b9c2363c67': 1 /* Praia da Saúde (Costa da Caparica) */,
    '9c523dc0-d6cd-4fe8-847c-cec4881d3e29': 1 /* Praia do Barranco (Vila do Bispo) */,
    '9e6005fe-7e8e-4f63-8fe7-6fe85ab3f618': 1 /* Praia de Vale de Janelas */,
    'cd25fc03-d97d-48db-9e96-0b4af33a14db': 1 /* Praia do Portinho (Jardim do Mar) */,
    '0ae4b5e2-6109-43ca-aea6-b7e53cae72d9': 1 /* Praia da Fajã dos Asnos */,
    '0971f35f-3de7-4f8d-8f49-580db0921903': 1 /* Praia da Ribeira das Galinhas */,
    '9812ac7e-f3a8-47a5-bb66-1d14350934a7': 1 /* Praia do Penedo (Porto Santo) */,
    'da4cf259-233e-4016-b544-cbe24efab59e': 1 /* Zona Balnear do Clube Naval de São Vicente */,
    'aa826358-ca32-4394-9310-6fb381d08f82': 1 /* Zona Balnear do Forno da Cal */,
    'f8069f5b-ac70-4f8d-bece-cbf2643fc16d': 1 /* Praia do Morro (Povoação) */,
    'be66f564-0337-4f10-887e-d0ec3a3fd2c4': 1 /* Piscinas Naturais das Calhetas da Maia */,
    'a9d2cd87-2ead-4e62-8642-e7914bde3d66': 1 /* Praia do Corpo Santo (Vila Franca do Campo) */,
    '10275d00-3fe5-4e6f-8fa3-ca0f0ee43a32': 1 /* Zona Balnear das Poças Sul dos Mosteiros */,
    '7e579f5a-5408-4d6e-8940-93950df7800f': 1 /* Praia de São Mateus (Graciosa) */,
    '62c1b8f0-123a-4779-8ec4-1ca547aac71f': 1 /* Praia da Riviera */,
    '52218cc4-91dc-47b5-a28d-c822f337f188': 1 /* Zona Balnear da Baía do Refugo */,
    '473e8adb-9673-4200-95a5-c606435674eb': 1 /* Zona Balnear das Quatro Ribeiras */,
    '71296f63-03a3-471f-ad52-bbf73dba8d50': 1 /* Piscinas Naturais do Carapacho */,
    'd8d29010-2ea1-472a-8519-6455937fd2bb': 1 /* Zona Balnear da Calheta dos Lagadores */,
    'a1fde33c-1ed3-498c-ae5e-de51fdee4bb1': 1 /* Zona Balnear do Porto da Baixa */,
    'fb576590-6e9e-4a5e-905e-b4706f1ec963': 1 /* Praia da Conceição (Horta) */,
    'd1f0dcb4-c877-43cd-825a-181058f6fb39': 1 /* Zona Balnear do Caminho de Baixo (Santa Bárbara, Pico) */,
    '0fda9ec4-702a-4749-884b-9a9a632c24e0': 1 /* Zona Balnear do Caisinho */,
    'b3130351-cdc2-4b93-84a3-e59f1a1a34c8': 1 /* Zona Balnear dos Arcos (Pico) */,
    '2e4bbd42-6b18-427d-9994-721118522f94': 1 /* Zona Balnear da Ponta do Admoiro */,
    'fc092cbf-0459-4c79-ab2c-ea08badf9985': 1 /* Zona Balnear do Cais do Mourato */,
    '720fa8be-3a2c-4037-a166-da0da5780909': 1 /* Zona Balnear das Pontes (Ribeiras, Pico) */
  };

  function card(b, lang) {
    lang = lang === 'en' ? 'en' : 'pt'; var L = I[lang];
    var name = b.name || '', id = b.id ? String(b.id) : '';
    var orig = b.image_curated_url || b.image_storage_url_webp || b.image_storage_url || b.image_url || '';
    var detail = id ? L.beach(id) : '#';
    var planner = L.planner + '?beach=' + encodeURIComponent(name) + '&i=praia&ref=beaches';
    // Lote A 08/10: link Stay22 Allez ja com ID (o LetMeAllez so trocava o booking.com ~6-8 s depois -> cliques cedo sem comissao)
    var booking = 'https://www.stay22.com/allez/booking?aid=kaptarstudio&campaign=portalturismoportugal-' + (lang === 'en' ? 'en-' : '') + 'beaches&address=' + encodeURIComponent(name + ', Portugal');
    var slug = name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    var desc = (b.i18n && b.i18n.description && b.i18n.description[lang]) || b.description || '';
    var feats = tags(b, lang).slice(0, 3).map(function (t) { return '<li>' + (ICON[t] || '') + esc(L.feats[t] || t) + '</li>'; }).join('');
    var cr = NO_PHOTO[id] ? '' : credit(b, L);
    var img = (id && !NO_PHOTO[id])
      ? '<img src="/images/beaches/' + esc(id) + '-480.webp" srcset="/images/beaches/' + esc(id) + '-480.webp 480w, /images/beaches/' + esc(id) + '-800.webp 800w" sizes="(max-width: 640px) 92vw, 380px" width="480" height="320" alt="' + esc(name) + '" loading="lazy" decoding="async" data-orig="' + esc(orig) + '" onerror="BC2.imgErr(this)">'
      : '';
    var h = '';
    h += '<article class="beach-card bc2" role="listitem" data-beach-id="' + esc(id) + '"' + (b.beach_type === 'fluvial' ? ' data-river="1"' : '') + ' data-region="' + esc(b.region || '') + '" data-quality="' + esc(b.water_quality || '') + '" data-name="' + esc(name) + '" data-slug="' + esc(slug) + '" data-tags="' + esc((Array.isArray(b.tags) ? b.tags : []).join(',')) + '" data-editorial-rank="' + esc(b.editorial_rank || '') + '" data-lat="' + esc(b.latitude || '') + '" data-lng="' + esc(b.longitude || '') + '" tabindex="0" onclick="window.location.href=\'' + detail + '\'" onkeydown="if(event.target===this&&(event.key===\'Enter\'||event.key===\' \')){event.preventDefault();window.location.href=\'' + detail + '\'}">';
    h += '<figure class="bc2__media">' + img +
         '<div class="bc2__fallback"' + (img ? ' style="display:none"' : '') + '>' + ICON.wave + '<span>' + esc(name) + '</span></div>' +
         (b.region ? '<span class="bc2__chip bc2__chip--region">' + esc(b.region) + '</span>' : '') +
         (b.water_quality === 'Excelente' ? '<span class="bc2__chip bc2__chip--quality">' + ICON.check + esc(L.excellent) + '</span>' : '') +
         (b.beach_type === 'fluvial' ? '' : '<p class="bc2__live" aria-live="polite"><span class="bc2__dot" aria-hidden="true"></span><span class="bc2__live-t"></span></p>') +
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
        if (e.target.getAttribute('data-river') === '1') return; // praia fluvial: sem dados de mar
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
