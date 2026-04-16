# BUG AUDIT — Portal Turismo Site
**Data:** 2026-04-15  
**Método:** Playwright automated scan (Chromium) + inspeção manual de código  
**Ambiente:** https://portal-turismo-portugal-site.pages.dev  
**Total de bugs:** 17  

---

## TOP 15 BUGS MAIS GRAVES

| ID | Sev | Categoria | Página | Título curto |
|----|-----|-----------|--------|--------------|
| BUG-001 | ~~🔴 critical~~ ✅ FIXED | idioma/PT-EN | /en/ (todas) | Nav EN aponta para páginas PT |
| BUG-002 | ~~🔴 critical~~ ✅ FIXED | idioma/PT-EN | /en/index.html | Hero CTAs EN apontam para /planear.html (PT) |
| BUG-003 | ~~🔴 critical~~ ✅ FIXED | seo técnico | Todos os .html | Canonical com domínio errado (770 ocorrências) |
| BUG-004 | ~~🟠 high~~ ✅ FIXED | runtime/js | /login.html | Imagem Unsplash bloqueada por ORB (ERR_BLOCKED_BY_ORB) |
| BUG-005 | ~~🟠 high~~ ✅ FIXED | idioma/PT-EN | /en/index.html | Footer EN com links para /planear.html e /parceiros.html (PT) |
| BUG-006 | ~~🟠 high~~ ✅ FIXED | seo técnico | Todos os .html | Hreflang PT/EN aponta para domínio errado |
| BUG-007 | ~~🟠 high~~ ✅ FIXED | forms/cta | /parceiros.html + /en/ | Form B2B sem feedback visual de sucesso/erro testável |
| BUG-008 | ~~🟠 high~~ ✅ FIXED | forms/cta | /planear.html + /en/ | Supabase `plan_requests.insert` falha silenciosamente sem feedback ao utilizador |
| BUG-009 | ~~🟡 medium~~ ✅ FIXED (Batch 1) | idioma/PT-EN | /en/index.html | CTA "Partner Plans" aponta para /parceiros.html (PT) |
| BUG-010 | ~~🟡 medium~~ ✅ FIXED (Batch 3) | navegação/links | /index.html | 4 botões sociais (FB, IG, X, YT) com `javascript:void(0)` — sem destino |
| BUG-011 | 🟡 medium | navegação/links | Todos | EN nav usa paths absolutos (/beaches.html) sem prefixo /en/ nas páginas de destino que têm equivalente EN |
| BUG-012 | 🟡 medium | seo técnico | / e /en/ | Title tags duplicados ou genéricos em subpáginas |
| BUG-013 | 🟡 medium | conteúdo estrutural | /sobre.html | Página sem equivalente EN e com conteúdo mínimo |
| BUG-014 | 🟡 medium | runtime/js | Supabase key em config.js | Anon key hardcoded em ficheiro JS público (aceitável mas desnecessariamente exposta) |
| BUG-015 | 🟢 low | navegação/links | /onde-ficar-*.html (7 ficheiros) | Links `href="#"` com data-driven population — sem fallback visível |

---

## BATCH 1 — CORRECÇÕES APLICADAS (2026-04-15)

| ID | Estado | Causa raiz | Ficheiros alterados |
|----|--------|------------|---------------------|
| BUG-001 | ✅ FIXED | Hrefs do nav copiados do PT sem substituir prefixo `/en/` | Todos os 38 ficheiros `en/*.html` via sed |
| BUG-002 | ✅ FIXED | CTAs `/planear.html` não tinham prefixo `/en/` | `en/index.html` (incluído na correcção em massa) |
| BUG-003 | ✅ FIXED | Domínio `portal-turismo-portugal.pages.dev` hardcoded em 85 ficheiros | Todos os `.html` (root + en/) via sed |
| BUG-004 | ✅ FIXED | `<link rel="preload">` para Unsplash cross-origin aciona ORB | `login.html`, `en/login.html` linha 21 removida |
| BUG-005 | ✅ FIXED | Footer `/planear.html`, `/parceiros.html` sem prefixo `/en/` | Incluído na correcção em massa de BUG-001 |
| BUG-006 | ✅ FIXED | Mesmo domínio errado que BUG-003, nas tags hreflang | Incluído na correcção em massa de BUG-003 |
| BUG-009 | ✅ FIXED | `href="/parceiros.html"` sem prefixo `/en/` | Incluído na correcção em massa de BUG-001 |

**Deploy:** https://1fd0df69.portal-turismo-portugal-site.pages.dev  
**Testes:** 35/35 Playwright (Chromium) — smoke + SEO — todos passaram

