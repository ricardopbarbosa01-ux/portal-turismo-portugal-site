# Partner Offer Architecture — Portugal Travel Hub
**Documento de arquitetura comercial interno · Uso privado · Atualizado: março 2026**
**Baseia-se em:** `business-growth-roadmap.md` + `partner-outreach-playbook.md`

---

## 1. Princípios da Oferta Comercial

Estes princípios definem o que o portal vende, como vende e o que nunca deve vender. São a guardrail de todas as decisões de pricing, packaging e proposta.

**1.1 Visibilidade de contexto, não de volume**
O portal não vende CPM nem reach. Vende presença no momento em que o viajante está a decidir. Cada oferta deve ser descrita em termos de contexto de intenção, não de número de impressões.

**1.2 Mensalidade fixa > comissão variável**
O modelo de comissão por reserva cria conflito com a proposta de valor ao parceiro ("alternativa às OTAs"). Manter sempre mensalidade fixa ou pacote fixo, mesmo quando o marketplace for lançado.

**1.3 Qualidade do parceiro = reputação do portal**
Só aceitar parceiros que passem nos critérios do playbook. Rejeitar receita de parceiros que degradam a experiência do viajante.

**1.4 Pacote anual > mensal > unitário**
Incentivar comprometimento anual com desconto. Mensal como opção de entrada. Unitário (ex: campanha única) apenas para sponsored placement e com ticket mais alto.

**1.5 Piloto antes de perda**
Quando um prospecto estiver em dúvida, oferecer piloto de 30 dias sem compromisso em vez de perder o lead. Um parceiro piloto com perfil publicado vale mais do que zero — em credibilidade, SEO e argumento para o próximo outreach.

**1.6 Entregáveis definidos, não abertos**
Cada plano deve ter entregáveis específicos e verificáveis. Evitar prometer "destaque" sem especificar onde, durante quanto tempo e com que CTA.

**1.7 Upsell natural via lead entrega**
O upsell do plano Pro para Partner deve ser ativado quando o parceiro começa a receber leads do portal. A entrega de leads qualificadas é o principal motivo de upgrade — não features adicionais abstratas.

---

## 2. Tipos de Oferta por Fase de Maturidade

As ofertas estão alinhadas com as 5 fases de monetização do roadmap. Não lançar as fases 3–5 sem a base das anteriores estar operacional.

---

### Oferta Tipo 1 — Presença Base
**Fase:** 1 (agora)
**Plano correspondente:** Gratuito

**O que é:**
Listagem do negócio nas páginas de conteúdo relevantes (surf.html, pesca.html, beach.html) sem destaque pago. Sem verificação editorial. Sem posição garantida.

**Entregáveis:**
- Nome do negócio + link para website
- Região/spot associado
- Tipo de serviço (texto simples)

**Propósito comercial:**
Gerar familiaridade com o portal. Criar razão para voltar com upgrade. Não deve ser o produto principal vendido.

**Regra:** nunca apresentar "Gratuito" como o objetivo — é a entrada. O objetivo é a conversa que leva ao Pro ou Partner.

---

### Oferta Tipo 2 — Destaque Premium
**Fase:** 1 (agora)
**Plano correspondente:** Pro

**O que é:**
Perfil verificado com destaque visual nas páginas do spot/região associada. O parceiro aparece na posição de destaque, com foto, descrição, CTA e dados contextuais (ex: condições de surf no spot).

**Entregáveis concretos:**
- Perfil verificado (badge "Verificado" visível)
- Bloco de parceiro em `beach.html` da(s) praia(s) associada(s)
- Posição de destaque em `surf.html` ou `pesca.html` (dependendo do segmento)
- Foto do negócio (até 3)
- Descrição até 150 palavras
- CTA configurável: link direto, WhatsApp, email, formulário
- Schema markup `LocalBusiness` implementado (argumento de SEO local)

**Diferencial vendável:**
"O teu negócio aparece quando alguém abre a página da praia onde operas. Não numa lista genérica — na página do spot."

---

### Oferta Tipo 3 — Geração de Leads
**Fase:** 2 (Q2 2026)
**Plano correspondente:** Partner

**O que é:**
Tudo o que está no Pro + entrega de leads qualificadas provenientes de `planear.html`. O parceiro recebe pedidos de viajantes que explicitamente indicaram interesse na sua região e tipo de experiência.

**Entregáveis concretos:**
- Tudo do plano Pro
- Encaminhamento manual (email) de leads qualificadas da região/segmento do parceiro
- Dados da lead: nome, email, região, tipo de experiência, datas, tamanho do grupo
- Relatório mensal de leads recebidas vs. contactadas

