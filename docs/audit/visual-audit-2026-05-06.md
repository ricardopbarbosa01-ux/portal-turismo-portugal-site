# Visual + Functional Audit — Portugal Travel Hub
**Date:** 2026-05-06  
**Method:** Playwright headless (Chromium 1.59.1)  
**Target:** https://portalturismoportugal.com  
**Viewports:** Mobile 375×667px (iPhone SE) · Desktop 1280×800px  
**Scope:** Pure audit — zero site code modified

---

## Resumo Executivo

| Métrica | Resultado |
|---------|-----------|
| Páginas auditadas | 100 |
| Runs totais (2 viewports) | 200 |
| Links verificados | 996 |
| Timestamp | 2026-05-06T20:29:46Z |
| **Issues totais** | **116** |
| 🔴 Críticos | 4 |
| 🟠 Altos | 0 |
| 🟡 Médios | 108 |
| 🔵 Baixos | 4 |
| Console errors | 189 |
| Links partidos (404) | 18 (\*17 falsos positivos — ver §5) |
| Páginas a retornar 404 | 2 |

**Veredicto:** Site é funcionalmente estável (todos os 98 fluxos-chave retornam 200). Os 4 issues críticos são todos `bottom-nav-overlap` em mobile — precisam de fix imediato antes de lançamento. Os 189 console errors são dominados por conflito CSP/TrustedTypes com GTM — potencialmente a bloquear analytics em produção.

---

## 1. Issues Críticos — Resolver Antes do Lançamento

### CRIT-01: Bottom Nav Overlap em Mobile (4 ocorrências)

O detector detetou sobreposição entre a nav mobile e o conteúdo em 4 páginas-chave:

| Página | Viewport | Nav Height | Body padding-bottom | Status |
|--------|----------|------------|---------------------|--------|
| `/index.html` | mobile 375px | 58px | 58px | ⚠️ Zero buffer |
| `/en/index.html` | mobile 375px | 58px | 58px | ⚠️ Zero buffer |
| `/planear.html` | mobile 375px | 58px | 58px | ⚠️ Zero buffer |
| `/guias.html` | mobile 375px | 1257px | 0px | 🔴 Grave — possível menu aberto |

**Nota `/guias.html`:** A altura de 1257px sugere que o seletor apanhou o painel mobile menu expandido (overlay full-height). Verificar visualmente se a página tem padding correto quando o menu está fechado.

**Nota index/planear:** padding-bottom=58px ≅ nav-height=58px — matematicamente correto mas sem buffer. Qualquer elemento com `margin-bottom` pode ainda ficar escondido. Recomendado aumentar para 72–80px.

**Fix:** Em `css/style.css`, verificar a regra `body { padding-bottom: ... }` para mobile e confirmar que cobre a altura real da bottom nav + margem de segurança.

**Screenshots:** 
- `_scripts/audit/screenshots/_index.html_mobile.png`
- `_scripts/audit/screenshots/_en_index.html_mobile.png`
- `_scripts/audit/screenshots/_planear.html_mobile.png`
- `_scripts/audit/screenshots/_guias.html_mobile.png`

---

## 2. Issues Médios — Resolver Antes do Lançamento

### MED-01: Broken Images Unsplash (22 ocorrências, 11 páginas)

Imagens Unsplash a retornar 404 ou a não carregar no momento do audit. O sistema de autofix (pexels-search edge function com onerror handler) existe mas claramente não está a funcionar a tempo de carregamento inicial nestas páginas.

**Páginas afetadas (por ordem de impacto comercial):**

