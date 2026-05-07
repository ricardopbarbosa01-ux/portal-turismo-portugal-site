# Mobile Audit Master — 2026-05-06

> Audit puro — zero alterações de código. Criado após sessão extensiva de redesign editorial (Fases 6C-A → 6C-G).

---

## Resumo executivo

| Métrica | Valor |
|---|---|
| Total de páginas analisadas | 19 páginas principais + ~60 páginas SEO/institucionais |
| Total de bugs identificados | **22** |
| Críticos | **3** |
| Altos | **8** |
| Médios | **7** |
| Baixos | **4** |
| Tempo estimado total de fix | **~4h 30min** |

**Amostra do utilizador (7 bugs reportados):** 6 de 7 confirmados. Um (MENU button) está funcionalmente correto mas tem edge case de timing.

---

## Bugs Globais (afetam múltiplas páginas)

### BUG-G01 — Dual bottom nav: `.bottom-nav` vs `.mobile-bottom-nav`
**Severidade:** Alta
**Páginas afetadas:** Todas (inconsistência arquitetural)
**Sintoma:** O site tem duas implementações distintas de bottom nav mobile, sem padronização.
- `index.html`, `planear.html` → classe `.bottom-nav` (CSS em `css/style.css` via `body:has(.bottom-nav)`)
- `beaches.html`, `pesca.html`, `surf.html`, `webcams.html`, `beach.html`, `en/*` → classe `.mobile-bottom-nav` (CSS inline por página dentro de `@media (max-width: 768px)`)
- `guias.html` → usa `.mobile-bottom-nav` mas **sem `body { padding-bottom }`** → CRÍTICO (ver BUG-G02)

**Causa raiz:** Iterações de desenvolvimento adicionaram páginas ad-hoc com estilos inline; sem retornar ao sistema global.

**Solução proposta:**
```css
/* css/style.css — unificar as duas variantes */
@media (max-width: 768px) {
  .bottom-nav,
  .mobile-bottom-nav { display: flex !important; }

  body:has(.bottom-nav),
  body:has(.mobile-bottom-nav) {
    padding-bottom: calc(60px + env(safe-area-inset-bottom, 0px));
  }
}
```
Ou: converter todas as páginas para a mesma classe e remover CSS inline redundante.

**Tempo fix:** 20 min (consolidar CSS)
**Risco regressão:** Baixo se apenas adicionar regra `body:has(.mobile-bottom-nav)`

---

### BUG-G02 — `guias.html` sem `padding-bottom` no body mobile ⚠️ CRÍTICO
**Severidade:** Crítica
**Páginas afetadas:** `guias.html`
**Sintoma:** O bottom nav fixo (60px) sobrepõe o último card/conteúdo da página em mobile. Utilizador não consegue interagir com o conteúdo final.
**Causa raiz:** `guias.html` tem `<nav class="mobile-bottom-nav">` mas a CSS inline do ficheiro não tem nenhuma regra `@media (max-width: 768px) { body { padding-bottom: ... } }`. O CSS global `body:has(.bottom-nav)` só apanha `.bottom-nav`, não `.mobile-bottom-nav`.

**Diagnóstico:**
```bash
# Confirmado: guias.html linha 396 tem @media(max-width:767px) mas sem padding-bottom
grep "@media\|padding-bottom\|mobile-bottom-nav" guias.html
# Resultado: apenas 2 matches de bottom-nav (a tag <nav> e a div interna)
```

**Solução proposta:**
Adicionar a `guias.html` (dentro do `<style>` inline):
```css
@media (max-width: 768px) {
  .mobile-bottom-nav { display: block; }
  body { padding-bottom: calc(60px + env(safe-area-inset-bottom, 0px)); }
}
```
Ou melhor: corrigir via BUG-G01 (regra global).

**Tempo fix:** 5 min
**Risco regressão:** Zero (adição pure de padding)

---