**Condição de ativação:**
Este produto só funciona quando `planear.html` tem volume suficiente de submissões reais. No arranque, o encaminhamento é manual. A promessa comercial deve ser "acesso prioritário a leads do portal na tua região", não "X leads garantidas por mês".

**Critério de upgrade Pro → Partner:**
O parceiro já tem perfil ativo (Pro) e quer mais volume de contactos diretos. O trigger é o sucesso da presença, não a insatisfação.

---

### Oferta Tipo 4 — Sponsored Placement / Editorial
**Fase:** 3 (Q3 2026)
**Plano correspondente:** Add-on ou autónomo

**O que é:**
Posição editorial paga em contextos de alta intenção. Não é um banner. É uma menção editorial com contexto — "Escola recomendada para iniciantes no Algarve", "Charter certificado para pesca de alto mar".

**Formatos possíveis:**
- Posição de topo numa secção de recomendações numa `beach.html` específica de alto tráfego
- Menção em newsletter editorial como "destaque da semana"
- Posição fixa no bloco "Como escolher" de `beaches.html` (filtro de perfil)
- Inclusão em guia editorial publicado no site (página tipo `guia-algarve.html`)

**Diferencial vs. Pro:**
O Pro é presença persistente no spot. O Sponsored é destaque editorial num ponto de conteúdo específico com elevada intenção, durante um período definido.

**Pricing logic:** por posição/semana ou por período (ex: junho–agosto). Ticket mais alto, duração mais curta. Não oferecer anualmente — cria scarcity percebida.

**Pré-requisito:** só oferecer quando a página onde vai o placement tiver tráfego orgânico demonstrável.

---

### Oferta Tipo 5 — Pacote Combinado
**Fase:** 1–2 (disponível assim que Pro + Partner estiverem operacionais)

**O que é:**
Bundle com entregáveis de dois ou mais tipos de oferta, com desconto combinado. O objetivo é aumentar ticket médio e comprometimento.

**Exemplos concretos:**
- **Pack Verão:** Pro (anual) + Sponsored Placement sazonal (junho–setembro) + menção em 2 newsletters
- **Pack Lançamento:** 30 dias de piloto gratuito → Pro (6 meses) + perfil em inglês
- **Pack Escola de Surf:** Partner + destaque em 3 praias de surf associadas + Schema markup
- **Pack Pesca:** Partner + posição de topo em `pesca.html` por região + menção em guia editorial de pesca

**Regra de packaging:** nunca criar bundles com mais de 3 componentes. Acima disso, o parceiro perde clareza sobre o que está a comprar.

---

## 3. Matriz Comercial por Tipo de Parceiro

Para cada segmento: o que querem, como aparecem no site, qual o CTA ideal e qual o risco comercial.

---

### Segmento 1 — Escola de Surf

| Dimensão | Detalhe |
|---|---|
| **Objetivo do parceiro** | Aparecer quando alguém pesquisa "escola de surf [praia]" — antes do Booking, sem comissão por aula |
| **Formato de visibilidade** | Perfil verificado em `surf.html` + bloco na `beach.html` do spot primário + dados de condições em tempo real ao lado do perfil |
| **Entregáveis possíveis** | Perfil (foto, descrição, certificações, idiomas), widget de condições integrado, CTA WhatsApp/site, badge "Escola Verificada", Schema LocalBusiness |
| **CTA ideal** | "Reservar Aula" → WhatsApp direto ou link para website do parceiro (sem intermediário) |
| **Página mais relevante para venda** | `surf.html` — mostrar ao prospecto que é onde vai aparecer; mostrar que `beach.html` de cada spot tem esse bloco |
| **Risco/comentário** | Sazonalidade alta — parceiros podem cancelar no outono. Incentivar contrato anual com desconto vs. sazonal. A API de condições é o diferencial mais difícil de replicar noutros portais — usar como argumento central |

---

### Segmento 2 — Charter de Pesca Desportiva

