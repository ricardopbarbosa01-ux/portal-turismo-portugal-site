# Site Commercial Assets Spec — Portugal Travel Hub
**Especificação de assets e páginas para suporte a monetização · Uso interno · Atualizado: março 2026**
**Baseia-se em:** `business-growth-roadmap.md` + `partner-outreach-playbook.md` + `partner-offer-architecture.md`

---

## 1. Mapa de Páginas — Papel Comercial no Funil

Cada página tem um papel único no funil de monetização. Confundir os papéis leva a páginas sobrecarregadas que não convertem em nada.

```
TOPO DO FUNIL (Descoberta)
├── index.html          → Porta de entrada editorial; distribui para páginas de alta intenção
├── beaches.html        → Descoberta de praias; awareness de escala e curadoria
├── surf.html           → Descoberta de surf; porta de entrada para parceiros surf
├── pesca.html          → Descoberta de pesca; porta de entrada para parceiros pesca
└── webcams.html        → Retenção e diferenciação; argumento de dados em tempo real

MEIO DO FUNIL (Intenção + Consideração)
├── beach.html?id=X     → Página de alta intenção por praia; onde os perfis de parceiros vivem
├── planear.html        → Captura de lead B2C qualificada; matching futuro com parceiros
└── contact.html        → Routing de intenção; captura de lead B2B e editorial

FUNDO DO FUNIL (Decisão + Conversão)
├── parceiros.html      → Landing page B2B primária; onde parceiros candidatam
├── precos.html         → Referência de planos e pricing; suporte à proposta comercial
└── about.html          → Credibilidade editorial; suporte ao outreach de imprensa e parceiros
```

---

## 2. Análise por Página — Papel, Gaps e Melhorias

---

### `index.html` — Homepage

**Papel comercial:**
Primeira impressão para visitantes novos e para parceiros que receberam o link no email de outreach. Deve transmitir imediatamente: (1) o que é o portal, (2) para quem é, (3) para onde ir. Não deve fechar vendas — deve distribuir para as páginas certas.

**Valor atual:**
Posicionamento premium, design forte, hero com dados em tempo real. Boa âncora de credibilidade para outreach.

**Gaps atuais:**
- Não tem referência visual de "parceiros" — um potencial parceiro que chega à homepage não percebe que pode aparecer aqui
- Não tem CTA explícito B2B na secção de destaque principal
- Não tem prova social (número de praias, parceiros, utilizadores) mesmo que como placeholder visual
- Secção de destinos não liga a `planear.html` no contexto de "planear a tua viagem"

**Melhorias por prioridade:**

| Prioridade | Melhoria | Tipo | Impacto |
|---|---|---|---|
| 1 | Adicionar faixa "Para negócios de turismo → Explorar parceria" acima do footer ou no final da homepage | Quick win | Routing B2B inbound |
| 2 | Adicionar bloco de prova social: "X praias indexadas · Y regiões · Parceiros verificados" | Credibilidade | Confiança |
| 3 | CTA secundário no hero para `planear.html` (além do existente) | Captação | Leads B2C |
| 4 | Bloco visual de "Como funciona para parceiros" com 3 passos + link para `parceiros.html` | Routing comercial | Inbound B2B |

---

### `beaches.html` — Listagem de Praias

**Papel comercial:**
Página de descoberta de topo de funil com maior escala potencial. Gera tráfego orgânico para queries de tipo "praias Portugal [região]". Distribui para `beach.html` onde os perfis de parceiros existirão.

**Valor atual:**
Filtros de região/qualidade, sort, "Como escolher a praia certa" com 4 perfis de viagem, conversão para `planear.html`. Boa estrutura.

**Gaps atuais:**
- Os cards de praia não têm indicação de "parceiros disponíveis nesta praia" — nada liga descoberta de praia a negócio local
- O "Como escolher" está bem para B2C mas não tem nenhum elemento de credibilidade B2B
- Não existe CTA para `parceiros.html` em nenhum ponto — um dono de negócio que pesquisa a sua praia não tem razão para explorar a parceria

