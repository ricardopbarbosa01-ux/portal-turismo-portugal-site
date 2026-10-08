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
  var XY = {"e11188da-c19e-4c9d-a2a6-59f777412a05":[144,1781],"37ac39ea-0a07-480a-9147-5aed9a9ae388":[254,2386],"47af766c-c76f-483f-986b-5dbefd6f294a":[315,764],"10f7f046-fb30-493e-acf0-bf6b2a57858b":[285,268],"a6625ef3-a4ad-4e38-b74e-856ffc9fa724":[262,2353],"3be6e364-0660-4b97-be03-67b7c4053070":[745,2411],"07b0b2c3-f11d-474d-9f5f-02dc87a4be64":[272,1011],"a45ef0a4-98ff-4eb2-bc3d-3cee21ca5570":[680,2468],"508706d1-2ddd-4377-8319-75a5bb347435":[142,1742],"6cafdc55-fcea-4e55-b2a1-78995f44b609":[436,2436],"d8c2c61e-734a-41c5-aec1-66981023cfca":[245,1773],"0f616614-30d1-488a-986a-acd1caebbe6c":[100,1392],"fede421d-0f75-46f7-9248-9a374bc63c4c":[38,1675],"868b17e0-9f74-46b1-8f84-bacc0ff7db94":[248,2411],"52e176c2-b7e6-4a85-abcf-6cf871464967":[291,2106],"6b2661a4-4126-4ac4-8a03-ec2193cd4494":[287,2181],"4bd3bca5-6c5b-486d-87c0-bd21ea5435ce":[294,2245],"db7e9098-4293-4b44-a443-d42491916a91":[349,618],"304b2207-d81b-4fef-bdc3-74392d207133":[60,1556],"a8e9c668-f606-4100-87ea-b00ea61617e5":[287,2111],"62030703-6711-4653-bc35-b1284f35cd5e":[328,498],"eea6217b-2508-4c9b-b1a8-e9ed888f757d":[302,1958],"084b12c9-a27a-4865-98b4-6932918e3609":[508,2445],"53d1fa07-14d1-4806-8c8c-d0ec01f35b28":[81,1683],"a0529d77-b688-4293-ba11-8f023a69e4cf":[33,1644],"9b62bea8-e8c4-44f1-9ab5-9e9864cf6bb5":[343,2434],"f0fbf5a9-75d3-40d3-80be-62fc749588fd":[96,1682],"6a12acc8-f776-4b01-96f7-73f9fb096e6d":[287,2097],"d81736c8-0e7d-4d98-b369-377998fc5c2f":[38,1622],"513d687d-b8f9-4d87-b5a7-c6de1d7d695c":[47,1620],"0b9d2380-38cf-437d-a4e3-4b68158ba2a4":[250,1792],"dee27f4d-ec13-43b4-a618-4ac272d22cf2":[281,2054],"feead871-bb63-43d7-acf9-592d7d54b514":[776,2401],"d3bb1bb1-4e97-424d-9267-710673662975":[426,2441],"fd1474e1-7acb-4635-822d-df649332769e":[89,1419],"4b75fb06-7715-4b56-8b37-8f6eb332ae22":[589,2485],"dd37d1cd-8ecc-45af-b8d2-3ceabf881969":[300,334],"23467c12-84bc-4590-a3a8-32412c15fcde":[409,2441],"6b3928b3-4680-4051-b2f1-e3bdb41cab35":[302,805],"3d2dacea-cfcb-4086-9e15-a7b57ec9f2e7":[221,1788],"406a09d1-daa7-44b3-aa19-3a13b4aab711":[116,1680],"c627b1c9-8467-4729-aa26-15fb6e86e6af":[282,2278],"fefd19c5-2dad-4627-a476-daa13be99352":[132,1338],"d762875e-3d8a-467c-bb1b-efed5b1c42d0":[291,853],"b04adbca-20fc-44e0-b947-066978b8fffc":[240,2414],"24dba43c-02fb-40bc-b3a8-d39e1f8ea49e":[208,1186],"92de7432-12a1-4324-8ed2-932692b1e267":[285,1963],"f893e0a8-9f2e-4533-9093-001877541cf1":[58,1676],"2cb7aca0-9280-4405-8390-3f592e3ef0f5":[530,2453],"4325b4a7-62f3-46a7-a66d-ae0ad6e0d374":[289,2449],"b699e6b6-e0cb-4620-9355-e1f3074ddde9":[278,195],"885a3c2e-2f8d-424d-b98c-a8c7b8732bee":[381,2428],"66ee7f6b-018b-408b-8d48-c58d2f73bf8d":[435,2434],"26b8762d-0343-4a93-9670-9a86993e7dfd":[308,781],"63d09050-d513-474a-87f4-3658b18da09a":[356,593],"0e3bf570-263f-45c1-afd2-0f9ca232b07c":[403,2435],"e1e260e4-5094-4dee-8c90-11a43523e126":[267,2325],"9fd20503-ced1-4e4c-9069-d38c320ef247":[334,514],"74421a75-f67c-45d5-928f-b7fae44adc33":[187,1243],"59de93aa-066b-4d01-9c4e-27f3a40422f1":[469,2451],"f2061e77-2dfd-4817-bab6-2341672729a4":[506,2444],"c63cbf17-1445-4697-aa21-a5b9dff08851":[341,657],"5c45c033-1182-4e59-b0de-61ec81ab38f2":[259,2460],"d3b73c18-ff72-4f00-b556-0370fd549fd3":[232,2433],"cd38e95f-282e-4d59-bca9-5ff03d43cee8":[224,2444],"efdfab6a-36b9-42a6-8e11-019450a51c86":[772,2411],"b5d5f332-d553-49d9-ad92-77d658de945f":[260,970],"e5113c93-c469-489a-8db6-7d877c0de22c":[325,709],"885d20c0-e362-4825-b250-b63ffaaf9631":[225,1130],"2dd735c3-9317-45bb-aed7-c3832af7653d":[292,2151],"925ac239-db1f-432b-98ee-7a308ae9a6b8":[364,2427],"d723c15c-6b6b-4c47-8182-c06313e0e641":[459,2444],"4c907c07-8bbd-4c37-90f2-8f9e2696f5a0":[187,1267],"f400d000-20b2-414c-ba38-bae63856431f":[275,911],"6adf3ccd-9fd2-4bc0-894e-e4c775fb3e71":[301,339],"c4bea301-56f1-49b5-934d-f576e41f5132":[234,1106],"8d29adfa-7276-4074-bce6-dc1c6b49ae12":[41,1657],"9ff93289-f391-41aa-bdd1-d7d55637a9a2":[387,2435],"dee7ca71-0316-4254-a1db-6c8f79a6e380":[224,2474],"d9af39d6-f9ae-483d-ab1d-e48a026dfd53":[304,2442],"37fd270d-1dd5-4701-af07-f0ede1590069":[232,2450],"081ec673-aec2-4015-b711-4f88b2664914":[718,2442],"f7fa6d81-2872-4971-be81-42464b11ac9f":[316,425],"89fa1083-95bf-42e7-bd28-ad34740851cf":[634,2507],"cb7d55ac-702f-49ec-98f7-d2c8c8e62715":[227,1782],"91f9ac99-a4b2-4793-afba-5b7f79d72d54":[283,1837],"49839927-ee16-498b-80a8-f029627fd4c5":[131,1715],"51c5eb21-e534-4c5c-98e0-305c78721686":[311,379],"fa66de51-13bc-4088-8b94-942d33e525fc":[225,2465],"63806db3-12a1-4e83-b354-1ac4b44fcb2d":[260,979],"91b63ef1-7d4f-483a-a8ca-ed2a60b65e00":[324,2440],"67e04297-3a9a-4e41-808f-cae811d0680b":[60,1576],"ffe1a91f-de57-4ff0-9ad5-d32951851730":[99,1367],"7b053b2b-f6f9-4d2b-b897-e4f4b52f463a":[70,1679],"6347e27e-d7fe-45bd-9fb8-ff3d7557d100":[171,1303],"3308ac4a-f42c-4c44-938b-cccbebb21afc":[487,2441],"9efe4cc6-cb4a-4265-83c3-c710917810c1":[183,1804],"f1f7b723-5ae7-457f-a810-6d5ad1f43c23":[723,2435],"8c523fc0-993c-4e0e-9d29-755d7257be50":[559,2461],"f940e21f-3169-486c-9438-30dd3e503eb3":[314,1873],"4b7f7ece-a91f-4ef0-bd4f-f8f280a6b78a":[151,1795],"a9b0eada-8f04-4862-85aa-2892039baecd":[64,1554],"43290bbc-db7f-4b1e-9cb5-a51b644c0ca6":[278,214],"24ef6f3c-123f-4cda-9ed7-53b372fe4790":[76,1478],"97427a14-7439-4672-8589-9139d7cb5abe":[92,1368],"c4e37952-73a1-42b7-b36f-b4fd60291102":[198,1211],"23be37b8-dc27-4a24-b91f-a24e2dd76b3d":[341,539],"bdd9928f-c4b0-4e06-95b9-9ccead088030":[85,1461],"d298db41-b072-4fcb-9bbb-d6ad9c5bf1f0":[94,1695],"64b383cd-da9c-496c-bc43-77908e175f8d":[63,1571],"6116b10b-1e12-4d54-b9ce-86bb6792fa6b":[86,1693],"b543a3dd-bfe8-40d7-8d5e-2ac453daf76e":[123,1705],"7f17154c-8b05-4c15-82ae-d14dc121bc21":[104,1687],"4a454a94-b132-44dc-a15b-3733e85d52f2":[145,1798],"56c6175b-966c-4d7f-a459-9db79d78734c":[63,1682],"580c0d76-51d5-476b-94a4-31ce0435471b":[84,1692],"781cff5a-f003-4f55-a381-f9e94fd2bdc2":[248,1068],"5ed26c4c-0979-4497-a021-253ef66f6aeb":[51,1608],"f434fab5-7b9b-4587-8397-1614df91d007":[199,1200],"c0b66706-af15-47b5-adc4-6ff208c3b855":[249,1777],"6541d792-54dd-4b32-b89c-02ef4c7c9f90":[38,1637],"e3da620e-beaf-4a4a-80e3-d3f94c3a311e":[41,1674],"e927161a-02ad-4e1c-89f0-541a9e0d99ba":[548,2461],"4f522dae-6e43-4d05-b439-36c01909aa5e":[335,520],"2f8ed1a4-a6e6-4ced-bc7f-3986ce468221":[66,1683],"1da81451-1187-4895-8c9e-ddb4d58a2f82":[97,1691],"7b667795-a26d-459d-a543-553834f68914":[269,232],"0746921c-411a-46b6-a8a2-9df52412abee":[270,229],"98bb3a39-2cff-4041-bef4-8ae9ef322ab1":[298,823],"36eaa5a8-095d-443b-adf4-09ab24da88aa":[300,809],"4bca34ad-ea87-48bf-9e93-2e60ba80e687":[291,2253],"2dcab437-ca9b-44b2-9b4e-022bbad98cf0":[139,1734],"6013ec3e-6d45-4060-a59f-55952d81b191":[72,1490],"6210643d-f82a-458c-948e-7de143c49b55":[265,2375],"88102fe2-62d3-4721-a27a-bab4d2ffe15c":[281,2460],"d2e0de6e-e891-45a7-b2e2-c78441bdd3f6":[285,2460],"dde3f623-1fbf-4bcd-8e1d-0381f78b94ad":[299,2456],"a229d3bb-c089-45f9-82c6-31efc93122af":[330,2453],"2934e6c6-ef59-4172-b973-cd7936da3873":[396,2442],"619ef9eb-6f91-4cf1-9625-b4dbcf2dfd8b":[417,2449],"0d6e382a-d336-4e04-9448-05a7f7d39673":[457,2446],"7bd5d617-e577-4823-9269-d328d2631a20":[464,2450],"15aaafb9-4ae2-494f-bc72-9778158ac76b":[474,2457],"2af0d507-0af5-460b-aff2-b605eafa1f1b":[476,2457],"b507c2ca-9975-457e-aed9-cced33668edc":[501,2452],"a9704160-3d35-4ab7-942c-41599421f540":[511,2450],"319974fc-4030-4330-91ce-1685eaff5667":[516,2450],"3ce11a3d-c4cc-4cce-9abb-8b9e6ccf7b3e":[535,2456],"fba6e728-cb2f-41f6-b921-a6dba551fe7e":[561,2469],"771ff429-1b17-4e45-adff-5f3b3cdcc6e1":[564,2471],"34f62e39-b5b7-4540-bdcd-cd35d8972aa9":[571,2477],"53fe5a38-1a93-46d0-939e-eb08cd42ba68":[576,2480],"500bb1ab-5ec5-436d-b555-e48444ec548e":[631,2510],"23028eea-b000-45df-a625-a990cd2a53cc":[660,2485],"74de97fc-f3ff-4a28-a9b8-92517fa64eb9":[710,2451],"9e3a79be-222c-4b05-b90f-3ab4017857c8":[736,2429],"a6961662-b204-4fef-9916-c529f21a85e2":[750,2422],"bb37684d-b534-4914-9f11-09e66daed740":[786,2407],"4b3ec6e5-35f3-41d4-b6e8-3454cf3d601a":[269,244],"e7a9f6a0-35ee-4332-be39-a8d37c78fe3f":[321,470],"72084e6e-d230-428a-b053-9efadcbcf7fc":[340,533],"541f339e-9287-452d-80be-56e0ce86c70a":[346,564],"1bd1690d-613e-471d-aafd-c508b5d8eaa4":[345,572],"2016cd68-2f90-4c10-8c6b-30cd5562cede":[346,576],"88233a0a-3a55-4a95-9ff2-144f5459647c":[312,752],"e2ee3da8-358d-4b95-9d36-011d4f1de6d4":[263,1026],"e7b054de-28b8-444a-8aa6-6289678417e1":[258,1042],"b0010c2a-4024-442a-9509-38ef8dec73e2":[206,1178],"415fb78a-a6c5-40dd-98d9-563dfb337f5c":[202,1193],"1575a838-150e-4360-bbf9-37453dc0ca52":[175,1284],"1e7bcce8-d99c-437b-8ddb-b8ce0d811d01":[130,1342],"1841fa6a-f713-455a-8cec-2207abe40e02":[84,1389],"025349fa-956a-448e-ad3a-ff58cfacb514":[61,1538],"0947d29b-b01c-479a-ba28-98b72cd94ea7":[46,1619],"743712e3-2b1b-4f99-87b7-c68eea975e84":[233,1786],"0b50908b-fe98-4945-8374-1de9494e5c83":[252,1789],"87a70b78-c18b-4d6b-9381-3b306c75d08a":[298,1879],"7ef38114-8772-463d-ab1f-ec9ff6a39536":[299,1921],"7853505f-e1ff-4f21-8354-8e4982566c32":[297,1934],"40d75401-bc0e-42d0-b6b3-669d3dca265d":[286,1979],"355ab513-1b15-455d-8086-3a80000ee407":[137,1727],"3cd439e0-b726-44dd-a01c-6409f7bf0391":[134,1723],"1eea8666-dbde-4e31-9120-54dbeec9ac9b":[796,2407],"441cccc7-a339-4aee-8d56-a1f6ea55110f":[554,2464],"a3e5153c-c183-4f20-9956-f0778a0d4a9f":[635,2504],"ab40961d-ba81-4ff7-89c8-1fa587732736":[369,2435],"68c4ba70-f6b6-4c44-8987-8cf3b409c431":[261,1799],"44f4e2d5-5ac1-4a04-941c-a4b9c2363c67":[132,1720],"5b120139-4f37-47dd-8d50-5fb4ddd36b73":[267,2462],"bea66bea-81ab-4445-aa6d-22b3e550e899":[293,2457],"e57489e7-d222-43b6-ae14-24a234b01dc3":[118,1685],"3bb185de-eede-4a8e-b226-39dd3db5b786":[717,2446],"bea79a0d-6d7f-4862-b4cc-82160dfe4a3f":[274,2325],"5097bad4-6949-44f5-850c-a9247037b7d2":[656,2481],"9c523dc0-d6cd-4fe8-847c-cec4881d3e29":[255,2471],"9add8697-72c4-41b1-8b99-d1e8df418c11":[268,1804],"546c5b59-edfb-4b37-9fce-ec101c6e6e3e":[662,2474],"96f0a86a-bbcf-42df-83f2-21155e17fb6f":[281,2310],"98c701a2-5e43-4111-b2e8-0f92c26a1346":[127,1712],"56f1dd06-d13d-4b36-a1cd-88ba284f2393":[497,2451],"1baee7dc-bebd-4475-a12d-8c35fdcfdeec":[126,1344],"0901e8ca-9e6e-4836-a79c-f4d3d776217a":[75,1376],"7121018a-364b-4671-9553-a1485b172b25":[89,1396],"272691c6-2056-402d-820b-d6a150d524dc":[89,1448],"acdfa7d4-fae4-46fd-b173-6f9af62bec5d":[91,1427],"9e6005fe-7e8e-4f63-8fe7-6fe85ab3f618":[114,1354],"1434131a-a8f8-4a7f-bdd7-a7162b004448":[90,1442],"7b04f50d-d271-4ca3-8d11-0ce374c53561":[69,1495],"2173718e-68cd-474e-a67e-0861d13700be":[198,1204],"78e04293-478f-4902-b6d6-5162ae3bf6a8":[191,1234]};
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
      var n = { calm: 0, moderate: 0, rough: 0 }, at = '', isl = [], azo = [];
      all.forEach(function (b) {
        var s = sea[b.id]; if (!s || s.w == null) return;
        n[window.LiveCoast.level(s.w)]++; at = at || s.at;
        if (b.lng < -24) azo.push(s); else if (b.lng < -12) isl.push(s); // Acores / Madeira: cartoes proprios
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
      [['islands', isl], ['azores', azo]].forEach(function (x) {
        var l = x[1]; if (!l.length) return;
        var t = l.filter(function (s) { return s.t != null; }), avg = t.length ? Math.round(t.reduce(function (a, s) { return a + s.t; }, 0) / t.length) : null;
        set(x[0], l.length + ' ' + T.beaches + (avg != null ? ' · ' + T.water + ' ' + avg + ' °C' : '')); card(x[0]);
      });
      root.classList.add('is-live');
      requestAnimationFrame(leaders);
    });
  }

  var started = false;
  function start(list) {
    if (started || !list || !list.length || !window.LiveCoast) return; started = true;
    set('n', String(list.length)); // numero de praias sempre igual ao da BD (o HTML so tem um valor de recurso)
    window.LiveCoast.setBeaches(list).then(function (l) { draw(l); colour(l); });
  }
  window.addEventListener('resize', function () { requestAnimationFrame(leaders); });
  var img = root.querySelector('.bh4__relief'); if (img && !img.complete) img.addEventListener('load', function () { requestAnimationFrame(leaders); });
  document.addEventListener('pth:beaches', function (e) { start(e.detail); });
  if (window.__pthBeaches) start(window.__pthBeaches);
  setTimeout(function () { if (!started && window.LiveCoast) window.LiveCoast.beaches().then(start); }, 6000);
})(window, document);