| Dimensão | Detalhe |
|---|---|
| **Objetivo do parceiro** | Visibilidade para turistas internacionais que pesquisam com meses de antecedência; contactos diretos sem plataforma intermediária |
| **Formato de visibilidade** | Perfil verificado em `pesca.html` + bloco na `beach.html` das praias/portos associados + menção em guias editoriais de pesca |
| **Entregáveis possíveis** | Perfil (embarcação, espécies, saídas, certificações, idiomas), fotos de capturas, CTA por WhatsApp/email, Schema LocalBusiness, versão do perfil em inglês (add-on) |
| **CTA ideal** | "Contactar Charter" → WhatsApp ou email direto |
| **Página mais relevante para venda** | `pesca.html` — mostrar posicionamento atual e onde aparece o bloco de destaque; combinar com a `beach.html` do porto de saída |
| **Risco/comentário** | Perfis de charter têm conteúdo mais técnico (espécies, equipment, licenças) — requerem onboarding mais detalhado. Considerar perfil bilingue (PT/EN) como add-on desde o início, porque o público-alvo principal são turistas internacionais |

---

### Segmento 3 — Alojamento Boutique Costeiro

| Dimensão | Detalhe |
|---|---|
| **Objetivo do parceiro** | Reduzir dependência do Booking.com; aparecer no contexto de planeamento de viagem antes da OTA; receber reservas diretas |
| **Formato de visibilidade** | Bloco de alojamento recomendado em `beach.html` das praias próximas + menção em guias editoriais da região + destaque em leads do `planear.html` para a região |
| **Entregáveis possíveis** | Perfil (fotos, características, link direto para reservas), destaque nas praias mais próximas (até 3), Schema LodgingBusiness, encaminhamento de leads de planeamento da região |
| **CTA ideal** | "Ver Disponibilidade" → link direto ao website do alojamento (sem booking engine próprio) |
| **Página mais relevante para venda** | `beaches.html` + `beach.html` das praias próximas — mostrar ao prospecto que os viajantes que veem a praia verão o alojamento |
| **Risco/comentário** | Ciclo de venda mais longo; o decisor pode ser o dono ou o manager de marketing. Verificar sempre Authority antes de avançar. A proposta de "reserva direta" é mais convincente do que "visibilidade" para este segmento |

---

### Segmento 4 — Restaurante Costeiro

| Dimensão | Detalhe |
|---|---|
| **Objetivo do parceiro** | Ser encontrado por viajantes na fase de decisão de onde comer — depois de escolherem a praia |
| **Formato de visibilidade** | Bloco "Onde comer" em `beach.html` das praias próximas + menção em guias editoriais da região |
| **Entregáveis possíveis** | Ficha (especialidade, horário, contacto, localização, foto), posição no bloco da praia, menção em newsletter sazonal |
| **CTA ideal** | "Ver Restaurante" → link para Google Maps ou website |
| **Página mais relevante para venda** | `beach.html` da praia mais próxima — mostrar o bloco "O que fazer e onde comer perto desta praia" |
| **Risco/comentário** | Ticket mais baixo. Fechar em volume (vários restaurantes por região) para que o modelo faça sentido. Não investir muito tempo de outreach por restaurante individual — criar processo de self-signup ou onboarding simplificado |

---

### Segmento 5 — Operadores de Experiências (Kayak, SUP, Mergulho, Passeios de Barco)

| Dimensão | Detalhe |
|---|---|
| **Objetivo do parceiro** | Visibilidade para turistas que pesquisam "atividades [praia/região]" — segmento em crescimento com pouca concorrência digital |
| **Formato de visibilidade** | Perfil em `beach.html` no bloco de atividades + destaque em `planear.html` pós-submissão quando o tipo de experiência for "aventura" ou "natureza" |
| **Entregáveis possíveis** | Perfil (atividades oferecidas, nível, duração, contacto), destaque sazonal, leads de planeamento com perfil de aventura/natureza |
| **CTA ideal** | "Reservar Atividade" → WhatsApp ou email direto |
| **Página mais relevante para venda** | `planear.html` — mostrar ao prospecto que os pedidos com tipo "experiência" chegam ao parceiro; `beach.html` das praias onde operam |
| **Risco/comentário** | Segmento mais heterogéneo — kayak é diferente de mergulho é diferente de dolphin watching. Criar categoria "Experiências" em `beach.html` que agrupe estas atividades antes de abordar este segmento |

---

### Segmento 6 — Marcas e Retalho Local (Surf Shop, Loja Náutica)

| Dimensão | Detalhe |
|---|---|
| **Objetivo do parceiro** | Presença antes da chegada do cliente à zona; captar o turista que ainda está a planear o que levar/alugar |
| **Formato de visibilidade** | Menção em guias editoriais ("O que precisas para surfar no Algarve"), bloco de equipamento em `surf.html` / `pesca.html`, afiliado de loja online (futuro) |
| **Entregáveis possíveis** | Perfil básico (localização, especialidade, link), menção editorial contextualizada, afiliado de link para loja online (quando aplicável) |
| **CTA ideal** | "Ver Loja" → link para site ou Google Maps |
| **Página mais relevante para venda** | `surf.html`, `pesca.html` — bloco "Equipamento e lojas" por região |
| **Risco/comentário** | Menor prioridade de outreach direto. Abordar quando os segmentos 1–3 já estiverem operacionais. Maior potencial via afiliado de loja online do que via plano de visibilidade |