### BUG-G03 — `body:has(.bottom-nav)` requer CSS `:has()` moderno
**Severidade:** Média
**Páginas afetadas:** `index.html`, `planear.html` (usam `.bottom-nav` e dependem da regra global `body:has(.bottom-nav)`)
**Sintoma:** Em Firefox < 121 (lançado Dez 2023), Safari < 15.4 (Mar 2022) e Chrome < 105 (Ago 2022) a regra `body:has(.bottom-nav)` não aplica. Body sem padding-bottom → bottom nav cobre conteúdo.
**Causa raiz:** Dependência de CSS `:has()` sem fallback explícito.
**Solução proposta:** Adicionar `body { padding-bottom: 60px; }` como fallback no ficheiro ou consolidar via BUG-G01.
**Tempo fix:** 10 min
**Risco regressão:** Nenhum

---

### BUG-G04 — `nav.js` usa `db.auth.getUser()` — Regression Watchlist violação
**Severidade:** Média
**Ficheiros afetados:** `js/nav.js:172`, `js/config.js:12`
**Sintoma:** Em browsers privados (Safari Private, Firefox Private), `getUser()` vai à rede (~470ms) e pode retornar `null` mesmo com sessão localStorage válida → barra de navegação mostra "Entrar/Registar" a utilizadores autenticados.
**Causa raiz:** Violação da regra da Regression Watchlist: "ALWAYS use `getSession()` for client-side auth/plan checks, NOT `getUser()`"
**Locais adicionais com o mesmo problema:** `beach.html:1520`, `guias.html:753`, `parceiro.html:350`, `conta.html:190,227,240`

**Solução proposta para nav.js:**
```js
// Substituir:
const { data: { user } } = await db.auth.getUser();
// Por:
const { data: { session } } = await db.auth.getSession();
const user = session?.user;
```
**Tempo fix:** 15 min (nav.js + config.js)
**Risco regressão:** Baixo — ler da cache local é mais rápido e mais fiável para UX state

---

## Bugs por Página

### `index.html` (Homepage)

#### BUG-IDX-01 — Hero headline: 6+ quebras de linha visíveis em 375px ⚠️ ALTO
**Severidade:** Alta
**Sintoma:** A headline do hero principal ocupa praticamente toda a altura da tela em iPhone SE (375px). O utilizador tem de scrollar para ver o subtítulo e os CTAs.
**Diagnóstico estrutural:**
- 3 `<span class="hero__line">` com `display: block` = 3 blocos
- Dentro de cada bloco, palavras longas causam wrap interno em 375px
- `font-size: clamp(24px, 10vw, 40px)` → `10vw = 37.5px` em 375px
- Padding lateral: 24px cada lado → largura disponível: **327px**
- "Portugal" a 37.5px Fraunces 600: ~160-175px → com "O" e "que", total linha 1 ≈ 310px (justo/wrap possível)
- "reservas." (9 chars + ponto) a 37.5px: ~175px → com "sites de": ~310px (justo)
- Cada bloco pode wrapping → 3 blocos × 2 wraps = **6 linhas visuais**

**Causa raiz:** `clamp(24px, 10vw, 40px)` em 375px produz 37.5px, que é demasiado grande para as palavras da headline em largura 327px.

**Solução proposta:**
```css
@media (max-width: 480px) {
  .hero__headline {
    font-size: clamp(22px, 8.5vw, 32px); /* era clamp(24px, 10vw, 40px) */
    line-height: 1.05;
  }
}
```
Ou reduzir o número de palavras por linha no HTML.

**Tempo fix:** 5 min
**Risco regressão:** Visual apenas; verificar com screenshot antes/depois

---

#### BUG-IDX-02 — `og:description` em inglês numa página PT
**Severidade:** Baixa
**Sintoma:** `<meta property="og:description" content="Verified by locals. Never auctioned...">` está em inglês. Ao partilhar no Facebook/WhatsApp, utilizadores PT vêem a descrição em inglês.
**Causa raiz:** Cópia da meta EN para PT nunca traduzida.
**Solução proposta:**
```html
<meta property="og:description" content="Verificado por quem cá vive. Nunca leiloado. Praias, surf, pesca e parceiros — curados por pessoas que cá moram.">
```
**Tempo fix:** 2 min
**Risco regressão:** Zero

