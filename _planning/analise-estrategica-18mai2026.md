# Análise Estratégica — Sessões 18/05/2026

**Fonte:** múltiplas conversas Claude.ai de 18/05/2026, migradas em 19/05/2026
**Estado:** Draft consolidado — partes ausentes assinaladas
**Próxima revisão:** 19/06/2026 (30 dias)
**Localização proposta no repo:** `_planning/analise-estrategica-18mai2026.md`

---

## ⚠️ Limitações desta migração

Este documento consolida 3 mensagens copiadas de sessões Claude.ai separadas. **Não é exaustivo.** Em particular:

- **Plano estratégico 5 partes** — mencionado como entregue (Sessão 3) mas conteúdo não migrado. Pode estar noutra conversa Claude.ai.
- **3 caminhos estratégicos** (A: SEO+afiliados / B: B2B-first / C: híbrido) — vistos em snippets de `conversation_search` mas conteúdo completo não migrado.

Estas peças, se críticas, requerem recuperação em sessão futura dedicada.

---

## 1. Estado-síntese (a 18/05/2026)

Portugal Travel Hub — portal editorial turismo costeiro em `portalturismoportugal.com`. Tecnicamente robusto (HTTP 200, zero 5xx, WCAG AA), mas **invisível**: 91 páginas indexadas, 2 cliques/mês GSC, €0 revenue.

Founder solo (Ricardo), runway 1-3 meses, sem plano B definido até 22/05.

**Bloqueador real:** tráfego, não features.

---

## 2. Recomendação de foco — sessão 18/05 manhã

A recomendação foi começar pela **decisão Paddle vs LemonSqueezy**, não por outras tarefas técnicas.

**Razões dadas:**

1. Única tarefa que desbloqueia revenue directamente. Foto Praia Grande, teste vídeo /surf, outreach B2B são importantes mas não movem €0 → algo.
2. Em atraso (prazo escalation LemonSqueezy era 16/05 EOD, já passaram 2 dias na altura).
3. Decisão binária, não trabalho técnico. 30-45 min de pensar + escrever, não horas de código.
4. Bloqueia o Plano B (deadline 22/05). Não consegues definir Plano B formal sem saber se o stream Pro existe ou não.

**Status na altura:** decisão Paddle adiada. Posteriormente (Sessão 3) registou-se "Paddle recurso 🟡 Aguardar ~21/05".

---

## 3. Lições técnicas gravadas

### 3.1 Antes de qualquer fix técnico
Consultar `DECISIONS_LOG.md` + `CONTEXT.md` para decisões relacionadas. Falha em 15/05 custou 2h extra por não cumprir esta regra.

### 3.2 Tarefas "rápidas mas repetíveis"
Primeira pergunta: *"isto vai voltar a acontecer?"* Se sim, é script reutilizável. Falha em 18/05 custou ~1h em substituição de imagem manual que deveria ter sido `_scripts/replace-storage-image.js`.

### 3.3 Comentários JS aninhados
`/* ... /* ... */ */` partem o parser (SyntaxError expected expression). Usar `//` linha-a-linha, `if (false) {...}`, ou mover para ficheiro separado. **Nunca** `/*` dentro de `/* */`.

### 3.4 Entidades HTML para acentos PT
Obrigatórias em automatização (`&eacute;`, `&ccedil;`, `&otilde;`, `&middot;`, `&mdash;`, `&#8470;`). Unicode directo parte deploy (HTTP 500 em 14/05, bug `1e269a2`).

### 3.5 Máximo 5 deploys por sessão
Regra emergente após 16/05. Cinco deploys numa sessão é o limite operacional do founder solo.

### 3.6 Cloudflare Pages auto-deploy partido
Push para `origin/main` não actualiza produção correctamente apesar do dashboard reportar success.

**Fix:** usar sempre `npx wrangler pages deploy . --project-name portal-turismo-portugal-site --commit-dirty=true`.

### 3.7 Trailing slash em Cloudflare Pages
Cloudflare força `/praias/<slug>/` (com slash) como HTTP 200. Decisão: adoptar trailing slash apenas em `/praias/` e `/en/praias/`. Outras URLs (`/precos`, `/termos`, `/refund-policy`) continuam sem slash porque são ficheiros, não directorias.

