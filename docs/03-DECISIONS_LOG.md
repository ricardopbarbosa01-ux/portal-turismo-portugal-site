## AD-20260528-02 — Congelar monetização durante subsídio de desemprego

**Data:** 28/05/2026 · **Status:** Activa · **Relaciona:** AD-20260525-01 (resolve a decisão pendente)

**Contexto:** Sem processador MoR aprovado (LemonSqueezy morto, Paddle rejeitado, Polar.sh inviável por componente B2B/directory). Abrir actividade — mesmo ENI — durante o subsídio de desemprego arrisca o subsídio. Medida IEFP "criar emprego" já usada, não repetível.

**Decisão:** Congelar monetização durante o subsídio (+6 meses). Usar a runway financiada para construir tráfego + base de parceiros (grátis, sem cobrança). Monetizar no fim, via ENI, sobre activo já pronto.

**Racional:** Bloqueador real = tráfego, não checkout. 6 meses resolvem o bloqueador real sem pressão de receita imediata.

**Trade-offs:** Pro consumer e B2B pago suspensos no período. Afiliações (GYG, Amazon) não afectadas.

**A confirmar:** regras de acumulação do subsídio com IEFP antes de qualquer passo.

**Reavaliar:** retrospectiva 04/06/2026 + fim do período de subsídio.

---

## AD-20260528-01 — Supabase hardening

**Data:** 28/05/2026 · **Status:** Activa

**Contexto:** Advisor reportava 18 warnings. Data API deprecation (30/10) não afecta PTH — tabelas existentes mantêm grants.

**Fixes aplicados:**
- REVOKE EXECUTE FROM PUBLIC nas 4 funções SECURITY DEFINER (revoke de anon/authenticated não chega — grant vem de PUBLIC).
- Bucket `card-images` restringido via `storage.allow_only_operation('object')`.
- `search_path` fixado nas funções.
- 13 tabelas com RLS via event_trigger `rls_auto_enable`.

**Resultado:** 18 → [4 ou 7?] warnings, 0 errors.

**Crítico:** `invoke_edge_function` usa vault+net; `search_path=''` parte-a. Usar `search_path = public, vault, net, pg_catalog`.

**Pendente:** Leaked Password Protection toggle (dashboard, opcional).

---

## AD-20260527-03 — SUPA Albufeira #7 Essential + override AD-20260526-01b

**Data:** 27/05/2026 · **Status:** Activa · **Commit:** `02637a3` (feature) → merge `ddda369`

**Contexto:** 7º Essential. Tiago Dinis, NIPC 513382550, RNAAT 133/2015 (fundada 2015). Google 4.9★/112 (Praia da Galé). `info@supalbufeira.com`. Tel +351 967 920 630 (Tiago) + +351 965 894 335 (surf). Multi-actividade SUP+SURF+KAYAK, posicionado como surf school.

**Override AD-20260526-01b:** logo azul-escuro de marca clareado para cinza-azul, para visibilidade sobre logo-area navy. Brand modificado sem autorização explícita do Tiago Dinis.

**Padrão:** TSE + SUPA = card v2 logo-area navy força modificação de brand (2.º e 3.º casos).

**Reavaliar (04/06):** pedir SVG dark-bg-friendly sistematicamente OU variante CSS para fundo claro do logo-area.

---

## AD-20260527-02 — Salty Wave Algarve + Porto #5 + #6 Essential

**Data:** 27/05/2026 · **Status:** Activa · **Commits:** `5d77b70` + `97699c8`

**Contexto:** Brand unificado, fundado 2004 por Rodrigo "Godzilla" Lacerda. Algarve: TA 4.9★/430, #3/30 Lagos. Porto: Google 4.8★/46. Logo azul+laranja transparente 92% sobre navy — contraste forte, sem o problema do TSE.

**Notas técnicas:**
- Slug `matosinhos` não existe em `beaches-master.json` (repete `porto-de-mos` do TSE).
- Injection pages `max_cards=3` saturadas (6+ parceiros agora).

**Reavaliar:** expandir `beaches-master.json` (slugs falhados: porto-de-mos, matosinhos, praia-da-amoreira). Aumentar `max_cards`.

---

## AD-20260527-01 — TSE The Surf Experience #4 Essential + 3 overrides §1

**Data:** 27/05/2026 · **Status:** Activa · **Commit:** `0e8e3a4` · **Deploy:** `1bb5c84c`

**Contexto:** 4º Essential. Lagos, fundado 1995. Google 4.8★/234 + TA 4.8 #3/60. EN+DE only. Contactos Micky/Kimi. NIF 508510287. Autorização editorial por email 27/05. Praias: meia-praia, praia-da-luz, praia-do-amado (porto-de-mos não existe em beaches-master.json).

