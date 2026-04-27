# Auditoria EN — Pré-Lançamento (2026-04-27)

**Auditor:** Claude (read-only browser audit via Playwright headless)
**URL base:** https://portal-turismo-portugal-site.pages.dev
**Viewports testados:** 375x667 (iPhone SE), 414x896 (iPhone 11 Pro Max)
**Páginas auditadas:** 8 páginas EN
**Data:** 2026-04-27
**Modo:** READ-ONLY — nenhum ficheiro de código foi modificado

---

## Resumo Executivo

| Severidade | Total | Páginas afetadas |
|------------|-------|------------------|
| P0 (blocker) | 1 | guides.html |
| P1 (major)   | 10 | beaches, surf, pesca, webcams, planear, guides, precos, parceiros (sistémico) |
| P2 (minor)   | 6 | beaches, surf, pesca, webcams, guides |

**Top 3 P0 a corrigir antes do lançamento:**
1. **[P0-EN-GUIDES-01]** `en/guides.html` não carrega `nav.js` — navbar extravasa horizontalmente a 375px e sem `#mobile-menu` (diferente de todos os outros 7 EN pages)
2. *(sem outros P0 — todas as 8 páginas retornam HTTP 200, sem console errors, sem 404s)*
3. *(P1 sistémico near-P0: "Entrar/Registar" no mobile menu em 7 de 8 páginas afeta todos os utilizadores mobile EN)*

**Estado geral por página:**

| Página | P0 | P1 | P2 | Estado |
|--------|----|----|----|----|
| /en/beaches.html | 0 | 2 | 2 | OK com ajustes |
| /en/surf.html | 0 | 2 | 1 | OK com ajustes |
| /en/pesca.html | 0 | 2 | 1 | OK com ajustes |
| /en/webcams.html | 0 | 2 | 2 | OK com ajustes |
| /en/planear.html | 0 | 2 | 0 | OK com ajustes |
| /en/guides.html | 1 | 1 | 1 | BLOQUEADO (mobile nav quebrado) |
| /en/precos.html | 0 | 2 | 0 | OK com ajustes |
| /en/parceiros.html | 0 | 2 | 0 | OK com ajustes |

**Padrões sistémicos:**
- **P1 sistémico (7 pages):** `#mobile-menu` contém "Entrar" e "Registar" (PT) em vez de "Sign In" / "Sign Up" — beaches, surf, pesca, webcams, planear, precos, parceiros
- **P1 sistémico (3 pages):** Logo nav link aponta para raiz `/` em vez de `/en/` — planear, precos, parceiros
- **P2 sistémico (5 pages):** Barra de filtros/chips com overflow horizontal (overflowX:auto, sem indicador visual) — beaches, surf, pesca, webcams + guides navbar

---

## /en/beaches.html

**Screenshot 375px:** `_audit/screenshots-en-260427/beaches-375.png`
**Screenshot 414px:** `_audit/screenshots-en-260427/beaches-414.png`

### SEO

- **Title:** "Beaches in Portugal — Map, Water Quality and Conditions · Portugal Travel Hub"
- **Meta description:** "Explore the best beaches in Portugal — from the Algarve to Madeira. Water quality, images and up-to-date information."
- **lang:** `en`
- **Canonical:** `https://portalturismoportugal.com/en/beaches.html`
- **hreflang:**
  - `pt` → `https://portalturismoportugal.com/beaches.html`
  - `en` → `https://portalturismoportugal.com/en/beaches.html`
  - `x-default` → `https://portalturismoportugal.com/beaches.html`

SEO: Aprovado. Title e meta em EN. lang="en". Canonical correto. hreflang completo.

### Console & Network

- Console errors: 0
- Console warnings: 0
- 404s: 0
- JS errors uncaught: 0
- HTTP status: 200

### Funcionalidade

- **Filtros:** `DIV.chips-bar` visível com 11 chips (All, Algarve, Lisbon & Setúbal, West Coast, Central Portugal…); 2 `<select>` presentes; filtros operacionais
- **nav.js:** Carregado (`/js/nav.js?v=20260422c`)
- **Hamburger #nav-toggle:** Presente, visível (44×44px em x=315, y=8); ao click `#mobile-menu` passa a `display:block, height:607px`
- **CTAs:** "Explore Beaches" visível (href `#main`); outros CTAs na nav desktop não visíveis a 375px (correto — estão no mobile menu)