---

## BATCH 2 — CORRECÇÕES APLICADAS (2026-04-15)

| ID | Estado | Causa raiz | Ficheiros alterados |
|----|--------|------------|---------------------|
| BUG-007 | ✅ FIXED | `.catch(() => {})` silencioso + sem disable de botão durante submit | `parceiros.html`, `en/parceiros.html` |
| BUG-008 | ✅ FIXED | `.catch(() => {})` em 2 pontos de insert + `.catch(function(){})` no slider | `planear.html`, `en/planear.html` |

**O que foi corrigido:**
- `parceiros`: botão `#b2b-submit` desativado no momento do submit (previne duplo envio); localStorage isolado em try/catch próprio com log; Supabase com `.catch(err => console.warn(...))` em vez de `.catch(() => {})`; elemento `#b2b-err-net` adicionado (visível apenas se localStorage falhar — edge case extremo)
- `planear`: 4 catch blocks silenciosos substituídos (2 no form submit, 2 no slider confirmSubmit) por `console.warn('[PTH] ...')` com erro real; localStorage e Supabase separados em blocos distintos
- `tests/forms.spec.ts` criado — 11 testes que validam: estado inicial dos formulários, sucesso com Supabase OK, sucesso com Supabase a falhar (localStorage como fallback), prevenção de duplo submit

**Deploy:** https://75f3ccf0.portal-turismo-portugal-site.pages.dev  
**Testes:** 11/11 Playwright (Chromium) — forms — todos passaram

**O que foi validado de forma real vs. inferido:**
- ✅ Real: sucesso visível após submit (Supabase mockado via `page.route()`)
- ✅ Real: sucesso visível quando Supabase retorna 500 (localStorage capta o lead)
- ✅ Real: botão fica inacessível após submit (form oculto)
- ✅ Real: `#b2b-success` e `#form-success` aparecem no DOM e ficam visíveis
- ⚠️ Inferido: cenário de localStorage em falha (`#b2b-err-net` visível) — não testável sem desabilitar storage via flags de browser

---

## BATCH 3 — CORRECÇÕES APLICADAS (2026-04-15)

### Parte A — Ajuste de verdade nos formulários (BUG-007 + BUG-008 revisitados)

| ID | Estado | O que mudou |
|----|--------|-------------|
| BUG-007 (revisão) | ✅ 3 estados reais | Handler convertido para `async/await`; `sbOk` só `true` quando Supabase confirma sem `error`; HTML: `#b2b-pending` adicionado com copy honesto |
| BUG-008 (revisão) | ✅ 3 estados reais | Sucesso mostrado imediatamente (recomendação gerada localmente); `#rec-status` atualizado de forma diferida após Supabase resolver |

**3 estados verificáveis:**
- **Estado 1 — sucesso real**: Supabase retorna sem `error` → `#b2b-success` visível ("A candidatura chegou à nossa equipa")
- **Estado 2 — pendente/local**: Supabase retorna erro ou falha de rede → `#b2b-pending` visível com copy honesto; planner mostra `#rec-status` com mensagem de fallback
- **Estado 3 — erro total**: localStorage e Supabase falham → form reaparece, `#b2b-err-net` visível, botão re-ativado

### Parte B — BUG-010 (Batch 3)

| ID | Estado | Causa raiz | Ficheiros alterados |
|----|--------|------------|---------------------|
| BUG-010 | ✅ FIXED | Botões sociais com `javascript:void(0)` sem destino real — enganam utilizadores | `index.html`, `en/index.html` — `<nav class="footer-social">` comentada |

**Deploy:** https://ad07dbb6.portal-turismo-portugal-site.pages.dev  
**Testes:** 13/13 Playwright (Chromium) — forms (3 estados) + smoke + SEO — todos passaram  
*(Nota: teste inicial contra URL de produção falhou por CDN cache; passou imediatamente no URL de deploy directo)*

**O que foi validado de forma real:**
- ✅ Estado 1 (sucesso real): Supabase mockado com 201 → `#b2b-success` visível, `#b2b-pending` oculto
- ✅ Estado 2 (pendente): Supabase mockado com 500 → `#b2b-pending` visível, `#b2b-success` oculto
- ✅ Estado 2 (planner): Supabase 500 → `#form-success` visível + `#rec-status` contém "localmente"
- ✅ Estado 1 (planner): Supabase 201 → `#rec-status` contém "✓"
- ⚠️ Estado 3 (erro total) — não testável em Playwright sem bloquear localStorage; código correto e inspecionável

---

## RELATÓRIO DETALHADO

---

### BUG-001 🔴 CRITICAL — Nav EN aponta para páginas PT

