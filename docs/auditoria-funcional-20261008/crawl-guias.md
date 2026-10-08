# Auditoria funcional: crawl do sitemap + guias, onde ficar, aluguer de carro, escondidas

**Área:** crawl-guias · **Data:** 08/10/2026 · **Site:** https://www.portalturismoportugal.com (produção)
**Método:** Playwright/Chromium (`service_workers='block'`) a 1280x900 e 375x812 (com `is_mobile`), e 320x640 nos ecrãs-chave. Fiz também um crawl HTTP com requests e BeautifulSoup para os metadados e os links. Só leitura: não submeti nenhum formulário.
**Screenshots:** `/mnt/user-data/outputs/audit/shots/crawl-guias/`

---

## 1. Achados

| id | sev | página/URL | ecrã | o que o utilizador vê | como reproduzir | evidência |
|---|---|---|---|---|---|---|
| CG-01 | **P0** | `/` e `/en/` (homepage) | 1280 / 375 | Os links de alojamento da homepage abrem a Booking.com **sem qualquer ID de afiliado**. São eles "Hotéis perto" no painel da costa ao vivo e o cartão "01 · ALOJAMENTO · Hotéis costeiros · VIA BOOKING" (em EN, "Coastal hotels"). Cada reserva feita a partir da página mais visitada não gera receita. | Abrir `/` e inspecionar `a[href*=booking.com]`: o href é `https://www.booking.com/country/pt.pt-pt.html` e `.../searchresults.pt-pt.html?ss=Praia%20da%20Ribeira%20Brava...`. Mesmo depois de um mousedown real, o href continua igual. A homepage (PT e EN) não carrega `scripts.stay22.com/letmeallez.js` nem `/js/affiliate.js` (`typeof Stay22 === 'undefined'`). | Em 2 execuções por página: `/ [2 links booking, 0 com aid=kaptarstudio, Stay22 undefined]` e `/en/ [2, 0, undefined]`. A lista de `<script src>` da home não inclui o Stay22. |
| CG-02 | **P1** | 101 de 102 páginas `/en/*` (todas exceto `/en/surf-schools`) | 1280 / 375 / 320 | O banner de cookies aparece **em português** a quem visita em inglês: "Usamos cookies para analisar o tráfego do site. Saber mais · Aceitar · Rejeitar · Personalizar", com o painel "Cookies essenciais… Guardar preferências". Além disso, "Saber mais" leva a `/cookies.html` em PT, e não a `/en/cookies`. É a primeira coisa que um turista estrangeiro vê, e a 375 ocupa cerca de um terço do ecrã. | Abrir qualquer página `/en/` numa sessão nova, por exemplo `/en/guides` ou `/en/where-to-stay-algarve-beach`. O texto está fixo em `/js/cookie-consent.js` (buildBanner), sem ramo de língua, e o `aria-label` é "Preferências de cookies". | `shots/crawl-guias/v_en_guides_375_0.png`, `p2_en_where_to_stay_algarve_beach_375_top.png`. Contagem: 101/102 páginas EN carregam `cookie-consent.js`. |
| CG-03 | **P1** | `/escondidas` e `/en/hidden-beaches` | 375 / 320 | O único cartão "disponível" da página (Nº 01 · Praia da Samoqueira) aparece partido no telemóvel. O badge estica-se e deixa um bloco branco enorme, e o texto (região, título, descrição, "Ler guia completo") fica empurrado para fora do cartão, cortado a 2 ou 3 letras por linha ("ALE / SIN / Pr / Sa / Ens…"). É o conteúdo principal da página e fica ilegível. | Abrir `/escondidas` a 375 e descer até "Praia disponível agora". O `a.beach-card-live` tem `display:flex` em linha. O `.beach-card-live-badge` fica com 228 px de largura e o `.beach-card-live-body` começa em x=317 com 107 px de largura, fora do cartão, que acaba em cerca de 325. A 1280 está correto. Clicar no cartão leva bem a `/escondidas/praia-da-samoqueira`. | `shots/crawl-guias/clean_escondidas_320.png`, `p2_escondidas_375.png`, `escondidas_card_1280.png` (comparação com desktop) |
| CG-04 | **P1** | `/praias-algarve`, `/praias-perto-lisboa`, `/praias-para-surfistas-iniciantes-portugal` (estão no sitemap) | todos | A página abre e salta logo para outra através de JS (`location.replace('/guias/….html')`), que por sua vez faz mais um 308 para a URL sem `.html`. O botão "voltar" funciona porque é `replace`. Para SEO, as 3 URLs estão no sitemap com HTTP 200, `canonical` para si próprias e `index, follow`. O destino também está no sitemap. Resultado: 3 pares de títulos duplicados e cadeias de redirecionamento por JS. | `curl -I /praias-algarve` dá 200. O HTML contém `location.replace('/guias/melhores-praias-algarve.html')` e `<link rel=canonical href=".../praias-algarve">`. No browser, a URL final é `/guias/melhores-praias-algarve`. | Crawl Playwright: `REDIR /praias-algarve -> /guias/melhores-praias-algarve` (3 casos), mais os títulos duplicados indicados em CG-09 |
| CG-05 | **P1** | `/en/guides` (hero) | 1280 / 375 | O hero diz "**10+ guides**", mas o hub mostra **7** cartões. Em PT o hub tem 6 cartões e não mostra esse contador. O número não corresponde ao que o utilizador encontra. | Abrir `/en/guides` e contar os cartões (7). | `shots/crawl-guias/v_en_guides_375_0.png`. Os dados em `webcams-guias-data.js` têm `GUIA_CARDS.en` com 7 entradas. |
| CG-06 | P2 | `/guias` e `/en/guides` (bloco GetYourGuide) | 375 / 320 | No cabeçalho do widget, a etiqueta "CURATED" fica sobreposta ao texto "Reserva instantânea via GetYourGuide" / "Instant booking via GetYourGuide" (as letras ficam encavalitadas). Na página PT a etiqueta está em inglês ("CURATED"). O widget em si carrega bem e com `partner_id=0WTBHZE`. | Abrir `/en/guides` a 375 e descer até "Experiences we recommend". | `shots/crawl-guias/gygblock_en_guides_375.png` e `gyg_guias_1280.png` (PT com "CURATED") |
| CG-07 | P2 | `/guias/praias-perto-lisboa` (e `/praias-perto-lisboa`, que redireciona para lá) | 1280 / 375 | A foto da Praia do Guincho (Unsplash `photo-1484821582734-6692f3af11c5`) dá **404**. Durante os primeiros segundos o cartão fica com a imagem partida, até o `autoFixImage` a trocar por uma foto da Pexels. No crawl, 2 a 3 s depois do scroll, ainda estava partida. Não é a foto de surf que já se conhece; esta é nova. | `curl` à imagem dá 404. No browser aparece `net::ERR_BLOCKED_BY_ORB`. Ao fim de cerca de 6 s o `currentSrc` passa a `images.pexels.com/photos/4135231/…`. | Crawl: `broken imgs 1 (1280) / 2 (375)`. `shots/crawl-guias/guincho_card_1280.png` (já com o fallback) |
| CG-08 | P2 | `/guias/alugar-carro-algarve` (caixa do autor) | 320 | A caixa "Ricardo Barbosa" fica com a foto centrada à esquerda e uma coluna de texto muito estreita (1 ou 2 palavras por linha, cerca de 25 linhas). Visualmente fica desequilibrada. | Abrir a 320 e descer até ao fim do artigo. | `shots/crawl-guias/clean_guias_alugar_carro_algarve_320.png` (último terço) |
| CG-09 | P2 (SEO) | sitemap / `<title>` | — | Há títulos duplicados entre PT e EN: `/praias/meia-praia/` e `/en/praias/meia-praia/` ("Meia Praia · Portal Turismo Portugal"), o mesmo para `costa-de-caparica` e `lagoa-de-albufeira`. As páginas EN destas 3 praias não têm título em inglês. Há ainda 3 duplicados vindos de CG-04. | Ver o `<title>` das duas versões. | crawl estático e crawl renderizado |
| CG-10 | P2 (SEO) | `sitemap.xml` | — | Faltam no sitemap páginas indexáveis (200, `index,follow`) que têm links no menu ou no rodapé: **`/en/guides`** (o hub EN; o PT `/guias` está lá), `/en/about`, `/en/methodology`, `/en/transparency`, `/cookies`, `/en/cookies`, `/refund-policy`, `/en/refund-policy`. Também não há sitemap aninhado. A maioria das entradas tem `lastmod` 2026-04-07 (as do aluguer de carro têm 2026-10-05). | Comparar as 208 `<loc>` com os links internos que respondem 200. | lista no ponto 3 |
| CG-11 | P2 (SEO) | `/escondidas` e `/en/hidden-beaches` | — | As páginas-hub das praias escondidas têm `<meta name="robots" content="noindex">`, mas as filhas (`/escondidas/praia-da-samoqueira` e a versão EN) estão no sitemap e são indexáveis. Pode ser intencional enquanto só há 1 praia publicada (**a confirmar**). | `curl /escondidas \| grep robots` | — |
| CG-12 | P2 (SEO) | hreflang | — | Há 4 pares hreflang **não recíprocos**. `/surf-portugal` aponta `en` para `/en/surfing-portugal`, mas esta declara `pt` igual a `/surf`. `/praias-surf-iniciantes-algarve` aponta `en` para `/en/beginner-surf-beaches-algarve`, que declara `pt` igual a `/praias-para-surfistas-iniciantes-portugal` (uma página que redireciona por JS, ver CG-04). `/en/best-beaches-portugal` não tem hreflang nenhum. Nenhum alvo hreflang dá 404: 211 alvos verificados, todos 200. | Ler os `<link rel=alternate hreflang>` dos dois lados. | script `check_links`, saída "4 issues" |
| CG-13 | P2 (SEO/perf) | todas as 208 páginas (menu e links internos) | — | O menu principal e muitos links internos apontam para `*.html` ou para `/praias/<slug>` sem barra final. Isso dá **225 destinos internos que respondem 308** antes da página final (por exemplo `/beaches.html` → `/beaches`). Não há 404, mas cada clique no menu faz um redirect a mais. | Inspecionar o menu (`/beaches.html`, `/surf.html`, `/guias.html`…). | `linkstatus.json`: 225 destinos redirecionados, presentes nas 208/208 páginas |
| CG-14 | P2 | `/escondidas` (hero) e `/en/hidden-beaches` | todos | O CTA principal diz "Ver a **Praia Piloto**" / "See the **Pilot** Beach", que é jargão interno. O título promete "As 10 praias…", mas só 1 está disponível: as Nº 08–10 aparecem como "Em investigação · A confirmar". Pode frustrar quem chega pelo título. | Abrir `/escondidas`. | `shots/crawl-guias/clean_escondidas_320.png` |
| CG-15 | P2 | `/webcams` | 1280 | O link de privacidade aponta para `/privacy`. É servido com 200 e tem canonical para `/privacidade`, mas é uma URL duplicada. É a única página que usa este link. | Ver o link no `/webcams`. | `static.json`: `/privacy` com link apenas a partir de `/webcams` |
| CG-16 | P2 (a confirmar) | `/surf`, `/en/surf`, `/webcams`, `/en/pesca`, `/webcam-praia-da-luz` | 1280 / 375 | O Open-Meteo respondeu **429 Too Many Requests**, seguido de erros CORS na consola. Os dados de condições podem não carregar nessas visitas. É **a confirmar**: vários agentes de auditoria saem pelo mesmo IP ao mesmo tempo, por isso pode ser efeito do teste. Mesmo assim, mostra que a página não tem defesa (cache/retry) contra rate-limit. | Crawl sequencial. Os erros só aparecem nestas páginas. | consola: `Failed to load resource: 429 (Too Many Requests)` (5 a 1280, 7 a 375) |