**Melhorias por prioridade:**

| Prioridade | Melhoria | Tipo | Impacto |
|---|---|---|---|
| 1 | Adicionar badge "X parceiros" no card da praia (quando existirem parceiros ativos) | Credibilidade | Prova social |
| 2 | Bloco "Es dono de um negócio nesta zona?" no final da página + link para `parceiros.html` | Routing comercial | Inbound B2B |
| 3 | Filtro de vibe futuro (Família/Surf/Natureza/Experiências) que liga ao tipo de parceiro disponível | Captação | Lead segmentada |

---

### `beach.html?id=X` — Página de Praia Individual

**Papel comercial:**
A página mais importante do ponto de vista de monetização de parceiros. É aqui que o viajante está com intenção máxima de visitar uma praia específica — e é aqui que os perfis de parceiros devem aparecer (escola de surf desta praia, charter deste porto, alojamento próximo, restaurante da zona).

**Valor atual:**
Dados de qualidade da água, mapa, informações da praia. Boa base de conteúdo por praia.

**Gaps atuais — são os mais críticos de todo o site:**
- **Não existe nenhum bloco de parceiros.** Esta é a lacuna mais urgente do portal para monetização.
- Não existe CTA para `planear.html` contextualizado na praia ("Planear escapada para [Nome da Praia]")
- Não existe bloco de atividades disponíveis na zona
- Não existe Schema markup para parceiros (LocalBusiness)

**Melhorias por prioridade:**

| Prioridade | Melhoria | Tipo | Impacto |
|---|---|---|---|
| 1 | Bloco "Escolas de surf nesta praia" / "Atividades disponíveis" com cards de parceiro | Produto crítico | Monetização direta |
| 2 | Bloco "Onde ficar perto de [praia]" com alojamentos parceiros | Produto crítico | Monetização |
| 3 | Bloco "Onde comer depois da praia" com restaurantes parceiros | Produto | Monetização |
| 4 | CTA contextual "Planear escapada para [Nome da Praia]" → `planear.html` com região pré-preenchida | Captação | Leads qualificadas |
| 5 | Schema markup LocalBusiness por parceiro nesta praia (JSON-LD) | SEO | Argumento de venda |
| 6 | Bloco de webcam embed quando disponível para a praia | Diferenciação | Retenção |
| 7 | CTA "Es parceiro nesta zona?" discreto no footer da página | Routing comercial | Inbound B2B |

**Nota de implementação:** para os primeiros 30 dias, os blocos de parceiro podem ser 100% hardcoded em HTML (sem Supabase) para os parceiros piloto. Migrar para dinâmico quando houver mais de 5 parceiros.

---

### `surf.html` — Página de Surf

**Papel comercial:**
Porta de entrada para o segmento de surf. Gera tráfego para queries como "surf Portugal [região]" e "melhores spots surf". Deve ser a página que o parceiro escola de surf vê na discovery call como "é aqui que apareces".

**Valor atual:**
Conteúdo editorial sobre surf, spots, condições. Diferencial de dados em tempo real.

**Gaps atuais:**
- Não tem bloco de "Escolas verificadas" ou "Parceiros de surf"
- Não tem separação por região com parceiros associados
- Não tem CTA para `parceiros.html` para negócios de surf

**Melhorias por prioridade:**

| Prioridade | Melhoria | Tipo | Impacto |
|---|---|---|---|
| 1 | Secção "Escolas de Surf Verificadas" com cards de parceiro por região | Produto crítico | Monetização |
| 2 | Para cada spot listado, link para `beach.html` com bloco de parceiros surf | Routing | Conversão |
| 3 | CTA "A tua escola não está aqui? → Candidatar-me" no final da secção | Routing comercial | Inbound B2B |

---

### `pesca.html` — Página de Pesca