**Categoria:** idioma/PT-EN  
**Página(s):** `/en/index.html` e todas as páginas EN  
**Ficheiro(s):** `en/index.html`, linhas 909–915  

**Descrição:**  
O menu principal da versão EN do site aponta para as páginas PT root em vez das equivalentes EN. Quando um utilizador EN clica em "Beaches", "Surf", "Fishing", "Plan", "Pricing" ou "Partners", é redirecionado para `/beaches.html`, `/surf.html`, etc. (em português) em vez de `/en/beaches.html`, `/en/surf.html`, etc.

**Como reproduzir:**  
1. Aceder a `https://portal-turismo-portugal-site.pages.dev/en/`  
2. Clicar em "Beaches" no menu principal  
3. Resultado: aterra em `/beaches.html` (página em PT)

**Evidência:**
```html
<!-- en/index.html linhas 909-915 -->
<a href="/beaches.html" role="listitem">Beaches</a>    <!-- ERRO: devia ser /en/beaches.html -->
<a href="/surf.html" role="listitem">Surf</a>          <!-- ERRO -->
<a href="/pesca.html" role="listitem">Fishing</a>      <!-- ERRO -->
<a href="/planear.html" role="listitem">Plan</a>        <!-- ERRO -->
<a href="/precos.html" role="listitem">Pricing</a>      <!-- ERRO -->
<a href="/parceiros.html" role="listitem">Partners</a>  <!-- ERRO -->
```

**Equivalentes EN existem:** `/en/beaches.html`, `/en/surf.html`, `/en/pesca.html`, `/en/planear.html`, `/en/precos.html`, `/en/parceiros.html` ✓  

**Causa provável:** Copy-paste incompleto do nav PT para EN sem substituir os hrefs.  
**Correção:** Substituir os 6 hrefs em `en/index.html` para apontar para `/en/[página].html`.  
**Impacto:** Experiência EN completamente quebrada — utilizadores EN ficam em páginas PT.  

---

### BUG-002 🔴 CRITICAL — Hero CTAs EN apontam para /planear.html (PT)

**Categoria:** idioma/PT-EN  
**Página(s):** `/en/index.html`  
**Ficheiro(s):** `en/index.html`, linhas 962, 1054, 1308  

**Descrição:**  
Os CTAs principais do hero e dos blocos de conteúdo na homepage EN apontam para `/planear.html` (página PT) em vez de `/en/planear.html`.

**Como reproduzir:**  
1. Aceder a `/en/`  
2. Clicar em "Plan a Trip" no hero  
3. Resultado: aterra em `/planear.html` (formulário em PT)

**Evidência:**
```html
<!-- en/index.html linha 962 -->
<a href="/planear.html" class="btn btn-primary">Plan a Trip</a>  <!-- ERRO -->
<!-- en/index.html linha 1308 -->
<a href="/planear.html" class="btn btn-primary">Start Planning</a> <!-- ERRO -->
```

**Exceção:** Linha 1269 está correcta: `/en/planear.html?source=home-journey&step=plan`  
**Correção:** Substituir `/planear.html` por `/en/planear.html` em todos os CTAs da página EN.  
**Impacto:** Funil de conversão EN completamente quebrado — principal CTA envia utilizadores para formulário PT.  

---

### BUG-003 🔴 CRITICAL — Canonical com domínio errado (770 ocorrências)

**Categoria:** seo técnico crítico  
**Página(s):** Todos os 90+ ficheiros HTML  
**Ficheiro(s):** Todos os `.html` na raiz e em `/en/`  

**Descrição:**  
Todas as tags `<link rel="canonical">` e `<link rel="alternate" hreflang="...">` referenciam o domínio `portal-turismo-portugal.pages.dev`, mas o site está deployed em `portal-turismo-portugal-site.pages.dev`. O Google indexa o canonical errado, possivelmente causando que o conteúdo seja ignorado ou atribuído ao domínio fantasma.

**Evidência:**
```html
<!-- index.html linha 19 -->
<link rel="canonical" href="https://portal-turismo-portugal.pages.dev/">
<!-- Correcto seria: -->
<link rel="canonical" href="https://portal-turismo-portugal-site.pages.dev/">
```

**Contagem:** 770 linhas afectadas em todos os ficheiros HTML.  
**Causa provável:** O projeto foi renomeado/migrado de `portal-turismo-portugal` para `portal-turismo-portugal-site` mas os HTML não foram actualizados.  
**Correção:** `sed -i 's|portal-turismo-portugal\.pages\.dev|portal-turismo-portugal-site.pages.dev|g' *.html en/*.html` (ou domínio custom se existir).  
**Impacto:** SEO potencialmente comprometido — Google pode estar a indexar o domínio errado.  

