# Estado /beaches mobile — 8 Maio 2026

> Auditoria autónoma gerada por Claude Code em 2026-05-11 com base em:
> docs/AUDIT-MASTER.md, docs/KNOWN-ISSUES-EN.md, CLAUDE.md (regression watchlist),
> código-fonte beaches.html + en/beaches.html, js/beaches-paginate.js, git log.

---

## O que está OK

- **Hero PT** (beaches.html): vídeo CDN correto (`beaches-hero.mp4`), overlay `rgba(6,13,26,0.65)`, `.page-header-inner` com `z-index:2` garante texto visível acima do overlay. ✅
- **Hero PT mobile fallback**: `@media(max-width:768px)` com CDN poster correto `https://cdn.portalturismoportugal.com/beaches-hero-poster.jpg`. ✅ (commit 681a726)
- **Padding-top .page-header PT**: 96px — limpa navbar fixa no mobile. ✅ (commit 19d68e9)
- **Hero EN CDN poster**: `en/beaches.html` tem fallback mobile correto com CDN `beaches-hero-poster.jpg`. ✅ (commit 6e21b83)
- **Padding-top .page-header EN**: `96px` aplicado. ✅ (commit e030068)
- **Paginator PT**: `js/beaches-paginate.js` carregado em beaches.html (linha 1365), MutationObserver ativo sobre `#beaches-grid`, suporte bilíngue via `document.documentElement.lang`. ✅
- **Bottom nav PT/EN beaches**: class `mobile-bottom-nav` correta, `body { padding-bottom: calc(80px + env(safe-area-inset-bottom)) }` inline, `e.stopPropagation()` no mob-menu-btn. ✅ (watchlist 1A, 1C)
- **Filter chips scroll affordance**: `mask-image: linear-gradient(to right, ...)` aplicado. ✅ (watchlist 1D)
- **Bottom nav guias.html**: class mismatch resolvido em commit 681a726. ✅
- **Unsplash hero beaches.html PT**: substituído por CDN próprio em commit 681a726. ✅

---

## Bugs conhecidos pendentes

(Fonte: AUDIT-MASTER.md)

| ID | Severidade | Título |
|----|-----------|--------|
| BRAND-03 | Medium | Filter chips bar: sem indicador de scroll em 375px — não confirmado visualmente se fix 1D cobriu EN também |
| BUG-I18N-CARDS-EN | High | Cards beaches/beach em rotas EN continuam a renderizar nome/descrição/tags em PT — sem colunas `name_en`/`description_en` na tabela `beaches`. Workaround: banner i18n injetado em 43 páginas EN (commit 175e0e0). Fix real: migração de schema + JS adapter. |
| BUG-IMG-FETCH-STORE | Medium | Sistema híbrido de imagens Storage (Fases 1-6B) entregue mas Fase 7 (validação produção) pendente. |
| A11Y-04 | Low | Mobile menu EN não tem language switcher no hamburger — EN mobile não consegue mudar para PT via menu. |
| EN-04 | Medium | lang-switcher falhou em 24 páginas — re-auditoria completa não confirmada. |

---

## Bugs novos descobertos nesta sessão (8 Maio)

Identificados por git log + diff direto código-fonte:

| Bug | Descrição | Commit fix |
|-----|-----------|-----------|
| Bottom nav class mismatch guias.html | `.bottom-nav` vs `.mobile-bottom-nav` causava padding errado | 681a726 ✅ |
| Hero Unsplash → CDN PT | beaches.html mobile fallback trocado para CDN próprio | 681a726 ✅ |
| Kicker padding-top PT | `.page-header` padding-top aumentado para 96px (limpa navbar) | 19d68e9 ✅ |
| Padding-top EN | `en/beaches.html` padding-top 96px | e030068 ✅ |
| Hero Unsplash → CDN EN | `en/beaches.html` mobile fallback CDN poster | 6e21b83 ✅ |

---

## Validados pelo Ricardo nesta sessão como pendentes

- **"Overlay EN parece mais escuro que PT"** — reportado 17h22
- **"100 praias scroll" / paginator EN faltando** — reportado: scroll de todas as praias sem paginação

---

## Diagnóstico autónomo

### 1. Paginator EN em falta — CONFIRMADO

**Evidência:**

```
beaches.html linha 1365:
  <script src="/js/beaches-paginate.js?v=20260507-mob" defer></script>  ✅

en/beaches.html:
  (ausente — zero ocorrências de "beaches-paginate")               ❌
```

**Análise do script:**
- `js/beaches-paginate.js` usa `document.getElementById('beaches-grid')` — seletor idêntico ao que existe em `en/beaches.html` (linha 791 EN)
- Detecção de idioma via `document.documentElement.lang === 'en'` — funciona corretamente com `<html lang="en">` da página EN
- Botão "Load More" renderiza "Show N more" em EN vs "Ver mais N" em PT — i18n coberto
- MutationObserver re-aplica após cada `renderBeaches()` que substitui `grid.innerHTML` — padrão idêntico entre PT e EN

**Conclusão:** O script é 100% compatível com EN. Basta adicionar o `<script>` tag à `en/beaches.html` na mesma posição (depois do closing `</main>`, antes de `</body>` ou onde existe em PT).

**Fix:** Adicionar em `en/beaches.html` antes de `</body>`:
```html
<script src="/js/beaches-paginate.js?v=20260507-mob" defer></script>
```

---

### 2. Overlay EN "mais escuro" — DIAGNÓSTICO: BUG z-index, NÃO diferença de overlay

**Evidência comparada:**