**Logo (documentado):** PNG fundo off-white sólido (#f6f4ef) cria moldura branca no logo-area navy (outros 3 têm fundo transparente). Texto "TSE.SURF" preto inviabiliza versão transparente sobre navy. **Decisão:** aceitar v3 actual; pedir SVG/fundo escuro a Micky/Kimi. Logo paisagem 2.36:1 ocupa ~40% altura vs 80-85% dos outros — GO consciente.

**3 overrides ao limiar §1 PARTNER-ONBOARDING:**
- Amado 4.3★/206 (rating abaixo do mínimo)
- Original 5.0★/24 (volume abaixo de 30)
- Amoreira 5.0★/16 (volume = metade do limiar)

*(Verificar a que candidatos exactos se referem — reconstruído de memória.)*

**Padrão:** 3 overrides/sessão sugerem §1 mal calibrado (mínimos rígidos separados de rating e volume).

**Reavaliar (04/06):** regra de compensação volume+rating em vez de mínimos rígidos, OU reduzir limiar de reviews para 15.

## AD-20260526-06 — Logo Albufeira Surf & SUP: processamento PNG + máscara SVG

**Data:** 26/05/2026 · **Status:** Activa · **Commit:** `52bb120`

**Contexto:** 3º parceiro Essential entrou em produção (`70c22d5`) mas com logo demasiado pequeno (~15% do canvas vs ~85% Good Feeling/Future Eco). Ricardo detectou após chegar a produção. Aceitar "está óptimo" sem inspecção visual lado-a-lado foi falha raiz.

**Tentativas falhadas (Pillow puro):**
- v2 (deployed): scale errado, logo a 15% do canvas
- v4: flood fill threshold restritivo preservou borda mas dentes JPEG visíveis
- v6: redraw circle perfeito mas "ALBUFEIRA" exterior perdido (RGB do anti-alias < threshold)

**Solução final (`v3` em commit `52bb120`):** abordar com source correcta + ferramenta adequada:
- Source: PNG oficial do parceiro (`LOGO_WEB.png`, 150×150 PNG) em vez do JPEG 252×254 comprimido
- Processamento: `sharp` lanczos3 upscale + máscara SVG circular (não pixel-a-pixel)
- Output: 518×518 RGBA, ~85% canvas, borda matematicamente perfeita, "ALBUFEIRA" + "SURF & SUP" preservados

**Lição raiz:** Antes de processar imagem, interrogar a fonte. PNG > JPEG para round-trip de processamento. Se há múltiplos ficheiros (LOGO_WEB.png vs JPEG anexado), perguntar qual usar.

**Cache bust:** `?v=20260526-logo-v3` na URL Supabase (CDN respeita query strings).

**Trade-offs:** 3 deploys gastos (v2 deploy → fix → v3). Custo evitável se AD-20260526-01b tivesse sido aplicada ao primeiro upload.

**Reavaliar:** próximos onboardings pedem logo SVG/vectorial directamente ao parceiro no email inicial, evitando round-trips de processamento de raster.

---

## AD-20260526-05 — Hash auto-open accordion em vitrines parceiros

**Data:** 26/05/2026 · **Status:** Activa · **Commit:** `71a01b0`

**Contexto:** Outreach a parceiros inclui links como `/escolas-de-surf#good-feeling-surf-school` como exemplo. Sem fix, visitante chega ao card mas accordion não auto-expande — UX confusa, exemplo perde força persuasiva.

**Decisão:** `js/partners-directory.js` ganha `openCardByHash()` registado em 2 events (DOMContentLoaded + hashchange). Após open, scroll suave para corrigir layout shift pós-expand.

**Race condition encontrada e resolvida:** `applyFilters() → writeURLState() → history.replaceState(null,'','/escolas-de-surf')` strippava o hash antes do `openCardByHash()` correr. Fix: capturar `_startHash = window.location.hash` antes de `init()` e passar explicitamente.

**Smoke test:** 4 testes Playwright (load com hash + hashchange enquanto na página + EN + regressão E1 drawer). 4/4 ✓ local + 2/2 ✓ produção.

**Aplicação:** todos os outreach futuros podem usar âncoras directas para mostrar exemplos vivos a partir de agora.

**Trade-offs:** 5 linhas JS adicionadas a um ficheiro JS já complexo (`js/partners-directory.js`). Risco baixo, isolado em função própria.

---

## AD-20260526-04 — 3 bugs CSS directory + 4 bugs drawer/toolbar/rating/font-display

**Data:** 26/05/2026 · **Status:** Activa · **Commits:** `6466997` + `3921884`

**Contexto:** Audit mobile descobriu 3 bugs cosméticos pré-existentes do redesign vitrines 25/05 (AD-20260525-02). Ricardo confirmou também 4 problemas adicionais após primeiro deploy — descobertos por hit-test real, não capturados por `Playwright.click()` programático.

**Bugs e fixes:**

| Bug | Causa raiz | Fix |
|---|---|---|
| D1 Botão "Filtros (2)" com gaps anómalos | `gap:8px` flexbox criava espaços entre text nodes `(`, span `2`, `)` | Wrap todo em `<span class="pd-filter-label">` |
| D2 `.pd-row__chips` font-family errada | Sem declaração explícita, herdava Inter do body | `font-family: 'Bodoni Moda', Georgia, serif` |
| D3 Badge TripAdvisor overflow | `white-space:nowrap` + texto longo excedia card mobile | `white-space:normal` + `font-size:0.75rem` + `max-width:100%` |
| E1 Drawer fecha ao tap em checkbox | `.pd-drawer__backdrop` era filho do `.pd-drawer` com `overflow:auto` (containing block restringia o `position:fixed`) | Mover backdrop para FORA do drawer (sibling no DOM) |
| E2 Botão Filtros desalinhado | `.pd-mobile-filters-btn` fora de `.pd-layout`, perdia padding lateral | Wrapper `.pd-toolbar` dentro de `.pd-layout` agrupa btn + count + active-filters |
| E3 `.pd-row__chips` font-size 16px | Sem declaração, herdava do body (invertia hierarquia visual vs `.pd-row__name` 14px) | `font-size:12px; font-weight:400; line-height:1.4` |
| E4 Bodoni Moda fallback permanente | Google Fonts `display=optional` dava ~100ms timeout window, browsers usavam Georgia se webfont não estivesse em cache | `display=optional` → `display=swap` em 10 ficheiros HTML |

**Lição operacional crítica:** smoke test com `Playwright.click()` programático não faz hit-test visual → bypassa overlays/backdrops. **Para testar UX real mobile, usar `Page.tap()` com `hasTouch: true` + `isMobile: true`**. Adoptado a meio da sessão como gap-fix de AD-20260526-01.

**Cache busting:** `partners-directory.css?v=20260526-v2` → `v3`.

**Smoke test:** 22/22 ✓ local + 22/22 ✓ produção (PT + EN, mobile 412×915 Android UA).

---

## AD-20260526-03 — Bug C: en/404.html + redirects /en/partners

**Data:** 26/05/2026 · **Status:** Activa · **Commit:** `c74dddb`

**Contexto:** Audit mobile inicial reportou `/en/partners.html` em produção a servir nav PT com apenas 3 items mobile. Investigação revelou que era misdiagnóstico — o problema real era diferente:

**Causas raiz reais (2 gaps separados, não 1 misconfig Cloudflare):**
1. URL `/en/partners.html` nunca existiu no repo (zero referências internas — provavelmente crawler externo a procurar slug PT em EN)
2. Único ficheiro `404.html` PT-only — visitantes EM URLs `/en/*` inválidas viam página 404 em português

**Decisão (Ricardo escolheu "Ambos"):**
- `en/404.html` novo (script reutilizável `_scripts/build-en-404.py`, idempotente, hashes sha256 confirmam, 19 links footer adaptados PT→EN com slugs corretos)
- 2 redirects em `_redirects` (Cloudflare Pages):
  - `/en/partners.html → /en/parceiros (308)`
  - `/en/partners → /en/parceiros (308)`

**Script `_scripts/build-en-404.py`:** lê `404.html` PT, aplica mapa de substituições (textos PT→EN, hrefs com prefixo `/en/`, slug map para divergências como `guias→guides`, `sobre→about`, `privacidade→privacy`, `metodologia-editorial→methodology`, `transparencia-comercial→transparency`), gera `en/404.html`. Reutilizável: se `404.html` PT mudar no futuro, basta correr de novo.

**Lang switcher:** swap estrutural `<span>↔<a>` (PT activo span → PT link a, EN link a → EN activo span). String-replace frágil ao whitespace mas aceitável para 1 ficheiro único.

**Meta robots `noindex, nofollow`** replicado do PT.

**Trade-offs:** 4 deploys nesta área (Bug A 1+1 + Bug B 1 + Bug C 1). Limite 5/sessão mantido aqui.

---

## AD-20260526-02 — Fix nav.js `.pth-dd` dual selector

**Data:** 26/05/2026 · **Status:** Activa · **Commit:** `6b59132` (merge Bug B)

**Contexto:** Após fix Bug A (99 ficheiros nav `</div></div>` extras), audit mobile mostrou que dropdown "Escolas de Surf" / "Surf Schools" continuava ausente do menu hambúrguer mobile. Diagnóstico: `nav.js:67` só processava elementos com class `.nav-dropdown`, ignorando `.pth-dd` (nova classe introduzida no redesign Shapers de 19/05).

**Decisão:** dual selector em 3 pontos da função `buildMobileMenu()`:
- Condição `classList.contains('nav-dropdown')` → `(...) || classList.contains('pth-dd')`
- `querySelector('.nav-dropdown__featured')` → `('.nav-dropdown__featured, .pth-dd__featured')`
- `querySelector('.nav-dropdown__featured-title')` → idem dual selector

**Padrão já existente em `nav-dropdown.js`** (consistência interna — `.pth-dd__trigger, .nav-dropdown__trigger`). Sem impacto CSS (`.mobile-menu a` cobre automaticamente).

**Smoke test:** 6/6 ✓ pre-commit + 6/6 ✓ produção. Menu mobile completo: Praias, Surf, Pesca, Webcams, Planear, Guias, Preços, **Escolas de Surf**, Para o seu Negócio.

---

## AD-20260526-01b — Smoke test visual obrigatório para assets (extensão a AD-20260526-01)

**Data:** 26/05/2026 · **Status:** Activa

**Contexto:** Logo Albufeira Surf & SUP foi deployado em `70c22d5` com ~15% de ocupação do canvas vs ~85% dos outros parceiros. Ricardo detectou após chegar a produção. Aceitar "confirmado OK visualmente" sem Claude ver o ficheiro foi falha raiz. Sanity checks numéricas (yellow_count, black_count, transparent_corners) estavam todos verdes — não capturavam proporção visual.

**Decisão:** extensão à regra AD-20260526-01 para incluir assets visuais:

**ANTES de upload Supabase de qualquer logo ou foto de parceiro:**

1. Asset processado deve ser inspeccionado visualmente lado-a-lado com pelo menos 1 asset existente do mesmo tipo (ex: novo logo vs Good Feeling logo).
2. Verificação numérica: proporções comparáveis (±15% de ocupação linear do canvas).
3. Inspecção feita por Ricardo OU por Claude (com screenshot anexado e visível), nunca apenas por sanity checks numéricas.
4. "Confirmado OK" sem comparação visual lado-a-lado = NÃO procede para upload.

**Aplicação:**
- Onboardings futuros: este passo é obrigatório no PARTNER-ONBOARDING workflow.
- Pedir logo SVG/vectorial directamente ao parceiro no primeiro email (evitar round-trips de processamento raster).
- Se source for JPEG, perguntar se existe versão PNG/SVG antes de processar.

**Trade-offs:** +2 min por onboarding (anexar preview + comparação visual). Mitiga risco de retrabalho (3 deploys gastos no logo Albufeira).

---

## AD-20260526-01 — Checklist mobile pre-deploy obrigatório

**Data:** 26/05/2026 · **Status:** Activa

**Contexto:** Sessão 26/05 abriu com 3 bugs mobile reportados pelo Ricardo (nav "Para o seu Negócio" desalinhado, menu hambúrguer incompleto, hambúrguer ausente em pelo menos 1 EN). Audit headless 412×915 Android UA revelou 1 causa raiz HTML (Bug A) + 1 causa raiz JS (Bug B) + 1 routing Cloudflare (Bug C) — todas pré-existentes mas nunca detectadas porque smoke tests só faziam `curl HTTP 200`, nunca renderização mobile real.

**Custo do gap:** Ricardo reportou frustração explícita por padrão recorrente de "regressões em coisas que estavam a funcionar". Análise revelou que regra "verificar antes de mudar" (AD-20260525-04) cobria código (`DECISIONS_LOG + 00-CONTEXT`) mas não cobria **comportamento visual em mobile**.

**Decisão:** Checklist mobile pre-deploy obrigatório para qualquer deploy que toque HTML/CSS partilhado (nav, footer, header, body classes, JS de navegação):

1. Desktop 1280px — homepage PT + EN
2. Desktop 1280px — 1 página interna PT + EN
3. **Mobile 412×915 Android Chrome UA — homepage PT + EN**
4. **Mobile 412×915 Android Chrome UA — 1 página interna PT + EN**
5. Lang switcher PT↔EN em mobile
6. Menu hambúrguer: abre, contém TODAS as opções do desktop, fecha
7. Smoke test G10 (browser-level, não só `curl HTTP 200`)

**Não passa checklist = não há deploy.** Mesmo que adicione 5-10 min por deploy.

**Gap descoberto a meio da sessão (corrigido):** `Playwright.click()` programático bypassa hit-test visual → não detecta overlays a interceptar cliques. **Para testes de interacção, usar `Page.tap()` com `hasTouch:true` + `isMobile:true`**. Aplicado retroactivamente em todos os smoke tests posteriores.

**Trade-offs:** +10 min/deploy. Mitigado por automação Playwright reutilizável (`_diag/mobile-audit-20260526/` scripts base).

**Aplicação inaugural:** Bug A deploy (`6b59132`) — funcionou. **Falha em aplicar:** logo Albufeira (`70c22d5`) — Ricardo detectou problema. Extensão criada como AD-20260526-01b.

**Trabalho cumulativo:** 8 deploys produção nesta sessão, 11+ bugs fechados, 1 feature, 1 parceiro, 38+ smoke tests mobile com `tap()` real após gap-fix.

---



## AD-20260525-04 — Fix bug estrutural HTML nav PT "Para o seu Negócio"

**Data:** 25/05/2026 · **Status:** Activa · **Commit:** pendente

**Contexto:** Link "Para o seu Negócio" sem styling no nav PT da homepage. 2× `</div>` extra após dropdown "Parceiros Verificados" fechavam `.nav-links` prematuramente, deixando o `<a>` órfão fora do container.

**Escala:** 54 páginas PT. EN limpo. Vitrines geradas por build não afectadas. Bug pré-existente (confirmado em `git show d0d0b79:index.html`).

**Decisão:** Script Python `_diag/fix-nav-para-negocio-v2.py` com 2 variantes de anchor (`href="parceiros.html"` e `href="/parceiros.html"`). Idempotente, validação byte-level de acentos (`sys.exit(2)` se mojibake).

**Resultado:** 54/54 fixed. 108 deletions, 0 insertions. Zero quebras encoding.

**Lição crítica:** PS5 com `Get-Content -Raw` em UTF-8 sem BOM corrompe acentos por round-trip (mojibake duplo `NegÃƒÂ³cio` em meio do fix, revertido). **Regra permanente: nunca PowerShell para editar HTML com acentos — Python ou Node.js.**

**Trade-offs:** Mass-edit em 54 ficheiros = risco AD-20260521-04. Mitigado por branch dedicada, dry-run, idempotência, validação por ficheiro.

---

## AD-20260525-03 — Fix CSS injection pages (partners-page.css em 3 páginas)

**Data:** 25/05/2026 · **Status:** Activa · **Commit:** `5e0e5dd`

**Contexto:** Durante validação local do redesign vitrines, descoberto que `/praias-surf-iniciantes-algarve` mostrava medium cards sem styling. `partners-page.css` não estava linkado no `<head>`.

Bug pré-existente: `build-partners.mjs --inject` adiciona conteúdo entre `<!-- partners:start -->` mas não modifica o `<head>`. As 3 páginas de injecção nunca tiveram `partners-page.css` referenciado.

**Decisão:** Adicionar `<link rel="stylesheet" href="/css/partners-page.css?v=20260521-v1">` após `style.css` no `<head>` das 3 páginas (manual via notepad).

**Trade-offs:** Solução paliativa. Fix sistémico (auto-inject CSS link no build) adiado.

**Aplicação:** Adicionar à §5.x do PARTNER-ONBOARDING.md — nova injection page futura tem que linkar `partners-page.css` manualmente.

**Reavaliar:** se aparecer 4ª/5ª injection page, refactor build para auto-inject.

---

## AD-20260525-02 — Redesign vitrines /escolas-de-surf (lista + filtros + accordion)

**Data:** 25/05/2026 · **Status:** Activa · **Commit:** `5e0e5dd`

**Contexto:** Card v2 actual ocupa ~50% viewport desktop. 100 parceiros = 100 scrolls. Insustentável. Ricardo pediu "filtros por região, layout estilo revista".

**Opções (3 mockups):**
- A) Grid 3-up (Airbnb-style)
- B) **Lista compacta + sidebar filtros + accordion expand (Booking-style)** ← escolhido
- C) Estilo revista editorial