**Papel comercial:**
Análoga a `surf.html` mas para o segmento de pesca desportiva. Gera tráfego de turistas internacionais (UK, DE, ES) que pesquisam charter de pesca antes de viajar.

**Valor atual:**
Conteúdo editorial, spots de pesca, espécies. Base sólida.

**Gaps atuais:**
- Não tem bloco de "Charters verificados" por região
- Não tem versão de conteúdo em inglês (o público principal é internacional)
- Não tem CTA para `parceiros.html` para operadores de pesca

**Melhorias por prioridade:**

| Prioridade | Melhoria | Tipo | Impacto |
|---|---|---|---|
| 1 | Secção "Charters de Pesca Verificados" por região (Algarve, Lisboa, Porto, Açores) | Produto crítico | Monetização |
| 2 | Estrutura de meta tags em inglês (EN alternate) ou conteúdo bilíngue | SEO / Captação internacional | Alcance |
| 3 | CTA inbound para parceiros de pesca no final da página | Routing comercial | Inbound B2B |

---

### `webcams.html` — Webcams em Tempo Real

**Papel comercial:**
Diferenciação e retenção. Não é uma página de conversão direta — é o argumento mais difícil de replicar por concorrentes e o mais eficaz para demonstrar o valor dos dados em tempo real durante outreach a parceiros.

**Valor atual:**
Webcams ao vivo de praias e spots. Único no mercado português.

**Gaps atuais:**
- Não tem CTA para `planear.html` ("Planeias uma visita? Recebe previsões de condições")
- Não tem ligação a `beach.html` das praias com webcam
- Não tem argumento visual de parceria ("A webcam da praia A é patrocinada por X")

**Melhorias por prioridade:**

| Prioridade | Melhoria | Tipo | Impacto |
|---|---|---|---|
| 1 | Link "Ver praia" em cada webcam → `beach.html` da praia correspondente | Routing | Funil para parceiros |
| 2 | CTA "Planeias uma visita? → Planear escapada" após visualização de webcam | Captação | Leads B2C |
| 3 | Label "Webcam suportada por [parceiro]" em webcams de spots com parceiro ativo | Sponsored | Monetização |

---

### `planear.html` — Planeamento de Viagem

**Papel comercial:**
A principal máquina de captura de leads B2C qualificadas. É o activo que justifica o plano Partner — sem volume aqui, o plano Partner não tem produto. O formulário capta perfil de viagem com dados ricos (região, tipo de experiência, datas, grupo) que permitem matching com parceiros.

**Valor atual:**
Formulário de planeamento com 7+ campos, localStorage (`pth_plan_requests`), success state, secção "O que pode planear connosco" com 8 categorias, CTAs para praias/planear/preços. Bem construída.

**Gaps atuais:**
- Após submissão do formulário, não há recomendações visíveis (só mensagem de sucesso) — o momento de maior intenção não é aproveitado
- Não há indicação de que um parceiro vai receber o pedido — o utilizador não sabe o que acontece a seguir com concretismo suficiente
- Não existe versão do formulário pré-preenchida quando vem de `beach.html?id=X` (contexto de praia específica perdido)

**Melhorias por prioridade:**

| Prioridade | Melhoria | Tipo | Impacto |
|---|---|---|---|
| 1 | Pós-submissão: mostrar 3 praias / experiências recomendadas baseadas na região selecionada | Captação + produto | Retenção e matching |
| 2 | Pré-preencher campo de região quando vem com `?region=X` de `beach.html` | Quick win | Qualidade de lead |
| 3 | Adicionar campo opcional "Data de viagem" para segmentação sazonal de leads | Captação | Qualidade de lead |
| 4 | Texto de sucesso mais específico: "O teu pedido vai ser analisado e receberás recomendações de [parceiros verificados / equipa editorial] na tua região" | Credibilidade | Expectativa realista |

---

### `parceiros.html` — Página de Parceiros