**Conhecidos vistos (não contados acima):**
- `supabase is not defined` em 120 páginas `praias/<slug>/` e `en/praias/<slug>/` (os 60 pares PT/EN, em ambos os ecrãs) [conhecido]
- foto do guia de surf Unsplash `photo-1502680390548` com 404 (em `/guias`, `/guias/surf-portugal-iniciantes` e `/praias-para-surfistas-iniciantes-portugal`; a 1280 o cartão do hub fica sem imagem) [conhecido]
- marca "Portugal Travel Hub" no header e no footer [conhecido]

**Ruído do ambiente de teste (não são bugs do site):** `affiliate.amazon.es` e `z-eu.amazon-adsystem.com` são recusados pelo proxy do contentor. O Turnstile da Cloudflare (`challenges.cloudflare.com` 401, `%c%d … NaN` na consola) também é bloqueado pelo proxy, por isso o espaço vazio por baixo do campo de email em `/escondidas` (widget Turnstile) fica **a confirmar** num browser normal. Houve ainda pedidos GA e Stay22 `flags` abortados. Numa execução, `/en/where-to-stay-northern-portugal-beaches` a 1280 ficou com 8 links booking.com crus porque o `letmeallez.js` não chegou a carregar; em 6 repetições seguintes ficou sempre 8/8 com `aid=kaptarstudio`. Isto mostra que, se o script da Stay22 falhar (por exemplo com um bloqueador de anúncios), os links ficam sem nenhum ID de fallback.

