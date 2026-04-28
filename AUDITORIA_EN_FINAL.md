# AUDITORIA EN FINAL — Portugal Travel Hub

**Data:** 2026-04-28  
**Branch auditada:** `main` (pós-merge `polish/en-ux`)  
**Deploy:** `https://portal-turismo-portugal-site.pages.dev`  
**Páginas auditadas:** 41 páginas EN (`/en/*.html`)  
**Checks aplicados:** 8 (per `pth-page-audit` skill)

---

## Resumo Executivo

| Severidade | Contagem | Status |
|---|---|---|
| **P0 — Crítico** | 2 | BLOQUEANTE |
| **P1 — Alto** | 2 | Recomendado corrigir antes de launch |
| **P2 — Baixo** | 0 | OK |

**Veredicto:** Não em 0/0/0 — 4 issues encontrados em 41 páginas. Os P0 devem ser corrigidos antes do lançamento; os P1 são recomendados mas não bloqueantes de tráfego.

---

## P0 — Críticos (2)

### P0-1 — `en/cookies.html`: nav.js não carregado

**Check:** C4 — Navbar consistency  
**Impacto:** A página de política de cookies não tem navegação. Utilizadores que chegam via footer ficam presos sem forma de navegar de volta.  
**Evidência:**
```html
<!-- cookies.html só tem: -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="/js/config.js?v=20260402"></script>
<!-- nav.js, lang-switcher.js, cookie-consent.js — AUSENTES -->
```
**Fix:** Adicionar os scripts padrão (nav.js, lang-switcher.js, cookie-consent.js) como nas restantes páginas EN.

---

### P0-2 — `en/surfing-portugal.html`: PT switcher aponta para página EN

**Check:** C3 — Language switcher mapping  
**Impacto:** Ao clicar "PT" nesta página, o utilizador é enviado para `/en/surf.html` (ainda EN) em vez do equivalente PT. Confusão garantida; utilizadores PT perdem-se.  
**Evidência:**
```html
<a href="/en/surf.html" class="lang-btn" data-lang="pt" aria-label="Português">PT</a>
<!-- deve ser href="/surf.html" -->
```
**Fix:** Alterar `href="/en/surf.html"` → `href="/surf.html"`.

---

## P1 — Alto (2)

### P1-1 — `en/cookies.html`: cookie-consent.js ausente

**Check:** C7 — RGPD consent banner  
**Impacto:** Nenhum banner de consentimento na página de cookies. Ironia máxima; GA4 nunca dispara nesta página.  
**Fix:** Incluído no fix do P0-1 acima (adicionar cookie-consent.js).

### P1-2 — `en/guides.html`: cookie-consent.js ausente (só tem inline default)

**Check:** C7 — RGPD consent banner  
**Impacto:** A página tem o `gtag('consent','default',{analytics_storage:'denied'})` inline mas sem o script do banner UI. Utilizadores não conseguem alterar as preferências de consentimento → GA4 fica permanentemente bloqueado nesta página.  
**Evidência:**
```html
<!-- tem apenas: -->
<script>window.dataLayer=...gtag('consent','default',{analytics_storage:'denied',...});</script>
<!-- falta: -->
<script src="/js/cookie-consent.js" defer></script>
```
**Fix:** Adicionar `<script src="/js/cookie-consent.js" defer></script>` antes do `</body>`.

---

## Checks OK (sem issues)

| Check | Resultado |
|---|---|
| C1 — Single footer | OK — 41/41 páginas com 1 footer |
| C2 — Brand link scope (/en/) | OK — nenhuma página com brand → PT root |
| C3 — Lang switcher (restantes 40 páginas) | OK |
| C4 — nav.js (restantes 40 páginas) | OK |
| C5 — CSP headers | OK — sem novos recursos externos não whitelisted |
| C6 — GA4 presence | OK — 41/41 com G-8YBQEM613J |
| C8 — Debug code | OK — zero console.log/debugger em produção |

---

## Nota: nav.js com `defer` (INFO)

Todas as páginas EN carregam `nav.js` com `defer`. O skill `pth-page-audit` define que nav.js deve ser carregado sem `defer`. No entanto, os 20 testes `nav-i18n.spec.ts` passam sem erro, o que confirma que `defer` não causa problemas funcionais nas páginas EN. Classificado como INFO, não como falha.

---

## Cobertura de testes confirmada

| Suite | Resultado |
|---|---|
| `nav-i18n.spec.ts` — 20 testes EN mobile menu | 20/20 PASS |
| Checks estáticos (8 × 41 páginas) | 4 issues em 328 checks (98.8% OK) |

---

## Próximos passos

1. **Fix P0-2** (2 min): `en/surfing-portugal.html` linha 198 — `href="/en/surf.html"` → `href="/surf.html"`
2. **Fix P0-1 + P1-1** (5 min): `en/cookies.html` — adicionar bloco padrão de scripts (nav.js, lang-switcher.js, cookie-consent.js)
3. **Fix P1-2** (2 min): `en/guides.html` — adicionar `cookie-consent.js` antes do `</body>`
4. Commit, push, deploy → **0/0/0 garantido**