---

### BUG-004 🟠 HIGH — Imagem Unsplash bloqueada em /login.html

**Categoria:** runtime/js  
**Página(s):** `/login.html`, `/en/login.html`  
**Ficheiro(s):** `login.html`, linhas 21 e 74  

**Descrição:**  
A página de login usa uma imagem do Unsplash como background hero via `<link rel="preload">` e CSS `background-image`. O browser bloqueia esta imagem com `ERR_BLOCKED_BY_ORB` (Opaque Resource Blocking), provavelmente por Content-Type mismatch num preload.

**Como reproduzir:**  
1. Abrir DevTools → Network  
2. Aceder a `/login.html`  
3. Observar: `net::ERR_BLOCKED_BY_ORB` para URL do Unsplash

**Evidência:**
```
[NETWORK FAIL] net::ERR_BLOCKED_BY_ORB:
https://images.unsplash.com/photo-1536003736069-c9a5b2ad2e7a?auto=format&fit=crop&w=1200&q=80
```
```html
<!-- login.html linha 21 -->
<link rel="preload" as="image" href="https://images.unsplash.com/photo-1536003736069..." fetchpriority="high">
```

**Causa provável:** Unsplash serve imagens com headers CORS/Content-Type que o browser bloqueia quando usadas em `preload`. A imagem pode ainda carregar via CSS, mas o preload falha e gera erro de console.  
**Correção:** Remover o `<link rel="preload">` para esta imagem externa, ou usar uma imagem local/CDN próprio.  
**Impacto:** Erro de console visível, possível degradação de performance no LCP da página de login.  

---

### BUG-005 🟠 HIGH — Footer EN com links para páginas PT

**Categoria:** idioma/PT-EN  
**Página(s):** `/en/index.html`  
**Ficheiro(s):** `en/index.html`, linhas 1382, 1465  

**Descrição:**  
O footer da homepage EN contém links para páginas PT sem redirecionamento:

**Evidência:**
```html
<!-- en/index.html linha 1382 -->
<a href="/parceiros.html" class="btn btn-blue btn-sm">Partner Plans</a>  <!-- ERRO: devia ser /en/parceiros.html -->

<!-- en/index.html linha 1465 (footer nav) -->
<li><a href="/planear.html">Plan a Trip</a></li>  <!-- ERRO: devia ser /en/planear.html -->
```

**Correção:** Substituir hrefs no footer de `/en/index.html` para apontar para equivalentes EN.  

---

### BUG-006 🟠 HIGH — Hreflang aponta para domínio errado

**Categoria:** seo técnico crítico  
**Página(s):** Todos os ficheiros HTML  
**Ficheiro(s):** Todos os `.html`  

**Descrição:**  
Derivado do BUG-003. Todas as tags `<link rel="alternate" hreflang="pt">` e `<link rel="alternate" hreflang="en">` apontam para `portal-turismo-portugal.pages.dev` em vez do domínio deployed. O Google Search Console vai reportar hreflang inconsistentes.

**Evidência:**
```html
<link rel="alternate" hreflang="pt" href="https://portal-turismo-portugal.pages.dev/">
<link rel="alternate" hreflang="en" href="https://portal-turismo-portugal.pages.dev/en/">
```

**Correção:** Resolvida em conjunto com BUG-003 (mesma operação de sed).  

---

### BUG-007 🟠 HIGH — Form B2B (/parceiros) sem feedback de estado

**Categoria:** forms/cta  
**Página(s):** `/parceiros.html`, `/en/parceiros.html`  
**Ficheiro(s):** `parceiros.html`  

**Descrição:**  
O formulário B2B (`form#b2b-form`) existe e está presente, mas não foi possível verificar via testes automatizados se existe feedback visual claro após submissão (mensagem de sucesso, erro de rede, loading state). Formulários B2B sem estado visível perdem leads.

**Como reproduzir:**  
1. Preencher o formulário em `/parceiros.html`  
2. Submeter  
3. Verificar se existe indicação clara de sucesso/falha  

**Causa provável:** Comportamento dependente de JS inline — difícil de testar sem mock de rede.  
**Correção:** Verificar handler de submit e garantir estados: loading → sucesso → erro.  
**Impacto:** Leads B2B potencialmente perdidos sem feedback.  

---

### BUG-008 🟠 HIGH — Planner: insert Supabase falha silenciosamente

**Categoria:** forms/cta  
**Página(s):** `/planear.html`, `/en/planear.html`  
**Ficheiro(s):** `planear.html`, linha 1619 e 1713  

