# Auditoria funcional — Planeador (/planear e /en/planear) — 08/10/2026

Área: **planeador**. Testado no site em produção com Playwright/Chromium (`service_workers='block'`), a 1280x900, 375x812 e 320x640. **Nenhum email foi introduzido e nenhum lead foi gravado.**
Capturas de ecrã: `/mnt/user-data/outputs/audit/shots/planeador/`

Nota: o briefing fala num assistente de 3 passos, mas o planeador v3 tem **5 passos** (Interesse → Destino → Datas → Viajantes → Estilo). Foram testados os 5.

## 1. Resultados

| id | sev | página/URL | ecrã | o que o utilizador vê | como reproduzir | evidência |
|---|---|---|---|---|---|---|
| PLN-01 | **P1** | `/planear?beach=<nome>&i=praia&ref=beaches` (link "Planear" dos cartões de praia) | todos | Para 222 das 522 praias ativas (133 das 137 praias fluviais e 54 praias dos Açores, entre outras), o planeador **não reconhece a praia**: abre no passo 2 "Para onde quer ir?" sem destino e sem mencionar a praia. Quem escolher "Surpreendam-me" recebe um plano para **Albufeira**, mesmo vindo de uma praia dos Açores. | `/planear?beach=Praia%20Fluvial%20de%20Monsaraz&i=praia&ref=beaches`, `…Praia Fluvial da Lenta…`, `…Praia Fluvial de Odeleite…`, `/en/planear?beach=Piscinas%20Naturais%20da%20Lagoa%20(S%C3%A3o%20Miguel)&i=praia` | `entry-E4…E8*.png`. Causa: `planner-v3.js` carrega as praias com `limit=300`, mas a BD tem 522 ativas (`content-range: 0-521/522`). As praias que ficam de fora não podem ser encontradas pelo nome. |
| PLN-02 | **P1** | `/planear?beach=Praia%20Fluvial%20de%20Montes%20(Tomar)&i=praia&ref=beaches` | 375 | Uma praia fluvial em Tomar (que o planeador reconhece) gera o destino "Costa de Prata" e um plano para dormir na **Nazaré**, a cerca de 70 km, na costa. Isto não faz sentido para quem quer ir a uma praia de rio no interior. | abrir o URL → passo 3, Destino = "Costa de Prata" → concluir → "Nazaré · Costa de Prata" | `entry-E3-fluvial-tomar-in300.png`. As vilas-base são todas costeiras. Quando a praia fica a mais de 60 km de todas elas, o planeador usa a região da BD ("Centro" → costa-prata). |
| PLN-03 | **P1** | `/planear`, `/en/planear` | todos | O banner de cookies **não tem estilos**: aparece como texto e botões soltos **depois do rodapé** (`position: static`). Quase ninguém o vê, por isso o consentimento de analytics fica por dar e o funil do planeador quase não é medido. Em `/en/planear` o banner aparece em **português** ("Usamos cookies…", "Aceitar/Rejeitar/Personalizar"). | abrir `/planear` em contexto novo → fazer scroll até ao fim | `cookie-bottom-planear.png`, `cookie-bottom-en-planear.png`. O planeador carrega `planner-v3.css`, `site-chrome.css` e `footer-v2.css`, mas não `style.css`. Em `/beaches.html` o banner é `position: fixed`. |
| PLN-04 | **P1** | `/planear` | 320 | Numa viagem com mais de 30 noites (ex.: 1 nov → 31 dez), o assistente aceita as datas e mostra "60 noites". O resultado mostra **"Datas flexíveis"** e os links Stay22/GYG perdem as datas, **sem qualquer aviso**. O utilizador pensa que os preços são para as suas datas. | Praia+Surf+Pesca → Madeira → datas 2026-11-01 / 2026-12-31 → Grupo grande → Sem limite → Criar | `S4-3-datas.png`, `S4-6-result-top.png`. Link: `stay22.com/allez/booking?…address=Funchal…&adults=8&rooms=3` (sem checkin/checkout). Causa: `tripDates()` em `plan-engine.js` (`nights > 30 → null`). |
| PLN-05 | **P1** | `/en/planear` (e PT) → região Açores | 1280 | O cartão diz "Car hire in Ponta Delgada", mas o link abre a página genérica **Portugal** da DiscoverCars (`discovercars.com/portugal?a_aid=portalturismoportugal`), não o aeroporto PDL. O ID de afiliado está presente, mas o utilizador tem de pesquisar outra vez (perde-se conversão). | Beach+City & food → Azores → … → cartão "Getting around" | `S5-6-result-full.png`. Testei `discovercars.com/portugal/ponta-delgada`, `/azores` e `/sao-miguel`: todos 404. **A confirmar** qual é o slug certo do PDL na DiscoverCars. |
| PLN-06 | **P1** | `/planear` resultado, iPhone (UA iOS) | 375, 320 | Na folha "Adicionar ao ecrã principal" (botão "Instalar app"), o botão **"Percebi" fica tapado pela barra de navegação inferior**. Só se vê uma tira de ~18 px do botão. | UA iPhone → abrir um plano → "Instalar app" | `ios-sheet-375.png`, `ios-sheet-320.png`, `S8-7-ios-sheet.png`. `elementFromPoint` no centro do botão devolve `.mobile-nav-item`. Fecha com Esc ou com toque no fundo. |
| PLN-07 | P2 | link partilhado `?plano=1&…&ref=partilha` | 375/1280 | Quem recebe o plano partilhado vê muitas vezes o hero **sem foto** (cartão escuro) e **sem a secção "Praias a não perder"**. O mesmo plano criado pelo assistente mostra foto e praias. | abrir num contexto novo `/planear?plano=1&i=pesca&r=minho&n=5-8&o=premium&ref=partilha` (ou `…&r=oeste&…&de=2026-09-01…`) | `share-PT-minho-top.png` vs `S3-6-result-top.png`. Causa: com link partilhado, o planeador só espera 1,5 s pelas praias antes de montar o plano. |
| PLN-08 | P2 | `/planear`, `/en/planear` passo "Quando?" | 375/1280 | Datas **passadas escritas à mão** (ex.: 01/09/2026–05/09/2026) são aceites e o resumo mostra "Sep 1–5 · 4 nights". No resultado passam silenciosamente a "Flexible dates". | EN: City & food → Alentejo Coast → escrever as datas → … | `S6-3-datas.png`, `S6-6-result-top.png` |
| PLN-09 | P2 | passo "Quando?" | 1280 | Com partida antes ou igual à chegada, a mensagem de erro aparece bem, mas o resumo lateral mostra **"20–18 out · -2 noites"** e **"Nov 10–10 · 0 nights"**. | Chegada 20/10, Partida 18/10 (ou EN 10/11–10/11) | `S1-3-date-error.png`, `S5-3-sameday.png` |
| PLN-10 | P2 | passo "Quando?" | 1280 | **Enter** dentro do campo de data não avança (fica em "Passo 3 de 5"). Enter num cartão de opção e no botão "Continuar" funciona. | escrever as datas → Enter | wiz_S1: `enter_in_date = "Passo 3 de 5"` |
| PLN-11 | P2 | resultado | 1280/375 | A faixa "AGORA EM ALBUFEIRA / VILAMOURA / VIANA DO CASTELO" aparece **vazia** (só o título, sem temperatura/água/ondas) quando o Open-Meteo falha. Não há fallback e o bloco não fica escondido. | plano Algarve | `S1-6-result-full.png`, `share-PT-minho-top.png`. Consola: CORS/`ERR_FAILED`. Por curl, o Open-Meteo respondeu `"Daily API request limit exceeded"` ao IP de teste. **A confirmar** se acontece a utilizadores reais. |
| PLN-12 | P2 | resultado Madeira / Minho / Açores | todos | "Praias a não perder perto de Funchal" lista **Jardim do Mar (29 km), Seixal (24 km), Paul do Mar (28 km)**, todas na outra costa da ilha. A foto do hero do Funchal também é do Jardim do Mar. Em Viana do Castelo, a primeira é **Praia das Caxinas (38 km, Vila do Conde)**, apesar de a Praia do Cabedelo (1 km) ter foto. Nos **Açores** não aparece nenhuma praia. | planos Madeira/Minho/Açores | `S4-6-result-full.png`, `S3-6-result-full.png`, `S5-6-result-full.png`. As praias do Funchal (Formosa, Lido, Barreirinha, 3–6 km) e de Ponta Delgada não têm imagem na BD. A ordenação dá mais peso ao `editorial_rank` do que à distância. |
| PLN-13 | P2 | resultado | 320 | O crédito da foto ("Jardim do Mar · Foto: Wikipedia contributors · CC BY-SA 3.0") **sobrepõe-se** ao texto "O SEU PLANO ESTÁ PRONTO". O ícone do menu (hambúrguer) fica **cortado** à direita (`#nav-toggle` termina em x=335 num ecrã de 320). | abrir qualquer plano a 320 px | `S4-6-result-top.png`, `S4-0-start.png` |
| PLN-14 | P2 | resultado | 375 | Mesmo com scroll até ao fim, a última linha do rodapé (**Privacidade · Termos · Cookies · Reembolsos** e ©) fica escondida atrás da barra "Próximo" e da barra de navegação inferior. Falta espaço no fundo da página para estas duas barras. | abrir um plano → scroll até ao fim | `results-bottom-375.png` |
| PLN-15 | P2 | `/planear` "Cidade e sabores" + "Cascais e Lisboa" | 375 | A região chama-se "Cascais e Lisboa", mas um plano de cidade/gastronomia põe o alojamento em **Cascais** (GYG "Experiências — Linha de Cascais"), não em Lisboa. Há duas designações para a mesma região: "Cascais e Lisboa" (assistente) e "Linha de Cascais" (cartões). | `/planear?plano=1&i=roteiro&r=cascais&n=2&o=moderado` | saída `last.py` |
| PLN-16 | P2 | mapa Stay22 em `/en/planear` | 375 | O mapa segue o idioma do browser e ignora `lang=en`. Com browser em PT, a página EN mostra "Ver acomodações / Mostrar Lista / Distribuído por". Em páginas PT apareceu às vezes "See accommodations / Show List". | `/en/planear` com browser pt-PT | `S6-6-map.png`, `S4-6-map.png`. É de terceiros (**a confirmar** se o parâmetro de idioma é outro). |
| PLN-17 | P2 | resultado | todos | Detalhes de texto: o chip de pessoas mostra só **"Mais de 8"** (falta "pessoas"). O estilo chama-se "Confortável"/"Sem limite", mas a nota diz "Orçamento moderado…"/"Orçamento de luxo…". | Grupo grande + Sem limite | `S4-6-result-top.png` |
| PLN-18 | P2 | resultado Cascais / Ericeira | 375 | O mosaico da **Praia da Ursa** fica em branco: a imagem vem diretamente de `upload.wikimedia.org` e foi bloqueada (`ERR_BLOCKED_BY_ORB`; por curl, 429 Too Many Requests). **A confirmar**: pode ser limite por IP, mas mostra que depender de imagens servidas pela Wikimedia é frágil. | plano surf Cascais | log `share.json` / `entry.json` |

