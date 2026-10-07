# Portal Turismo Site

## Project identity
- Project: portal-turismo-site
- Local path: C:\Users\Powerpc\Portal-turismo-site
- Deploy command (desde 2026-10-05 — NUNCA usar `npx wrangler pages deploy .` diretamente: o repo tem >20 000 ficheiros e o Cloudflare Pages recusa):
  powershell -ExecutionPolicy Bypass -File .\deploy.ps1 -DryRun   # ensaio: mostra contagem (~385 ficheiros), nao publica
  powershell -ExecutionPolicy Bypass -File .\deploy.ps1           # copia so ficheiros publicos para C:\Users\Powerpc\pth-dist e publica (pede confirmacao s/n)
  O deploy.ps1 exclui node_modules, .git, .agents, .claude, docs, _scripts, _diag, _audit, _data, _planning, supabase, tests, *.md, .env, *.py, *.ps1 etc.
  Se criares uma pasta publica nova cujo nome coincida com uma exclusao, ajusta o deploy.ps1. Os checks do script abortam se faltar index.html/_headers/_redirects/js/affiliate.js/css/style.css ou se aparecer .env/docs/node_modules.

## Product priorities
Prioritize in this order unless the user says otherwise:
1. Fix real bugs with commercial impact
2. Mobile-first UX
3. Perceived performance
4. Stable funnels
5. Real CRM/commercial operations
6. Monetization clarity
7. SEO/content expansion
8. Premium polish after core flows are stable

## Current strategic priorities
- English translation across the main commercial pages
- Correct B2B pricing and commercial clarity
- Automatic planning instead of any delayed-manual planning promise
- SEO content pages with real keyword intent
- PWA and push notifications later, not before core funnel/content work
- Fix critical bugs from prior audits
- Improve performance/loading
- Strengthen sales copy page by page
- Improve Media Kit and future partner/investor deck

## Token-efficiency rules
- **Orienta-te primeiro:** le `docs/REPO-MAP.md` (mapa de 1 pagina: onde esta cada coisa) em vez de explorar o repo. Historico de regressoes em `docs/REGRESSION-WATCHLIST.md`.
- Do not do repo-wide discovery unless file location is truly unknown
- If the target file is already known, go straight to implementation
- Read only the minimum blocks needed
- Avoid re-auditing already validated areas
- Prefer small, high-impact batches
- Avoid global refactors unless there is proven need
- Reuse existing patterns instead of inventing architecture
- For larger batches, prefer a fresh Claude Code session

## Model routing
- Haiku: only for cheap discovery when file location is uncertain
- Sonnet: default for implementation and normal debugging
- Opus: only for serious structural ambiguity or hard blockers

## Known high-value files
- index.html
- planear.html
- precos.html
- login.html
- dashboard.html
- parceiros.html
- media-kit.html
- contact.html
- beaches.html
- beach.html
- surf.html
- pesca.html
- webcams.html

## Fase 6C — Imagens e Curadoria Editorial

### Fase 6C-A → ✅ card persuasivo homepage (2026-05-06)
- Card `hero-secondary` adicionado a index.html e en/index.html com headline "As 10 praias que ninguém no Booking encontra"
- Páginas placeholder criadas: /escondidas.html e /en/hidden-beaches.html (noindex, em curadoria)
- Foto Praia da Ursa hardcoded de Wikimedia Commons (URL: `c/c8/Nature's_canvas.jpg`, 1920px thumb)

### Fase 6C-B → ✅ redesign editorial cinemático do hero-secondary (2026-05-06)
- Skill frontend-design invocada — direção estética magazine editorial comprometida
- Layout 2-coluna 60/40 (desktop): coluna texto + foto vertical Praia da Ursa
- Foto migrada de Wikimedia (CSP block) para Supabase Storage (UUID `a0529d77-b688-4293-ba11-8f023a69e4cf`)
- Número "10" como âncora visual: Fraunces 300 clamp(108px→210px), ouro opacity 0.9
- Hierarquia: kicker IBM Plex Mono → número+headline → linha dourada → sub → CTA
- Background: `#07152A` (navy profundo) em vez de fullscreen photo overlay
- CTA: padding generoso 16×36px, hover lift + gold glow + arrow slide
- Foto: sombra dramática + vinheta radial via ::after pseudo-element
- Animação: IntersectionObserver threshold 0.25, staggered fade-in-up 5 elementos
- Fraunces + IBM Plex Mono adicionadas ao Google Fonts (index.html + en/index.html)
- CSS cache bumped para `?v=20260506-6cb`