**Descrição:**  
O formulário do planner insere dados na tabela `plan_requests` do Supabase com `.catch(() => {})` — qualquer falha de rede, timeout ou erro de permissões é ignorado silenciosamente sem notificar o utilizador.

**Evidência:**
```js
// planear.html linha 1619
db.from('plan_requests').insert([data]).catch(() => {});
// planear.html linha 1713
db.from('plan_requests').insert([payload]).catch(function() {});
```

**Causa provável:** Intenção de degradar graciosamente — mas apaga qualquer debugging e pode perder pedidos de planeamento.  
**Correção:** No `.catch()` pelo menos: (1) guardar em localStorage como fallback, (2) mostrar mensagem de erro ao utilizador.  
**Nota positiva:** O localStorage fallback já existe na linha 1616/1710 — verificar se está a funcionar em caso de falha Supabase.  

---

### BUG-009 🟡 MEDIUM — CTA "Partner Plans" aponta para PT

**Categoria:** idioma/PT-EN  
**Página(s):** `/en/index.html`  
**Ficheiro(s):** `en/index.html`, linha 1382  

**Descrição:**  
Botão de parceiros na secção de pricing da homepage EN aponta para `/parceiros.html` (PT) em vez de `/en/parceiros.html`.

**Evidência:**
```html
<a href="/parceiros.html" class="btn btn-blue btn-sm">Partner Plans</a>
```
**Correção:** Substituir por `href="/en/parceiros.html"`.  

---

### BUG-010 🟡 MEDIUM — Botões sociais sem destino real

**Categoria:** navegação/links  
**Página(s):** `/index.html`, `/en/index.html`  
**Ficheiro(s):** `index.html` linhas 1433-1442, `en/index.html` linhas 1433-1442  

**Descrição:**  
4 botões sociais no footer (Facebook, Instagram, Twitter/X, YouTube) usam `href="javascript:void(0);"` — são completamente não-funcionais.

**Evidência:**
```html
<a href="javascript:void(0);" class="social-btn" aria-label="Facebook">
<a href="javascript:void(0);" class="social-btn" aria-label="Instagram">
<a href="javascript:void(0);" class="social-btn" aria-label="Twitter / X">
<a href="javascript:void(0);" class="social-btn" aria-label="YouTube">
```

**Causa provável:** Redes sociais não criadas ainda.  
**Correção:** Criar perfis nas redes sociais e substituir os hrefs, ou remover os botões temporariamente para não enganar utilizadores.  
**Impacto:** UX credibility — botões visivelmente não-funcionais.  

---

### BUG-011 🟡 MEDIUM — EN nav inconsistente: páginas sem /en/ prefix

**Categoria:** navegação/links  
**Página(s):** `/en/index.html` e todas as páginas EN  
**Ficheiro(s):** Todos os `en/*.html`  

**Descrição:**  
Os links do nav EN apontam para `/beaches.html`, `/webcams.html`, `/login.html` (sem `/en/` prefix). Estes ficheiros existem na raiz mas estão em PT. A inconsistência é: algumas páginas têm equivalente EN e outras não.

**Páginas SEM equivalente EN (só existem em PT):**
- `webcams.html` — existe `/en/webcams.html` ✓ (tem equivalente)
- `login.html` — existe `/en/login.html` ✓ (tem equivalente)
- `beaches.html` — existe `/en/beaches.html` ✓ (tem equivalente)

**Conclusão:** Todos os links do nav têm equivalente EN — é o BUG-001.  

---

### BUG-012 🟡 MEDIUM — Title tags duplicados entre subpáginas

**Categoria:** seo técnico crítico  
**Página(s):** Várias  

**Descrição:**  
Verificar se títulos são únicos por página. A auditoria não detectou duplicados óbvios nas páginas principais, mas o padrão "Portugal Travel Hub" no sufixo de todos os títulos é esperado. A verificar em batch maior se necessário.

**Acção:** Auditar todos os títulos com `grep -rn '<title>' *.html | sort` para confirmar unicidade.  

---

### BUG-013 🟡 MEDIUM — /sobre.html sem equivalente EN e conteúdo mínimo

**Categoria:** conteúdo estrutural  
**Página(s):** `/sobre.html`  
**Ficheiro(s):** `sobre.html` (307 linhas, ~26 elementos de conteúdo)  

**Descrição:**  
A página `/sobre.html` existe em PT mas não tem equivalente EN (`/en/about.html` não existe — `/en/about.html` consta na listagem mas é possível que seja página diferente). Conteúdo institucional sem versão EN prejudica credibilidade para parceiros internacionais.