| Página | Mobile | Desktop | Exemplos de imagens partidas |
|--------|--------|---------|------------------------------|
| `/index.html` | 5 imgs | 5 imgs | Praia do Camilo, Praia do Guincho |
| `/beaches.html` | 5 imgs | 5 imgs | Lagoa de Albufeira, Meia Praia |
| `/en/beaches.html` | 5 imgs | 5 imgs | Praia da Altura, Praia da Areia Branca |
| `/best-beaches-algarve.html` | 5 imgs | 5 imgs | Praia da Marinha, Gruta de Benagil |
| `/praias-algarve.html` | 5 imgs | 5 imgs | Praia da Marinha, Praia da Falésia |
| `/praias-perto-lisboa.html` | 5 imgs | 5 imgs | Praia de Carcavelos, Guincho |
| `/guias/praias-perto-lisboa.html` | 5 imgs | 5 imgs | Guincho, Tamariz |
| `/guias/melhores-praias-algarve.html` | 5 imgs | 5 imgs | Gruta de Benagil, Falésia |
| `/guias/surf-portugal-iniciantes.html` | 4 imgs | 3 imgs | Praia do Amado, Costa Caparica |
| `/praias-para-surfistas-iniciantes-portugal.html` | 4 imgs | 3 imgs | Praia do Amado |
| `/guias/pesca-portugal.html` | 3 imgs | 3 imgs | Rio Minho, Lago Alqueva |

**Causa raiz:** Photo IDs Unsplash inválidos/expirados (confirmado em audit anterior BUG-IMG-AUTOFIX). O sistema fetch-and-store (Fase 6C) resolve isto mas ainda não está aplicado a todas as páginas.

**Fix recomendado:** Priorizar Fase 3 do sistema IMG-FETCH-STORE — correr `populate-images.js` para as 11 páginas listadas. Até lá, confirmar que `onerror="autoFixImage(this)"` + `data-fallback-keyword` está presente em cada `<img>`.

### MED-02: Tap Targets Pequenos Mobile (86 ocorrências em ~43 páginas)

Botões e links com dimensão inferior a 44×44px em mobile 375px. Afeta quase todas as páginas com cards ou listas de links.

**Padrão:** Predominantemente links de navegação e badges de categorias/tags nas páginas de listagem.

**Fix:** Adicionar `min-height: 44px; min-width: 44px` a links inline e badges. Rever `css/style.css` seletores de `.tag`, `.badge`, `.nav-link`.

---

## 3. Issues Baixos

### LOW-01: Missing Meta Description (4 páginas)

| Página | Nota |
|--------|------|
| `/offline.html` | PWA offline page — OK sem meta |
| `/parceiro.html` | Página de recrutamento parceiros — adicionar meta |
| (2 outros) | A confirmar no JSON completo |

---

## 4. Páginas a Retornar 404 (2 páginas)

| URL | Causa | Fix |
|-----|-------|-----|
| `/escondidas.html` | Placeholder criado em Fase 6C-A mas não deployed | Deploy ou redirecionar para `/index.html` até ter conteúdo |
| `/en/hidden-beaches.html` | Idem versão EN | Idem |

**Nota:** Estas páginas foram intencionalmente criadas como placeholders `noindex` em Fase 6C-A. Estão linkadas a partir das homepages (card "10 praias"). O 404 é visível ao utilizador se clicar no CTA — fix urgente antes de lançamento. Opções: (a) remover o link até ter conteúdo, (b) criar stub page com "Em breve".

---

## 5. Links Partidos — 17 Falsos Positivos + 1 Real

O link checker detetou 18 links a retornar 404. **17 deles são falsos positivos** causados por um bug no checker: links relativos dentro de `/en/*.html` (e.g. `href="algarve-beaches.html"`) foram resolvidos como `portalturismoportugal.com/algarve-beaches.html` em vez de `portalturismoportugal.com/en/algarve-beaches.html`. No browser estes links resolvem corretamente porque a navegação é relativa ao path `/en/`.

**1 link real partido:**

| Link | Status | Fonte | Fix |
|------|--------|-------|-----|
| `media-kit.pdf` | 404 | `/media-kit.html` e `/en/media-kit.html` | O PDF não existe. Remover link ou gerar o PDF. |