**Mesa de 5 agentes identificou 5 riscos:** regeneração destrutiva, `<style>` mobile-nav hardcoded, tier mismatch verified/essential, google_rating null, praias sem página estática. Todos mitigados.

**Estratégia:**
1. Extender, não substituir — `build-partners.mjs` ganha `generateDirectoryList()` nova
2. CSS/JS separados — `css/partners-directory.css` (474 linhas) + `js/partners-directory.js` (364 linhas)
3. Card v2 = conteúdo do accordion (reutilização total)
4. SEO protegido — descrição inline, fallback no-JS via `<noscript>`
5. 3 commits atómicos

**Arquitectura:**
- Prefixo `.pd-*` para classes novas
- IIFE vanilla JS, event delegation, ARIA completo
- Filtros: Região + Idioma + Qualidade (FPS, ★ Founder)
- Founder destacado via `.pd-row--founder` (preparado para 1º Founder pagante)

**Fix relacionado:** Good Feeling tinha `tier: "verified"` no JSON (bug — "verified" é status). Normalizado para `tier: "essential"` (commit `35a66d4`).

**Trade-offs:**
- 2 parceiros não justificam visualmente os filtros (over-engineering visível)
- 6-10h trabalho real

**Aplicação:** Adicionar à §5.7 do PARTNER-ONBOARDING.md. **Não modificar `generateCardLarge`** — quebra o accordion.

**Reavaliar:** ≥6 parceiros (filtros ganham valor); 1º Founder pagante (activar diferenciação visual); ≥50 cliques/mês GSC (refinamentos UX).

---

## AD-20260525-01 — Paddle rejeitado definitivamente, sem processador MoR

**Data:** 25/05/2026 · **Status:** Activa · **Substitui:** AD-20260518-02

**Contexto:** Paddle recurso (18/05) negado em 25/05. Resposta oficial: "Modelo de negócio em categoria com perfil de risco que parceiros bancários e políticas internas não conseguem suportar. Decisão definitiva para o seu modelo de negócio atual."

LemonSqueezy também morto (KYC rejeitada 27/04, sem resposta 30+ dias).

**Estado:** PTH sem processador MoR aprovado. Tier Pro consumer listado em `/precos` sem checkout funcional.

**Opções remanescentes:**

| Opção | Esforço | Trade-off |
|---|---|---|
| A) Stripe + NIF próprio | Alto | Compliance UE/MoSS para founder solo |
| B) Polar.sh (MoR open-source) | Médio | Plataforma nova |
| C) Dodo Payments | Médio | Footprint menor |
| D) Gumroad | Baixo | Posicionamento "creator" atrita com brand |
| E) Descontinuar Pro consumer, 100% B2B | Baixo | Remove stream consumer; B2B usa SEPA |

**Decisão:** Não decidida nesta sessão. Avaliar 1-2 semanas. Opção E é a única executável sem nova plataforma.

**Trade-offs entretanto:**
- Tier Pro como "em breve" / sem CTA funcional
- B2B método cobrança caso a caso (SEPA, factura)
- Afiliações (GYG, Amazon) não afectados

**Reavaliar:** Retrospectiva mensal 04/06/2026.

---

\---

## AD-20260521-04 — Crise CSP + revert do logo Supabase

**Data:** 21/05/2026 · **Status:** Activa (lição aprendida) · **Commit:** `238e738` (revert do `9a7bc8e`)

**Contexto:** Logo profissional do Good Feeling Surf School foi hospedado em Supabase Storage e referenciado via `<img>` no card-large. Smoke test local em `localhost:8000` passou. Produção partiu: card desapareceu, hero desapareceu, layout colapsou, browser desenhou triângulo preto gigante onde devia estar o logo.

**Causa raiz dupla:**

1. CSP `\_headers` tinha `img-src ... \*.supabase.co` (wildcard genérico). Em algumas configurações CSP isto NÃO inclui automaticamente subdomain específico `glupdjvdvunogkqgxoui.supabase.co`. Browser bloqueou img → cookie `\_\_cf\_bm` rejeitado → `<img width=518 height=518>` reservou espaço vazio massivo.
2. Bump de `partners-page.css?v=20260521-v1 → v2` aconteceu ANTES do ficheiro novo estar live em todos os edges Cloudflare. Race condition durante propagação: alguns browsers pediram `?v=v2` quando ainda existia `?v=v1` em edge → CSS new não carregou → layout colapsou.

**Decisão:** Revert imediato. Mantém produção estável com SVG placeholder enquanto investigamos atomic deploy + CSP fix.

**Trade-offs assumidos:** Trabalho de logo + dados ricos fica preparado localmente, não em produção. Card actual em produção continua com SVG genérico (qualidade inferior ao planeado).

**Reavaliar:** próxima sessão dedicada com 4 fixes documentados (CSP subdomain específico, onerror fallback, atomic deploy CSS, pre-deploy visual validation).

\---

## AD-20260521-03 — Protocolo de investigação pública para parceiros

**Data:** 21/05/2026 · **Status:** Activa (regra permanente)

**Contexto:** Durante actualização do card Good Feeling, Ricardo sugeriu inventar `google\_rating: 4.8`. Claude recusou (risco legal + ético + brand). Solução real: usar Claude Code para pesquisar dados públicos verificáveis (Google Maps, Tripadvisor, IG, FB, site oficial).

**Decisão:** Protocolo formal — antes de adicionar parceiro ao `\_data/partners.json`, executar investigação pública estruturada:

1. Google Maps / Google Business Profile (rating, reviews, URL)
2. Tripadvisor (rating, reviews, ranking, URL)
3. Instagram oficial (handle, bio, validar pertença ao mesmo negócio)
4. Facebook oficial (URL, validar branding match)
5. Autoridade pública (anos operação, certificações)
6. Telefone canónico (cross-reference múltiplas fontes para detectar erros)

**Output esperado:** relatório estruturado por dado, com URL da fonte e nível de confiança (ALTA/MÉDIA/BAIXA). Discrepâncias entre fontes → reportar, não escolher. Dados não confirmados → `null` no JSON.

**Trade-offs:** Tempo adicional por parceiro (\~10-15 min). Mas evita: invenção, publicidade enganosa, retrabalho quando parceiro detecta erro.

**Aplicação:** Boa Feeling Surf School validado em 21/05 (1 hora investigação + actualização). Mesmo protocolo para os próximos 14 parceiros do outreach piloto.

\---

## AD-20260521-02 — Pre-flight check obrigatório em sessões Claude Code

**Data:** 21/05/2026 · **Status:** Activa (regra permanente)

**Contexto:** Sessão de 21/05 começou com Claude Code a operar em `feature/footer-guias-mobile` (114 commits behind main) sem aviso. Trabalho commitado em branch errada, ficheiros existentes em main estavam em falta localmente, 3-4h perdidas em diagnóstico.

**Decisão:** Script `\_scripts/preflight.sh` corrido como PRIMEIRO comando obrigatório de qualquer sessão Claude Code nova. 8 checks:

1. `pwd` contém `Portal-turismo-site`
2. Git repo + remote `portal-turismo-portugal-site`
3. Branch identificável (não detached HEAD)
4. Branch ≤ 20 commits behind main
5. Working tree estado (avisos)
6. Sync com origin
7. Worktrees ≤ 5
8. Ficheiros críticos presentes (`CLAUDE.md`, `\_headers`, `sitemap.xml`, etc.)

Exit code ≠ 0 → STOP. Não começar trabalho.

**Trade-offs:** 30s extra no início de cada sessão. Mas evita catástrofes como a de 21/05 (4h perdidas).

**Status implementação:** Script criado em outputs, pendente integrar no repo. Próxima sessão começa com isto.

\---

## AD-20260521-01 — Sistema editorial de parceiros (escolas de surf)

**Data:** 21/05/2026 · **Status:** Activa em produção (parcialmente) · **Commits:** `eb0a390` + `4cb7f29`

**Contexto:** Outreach B2B piloto recebeu 3-4 respostas positivas. Necessário criar vitrine pública para parceiros verificados, separada da landing B2B existente (`parceiros.html`).

**Opções avaliadas (mesa de 5 agentes):**

* A) Vitrine no topo de `parceiros.html` (vitrine + B2B sales misturados)
* B) Substituir `parceiros.html` com vitrine, mover B2B para `/candidaturas`
* C) URL nova `/escolas-de-surf` (segmentada por tipo de parceiro), `parceiros.html` intacto

**Decisão:** Caminho C. URL semântica para SEO, preserva landing B2B indexada, escalável (futuro `/operadores-pesca/`, `/hoteis-verificados/`).

**Arquitectura implementada:**

* `\_data/partners.json` (fonte única de verdade)
* `\_scripts/build-partners.mjs` (build ESM idempotente)
* `escolas-de-surf.html` + `en/surf-schools.html` (vitrine bilingue)
* `css/partners-page.css` (3 tamanhos de card: large, medium, inline)
* Marcadores HTML `<!-- partners:start -->` em páginas-piloto (praias-surf-iniciantes-algarve, en/beginner-surf-beaches-algarve, guias/melhores-praias-algarve)
* JSON-LD `CollectionPage` + `SportsActivityLocation` + `BreadcrumbList`
* Sitemap +2 URLs

**Tier visual único hoje ("verified")**. Schema preparado para "founder" futuro (€149/mês) sem diferenciação visual ainda.

**Trade-offs:**

* 1 parceiro sozinho em vitrine cria percepção visual fraca → aceitar até haver mais parceiros
* Página dedicada por parceiro NÃO criada (é feature Founder €149, dar grátis hoje compromete tier pago)
* Foto via placeholder SVG (CSP bloqueia img externa do parceiro)

**Lições da implementação:**

* Cherry-pick `05f3d5b` para main era melhor opção que merge da branch antiga (114 commits behind)
* Sistema JSON → HTML estático é escalável e indexável (vs Supabase runtime que falha indexação)
* Validação visual em localhost NÃO é suficiente para produção (descoberto em AD-20260521-04)

**Reavaliar:** quando houver 3-5 parceiros confirmados, vitrine ganha proporção visual. Considerar diferenciação tier visual quando primeiro Founder pagar.

## AD-20260519-07 — Pre-render 2.º lote 15 praias bilingues (Lote 2)

**Data:** 2026-05-19 · **Status:** Activa · **Commit:** 75e1b0e

**Contexto:** Lote 1 (AD-20260519-06) entregou 15 praias fora do Algarve. Sessão Claude.ai 19/05 tarde aprovou 2.º lote de 15 praias com foco em regiões não cobertas: Madeira, Açores, Aveiro, Porto/Norte, Centro/Leiria, Lisboa/Cascais, Arrábida/Setúbal, Alentejo (lagoa), Algarve (Quinta do Lago). Critério: singularidade verificável com ≥2 sources não-agregadores.

**Decisão:** 15 praias × 2 línguas = 30 ficheiros HTML estáticos. Schema.org (Beach + LocalBusiness + BreadcrumbList), hreflang trinity, HTML entities PT, ASCII puro EN. Sem CTA live-data. Generator script: `_diag/gen-beaches-lote2.js`.

**Lista das 15 praias (Lote 2):**

| Slug | Nome | Região | Singularidade verificada |
|---|---|---|---|
| praia-de-carcavelos | Praia de Carcavelos | Oeiras/Lisboa | NATO STRIKFORNATO HQ; acesso comboio 30min Lisboa |
| praia-de-costa-nova | Praia de Costa Nova | Ílhavo/Aveiro | Palheiros às riscas século XIX; Ria de Aveiro laguna |
| praia-do-porto-santo | Praia do Porto Santo | Porto Santo/Madeira | 9km contínuos; areia terapêutica liquefeita; Colombo residente |
| praia-de-mosteiros | Praia de Mosteiros | São Miguel/Açores | Piscinas vulcânicas naturais; UNESCO; pôr-do-sol panorâmico |
| praia-dos-galapinhos | Praia dos Galapinhos | Arrábida/Setúbal | CNN + Condé Nast #1 praias não-turísticas; ICNF cap diário; só trilho pedestre |
| praia-da-calheta | Praia da Calheta | Calheta/Madeira | Praia artificial areia Sahara + Canárias; Casa das Mudas museu design |
| praia-da-barra | Praia da Barra | Ílhavo/Aveiro | Farol 62m — o mais alto da Península Ibérica |
| praia-de-espinho | Praia de Espinho | Espinho/Norte | Casino 1904; Campeonatos Nacionais Surf; cidade implantada na areia |
| lagoa-de-albufeira | Lagoa de Albufeira | Sesimbra/Setúbal | Maior lagoa costeira Área Metropolitana Lisboa; flamingos; ZPE Aves |
| praia-de-mira | Praia de Mira | Mira/Coimbra | Palheiros em palafitas; ferry motorizado sobre lagoa; praias-lagoa dupla |
| praia-de-sao-pedro-de-moel | Praia de S. Pedro de Moel | Marinha Grande/Leiria | Pinhal de Leiria plantado ~1200 d.C. (Rei Dinis); duna-floresta única |
| praia-de-esposende | Praia de Esposende | Esposende/Braga | Estuário Cávado; Natura 2000; Cividade de Terroso castrum pré-romano |
| praia-de-moledo | Praia de Moledo | Caminha/Viana do Castelo | Praia mais a norte Portugal continental; Castelo de Moledo séc. XIV; Minho/Atlântico |
| praia-da-quinta-do-lago | Praia da Quinta do Lago | Loulé/Algarve | Ria Formosa NP; flamingos; boardwalk madeira 1,4 km; acesso privado vedado |
| praia-de-vieira-de-leiria | Praia de Vieira de Leiria | Marinha Grande/Leiria | Pesca à xávega praticada ativamente; traineiras na praia; tradição viva |

**Sources principais:** Wikipedia PT/EN, cm-oeiras.pt, visitaveiro.pt, visit-madeira.com, visitazores.com, ICNF/Parque Natural Arrábida, CNN Travel, Condé Nast Traveller, cm-espinho.pt, cm-mira.pt, marinhagrandedistrital.pt, cm-esposende.pt, cm-caminha.pt, ria-formosa.net, cm-marinha-grande.pt.

**Trade-offs:** +30 páginas estáticas indexáveis em regiões de alto volume (Madeira, Açores) sem risco thin content. Areia Porto Santo e piscinas Mosteiros competem com Visit Madeira e Azores Tourism — mitigação: ângulo editorial único (história, dados mensuráveis, fontes institucionais).

**Risco:** Madeira e Açores têm forte presença turística oficial. Mitigação: facts verificáveis (9km, 62m, 1200 d.C.) diferem de copy genérico.

**Reavaliar:** 19/06/2026 — medir indexação GSC + cliques nas 30 URLs Lote 2. Se < 50% indexada em 30 dias, verificar hreflang e sitemap submission.