### Achados

#### P0
Nenhum.

#### P1

- **[P1-EN-BEACHES-01]** `#mobile-menu` contém os links de auth "Entrar" e "Registar" em Português em vez de "Sign In" / "Sign Up" em Inglês. Reprodução: 375px → clicar `#nav-toggle` → menu abre → últimos 2 links são `{text:"Entrar", href:"…/en/login.html"}` e `{text:"Registar", href:"…/en/login.html#register"}`. Afeta todos os utilizadores mobile EN que tentam autenticar a partir do menu hamburger.

- **[P1-EN-BEACHES-02]** O desktop nav mostra "Log In" e "Sign Up" corretamente em EN, mas o `#mobile-menu` (injetado por `nav.js`) utiliza labels PT. Inconsistência entre a navegação desktop e mobile na mesma página EN. Indica que o `nav.js` não é sensível ao lang e injeta sempre os labels PT no `#mobile-menu`.

#### P2

- **[P2-EN-BEACHES-01]** `DIV.chips-bar` tem overflow horizontal a 375px e 414px (scrollWidth=1289px, clientWidth=375px, overflowX=auto). O scroll automático previne quebra de layout mas a barra não tem indicador visual de scroll. UX degradada: utilizadores não sabem que podem fazer scroll horizontal nos filtros.

- **[P2-EN-BEACHES-02]** O link "PT" (lang switcher para `/beaches.html`) está no desktop nav mas não visível a 375px (correto — nav desktop collapsa). Porém o `#mobile-menu` não inclui o lang switcher — utilizadores EN em mobile não têm acesso direto ao switcher PT/EN via hamburger menu.

---

## /en/surf.html

**Screenshot 375px:** `_audit/screenshots-en-260427/surf-375.png`
**Screenshot 414px:** `_audit/screenshots-en-260427/surf-414.png`

### SEO

- **Title:** "Surfing in Portugal — Spots, Waves & Guide · Portugal Travel Hub"
- **Meta description:** "The best surf spots in Portugal — Peniche, Nazaré, Algarve and Azores. Wave profile, recommended level and practical guide."
- **lang:** `en`
- **Canonical:** `https://portalturismoportugal.com/en/surf.html`
- **hreflang:**
  - `pt` → `https://portalturismoportugal.com/surf.html`
  - `en` → `https://portalturismoportugal.com/en/surf.html`
  - `x-default` → `https://portalturismoportugal.com/surf.html`

SEO: Aprovado. Title e meta em EN. lang="en". Canonical correto. hreflang completo.

### Console & Network

- Console errors: 0
- Console warnings: 0
- 404s: 0
- JS errors uncaught: 0
- HTTP status: 200

### Funcionalidade

- **Filtros:** `DIV#region-chips.region-chips-bar` com 8 chips (All Regions, North, Porto, Centro, Lisboa…); filtros operacionais. CSS class `.chips-bar` não presente (usa `.region-chips-bar`)
- **nav.js:** Carregado (`/js/nav.js?v=20260422c`)
- **Hamburger #nav-toggle:** Presente, visível (44×44px em x=315, y=8); ao click `#mobile-menu` passa a `display:block, height:607px`
- **Desktop nav auth:** "Sign In" / "Register" (EN correto); `#mobile-menu` tem "Entrar" / "Registar" (PT incorreto)

### Achados

#### P0
Nenhum.

#### P1

- **[P1-EN-SURF-01]** `#mobile-menu` contém "Entrar" e "Registar" (PT) — mesmo padrão sistémico de `[P1-EN-BEACHES-01]`. Desktop nav desta página tem "Sign In" / "Register" (EN correto) mas o mobile menu tem PT. Reprodução: 375px → hamburger → últimos 2 links.

- **[P1-EN-SURF-02]** `afterClickState.openElements` inclui `["DIV.mobile-menu", "DIV.faq-item"]` — um `.faq-item` recebe classe `open` ao clicar o hamburger. Comportamento colateral: o nav.js provavelmente usa um event listener genérico de click que propaga para elementos com classe `open`. Sem impacto visual confirmado mas indica comportamento inesperado que pode causar conflitos.

#### P2