```
PT beaches.html CSS (linhas 167-173):
  .page-header-video  { z-index: 0 }              ← vídeo na base
  .page-header-overlay{ z-index: 1 }              ← overlay por cima
  .page-header-inner  { position:relative; z-index: 2 } ← texto ACIMA overlay

PT beaches.html HTML (linha 666):
  <div class="page-header-inner">                 ← wrapper cria stacking context
    <div class="page-tag">...</div>
    <h1 class="page-title">...</h1>
    ...
  </div>

EN en/beaches.html CSS (linhas 426-429):
  .page-header-video  { z-index: 0 }              ✅ igual
  .page-header-overlay{ z-index: 1 }              ✅ igual
  .page-header-inner  { AUSENTE }                 ❌ CSS missing

EN en/beaches.html HTML (linha 651+):
  <div class="page-header-overlay"></div>
  <div class="page-tag">...</div>               ← fora de qualquer wrapper
  <h1 class="page-title">...</h1>               ← SEM .page-header-inner
  ...
```

**Mecanismo do bug:**
Sem `.page-header-inner` (que teria `position:relative; z-index:2`), o texto EN está no normal flow do `<header>`. Segundo a CSS painting order (CSS 2.1 §E), elementos block em normal flow são pintados no passo 3, enquanto elementos posicionados com z-index positivo são pintados no passo 7. O overlay (`z-index:1`) é pintado SOBRE o texto.

Resultado visual: texto EN renderiza-se **por baixo** da overlay de 65% navy escuro. O texto não é totalmente invisível (35% transparência do overlay deixa passar algo) mas está muito atenuado — a página parece um bloco escuro monolítico sem contraste, o que Ricardo descreve como "overlay mais escuro."

**Também em falta no EN:**
- `text-shadow` no `.page-title`, `.page-subtitle`, `.page-tag` — presentes no PT, ausentes no EN
- Comentário CDN no `@media(max-width:768px)` — irrelevante para UX mas indica que o EN foi porteado antes de alguns fixes

**Hipótese A (cache stale):** Descartada. O diff de código é real — `.page-header-inner` genuinamente ausente.
**Hipótese B (mesma imagem CDN):** Confirmada para a imagem, mas a diferença visual vem da falta do wrapper, não da imagem.
**Hipótese C (CSS sobreposto):** Confirmada — é esta. A regra `.page-header-inner{position:relative;z-index:2}` está no PT e ausente do EN.

**Fix completo para EN:**

1. Adicionar CSS ao `<style>` da en/beaches.html (após `.page-header-overlay`):
```css
.page-header-inner{position:relative;z-index:2;}
.page-title{text-shadow:0 2px 28px rgba(0,0,0,0.70),0 1px 6px rgba(0,0,0,0.55);}
.page-subtitle{text-shadow:0 2px 14px rgba(0,0,0,0.65),0 1px 4px rgba(0,0,0,0.45);}
.page-tag{text-shadow:0 1px 8px rgba(0,0,0,0.55);}
```

2. Envolver o conteúdo do hero EN em `<div class="page-header-inner">`:
```html
<div class="page-header-overlay" aria-hidden="true"></div>
<div class="page-header-inner">                <!-- WRAPPER ADICIONADO -->
  <div class="page-tag">Editorial curation...</div>
  <h1 class="page-title">Beaches of <em>Portugal</em></h1>
  <p class="page-subtitle">...</p>
  <div style="display:flex;...">CTAs</div>
  <div class="hero-stats"...>...</div>
</div>                                         <!-- FIM WRAPPER -->
<svg class="page-header-wave"...>              <!-- fora do inner, correto -->
```

---

## Próximo prompt sugerido

Prompt monolítico para resolver os 2 bugs restantes em /beaches mobile (nenhum blocking, mas UX degradado):

```
Fix 2 EN beaches bugs (ambos em en/beaches.html):

BUG 1 — Paginator EN em falta:
Adicionar em en/beaches.html antes de </body>:
  <script src="/js/beaches-paginate.js?v=20260507-mob" defer></script>
(exatamente como existe em beaches.html linha 1365)

BUG 2 — Hero texto oculto sob overlay EN:
No bloco <style> de en/beaches.html, após linha
  `.page-header-overlay{...}` (linha 427),
adicionar:
  .page-header-inner{position:relative;z-index:2;}
  .page-title{text-shadow:0 2px 28px rgba(0,0,0,0.70),0 1px 6px rgba(0,0,0,0.55);}
  .page-subtitle{text-shadow:0 2px 14px rgba(0,0,0,0.65),0 1px 4px rgba(0,0,0,0.45);}
  .page-tag{text-shadow:0 1px 8px rgba(0,0,0,0.55);}

No HTML do <header class="page-header">, envolver o conteúdo (da linha
seguinte ao <div class="page-header-overlay"...> até antes do <svg class="page-header-wave">)
numa div:
  <div class="page-header-inner">
    [page-tag + h1 + p + CTAs + hero-stats]
  </div>

Regras:
- Só tocar en/beaches.html (não beaches.html PT — está correto)
- Pre-deploy ritual screenshots 375px + 1280px antes e depois
- Adicionar entry regression watchlist CLAUDE.md
- Commit atómico com referência a este relatório
```

---

## Sumário executivo

| Item | Estado |
|------|--------|
| Hero PT (vídeo + overlay + texto) | ✅ Correto |
| Hero EN (CDN poster mobile) | ✅ Correto |
| Hero EN (texto acima overlay) | ❌ Bug z-index — `.page-header-inner` ausente |
| Hero EN (text-shadow) | ❌ Ausente |
| Paginator PT (20 cards + Load More) | ✅ Ativo |
| Paginator EN | ❌ Script não carregado |
| BUG-I18N-CARDS-EN | ⚠️ Workaround ativo, fix real pendente |
| Bottom nav PT+EN | ✅ Correto |
| Filter chips scroll affordance | ✅ Correto |