---

## AD-20260519-06 — Pre-render 15 praias bilingues (expansão SEO)

**Data:** 2026-05-19 · **Status:** Activa · **Commit:** (TBD)

**Contexto:** Auditoria Claude.ai 19/05 revelou 30 praias pré-renderizadas (todas Algarve) + ~77 só-SPA não indexáveis. Decisão de Ricardo: pré-renderizar 15 praias adicionais bilingues, mix de regiões fora do Algarve, com critério qualidade editorial > quantidade.

**Decisão:** 15 praias × 2 línguas = 30 ficheiros HTML estáticos novos. Cada um com sources verificáveis, schema.org (Beach + LocalBusiness + BreadcrumbList), hreflang trinity (pt, en, x-default), conteúdo editorial diferenciado (não Visit Portugal copy). Sem CTA live-data (nenhuma das 15 tem UUID Supabase).

**Trade-offs:**
- Vs IA-generated thin content: maior tempo execução mas evita risco penalização Google (Helpful Content Update 2022 + Spam Updates 2024-25)
- Vs adiar: ganha-se cobertura SEO de regiões além-Algarve com alto search volume (Nazaré, Guincho, Supertubos, Caparica)

**Lista das 15 praias seleccionadas:**

| Slug | Nome | Região | Singularidade verificada |
|---|---|---|---|
| praia-do-guincho | Praia do Guincho | Lisboa/Cascais | James Bond OHMSS (1969); windsurf/kitesurf europeu |
| praia-grande-sintra | Praia Grande | Sintra | 66 pegadas dinossauros >100M anos; maior piscina sal Europa |
| costa-de-caparica | Costa da Caparica | Almada | >25 km contínuos; 29 zonas; protocolo APA sedimentos |
| praia-de-sesimbra | Praia de Sesimbra | Arrábida/Setúbal | AMP Arrábida; aldeia piscatória activa; Castelo século XII |
| praia-do-meco | Praia do Meco | Sesimbra | 1.ª praia naturismo oficial Portugal (1995); Arriba Fóssil |
| praia-de-odeceixe | Praia de Odeceixe | Costa Vicentina | Fronteira Algarve/Alentejo; Bandeira Azul desde 2012 |
| praia-da-arrifana | Praia da Arrifana | Costa Vicentina | Fortaleza 1635 + Ribat islâmico séc. XI; surf point break |
| praia-do-amado | Praia do Amado | Costa Vicentina | PNSACV sem construção; surf consistente todo o ano |
| praia-de-porto-covo | Praia de Porto Covo | Alentejo Litoral | Porta norte PNSACV; aldeia séc. XVIII classificada |
| praia-da-comporta | Praia da Comporta | Alentejo Litoral | Reserva Natural Estuário do Sado; flamingos; 45 km sem cimento |
| praia-do-norte-nazare | Praia do Norte (Nazaré) | Centro | Guinness 26,21 m (Steudtner 2020); Canhão Nazaré 230 km |
| supertubos-peniche | Supertubos (Peniche) | Centro | WSL CT stop único Europa continental; "Pipeline Português" |
| praia-de-matosinhos | Praia de Matosinhos | Norte/Porto | Acesso Metro Porto; seafood; surf urbano consistente |
| praia-da-figueira-da-foz | Praia da Figueira da Foz | Centro | "Rainha das Praias"; foz Rio Mondego; casino histórico |
| praia-da-amoreira-aljezur | Praia da Amoreira | Costa Vicentina | Lagoa estuário + atlântico; Rota Vicentina; Bandeira Azul |

**Sources principais por praia:** Wikipedia PT/EN, sites oficiais câmaras municipais (cm-aljezur.pt, cm-grandola.pt, cm-cascais.pt, cm-peniche.pt, cm-sesimbra.pt, sines.pt), ICNF/PNSACV, Guinness World Records, WSL, walkalgarve.com, thesurfatlas.com, nazarewaves.com.

**Risco identificado:** páginas competem com Visit Portugal, TripAdvisor, Booking. Mitigação: ângulo editorial único, transparência de sources, sem copy desses sites.

**Desvios da spec:** Nenhum. BOM=False nos novos ficheiros (BOM=True nos existentes é artefacto de editor, não requisito). Validator flag `</meta>` é pre-existente e afecta igualmente todas as páginas existentes.

**Reavaliar:** 19/06/2026 — medir cliques GSC nas 30 novas URLs e indexação. Se < 50% indexada, refinar abordagem.

---

## AD-20260519-05 — Lang switcher slug-específico nas 60 páginas pré-renderizadas

**Data:** 19/05/2026 · **Status:** Activa · **Commit:** (ver fix/lang-switcher-praias)

**Contexto:** Sessão Claude.ai 19/05/2026 auditou as 30 praias pré-renderizadas (PT + EN = 60 páginas)
e identificou 3 issues residuais. Esta entrada documenta o fix de Issue 3 (lang switcher) e as
decisões sobre Issues 1 e 2.

**Decisão — Issue 3 (FEITO):** Lang switcher actualizado em 60 ficheiros:
- PT pages: `href="/en/"` → `href="/en/praias/<slug>/"` (genérico → slug-específico)
- EN pages: `href="/praias/<slug>"` → `href="/praias/<slug>/"` (adicionado trailing slash)

**Decisão — Issue 1 (ADIADO):** Redirect `beach.html?id=<UUID>` → `/praias/<slug>/` não pode ser
implementado via `_redirects` porque Cloudflare Pages não suporta query string matching. Alternativas
(Pages Function `_middleware.js`, ou lógica client-side em `beach.html`) aguardam decisão separada.

**Decisão — Issue 2 (SKIPPED):** `/praias/index.html` não existe; breadcrumb `/beaches.html` mantido
para evitar 404. Issue 2 só faz sentido após criar `/praias/index.html`.

**Trade-offs:** Issue 3 aplicado isoladamente (não interdepende de Issues 1 e 2). UX melhora
imediatamente — utilizador que troca de idioma mantém contexto da praia. Issues 1 e 2 permanecem
pendentes sem impacto no comportamento actual do site.

**Guardrails aplicados:** Backup branch `backup/pre-praias-fix-20260519` criado e pushed.
30 UUIDs mapeados mas não usados (Issue 1 adiado). Praias só-SPA (77) não tocadas.

**Reavaliar:** Issue 1 — decidir entre Pages Function vs client-side redirect em sessão dedicada.
Issue 2 — criar `/praias/index.html` (redirect 301 para `/beaches.html` ou listing page real).

---

## AD-20260519-04 — Founder Partner 2026 substitui Commercial Partnership

**Data:** 19/05/2026 · **Status:** Activa · **Commit:** 0a17e5c

**Contexto:** O card "Commercial Partnership" em /precos.html (PT+EN) apresentava
apenas "Proposta personalizada" sem preço concreto. Sessão Claude.ai 19/05/2026,
com Mesa de 5 agentes, convergiu 5/5 para um tier intermédio com preço público:
Founder Partner €149/mês, limitado a 10 lugares no 1.º ano.

**Decisão:** Introduzir Founder Partner 2026 (€149/mês) como segundo tier B2B,
substituindo o card "Commercial Partnership". Inclui: destaque visual no topo de
/parceiros, página própria /parceiros/&lt;nome&gt;/, até 4 fotos adicionais,
inclusão prioritária em guias e listicles, badge "Founder Partner 2026" durante
12 meses, revisão semestral. Escassez explícita: 10 lugares no 1.º ano. Custom
enterprise mantido como link discreto abaixo dos cards (não como tier visual).

**Trade-offs:** Preço público reduz fricção de descoberta e introduz escassez,
mas compromete a margem de negociação caso-a-caso que o tier "proposta
personalizada" preservava. Mitigação: link enterprise mantém porta aberta para
deals fora-de-grelha. As páginas /parceiros/&lt;slug&gt;/ ainda não existem
(criação adiada — ver TODO).

**Reavaliar:** 19/08/2026 (90 dias) — medir candidaturas a Founder vs Essential
e taxa de conversão do link enterprise. Se Founder &lt; 3 candidaturas em 90
dias, reavaliar preço ou copy. Se enterprise link &gt; 5 cliques sem fecho,
reformular CTA.

---

## AD-20260519-03 — Alinhamento pricing B2B two-tier em PT+EN

**Data:** 19/05/2026 · **Status:** Activa · **Commit:** 0a17e5c

**Contexto:** Referências obsoletas de pricing dispersas pelo site: en/why-pth.html
linha 219 ("€149 to €349 depending on the size of the operation") e
_audit/cro-audit.js linhas 313-314 (array `['149','199','249','349']`) reflectiam
um modelo de pricing que nunca foi público em /precos.html. Sidebar
.price-highlight em /parceiros.html (PT+EN) mostrava apenas Essential €49.

**Decisão:** Alinhar TODAS as superfícies públicas e de auditoria ao novo modelo
two-tier (Essential €49 + Founder €149). Sidebar /parceiros expande para mostrar
ambos os tiers com classe .ph-tier-founder + scarcity "10 lugares" / "10 spots".
cro-audit.js passa a validar apenas os 2 preços live com threshold PASS===2.
en/why-pth.html linha 219 reescrita com wording two-tier explícito.