Não foram encontrados links de parceiro sem ID: as 0 falhas de ID abrangem todos os cartões, o mapa, a checklist e a barra "Próximo" nos 8 cenários, 11 links partilhados e 11 links de entrada.

## 2. Testado e OK (cobertura)

- **8 cenários completos do assistente:**
  - S1 Praia/Algarve/20–25 out/2 adultos/Confortável a 1280
  - S2 Surf/Cascais e Lisboa/chip "Próximo fim de semana"/1 adulto/Económico a 375
  - S3 Pesca/Minho/"Ainda não sei"/5–8/Premium a 375
  - S4 misto/Madeira/60 noites/8+/Sem limite a 320
  - S5 EN Beach+City/Azores/mesmo dia → 3 noites/Family/Premium a 1280
  - S6 EN City/Alentejo/datas passadas/Couple/No limit a 375
  - S7 Praia/Algarve/check-in hoje/Sem limite (→ Vilamoura) a 375
  - S8 Surf/Surpreendam-me/"Daqui a 2 semanas"/UA iPhone a 375
- **Sem erros de JavaScript** (`pageerror` = 0), sem scroll horizontal e sem imagens `<img>` partidas em todos os cenários. As únicas mensagens na consola foram Open-Meteo, Stay22 (airports timeout, Sentry 429) e Wikimedia.
- **Validações:**
  - "Continuar" fica desativado sem escolha.
  - "A partida tem de ser depois da chegada." / "Check-out must be after check-in." aparece corretamente.
  - Ao escolher a chegada, a partida é preenchida automaticamente com +3 noites.
  - "Voltar" mantém todas as escolhas.
  - Enter num cartão e em "Continuar" funciona.
  - O ecrã "A montar o seu plano…" aparece.