Convenção web: directorias com slash, ficheiros sem slash. Google entende.

---

## 4. Decisão de pricing B2B

**€99/mês** decidido em sessão 18/05 (overwrite do PRD que tinha €149+).

**Implicação para Plano B:**
- Target €500/mês via B2B passa de "3-4 partners × €149" para **5-6 partners × €99**.
- Margem de erro mais apertada — 1 partner a menos significa €100, não €149.
- Outreach precisa de mais volume para a mesma matemática.

⚠️ **Nota:** esta decisão não está actualmente no PRD (`01-PRD.md`). Precisa de update.

---

## 5. Lista de outreach B2B — Surf shops/shapers PT

Compilada em sessão 18/05 via web search. **Contactos públicos, validar antes de outreach real** (alguns dados podem estar desactualizados).

### 5.1 Redes de retail nacionais

| Empresa | Telefone | Email | Sede |
|---|---|---|---|
| Ericeira Surf & Skate (Despomar, Lda.) — 20+ lojas CC nacionais | +351 261 860 900 | info@ericeirasurfskate.pt | Av. São Sebastião 36B, 2655-483 Ericeira |
| Ericeira Surf Shop (loja-mãe, 1996) | +351 261 862 504 | ericeira@ericeirasurfshop.pt | Rua Prudêncio Franco da Trindade 21, 2655-344 Ericeira |
| 58 Surf — Costa da Caparica | (verificar site 58surf.com) | (formulário) | Av. General Humberto Delgado 9 A-F, 2825-278 Costa da Caparica |
| Billabong Portugal | (verificar loja Lagos) | via formulário billabong.pt | Forum Algarve, Lj 1.28, EN125, 8005-548 Lagos |

### 5.2 Shapers e fábricas — alvos prioritários para B2B Partner Pro

Estes são os interlocutores **mais alinhados** com a promessa editorial "verificação > posição". Vivem de comunicação que não controlam — estariam mais receptivos a um portal que os destaque editorialmente.

| Marca | Telefone | Email | Morada |
|---|---|---|---|
| Semente Surfboards (Nick Uricchio, 1982) | +351 261 864 448 / +351 918 203 217 | semente@semente.pt | Rua do Belo Horizonte, Armazém A – Ribamar, 2640-035 Santo Isidoro, Mafra |
| Polen Surfboards (Álvaro Costa, 1988 — maior fábrica europeia para Pyzel/Stretch/T. Patterson) | +351 915 698 346 | via polensurfboards.com (formulário) | Cascais (verificar morada) |
| Mica Surfboards (Ericeira) | +351 910 205 436 | info@micasurfboards.com | Ericeira |
| Fatum Surfboards (Gero Tragatschnig, 14.000+ pranchas) | via fatumsurfboards.com | via formulário | Peniche |
| PSF — big-wave + marcas internacionais | (verificar) | (verificar) | Sintra |
| Surfactory — produção em larga escala | (verificar) | (verificar) | Ovar |

### 5.3 Lojas e operadores complementares

| Empresa | Telefone | Email | Morada |
|---|---|---|---|
| SUP Norte (loja + escola + distribuidora SIC Maui, Tahe, Axis Foils) | +351 917 368 429 | info@supnorte.com | (verificar morada) |
| SantoLoco (Lisboa, surf/skate) | (site) | (site) | R. da Madalena 218, 1100-213 Lisboa |
| Loja Peacock (Lisboa) | (site) | — | Rua Zeca Afonso 3B, Alto da Eira, 2690-597 Santa Iria da Azóia |
| Quiksilver & Roxy Combro (Lisboa) | (site) | — | R. do Poço dos Negros 9, 1200-335 Lisboa |

### 5.4 Plano Apify para outreach em escala

Discutido mas **não executado** em 18/05. Ricardo tem Personal API Token Apify.

**Caminho recomendado:** Google Maps Scraper + queries direccionadas (15-20 queries tipo "surf shop Ericeira", "surfboard shaper Portugal", "surf school Algarve").

**Output esperado:** CSV com 200-500 contactos estruturados (nome, morada, telefone, website, email, rating, reviews).

**Custo estimado:** $5-15 em créditos Apify, 30 min do tempo do Ricardo.