**Trade-offs:** Múltiplos pontos de manutenção (8 ficheiros) num único commit
introduz risco de regressão se algum falhar. Mitigação: pre-commit ritual
(`git diff --stat` vs scope contract) + pre-deploy ritual (screenshots
before/after em 375px e 1280px nas 4 páginas HTML afetadas).

**Reavaliar:** Imediatamente se Bug-IMG-AUTOFIX ou outro audit reportar
desalinhamento de preços. Caso contrário, sem revisão programada — pricing é
fonte única em /precos.html após este commit.

---

## AD-20260519-02 — Páginas editoriais Shapers de Portugal

**Data:** 19/05/2026 · **Status:** Activa · **Commit:** 90ebe37

**Contexto:** Em 18/05, análise estratégica identificou shapers portugueses
(Semente, Polen, Fatum, Mica) como targets prioritários para outreach B2B.
Conteúdo editorial verificado produzido em sessão Claude.ai 19/05 usando
cross-check com semente.pt, polensurfboards.com, fatumsurfboards.com,
micasurfboards.com, A Magazine, ONFIRE Surf Mag, Board Exchange.

**Decisão:** Criar páginas editoriais ANTES do outreach, não depois. Razão:
prospects que recebem outreach e encontram conteúdo dedicado convertem
melhor do que prospects que recebem outreach e encontram nada.

**Trade-offs:** Constrói autoridade editorial mas adia o primeiro contacto
directo. Risco aceitável dado que o conteúdo está verificado e pronto.

**Reavaliar:** 19/06/2026 — medir tráfego orgânico em /shapers-portugal/
e /en/shapers-of-portugal/. Se < 100 visitas em 30 dias, priorizar outreach
activo sobre espera por SEO.

---

## AD-20260519-01 — Migração análise estratégica para Project Knowledge

**Data:** 19/05/2026 · **Status:** Activa · **Commit:** 6396907

**Contexto:** 3 sessões Claude.ai de 18/05/2026 produziram análise estratégica
relevante (pricing B2B €99, lista outreach 15+ surf shops/shapers, decisão
pre-render, 7 lições técnicas) que ficou dispersa e não versionada.

**Decisão:** Migrar para `_planning/analise-estrategica-18mai2026.md` no repo
como Project Knowledge versionado. Dois artefactos mencionados mas não migrados:
"plano estratégico 5 partes" e "3 caminhos estratégicos (A/B/C)". A recuperar
em sessão dedicada se críticos.

**Trade-offs:** Migração parcial — conteúdo consolidado é representativo mas
não exaustivo. Risco: decisões das sessões originais podem ter nuances não
capturadas.

**Reavaliar:** Quando definir Plano B formal (deadline 22/05). Verificar se os
3 caminhos estratégicos são necessários ou se decisão pode ser tomada com
informação disponível.

---

## AD-20260518-01 — Disclosure de financiamento em páginas de metodologia

**Data:** 18/05/2026 · **Status:** Activa · **Commit:** b8f0889

**Contexto:** Inventário em sessão Claude.ai descobriu que (1) expressões
citadas pelo ChatGPT ("verified editorial content", "no disguised sponsored")
existem só em en/media-kit.html linha 440; (2) páginas de metodologia não
têm secção de disclosure de modelo de receita; (3) PTH é publisher Awin
não declarado em nenhum dos 4 ficheiros de transparência. Dois LLMs
independentes avisaram publicamente sobre o gap claim-vs-execução.

**Decisão:** Adicionar secção "Como nos financiamos" / "How we're funded"
em ambas as páginas, declarando GYG, Amazon Associates e parcerias B2B
verificadas explicitamente. Zero alterações ao Media Kit (preservado até
decisão futura). Zero CSS novo.

**Trade-offs:** Pode reduzir "wow factor" do Media Kit B2B. Mesa considerou:
prospects sofisticados valorizam disclosure honesto; prospects que se
afastam por causa disso não eram bons fits.

**Reavaliar:** Em 30 dias (18/06/2026), repetir as 5 queries ChatGPT que originaram
esta decisão e ver se o aviso "don't pretend it is charity journalism"
desaparece quando o ChatGPT recrawl as páginas.

---

\# 03-DECISIONS LOG



\*\*Log Cronológico de Decisões Arquiteturais\*\*

\*\*Última actualização:\*\* 16/05/2026 (fim de sessão)


\---



\## Como ler



Cada entrada: \*\*AD-YYYYMMDD-XX\*\* (Architectural Decision)



Campos: Data · Status (Activa/Revertida/Substituída) · Commit (se aplicável) · Contexto · Opções · Decisão · Trade-offs · Reavaliar



\---



\## AD-20260516-02 — Vídeo editorial "Verificação Local Especializada" em /surf



\*\*Data:\*\* 16/05/2026 · \*\*Status:\*\* Activa · \*\*Commits:\*\* `b1fb2d0` → `81eff18`



\*\*Contexto:\*\* Necessidade de reforço visual da promessa "verificação local" antes do widget GetYourGuide. Utilizador tinha vídeo próprio (7s, 1.46 MB) de surfista português com direitos confirmados.



\*\*Iteração 1 (commit `b1fb2d0`):\*\* Bloco autónomo full-width entre `.surf-filters` e `.gyg-block`. Vídeo a 1100px ficou demasiado grande e sem resolução adequada para uso editorial.



\*\*Iteração 2 (commit `81eff18` — versão final):\*\* Refactor para variante `.gyg-block--with-video`. Vídeo (50%) emparelhado lado-a-lado com header GYG (50%) dentro de `.gyg-block-inner` (720px). Widget GYG continua full-width abaixo, intocado.



\*\*Decisão de layout:\*\* Mesa decidiu Opção B revisitada após auditoria identificar que `.gyg-block-inner` tem `max-width: 720px` e que 34 páginas usam `.gyg-block` (CSS partilhado). Criada variante CSS dedicada `.gyg-block--with-video` aplicada APENAS em surf.html + en/surf.html.



\*\*Comportamento UX:\*\*

\- Desktop: hover-to-play com reset on mouseout

\- Mobile/touch: autoplay via IntersectionObserver (threshold 0.5)

\- Muted, looped, playsinline (sem problemas autoplay)

\- preload=metadata (sem custo bandwidth inicial)



\*\*Texto overlay:\*\*

\- PT: "Verificação Local Especializada" (eyebrow "EDITORIAL")

\- EN: "Expert Local Verification"



\*\*Infraestrutura:\*\*

\- Vídeo alojado em `cdn.portalturismoportugal.com/surf-verification.mp4` (R2 bucket `pth-videos`)

\- Upload via `wrangler r2 object put --remote`

\- Cache: max-age=14400



\*\*Trade-offs:\*\*

\- WebM fallback e poster image \*\*NÃO incluídos\*\* — anotado como backlog para optimização Core Web Vitals

\- Variante CSS dedicada significa que se quisermos vídeo noutras verticais (`/pesca`, etc.) é trabalho replicar

\- 720px contentor limita o vídeo a \~340px de largura efectiva — adequado mas não cinematic



\*\*Reavaliar:\*\* após 30 dias verificar via GA4 se há aumento de engagement em `/surf` (scroll depth, tempo na página, cliques no widget GYG).



\---



\## AD-20260516-01 — Bugs mobile WCAG + GPS card overflow



\*\*Data:\*\* 16/05/2026 · \*\*Status:\*\* Activa · \*\*Commit:\*\* `e805ae4`



\*\*Contexto:\*\* Auditoria visual de mobile (viewport 380x800) reportou 3 bugs em produção via screenshots.



\*\*Bug 1 — Contraste WCAG eyebrow:\*\*

