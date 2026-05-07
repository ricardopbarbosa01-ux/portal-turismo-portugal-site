---
quick_id: 260507-lyp
description: Hotfix 1 — JS handlers /beach + Remover slot webcam /media-kit
date: 2026-05-07
branch: feature/mobile-hotfix-1
merged_into: main
commits:
  - 34ad80c  # fix(mobile): expose toggleAcc globally
  - c1e90cc  # content(media-kit): remove webcam sponsorship slot
  - 07b2650  # chore(cache): bump cache key to v=20260507-hf1
  - d5757b7  # fix(mobile): stopPropagation mob-menu-btn (beach, missed in 1C)
  - 2493625  # merge commit on main
backup_branch: backup/pre-hotfix-1-20260507-1448
---

## Findings — Diagnóstico 1A

**Estrutura HTML das secções afectadas:**
- Accordion custom JS (não `<details>` HTML5)
- Três painéis: "Onde Comer" (acc-food), "O que Explorar" (acc-explore), "Dicas Práticas" (acc-tips)
- Markup: `<div class="acc-item [open]" id="acc-food">` + `<button class="acc-header" onclick="toggleAcc('acc-food')">`
- Corpo: `<div class="acc-body">` com max-height CSS toggle via classe `.open`

**Selectors JS que deviam fazer expand:**
- Função `toggleAcc(id)` chamada via `onclick` inline nos botões
- Faz `.classList.toggle('open')` e `.setAttribute('aria-expanded', ...)`

**Onde stopPropagation() foi adicionado:**
- 1C adicionou `e.stopPropagation()` em `mob-menu-btn` em 13 ficheiros (pesca, surf, webcams, guias)
- beach.html e en/beach.html NÃO foram tocados em 1C

**Causa raiz da regressão (real):**
- Commit `0bd3a18` (restore de BUG-BEACH-01) envolveu todo o script de beach.html em `DOMContentLoaded`
- `toggleAcc` ficou scoped dentro do callback — `onclick` inline attributes procuram a função no scope global (`window`) apenas
- Resultado: clicar nos headers dos accordions → `ReferenceError: toggleAcc is not defined` silencioso → nenhuma expansão

**Cenário aplicado: B**
- Não relacionado com `stopPropagation` de 1C
- Causa: scoping de DOMContentLoaded herdado de `0bd3a18`

---

## Fixes aplicados

### 1A — toggleAcc global (Cenário B)
**Ficheiros:** `beach.html:1332`, `en/beach.html:1265`
**Mudança:** `function toggleAcc(id)` → `window.toggleAcc = function toggleAcc(id)`
**Resultado:** função acessível de inline `onclick` attributes

### 1A addendum — mob-menu-btn stopPropagation (encontrado durante validação)
**Ficheiros:** `beach.html:1979`, `en/beach.html:1701`
**Mudança:** `addEventListener('click', () => {...})` → `addEventListener('click', (e) => { e.stopPropagation(); ... })`
**Contexto:** beach.html foi marcado como "no change needed" em 1C, mas a race condition era idêntica. Detetada ao testar MENU no Playwright local.

### 1B — Remover slot webcam media-kit PT+EN
**Blocos removidos:**
- PT `media-kit.html`: `<div class="ratecard-row">...<div class="ratecard-name">Slot de patrocínio em webcam ao vivo</div>...<div class="ratecard-val">Sob proposta</div>...</div>` (11 linhas)
- EN `en/media-kit.html`: `<div class="ratecard-row">...<div class="ratecard-name">Live webcam sponsor slot</div>...<div class="ratecard-val">On request</div>...</div>` (11 linhas)
**Produtos mantidos:** "Spotlight em página de praia", "Perfil premium de parceiro", "Campanha sazonal / spotlight editorial" (PT) + equivalentes EN

### 1C — Cache key bump
**Cache key:** `?v=20260507-hf1` (de `?v=20260507-mob` e `?v=20260422c`)
**Ficheiros tocados:** beach.html, en/beach.html, media-kit.html, en/media-kit.html

---

## Total ficheiros editados: 4
- beach.html (toggleAcc + mob-menu-btn + cache)
- en/beach.html (toggleAcc + mob-menu-btn + cache)
- media-kit.html (webcam slot removido + cache)
- en/media-kit.html (webcam slot removido + cache)

## Validação produção
- ✅ toggleAcc global confirmado em produção (beach.html source)
- ✅ Webcam slot removido PT (portalturismoportugal.com/media-kit.html)
- ✅ Webcam slot removido EN (portalturismoportugal.com/en/media-kit.html)
- ✅ Cache key v=20260507-hf1 confirmada em produção

## Issues remanescentes
- Nenhum. Todos os P0 resolvidos.
- Playwright local: accordions não testados com dados reais (Supabase requer rede — beach data não carregou no local test). `window.toggleAcc` global foi confirmado no browser context.