### Fase 6C-C → ✅ refinamentos AI-modern do hero-secondary (2026-05-06)
- Foto: border-radius assimétrico `4px 64px 4px 64px` (desktop) / `4px 40px 4px 40px` (mobile) — clipping orgânico nos cantos opostos
- Divider: `border-top` substituído por `linear-gradient` com fade transparent → dourado → transparent (80px, sem opacidade fixa)
- Background: SVG noise overlay via `::before` (mix-blend: overlay, opacity 0.4) + gradient diagonal `#07152A → #0B1B2B → #0F2235` — warmth subtilíssimo no canto superior direito
- Número "10": gradient text dourado→âmbar 135deg, `drop-shadow` filter, `breathe` animation 6s ease-in-out infinite (scale 1.0→1.015→1.0)
- Cursor-reactive parallax: divider (4px max) + foto (6px max) via requestAnimationFrame, EASE 0.08 — suave e GPU-only (transform único). `hover:none` → skip, `prefers-reduced-motion` → skip
- CSS cache bumped para `?v=20260506-6cc`

### Fase 6C-D → ✅ hero wrapper border-radius + restructure homepage 10→7 secções (2026-05-06)
- Hero wrapper (`hero__right`): border-radius assimétrico `4px 64px 4px 64px` (desktop) / `4px 40px 4px 40px` (mobile), box-shadow profundidade. Consistência visual com hero-secondary "10 praias". Zero alteração ao `<video>` element ou URLs CDN.
- Restructure homepage 10→7 secções: NEW `#what-youll-find` com 3-card grid (Condições do mar, Webcams ao vivo, Surf e Pesca). `planear-cta` agora inclui sub-banda de guides (idx-guides-band fundida). Secções `#conditions`, `#webcams`, `#surf-pesca`, `.idx-guides-band` escondidas via CSS (`display:none`) — HTML preservado para reversibilidade.
- CSS cache bumped para `?v=20260506-6cd`.

### Fase 6C-E → ✅ redesign cinemático do hero principal (2026-05-06)
- SVG clip-path em onda fluida vertical (`#hero-wave-clip`, `clipPathUnits="objectBoundingBox"`) — vídeo dentro de shape orgânico em Chrome/Firefox; border-radius assimétrico como fallback universal
- Tipografia outline+solid mix: "O/Portugal/que/nos" em `-webkit-text-stroke 1.5px` navy vazado, "não/aparece" e "sites de reservas" solid navy
- "sites de reservas" agora navy com underline dourado animado L→R — resolve bug crítico (texto branco sobre fundo areia = 1:1 contraste)
- Animação entrada staggered ~2.5s: kicker (0.2s) → 9 palavras (0.4–1.2s) → sub (1.8s) → CTAs (2.0s) → underline grow (1.6s)
- Cursor-reactive parallax: `.hero__media` (6px) + `.hero__text` counter-move (3px), EASE 0.06, `hover:none` skip, `prefers-reduced-motion` skip
- Setinha down (`.hero-scroll`) removida — era não-funcional
- Mobile fallback: `clip-path: none; border-radius: 4px 60px 4px 60px` via `@media (max-width: 768px)` (iOS Safari não suporta `clip-path: url()` em HTML)
- `prefers-reduced-motion`: `animation: none; opacity: 1; transform: none` em todos os elementos animados
- CSS cache bumped para `?v=20260506-6ce`

### Fase 6C-G → ✅ heroes pesca/surf/webcams — estilo cinemático Alt 3 (2026-05-06)
- 6 ficheiros afetados: pesca.html, surf.html, webcams.html (PT) + en/pesca.html, en/surf.html, en/webcams.html (EN)
- Novo componente CSS reutilizável `.page-hero` em css/style.css — reusa keyframes heroMediaReveal/heroWordReveal/heroFadeUp do hero principal
- SVG `#hero-wave-clip` adicionado inline antes de `<main>` em cada página
- Fraunces + IBM Plex Mono adicionados via Google Fonts (substituindo DM Sans)
- Fotos próprias do Storage: PESCA (bda7327b), SURF (7f6e2b93 · Wikimedia Sergey Mysovskiy), WEBCAMS (ec40e481)
- Cursor parallax (EASE 0.06, hover:none + prefers-reduced-motion guarded) em todas as 6 páginas
- CSS cache bumped para `?v=20260506-6cg`
- 85 → 82 ficheiros restantes com Unsplash hardcoded