\- Causa: `color: var(--gold)` (#c9a84c) em fundo `--off-white` (#f6f4ef) → contraste 2.08:1 (WCAG AA exige ≥4.5:1)

\- Sistémico em \~70 páginas (selectores `.eyebrow`, `.surf-eyebrow`, `.pesca-eyebrow`, `.partners-eyebrow`, `.explore-zona-eyebrow`, `.section-eyebrow`, etc.)

\- Mesa decidiu usar variável existente `--gold-text` (#8c6b14) que já estava no `:root` mas não estava a ser usada

\- Resultado: contraste 4.52:1 em fundo off-white (AA pass), 4.97:1 em fundo branco

\- Eyebrows em fundo escuro (`.section--dark`, `.planear-final-eyebrow`) preservados com `--gold`



\*\*Bug 2 — Menu hambúrguer indent (FECHADO sem fix):\*\*

\- Reportado: "Surf" e "Pesca" desalinhados em relação a outros items

\- Auditoria visual confirmou: todos os items têm `x=0`, `padding-left=24px` idêntico

\- Conclusão: ilusão visual por palavras de comprimento diferente. Sem bug real.



\*\*Bug 3 — Coordenadas GPS cortadas em `/beach`:\*\*

\- Causa: `<div>` anónimo em `.map-card-row` (flex container) sem `min-width: 0` nem `flex: 1` explícitos. Em CSS Flexbox aninhado, `min-width: auto` resolve para a largura mínima do conteúdo, e o ícone (sem `flex-basis` explícito) expandia para 268px ocupando todo o container

\- Fix: adicionar `flex: 0 0 48px` ao `.map-card-icon` + `flex: 1 1 0; min-width: 0` ao div anónimo

\- Validado: icon volta de 268px para 48px; coords ficam dentro do viewport 380px

\- Afecta \~100 páginas individuais de praia (PT + EN)



\*\*Ficheiros alterados:\*\* `css/parceiros-page.css`, `css/surf-pesca-page.css`, `css/beach-page.css`, `css/planear-page.css`



\*\*Validação:\*\*

\- Playwright visual audit em viewport 380x800

\- 8/9 elementos `.eyebrow` confirmados em rgb(140,107,20) em produção

\- 1 excepção: `.eyebrow-light` em dark hero overlay — intencional

\- Zero regressões em secções dark



\*\*Backup:\*\* branch `backup/pre-bugs-fix-20260515` + `\_diag/backups/bugs-fix-20260515/`



\*\*Reavaliar:\*\* Bug 1 está em 4.52:1 (no limite AA). Upgrade futuro para AAA (cor mais escura) anotado como backlog opcional.



\---



\## AD-20260515-07 — Canonical strip `.html` (parte 2 da migração SEO)



\*\*Data:\*\* 15/05/2026 · \*\*Status:\*\* Activa · \*\*Commit:\*\* `73f2d48`



\*\*Contexto:\*\* Após AD-20260515-06 (migração www), GSC continuava a mostrar "Página alternativa com etiqueta canónica correta" para `/pesca`, `/surf`, etc. Causa raiz: canonicals com `.html` enquanto sitemap usa URLs sem extensão; Cloudflare faz 301 de `.html` → sem extensão. Google entrava em ciclo: "canonical aponta para URL que redirecciona".



\*\*Decisão:\*\* Remover `.html` de canonicals, og:url, twitter:url, hreflang e JSON-LD URLs em 100 ficheiros .html (páginas reais). NÃO tocar em sitemap.xml (já correcto).



\*\*Exclusões deliberadas:\*\*

\- 5 stubs identificados como meta-refresh redirects (about, terms, privacy, case-study-template, proposal-template) — tratamento separado em AD-20260515-05

\- Regra 3 (cross-canonicals em about.html, best-beaches-algarve.html, case-study-template.html) — adiada para auditoria de links internos



\*\*Trade-offs:\*\*

\- Cross-canonical de `best-beaches-algarve.html` mantém `/en/algarve-beaches` como canonical — página EN continua a redireccionar sinal SEO para outra página EN. Decisão a rever.

\- 2 URLs residuais em `beach.html` e `en/beach.html` (JS dinâmico, não JSON-LD) ficam por fixar — requer teste funcional.



\*\*Validação:\*\*

\- Dry-run 640 ocorrências em 100 ficheiros

\- Byte-equivalence absoluta confirmada

\- 5 stubs verificados intocados por hash comparison

\- 6 URLs em produção validadas (canonical limpo, HTTP 200)

\- Zero CDN/Supabase URLs tocadas



\*\*Backup:\*\* branch `backup/pre-regra2-final-20260515` + `\_diag/backups/regra2-final-20260515/`



\*\*Substitui:\*\* AD-20260515-03 (que tinha adiado o fix; reavaliação antecipada por descobertas mid-flight)



\*\*Reavaliar:\*\* após 7-14 dias em GSC. Esperado: "Página alternativa com etiqueta canónica correta" deve desaparecer das páginas standalone.



\---



\## AD-20260515-06 — Migração para `www` (parte 1 da migração SEO)



\*\*Data:\*\* 15/05/2026 · \*\*Status:\*\* Activa · \*\*Commit:\*\* `6d71a6f`



\*\*Contexto:\*\* Investigação revelou conflito SEO grave em produção:

\- GSC propriedade registada: `https://www.portalturismoportugal.com/` (com www)

\- Cloudflare: 301 sem-www → www

\- Mas sitemap.xml e \~100 ficheiros HTML usavam URLs SEM www (canonicals, og:url, JSON-LD, hreflang)

\- Resultado: ciclo "Página com redireccionamento" no GSC



\*\*Descoberta crítica:\*\* o fix de sitemap em AD-20260515-02 (commit `41c478b`) trocou um problema por outro — antes apontava para URLs `.html` (redirect); depois apontava para sem-www (redirect). Só corrigia um eixo de três (www, .html, cross-canonical).



\*\*Decisão:\*\* Migrar 980 ocorrências em 104 ficheiros para `https://www.portalturismoportugal.com/`. Alinhar todos os sinais SEO (sitemap, canonicals, og, twitter, hreflang, JSON-LD) com a propriedade GSC e o redirect Cloudflare.



\*\*Validação:\*\*

\- Dry-run sem anomalias

\- Backup branch `backup/pre-www-migration-20260515` + snapshot disco

\- Byte-equivalence absoluta 104/104

\- Zero encoding corruption (regra do bug 14/05 mantida)

\- Zero impacto em CDN (`cdn.portalturismoportugal.com`) e Supabase URLs

\- 8 URLs em produção validadas HTTP 200



\*\*Lição operacional:\*\* descoberta mid-flight de que o problema canónico tinha três eixos (www, .html, cross-canonical), não um. Sessão original começou em "schema markup quick fix" e revelou problema arquitectónico maior. Adicionado à memória: "antes de migração em massa, mapear todas as dimensões do problema, não só a primeira que aparece".



\---



\## AD-20260515-05 — Descoberta de 5 ficheiros stub legacy PT→PT



\*\*Data:\*\* 15/05/2026 · \*\*Status:\*\* Pendente decisão



\*\*Contexto:\*\* Durante investigação para AD-20260515-07, descobertos 5 ficheiros que são stubs de meta-refresh + JS redirect, não páginas de conteúdo:



| Ficheiro | Tamanho | Redirect para | Links internos |

|---|---|---|---|

| `about.html` | 1.1 KB | `/sobre.html` | 45 ficheiros |

| `terms.html` | 1.1 KB | `/termos.html` | 48 ficheiros |

| `privacy.html` | 1.1 KB | `/privacidade.html` | 47 ficheiros |

| `case-study-template.html` | 1.1 KB | `/media-kit.html` | 0 (órfão) |

| `proposal-template.html` | 1.1 KB | `/parceiros.html` | 0 (órfão) |



\*\*Implicação arquitectónica:\*\* 45-48 ficheiros do site têm footer/header com links para versões "EN-nome" (`/terms.html`) que redireccionam para versões "PT-nome" (`/termos.html`). Cada visitante EN passa por JS redirect — péssima UX e sinal SEO confuso. Sugere migração PT/EN incompleta no passado.



\*\*`escondidas.html` (1.96 KB) NÃO é stub\*\* — é landing editorial "As 10 praias que ninguém no Booking encontra" ligada ao CTA da homepage. Tratada como página real em AD-20260515-07.



\*\*Opções:\*\*

\- A) Apagar 5 stubs + adicionar redirects 301 em `\_redirects` Cloudflare

\- B) Adicionar `noindex` aos stubs e manter (não recomendado)

\- C) Auditar 140 links internos primeiro e atualizar para apontar directamente para destino PT

\- D) Reestruturar arquitectura PT/EN completa (decisão maior)



\*\*Decisão:\*\* Adiada. Requer auditoria dos 140 links internos antes de qualquer acção, para evitar partir footers/headers em produção.



\*\*Reavaliar:\*\* sessão dedicada com cabeça fresca.



\---



\## AD-20260515-04 — Documentação Project Knowledge



\*\*Data:\*\* 15/05/2026 · \*\*Status:\*\* Activa



\*\*Contexto:\*\* Sessões longas perdem contexto entre conversas Claude. Necessidade de pacote handoff completo para uso em Projecto Claude.ai.



\*\*Decisão:\*\* Criar 6 documentos (CONTEXT, PRD, ARCHITECTURE, DECISIONS\_LOG, KPI\_DASHBOARD, CUSTOM\_INSTRUCTIONS) optimizados para Project Knowledge.



\*\*Trade-offs:\*\* Manutenção de 6 documentos vivos vs perda de contexto recorrente em novas sessões.



\---



\## AD-20260515-03 — Adiar fix canonical em 101 ficheiros



\*\*Data:\*\* 15/05/2026 · \*\*Status:\*\* Substituída por AD-20260515-07



\*\*Contexto:\*\* GSC mostra 31 páginas "Rastreada, não indexada". 22 são SPA, 2 são estáticas com canonical apontando para `.html`. Tentação: fix em massa em 101 ficheiros.



\*\*Opções:\*\*

\- A) Fix em todos os 101 hoje (script Python + validação)

\- B) Fix só nas 2 anomalias (teste cirúrgico)

\- C) Adiar — aguardar Google reflectir sitemap fix primeiro

\- D) Não fazer nada



\*\*Decisão inicial:\*\* \*\*Caminho C — adiar.\*\* Consulta Mesa 5 agentes recomendou 4-1 contra fix imediato.



\*\*Reavaliação no mesmo dia:\*\* Investigação para "schema markup quick fix" revelou que o problema canonical era mais profundo (3 eixos: www, .html, cross-canonical). Optou-se por fazer fix faseado: AD-20260515-06 (www) seguido de AD-20260515-07 (.html). Cross-canonicals continuam adiados.



\*\*Substituída por:\*\* AD-20260515-06 + AD-20260515-07.



\---