**Papel comercial:**
Landing page B2B primária. É o destino do link enviado em todos os emails de outreach. Deve fazer três coisas: explicar o modelo, demonstrar o produto, converter em candidatura. Já está forte em estrutura.

**Valor atual:**
Hero editorial, benefícios por segmento, secção de formatos de parceria com cards, formulário de candidatura (`#candidatura`), CTAs para `precos.html` e `contact.html`.

**Gaps atuais:**
- Não tem prova social real (nenhum parceiro ativo ainda — correto — mas quando existirem, devem estar aqui)
- Não tem "demo" de como um perfil de parceiro aparece no site (screenshot ou link para perfil de exemplo)
- Não tem FAQ sobre o processo de onboarding ("Quanto tempo demora a aparecer no site? O que preciso de fornecer?")

**Melhorias por prioridade:**

| Prioridade | Melhoria | Tipo | Impacto |
|---|---|---|---|
| 1 | Adicionar bloco "Como funciona o onboarding" com 3 passos (Candidatura → Perfil criado → Publicado em 48h) | Credibilidade | Reduz atrito na decisão |
| 2 | Demo screenshot/card de como fica o perfil publicado em `beach.html` | Prova/autoridade | Convicção visual |
| 3 | Quando existirem parceiros: secção "Já connosco" com 2–3 logos/nomes | Prova social | Confiança social |
| 4 | FAQ de onboarding (tempo, o que fornecer, como cancelar, o que é o perfil verificado) | Credibilidade | Reduz objeções |

---

### `precos.html` — Página de Preços

**Papel comercial:**
Referência de planos enviada durante a proposta comercial. Deve ser a resposta quando o parceiro pergunta "quanto custa?" — deve poder ser enviada como link standalone. Já está bem construída e alinhada com parceiros.html.

**Valor atual:**
Três planos (Gratuito/Pro/Partner), secção "Ideal para", FAQ com diferença entre Partner e parceria completa, B2B band, CTAs para `parceiros.html`. Bem estruturada.

**Gaps atuais:**
- Não tem anchor específico por plano (`#plano-pro`, `#plano-partner`) — dificulta linkar diretamente para o plano recomendado na proposta
- FAQ poderia ter uma pergunta sobre "quanto tempo até aparecer no site" e "o que acontece se quiser cancelar"

**Melhorias por prioridade:**

| Prioridade | Melhoria | Tipo | Impacto |
|---|---|---|---|
| 1 | Adicionar `id="plano-pro"` e `id="plano-partner"` nos cards de plano | Quick win | Deep-link na proposta comercial |
| 2 | FAQ adicional: "Quando começo a aparecer no site?" e "Posso cancelar?" | Credibilidade | Reduz objeções |
| 3 | Quando existirem parceiros: adicionar "X parceiros ativos" como social proof no hero | Prova social | Confiança |

---

### `contact.html` — Página de Contacto

**Papel comercial:**
Routing de intenção para três tracks: Viagem (→ `planear.html`), Parceria (→ `parceiros.html`), Suporte/Editorial (→ formulário). Já tem routing section com 3 intent cards e formulário com hints dinâmicos. Bem construída.

**Valor atual:**
Routing section, formulário com 7 opções de assunto, hints de routing dinâmicos (parceria/viagem), FAQ accordion, localStorage (`pth_contact_messages`).

**Gaps atuais:**
- FAQ não tem pergunta sobre "Como funciona a parceria?" — parceiros que chegam aqui diretamente não têm contexto suficiente
- Não há tempo de resposta explícito para candidaturas de parceria (vs. suporte genérico)

**Melhorias por prioridade:**

| Prioridade | Melhoria | Tipo | Impacto |
|---|---|---|---|
| 1 | FAQ adicional: "Quero ser parceiro — qual o próximo passo?" com link para `parceiros.html` | Routing comercial | Conversão inbound |
| 2 | Tempo de resposta diferenciado para parceria: "Candidaturas de parceria: resposta em 1 dia útil" | Credibilidade | Expectativa clara |