---

## 2. Resumo do crawl do sitemap (208 URLs × 2 ecrãs = 416 carregamentos)

| verificação | resultado |
|---|---|
| Sitemaps aninhados | nenhum (1 `urlset` com 208 `<loc>`, 102 EN e 106 PT) |
| HTTP status | 208/208 com 200, sem redirects HTTP. Há 3 redirects por JS (CG-04) |
| `pageerror` | só `supabase is not defined` (120 por ecrã) [conhecido] |
| Erros de consola | Open-Meteo 429/CORS (CG-16), ruído Turnstile/Amazon. Nada mais |
| Violações de CSP | **0** |
| Pedidos falhados (≥400 / requestfailed), sem contar ruído | Open-Meteo 429 (5–7), Unsplash 404 Guincho (CG-07) e surf [conhecido], vídeo do hero abortado (`homepage-hero-*.mp4`, aborto normal de troca de fonte) |
| Imagens partidas | 1 (1280) / 2 (375): Guincho (CG-07) |
| Scroll horizontal | **0** a 1280 e 0 a 375. CG-03 não aparece aqui porque o cartão tem `overflow` cortado em vez de criar scroll |
| `<title>` em falta / múltiplo | 0 / 0. Duplicados: 6 pares (CG-09 e CG-04) |
| Meta description em falta / duplicada | 0 / 0 |
| Canonical a apontar para outra URL | 0 (todas self-canonical; o problema é CG-04) |
| Páginas do sitemap com noindex | 0 (mas o hub `/escondidas` é noindex: CG-11) |
| `html lang` errado | 0 (PT `pt-PT`, EN `en`) |
| H1 ≠ 1 | `/shapers-portugal/` e `/en/shapers-of-portugal/` têm 2 H1 iguais (P2, mesmo texto repetido) |
| hreflang | 207/208 páginas com hreflang. 211 alvos, todos 200. 4 pares não recíprocos (CG-12) |
| Links internos | 535 únicos, mais os alvos hreflang: 580 verificados uma vez cada. **0 com 404 real.** O único 404 estático é `/cdn-cgi/l/email-protection` (ofuscação de email da Cloudflare), que no browser é descodificado: 0 links destes no DOM renderizado, por isso está OK. 225 destinos com 308 (CG-13) |
| Links de parceiro no DOM renderizado | DiscoverCars: todos com `a_aid=portalturismoportugal`. GYG: widgets com `partner_id=0WTBHZE`. Amazon: `tag=pthportugal-21`. Stay22: `aid=kaptarstudio`. Booking.com cru: **homepage PT/EN (CG-01)**. Em `/en/beaches` alguns links aparecem crus depois de carregar (490/523), mas são reescritos no mousedown, portanto OK. BookSurfCamps não aparece nestas páginas |
| Páginas lentas (`load` > 15 s, com contentor carregado) | `/beaches` 26,6 s, `/surf` 24,9 s, `/webcams` 18,6 s a 1280 (só indicativo: várias auditorias corriam em paralelo) |