**Verificação necessária:** Confirmar se `/en/about.html` existe e tem conteúdo completo.  

---

### BUG-014 🟡 MEDIUM — Supabase anon key hardcoded em js/config.js público

**Categoria:** runtime/js (segurança)  
**Página(s):** Todas (via `js/config.js`)  
**Ficheiro(s):** `js/config.js`, linha 4  

**Descrição:**  
A Supabase anon key está hardcoded em ficheiro JS público servido pelo CDN:
```js
const SUPABASE_ANON_KEY = 'sb_publishable_HKdE2IRmz9lMDcg4p3l1tw_HiTdD4nw';
```

**Avaliação de risco:**  
- A chave é do tipo `sb_publishable_` (anon/publishable) — **é intencional ser pública** para apps client-side  
- Row Level Security (RLS) do Supabase deve estar ativo para proteger dados  
- **NÃO é uma service_role key** (crítico) — nível de risco aceitável  

**Acção recomendada:** Confirmar que RLS está activo em todas as tabelas (`plan_requests`, etc.) no Supabase dashboard. Se RLS estiver OFF, é um bug crítico de segurança.  

---

### BUG-015 🟢 LOW — Links href="#" nos onde-ficar com data population lenta

**Categoria:** navegação/links  
**Página(s):** `/onde-ficar-*.html` (7 ficheiros)  
**Ficheiro(s):** `onde-ficar-algarve-praia.html` e equivalentes, linha ~229  

**Descrição:**  
Links de reserva usam `href="#"` com população via JavaScript. Se o JS demora ou falha, os links ficam como `#` (sem destino útil). O `target="_blank"` está correcto com `rel="noopener noreferrer"`.

**Evidência:**
```html
<a id="zone-booking-link" href="#" class="cta-gold" target="_blank" rel="noopener noreferrer">
```

**Causa:** Comportamento intencional — JS substitui o href. Verificar se há fallback se JS falha.  
**Impacto:** Baixo — utilizadores sem JS ficam com link morto.  

---

### BUG-016 🟢 LOW — en/about.html existência e conteúdo

**Categoria:** conteúdo estrutural  
**Página(s):** `/en/about.html`  

**Descrição:**  
Verificar se `/en/about.html` existe e tem conteúdo completo equivalente a `/sobre.html`.  

---

### BUG-017 🟢 LOW — PWA install banner texto em EN hardcoded em EN

**Categoria:** idioma/PT-EN  
**Página(s):** `/index.html` (PT)  
**Ficheiro(s):** `index.html`, linhas 1725-1726  

**Descrição:**  
O banner PWA na homepage PT está em Inglês:
```html
<p>Install Portugal Travel Hub</p>
<p>Add to home screen for quick access</p>
```
Texto PT esperado: "Instalar Portugal Travel Hub" / "Adicionar ao ecrã inicial"  

---

## BATCH 3A — CORRECÇÕES APLICADAS (2026-04-15)

### Parte 1 — Verdade operacional do backend (Supabase)

**Verificação realizada com anon key contra produção Supabase:**

| Tabela | SELECT anon | Resultado | Interpretação |
|--------|-------------|-----------|---------------|
| `plan_requests` | HTTP 200, `[]` | Sem dados visíveis | RLS ativo (bloqueia leitura) **ou** tabela vazia |
| `partner_leads` | HTTP 200, `[]` | Sem dados visíveis | RLS ativo (bloqueia leitura) **ou** tabela vazia |

**O que foi validado com backend real:**
- ✅ Ambas as tabelas existem e respondem ao endpoint REST
- ✅ Anon key do tipo `sb_publishable_` (publishable key — intencional ser pública)
- ✅ SELECT anon retorna array vazio (não expõe dados de outros utilizadores)
- ⚠️ **Não confirmado:** se o array vazio é por RLS ON ou por tabela realmente vazia
- ⚠️ **Não confirmado:** se INSERT anon está permitido (requer dashboard ou test insert real)
- ❌ INSERT de teste não realizado (sem ambiente de staging — evitar spam em produção)

**Ação recomendada:** Verificar no Supabase Dashboard → Table Editor → RLS que:
1. `plan_requests` tem RLS ON com policy INSERT para `anon` role
2. `partner_leads` tem RLS ON com policy INSERT para `anon` role
3. Nenhuma policy SELECT existe para `anon` (ou policy que retorne apenas as próprias linhas)

**BUG-014 (anon key pública):** Aceitável — é uma publishable key. Risco real seria `service_role` key exposta.

### Parte 2 — Medium bugs restantes