---

### `about.html` — Sobre o Portal

**Papel comercial:**
Credibilidade editorial para dois públicos distintos: (1) jornalistas e bloggers que recebem o portal por PR, (2) parceiros que querem perceber quem está por trás antes de assinar. Ainda não existe ou está incompleto.

**Estado atual:**
Não auditado nesta especificação — verificar antes de incluir em outreach.

**Melhorias por prioridade:**

| Prioridade | Melhoria | Tipo | Impacto |
|---|---|---|---|
| 1 | Hero com missão editorial clara ("Turismo costeiro com dados reais, sem comissões") | Credibilidade | Base de tudo |
| 2 | Secção sobre o modelo B2B e como os parceiros contribuem para o portal | Routing comercial | Inbound B2B |
| 3 | Secção de press/media com link para `contact.html` (opção imprensa) | PR | Alcance editorial |
| 4 | Secção de dados: número de praias, regiões, utilizadores (placeholders se necessário) | Prova social | Confiança |

---

## 3. Dados a Captar no Front-end para Futura Integração com CRM

Os dados abaixo estão ou devem estar a ser guardados via localStorage. Quando o volume justificar backend, estes são os campos prioritários a migrar para Supabase.

### `pth_plan_requests` (localStorage) — `planear.html`
| Campo | Estado | Prioridade para CRM |
|---|---|---|
| nome | Já captado | Alta |
| email | Já captado | Alta |
| região | Já captado | Alta — campo de matching com parceiros |
| tipo de experiência | Já captado | Alta — campo de matching com parceiros |
| datas | A adicionar | Média — para matching sazonal |
| tamanho do grupo | Já captado | Baixa |
| pedido livre | Já captado | Média — qualificação editorial |
| url de origem | A adicionar via JS | Alta — saber de que praia veio o pedido |
| timestamp | A adicionar via JS | Alta — para sazonalidade e frequência |

### `pth_partner_leads` (localStorage) — `parceiros.html`
| Campo | Estado | Prioridade para CRM |
|---|---|---|
| nome do negócio | Já captado | Alta |
| tipo de negócio | Já captado | Alta — segmentação do pipeline |
| localização/spot | Já captado | Alta — matching geográfico |
| email | Já captado | Alta |
| telefone | Já captado | Alta |
| website | Já captado | Média — qualificação |
| mensagem | Já captado | Média |
| plano de interesse (select) | A adicionar | Alta — segmentação comercial |
| timestamp | A adicionar via JS | Alta |

### `pth_contact_messages` (localStorage) — `contact.html`
| Campo | Estado | Prioridade para CRM |
|---|---|---|
| nome | Já captado | Alta |
| email | Já captado | Alta |
| assunto | Já captado | Alta — routing automático futuro |
| mensagem | Já captado | Média |
| timestamp | A adicionar via JS | Média |

### Dados comportamentais a preparar (sem backend, mas prontos para GA4 futuro)
- Clique em CTA de parceiro em `beach.html` → evento `partner_cta_click` com `partner_id` e `beach_id`
- Submissão de formulário em `planear.html` → evento `plan_request_submit` com `region` e `experience_type`
- Submissão de candidatura em `parceiros.html` → evento `partner_application_submit` com `business_type`
- Clique em "Candidatar-me" em `precos.html` → evento `pricing_cta_click` com `plan` (pro/partner)
- Filtro de região ativo em `beaches.html` → evento `beach_filter_region` com `region`
- Clique em "filterByProfile" em beaches.html → evento `beach_profile_filter` com `profile_type`

---

## 4. Eventos e Conversões a Preparar para Tracking Futuro

Quando houver analytics (GA4 ou Plausible), estes são os eventos de negócio prioritários a implementar.