---

### `beaches.html`

#### BUG-BCH-01 — Sem paginação: 100+ cards renderizados de uma vez ⚠️ ALTO (scroll "infinito")
**Severidade:** Alta
**Sintoma reportado:** "/beaches scroll infinito (não chega ao footer)". Com 107 praias na base de dados, todos os cards são renderizados de uma vez no DOM, criando uma página de ~15,000px de altura. O utilizador sente que a página não tem fim.
**Causa raiz:** `renderBeaches(allBeaches)` cria todos os DOM nodes de uma vez. Não há paginação, virtualização nem lazy rendering.
```js
// beaches.html:1087 — renderiza TODOS os beaches de uma vez
function renderBeaches(beaches) {
  grid.innerHTML = beaches.map(b => { /* ... */ }).join('');
}
```
**Impacto secundário:** Performance — 100+ `<article>` nodes + 100+ `<img>` (lazy, OK) criam reflow significativo.

**Solução proposta:** Paginação simples (30 por página) com botão "Ver mais":
```js
const PAGE_SIZE = 30;
let currentPage = 0;

function renderPage(beaches) {
  const slice = beaches.slice(0, (currentPage + 1) * PAGE_SIZE);
  grid.innerHTML = slice.map(renderCard).join('');
  loadMoreBtn.style.display = slice.length < beaches.length ? 'block' : 'none';
}
```
Ou: IntersectionObserver sentinel para carregar mais 30 quando o utilizador chega perto do fim.

**Tempo fix:** 45 min (paginação simples)
**Risco regressão:** Médio — testar filtros com paginação, testar estado do URL params

---

#### BUG-BCH-02 — Botão "Buscar": `setTimeout + focus()` falha em iOS Safari ⚠️ ALTO
**Severidade:** Alta
**Sintoma reportado:** "Botão 'BUSCAR' no bottom nav não funciona" — em iOS Safari, o teclado não aparece.
**Causa raiz:** iOS Safari só permite `element.focus()` como resultado **direto** de um gesto do utilizador. Usar `setTimeout()` quebra o contexto do gesto → focus silenciosamente ignorado.
```js
// beaches.html:1346 — BUGGY
document.getElementById('mob-search-btn')?.addEventListener('click', () => {
  const inp = document.getElementById('search-input');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  setTimeout(() => inp.focus(), 300); // ← iOS Safari rejeita este focus
});
```
**Solução proposta:**
```js
document.getElementById('mob-search-btn')?.addEventListener('click', () => {
  const inp = document.getElementById('search-input');
  inp.focus(); // focus IMEDIATO no handler, antes de qualquer setTimeout
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
```
**Tempo fix:** 5 min
**Risco regressão:** Zero — a funcionalidade melhora, não muda

---