**Falsos positivos (17) — relativos de EN pages, resolvem corretamente em browser:**
- `algarve-beaches.html` → existe em `/en/algarve-beaches.html` ✓
- `beaches-near-lisbon.html` → existe em `/en/beaches-near-lisbon.html` ✓
- `best-sunset-beaches.html` → existe em `/en/best-sunset-beaches.html` ✓
- `calm-beaches-algarve.html` → existe em `/en/calm-beaches-algarve.html` ✓
- `beaches-for-kids-portugal.html` → existe em `/en/beaches-for-kids-portugal.html` ✓
- `hidden-beaches-algarve.html` → existe em `/en/hidden-beaches-algarve.html` ✓
- `northern-portugal-beaches.html` → existe em `/en/northern-portugal-beaches.html` ✓
- `central-portugal-beaches.html` → existe em `/en/central-portugal-beaches.html` ✓
- `madeira-beaches.html` → existe em `/en/madeira-beaches.html` ✓
- `alentejo-coast-beaches.html` → existe em `/en/alentejo-coast-beaches.html` ✓
- `beginner-surf-beaches-portugal.html` → existe em `/en/beginner-surf-beaches-portugal.html` ✓
- `where-to-stay-*` (6 variantes) → existem em `/en/where-to-stay-*` ✓

**Fix ao checker (próxima versão do audit):** Resolver links relativos com base na URL de origem da página onde foram encontrados.

---

## 6. Console Errors (189 total)

### CE-01: TrustedTypes / CSP Conflict — GTM Bloqueado (44+22+22=88 erros)

```
44x: This document requires 'TrustedScript' assignment. The action has been blocked.
22x: This document requires 'TrustedHTML' assignment. The action has been blocked.
22x: This document requires 'TrustedScriptURL' assignment. The action has been blocked.
22x: Executing inline script violates CSP directive 'script-src 'nonce-...'
```

**Causa:** Cloudflare Pages está a injetar headers `Content-Security-Policy` com Trusted Types / nonces. O Google Tag Manager (GTM) usa `eval()` e innerHTML dinâmico que viola estes headers. Resultado: **GTM pode estar a falhar silenciosamente em produção**, o que afeta GA4 tracking, conversion events e qualquer tag gerida via GTM.

**Severidade:** Alta — pode estar a comprometer analytics desde o deploy.

**Fix:** 
1. Verificar se Cloudflare Pages tem regras CSP ativas (em `_headers` ou nas configurações do projeto)
2. Se sim: adicionar `'unsafe-eval'` + `'unsafe-inline'` à diretiva `script-src` para GTM, OU migrar para GTM Server-Side
3. Verificar no GTM se os tags estão a disparar em produção (GTM Preview mode)

### CE-02: XR Spatial Tracking Permission (26 erros)

```
26x: Permissions policy violation: xr-spatial-tracking is not allowed in this document.
```

**Causa:** Header `Permissions-Policy` do Cloudflare bloqueia `xr-spatial-tracking`. Vem de iframes do Google Maps ou embeds externos. **Não afeta funcionalidade** — é noise no console.

**Fix:** Baixa prioridade. Adicionar ao `_headers`: `Permissions-Policy: xr-spatial-tracking=()` para declarar explicitamente.

### CE-03: Facebook/Analytics Pixel Debug Noise (24 erros)

```
24x: %c%d font-size:0;color:transparent NaN
```

**Causa:** Artefacto de debug do Facebook Pixel ou similar. **Não afeta funcionalidade.**

### CE-04: nav.js CSP Violation em EN pages (2 erros)

```
2x: Refused to execute script from '.../en/js/nav.js?v=20260422c' because it violates CSP.
```

**Causa:** O script `/en/js/nav.js` está a ser bloqueado pela CSP em 2 páginas EN. A navegação mobile pode estar quebrada nessas páginas. Verificar se `/en/js/nav.js` existe ou se é um alias/redirect para `/js/nav.js`.

**Severidade:** Alta (se nav mobile está quebrada em EN pages).

### CE-05: 401 Unauthorized (12 erros)

```
12x: Failed to load resource: 401
```

**Causa esperada:** Chamadas Supabase a endpoints protegidos quando utilizador não está autenticado (e.g. verificar perfil Pro). **Comportamento esperado** para utilizadores anónimos — confirmar que têm graceful fallback e não mostram erro ao utilizador.

---

## 7. Top 10 Páginas com Mais Issues