| Evento | Página | Parâmetros | Valor de negócio |
|---|---|---|---|
| `partner_application_submit` | `parceiros.html` | `{business_type, region}` | Conversão B2B direta |
| `plan_request_submit` | `planear.html` | `{region, experience_type}` | Lead B2C qualificada |
| `partner_cta_click` | `beach.html` | `{partner_id, cta_type, beach_id}` | Conversão B2C → parceiro |
| `pricing_plan_view` | `precos.html` | `{plan}` | Intenção de compra |
| `pricing_cta_click` | `precos.html` | `{plan, cta_destination}` | Conversão B2B |
| `how_choose_profile_click` | `beaches.html` | `{profile_type}` | Segmentação de audiência |
| `beach_detail_view` | `beach.html` | `{beach_id, region}` | Inventário de intenção |
| `webcam_view` | `webcams.html` | `{beach_id}` | Engagement real-time data |
| `contact_subject_select` | `contact.html` | `{subject}` | Routing comercial |

---

## 5. Assets Externos / Comerciais a Criar (Fora do Site)

Estes assets são necessários para suportar o processo de outreach e proposta. Não vivem no site — são documentos partilhados por email, WhatsApp ou em chamada.

---

### One-Pager de Parceria
**Formato:** Google Slides ou Canva, 1 página, exportável em PDF
**Conteúdo:**
- O que é o Portugal Travel Hub (2 linhas)
- Para que tipo de negócios (3 ícones por segmento)
- Como aparece o parceiro no site (screenshot de mockup de `beach.html` com bloco de parceiro)
- Os 3 planos com bullet points de entregáveis (sem preços no one-pager genérico)
- CTA: `parceiros.html` + contacto direto

**Quando usar:** enviar antes ou durante a discovery call; partilhar no WhatsApp após primeiro contacto.

---

### Media Kit
**Formato:** PDF ou Google Doc, 2–3 páginas
**Conteúdo:**
- Missão e posicionamento editorial do portal
- Audiência: perfil do viajante, regiões mais pesquisadas, perfis de uso
- Números do portal (placeholders com data de atualização — preencher com dados reais)
- Formatos de colaboração disponíveis para imprensa/bloggers (menção editorial, conteúdo conjunto, press trip)
- Contacto de imprensa (via `contact.html` → imprensa)

**Quando usar:** resposta a pedidos de imprensa via `contact.html`; envio proativo a bloggers de surf/viagem identificados no outreach de PR.

---

### Template de Proposta Comercial
**Formato:** Google Doc, 1 página por proposta (personalizada por parceiro)
**Estrutura:** (conforme secção 8 de `partner-offer-architecture.md`)
- Contextualização do portal (1 parágrafo)
- Entregáveis específicos (lista de 4–6 pontos para aquele parceiro)
- Plano recomendado + duração + placeholder de preço
- Próximo passo + link para `parceiros.html#candidatura`

**Quando usar:** enviar após discovery call, antes de follow-up de fecho.
**Nota:** nunca enviar proposta genérica — cada proposta deve mencionar o spot específico e a página onde o parceiro vai aparecer.

---

### Template de Case Study
**Formato:** Google Doc ou secção em `parceiros.html`, 1 página
**Estrutura:**
- Nome e tipo do negócio (com consentimento)
- Desafio antes do portal (em 1–2 frases, na voz do parceiro)
- O que foi implementado (entregáveis concretos)
- Resultado observado (cliques no perfil, contactos recebidos, renovação)
- Citação do parceiro

**Quando usar:** ao fim de 30 dias com o primeiro parceiro piloto que tiver resultados verificáveis. Usar em outreach como prova social e em `parceiros.html` como secção "Já connosco".
**Nota:** não fabricar números. Se não houver métricas suficientes, usar testemunho qualitativo.

---

### Lista Comercial (Prospects Spreadsheet)
**Formato:** Google Sheets
**Colunas mínimas:**