---

## 4. Lógica de Packaging

### Evergreen (12 meses)
- Desconto vs. mensal (ex: equivalente a 10 meses pagando 12)
- Renovação automática discutida no onboarding
- Ideal para: alojamentos, restaurantes, negócios com operação ano inteiro
- Argumento de venda: "posicionamento persistente, não sazonal"

### Sazonal (3–6 meses)
- Preço por mês mais alto do que o anual, mas comprometimento mais curto
- Período: tipicamente março–setembro ou abril–outubro
- Ideal para: escolas de surf, charter de pesca, operadores de experiências
- Argumento de venda: "presença garantida durante a época alta, sem compromisso anual"
- Risco: churn alto no outono — usar o fim da época para propor conversão para anual

### Campanha (1–4 semanas)
- Sponsored placement específico
- Ticket alto por semana (premium de urgência/contexto)
- Ideal para: lançamento de produto/serviço novo, época de pico específica (ex: agosto)
- Não usar para perfis de presença — apenas para posições editoriais temporárias
- Requer: tráfego da página onde vai o placement já demonstrável

### Piloto (30 dias gratuito ou com desconto)
- Sem auto-renovação — requer decisão ativa de continuar
- Perfil publicado, CTA real, dados de cliques reportados ao parceiro
- Objetivo: criar prova de conceito e momento de decisão informada
- Condição: parceiro compromete-se a fornecer fotos e conteúdo no prazo de 5 dias
- Transição: ao fim dos 30 dias, proposta de Pro ou Partner com dados reais do piloto

---

## 5. Add-ons Possíveis Sem Backend Novo

Estes são entregáveis adicionais que podem ser vendidos como extras ao plano base, todos implementáveis com frontend estático.

| Add-on | O que é | Quem beneficia | Complexidade de implementação |
|---|---|---|---|
| Perfil em inglês | Tradução do perfil para EN; CTA configurado para mercado internacional | Charter de pesca, experiências, alojamentos | Baixa — conteúdo manual |
| Badge "Verificado" adicional | Badge extra em `beaches.html` quando a praia associada aparece nas pesquisas | Escolas de surf, alojamentos | Baixa — HTML/CSS |
| Schema markup LocalBusiness | Estrutura de dados para SEO local do parceiro | Todos os segmentos | Baixa — JSON-LD inline no perfil |
| Menção em newsletter | Inclusão em 1 edição da newsletter editorial do portal | Qualquer parceiro com produto sazonal | Nenhuma (gestão editorial) |
| Foto em destaque no hero de spot | Foto do parceiro usada como imagem de fundo ou destaque numa `beach.html` específica | Escolas de surf, alojamentos, operadores | Baixa — configuração manual |
| Destaque no "Como escolher" de beaches.html | Marca do parceiro como exemplo num dos 4 perfis de viagem | Qualquer segmento alinhado com os perfis | Baixa — HTML hardcoded por período |
| Guia editorial dedicado | Artigo/guia do tipo "Surf em Ericeira: guia completo" com o parceiro como destaque | Escolas de surf, charter, alojamentos premium | Média — requer criação de página nova |

---

## 6. Regras de Pricing Architecture

Não há valores definidos neste documento — esses devem ser testados com os primeiros parceiros. O que está aqui são as regras estruturais que garantem coerência e sustentabilidade do modelo.

**Regra 1 — Hierarquia de valor**
`Partner > Pro > Gratuito` em visibilidade, prioridade de posição e volume de leads. Nenhum plano de nível inferior pode ter um entregável que é exclusivo de um nível superior.

**Regra 2 — Ancoragem**
O plano Pro deve ser o ponto de referência central. O Gratuito deve parecer insuficiente e o Partner deve parecer aspiracional. A maioria dos parceiros deve fechar no Pro.

**Regra 3 — Desconto anual não como percentagem, mas como meses grátis**
"Paga 10 meses, fica 12" é mais tangível do que "20% de desconto". Usar esta framing nas propostas.

**Regra 4 — Sazonal não pode ser mais barato por mês do que o anual**
O sazonal é conveniente, não económico. Se o preço por mês do sazonal for igual ao anual, o parceiro não tem razão para comprometer anualmente.