**Pendência técnica:** Claude da sessão Claude.ai não tem HTTP client nativo para chamar API Apify directamente. Caminho operacional é Ricardo correr no painel Apify (ou via script Node.js local) com prompts/configuração preparados pelo Claude.

---

## 6. Sugestões editoriais alinhadas

### 6.1 Página "Os Shapers de Portugal"
Alinhada com vídeo "Verificação Local Especializada" em `/surf`.

**Pitch editorial:** citar Semente (1982, primeira do país), Polen (maior fábrica europeia para Pyzel/Stretch), Fatum (14.000+ pranchas). Exactamente o tipo de conteúdo que James de Surrey valoriza e que Google considera "informação que não está nas booking sites".

### 6.2 Foco do outreach B2B
Shapers, **não** redes de retail. Razão: redes têm marketing próprio; shapers vivem de comunicação que não controlam.

---

## 7. Tarefas pendentes (estado a 18/05)

| Urgente | Esta semana | Médio prazo |
|---|---|---|
| Foto Praia Grande (S.Paulo→Sintra) | Plano B formal | 5 stubs PT→PT |
| Teste visual vídeo /surf (50/50) | Outreach B2B commit | Pre-render praias |
| LemonSqueezy → Paddle? | Auditoria Quinta 21/05 | Backlinks DA20+ |

**Status fim-de-dia 18/05:**

| Componente | Estado |
|---|---|
| Foto Praia Grande | ✅ Live |
| Refund Policy PT+EN | ✅ Live |
| Paddle recurso | 🟡 Aguardar ~21/05 |
| Disable LemonSqueezy | ❌ Revertido |
| Pre-render 30 praias | ✅ Preview OK, pronto para production |
| Plano estratégico 5 partes | ✅ Entregue (mas não migrado para este doc) |
| Pricing B2B €99 decidido | ✅ Documentado aqui |

---

## 8. Pre-render praias — decisão técnica resolvida em 18/05

**Decisão arquitectural:** migrar de SPA dinâmica (`/beach?id=UUID`) para páginas estáticas em `/praias/<slug>/index.html` e `/en/praias/<slug>/index.html`.

**Trailing slash:** adoptado para directorias `/praias/` e `/en/praias/`. Sitemap actualizado com 60 URLs (30 PT + 30 EN) todas com `/` final.

**Smoke test em preview:** ✅ verde (3 URLs testadas, todas HTTP 200, canonical correcto, sitemap consistente).

**Estado:** preview deployado, pronto para production em 19/05.

**Iterações:** 7 tentativas até resolver. Lição para CONTEXT: prompts complexos a Claude Code beneficiam de scoping menor.

---

## 9. Observações de fecho da sessão 18/05

> Esta sessão foi longa e produtiva. Saíste com:
> - 1 problema técnico crítico resolvido (SEO arquitectural)
> - 1 plano estratégico de 12 semanas executável
> - 1 decisão de pricing fundamentada
> - 3 lições gravadas para sessões futuras
>
> Mas também:
> - 7 iterações no fix de pre-render
> - **Plano B continua não definido (deadline 22/05 — em 4 dias)**
> - Paddle pendente

---

## 10. Próximos passos identificados (a 18/05 EOD)

1. Validar production deploy do pre-render aconteceu correctamente
2. Submeter sitemap actualizado no Google Search Console
3. Solicitar indexação manual para 5-6 praias prioritárias
4. **Formalizar Plano B em 1 página simples**
5. Aguardar resposta Paddle (~21/05)
6. Quinta 21/05: auditoria semanal

---

## 11. Estado de migração deste documento

**Migrado para Project Knowledge:** 19/05/2026 (sessão actual)

**Próxima acção:** decidir formalmente um dos 3 caminhos estratégicos (A: SEO+afiliados / B: B2B-first / C: híbrido) antes de definir Plano B.

⚠️ Os 3 caminhos completos não estão neste doc — estão noutra conversa Claude.ai. Recuperar em sessão dedicada se críticos para a decisão.

**Em alternativa:** definir Plano B com base no que se sabe hoje (pricing €99, lista outreach, deadline 31/08, runway 1-3 meses) e aceitar que os 3 caminhos eram análise para validar/refinar mais tarde, não pré-requisito para Plano B.