- **Links de parceiro, todos com ID:**
  - Stay22 Allez: `aid=kaptarstudio`, datas, `adults` e `rooms` corretos (1→1/1, 2→2/1, 3–4→4/1, 5–8→6/2, 8+→8/3).
  - Mapa Stay22 embed: `aid` + `campaign …-mapa`.
  - GYG: `partner_id=0WTBHZE` + `cmp=pthplanear` / `pthplanearen` (+ `-partilha` nos links partilhados), com `date_from` e `date_to`.
  - DiscoverCars: `a_aid=portalturismoportugal`, com o aeroporto certo (Faro, Lisboa, Porto, Madeira); exceção: Açores, ver PLN-05.
  - BookSurfCamps: `aid=11861`, com o slug da região (PT e EN).
- **Mapa Stay22:** carrega com preços para Albufeira, Cascais, Funchal, Ponta Delgada, Milfontes, Ericeira, Setúbal e Viana (pode demorar 10–15 s).
- **Checklist / progresso:** clicar num cartão marca o passo (1/3). A barra "Próximo" a 375 e 320 abre por ordem Alojamento → Carros → Experiências, cada clique abre o parceiro certo, chega a 3/3 e esconde-se ao fim de 4 s.
- **"Alterar":** volta ao passo 1 com as escolhas mantidas, esconde o resultado e a barra, e permite refazer o plano.
- **Link partilhado:** abre noutro contexto e reproduz o mesmo plano ("Plano partilhado consigo"). Parâmetros inválidos (`i=xpto&r=marte`) caem no passo 1 sem erro.
- **"Instalar app":** o cartão e a folha iOS aparecem com UA iPhone (ver PLN-06); Esc fecha. Em Android/desktop o cartão depende de `beforeinstallprompt`, que o Chromium headless não dispara (**não testável aqui**).
- **Links de entrada:**
  - `?beach=Praia%20da%20Rocha&i=praia&ref=beaches` → Algarve · Portimão, no passo 3.
  - `?r=costa-prata&i=surf` → Nazaré + BookSurfCamps `nazare`.
  - Formato antigo `planear.html?source=pesca&tipo=pesca&region=Lisboa e Setúbal` → Pesca/Cascais.
  - `/planear-v3` (301), `/planear.html` (308), `/en/planear.html` (308) e `/en/planear-v3` (301) redirecionam e **mantêm a query string**.
- **85 links internos** encontrados nas páginas do planeador (PT e EN, incluindo `beach.html?id=` e `/en/beach.html?id=`) respondem 200.
- **EN:** nenhum texto em português na interface do planeador, além de nomes próprios de praias. Exceções: o banner de cookies (PLN-03) e o mapa Stay22 (PLN-16).