Páginas indexáveis com links internos mas fora do sitemap: `/en/guides`, `/en/about`, `/en/methodology`, `/en/transparency`, `/cookies`, `/en/cookies`, `/refund-policy`, `/en/refund-policy`, e `/privacy` (duplicado de `/privacidade`).

---

## 3. Testado e OK (cobertura)

**Hub de guias `/guias` e `/en/guides` (1280/375/320)**
- 6 cartões PT e 7 EN, todos com título, descrição, tempo de leitura e imagem (exceto o surf [conhecido]).
- Cliquei em cada cartão nos dois ecrãs (26 cliques): todos abrem a página certa (HTTP 200, H1 correspondente).
- Badge **NOVO/NEW**: aparece só no guia mais recente ("Alugar Carro no Algarve" / "Car Hire in the Algarve", publicado a 2026-10-05, dentro dos 30 dias), como manda a lógica de `webcams-guias-page.js`.
- **Não há filtros** no hub: não existe nenhum botão, chip ou select no `<main>` das duas páginas, logo não há nada para testar. Os filtros por chips estão em `/webcams`.
- Widget GYG carrega 3 experiências com `partner_id=0WTBHZE` e `cmp=pthalgarvept`/`pthalgarveen`. O frame tem conteúdo também a 375; o branco que aparece no screenshot de página inteira é um artefacto do screenshot.
- Sem scroll horizontal, sem erros JS.