### TODOs
- Páginas escondidas.html e en/hidden-beaches.html: produzir conteúdo editorial real (10 praias verificadas + fotos + texto)
- Fase 6C-H (futuro): substituir Unsplash hardcoded nos 82 ficheiros restantes

## Hard guardrails
- Do not touch auth logic without proven reason
- Do not touch LemonSqueezy flow without proven reason
- Do not touch GA4 tracking without proven reason
- Do not reopen CRM foundations without proven reason
- Do not refactor large stable areas for style only
- Do not change validated commercial flows casually

## Preferred execution style
When implementing:
1. State the exact next batch
2. Target only the needed files
3. Make localized changes
4. Validate the affected flow
5. Deploy at the end
6. Return:
   - files changed
   - what changed
   - regressions avoided
   - deploy URL

## Prompt format preference
Use this structure when preparing execution:
- Objective
- Models to use
- Files
- Change
- Test
- Deploy
- Delivery

## Current rule for tool stack
Use the right tooling in this order:
1. Official LSP for the stack
2. Project-specific skill and hook to reduce rediscovery/log noise
3. Only after that consider design/media MCPs like Stitch, 21st.dev, or Nano Banana 2

## Auditoria

Single source of truth for pre-launch audit findings: [`docs/AUDIT-MASTER.md`](docs/AUDIT-MASTER.md).

- Consolidates 9 source audit documents (security, RLS, SEO, content, bugs, brand, performance, accessibility, GDPR, LemonSqueezy, EN/PT parity).
- Status RESOLVED requires inline code evidence; default is UNKNOWN.
- Before opening a new audit, search AUDIT-MASTER.md by category ID prefix (SEC-, RLS-, BUG-, EN-, LS-, etc.) to avoid re-reporting known issues.
- Source docs in `docs/audit-*.md`, `docs/BUG_AUDIT.md`, and `docs/audits/` remain for historical detail; do not edit them — write new findings into AUDIT-MASTER.md.

## Pre-deploy ritual (mandatory for any HTML/CSS/JS change)

Before approving any deploy that touches HTML/CSS/JS:

1. Take screenshot of the production page BEFORE the change (use https://www.portalturismoportugal.com/...)
2. Apply change locally
3. Take screenshot AFTER the change in same viewport (mobile 375px AND desktop 1280px)
4. Side-by-side compare. Look for:
   - Elements that disappeared
   - Layout shifts (flex/grid broke)
   - Z-index conflicts
   - Forms with elements squeezed
   - CTAs out of viewport
5. Only then deploy
6. **After deploy** — Run the 5-URL smoke test from /docs/smoke-test.md. If any test fails, run `git revert HEAD` and redeploy immediately.

This ritual exists because automated functional tests (11/11 checks pass) do NOT catch visual regressions. A widget can be functionally working and visually broken at the same time.

## Regression watchlist

Historico completo de regressoes (pagina/componente · quando partiu · causa · o que vigiar) movido para [`docs/REGRESSION-WATCHLIST.md`](docs/REGRESSION-WATCHLIST.md) — poupa ~6K tokens por sessao. **Antes de tocar em qualquer pagina/componente com historico, consultar e atualizar la.**

### IMG-FETCH-STORE (em curso — Fase 1 concluída 2026-05-06)

**Sistema:** Substituição do autofix on-demand Pexels por fetch-and-store em Supabase Storage.

**Estado por fase:**
- Fase 1 — DB schema + Storage bucket: ✅ migrations + docs criados, pendente apply manual
- Fase 2 — Edge Function pexels-fetch-and-store: ✅ código criado, pendente deploy + teste
- Fase 3 — Script populate-images.js (Node): ✅ script criado, pendente dry-run + apply
- Fase 3.5 → ✅ Edge Function v2 com diversification (paginação aleatória posição 3-12, exclude_pexels_ids opt-in tracking, rotação de sufixos visuais). Resolve fotos repetidas detectadas no dry-run 2026-05-06. Pendente novo dry-run.
- Fase 4 → ✅ Edge Function v3 multi-source criada (Wikipedia/Wikimedia/Pexels), pendente deploy + 5-test gate validation + apply to 109. **Nota:** v2 mantida em paralelo durante validação. NÃO apagar até v3 validada com 5 praias-teste.
- Fase 5 → ✅ Sistema híbrido (Edge Function v4 simplificada + override manual via image_curated_*), pendente deploy + curadoria editorial
- Fase 5.5 → ✅ v4 ajustada com filtro anti-P&B na Camada Pexels (keyword + avg_color saturation < 0.10), pendente re-teste Fajã da Areia
- Fase 6A → ✅ Documento de curadoria editorial criado (`docs/editorial/curadoria-2026-05-06.md`). Worksheet com 21 praias (UUIDs reais da BD, links Wikimedia Category + Search por praia, 3 campos vazios por praia, SQL UPDATE batch template). Fase 6B (preenchimento manual + execução SQL + populate-images.js) pendente.
- Fase 6B → ✅ Atribuição visível (caption + tooltip) em beach.html, beaches.html, en/beach.html, en/beaches.html. CC BY-SA compliance. Caption discreta abaixo da imagem (11px, opacidade 0.6) com link clicável para source_url. Tooltip on hover/tap mostra autor · licença. Conta.html, dashboard.html, pro/welcome.html, index.html NÃO tocados.
- Fase 6B.1 → ✅ caption agora não-clicável (Padrão B), tooltip on hover mantém link. CC BY-SA compliance preservada via texto visível + tooltip + data-source-url.
- Fase 6C-E → ✅ redesign cinemático do hero principal: SVG clip-path em onda fluida vertical, tipografia outline+solid mix, underline dourado animado em "sites de reservas" (resolve bug branco invisível), entrada staggered ~2.5s, cursor-reactive parallax, setinha down removida. Fallback border-radius assimétrico para iOS Safari.
- Fase 6C-F (EXPERIMENTAL na branch `feature/hero-alt3-experiment`) → hero Alt 3 com video intercept + mix-blend-mode: difference. Headline Fraunces 600 clamp(48px–112px) atravessa o vídeo — texto quasi-preto sobre areia, inverte onde cruza pixels escuros do vídeo. Fallback @supports e mobile (<1024px) colapsa para layout sem intercept. Parallax: apenas hero__media move-se (hero__content excluído para preservar stacking context correcto). Decisão de merge para feature/fetch-and-store-phase-1 depende de validação visual do utilizador.
- Fase 6C-G → ✅ heroes pesca/surf/webcams (PT+EN, 6 ficheiros) com estilo cinemático Alt 3 (.page-hero CSS reutilizável). Fotos próprias do Storage. SVG clip-path onda + Fraunces + mix-blend-mode: difference. Cursor parallax. CSS cache `?v=20260506-6cg`. 85→82 ficheiros restantes com Unsplash.
- Fase 4.5 — Adapter HTML/CSS: pendente
- Fase 6 — Atribuição Pexels: ✅ entregue em Fase 6B
- Fase 7 — Validação produção: pendente

**Decisões arquiteturais (não re-discutir):**
- Cards estáticos de guias + heroes CSS → hardcode no HTML/CSS, sem tabela auxiliar
- Optimização (resize 1600px + WebP) → no script Node, não na Edge Function
- Curadoria → tudo automático, com dry-run + relatório HTML revisável antes de UPDATEs
- Vídeos hero (cdn.portalturismoportugal.com/*.mp4) → NÃO TOCAR
- Camadas Wikimedia geo-search e text-search abandonadas — provaram apanhar ficheiros irrelevantes (florestas, homónimos noutras regiões como Fajã da Ribeira da Areia Açores quando se queria Madeira).
- v4 substitui funcionalmente a v2 e v3 mas mantém ambas vivas durante validação. Apagar quando v4 confirmada com 109 praias.
- Override manual via image_curated_url/author/source_url tem prioridade absoluta sobre Wikipedia e Pexels. image_curated_* são campos de input editorial e nunca são escritos pela Edge Function.

**NÃO fazer:**
- Não criar tabela `card_images` (decisão do conselho 2026-05-05: hardcode é a escolha certa para conteúdo estático)
- Não popular `beaches.image_url` com URLs Pexels diretas — sempre Storage URLs
- Não correr populate sem dry-run primeiro
- Não tocar em /pro/welcome.html, /index.html, .claude/worktrees/*

### Mandatory rule for closing any bug fix

When fixing ANY bug (visual, functional, security, data), the closing checklist MUST include:

1. Add an entry to the Regression watchlist em `docs/REGRESSION-WATCHLIST.md` with: page/component, date, root cause one-liner, what to watch
2. If the bug class is new, add a new row. If it matches an existing row, append the date to the "Last broke" cell as comma-separated dates (e.g., "04/05/2026, 12/06/2026")
3. The pre-deploy ritual screenshot pair (before/after) is mandatory — no exception for "trivial" fixes
4. Reference the fix commit hash in the SUMMARY.md so future audits can git blame back

Failing to add a watchlist entry means the bug WILL regress. Treat this rule as non-skippable.

## Task scope contracts (mandatory before any code change)

Before writing code for ANY task, the agent MUST declare in writing:

1. **Files in scope**: explicit list of files this task may modify (e.g., "Files: surf.html, en/surf.html").
2. **Lines/sections in scope** when known (e.g., "Lines 489-510 .surf-alerts-form CSS rule").
3. **Out of scope**: anything not declared above is OFF-LIMITS for modification.

When the user gives a task framed as "cleanup X across multiple files" (e.g., "remove navbar CSS from all pages"), the agent MUST:

- Declare an EXPLICIT pattern that defines what is being removed (e.g., regex or string match).
- Confirm BEFORE running that the pattern only matches the intended content.
- Show a sample dry-run on 1-2 files first; user approves before scaling to all files.
- Never use broad delete operations like "remove inline scripts" or "clean up styles" without a precise selector.

Failing this rule produces incidents like BUG-BEACH-01 (commit 2abc649 deleted 2300+ JS lines in beach.html / en/beach.html during a "navbar cleanup" task).

## Pre-commit ritual (mandatory before every commit)

Before running `git commit`, the agent MUST:

1. Run `git diff --stat` and inspect the result.
2. Compare with the declared "Files in scope" from the Task scope contract.
3. If the diff touches files NOT declared in scope, ABORT the commit, report the unexpected files to the user, and ask for explicit confirmation.
4. If the diff touches lines or counts WAY OUT OF PROPORTION to what was declared (e.g., declared "alter ~3 lines" but diff shows "+1364 lines"), ABORT and confirm.
5. Only proceed with commit after the diff matches expectation.

This ritual exists because automated tests do not catch "wrong file modified" — they only catch "code is broken". A commit that silently deletes a working script will pass all unit tests because there are no unit tests covering that script.

## Afiliados e monetizacao (sessao 2026-10-05) — LER antes de mexer em links de parceiros

Fonte de verdade detalhada: documento de projeto `claude/afiliados-2026-10.md` (claude.ai Project) + 2 linhas em `docs/REGRESSION-WATCHLIST.md`.

**Em producao** (commit 2b8b3bb, deploy e6f0b2fa; deploy.ps1 em f9e26ba):
- `js/affiliate.js` (carregado com `<script src="/js/affiliate.js?v=20261005" defer>` logo apos config.js) em 20 paginas: onde-ficar-*.html (7), en/where-to-stay-*.html (7), beaches PT/EN, planear PT/EN, beach PT/EN.
  - Envia evento GA4 `affiliate_click` {partner, link_destination, page_path} por delegacao (mousedown/touchstart/click/auxclick, capture). Cobre links dinamicos.
  - Parceiros reconhecidos: booking, stay22, discovercars, viator, simpson_travel, getyourguide, amazon, awin, cj.
  - Reescrita Booking via CJ esta DESLIGADA (`var BOOKING = { pid:'', adId:'', aid:'' }`). Nunca chamar preventDefault/stopPropagation neste ficheiro.
- **Stay22 LetMeAllez** (lmaID `6ac371f3b7bfdedf2d37801a`, AID `kaptarstudio`, conta ola@portalturismoportugal.com, 30% commission share) inline logo apos a tag do affiliate.js em 18 paginas (as mesmas EXCETO beach.html/en/beach.html).
  - Troca links booking.com no mousedown para `www.stay22.com/allez/booking?aid=kaptarstudio&campaign=<pagina>` → redireciona para booking.com.
  - beach PT/EN excluidos de proposito: `js/beach-page.js` tem 17 links de texto GYG (partner_id=0WTBHZE) e o LinkSwap do Stay22 tem GetYourGuide ativo. So adicionar Stay22 a paginas com links GYG diretos depois de o suporte Stay22 desativar GYG no LinkSwap.
- **CSP em `_headers`** (obrigatorio para o Stay22): script-src + `https://scripts.stay22.com`; connect-src + `https://www.stay22.com https://scripts.stay22.com`; `worker-src 'self' blob:`. Sem worker-src o script carrega mas NAO troca links (falha silenciosa). Ao adicionar qualquer script de terceiros, atualizar o CSP e testar com o CSP real (Playwright sem bypassCSP).

**Estado das redes:**
- CJ (conta "Ricardo DEV", espaco promocional "Portal Turismo Portugal" ID 101718235): candidaturas pendentes Booking.com Spain & Portugal (4347393) e Booking.com United Kingdom (4297311), 4%. A Booking ja nao aceita afiliados pela Awin (Booking Brazil rejeitado 13/05/2026 → redireciona para CJ).
- Awin (publisher 2886261): Simpson Travel (54551) JOINED — 3%, cookie 30d, pagamento medio 190d, so Algarve; sem links no site por agora. VROOEM, GoWithGuide e World Businesses for Sale: convites ignorados (nao rejeitados). VROOEM testado: ~€1,59/reserva em Faro → nao compensa.
- GetYourGuide direto: partner_id 0WTBHZE (nao mudar campaign labels — ver watchlist).

**Regras:**
- Regra do Ricardo: nenhum link de parceiro que nao fature. Links Booking sem aid nao rendem — hoje rendem via Stay22.
- Quando a CJ aprovar a Booking: NAO ativar `BOOKING` no affiliate.js nas paginas onde o Stay22 esta ativo (dupla reescrita). Comparar receita Stay22 vs CJ e escolher um. Se CJ: `BOOKING = { pid:'101718235', adId:'<AID do link Booking na CJ>' }`, bump `?v=` em todas as paginas que carregam affiliate.js, testar 1 clique real.
- Pendentes: pedir ao Stay22 para desligar GYG no LinkSwap e se o AID "kaptarstudio" pode ser renomeado (portal esta a venda); rever Spark/Nova (ativos por defeito no Stay22) apos 1–2 semanas; confirmar evento `affiliate_click` no GA4.

**Atualizacao 2026-10-05/06 (sessao seguinte):**
- Stay22: suporte EXCLUIU GetYourGuide do LinkSwap (05/10) → Stay22 tambem em beach.html/en/beach.html. AID "kaptarstudio" nao e editavel (fica). Pagamento configurado.
- DiscoverCars LIVE: `?a_aid=portalturismoportugal` (deep links /pt/portugal/faro, /portugal/lisbon, etc.) na lista "Proximo passo" das 14 paginas onde-ficar/where-to-stay + rodape da homepage PT/EN (CLAUDE.md antigo dizia "nao tocar em index.html" — Ricardo decide se mantem).
- BookSurfCamps/Tripaneer LIVE: `?aid=11861` no card "Surf Trip" de surf.html/en/surf.html (affiliate.js?v=20261005b). affiliate.js reconhece tambem `booksurfcamps` (familia Tripaneer) e `fishingbooker`.
- Guia novo `guias/alugar-carro-algarve.html` + `en/car-hire-algarve.html` (concurso DiscoverCars Q3 2026; A22 sem portagens desde 01/01/2025, Lei 37/2024).
- Hub de guias: novos guias tem de entrar em `GUIA_CARDS` (js/webcams-guias-data.js) com `published: 'AAAA-MM-DD'` + bump `?v=` em guias.html e en/guides.html + sitemap + link interno. Badge NOVO e automatico (so o guia mais recente, 30 dias) — nao usar isNew. Ver watchlist.
- Pendentes de aprovacao: FishingBooker, Motorhome Republic (inclui Indie Campers/Roadsurfer), Travelpayouts (conta criada; NAO instalar o script "Drive" — troca links, insere blocos e abre pop-unders; pedido ao suporte para acesso sem Drive). Indie Campers NAO existe na CJ.
- Proximo trabalho: planeador automatico (`claude/planeador-automatico-2026-10.md`), Fase A = motor de regras em planear.html com links de parceiros pre-preenchidos.

**Notas de ambiente:**
- Sessoes Cowork (VM Linux) veem o working tree com CRLF vs HEAD LF → `git diff` mostra dezenas de ficheiros "modificados" so por fim de linha. Usar `git --no-optional-locks diff --ignore-cr-at-eol --stat`. Comandos git que escrevem o index a partir da VM deixam `.git/index.lock` que a VM nao consegue apagar e que bloqueia o git no Windows — commits e deploys fazem-se no PowerShell do Windows.
- Validacao usada nesta sessao (reutilizar): Playwright na pagina de producao com o HTML local servido via route + header CSP lido do `_headers` local; comparar screenshots 375/1280 pixel a pixel; smoke test dos 5 URLs de docs/smoke-test.md apos deploy.

## Important note
This repository is optimized by doing the smallest commercially meaningful next step, not by broad exploration.