- **[P2-EN-SURF-01]** `DIV#region-chips.region-chips-bar` overflow horizontal a 375px e 414px (scrollWidth=707px, clientWidth=343px, overflowX=auto). Mesmo padrão de beaches.html — scroll sem indicador visual.

---

## /en/pesca.html

**Screenshot 375px:** `_audit/screenshots-en-260427/pesca-375.png`
**Screenshot 414px:** `_audit/screenshots-en-260427/pesca-414.png`

### SEO

- **Title:** "Fishing in Portugal — Spots, Species & Guide · Portugal Travel Hub"
- **Meta description:** "The best fishing spots in Portugal — from Sagres and Sesimbra to the Azores. Fishing type, target species, best season and practical guide."
- **lang:** `en`
- **Canonical:** `https://portalturismoportugal.com/en/pesca.html`
- **hreflang:**
  - `pt` → `https://portalturismoportugal.com/pesca.html`
  - `en` → `https://portalturismoportugal.com/en/pesca.html`
  - `x-default` → `https://portalturismoportugal.com/pesca.html`

SEO: Aprovado. Title e meta em EN. lang="en". Canonical correto. hreflang completo.

### Console & Network

- Console errors: 0
- Console warnings: 0
- 404s: 0
- JS errors uncaught: 0
- HTTP status: 200

### Funcionalidade

- **Filtros:** `DIV#region-chips.region-chips-bar` com 9 chips (All Regions, North, Porto, Centro, Lisbon…); filtros operacionais
- **nav.js:** Carregado (`/js/nav.js?v=20260422c`)
- **Hamburger #nav-toggle:** Presente, visível (44×44px em x=315, y=8); ao click `#mobile-menu` passa a `display:block, height:607px`

### Achados

#### P0
Nenhum.

#### P1

- **[P1-EN-PESCA-01]** `#mobile-menu` contém "Entrar" e "Registar" (PT) — mesmo padrão sistémico de `[P1-EN-BEACHES-01]`. Reprodução: 375px → hamburger → últimos 2 links. O desktop nav tem "Sign In" / "Register" (EN correto).

- **[P1-EN-PESCA-02]** `afterClickState.openElements` inclui `["NAV.navbar", "DIV.mobile-menu"]` — o próprio `NAV#navbar.navbar` recebe uma classe `open` ao ativar o mobile menu via nav.js. Comportamento colateral do nav.js (mesmo script em todas as páginas nav.js). Sem impacto visual confirmado mas pode causar conflito de estilos em edge cases.

#### P2

- **[P2-EN-PESCA-01]** `DIV#region-chips.region-chips-bar` overflow horizontal a 375px e 414px (scrollWidth=798px, clientWidth=343px, overflowX=auto). Mesmo padrão de surf.html — scroll sem indicador visual.

---

## /en/webcams.html

**Screenshot 375px:** `_audit/screenshots-en-260427/webcams-375.png`
**Screenshot 414px:** `_audit/screenshots-en-260427/webcams-414.png`

### SEO

- **Title:** "Portugal Beach Webcams — Live Cameras · Portugal Travel Hub"
- **Meta description:** "Live webcams from Portugal's best beaches — Nazaré, Peniche, Ericeira, Lagos and more. Check conditions before you leave home."
- **lang:** `en`
- **Canonical:** `https://portalturismoportugal.com/en/webcams.html`
- **hreflang:**
  - `pt` → `https://portalturismoportugal.com/webcams.html`
  - `en` → `https://portalturismoportugal.com/en/webcams.html`
  - `x-default` → `https://portalturismoportugal.com/webcams.html`

SEO: Aprovado. Title e meta em EN. lang="en". Canonical correto. hreflang completo.

### Console & Network

- Console errors: 0
- Console warnings: 0
- 404s: 0
- JS errors uncaught: 0
- HTTP status: 200

### Funcionalidade

- **Filtros:** `DIV#region-chips.region-chips-bar` com 13 chips (All Regions, Porto, Centro, Lisboa, Alentejo…) + `DIV#tipo-chips.tipo-chips-bar` (tipo de webcam); ambos os filtros operacionais
- **nav.js:** Carregado (`/js/nav.js?v=20260422c`)
- **Hamburger #nav-toggle:** Presente, visível (44×44px em x=315, y=8); ao click `#mobile-menu` passa a `display:block, height:607px`

### Achados

#### P0
Nenhum.

#### P1

