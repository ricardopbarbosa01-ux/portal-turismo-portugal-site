# Decisions Log — Portugal Travel Hub

Registo de decisões arquitecturais e editoriais com impacto comercial.
Cada entrada: contexto → decisão → trade-offs → critério de reavaliação.

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