\## AD-20260515-02 — Sitemap.xml sem `.html`



\*\*Data:\*\* 15/05/2026 · \*\*Status:\*\* Activa · \*\*Commit:\*\* `41c478b`



\*\*Contexto:\*\* GSC: 135 páginas "Página com redireccionamento" porque sitemap apontava para `.html`. Cloudflare faz 301 para sem extensão.



\*\*Opções:\*\*

\- A) Pre-render top 30 praias (2-3 dias, alto ROI)

\- B) Sitemap surgical fix (2-3h, baixo risco)

\- C) Hybrid

\- D) Não fazer nada



\*\*Decisão:\*\* \*\*Caminho B.\*\* Apenas sitemap.xml alterado (76 URLs perdem `.html`, 78 URLs total, root PT+EN intactos).



\*\*Razões:\*\* Baixo risco; Reversível; Sinaliza Google "URLs canónicas sem extensão"; Caminho A é decisão maior.



\*\*Trade-offs:\*\* Páginas individuais (SPA) continuam não-indexáveis; Canonicals em 101 ficheiros não corrigidos.



\*\*Nota retrospectiva:\*\* Este fix corrigiu apenas um dos três eixos do problema canónico. AD-20260515-06 e AD-20260515-07 corrigiram os outros dois no mesmo dia, completando a migração SEO.



\*\*Implementação:\*\* Preview em `\_diag/sitemap-new.xml`; Validação local; Push; HTTP 200, 78 URLs, 0 `.html`; GSC re-submetido; 3 URLs prioritárias submetidas para re-indexação.



\---



\## AD-20260515-01 — Processo de trabalho novo



\*\*Data:\*\* 14/05/2026 (acordo) / 15/05/2026 (1ª aplicação) · \*\*Status:\*\* Activa



\*\*Contexto:\*\* Crisis HTTP 500 em 14/05/2026 revelou padrão problemático: founder em sprint sem auditorias, Claude reactivo sem proactividade SEO/segurança, decisões em fadiga.



\*\*Decisão:\*\* Processo formal acordado.



\*\*Regras:\*\*

1\. Quinta = auditoria semanal (GSC + GA4 + revenue streams, 30-45 min)

2\. Filtro SEO obrigatório antes de feature nova

3\. Pausa semanal obrigatória (1 dia sem código)

4\. Retrospectiva mensal (1º sábado, 1h estratégica)

5\. KPI dashboard com targets 30/90d

6\. Claude faz auditoria proactiva mensal sem pedido

7\. Decisões arquiteturais em `\_decisions/YYYY-MM-DD.md`



\*\*Compromissos Claude:\*\* filtro SEO antes feature; auditoria proactiva; senior dev real.



\*\*Compromissos Ricardo:\*\* aceitar pausa quando Claude sugere; responder honestamente; não > 8h "construir" sem pausa.



\*\*Trade-offs:\*\* Mais cerimónia, menos velocidade percepcionada. Mas: menos crises catastróficas.



\---



\## AD-20260514-04 — Redesign monet-v2 com entidades HTML



\*\*Data:\*\* 14/05/2026 · \*\*Status:\*\* Activa · \*\*Commit:\*\* `65d73cc`



\*\*Contexto:\*\* Primeira tentativa (`1e269a2`) partiu produção HTTP 500. Causa raiz: Claude Code double-encoded UTF-8 (2560+ `Ô`, 180+ `├`). Reverted via `47594c3`.



\*\*Decisão:\*\* Re-implementar com \*\*entidades HTML\*\* em vez de unicode directo:



```

é → \&eacute;     ç → \&ccedil;     à → \&agrave;     â → \&acirc;

õ → \&otilde;     · → \&middot;     — → \&mdash;      № → \&#8470;

★ → \&#9733;

```



\*\*Validação adicional:\*\* Script Python `\_diag/validate-html.py` obrigatório antes de commit (estrutura HTML + encoding + caracteres lixo).



\*\*Resultado:\*\* Deploy bem-sucedido. HTTP 200 PT + EN. Zero lixo encoding.



\*\*Regra permanente:\*\* SEMPRE entidades HTML para acentos PT em automatização.



\---



\## AD-20260514-03 — Amazon Associates 5 países UE



\*\*Data:\*\* 14/05/2026 · \*\*Status:\*\* Activa · \*\*Commit:\*\* `038291d`



\*\*Contexto:\*\* Diversificar streams. Booking rejeitado, GYG requer tráfego, Amazon aprovação imediata.



\*\*Decisão:\*\* Aprovar 5 países UE via "Earn Globally" (ES + UK + DE + IT + FR) com \*\*mesmo Store ID `pthportugal-21`\*\*.



\*\*Implementação:\*\*

\- Homepage card "Equipamento" com `?tag=pthportugal-21\&linkCode=ll2\&linkId=pth-homepage-pt`

\- EN com `linkId=pth-homepage-en\&language=en\_GB`

\- OneLink scripts tentados mas falharam (URLs genéricas)

\- Tracking funciona via tag na URL sem scripts



\*\*Trade-offs:\*\*

\- 3 vendas qualificadas obrigatórias em 180 dias ou conta encerra (deadline \~11/11/2026)

\- Cookie curto (24h)

\- Comissão baixa (1-10%)



\---



\## AD-20260514-02 — GetYourGuide full-stack integration



\*\*Data:\*\* 14/05/2026 · \*\*Status:\*\* Activa · \*\*Commits:\*\* `fd69ee1`, `1c331f5`, `7a7ac74`, `51e8677`, `b5196f4`



\*\*Contexto:\*\* GYG aprovado (partner `0WTBHZE`). Integração inicial apenas em surf/pesca, localizada a 63% da página, CTA fraco, sem tracking granular.



\*\*Decisão:\*\*

\- 6 widgets no dashboard GYG com tracking granular

\- Integrar em 39 ficheiros HTML (surf/pesca PT+EN, beaches/guias PT+EN, 13 articles PT, 13 articles EN)

\- CSS dedicado `/css/gyg-block.css` com frame editorial premium

\- CTA "RESERVAR · EXPERIÊNCIA VERIFICADA"

\- Copy trust: "Cobramos pela verificação que fazemos — nunca por posição."



\*\*Fix CSP crítico (`b5196f4`):\*\* widget bloqueado por CSP. Adicionado `widget.getyourguide.com`, `\*.getyourguide.com`, `cdn.getyourguide.com` a `script-src`, `img-src`, `connect-src`, `frame-src`.



\---



\## AD-20260514-01 — Abandonar Booking.com afiliação



\*\*Data:\*\* 14/05/2026 · \*\*Status:\*\* Activa



\*\*Contexto:\*\* Booking rejeitou via Awin (catch-22 tráfego baixo). Tentativa CJ rejeitada automaticamente.



\*\*Decisão:\*\* \*\*Abandonar Booking definitivamente.\*\*



\*\*Substituições:\*\* GetYourGuide (aprovado), Amazon (aprovado). Pendente quando tracção: Hostelworld, Vrbo, Expedia, Decathlon.



\*\*Booking mantém-se nos cards homepage como utilitário\*\* (sem revenue) até teres novo afiliado stays aprovado.



\---



\## AD-20260513-01 — Paridade total PT/EN



\*\*Data:\*\* 13/05/2026 · \*\*Status:\*\* Activa · \*\*Commits:\*\* `e34d341`, `75ba9e1`



\*\*Contexto:\*\* Footer e navegação assimétricos. Algumas páginas só em PT (`metodologia-editorial`, `transparencia-comercial`).



\*\*Decisão:\*\* Paridade total. Criar 2 páginas EN profissionalmente traduzidas:

\- `en/methodology.html` (266 linhas)

\- `en/transparency.html` (\~280 linhas)



Standardizar footer em 79 ficheiros HTML (canonical `.footer`, 7 bottom links + search form).



\---



\## AD-Earlier — Decisões fundadoras (Março 2026)



\### Stack escolhido

\- Frontend: HTML/CSS/JS estático Vanilla

\- Hosting: Cloudflare Pages

\- BD/Auth: Supabase

\- Pagamentos: ~~LemonSqueezy~~ — morto 27/04, **sem MoR aprovado** (ver AD-20260525-01)

\- Email: Resend



\### Páginas individuais de praia como SPA

\- Decisão: `beach.html?id=UUID` com render via JS + Supabase

\- Razão: velocidade desenvolvimento (80+ praias)

\- ⚠️ Trade-off oculto descoberto 15/05/2026: Google não vê conteúdo



\### Domínio canónico

`portalturismoportugal.com` (decisão inicial). \*\*Actualizado em AD-20260515-06:\*\* versão canónica oficial é `www.portalturismoportugal.com` — alinha com propriedade GSC e redirect Cloudflare.



\---



\## Template para Novas Entradas



```markdown

\## AD-YYYYMMDD-XX — Título curto



\*\*Data:\*\* YYYY-MM-DD · \*\*Status:\*\* Activa | Revertida | Substituída por AD-... · \*\*Commit:\*\* abc1234



\*\*Contexto:\*\* Por que foi necessária.



\*\*Opções:\*\*

\- A) ...

\- B) ...

\- C) ...



\*\*Decisão:\*\* Qual caminho e porquê.



\*\*Trade-offs:\*\* O que custou.



\*\*Reavaliar:\*\* Quando ou em que condição rever.