- **[P1-EN-WEBCAMS-01]** `#mobile-menu` contém "Entrar" e "Registar" (PT) — mesmo padrão sistémico de `[P1-EN-BEACHES-01]`. Reprodução: 375px → hamburger → últimos 2 links.

- **[P1-EN-WEBCAMS-02]** Dois elementos de filtro em overflow horizontal simultâneo a 375px: `DIV#region-chips.region-chips-bar` (scrollWidth=722px, clientWidth=343px) e `DIV#tipo-chips.tipo-chips-bar`. Utilizador em iPhone SE vê dois scrollbars horizontais sobrepostos sem indicadores visuais. Experiência especialmente fragmentada dado que webcams é uma página de consulta rápida de condições ao vivo — UX prejudicada.

#### P2

- **[P2-EN-WEBCAMS-01]** Dois filtros em overflow horizontal (ver P1-EN-WEBCAMS-02) — registado também como P2 porque mesmo com scroll:auto não há feedback visual (scroll bars ocultas em iOS Safari). Afeta UX mas não quebra funcionalidade.

- **[P2-EN-WEBCAMS-02]** `afterClickState.openElements` inclui `["NAV.navbar", "DIV.mobile-menu"]` — mesmo comportamento colateral de pesca.html. Navbar recebe classe `open` ao ativar o mobile menu.

---

## /en/planear.html

**Screenshot 375px:** `_audit/screenshots-en-260427/planear-375.png`
**Screenshot 414px:** `_audit/screenshots-en-260427/planear-414.png`

### SEO

- **Title:** "Plan Your Portugal Escape — Beach, Surf & Fishing · Portugal Travel Hub"
- **Meta description:** "Tell us what you're looking for and we'll help plan it — beach, surf, fishing or a full escape. Personalised recommendations for the best of Portugal."
- **lang:** `en`
- **Canonical:** `https://portalturismoportugal.com/en/planear.html`
- **hreflang:**
  - `pt` → `https://portalturismoportugal.com/planear.html`
  - `en` → `https://portalturismoportugal.com/en/planear.html`
  - `x-default` → `https://portalturismoportugal.com/planear.html`

SEO: Aprovado. Title e meta em EN. lang="en". Canonical correto. hreflang completo.

### Console & Network

- Console errors: 0
- Console warnings: 0
- 404s: 0
- JS errors uncaught: 0
- HTTP status: 200

### Funcionalidade