**Regra 5 — Sponsored placement tem ticket independente dos planos**
Não incluir sponsored placement nos planos Pro ou Partner por padrão — é um add-on ou produto separado, vendido quando a página tem tráfego real.

**Regra 6 — Piloto não é desconto disfarçado**
O piloto tem duração e condições claras. Não prorrogar automaticamente. Não usar o piloto para parceiros que já decidiram que não querem — só para os genuinamente indecisos.

**Regra 7 — Transparência de entregáveis no contrato**
Cada proposta deve listar os entregáveis exatos, as páginas onde aparecem e a duração. Sem promessas abertas de "destaque".

---

## 7. Critérios para Plano Recomendado

Usar este decision tree na discovery call para recomendar o plano certo:

```
O parceiro tem operação durante todo o ano?
  → Sim → Recomendar anual (Pro ou Partner)
  → Não → Recomendar sazonal (Pro sazonal)

O parceiro quer receber leads qualificadas com perfil de viagem?
  → Sim → Partner (quando planear.html tiver volume)
  → Não → Pro

O negócio opera em mais de 1 spot/praia?
  → Sim → Partner ou Pro com add-on de praias adicionais
  → Não → Pro standard

O parceiro tem budget limitado e está em dúvida?
  → Oferecer Piloto 30 dias → Pro depois

O parceiro tem produto sazonal de alto ticket e quer exposição num pico específico?
  → Considerar Sponsored Placement sazonal (mesmo sem plano anual)
```

---

## 8. Estrutura de Proposta Comercial

A proposta enviada após a discovery call deve ter este formato. Não usar PDF longo. Email ou Google Doc são suficientes no início.

---

**[Nome do negócio] × Portugal Travel Hub — Proposta de Parceria**

**Contexto (2-3 linhas):**
O Portugal Travel Hub é o portal onde viajantes nacionais e internacionais descobrem praias, spots de surf e experiências costeiras. O teu negócio em [localização] aparece precisamente nas páginas que os teus futuros clientes visitam antes de chegar.

**O que recebes (lista específica para o parceiro):**
- Perfil verificado em [surf.html / pesca.html / beach.html específica]
- [Foto + descrição + CTA configurável]
- [Widget de condições, se for surf/pesca]
- [Leads da região X, se for Partner]
- [Duração: sazonal X meses / anual]

**Plano recomendado:**
[Pro / Partner] — [periodicidade] — [placeholder de preço]

**Próximo passo:**
[Link para parceiros.html#candidatura] ou responde a este email com confirmação — em 48h o perfil está publicado.

---

**Regras de proposta:**
- Máximo 1 página
- Nunca enviar antes da discovery call
- Ligar sempre `precos.html` como referência de planos
- Incluir link para a página onde o parceiro vai aparecer (para visualização imediata)

---

## 9. O Que Precisa Existir no Site para Cada Oferta Funcionar

Este mapeamento define os requisitos de produto por tipo de oferta. Cruzar com `site-commercial-assets-spec.md` para backlog de implementação.

| Oferta | Requisito de produto no site | Estado atual | Prioritário |
|---|---|---|---|
| Presença Base | Listagem simples em `surf.html` / `pesca.html` — nome + link | Inexistente (só conteúdo editorial) | Sim |
| Destaque Premium (Pro) | Bloco de parceiro verificado em `beach.html` com foto, descrição, CTA | Inexistente | Sim — primeiro a construir |
| Destaque Premium (Pro) | Secção "Parceiros verificados" em `surf.html` e `pesca.html` | Inexistente | Sim |
| Geração de Leads (Partner) | `planear.html` com volume real de submissões | Formulário existe; volume TBD | Médio |
| Geração de Leads (Partner) | Processo manual de matching lead → parceiro por email | Não codificado — operacional | Baixo (processo, não código) |
| Sponsored Placement | Página de alta intenção com tráfego demonstrável | Páginas existem; tráfego TBD | Médio (depende de SEO) |
| Sponsored Placement | Bloco editorial reservado para "parceiro em destaque" em `beach.html` | Inexistente | Médio |
| Add-on Schema markup | JSON-LD `LocalBusiness` inline no HTML do perfil de parceiro | Inexistente | Baixo — implementar no onboarding |
| Piloto | Demo de perfil publicado numa `beach.html` real | Inexistente | Sim — criar 1 exemplo antes do primeiro outreach |

---

*Este documento é interno, de arquitetura comercial. Não publicar. Rever quando houver mudanças de produto ou de pricing.*