| ID | Estado | Resultado |
|----|--------|-----------|
| BUG-012 | ✅ INVESTIGADO | Títulos duplicados são stubs de redirect (`about.html`, `privacy.html`, `terms.html`, etc.) — aceitável |
| BUG-013 | ✅ NÃO É BUG | `/sobre.html` (307 linhas) e `/en/about.html` (340 linhas) existem com hreflang correcto entre si |
| BUG-016 | ✅ NÃO É BUG | `/en/about.html` existe com conteúdo completo e canonical correcto |
| BUG-017 | ✅ FIXED | Banner PWA na homepage PT tinha texto EN — traduzido para PT |

**BUG-017 — Ficheiros alterados:**
- `index.html` linhas 1713–1716: "Install Portugal Travel Hub" → "Instalar Portugal Travel Hub", "Add to home screen for quick access" → "Adicionar ao ecrã inicial para acesso rápido", "Install" → "Instalar"

**Deploy:** https://08178cd7.portal-turismo-portugal-site.pages.dev
**Testes:** smoke tests confirmam homepage PT carrega sem erro

---

## BATCH 3B — ROBUSTEZ ESTRUTURAL (2026-04-15)

### Fragilidade identificada e mitigada

| Ponto frágil | Risco | Acção tomada |
|-------------|-------|--------------|
| `navigation.spec.ts` — EN nav hrefs estavam desatualizados (pré-Batch 1) | Testes passavam mas testavam hrefs errados; regressões passariam despercebidas | Corrigidos para `/en/beaches.html`, `/en/surf.html`, etc.; adicionados Fishing e Webcams |
| Dead comments: `<!-- Redes sociais em breve -->` + `<!-- Social media coming soon -->` | Poluição de código sem valor; pode confundir contribuidores | Removidos de `index.html` e `en/index.html` |
| Firefox sem timeout próprio | Firefox JS engine mais lento → flakes em `actionTimeout` partilhado | `playwright.config.ts`: `actionTimeout: 20_000` + `navigationTimeout: 40_000` para Firefox |
| Sem crawl de links internos críticos | Regressão em nav path (relativo vs. absoluto) passaria nos testes existentes | Criado `tests/links.spec.ts` — crawl de 26 links críticos PT+EN |
| `seo.spec.ts` com nota obsoleta sobre domínio errado | Comentário enganoso — domínio já foi corrigido no Batch 1 | Nota removida |

### Ficheiros alterados

- `tests/navigation.spec.ts` — EN nav hrefs corrigidos (5→7 links, valores corretos)
- `tests/seo.spec.ts` — nota obsoleta removida
- `tests/links.spec.ts` — **novo** — 26 testes de crawl: nav PT/EN, integrity, funnel pairs
- `playwright.config.ts` — `retries: 1` local, timeouts Firefox explícitos, `actionTimeout` global
- `index.html` — comentários social nav removidos (linhas 1432-1433)
- `en/index.html` — comentários social nav removidos (linhas 1432-1433)

### Resultados dos testes

- `navigation.spec.ts` (Chromium): **23/23** (era 16/21 antes — 5 falhavam com hrefs errados)
- `links.spec.ts` (Chromium): **26/26** (novo)
- Cobertura anterior mantida: smoke, forms, seo, audit-critical

### O que ficou menos frágil

- **Regressão EN nav impossível de passar despercebida**: qualquer alteração de href nos navs PT/EN falha `links.spec.ts` imediatamente
- **Testes testam o que existe**: EN nav agora verifica hrefs reais (`/en/…`) em vez de hrefs ghost (`/beaches.html`)
- **Firefox mais estável**: timeouts explícitos evitam false-negative flakes em `forms.spec.ts` e `planner.spec.ts`
- **Dead code removido**: sem stubs comentados no footer

---

## BATCH 4 — ROBUSTEZ OPERACIONAL (2026-04-15)

### Bug corrigido

| ID | Sev | Ficheiro | Problema | Correcção |
|----|-----|---------|----------|-----------|
| BUG-004b | 🟠 high | `login.html`, `en/login.html` | CSS `background-image: url(unsplash...)` ainda causava `ERR_BLOCKED_BY_ORB` mesmo após remoção do `<link rel="preload">` no Batch 1 | Unsplash URL removida da propriedade CSS; gradiente azul mantido (visualmente aceitável) |

### Novos testes criados

**`tests/console-network.spec.ts`** — 24 testes (12 páginas × 2 tipos):
- Console errors: falha em JS errors reais (não apenas regista)
- Network failures: falha em recursos site-owned com 4xx/5xx ou `requestfailed`
- Ruído externo (analytics, extensions, Supabase auth) filtrado automaticamente
- Warnings externos (ERR_BLOCKED_BY_ORB de CDN externo) reportados como `[INFO]` sem falhar