| Campo | Tipo |
|---|---|
| Nome do negócio | Texto |
| Tipo (ICP) | Select: surf/pesca/alojamento/restaurante/experiência/retalho |
| Região | Select: Algarve/Lisboa/Porto/Alentejo/Madeira/Açores/Norte |
| Contacto (email/WhatsApp) | Texto |
| Canal de primeiro contacto | Select: email/WhatsApp/LinkedIn/inbound |
| Estado no pipeline | Select: identificado/contactado/em conversa/proposta enviada/fechado/perdido |
| Data do primeiro contacto | Data |
| Data da última ação | Data |
| Plano proposto | Select: Pro/Partner/Sazonal/Piloto |
| Nota | Texto livre |

**Quando usar:** desde o primeiro dia de outreach. Sem CRM, esta planilha é o sistema de gestão de pipeline.

---

## 6. Backlog Priorizado — O Que Entra Primeiro no Site para Suportar Monetização

Ordenado por impacto comercial imediato e esforço de implementação. Nenhum item requer backend novo.

| # | Item | Página | Esforço | Impacto | Pré-requisito |
|---|---|---|---|---|---|
| 1 | Bloco de parceiro (perfil verificado) em `beach.html` | `beach.html` | Médio | Crítico | Ter 1 parceiro piloto com conteúdo |
| 2 | Demo hardcoded de parceiro (perfil fictício ou real) numa praia de alta intenção | `beach.html` | Baixo | Crítico | Nenhum — criar antes do primeiro outreach |
| 3 | Secção "Escolas de Surf Verificadas" em `surf.html` | `surf.html` | Baixo | Alto | Bloco de parceiro de `beach.html` |
| 4 | Secção "Charters Verificados" em `pesca.html` | `pesca.html` | Baixo | Alto | Idem |
| 5 | Anchors `#plano-pro` e `#plano-partner` em `precos.html` | `precos.html` | Mínimo | Alto (deep-link em propostas) | Nenhum |
| 6 | FAQ "Quanto tempo até aparecer no site?" em `parceiros.html` | `parceiros.html` | Mínimo | Médio | Nenhum |
| 7 | CTA contextual `planear.html?region=X` em `beach.html` | `beach.html` | Baixo | Médio | Nenhum |
| 8 | Pré-preenchimento de região em `planear.html` via URL param | `planear.html` | Baixo | Médio | Nenhum |
| 9 | Timestamp nos objetos localStorage de todos os formulários | Todos | Mínimo | Médio (CRM futuro) | Nenhum |
| 10 | Campo "plano de interesse" no formulário de candidatura de parceiro | `parceiros.html` | Mínimo | Médio | Nenhum |
| 11 | `about.html` premium com missão, modelo e press contact | `about.html` | Médio | Médio (credibilidade) | Nenhum |
| 12 | Bloco "Webcam desta praia" embed em `beach.html` | `beach.html` | Médio | Médio (retenção) | Lista de praias com webcam |
| 13 | Link "Ver praia" em cada webcam de `webcams.html` | `webcams.html` | Mínimo | Médio | Mapeamento webcam → praia |
| 14 | Bloco "Es negócio desta zona?" no footer de `beaches.html` | `beaches.html` | Mínimo | Baixo–Médio | Nenhum |
| 15 | Schema markup LocalBusiness em perfis de parceiro | `beach.html` | Baixo | Baixo–Médio (SEO futuro) | Ter perfis publicados |

**Sequência de execução recomendada para os primeiros 30 dias:**
1. Itens 1–2 (bloco de parceiro + demo) → permitem fazer outreach com algo real para mostrar
2. Itens 5–6 (anchors + FAQ) → melhorias de 30 min com impacto direto em propostas
3. Itens 3–4 (secções surf/pesca) → depois do primeiro parceiro de cada segmento
4. Itens 7–10 (captação e dados) → melhorias de produto de uma tarde
5. Itens 11+ → após primeiros parceiros fechados

---

*Este documento é interno, de especificação de produto e assets comerciais. Não publicar. Rever quando houver novos parceiros ativos ou mudanças de produto.*
