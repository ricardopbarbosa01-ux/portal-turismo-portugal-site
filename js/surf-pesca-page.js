/** js/surf-pesca-page.js — Shared renderer for surf.html + pesca.html (+ EN variants).
 * Requires: window.BeachRenderer (beach-renderer.js), window.SurfPescaData (surf-pesca-data.js).
 * Exposes: window.SurfPescaPage
 * TrustedHTML: uses trustedTypes.createPolicy('pth-html') — regression watchlist commit 6163e21
 * 2026-10-07: cartoes de surf e pesca v2 (.sc2, css/surf-card-v2.css) com fotos verificadas.
 */
(function (window, document) {
  'use strict';

  // ── Dependency guard ──────────────────────────────────────────────────────────
  if (!window.BeachRenderer || !window.SurfPescaData) {
    console.error('[surf-pesca-page] missing dependency: BeachRenderer or SurfPescaData');
    return;
  }

  // ── TrustedHTML helper — same policy name as nav.js / en/surf.html (commit 6163e21) ──
  var _policy = null;
  try {
    if (window.trustedTypes && window.trustedTypes.createPolicy) {
      _policy = window.trustedTypes.createPolicy('pth-html', { createHTML: function (s) { return s; } });
    }
  } catch (_) {}

  function _setHTML(el, html) {
    if (!el) return;
    el.innerHTML = _policy ? _policy.createHTML(html) : html;
  }

  // ── Utility helpers ───────────────────────────────────────────────────────────
  function esc(s) {
    if (s == null) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function dots(q) {
    return Array.from({ length: 5 }, function (_, i) {
      return '<span class="spot-quality-dot' + (i < q ? ' filled' : '') + '"></span>';
    }).join('');
  }

  // ── Lang resolver ─────────────────────────────────────────────────────────────
  function pickLang(field, lang) {
    if (field == null) return '';
    if (typeof field === 'string') return field;
    if (typeof field === 'object' && (field.pt !== undefined || field.en !== undefined)) {
      return field[lang] || field.pt || field.en || '';
    }
    return String(field);
  }

  // ── Level label resolvers ─────────────────────────────────────────────────────
  function surfLevelLabel(spot, T) {
    if (spot.levelLabelKey && T.surfPage.levelLabelComposite && T.surfPage.levelLabelComposite[spot.levelLabelKey]) {
      return T.surfPage.levelLabelComposite[spot.levelLabelKey];
    }
    return (T.surfPage.levelLabel && T.surfPage.levelLabel[spot.levelKey]) || spot.levelKey || '';
  }

  function fishingLevelLabel(spot, T) {
    return (T.fishing.levelLabel && T.fishing.levelLabel[spot.levelKey]) || spot.levelKey || '';
  }

  function fishingTipoLabel(spot, T) {
    return (T.fishing.tipoLabel && T.fishing.tipoLabel[spot.tipoKey]) || spot.tipoKey || '';
  }

  // ── Surf card v2 (2026-10-07) ─────────────────────────────────────────────────
  // Fotos verificadas (Wikimedia Commons): /images/spots/surf-<id>-{480,800}.webp. Lista com links: docs/FOTOS-CREDITOS.md
  var SURF_PHOTO = {
    'supertubos': "Vitor Oliveira · CC BY-SA 2.0",
    'praia-da-nazare': "Luis Ascenso · CC BY 2.0",
    'praia-do-amado': "Vitor Oliveira · CC BY-SA 2.0",
    'costa-da-caparica': "Alvesgaspar · CC BY-SA 3.0",
    'praia-do-guincho': "Alvesgaspar · CC BY-SA 3.0",
    'praia-de-matosinhos': "Vitor Oliveira · CC BY-SA 2.0",
    'praia-da-arrifana-algarve': "Pedro Ponce Asensio · CC BY-SA 4.0",
    'praia-de-santa-barbara-acores-1': "Kritzolina · CC BY-SA 4.0",
    'praia-de-moledo': "Joseolgon · CC BY-SA 4.0",
    'praia-de-afife': "Joseolgon · CC BY 4.0",
    'praia-de-cabedelo': "Ycomet · CC BY-SA 3.0",
    'praia-de-ancora': "Vitor Oliveira · CC BY-SA 2.0",
    'praia-de-esposende-surf': "Vitor Oliveira · CC BY-SA 2.0",
    'praia-de-ofir': "Francisco Restivo · CC BY 2.0",
    'praia-do-furadouro': "Pacopac · CC BY-SA 4.0",
    'praia-de-mira': "Vitor Oliveira · CC BY-SA 2.0",
    'praia-da-tocha': "Vitor Oliveira · CC BY-SA 2.0",
    'praia-de-buarcos': "Vitor Oliveira · CC BY-SA 2.0",
    'praia-do-castelejo': "manjerix · CC BY-SA 2.0",
    'praia-da-zavial': "Marty B · CC BY-SA 2.0",
    'praia-da-salema': "Joseolgon · CC BY-SA 4.0",
    'praia-de-odeceixe': "Beeston · CC BY 3.0",
    'ribeira-grande-reef': "Ajay Suresh · CC BY 2.0",
    // Lote 1a (2026-10-08)
    'ribeira-dilhas': "Vitor Oliveira · CC BY-SA 4.0",
    'coxos': "Vitor Oliveira · CC BY-SA 2.0",
    'foz-do-lizandro': "Vitor Oliveira · CC BY-SA 2.0",
    'sao-lourenco': "Vitor Oliveira · CC BY-SA 2.0",
    'baleal': "Vitor Oliveira · CC BY-SA 2.0",
    'lagide': "Vitor Oliveira · CC BY-SA 2.0",
    'consolacao': "Vitor Oliveira · CC BY-SA 2.0",
    'molhe-leste': "Vitor Oliveira · CC BY-SA 2.0",
    // Lote 1b (2026-10-08)
    'carcavelos': "Bosc d'Anjou · CC BY 2.0",
    'sao-pedro-do-estoril': "Vitor Oliveira · CC BY-SA 2.0",
    'bafureira': "Vitor Oliveira · CC BY-SA 2.0",
    'praia-grande-sintra': "Alexkom000 · CC BY 4.0",
    'praia-das-macas': "Vitor Oliveira · CC BY-SA 2.0",
    'fonte-da-telha': "Vitor Oliveira · CC BY-SA 2.0",
    "tonel": "Vitor Oliveira · CC BY-SA 2.0",
    "bordeira": "Dronepicr · CC BY 3.0",
    "praia-da-rocha": "Tiago J. G. Fernandes · CC BY 2.0",
    "porto-covo": "Vitor Oliveira · CC BY-SA 4.0",
    "almograve": "Vitor Oliveira · CC BY-SA 2.0",
    "povoa-de-varzim": "Vitor Oliveira · CC BY-SA 2.0",
    "cabedelo-figueira-da-foz": "Vitor Oliveira · CC BY-SA 2.0",
    "pedrogao": "Vitor Oliveira · CC BY-SA 2.0",
    "areia-branca": "GualdimG · CC BY-SA 4.0",
    "praia-do-sul-ericeira": "Vitor Oliveira · CC BY-SA 2.0",
    "jardim-do-mar": "Stephen Colebourne · CC BY 2.0",
    "lugar-de-baixo": "Tim Walker Camera location32° 40′ 46.08″ N, 17° 05′ 14.77″ W · CC BY 2.0",
    "rabo-de-peixe": "JCNazza · CC BY 3.0",
    "faja-de-santo-cristo": "Guillaume Baviere · CC BY 2.0",
    "beliche": "Vitor Oliveira · CC BY-SA 2.0",
    "monte-clerigo": "Vitor Oliveira · CC BY-SA 2.0",
    "malhao": "Jules Verne Times Two · CC BY-SA 4.0",
    "zambujeira-do-mar": "Vanbasten 23 · CC BY-SA 3.0",
    "espinho": "Sergei Gussev · CC BY 2.0",
    "azurara": "Vitor Oliveira · CC BY-SA 2.0",
    "sao-pedro-de-moel": "Vitor Oliveira · CC BY-SA 2.0",
    "murtinheira": "Vitor Oliveira · CC BY-SA 2.0",
    "sao-juliao": "Alexkom000 · CC BY 4.0",
    "reef-ericeira": "Vitor Oliveira · CC BY-SA 2.0",
    "ponta-pequena": "VinceTraveller · CC BY 2.0",
    "porto-da-cruz": "EduardoGui · CC BY 4.0",
    "monte-verde": "jad99 · CC BY-SA 2.0",
    "quatro-ribeiras": "Vitor Oliveira · CC BY-SA 2.0",
    "mareta": "Vitor Oliveira · CC BY-SA 2.0",
    "amoreira": "Vitor Oliveira · CC BY-SA 2.0",
    "sao-torpes": "Vitor Oliveira · CC BY-SA 2.0",
    "vila-nova-de-milfontes-farol": "Vitor Oliveira · CC BY-SA 2.0",
    "carvalhal": "Vitor Oliveira · CC BY-SA 2.0",
    "leca-da-palmeira": "Vitor Oliveira · CC BY-SA 2.0",
    "praia-da-barra": "Vitor Oliveira · CC BY-SA 2.0",
    "praia-da-vieira": "Vitor Oliveira · CC BY-SA 2.0",
    "santa-cruz": "Vitor Oliveira · CC BY-SA 2.0",
    "matadouro": "Vitor Oliveira · CC BY-SA 2.0",
    "cave-ericeira": "Vitor Oliveira · CC BY-SA 2.0",
    "paul-do-mar": "Vitor Oliveira · CC BY-SA 2.0",
    "faja-da-areia": "Alberto-g-rovi · CC BY 3.0",
    "mosteiros": "JCNazza · CC BY 3.0",
    "praia-da-vitoria": "Vitor Oliveira · CC BY-SA 2.0",
    "adraga": "Alexkom000 · CC BY 4.0",
    "santo-amaro-oeiras": "Vitor Oliveira · CC BY-SA 2.0",
    "praia-do-meco": "Vitor Oliveira · CC BY-SA 2.0",
    "praia-da-foz-cabo-espichel": "Vitor Oliveira · CC BY-SA 2.0",
    "paredes-da-vitoria": "Vitor Oliveira · CC BY-SA 2.0",
    "santa-rita": "Vitor Oliveira · CC BY-SA 2.0",
    "apulia": "Joseolgon · CC BY-SA 4.0",
    "torreira": "Vanbasten 23 · CC BY-SA 3.0",
    "cova-gala": "Vitor Oliveira · CC BY-SA 2.0",
    "alvor": "Tiago J. G. Fernandes · CC BY 2.0",
    "porto-moniz": "Hansueli Krapf · CC BY-SA 3.0",
    "crazy-left-ericeira": "Vitor Oliveira · CC BY-SA 2.0",
    "azarujinha": "Vitor Oliveira · CC BY-SA 2.0",
    "lagoa-de-albufeira": "Vitor Oliveira · CC BY-SA 2.0",
    "canal-das-barcas": "Vitor Oliveira · CC BY-SA 2.0",
    "foz-do-arelho": "Vitor Oliveira · CC BY-SA 2.0",
    "porto-batel": "Vitor Oliveira · CC BY-SA 2.0",
    "angeiras": "Vitor Oliveira · CC BY-SA 2.0",
    "miramar-gaia": "Sergei Gussev · CC BY 2.0",
    "sao-jacinto": "Vitor Oliveira · CC BY-SA 2.0",
    "ingrina": "Vitor Oliveira · CC BY-SA 2.0",
    "praia-de-faro": "Vitor Oliveira · CC BY-SA 2.0",
    "praia-do-norte-faial": "Vitor Oliveira · CC BY-SA 2.0",
    "magoito": "Alexkom000 · CC BY 4.0",
    "parede": "Vitor Oliveira · CC BY-SA 2.0",
    "sao-joao-da-caparica": "Jules Verne Times Two · CC BY-SA 4.0",
    "comporta": "Vitor Oliveira · CC BY-SA 2.0",
    "nazare-praia-da-vila": "Berthold Werner · CC BY-SA 4.0",
    "praia-azul": "Vitor Oliveira · CC BY-SA 2.0",
    "almagreira": "Alexkom000 · CC BY 4.0",
    "cortegaca": "Vitor Oliveira · CC BY-SA 2.0",
    "vagueira": "Vitor Oliveira · CC BY-SA 2.0",
    "praia-da-luz": "Sergei Gussev · CC BY 2.0",
    "ponta-delgada-madeira": "Alberto-g-rovi · CC BY 3.0",
    "populo-milicias": "JCNazza · CC BY 3.0",
    "praia-formosa-santa-maria": "Carlos Luis Cruz · Public domain"
  };
  // Pagina estatica da praia (praias/<slug>/ e en/praias/<slug>/), quando existe
  var SURF_BEACH = {
    'supertubos': 'supertubos-peniche', 'praia-da-nazare': 'praia-do-norte-nazare', 'praia-do-amado': 'praia-do-amado',
    'costa-da-caparica': 'costa-de-caparica', 'praia-do-guincho': 'praia-do-guincho', 'praia-de-matosinhos': 'praia-de-matosinhos',
    'praia-da-arrifana-algarve': 'praia-da-arrifana', 'praia-de-moledo': 'praia-de-moledo', 'praia-de-esposende-surf': 'praia-de-esposende',
    'praia-de-mira': 'praia-de-mira', 'praia-do-castelejo': 'praia-do-castelejo', 'praia-de-odeceixe': 'praia-de-odeceixe',
    "praia-da-rocha": "praia-da-rocha",
    "monte-clerigo": "praia-de-monte-clerigo",
    "amoreira": "praia-da-amoreira-aljezur",
    "porto-covo": "praia-de-porto-covo",
    "espinho": "praia-de-espinho",
    "praia-da-barra": "praia-da-barra",
    "sao-pedro-de-moel": "praia-de-sao-pedro-de-moel",
    "praia-da-vieira": "praia-de-vieira-de-leiria",
    "bordeira": "praia-de-carrapateira",
    "mosteiros": "praia-de-mosteiros",
    "praia-do-meco": "praia-do-meco",
    "lagoa-de-albufeira": "lagoa-de-albufeira",
    "comporta": "praia-da-comporta",
    "praia-da-luz": "praia-da-luz",
    "alvor": "praia-de-alvor",
    "praia-de-faro": "praia-de-faro"
  };
  // Sem pagina estatica: pagina da praia da BD (/beach?id=) a menos de 1 km e com nome em comum (2026-10-08)
  var SURF_BEACH_ID = {"praia-de-santa-barbara-acores-1": "0da1d9ed-858e-4011-9506-4a9bfe6653eb", "praia-de-afife": "0746921c-411a-46b6-a8a2-9df52412abee", "praia-de-cabedelo": "10f7f046-fb30-493e-acf0-bf6b2a57858b", "praia-de-ancora": "43290bbc-db7f-4b1e-9cb5-a51b644c0ca6", "praia-de-ofir": "dd37d1cd-8ecc-45af-b8d2-3ceabf881969", "praia-do-furadouro": "c63cbf17-1445-4697-aa21-a5b9dff08851", "praia-da-tocha": "f400d000-20b2-414c-ba38-bae63856431f", "praia-de-buarcos": "63806db3-12a1-4e83-b354-1ac4b44fcb2d", "praia-da-zavial": "37fd270d-1dd5-4701-af07-f0ede1590069", "praia-da-salema": "88102fe2-62d3-4721-a27a-bab4d2ffe15c", "ribeira-dilhas": "a9b0eada-8f04-4862-85aa-2892039baecd", "foz-do-lizandro": "64b383cd-da9c-496c-bc43-77908e175f8d", "sao-lourenco": "025349fa-956a-448e-ad3a-ff58cfacb514", "baleal": "97427a14-7439-4672-8589-9139d7cb5abe", "carcavelos": "406a09d1-daa7-44b3-aa19-3a13b4aab711", "sao-pedro-do-estoril": "7b053b2b-f6f9-4d2b-b897-e4f4b52f463a", "praia-grande-sintra": "513d687d-b8f9-4d87-b5a7-c6de1d7d695c", "praia-das-macas": "d81736c8-0e7d-4d98-b369-377998fc5c2f", "fonte-da-telha": "508706d1-2ddd-4377-8319-75a5bb347435", "beliche": "fa66de51-13bc-4088-8b94-942d33e525fc", "martinhal": "5c45c033-1182-4e59-b0de-61ec81ab38f2", "sao-torpes": "dee27f4d-ec13-43b4-a618-4ac272d22cf2", "malhao": "a8e9c668-f606-4100-87ea-b00ea61617e5", "vila-nova-de-milfontes-farol": "2dd735c3-9317-45bb-aed7-c3832af7653d", "almograve": "6b2661a4-4126-4ac4-8a03-ec2193cd4494", "zambujeira-do-mar": "4bd3bca5-6c5b-486d-87c0-bd21ea5435ce", "carvalhal": "f940e21f-3169-486c-9438-30dd3e503eb3", "leca-da-palmeira": "62030703-6711-4653-bc35-b1284f35cd5e", "povoa-de-varzim": "7cf2d44f-99d9-4338-a8c7-5894e891137f", "pedrogao": "c4bea301-56f1-49b5-934d-f576e41f5132", "murtinheira": "b5d5f332-d553-49d9-ad92-77d658de945f", "santa-cruz": "24ef6f3c-123f-4cda-9ed7-53b372fe4790", "areia-branca": "fd1474e1-7acb-4635-822d-df649332769e", "sao-juliao": "304b2207-d81b-4fef-bdc3-74392d207133", "praia-do-sul-ericeira": "67e04297-3a9a-4e41-808f-cae811d0680b", "jardim-do-mar": "cd25fc03-d97d-48db-9e96-0b4af33a14db", "porto-da-cruz": "bf016917-24ac-4a91-a372-568b5162e4e5", "quatro-ribeiras": "473e8adb-9673-4200-95a5-c606435674eb", "praia-do-norte-ericeira": "67e04297-3a9a-4e41-808f-cae811d0680b", "magoito": "5ed26c4c-0979-4497-a021-253ef66f6aeb", "adraga": "6541d792-54dd-4b32-b89c-02ef4c7c9f90", "cresmina": "e3da620e-beaf-4a4a-80e3-d3f94c3a311e", "parede": "6116b10b-1e12-4d54-b9ce-86bb6792fa6b", "santo-amaro-oeiras": "1da81451-1187-4895-8c9e-ddb4d58a2f82", "sao-joao-da-caparica": "b543a3dd-bfe8-40d7-8d5e-2ac453daf76e", "nazare-praia-da-vila": "4c907c07-8bbd-4c37-90f2-8f9e2696f5a0", "paredes-da-vitoria": "c4e37952-73a1-42b7-b36f-b4fd60291102", "foz-do-arelho": "fefd19c5-2dad-4627-a476-daa13be99352", "praia-azul": "6013ec3e-6d45-4060-a59f-55952d81b191", "santa-rita": "bdd9928f-c4b0-4e06-95b9-9ccead088030", "apulia": "51c5eb21-e534-4c5c-98e0-305c78721686", "angeiras": "e7a9f6a0-35ee-4332-be39-a8d37c78fe3f", "miramar-gaia": "541f339e-9287-452d-80be-56e0ce86c70a", "cortegaca": "47ae4764-a60d-4ec5-a7c5-00a21e871fdb", "torreira": "e5113c93-c469-489a-8db6-7d877c0de22c", "sao-jacinto": "88233a0a-3a55-4a95-9ff2-144f5459647c", "vagueira": "6b3928b3-4680-4051-b2f1-e3bdb41cab35", "cova-gala": "dc0629c2-fb75-4706-bafd-08d8cf4466be", "ponta-delgada-madeira": "4e7964bf-1efa-4e28-b232-70818b6bb7c7", "populo-milicias": "c3f48c57-0e24-4746-b128-8abd6110bfd3", "praia-do-norte-faial": "586da732-8832-4c78-b746-b4854f3c1c9f", "praia-formosa-santa-maria": "85b78ee3-7b8e-4633-825f-d03d80c7dc68"};
  // Regiao do planeador (js/planner-v3.js) e regiao da BD de praias (/beaches?region=)
  var SURF_PLAN_R = { Norte: 'minho', Porto: 'minho', Centro: 'costa-prata', Lisboa: 'cascais', Alentejo: 'alentejo', Algarve: 'algarve', 'Açores': 'acores', Madeira: 'madeira' };
  var SURF_PLAN_R_ID = { 'supertubos': 'oeste', 'costa-da-caparica': 'setubal',
    'ribeira-dilhas': 'oeste', 'coxos': 'oeste', 'foz-do-lizandro': 'oeste', 'sao-lourenco': 'oeste', 'pedra-branca': 'oeste',
    'baleal': 'oeste', 'lagide': 'oeste', 'consolacao': 'oeste', 'molhe-leste': 'oeste', 'fonte-da-telha': 'setubal',
    "santa-cruz": 'oeste', "areia-branca": 'oeste', "sao-juliao": 'oeste', "matadouro": 'oeste', "praia-do-sul-ericeira": 'oeste', "reef-ericeira": 'oeste', "cave-ericeira": 'oeste',
    "praia-do-norte-ericeira": "oeste", "crazy-left-ericeira": "oeste", "nazare-praia-da-vila": "oeste", "paredes-da-vitoria": "oeste", "foz-do-arelho": "oeste", "praia-azul": "oeste", "santa-rita": "oeste", "porto-batel": "oeste", "almagreira": "oeste", "sao-joao-da-caparica": "setubal", "praia-do-meco": "setubal", "lagoa-de-albufeira": "setubal", "praia-da-foz-cabo-espichel": "setubal" };
  // Webcam ao vivo do spot (ou a mais perto) em /webcams (abre o painel por #cam-<id>; MEO so por link, YouTube incorporado).
  // Escolhidas a mao por nome (2026-10-08): as coordenadas de algumas camaras MEO estao agrupadas, por isso nao se usa so a distancia.
  var SURF_CAM = {
    'supertubos': ['peniche-supertubos', 'Supertubos'], 'praia-da-nazare': ['praia-do-norte-canhao-nazare', 'Praia do Norte'],
    'praia-do-amado': ['praia-do-amado', 'Praia do Amado'], 'costa-da-caparica': ['costa-da-caparica', 'CDS Norte'],
    'praia-do-guincho': ['praia-do-guincho', 'Guincho'], 'praia-de-matosinhos': ['praia-de-matosinhos', 'Matosinhos'],
    'praia-de-afife': ['viana-do-castelo-afife-arda', 'Arda · Afife'], 'praia-de-cabedelo': ['viana-do-castelo-cabedelo', 'Cabedelo'],
    'praia-de-ancora': ['vila-praia-de-ancora', 'Vila Praia de Âncora'], 'praia-de-esposende-surf': ['esposende', 'Esposende'],
    'praia-de-ofir': ['ofir', 'Ofir'], 'praia-do-furadouro': ['furadouro', 'Furadouro'], 'praia-de-mira': ['praia-de-mira', 'Praia de Mira'],
    'praia-da-tocha': ['praia-da-tocha', 'Praia da Tocha'], 'praia-de-buarcos': ['figueira-da-foz-tamargueira', 'Buarcos'],
    'praia-da-arrifana-algarve': ['arrifana', 'Arrifana'], 'praia-do-castelejo': ['cordoama', 'Cordoama'], 'praia-de-odeceixe': ['odeceixe', 'Odeceixe'],
    'ribeira-dilhas': ['ribeira-dilhas', "Ribeira d'Ilhas"], 'coxos': ['ribeira-dilhas', "Ribeira d'Ilhas"],
    'foz-do-lizandro': ['foz-do-lizandro', 'Foz do Lizandro'], 'sao-lourenco': ['ericeira-praia-da-calada', 'Praia da Calada'],
    'pedra-branca': ['ericeira', 'Reef · Pedra Branca'], 'baleal': ['peniche-baleal-panoramica', 'Baleal'], 'lagide': ['lagide', 'Lagide'],
    'consolacao': ['praia-da-consolacao', 'Consolação'], 'molhe-leste': ['peniche-molhe-leste', 'Molhe Leste'],
    'carcavelos': ['praia-de-carcavelos', 'Carcavelos'], 'sao-pedro-do-estoril': ['sao-pedro-do-estoril', 'São Pedro do Estoril'],
    'bafureira': ['bafureira', 'Bafureira'], 'praia-grande-sintra': ['praia-grande', 'Praia Grande · Norte'],
    'praia-das-macas': ['praia-das-macas', 'Praia das Maçãs'], 'fonte-da-telha': ['fonte-da-telha', 'Fonte da Telha · Norte'],
    "tonel": ["sagres", "Sagres"],
    "mareta": ["sagres", "Sagres"],
    "monte-clerigo": ["monte-clerigo", "Monte Clérigo"],
    "amoreira": ["praia-da-amoreira", "Praia da Amoreira"],
    "praia-da-rocha": ["praia-da-rocha", "Praia da Rocha"],
    "sao-torpes": ["praia-de-sao-torpes", "São Torpes"],
    "vila-nova-de-milfontes-farol": ["vila-nova-de-milfontes-farol", "Milfontes · Farol"],
    "almograve": ["almograve", "Almograve"],
    "zambujeira-do-mar": ["zambujeira-do-mar", "Zambujeira do Mar"],
    "carvalhal": ["praia-do-carvalhal", "Praia do Carvalhal"],
    "espinho": ["espinhopicodocasino", "Espinho · Pico do Casino"],
    "leca-da-palmeira": ["leca-da-palmeira", "Leça da Palmeira"],
    "praia-da-barra": ["praia-da-barra", "Praia da Barra"],
    "cabedelo-figueira-da-foz": ["figueira-da-foz-cabedelo", "Cabedelo"],
    "sao-pedro-de-moel": ["sao-pedro-de-moel", "São Pedro de Moel"],
    "praia-da-vieira": ["praia-da-vieira", "Praia da Vieira"],
    "pedrogao": ["praia-do-pedrogao", "Praia do Pedrógão"],
    "murtinheira": ["murtinheira", "Murtinheira"],
    "santa-cruz": ["santa-cruz-norte-fisica", "Santa Cruz · Norte"],
    "areia-branca": ["areia-branca", "Areia Branca"],
    "sao-juliao": ["sao-juliao", "São Julião"],
    "matadouro": ["matadouro", "Matadouro"],
    "praia-do-sul-ericeira": ["ericeira-praia-do-sul", "Praia do Sul"],
    "reef-ericeira": ["ericeira", "Reef · Pedra Branca"],
    "cave-ericeira": ["ribeira-dilhas", "Ribeira d'Ilhas"],
    "jardim-do-mar": ["madeira-jardim-do-mar", "Jardim do Mar"],
    "ponta-pequena": ["ponta-pequena", "Ponta Pequena"],
    "paul-do-mar": ["madeira-paul-do-mar", "Paul do Mar"],
    "lugar-de-baixo": ["yt-ponta-do-sol", "Ponta do Sol"],
    "porto-da-cruz": ["madeira-maiata", "Praia da Maiata"],
    "faja-da-areia": ["faja-da-areia", "Fajã da Areia"],
    "monte-verde": ["acores-ribeira-grande-praia-do-monte-verde", "Praia do Monte Verde"],
    "praia-do-norte-ericeira": ["praia-dos-pescadores", "Praia dos Pescadores"],
    "magoito": ["praia-do-magoito", "Praia do Magoito"],
    "adraga": ["praia-da-adraga", "Praia da Adraga"],
    "cresmina": ["cresmina", "Praia da Cresmina"],
    "parede": ["praia-das-avencas", "Praia das Avencas"],
    "santo-amaro-oeiras": ["santo-amaro", "Santo Amaro"],
    "azarujinha": ["tamariz", "Praia do Tamariz"],
    "sao-joao-da-caparica": ["costa-de-caparica-sao-joao-cova-do-vapor", "São João · Cova do Vapor"],
    "praia-do-meco": ["praia-do-meco", "Praia do Meco"],
    "lagoa-de-albufeira": ["lagoa-de-albufeira", "Lagoa de Albufeira"],
    "comporta": ["comporta", "Comporta"],
    "nazare-praia-da-vila": ["praia-da-nazare", "Nazaré · Praia da Vila"],
    "paredes-da-vitoria": ["paredes-da-vitoria", "Paredes da Vitória"],
    "foz-do-arelho": ["foz-do-arelho", "Foz do Arelho"],
    "praia-azul": ["santa-cruz-praia-azul", "Praia Azul"],
    "santa-rita": ["praia-de-santa-rita", "Praia de Santa Rita"],
    "apulia": ["apulia", "Apúlia"],
    "canidelo": ["praia-canide-norte-sul", "Praia de Canide"],
    "torreira": ["praia-da-torreira", "Praia da Torreira"],
    "vagueira": ["vagueiracasablanca", "Vagueira · Casablanca"],
    "cova-gala": ["figueira-da-foz-cabedelo", "Cabedelo"],
    "praia-da-luz": ["praia-da-luz", "Praia da Luz"],
    "alvor": ["alvor", "Alvor"],
    "praia-de-faro": ["faro-oeste", "Praia de Faro"],
    "porto-moniz": ["yt-porto-moniz", "Porto Moniz"]
  };
  var SURF_DB_REGION = { Norte: 'Norte', Porto: 'Norte', Centro: 'Centro', Lisboa: 'Lisboa e Setúbal', Alentejo: 'Alentejo', Algarve: 'Algarve', Madeira: 'Madeira', 'Açores': 'Açores' };
  var SURF_LEVELS = ['iniciante', 'intermedio', 'avancado', 'profissional'];
  var SURF_REGION_EN = { Norte: 'North', Centro: 'Centre', Lisboa: 'Lisbon', 'Açores': 'Azores' };
  var SC2 = {
    pt: { photo: 'Foto', level: 'Nível', season: 'Melhor época', swell: 'Swell ideal', wind: 'Vento ideal', beach: 'Ver praia',
          zone: 'Praias da zona', plan: 'Planear', worldClass: 'Classe mundial', cam: 'Webcam ao vivo',
          short: { iniciante: 'Iniciante', intermedio: 'Intermédio', avancado: 'Avançado', profissional: 'Pro' },
          ariaLevel: function (t) { return 'Nível recomendado: ' + t; }, ariaBeach: function (n) { return 'Ver a página da praia ' + n; },
          ariaZone: function (r) { return 'Ver praias da região ' + r; }, ariaPlan: function (n) { return 'Planear uma viagem de surf a ' + n; } },
    en: { photo: 'Photo', level: 'Level', season: 'Best season', swell: 'Best swell', wind: 'Best wind', beach: 'View beach',
          zone: 'Beaches nearby', plan: 'Plan trip', worldClass: 'World-class', cam: 'Live webcam',
          short: { iniciante: 'Beginner', intermedio: 'Intermediate', avancado: 'Advanced', profissional: 'Pro' },
          ariaLevel: function (t) { return 'Recommended level: ' + t; }, ariaBeach: function (n) { return 'View the beach page for ' + n; },
          ariaZone: function (r) { return 'See beaches in ' + r; }, ariaPlan: function (n) { return 'Plan a surf trip to ' + n; } }
  };
  var SC2_ICON = {
    pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>',
    wave: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 14c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/><path d="M2 19c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/></svg>',
    arrow: '<svg class="sc2__arr" viewBox="0 0 24 24" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
    cal: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>'
  };

  function surfPhotoHtml(s, lang, L) {
    var c = SURF_PHOTO[s.id];
    if (!c) return '<div class="sc2__fallback ' + esc(s.bgClass) + '">' + SC2_ICON.wave + '</div>';
    var base = '/images/spots/surf-' + encodeURIComponent(s.id);
    return '<img src="' + base + '-480.webp" srcset="' + base + '-480.webp 480w, ' + base + '-800.webp 800w" sizes="(max-width: 640px) 94vw, (max-width: 1100px) 46vw, 380px" width="480" height="320" alt="' + esc(s.name || s.id) + '" loading="lazy" decoding="async" onerror="this.remove()">' +
      '<figcaption class="sc2__credit">' + esc(L.photo + ': ' + c) + '</figcaption>';
  }

  function surfCardHtml(s, T, lang) {
    var L = SC2[lang] || SC2.pt;
    var name = s.name || s.id;
    var levelLabel = surfLevelLabel(s, T);
    var levels = s.levels || [s.levelKey];
    var meter = SURF_LEVELS.map(function (k) {
      var on = levels.indexOf(k) !== -1;
      return '<li class="sc2__lv sc2__lv--' + k + (on ? ' is-on' : '') + '"' + (on ? '' : ' aria-hidden="true"') + '>' + esc(L.short[k]) + '</li>';
    }).join('');
    var pre = lang === 'en' ? '/en/' : '/';
    var slug = SURF_BEACH[s.id];
    var planR = SURF_PLAN_R_ID[s.id] || SURF_PLAN_R[s.region] || '';
    var planHref = pre + 'planear?' + (planR ? 'r=' + planR + '&' : '') + 'i=surf&ref=surf';
    var dbRegion = SURF_DB_REGION[s.region];
    var primary = slug
      ? '<a class="sc2__btn sc2__btn--primary" href="' + pre + 'praias/' + slug + '/" aria-label="' + esc(L.ariaBeach(name)) + '">' + esc(L.beach) + SC2_ICON.arrow + '</a>'
      : SURF_BEACH_ID[s.id]
        ? '<a class="sc2__btn sc2__btn--primary" href="' + pre + 'beach?id=' + encodeURIComponent(SURF_BEACH_ID[s.id]) + '" aria-label="' + esc(L.ariaBeach(name)) + '">' + esc(L.beach) + SC2_ICON.arrow + '</a>'
      : dbRegion
        ? '<a class="sc2__btn sc2__btn--primary" href="' + pre + 'beaches?region=' + encodeURIComponent(dbRegion) + '" aria-label="' + esc(L.ariaZone(s.region)) + '">' + esc(L.zone) + SC2_ICON.arrow + '</a>'
        : '';
    var plan = '<a class="sc2__btn' + (primary ? '' : ' sc2__btn--primary') + '" href="' + planHref + '" aria-label="' + esc(L.ariaPlan(name)) + '">' + SC2_ICON.cal + esc(L.plan) + '</a>';
    return (
      '<article class="spot-card sc2' + (primary ? '' : ' sc2--one') + '" role="listitem" id="spot-' + esc(s.id) + '" data-spot-id="' + esc(s.id) + '">' +
        '<figure class="sc2__media">' + surfPhotoHtml(s, lang, L) +
          '<span class="sc2__chip sc2__chip--region">' + esc(lang === 'en' ? (SURF_REGION_EN[s.region] || s.region) : s.region) + '</span>' +
          (s.quality >= 5 ? '<span class="sc2__chip sc2__chip--wc">' + esc(L.worldClass) + '</span>' : '') +
          '<span class="sc2__type">' + SC2_ICON.wave + esc(pickLang(s.type, lang)) + '</span>' +
        '</figure>' +
        '<div class="sc2__body">' +
          '<div class="sc2__head"><h2 class="sc2__name">' + esc(name) + '</h2>' +
          '<p class="sc2__loc">' + SC2_ICON.pin + esc(pickLang(s.location, lang)) + '</p></div>' +
          '<p class="sc2__now" hidden></p>' +
          '<div class="sc2__level"><span class="sc2__k">' + esc(L.level) + '</span>' +
            '<ul class="sc2__meter" aria-label="' + esc(L.ariaLevel(levelLabel)) + '">' + meter + '</ul></div>' +
          '<p class="sc2__hook">' + esc(pickLang(s.desc, lang)) + '</p>' +
          '<dl class="sc2__specs">' +
            '<div><dt>' + esc(L.season) + '</dt><dd>' + esc(pickLang(s.season, lang)) + '</dd></div>' +
            '<div><dt>' + esc(L.swell) + '</dt><dd>' + esc(pickLang(s.best_swell, lang)) + '</dd></div>' +
            '<div><dt>' + esc(L.wind) + '</dt><dd>' + esc(pickLang(s.best_wind, lang)) + '</dd></div>' +
          '</dl>' +
          surfCamHtml(s, lang, L) +
          '<div class="sc2__actions">' + primary + plan + '</div>' +
        '</div>' +
      '</article>'
    );
  }
  function surfCamHtml(s, lang, L) {
    var c = SURF_CAM[s.id]; if (!c) return '';
    return '<a class="sc2__cam" href="' + (lang === 'en' ? '/en/' : '/') + 'webcams#cam-' + encodeURIComponent(c[0]) + '" data-cam="' + esc(c[0]) + '">' +
      '<i aria-hidden="true"></i><span>' + esc(L.cam) + '</span><b>' + esc(c[1]) + '</b>' + SC2_ICON.arrow + '</a>';
  }
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('.sc2__cam') : null; if (!a) return;
    try { if (typeof window.track === 'function') window.track('surf_webcam_click', { cam: a.getAttribute('data-cam') }); } catch (_) {}
  });

  // ── Fishing card template ─────────────────────────────────────────────────────
  // ── Fotos dos spots de pesca (Wikimedia Commons, verificadas 2026-10-07) ──────────
  // Ficheiros: /images/spots/pesca-<id>-{480,800}.webp. Sem entrada -> fica o fundo de cor (bgClass).
  var FISH_PHOTO = {
    'sagres-ponta': "The Cosmonaut · CC BY-SA 2.5 ca",
    'ria-formosa': "Vitor Oliveira · CC BY-SA 2.0",
    'costa-de-sines': "Vitor Oliveira · CC BY-SA 2.0",
    'sesimbra-mar-alto': "Pedro Ribeiro Simões · CC BY 2.0",
    'ria-de-aveiro': "Inês Severiano · CC BY-SA 4.0",
    'viana-rio-lima': "Krzysztof Golik · CC BY-SA 4.0",
    'portimao-barco': "Vitor Oliveira · CC BY-SA 2.0",
    'acores-sao-miguel': "Ravi Sarma · CC BY 2.0",
    'rio-lima-ponte-de-lima': "Joseolgon · CC BY-SA 4.0",
    'albufeira-canicada': "Joseolgon · CC BY-SA 4.0",
    'rio-douro-peso-regua': "Joseolgon · CC BY-SA 4.0",
    'praia-esposende-costa': "Joseolgon · CC BY-SA 4.0",
    'foz-mondego': "Vitor Oliveira · CC BY-SA 2.0",
    'albufeira-castelo-de-bode': "Vitor Oliveira · CC BY-SA 2.0",
    'albufeira-maranhao': "Vitor Oliveira · CC BY 2.0",
    'costa-sines-rocha': "Tiago J. G. Fernandes · CC BY 2.0",
    'porto-covo': "Paulrocha · CC BY-SA 4.0",
    'costa-vicentina-odeceixe': "Vitor Oliveira · CC BY-SA 2.0",
    'ria-de-alvor': "Joseolgon · CC0",
    'praia-da-rocha-portimao': "CesareBonaparte · CC BY-SA 4.0",
    'gale-armacao-de-pera': "Kolforn · CC BY-SA 4.0",
    'ilha-da-culatra': "Tristanm70 · CC BY-SA 4.0",
    'baia-de-setubal': "DavidFerreira20048 · CC BY-SA 4.0",
    'horta-faial': "Vitor Oliveira · CC BY-SA 2.0",
    'madeira-canical': "Asurnipal · CC BY-SA 4.0",
    // Lote P1 (2026-10-08)
    'foz-do-arelho': "Vitor Oliveira · CC BY-SA 2.0",
    'berlengas': "Alexkom000 · CC BY 4.0",
    'cabo-raso': "Vitor Oliveira · CC BY-SA 2.0",
    'lagoa-de-albufeira-mar': "Vitor Oliveira · CC BY-SA 2.0",
    'vila-nova-de-milfontes': "Vitor Oliveira · CC BY-SA 2.0",
    'ponta-da-piedade': "François Philipp · CC BY 2.0",
    'ilha-de-tavira': "Vitor Oliveira · CC BY-SA 2.0",
    'alqueva-mourao': "Vitor Oliveira · CC BY-SA 2.0",
    // Lote P2 (2026-10-08)
    'foz-minho-moledo': "Vitor Oliveira · CC BY-SA 2.0",
    'foz-do-ave-vila-do-conde': "Vitor Oliveira · CC BY-SA 2.0",
    'rio-vez-sistelo': "Vitor Oliveira · CC BY-SA 2.0",
    'rio-coura-taboao': "Vitor Oliveira · CC BY-SA 2.0",
    'rio-homem-amares': "Vitor Oliveira · CC BY-SA 2.0",
    'rio-tamega-chaves': "João Pedro Gonçalves · CC BY-SA 4.0",
    'rio-tamega-amarante-formao': "Sergei Gussev · CC BY 4.0",
    'rio-neiva-antas': "Pedro · CC BY 2.0",
    'praia-mira-palheirao': "Vitor Oliveira · CC BY 2.0",
    'cabo-mondego-buarcos': "Vitor Oliveira · CC BY-SA 2.0",
    'sao-pedro-de-moel-rochas': "Sergei Gussev · CC BY 2.0",
    'peniche-papoa': "Miguel Ángel García · CC BY 2.0",
    'porto-dinheiro-lourinha': "GualdimG · CC BY-SA 4.0",
    'albufeira-vascoveiro': "Vitor Oliveira · CC BY-SA 2.0",
    'albufeira-aguieira': "Vitor Oliveira · CC BY-SA 2.0",
    'cova-do-vapor-trafaria': "Vitor Oliveira · CC BY-SA 2.0",
    'esporoes-costa-da-caparica': "Alvesgaspar · CC BY-SA 3.0",
    'alges-cruz-quebrada': "Giuseppe Milo · CC BY 3.0",
    'alhandra-alverca-corvinas': "Vitor Oliveira · CC BY-SA 2.0",
    'comporta-pego-surfcasting': "Vitor Oliveira · CC BY-SA 2.0",
    'almograve-rochas': "Vitor Oliveira · CC BY-SA 2.0",
    'barragem-de-montargil': "Jules Verne Times Two · CC BY-SA 4.0",
    'vilamoura-barco': "Vitor Oliveira · CC BY-SA 2.0",
    'albufeira-marina-barco': "Kolforn · CC BY-SA 4.0",
    'lagos-marina-barco': "Vitor Oliveira · CC BY-SA 2.0",
    'foz-do-guadiana-vrsa': "Jose A · CC BY 2.0",
    'carrapateira-amado': "Kyle Taylor · CC BY 2.0",
    'madeira-calheta': "anagh · CC BY-SA 3.0",
    'madeira-funchal-marina': "Michael Gaylard · CC BY 2.0",
    'madeira-porto-moniz-seixal': "Xosema · CC BY-SA 4.0",
    'madeira-funchal-costa': "TeWeBs · CC BY-SA 4.0",
    'acores-pico-madalena': "JCNazza · CC BY 3.0",
    'acores-terceira-angra': "Ymblanter · CC BY-SA 4.0",
    'acores-santa-maria-vila-do-porto': "Jules Verne Times Two · CC BY-SA 4.0",
    'acores-lagoa-sete-cidades': "JCNazza · CC BY 3.0",
    'acores-lagoa-furnas': "Jan Helebrant · CC0",
    'ferragudo-molhe-ponta-do-altar': "Glen Bowman · CC BY 2.0",
    'zambujeira-do-mar-rochas': "Tulumnes · CC BY-SA 4.0",
    // Lote P3 (2026-10-08)
    'rio-castro-laboreiro-assureira': "JCNazza · CC BY 3.0",
    'rio-tua-mirandela': "Vitor Oliveira · CC BY-SA 2.0",
    'pateira-de-fermentelos': "Vitor Oliveira · CC BY-SA 2.0",
    'rio-mondego-coimbra-choupalinho': "Marmontel · CC BY 2.0",
    'nazare-praia-surfcasting': "Terry Kearney · CC0",
    'fonte-da-telha-surfcasting': "Cossel · CC BY 3.0",
    'alqueva-amieira-marina': "Vitor Oliveira · CC BY-SA 2.0",
    'carvoeiro-rochas': "Jules Verne Times Two · CC BY-SA 4.0",
    'garrao-surfcasting': "Vitor Oliveira · CC BY-SA 2.0",
    'madeira-camara-de-lobos': "Asurnipal · CC BY-SA 4.0",
    'acores-sao-jorge-velas': "Alacoolwiki · CC BY-SA 4.0",
    'albufeira-azibo-santa-combinha': "VetK2O3 · CC BY-SA 4.0",
    'albufeira-touvedo-entre-ambos-os-rios': "Vitor Oliveira · CC BY-SA 2.0",
    'albufeira-do-cabril': "Vitor Oliveira · CC BY-SA 2.0",
    'sao-martinho-do-porto-tunel': "Alvesgaspar · CC BY-SA 3.0",
    'azenhas-do-mar-rochas': "Paulo Costa · CC BY-SA 3.0",
    'troia-praia-atlantica': "Vitor Oliveira · CC BY-SA 2.0",
    'tavira-quatro-aguas-barco': "Vitor Oliveira · CC BY-SA 4.0",
    'fuzeta-praia-mar': "Vitor Oliveira · CC BY-SA 2.0",
    'praia-de-faro-surfcasting': "Vitor Oliveira · CC BY-SA 2.0",
    'madeira-porto-santo': "Vitor Oliveira · CC BY-SA 2.0",
    'acores-terceira-praia-da-vitoria': "Bybbisch94, Christian Gebhardt · CC BY-SA 4.0",
    'albufeira-alto-rabagao-pisoes': "Vitor Oliveira · CC BY-SA 2.0",
    'douro-crestuma-melres': "Vitor Oliveira · CC BY-SA 2.0",
    'rio-tejo-constancia': "Vitor Oliveira · CC BY-SA 2.0",
    'santa-cruz-torres-vedras': "GualdimG · CC BY-SA 4.0",
    'cascais-boca-do-inferno': "Sergei Gussev · CC BY 2.0",
    'barragem-do-caia': "Vitor Oliveira · CC BY-SA 2.0",
    'sagres-baleeira-barco': "Vitor Oliveira · CC BY-SA 2.0",
    'falesia-rocha-baixinha': "Vitor Oliveira · CC BY-SA 2.0",
    'madeira-machico': "Ввласенко · CC BY-SA 3.0",
    'acores-sao-miguel-rabo-de-peixe': "JCNazza · CC BY 3.0",
    'acores-flores-santa-cruz': "Emin Başar ÖZDEMİR · CC BY 3.0"
  };
  function fishPhotoHtml(s, lang) {
    var c = FISH_PHOTO[s.id]; if (!c) return '';
    var base = '/images/spots/pesca-' + encodeURIComponent(s.id);
    return '<img class="spot-photo" src="' + base + '-480.webp" srcset="' + base + '-480.webp 480w, ' + base + '-800.webp 800w" sizes="(max-width: 640px) 92vw, 380px" width="480" height="320" alt="' + esc(s.name || s.id) + '" loading="lazy" decoding="async" onerror="this.remove()">' +
      '<span class="spot-photo-credit">' + esc((lang === 'en' ? 'Photo: ' : 'Foto: ') + c) + '</span>';
  }

  // ── Cartao de pesca v2 (2026-10-07) — mesma linguagem do cartao de surf (.sc2, css/surf-card-v2.css) ──
  var FISH_PLAN_R = { Norte: 'minho', Porto: 'minho', Centro: 'costa-prata', Lisboa: 'setubal', Alentejo: 'alentejo', Algarve: 'algarve', 'Açores': 'acores', Madeira: 'madeira' };
  var FISH_INLAND = { 'albufeira-canicada': 1, 'rio-douro-peso-regua': 1, 'albufeira-castelo-de-bode': 1, 'albufeira-maranhao': 1, 'rio-lima-ponte-de-lima': 1, 'alqueva-mourao': 1, 'rio-vez-sistelo': 1, 'rio-coura-taboao': 1, 'rio-homem-amares': 1, 'rio-tamega-chaves': 1, 'rio-tamega-amarante-formao': 1, 'rio-neiva-antas': 1, 'alto-ceira-piodao': 1, 'rio-unhais-pampilhosa': 1, 'albufeira-vascoveiro': 1, 'albufeira-aguieira': 1, 'barragem-santa-clara': 1, 'barragem-de-montargil': 1, 'tapada-grande-mina-sao-domingos': 1, 'barragem-de-odeleite': 1, 'alhandra-alverca-corvinas': 1, 'rio-mouro-riba-de-mouro': 1, 'rio-castro-laboreiro-assureira': 1, 'albufeira-azibo-santa-combinha': 1, 'albufeira-alto-rabagao-pisoes': 1, 'rio-tua-mirandela': 1, 'albufeira-touvedo-entre-ambos-os-rios': 1, 'douro-crestuma-melres': 1, 'lagos-do-sabor-moncorvo': 1, 'pateira-de-fermentelos': 1, 'albufeira-do-cabril': 1, 'rio-tejo-constancia': 1, 'rio-mondego-coimbra-choupalinho': 1, 'albufeira-idanha-marechal-carmona': 1, 'barragem-pego-do-altar': 1, 'barragem-vale-do-gaio': 1, 'barragem-de-odivelas': 1, 'barragem-do-caia': 1, 'alqueva-amieira-marina': 1 };
  var FISH_PLAN_R_ID = { 'foz-do-arelho': 'oeste', 'berlengas': 'oeste', 'cabo-raso': 'cascais', 'peniche-papoa': 'oeste', 'porto-dinheiro-lourinha': 'oeste', 'alges-cruz-quebrada': 'cascais', 'sao-martinho-do-porto-tunel': 'oeste', 'santa-cruz-torres-vedras': 'oeste', 'ericeira-praia-do-sul': 'oeste', 'azenhas-do-mar-rochas': 'cascais', 'cascais-boca-do-inferno': 'cascais', 'fonte-da-telha-surfcasting': 'setubal', 'troia-praia-atlantica': 'setubal' };
  var FISH_LEVELS = ['iniciante', 'intermedio', 'experiente'];
  var FC2 = {
    pt: { photo: 'Foto', level: 'Nível', species: 'Espécies', tech: 'Técnica', season: 'Melhor época', plan: 'Planear saída', save: 'Guardar',
          ref: 'Destino de referência', rules: 'Regras:', short: { iniciante: 'Iniciante', intermedio: 'Intermédio', experiente: 'Experiente' },
          ariaLevel: function (t) { return 'Nível recomendado: ' + t; }, ariaPlan: function (n) { return 'Planear uma saída de pesca em ' + n; } },
    en: { photo: 'Photo', level: 'Level', species: 'Species', tech: 'Technique', season: 'Best season', plan: 'Plan a trip', save: 'Save',
          ref: 'Top destination', rules: 'Rules:', short: { iniciante: 'Beginner', intermedio: 'Intermediate', experiente: 'Experienced' },
          ariaLevel: function (t) { return 'Recommended level: ' + t; }, ariaPlan: function (n) { return 'Plan a fishing trip to ' + n; } }
  };
  var FC2_ICON = {
    pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>',
    fish: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 12c3-5 9-5 12 0-3 5-9 5-12 0z"/><path d="M6.5 12L3 9v6z"/><circle cx="15" cy="11" r=".6"/></svg>',
    cal: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"/></svg>'
  };
  var FISH_REGION_EN = { Norte: 'North', Centro: 'Centre', Lisboa: 'Lisbon', 'Açores': 'Azores' };

  function fishingCardHtml(s, T, lang) {
    var L = FC2[lang] || FC2.pt;
    var name = s.name || s.id;
    var levelLabel = fishingLevelLabel(s, T);
    var meter = FISH_LEVELS.map(function (k) {
      var on = k === s.levelKey;
      return '<li class="sc2__lv sc2__lv--' + (k === 'experiente' ? 'avancado' : k) + (on ? ' is-on' : '') + '"' + (on ? '' : ' aria-hidden="true"') + '>' + esc(L.short[k]) + '</li>';
    }).join('');
    var tipos = (s.tipos || [s.tipoKey]).map(function (k) { return (T.fishing.tipoLabel && T.fishing.tipoLabel[k]) || k; });
    var species = pickLang(s.especies, lang).split(/\s*,\s*/).filter(Boolean);
    var pre = lang === 'en' ? '/en/' : '/';
    var r = FISH_INLAND[s.id] ? '' : (FISH_PLAN_R_ID[s.id] || FISH_PLAN_R[s.region] || '');
    var planHref = pre + 'planear?' + (r ? 'r=' + r + '&' : '') + 'i=pesca&ref=pesca';
    var loginHref = pre + 'login.html#register';
    var photo = FISH_PHOTO[s.id];
    var base = '/images/spots/pesca-' + encodeURIComponent(s.id);
    var media = photo
      ? '<img src="' + base + '-480.webp" srcset="' + base + '-480.webp 480w, ' + base + '-800.webp 800w" sizes="(max-width: 640px) 94vw, (max-width: 1100px) 46vw, 380px" width="480" height="320" alt="' + esc(name) + '" loading="lazy" decoding="async" onerror="this.remove()">' +
        '<figcaption class="sc2__credit">' + esc(L.photo + ': ' + photo) + '</figcaption>'
      : '<div class="sc2__fallback ' + esc(s.bgClass) + '">' + FC2_ICON.fish + '</div>';
    return (
      '<article class="spot-card sc2 sc2--fish" role="listitem" id="spot-' + esc(s.id) + '" data-spot-id="' + esc(s.id) + '">' +
        '<figure class="sc2__media">' + media +
          '<span class="sc2__chip sc2__chip--region">' + esc(lang === 'en' ? (FISH_REGION_EN[s.region] || s.region) : s.region) + '</span>' +
          (s.quality >= 5 ? '<span class="sc2__chip sc2__chip--wc">' + esc(L.ref) + '</span>' : '') +
          '<span class="sc2__type">' + FC2_ICON.fish + esc(tipos.join(' · ')) + '</span>' +
        '</figure>' +
        '<div class="sc2__body">' +
          '<div class="sc2__head"><h2 class="sc2__name">' + esc(name) + '</h2>' +
          '<p class="sc2__loc">' + FC2_ICON.pin + esc(pickLang(s.location, lang)) + '</p></div>' +
          '<p class="sc2__now" hidden></p>' +
          '<div class="sc2__level"><span class="sc2__k">' + esc(L.level) + '</span>' +
            '<ul class="sc2__meter sc2__meter--3" aria-label="' + esc(L.ariaLevel(levelLabel)) + '">' + meter + '</ul></div>' +
          '<p class="sc2__hook">' + esc(pickLang(s.desc, lang)) + '</p>' +
          '<div class="sc2__species"><span class="sc2__k">' + esc(L.species) + '</span><ul>' + species.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>' +
          (s.aviso ? '<p class="sc2__warn"><b>' + esc(L.rules) + '</b> ' + esc(pickLang(s.aviso, lang)) + '</p>' : '') +
          '<dl class="sc2__specs sc2__specs--2">' +
            '<div><dt>' + esc(L.tech) + '</dt><dd>' + esc(pickLang(s.tecnica, lang)) + '</dd></div>' +
            '<div><dt>' + esc(L.season) + '</dt><dd>' + esc(pickLang(s.season, lang)) + '</dd></div>' +
          '</dl>' +
          '<div class="sc2__actions">' +
            '<a class="sc2__btn sc2__btn--primary sc2__btn--lead" href="' + planHref + '" aria-label="' + esc(L.ariaPlan(name)) + '">' + FC2_ICON.cal + esc(L.plan) + '</a>' +
            '<a class="sc2__btn" href="' + loginHref + '">' + FC2_ICON.heart + esc(L.save) + '</a>' +
          '</div>' +
        '</div>' +
      '</article>'
    );
  }

  // ── Surf spot renderer ────────────────────────────────────────────────────────
  function renderSurfSpots(spots, opts) {
    opts = opts || {};
    var T    = window.BeachRenderer.getT();
    var lang = window.BeachRenderer.detectLang();
    var grid  = document.getElementById('spots-grid');
    var count = document.getElementById('spot-count');
    var n = spots.length;
    if (count) _setHTML(count, T.surfPage.spotCount(n));
    if (!grid) return;
    if (!n) {
      _setHTML(grid,
        '<div class="spots-empty" role="status">' +
          '<div class="spots-empty-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 14c0 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2"/><path d="M2 18c0 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2"/><line x1="12" y1="2" x2="12" y2="8"/></svg></div>' +
          '<p class="spots-empty-title">' + esc(T.surfPage.emptyTitle) + '</p>' +
          '<p class="spots-empty-sub">' + esc(T.surfPage.emptySub) + '</p>' +
          '<button class="btn-reset" id="btn-reset-filters">' + esc(T.surfPage.emptyCta) + '</button>' +
        '</div>'
      );
      var btn = document.getElementById('btn-reset-filters');
      if (btn && typeof opts.onReset === 'function') btn.addEventListener('click', opts.onReset);
      return;
    }
    _setHTML(grid, spots.map(function (s) { return surfCardHtml(s, T, lang); }).join(''));
    try { document.dispatchEvent(new CustomEvent('pth:surf-render')); } catch (_) {} // js/surf-hero.js preenche o estado 'agora'
  }

  // ── Fishing spot renderer ─────────────────────────────────────────────────────
  function renderFishSpots(spots, opts) {
    opts = opts || {};
    var T    = window.BeachRenderer.getT();
    var lang = window.BeachRenderer.detectLang();
    var grid  = document.getElementById('spots-grid');
    var count = document.getElementById('spot-count');
    var n = spots.length;
    if (count) _setHTML(count, T.fishing.spotCount(n));
    if (!grid) return;
    if (!n) {
      _setHTML(grid,
        '<div class="spots-empty" role="status">' +
          '<div class="spots-empty-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 14c0 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2"/><path d="M2 18c0 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2"/><line x1="12" y1="2" x2="12" y2="8"/></svg></div>' +
          '<p class="spots-empty-title">' + esc(T.fishing.emptyTitle) + '</p>' +
          '<p class="spots-empty-sub">' + esc(T.fishing.emptySub) + '</p>' +
          '<button class="btn-reset" id="btn-reset-filters">' + esc(T.fishing.emptyCta) + '</button>' +
        '</div>'
      );
      var btn = document.getElementById('btn-reset-filters');
      if (btn && typeof opts.onReset === 'function') btn.addEventListener('click', opts.onReset);
      return;
    }
    _setHTML(grid, spots.map(function (s) { return fishingCardHtml(s, T, lang); }).join(''));
    try { document.dispatchEvent(new CustomEvent('pth:fish-render')); } catch (_) {}
  }

  // ── FAQ renderer ─────────────────────────────────────────────────────────────
  function renderFaqs(kind) {
    var T    = window.BeachRenderer.getT();
    var list = document.getElementById('faq-list');
    if (!list) return;
    var K    = kind === 'surf' ? 'surfPage' : kind; // textos da pagina /surf vivem em T.surfPage (T.surf = ficha de praia)
    var faqs = (T[K] && T[K].faqs) ? T[K].faqs : [];
    _setHTML(list, faqs.map(function (f, i) {
      var isFirst = (kind === 'surf' && i === 0);
      return (
        '<div class="faq-item' + (isFirst ? ' open' : '') + '" id="faq-' + i + '">' +
          '<button class="faq-header" data-faq-idx="' + i + '" aria-expanded="' + (isFirst ? 'true' : 'false') + '" aria-controls="faq-body-' + i + '">' +
            '<span class="faq-question">' + esc(f.q) + '</span>' +
            '<svg class="faq-chevron" viewBox="0 0 24 24" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>' +
          '</button>' +
          '<div class="faq-body" id="faq-body-' + i + '" role="region"><p class="faq-answer">' + esc(f.a) + '</p></div>' +
        '</div>'
      );
    }).join(''));
    list.querySelectorAll('.faq-header').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var item = btn.closest('.faq-item');
        var open = item.classList.contains('open');
        item.classList.toggle('open', !open);
        btn.setAttribute('aria-expanded', String(!open));
      });
    });
  }

  // ── Meta tag updater ──────────────────────────────────────────────────────────
  function updateMetaTags(kind) {
    var T = window.BeachRenderer.getT();
    var m = T[kind === 'surf' ? 'surfPage' : kind];
    if (!m) return;
    if (m.metaTitle) document.title = m.metaTitle;
    var md = document.querySelector('meta[name="description"]');
    if (md && m.metaDescription) md.setAttribute('content', m.metaDescription);
  }

  // ── Surf filter state + handlers ──────────────────────────────────────────────
  function initSurfFilters() {
    var data = window.SurfPescaData.SURF_SPOTS;
    var activeRegion = '';
    var activeLevel  = '';

    function apply() {
      var filtered = data.filter(function (s) {
        var r = !activeRegion || s.region === activeRegion;
        var l = !activeLevel  || (s.levels || [s.levelKey]).indexOf(activeLevel) !== -1;
        return r && l;
      });
      renderSurfSpots(filtered, { onReset: clear });
    }

    function clear() {
      activeRegion = '';
      activeLevel  = '';
      document.querySelectorAll('#region-chips .chip').forEach(function (c) {
        c.classList.toggle('active', c.dataset.region === '');
      });
      document.querySelectorAll('#level-tabs .level-tab').forEach(function (t) {
        t.classList.toggle('active', t.dataset.level === '');
      });
      renderSurfSpots(data, { onReset: clear });
    }

    document.querySelectorAll('#region-chips .chip').forEach(function (c) {
      c.addEventListener('click', function () {
        activeRegion = c.dataset.region || '';
        document.querySelectorAll('#region-chips .chip').forEach(function (x) {
          x.classList.toggle('active', x === c);
        });
        apply();
      });
    });

    document.querySelectorAll('#level-tabs .level-tab').forEach(function (t) {
      t.addEventListener('click', function () {
        activeLevel = t.dataset.level || '';
        document.querySelectorAll('#level-tabs .level-tab').forEach(function (x) {
          x.classList.toggle('active', x === t);
        });
        apply();
      });
    });

    // URL pre-filters (?region=Centro&level=avancado)
    var p  = new URLSearchParams(window.location.search);
    var pr = p.get('region');
    var pl = p.get('level');
    if (pr) {
      activeRegion = pr;
      var chip = document.querySelector('#region-chips .chip[data-region="' + CSS.escape(pr) + '"]');
      if (chip) { chip.classList.add('active'); apply(); }
      else { apply(); }
    } else if (pl) {
      activeLevel = pl;
      var tab = document.querySelector('#level-tabs .level-tab[data-level="' + CSS.escape(pl) + '"]');
      if (tab) { tab.classList.add('active'); apply(); }
      else { apply(); }
    } else {
      apply();
    }
  }

  // ── Fishing filter state + handlers ───────────────────────────────────────────
  function initFishingFilters() {
    var data = window.SurfPescaData.FISH_SPOTS;
    var activeRegion = '';
    var activeTipo   = '';

    function apply() {
      var filtered = data.filter(function (s) {
        var r = !activeRegion || s.region === activeRegion;
        var t = !activeTipo   || (s.tipos || [s.tipoKey]).indexOf(activeTipo) !== -1;
        return r && t;
      });
      renderFishSpots(filtered, { onReset: clear });
    }

    function clear() {
      activeRegion = '';
      activeTipo   = '';
      document.querySelectorAll('#region-chips .chip').forEach(function (c) {
        c.classList.toggle('active', c.dataset.region === '');
      });
      document.querySelectorAll('#tipo-tabs .tipo-tab').forEach(function (t) {
        t.classList.toggle('active', t.dataset.tipo === '');
      });
      renderFishSpots(data, { onReset: clear });
    }

    document.querySelectorAll('#region-chips .chip').forEach(function (c) {
      c.addEventListener('click', function () {
        activeRegion = c.dataset.region || '';
        document.querySelectorAll('#region-chips .chip').forEach(function (x) {
          x.classList.toggle('active', x === c);
        });
        apply();
      });
    });

    document.querySelectorAll('#tipo-tabs .tipo-tab').forEach(function (t) {
      t.addEventListener('click', function () {
        activeTipo = t.dataset.tipo || '';
        document.querySelectorAll('#tipo-tabs .tipo-tab').forEach(function (x) {
          x.classList.toggle('active', x === t);
        });
        apply();
      });
    });

    // URL pre-filters (?region=Algarve&tipo=rocha)
    var p  = new URLSearchParams(window.location.search);
    var pr = p.get('region');
    var pt = p.get('tipo');
    if (pr) {
      activeRegion = pr;
      var chip = document.querySelector('#region-chips .chip[data-region="' + CSS.escape(pr) + '"]');
      if (chip) { chip.classList.add('active'); apply(); }
      else { apply(); }
    } else if (pt) {
      activeTipo = pt;
      var tab = document.querySelector('#tipo-tabs .tipo-tab[data-tipo="' + CSS.escape(pt) + '"]');
      if (tab) { tab.classList.add('active'); apply(); }
      else { apply(); }
    } else {
      apply();
    }
  }

  // ── renderAll — single entry point per page ───────────────────────────────────
  function renderAll(kind) {
    updateMetaTags(kind);
    renderFaqs(kind);
    if (kind === 'surf')    initSurfFilters();
    if (kind === 'fishing') initFishingFilters();
    var revealEls = document.querySelectorAll('.reveal-sec');
    if ('IntersectionObserver' in window) {
      var obs = new IntersectionObserver(function(entries) {
        entries.forEach(function(e) {
          if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
        });
      }, { threshold: 0.07 });
      revealEls.forEach(function(el) { obs.observe(el); });
    } else {
      revealEls.forEach(function(el) { el.classList.add('visible'); });
    }
  }

  // ── Public API ────────────────────────────────────────────────────────────────
  window.SurfPescaPage = {
    renderAll:        renderAll,
    renderSurfSpots:  renderSurfSpots,
    renderFishSpots:  renderFishSpots,
    renderFaqs:       renderFaqs,
    updateMetaTags:   updateMetaTags,
  };

})(window, document);