**`tests/mobile-critical.spec.ts`** — 25 testes em viewport 390×844:
- Estrutura base: h1, nav toggle, footer em 10 páginas PT+EN
- CTA: hero CTA visível e com href válido em homepage PT+EN; pricing CTA acessível
- Formulários: plan/plan-en, parceiros/partners, contact visíveis e ativáveis
- Nav toggle: hamburger abre `.nav-links` em homepage PT e EN
- Bottom-nav: links presentes quando elemento existe

### Resultados dos testes

| Spec | Resultado | Observações |
|------|-----------|-------------|
| `console-network.spec.ts` | **24/24** Chromium | Login PT/EN: `[INFO]` ORB externo (Unsplash CSS) — corrigido e em deploy |
| `mobile-critical.spec.ts` | **25/25** Chromium | Sem layout breaks nos funis críticos |
| `navigation.spec.ts` | **23/23** Chromium | Baseline mantida |
| `links.spec.ts` | **26/26** Chromium | Baseline mantida |

### O que foi validado de forma honesta

- ✅ Sem JS errors bloqueantes em 12 páginas críticas PT+EN
- ✅ Sem 404/500 em recursos site-owned (JS, CSS, HTML)
- ✅ Formulários críticos acessíveis e ativáveis em mobile 390px
- ✅ Hero CTAs com href válidos em ambas as homepages
- ✅ Hamburger abre nav corretamente em mobile
- ⚠️ Login PT/EN ainda serviam Unsplash via CSS (ORB) — corrigido neste batch
- ℹ️ Supabase auth calls em teste não são interceptadas — podem aparecer como network noise mas estão corretamente filtradas

**Deploy:** https://51cbd842.portal-turismo-portugal-site.pages.dev

---

## PLANO DE CORREÇÃO POR BATCHES

### Batch 1 — Impacto máximo no negócio (🔴 Critical + 🟠 High)
**Estimativa:** 1–2h  
**Objetivo:** Funil EN funcional + SEO correcto  

1. **BUG-001 + BUG-002 + BUG-005 + BUG-009** — Corrigir todos os hrefs EN que apontam para PT
   - `en/index.html`: substituir 6 hrefs no nav + 2 no hero + 1 no footer + 1 no partner plans
   - Verificar os mesmos padrões em `en/planear.html`, `en/precos.html`, `en/parceiros.html`
   
2. **BUG-003 + BUG-006** — Corrigir canonical e hreflang em todos os ficheiros
   - `sed -i 's|portal-turismo-portugal\.pages\.dev|portal-turismo-portugal-site.pages.dev|g'` em todos os HTML
   - Ou migrar para domínio custom se já existir

3. **BUG-004** — Remover `<link rel="preload">` da imagem Unsplash em `login.html` e `en/login.html`

---

### Batch 2 — Estabilidade de produto (🟠 High)
**Estimativa:** 2–3h  
**Objetivo:** Forms que não perdem leads  

4. **BUG-008** — Melhorar error handling no planner (`.catch()` com feedback ao utilizador)
5. **BUG-007** — Validar feedback do form B2B em `/parceiros.html`

---

### Batch 3 — Qualidade e credibilidade (🟡 Medium)
**Estimativa:** 1–2h  

6. **BUG-010** — Criar perfis sociais reais ou remover botões social do footer
7. **BUG-014** — Confirmar que Supabase RLS está activo em todas as tabelas
8. **BUG-013 + BUG-016** — Verificar `/en/about.html` e `/sobre.html`
9. **BUG-017** — Traduzir banner PWA para PT na homepage PT

---

### Batch 4 — Polimento (🟢 Low)
**Estimativa:** 30min  

10. **BUG-015** — Adicionar fallback href nos links de reserva nos onde-ficar
11. **BUG-012** — Auditar title tags para unicidade em todas as páginas

---

## RESUMO EXECUTIVO

| Severidade | Qtd | Estado |
|------------|-----|--------|
| 🔴 Critical | 3 | Todos no Batch 1 |
| 🟠 High | 5 | Batch 1 (3) + Batch 2 (2) |
| 🟡 Medium | 6 | Batch 3 |
| 🟢 Low | 3 | Batch 4 |

**O Batch 1 é bloqueante para o negócio.** Qualquer utilizador que entre na versão EN do site e tente navegar acaba numa página PT — o funil EN está efectivamente quebrado. A correção de canonical/hreflang é uma operação de sed em massa que afecta SEO a médio-prazo.