- **Formulário (#plan-form):** Presente e renderizado. Campos visíveis: `nome` (text, required), `email` (email, required), `regiao` (select), `pessoas` (select), `data_inicio` (date), `data_fim` (date), `notas` (textarea). Checkboxes `interesse` e radios `orcamento` têm `visible:false` (dentro de steps — comportamento esperado para formulário multi-step)
- **Submit button:** O `<button type="submit">` está tecnicamente presente mas oculto via CSS inline (`style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;"`, `tabindex="-1"`, `aria-hidden="true"`). Formulário usa `method="get"`. Submit funcional é ativado via JS (`planear.js`). Padrão intencional de acessibilidade/CSRF.
- **nav.js:** Carregado; hamburger funcional; `#mobile-menu` abre corretamente (display:block, height:607px)
- **Overflow:** Nenhum a 375px ou 414px
- **Logo link:** `.nav-logo` aponta para `https://portal-turismo-portugal-site.pages.dev/` (raiz PT)

### Achados

#### P0
Nenhum.

#### P1

- **[P1-EN-PLANEAR-01]** `#mobile-menu` contém "Entrar" e "Registar" (PT) — mesmo padrão sistémico de `[P1-EN-BEACHES-01]`. Reprodução: 375px → hamburger → últimos 2 links. O desktop nav desta página tem "Log In" / "Sign Up" (EN correto).

- **[P1-EN-PLANEAR-02]** Logo/brand link na navbar (`.nav-logo`) aponta para a raiz PT (`https://portal-turismo-portugal-site.pages.dev/`) em vez de `/en/`. Ao clicar no logótipo em mobile, utilizador EN é redirigido para a homepage PT. Reprodução: inspecionar `document.querySelector('.nav-logo').href` → `https://portal-turismo-portugal-site.pages.dev/`. Afeta fluxo de conversão EN (utilizador que vem via marketing EN e quer navegar para homepage EN).

#### P2
Nenhum.

---

## /en/guides.html

**Screenshot 375px:** `_audit/screenshots-en-260427/guides-375.png`
**Screenshot 414px:** `_audit/screenshots-en-260427/guides-414.png`

### SEO

- **Title:** "Portugal Travel Guides 2026 — Beaches, Surf, Fishing · Portugal Travel Hub"
- **Meta description:** "Original, researched and verified content. The details travel guides don't tell you — beaches, surf, fishing and when to visit Portugal."
- **lang:** `en`
- **Canonical:** `https://portalturismoportugal.com/en/guides.html`
- **hreflang:**
  - `pt` → `https://portalturismoportugal.com/guias.html`
  - `en` → `https://portalturismoportugal.com/en/guides.html`
  - `x-default` → `https://portalturismoportugal.com/guias.html`

SEO: Aprovado. Title e meta em EN. lang="en". Canonical correto. hreflang completo (PT URL corretamente mapeada para `/guias.html`).

### Console & Network

- Console errors: 0
- Console warnings: 0
- 404s: 0
- JS errors uncaught: 0
- HTTP status: 200

### Funcionalidade

- **nav.js:** **NÃO CARREGADO** — scripts detetados: `js?id=G-8YBQEM613J` (GA4 inline tag manager). Nenhum `nav.js` presente
- **Estrutura nav:** `NAV#navbar` tem filhos diretos: `.nav-logo`, `#nav-backdrop`, `.nav-links`, `.nav-actions`. Não há `#mobile-menu` (injetado pelo nav.js nos outros pages)
- **Hamburger #nav-toggle:** Presente, visível (`display:flex`). Ao click: ativa `.nav-links` diretamente (`display:flex, height:120px`). Comportamento diferente dos outros 7 pages (que abrem `#mobile-menu` com height 607px)
- **`#mobile-menu`:** Não existe nesta página
- **Overflow NAV:** `NAV#navbar.navbar` overflow horizontal a 375px e 414px. scrollWidth > 375px. Navbar extravasa o viewport ao nível do elemento raiz de navegação.
- **CTAs:** "Sign In" visível (`.nav-actions`), "Plan a trip" → `/en/planear.html`, "Explore beaches" → `/en/beaches.html` — CTAs visíveis e funcionais

### Achados

#### P0

- **[P0-EN-GUIDES-01]** `en/guides.html` não carrega `nav.js`. Consequência direta: (1) `NAV#navbar.navbar` overflow horizontal a 375px (a navbar extravasa o viewport; elementos visíveis mas com overflow horizontal); (2) sem `#mobile-menu` — a navegação mobile usa `.nav-links` inline com apenas `height:120px` em vez de 607px; (3) sem as funcionalidades providenciadas pelo nav.js (injeção dinâmica do mobile menu, auth state na nav, etc.). A navbar visível em mobile é fisicamente mais estreita do que o viewport, confirmado via `overflow: ["NAV#navbar.navbar"]`. Reprodução: abrir `https://portal-turismo-portugal-site.pages.dev/en/guides.html` a 375px → navbar extravasa.

#### P1

- **[P1-EN-GUIDES-01]** `NAV#navbar.navbar` overflow horizontal é o symptoma direto de `[P0-EN-GUIDES-01]`. A ausência do nav.js deixa o elemento `.nav-links` com todos os nav items expandidos inline, causando overflow. Afeta iPhone SE (375px) e iPhone 11 Pro Max (414px). Observado nos screenshots `guides-375.png` e `guides-414.png`.

#### P2

- **[P2-EN-GUIDES-01]** Após click no hamburger `#nav-toggle`, `.nav-links` abre com `display:flex, height:120px` — a área de navegação mobile é significativamente mais pequena que nos outros 7 pages (607px). Pode não mostrar todos os items de nav. CTAs principais ("Sign In", "Plan a trip", "Explore beaches") são visíveis na página principal, portanto sem bloqueio crítico adicional além do P0.

---

## /en/precos.html

**Screenshot 375px:** `_audit/screenshots-en-260427/precos-375.png`
**Screenshot 414px:** `_audit/screenshots-en-260427/precos-414.png`

### SEO

- **Title:** "Plans & Pricing — Portugal Travel Hub · Free and Pro"
- **Meta description:** "Choose the right plan for you. Free access to beaches and webcams, or unlock advanced forecasts, alerts and exclusive content with the Pro plan."
- **lang:** `en`
- **Canonical:** `https://portalturismoportugal.com/en/precos.html`
- **hreflang:**
  - `pt` → `https://portalturismoportugal.com/precos.html`
  - `en` → `https://portalturismoportugal.com/en/precos.html`
  - `x-default` → `https://portalturismoportugal.com/precos.html`

SEO: Aprovado. Title e meta em EN. lang="en". Canonical correto. hreflang completo.

### Console & Network

- Console errors: 0
- Console warnings: 0
- 404s: 0
- JS errors uncaught: 0
- HTTP status: 200

### Funcionalidade

- **Checkout CTAs:** "Start for free" → `/en/login.html#register`; "Activate Pro" → `/en/login.html?redirect=https%3A%2F%2Fportalturismoportugal.lemonsqueezy.c…` (redirect para LemonSqueezy após login); "Create free account" → `/en/login.html#register`. Fluxo de checkout EN funcional.
- **Formulário:** Nenhum (correto para pricing page)
- **nav.js:** Carregado; hamburger funcional; `#mobile-menu` abre corretamente (display:block, height:607px); `afterClickState.openElements` inclui `["DIV.nav-backdrop", "DIV.nav-links", "DIV.mobile-menu"]`
- **Overflow:** Nenhum a 375px ou 414px
- **Logo link:** `.nav-logo` aponta para `https://portal-turismo-portugal-site.pages.dev/` (raiz PT)

### Achados

#### P0
Nenhum.

#### P1

- **[P1-EN-PRECOS-01]** `#mobile-menu` contém "Entrar" e "Registar" (PT) — mesmo padrão sistémico de `[P1-EN-BEACHES-01]`. Especialmente crítico nesta página de pricing: um utilizador EN que abre o menu mobile para se autenticar (pré-requisito para o Pro checkout) vê os botões de auth em Português. Reprodução: 375px → hamburger → últimos 2 links.

- **[P1-EN-PRECOS-02]** Logo/brand link na navbar aponta para raiz PT (`/`) em vez de `/en/`. Mesmo problema de `[P1-EN-PLANEAR-02]`. Afeta utilizadores EN no fluxo de conversão crítico (precos → registo → checkout): clicar logo durante onboarding envia para homepage PT.

#### P2
Nenhum.

---

## /en/parceiros.html

**Screenshot 375px:** `_audit/screenshots-en-260427/parceiros-375.png`
**Screenshot 414px:** `_audit/screenshots-en-260427/parceiros-414.png`

### SEO

- **Title:** "Become a Partner on Portugal's Beach Portal · Portugal Travel Hub"
- **Meta description:** "Place your business on Portugal's leading beach portal. Premium visibility, qualified traffic and verified presence in front of those planning coastal trips."
- **lang:** `en`
- **Canonical:** `https://portalturismoportugal.com/en/parceiros.html`
- **hreflang:**
  - `pt` → `https://portalturismoportugal.com/parceiros.html`
  - `en` → `https://portalturismoportugal.com/en/parceiros.html`
  - `x-default` → `https://portalturismoportugal.com/parceiros.html`

SEO: Aprovado. Title e meta em EN. lang="en". Canonical correto. hreflang completo.

### Console & Network

- Console errors: 0
- Console warnings: 0
- 404s: 0
- JS errors uncaught: 0
- HTTP status: 200

### Funcionalidade

- **Formulário (#b2b-form):** Presente e renderizado com todos os campos visíveis: `negocio` (text, required), `tipo` (select, required), `objetivo` (select, required), `plano_interesse` (select), `contacto` (text, required), `email` (email, required), `localizacao` (text), `regiao` (select), `website` (url), `instagram` (url), `mensagem` (textarea)
- **Submit button:** "Submit application" (`class="b2b-submit-gold"`) — visível, texto em EN correto
- **Success element:** `.success-message` existe no DOM (hidden inicialmente, mostrado pelo JS após submit — comportamento correto)
- **nav.js:** Carregado; hamburger funcional; `#mobile-menu` abre corretamente (display:block, height:607px)
- **Overflow:** Nenhum a 375px ou 414px
- **Logo link:** `.nav-logo` aponta para `https://portal-turismo-portugal-site.pages.dev/` (raiz PT)

### Achados

#### P0
Nenhum.

#### P1

- **[P1-EN-PARCEIROS-01]** `#mobile-menu` contém "Entrar" e "Registar" (PT) — mesmo padrão sistémico de `[P1-EN-BEACHES-01]`. Página de B2B: um potencial parceiro EN a usar mobile que tenta navegar via menu hamburger vê os CTAs de auth em PT. Reprodução: 375px → hamburger → últimos 2 links.

- **[P1-EN-PARCEIROS-02]** Logo/brand link na navbar aponta para raiz PT (`/`) em vez de `/en/`. Mesmo problema de `[P1-EN-PLANEAR-02]`. Afeta utilizadores EN em fluxo B2B: clicar logo durante preenchimento do formulário de candidatura envia para homepage PT.

#### P2
Nenhum.

---

## Anexos

### A. Metodologia

- **Browser engine:** Playwright Chromium headless v1.59.0 (instalado em Portal-turismo-site/node_modules/)
- **Modo de execução:** Sequencial, fresh browser context por página e viewport (sem contaminação de estado entre páginas)
- **Aguarda:** `waitUntil: 'networkidle'`, timeout 30s por página
- **Screenshots:** Tiradas após networkidle em `_audit/screenshots-en-260427/{page}-{375|414}.png`
- **Inspeção SEO:** Via `page.evaluate()` com seletores DOM (`title`, `meta[name="description"]`, `document.documentElement.lang`, `link[rel="canonical"]`, `link[rel="alternate"][hreflang]`)
- **Overflow check:** `el.scrollWidth > document.documentElement.clientWidth + 5` para todos os elementos DOM
- **Nav test:** Click em `#nav-toggle` → aguardar 600ms → inspecionar `display`, `height`, `overflow` de `#mobile-menu` e `.nav-links`
- **Scripts check:** `document.querySelectorAll('script[src]')` para confirmar presença de `nav.js` por página
- **Form check:** Inspeção de presença, campos e atributos — sem submissão de formulários
- **Mobile menu content:** Após click no hamburger, listar todos os `<a>` dentro de `#mobile-menu`

### B. Issues conhecidos pré-existentes (não recontados como novos)

- **260424-gxf:** lang-switcher falha sistémica em 24 páginas — não auditado aqui (fora do scope das 8 páginas alvo)
- **33 ficheiros EN sem nav.js:** Confirmado que `en/guides.html` NÃO carrega nav.js (único dos 8 auditados com este problema). Os outros 7 têm nav.js carregado. O problema dos 33 ficheiros ainda existe noutras páginas não incluídas neste audit (guias individuais, SEO content pages, etc.)
- **3 EN 404s detetados em 260424-gxf:** Não reobservados nas 8 páginas auditadas — todas retornam HTTP 200

### C. Listagem de screenshots

16 ficheiros gerados (8 páginas × 2 viewports):

```
_audit/screenshots-en-260427/beaches-375.png    (375×667)
_audit/screenshots-en-260427/beaches-414.png    (414×896)
_audit/screenshots-en-260427/surf-375.png       (375×667)
_audit/screenshots-en-260427/surf-414.png       (414×896)
_audit/screenshots-en-260427/pesca-375.png      (375×667)
_audit/screenshots-en-260427/pesca-414.png      (414×896)
_audit/screenshots-en-260427/webcams-375.png    (375×667)
_audit/screenshots-en-260427/webcams-414.png    (414×896)
_audit/screenshots-en-260427/planear-375.png    (375×667)
_audit/screenshots-en-260427/planear-414.png    (414×896)
_audit/screenshots-en-260427/guides-375.png     (375×667)
_audit/screenshots-en-260427/guides-414.png     (414×896)
_audit/screenshots-en-260427/precos-375.png     (375×667)
_audit/screenshots-en-260427/precos-414.png     (414×896)
_audit/screenshots-en-260427/parceiros-375.png  (375×667)
_audit/screenshots-en-260427/parceiros-414.png  (414×896)
```

### D. Ficheiros de dados brutos

- `_audit/en-audit-raw-260427.json` — Raw findings por página e viewport (console, network, SEO, overflow, nav, forms, filters, CTAs)
- `_audit/en-audit-deep-260427.json` — Análise aprofundada: nav language check, mobile menu state, PT content check, overflow detail, checkout CTAs, parceiros form check