**Guias individuais (13 páginas × 1280/375)**
- PT: melhores-praias-algarve, alugar-carro-algarve, surf-portugal-iniciantes, pesca-portugal, praias-perto-lisboa, quando-visitar-portugal.
- EN: best-beaches-portugal, car-hire-algarve, algarve-beaches, surfing-portugal, beaches-near-lisbon, family-beaches-algarve, hidden-beaches-algarve.
- Todas com 200 e H1 único, sem texto "undefined/NaN/null", sem scroll horizontal, sem texto PT nas EN (fora o banner de cookies, CG-02).
- Link DiscoverCars do rodapé com `a_aid`.
- Observação (não é bug): estes guias editoriais não têm links de alojamento (Stay22) nem GYG no corpo; o único link de parceiro é o do rodapé.

**Onde ficar: 7 PT (`onde-ficar-*`) e 7 EN (`where-to-stay-*`) × 1280/375**
- Todas as 14 páginas com 200 e H1 correto.
- 6 a 9 links de hotel por página, todos já reescritos pela Stay22 para `stay22.com/allez/booking?aid=kaptarstudio&campaign=portalturismoportugal-<página>…`. O `dispatch mousedown` e um **mousedown real** (rato premido e largado fora do link) confirmam o `aid=kaptarstudio`.
- 2 links DiscoverCars por página, todos com `a_aid=portalturismoportugal` (`/pt/portugal/faro` e `/portugal/faro`).
- FAQ (acordeões) abre e mostra a resposta (`aria-expanded` passa a true, altura entre 163 e 187 px).
- Sem erros JS, sem imagens partidas, sem scroll horizontal. Sem texto PT nas EN, exceto o banner (CG-02).

**Aluguer de carro `/guias/alugar-carro-algarve` e `/en/car-hire-algarve` (1280/375/320)**
- 3 links DiscoverCars por página, todos com `a_aid=portalturismoportugal`. O CTA final "Comparar preços em Faro" / "Compare" leva a `/pt/portugal/faro` e `/portugal/faro`.
- FAQ `<details>`: as 5 perguntas abrem (texto cresce entre 100 e 186 caracteres).
- Botão "Onde ficar no Algarve" com link interno válido.
- Sem erros, sem scroll horizontal. Data "Atualizado: 5 de outubro de 2026" coerente com o sitemap.

**Escondidas `/escondidas`, `/en/hidden-beaches` e `/…/praia-da-samoqueira` (1280/375/320)**
- 200, CTA do hero faz scroll para `#samoqueira`, o cartão abre a página da praia certa.
- A página da Samoqueira (PT/EN) tem 200, H1 correto, créditos Wikimedia/CC visíveis e link DiscoverCars com `a_aid`.
- Formulário "Quero ser avisado": não submeti (regra de só leitura).

---

Ficheiros de trabalho (dados brutos) em `/tmp/claude-0/-home-claude/d04a5ac2-2610-571e-943c-ab37ce37db36/scratchpad/` (`pw_1280.jsonl`, `pw_375.jsonl`, `cg/static.json`, `cg/linkstatus.json`, `cg/p2_*.json`, `cg/hub.json`).