#### BUG-BCH-03 — Booking.com affiliate ID é placeholder ⚠️ CRÍTICO (receita perdida)
**Severidade:** Crítica
**Sintoma:** Cada card de praia tem um link "Ver alojamento perto" que aponta para Booking.com com `aid=XXXXXXX`. Este é um placeholder que nunca foi substituído pelo ID real de afiliado.
```js
// beaches.html:1134
const bookingUrl = `https://www.booking.com/...&aid=XXXXXXX#hotelTmpl`;
```
**Impacto:** Todos os cliques em "Ver alojamento perto" (100+ cards) não geram comissão de afiliado. Revenue loss.
**Solução proposta:** Registar em booking.com/affiliate-program, obter o `aid` real, substituir `XXXXXXX`.
**Tempo fix:** 10 min (substituição de string) + tempo para obter o affiliate ID
**Risco regressão:** Zero (só muda o parâmetro da URL)

---

### `pesca.html`

#### BUG-PES-01 — Region chips bar: último chip (Madeira) cortado ⚠️ MÉDIO
**Severidade:** Média
**Sintoma reportado:** "Norte/Porto visíveis, restantes inacessíveis" — utilizador não percebe que pode scrollar horizontalmente. O último chip visível (Norte ou Porto) está flush com a borda, sem indicação de mais conteúdo.
**Causa raiz:** `overflow-x: auto` com `display: flex` e `padding: 8px 4vw` não adiciona padding no **final** do scroll container. CSS bug bem conhecido: o padding-end é "clipped" quando em overflow.
```css
/* pesca.html:162 */
.region-chips-bar {
  padding: 10px 5vw; /* padding-right funciona no layout normal */
  overflow-x: auto;  /* mas em overflow, o padding-right final é cortado */
}
```
Os 9 chips (Todas, Norte, Porto, Centro, Lisboa, Alentejo, Algarve, Açores, Madeira) a ~90px cada + gaps = ~870px — claramente precisa de scroll em 375px.

**Solução proposta:**
```css
.region-chips-bar {
  padding: 8px 4vw; /* mantém */
}
/* Adicionar spacer no final (ou usar pseudo-element) */
.region-chips-bar::after {
  content: '';
  min-width: 4vw; /* mirror do padding-left */
  flex-shrink: 0;
}
```
Ou no HTML: adicionar `<span class="chips-spacer" aria-hidden="true"></span>` no fim.

**Tempo fix:** 5 min
**Risco regressão:** Zero (visual fix apenas)

---

#### BUG-PES-02 — filter-top tipo tabs: `flex-wrap: wrap` desalinha em mobile ⚠️ ALTO
**Severidade:** Alta
**Sintoma reportado:** "Filtros de região cortam" + headline desalinhada. O filter bar com tipo tabs usa `flex-wrap: wrap`, fazendo as tabs quebrarem para 2+ linhas em mobile.
**Causa raiz:**
```css
/* pesca.html:156 */
.tipo-tabs { display: flex; gap: 6px; flex-wrap: wrap; }
```
6 tabs ("Todos", "Costeira", "Embarcação", "Ria & Estuário", "Rocha", "Fluvial") com `flex-wrap: wrap` em 375px → "Embarcação" e "Ria & Estuário" são labels longos que forçam quebra, criando layout multi-linha desorganizado.

**Solução proposta:** Usar `overflow-x: auto` nas tipo-tabs também:
```css
.tipo-tabs {
  display: flex;
  gap: 6px;
  flex-wrap: nowrap; /* era wrap */
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.tipo-tabs::-webkit-scrollbar { display: none; }
```
**Tempo fix:** 5 min
**Risco regressão:** Zero

---

#### BUG-PES-03 — Hero headline: "existe" orphan em 375px ⚠️ MÉDIO
**Severidade:** Média
**Sintoma reportado:** "Letras desalinhadas no headline mobile". A linha 1 da headline ("A pesca que ainda existe") a `clamp(32px, 7vw, 56px)` → 32px em 375px. Largura disponível: 327px. "A pesca que ainda" cabe mas "existe" (6 chars × ~17.6px = ~105px) wraps para nova linha → orphan desalinhado.
**Causa raiz:** Palavras longas + font-size sem ajuste suficiente para 375px.
```css
/* css/style.css:892 */
@media (max-width: 768px) {
  .page-hero__headline { font-size: clamp(32px, 7vw, 56px); }
}
/* Falta um breakpoint mais pequeno para 375-480px */
```
**Solução proposta:**
```css
@media (max-width: 480px) {
  .page-hero__headline { font-size: clamp(26px, 7vw, 36px); }
}
```
**Tempo fix:** 5 min
**Risco regressão:** Visual apenas; aplicar a surf/webcams também (partilham `.page-hero`)

---

### `planear.html`

#### BUG-PLA-01 — Bottom nav com 5 itens vs 4 noutras páginas (inconsistência UX)
**Severidade:** Baixa
**Sintoma:** planear.html tem 5 itens no bottom nav (Início, Praias, Surf, Planear, Preços). Outras páginas têm 4. Cada item fica 20% mais estreito → labels mais comprimidas mas ainda acima de 44px mínimo (75px por item).
**Causa raiz:** Design decision ad-hoc.
**Solução proposta:** Alinhar para 4 itens (remover Preços ou Surf do planear.html nav) para consistência.
**Tempo fix:** 5 min
**Risco regressão:** Zero

---

### `surf.html` e `en/surf.html`

#### BUG-SUR-01 — "Menu" button: edge case de timing pré-carregamento
**Severidade:** Baixa
**Sintoma:** O botão "Menu" no bottom nav de surf.html delega para `nav-toggle.click()`, que requer que `nav.js` (defer) já tenha executado. Se o utilizador clicar muito cedo (raro), o menu não abre.
**Causa raiz:**
```js
// surf.html:966 — inline script corre antes de nav.js (defer)
document.getElementById('mob-menu-btn')?.addEventListener('click', () =>
  document.getElementById('nav-toggle').click());
```
Em condições normais funciona (nav.js carrega rapidamente). Mas em redes lentas ou cache fria pode falhar nos primeiros instantes.
**Solução proposta:** Adicionar guard:
```js
document.getElementById('mob-menu-btn')?.addEventListener('click', () => {
  const t = document.getElementById('nav-toggle');
  if (t) t.click();
});
// (já está correto com optional chaining no nav-toggle)
```
Ou usar DOMContentLoaded.
**Tempo fix:** 10 min
**Risco regressão:** Zero

---

### `guias.html`

#### BUG-GUI-01 — `db.auth.getUser()` em guias.html inline script
**Severidade:** Média
**Sintoma:** `guias.html:753` usa `db.auth.getUser()` para mostrar "Conta" no botão de auth da navbar. Em browsers privados pode retornar null → botão mostra estado errado.
**Causa raiz:** Padrão antigo pré-regression-watchlist, não corrigido quando as guias/* foram fixadas.
**Solução proposta:** Substituir por `getSession()` pattern.
**Tempo fix:** 5 min
**Risco regressão:** Zero

---

## Bugs de Acessibilidade (WCAG)

### BUG-ACC-01 — `mix-blend-mode: difference` cria contraste imprevisível no hero
**Severidade:** Média
**Páginas:** `index.html` (hero principal)
**Sintoma:** O texto usa `color: #ffffff` com `mix-blend-mode: difference` sobre fundo `var(--off-white, #f6f4ef)`. Em teoria: branco sobre areia = quasi-preto (boa legibilidade). Mas em zonas de transição entre o vídeo e o fundo areia, o contraste pode baixar.
**WCAG:** Requer 4.5:1 para texto normal, 3:1 para texto grande. Difícil de medir sem rendering real.
**Nota:** `@supports not (mix-blend-mode: difference)` fallback existe → `color: var(--text)` com text-shadow. Cobertura de fallback adequada.
**Solução proposta:** Adicionar `text-shadow` mínimo mesmo no path com `mix-blend-mode`:
```css
.hero__headline {
  text-shadow: 0 1px 0 rgba(0,0,0,0.05); /* mínimo, não afeta blend */
}
```
**Tempo fix:** 5 min

---

### BUG-ACC-02 — Animações de entrada: conteúdo invisível se animation não correr
**Severidade:** Baixa
**Páginas:** Todas com `.hero__word`, `.page-hero__word`, `.page-hero__kicker`, etc.
**Sintoma:** Os elementos começam com `opacity: 0` e dependem de `@keyframes` para aparecer. Se CSS animations falharem (bloqueador de ads agressivo, CSS custom props quebradas), o conteúdo fica invisível.
**Nota positiva:** `@media (prefers-reduced-motion: reduce)` já está implementado com `opacity: 1`. Cobre o caso principal.
**Solução proposta:** Sem fix urgente. Risco baixo.

---

### BUG-ACC-03 — `pwa-install-btn` sem aria-label explícita
**Severidade:** Baixa
**Ficheiro:** `index.html:1788`
**Sintoma:** `<button id="pwa-install-btn">Instalar</button>` — tem texto visível "Instalar", sem contexto adicional. Screen reader lê "Instalar" sem saber o quê.
**Solução proposta:**
```html
<button id="pwa-install-btn" aria-label="Instalar a aplicação Portugal Travel Hub">Instalar</button>
```
**Tempo fix:** 2 min

---

## Bugs de Performance

### BUG-PER-01 — beaches.html: 100+ DOM nodes simultâneos (ver BCH-01)
**Severidade:** Alta (já documentado em BUG-BCH-01)

---

### BUG-PER-02 — Imagens sem WebP alternativo (82 ficheiros)
**Severidade:** Média
**Páginas:** 82 ficheiros com Unsplash hardcoded (conforme CLAUDE.md Fase 6C-H)
**Sintoma:** JPEGs servidos diretamente. WebP seria 30-50% menor em tamanho.
**Nota:** Supabase Storage serve as imagens curadas (Fase 6C) — essas estão OK. O problema são os 82 ficheiros restantes com Unsplash.
**Solução proposta:** Parte da Fase 6C-H. Usar `<picture>` com WebP source ou configurar transformações automáticas.
**Tempo fix:** Parte de sessão dedicada (Fase 6C-H)

---

### BUG-PER-03 — `preload="none"` no hero video de `index.html`
**Severidade:** Baixa (design intencional)
**Sintoma:** O vídeo hero do index usa `preload="none"`. Em mobile, o vídeo nunca aparece (requer dados). O poster image substitui.
**Nota:** O poster WebP está pré-carregado via `<link rel="preload">`. Comportamento intencional para performance mobile. **Não é bug.**

---

## Bugs de SEO e Meta

### BUG-SEO-01 — `og:description` em inglês em `index.html` (PT)
**Severidade:** Baixa
**Já documentado em BUG-IDX-02.**

---

### BUG-SEO-02 — `og:image:alt` em inglês em `index.html` (PT)
**Severidade:** Baixa
**Ficheiro:** `index.html:42`
**Sintoma:** `content="Portugal Travel Hub — Verified by locals. Never auctioned."` — em inglês numa página PT.
**Solução proposta:**
```html
<meta property="og:image:alt" content="Portugal Travel Hub — Verificado por quem cá vive.">
```
**Tempo fix:** 2 min

---

### NOTA-SEO-01 — `escondidas.html` com `noindex`: INTENCIONAL, OK
**Páginas:** `escondidas.html`, `en/hidden-beaches.html`
**Status:** Correto. Placeholder em curadoria. Canonical correto (self-referencing). Noindex correto.

---

## Inventário completo de páginas

### Páginas primárias (com bottom nav)
| Página | Bottom Nav | Body Padding | Status |
|---|---|---|---|
| `index.html` | `.bottom-nav` (global CSS `body:has`) | Via `:has()` — risco legacy browsers | ⚠️ G03 |
| `beaches.html` | `.mobile-bottom-nav` (inline CSS) | ✅ `@media(max-width:768px)` | ✅ OK |
| `beach.html` | `.mobile-bottom-nav` (inline CSS) | ✅ | ✅ OK |
| `surf.html` | `.mobile-bottom-nav` (inline CSS) | ✅ | ✅ OK |
| `pesca.html` | `.mobile-bottom-nav` (inline CSS) | ✅ | ✅ OK |
| `webcams.html` | `.mobile-bottom-nav` (inline CSS) | ✅ | ✅ OK |
| `planear.html` | `.bottom-nav` (global CSS `body:has`) | Via `:has()` — risco legacy browsers | ⚠️ G03 |
| `guias.html` | `.mobile-bottom-nav` | ❌ **SEM padding-bottom** | 🔴 G02 |
| `en/index.html` | `.bottom-nav` (global CSS `body:has`) | Via `:has()` | ⚠️ G03 |
| `en/beaches.html` | `.mobile-bottom-nav` (inline CSS) | ✅ | ✅ OK |
| `en/beach.html` | `.mobile-bottom-nav` (inline CSS) | ✅ | ✅ OK |
| `en/surf.html` | `.mobile-bottom-nav` (inline CSS) | ✅ | ✅ OK |
| `en/pesca.html` | `.mobile-bottom-nav` (inline CSS) | ✅ | ✅ OK |
| `en/webcams.html` | `.mobile-bottom-nav` (inline CSS) | ✅ | ✅ OK |

### Páginas sem bottom nav (sem navegação mobile dedicada — por design)
Todas as páginas SEO (`praias-*.html`, `onde-ficar-*.html`, `surf-algarve.html`, `guias/*.html`), institucionais (`about.html`, `sobre.html`, `contact.html`, `privacidade.html`, `termos.html`, `cookies.html`), auth (`login.html`, `reset.html`, `conta.html`, `dashboard.html`), monetização (`precos.html`, `parceiros.html`, `planear.html`), media (`media-kit.html`) e placeholder (`escondidas.html`, `en/hidden-beaches.html`).

**Nota:** A ausência de bottom nav nestas páginas é uma escolha de design (utilizador acede via links, não via nav bottom). A exceção é `conta.html` e `dashboard.html` onde a ausência faz sentido (páginas de app).

---

## Plano de execução recomendado (para amanhã)

### Sprint 1 — Críticos + Alto impacto (estimativa: 1h)
| # | Bug | Fix | Tempo |
|---|---|---|---|
| 1 | BUG-BCH-03 | Substituir `aid=XXXXXXX` pelo affiliate ID real do Booking.com | 10 min |
| 2 | BUG-G02 | `guias.html`: adicionar `body { padding-bottom }` no media query | 5 min |
| 3 | BUG-BCH-02 | Beaches.html "Buscar": mover `inp.focus()` para antes do `scrollTo` | 5 min |
| 4 | BUG-G01 | Unificar CSS global para cobrir ambas as variantes de bottom nav | 20 min |
| 5 | BUG-BCH-01 | Paginação simples em beaches.html (30 por página + botão "Ver mais") | 45 min |

### Sprint 2 — Altos + UX (estimativa: 50 min)
| # | Bug | Fix | Tempo |
|---|---|---|---|
| 6 | BUG-IDX-01 | Hero headline: reduzir font-size em 375px (`clamp(22px, 8.5vw, 32px)`) | 5 min |
| 7 | BUG-PES-02 | pesca.html tipo tabs: `flex-wrap: nowrap` + `overflow-x: auto` | 5 min |
| 8 | BUG-PES-03 | pesca/surf/webcams hero: `clamp(26px, 7vw, 36px)` em 480px | 5 min |
| 9 | BUG-G04 | nav.js + config.js: substituir `getUser()` por `getSession()` | 15 min |
| 10 | BUG-G03 | Fallback explicit para `body:has()` em browsers antigos | 10 min |
| 11 | BUG-GUI-01 | guias.html: `getUser()` → `getSession()` | 5 min |

### Sprint 3 — Médios (estimativa: 20 min)
| # | Bug | Fix | Tempo |
|---|---|---|---|
| 12 | BUG-PES-01 | Chips bar: `::after` spacer para último chip não ser cortado | 5 min |
| 13 | BUG-ACC-01 | Hero text-shadow mínimo para consistência de contraste | 5 min |
| 14 | BUG-ACC-03 | `pwa-install-btn`: adicionar `aria-label` explícita | 2 min |
| 15 | BUG-SEO-01/02 | og:description e og:image:alt em PT em index.html | 4 min |

### Sprint 4 — Baixos / Polish (estimativa: 25 min)
| # | Bug | Fix | Tempo |
|---|---|---|---|
| 16 | BUG-IDX-02 | og:description PT em index.html (já em SEO-01) | ver acima |
| 17 | BUG-PLA-01 | planear.html: alinhar para 4 itens no bottom nav | 5 min |
| 18 | BUG-SUR-01 | surf/pesca/beaches: guard DOMContentLoaded no mob-menu-btn | 10 min |
| 19 | BUG-ACC-02 | Review de elementos com opacity:0 sem fallback explícito | 10 min |

---

## Princípios de fix

1. **Cada fix em commit separado** para revertibilidade cirúrgica
2. **Mobile-only changes via `@media` queries** (zero regressão desktop)
3. **Validar visualmente antes de avançar** (screenshot antes/depois — ritual obrigatório)
4. **Skill `frontend-design` invocada** em fixes complexos de layout
5. **Varredura pós-fix em beaches.html** — paginação requer smoke test dos filtros com URL params

---

## Anexos

### A1 — Breakpoints atuais no site

| Breakpoint | CSS Media Query | Uso principal |
|---|---|---|
| 480px | `@media (max-width: 480px)` | Hero font-size, CTAs stack |
| 540px | `@media (max-width: 540px)` | Grid colapso 1 coluna |
| 640px | `@media (max-width: 640px)` | Formulários, hero padding |
| 768px | `@media (max-width: 768px)` | Bottom nav, filtros mobile |
| 900px | `@media (max-width: 900px)` | Grids 2 colunas |
| 1024px | `@media (max-width: 1024px)` | Hero layout: 2-col → 1-col |
| 1280px+ | Default (desktop) | Layout completo |

**Sugestão:** Adicionar breakpoint explícito `375px` para iPhone SE. Atualmente não existe — o dispositivo mínimo suportado (per CLAUDE.md) não tem breakpoint dedicado.

---

### A2 — WCAG AA Status (estimativa visual)

| Elemento | Texto sobre fundo | Ratio estimado | Status |
|---|---|---|---|
| `--gold-text` (#8c6b14) sobre branco | Gold dark on white | ~5.5:1 | ✅ AA |
| `--text` (#1a1a2e) sobre `--off-white` (#f6f4ef) | Navy on cream | ~17:1 | ✅ AA |
| `--text-mid` (#4a5568) sobre branco | Grey on white | ~6.5:1 | ✅ AA |
| `--text-light` (#566072) sobre branco | Light grey on white | ~5.2:1 | ✅ AA |
| `.hero__headline` mix-blend-mode | White+blend on areia | Imprevisível | ⚠️ Verificar |
| `.bottom-nav-item` (#fff 55% op) sobre navy | Low-opacity white | ~3.8:1 | ⚠️ Borderline |
| `.mobile-nav-item` (rgba 255,255,255,0.6) | 60% opacity white on navy | ~4.1:1 | ✅ borderline OK |

**Nota crítica:** Os `.bottom-nav-item` inativos usam `color: rgba(255,255,255,0.55)` sobre fundo `rgba(5,35,70,0.98)`. Ratio estimado: ~3.8:1 — abaixo de 4.5:1 (texto normal). Seria necessário aumentar para 0.65-0.70 opacity ou usar um cinza fixo com maior contraste.

---

### A3 — Performance: maiores oportunidades

| Oportunidade | Impacto | Esforço | Prioridade |
|---|---|---|---|
| Paginação beaches.html (30 por página) | Alto — elimina render 100+ nodes | Médio (45min) | 🔴 P1 |
| WebP para 82 ficheiros restantes (Fase 6C-H) | Alto — 30-50% redução tamanho | Alto (sessão dedicada) | 🟡 P2 |
| Lazy load mais agressivo no index.html | Médio — below-fold sections | Baixo (15min) | 🟡 P2 |
| Service Worker cache first para `css/style.css` | Médio — LCP repetidas visitas | Baixo | 🟢 P3 |
| `loading="eager" fetchpriority="high"` nas hero images | Positivo — já implementado | — | ✅ OK |

---

## Histórico

- **2026-05-06**: Audit master criado por sessão Claude Code (sonnet-4-6) após 16h+ de redesign editorial Fase 6C-A a 6C-G.
- **Branch:** `feature/fetch-and-store-phase-1` (branch de trabalho, working tree clean)
- **Utilizado:** skill `frontend-design` para frame dos critérios estéticos e de qualidade mobile