| Rank | Página | Status | Issues | Tipos |
|------|--------|--------|--------|-------|
| 1 | `/index.html` | 200 | 3 | bottom-nav-overlap (CRIT) + broken-images |
| 2 | `/beaches.html` | 200 | 3 | tap-targets + broken-images |
| 3 | `/best-beaches-algarve.html` | 200 | 3 | tap-targets + broken-images |
| 4 | `/en/beaches.html` | 200 | 3 | tap-targets + broken-images |
| 5 | `/guias/melhores-praias-algarve.html` | 200 | 3 | tap-targets + broken-images |
| 6 | `/guias/pesca-portugal.html` | 200 | 3 | tap-targets + broken-images |
| 7 | `/guias/praias-perto-lisboa.html` | 200 | 3 | tap-targets + broken-images |
| 8 | `/guias/surf-portugal-iniciantes.html` | 200 | 3 | tap-targets + broken-images |
| 9 | `/offline.html` | 200 | 3 | tap-targets + missing-meta |
| 10 | `/praias-algarve.html` | 200 | 3 | tap-targets + broken-images |

---

## 8. Plano de Fix — Ordem de Prioridade

### P0 — Antes de qualquer deploy (hoje/amanhã)

| ID | Fix | Páginas | Esforço |
|----|-----|---------|---------|
| P0-A | Resolver `/escondidas.html` e `/en/hidden-beaches.html` (criar stub ou remover link do card homepage) | 2 páginas | 30min |
| P0-B | Verificar + fix `media-kit.pdf` 404 (remover link ou gerar PDF) | media-kit.html, en/media-kit.html | 15min |
| P0-C | Investigar CSP/TrustedTypes + verificar GTM em produção com GTM Preview | todos | 1h |

### P1 — Esta semana

| ID | Fix | Páginas | Esforço |
|----|-----|---------|---------|
| P1-A | Aumentar `body padding-bottom` mobile de 58px para 80px | css/style.css | 5min |
| P1-B | Confirmar `/en/js/nav.js` existe e não está a ser bloqueado por CSP | 2 EN pages | 30min |
| P1-C | Correr populate-images.js para as 11 páginas com broken Unsplash images | 11 páginas | 2h |
| P1-D | Confirmar 401s têm fallback graceful (não mostram erro ao utilizador) | planear.html + others | 30min |

### P2 — Antes do go-to-market

| ID | Fix | Esforço |
|----|-----|---------|
| P2-A | Tap targets: aumentar min-height em `.tag`, `.badge`, nav links para 44px | 1h |
| P2-B | Adicionar meta description a `/parceiro.html` e páginas sem meta | 30min |
| P2-C | Melhorar link checker para resolver relativos baseado em URL de origem | 1h dev |

---

## 9. Paths de Referência

| Artefacto | Path |
|-----------|------|
| Resultados JSON completos | `_scripts/audit/audit-results.json` (gitignored — run-local) |
| Screenshots | `_scripts/audit/screenshots/` (gitignored — run-local) |
| Script inventário | [_scripts/audit/pages-inventory.js](_scripts/audit/pages-inventory.js) |
| Script audit | [_scripts/audit/audit-runner.js](_scripts/audit/audit-runner.js) |
| Este relatório | [docs/audit/visual-audit-2026-05-06.md](docs/audit/visual-audit-2026-05-06.md) |
| Audit estático anterior | [docs/audit/mobile-audit-2026-05-06.md](docs/audit/mobile-audit-2026-05-06.md) |

---

## 10. Próximos Passos para o Utilizador

1. **Abrir screenshots dir** localmente: `_scripts/audit/screenshots/` — analisar visualmente index, planear, guias mobile
2. **GTM verification:** abrir GTM Preview em produção e confirmar se tags disparam
3. **P0-A fix:** decidir se `/escondidas.html` vai a stub ou se o link é removido do card homepage
4. **Amanhã:** planear sprint de fixes P1 (broken images + nav.js EN + padding)
5. **Re-run audit** após fixes para validar que issues críticos foram resolvidos

---

*Gerado por: `_scripts/audit/audit-runner.js` — Playwright 1.59.1 — Chromium headless*  
*Audit estático complementar: `docs/audit/mobile-audit-2026-05-06.md` (22 bugs código)*
