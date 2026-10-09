# HANDOFF — Portal Turismo Portugal (atualizado 08/10/2026, 17h30)

Ler isto primeiro, depois `CLAUDE.md` e `docs/REGRESSION-WATCHLIST.md`. Cópia no projeto Claude: `claude/handoff-proximos-4-2026-10.md`. Praias em detalhe: `claude/praias-correcao-e-ampliacao-2026-10.md`.

## Pesca lotes P2 + P3 (08/10, noite) — PRONTO, POR PUBLICAR
- Pesca: 33 -> 76 (P2) -> **117 spots** (P3). Por região: Norte 20, Centro 20, Lisboa 12, Alentejo 18, Algarve 20, Açores 11, Madeira 8. Fontes e regras por spot: `claude/pesca-spots-lote-p2-2026-10.md` e `claude/pesca-spots-lote-p3-2026-10.md` (projeto Claude).
- Fotos Commons verificadas: 38 (P2) + 33 (P3). Sem foto (fundo de cor): Alto Ceira, Unhais, Santa Clara, Tapada Grande, Odeleite, Rio Mouro, Lagos do Sabor, Idanha, Ericeira, Pego do Altar, Vale do Gaio, Odivelas, Olhão.
- Decisões tomadas (Ricardo: "você decide"): tirados sável/lampreia (Rio Lima) e atum-rabilho (Caniçal, Sesimbra, Portimão) das espécies-alvo + aviso; FAQ "sável e lampreia nos rios" -> truta 1 mar–31 jul; defeso do sargo PNSACV = 1–28 fev (FAQ DGRM 2026); Tejo = Portaria 330/2026/1 (2 canas, 3 anzóis).
- Testado: Playwright com CSP real, 1280/375, PT+EN: 117 cartões, 0 erros JS, 0 fotos partidas. **Risco Open-Meteo** (ver watchlist): 117+126 coordenadas por pedido.
- **Commit único** (ficheiros partilhados com o surf): `git add -f` das listas `docs/commit-files-2026-10-08-surf-s2.txt`, `...-surf-s3.txt`, `...-pesca-p2.txt`, `...-pesca-p3.txt`.

## PRÓXIMA SESSÃO — análise fria de https://www.pesca-pt.com/ (pedido do Ricardo, 08/10)
Objetivo: com mentalidade de prosperar e faturar, ver o que podemos aproveitar desse site para **aumentar visualizações** no portalturismoportugal.com e **converter visitas em compras** (afiliados que faturam + Pro).
- O que já se sabe (leitura rápida a 08/10): pesca-pt.com é um site PT de pesca lúdica com conteúdo de referência — nós, técnicas, peixes de mar e de rio, montagens, dicas, "Pesqueiros", material (anzóis, canas, carretos, chumbadas, iscos, linhas), peixes perigosos, glossário, calendário de defesos e tamanhos mínimos 2025 (atualizado 22/07/2025). Não mostra loja, anúncios, afiliados nem marés/previsões.
- Hipótese a testar (não é conclusão): eles têm conteúdo evergreen de "como pescar" que capta pesquisa; nós temos dados ao vivo (mar, marés, spots com mapa, webcams) e monetização. Lacunas possíveis do lado deles = oportunidade nossa (condições ao vivo, calendário 2026 atualizado, material com afiliados, saídas de pesca GYG).
- Como fazer: 1) inventário do site deles (páginas, temas, profundidade, data de atualização, estrutura de URLs, schema); 2) estimar procura das palavras-chave por trás de cada secção (GSC do Ricardo: `claude/gsc-palavras-chave-2026-10.md`; pesquisa web); 3) comparar com /pesca e /en/pesca (33 spots, `claude/pesca-pesquisa-spots-2026-10.md`); 4) lista priorizada com custo-benefício: o que copiar como formato (nunca copiar texto), o que fazer melhor, onde pôr afiliados (material de pesca — verificar programas que faturam em PT: Amazon? Decathlon? Pescamar? — confirmar antes de propor), saídas de pesca GYG `0WTBHZE`, Pro; 5) não mexer no site sem aprovação — primeiro o relatório.
- Regras do Ricardo: tudo digital (sem vendas offline), só links que faturam, design próprio por página, hero sempre o elemento principal, créditos de foto quase invisíveis.

## Estado no fim de 08/10 — TUDO PUBLICADO
- Commits publicados hoje (Ricardo): `c83586d` surf +15 spots e pesca P1, `6c7d136` barra do telemóvel com Webcams em todas as páginas, `b3968f3` praias P0 + B1, `5475dd6` praias B2+B3+B4 (201 praias, Açores região nova, câmaras ligadas às praias, contadores dinâmicos).
- **Praias: 329 públicas** (eram ~111/128). Verificado em produção: 329 cartões, 210 pontos no mapa, cartões Madeira 39 e Açores 80, calmo+moderado+agitado = 329, 0 fotos partidas.
- Surf: 38 spots. Pesca: 33 spots. Webcams: 146 câmaras com "Guia da praia".
- Depois do último deploy só mudou a BD (aviso de interdições na Praia dos Mosteiros) e este HANDOFF.md (não se publica).
- Ferramenta de teste: `.\testar-praias.ps1` (local / `-Lan` / `-Preview`) mostra praias ainda inativas só na cópia de teste.
- Lixo a apagar pelo Ricardo (a VM não pode apagar): `docs/_to_delete/` (124 imagens órfãs de um build interrompido + listas antigas).

## Pendentes (por valor)
1. Página "mapa praias algarve" (1k–10k pesquisas/mês, concorrência baixa) — já há 78 praias do Algarve na BD.
2. Praias que faltam no mar: ~33 Norte (muitos troços urbanos Póvoa/Matosinhos/Gaia), ~10 Centro, ~4 Alentejo; depois 167 fluviais. Método em `claude/praias-correcao-e-ampliacao-2026-10.md` (4–5 agentes em paralelo; ~1h30 por 100 praias).
3. Bandeira Azul 2026 para todas antes de mostrar selo; 33 praias sem foto; páginas estáticas `praias/*` com qualidade da água desatualizada (só Matosinhos corrigida); banner de região nunca aparece em /en/beaches.
4. Pesca: lotes seguintes da pesquisa; Surf: lotes Algarve/Sagres, Norte, Alentejo, Madeira, Açores; foto da Pedra Branca.
5. Medir ~14/10 e ~04/11: GA4 `affiliate_click`, `webcam_action`, `surf_webcam_click`; Stay22/GYG por campanha.

---

## Repositório
- Branch: `main`. Último commit: `5475dd6` (praias B2+B3+B4, 08/10). Antes: `b3968f3`, `6c7d136`, `c83586d` (08/10), `f0ab61a` (07/10).
- Tudo publicado e confirmado em produção a 08/10 ~17h30 (329 praias).
- Há ficheiros "modificados" que são só diferença de fim de linha (CRLF na VM vs LF no HEAD). Para ver diferenças reais: `git --no-optional-locks diff --ignore-cr-at-eol --numstat HEAD`.
- Commits grandes: gerar a lista exata de ficheiros (`docs/commit-files-*.txt`) e usar `git add --pathspec-from-file=...` para não apanhar ruído de fim de linha.

## Estado real

| Trabalho | Guardado | Publicado | Testado |
|---|---|---|---|
| Redesign (lista abaixo), commit `2c888ed` | sim | **sim, 07/10** | local + produção |
| Velocidade dos heroes (`511ee73`) | sim | **sim** (produção serve `?v=20261007p` + AVIF, confirmado 07/10) | local; **PageSpeed em produção por medir** |
| A. Surf — cartão v2 + fotos (`d6d1e77`) | sim | **sim, 07/10** | local + produção |
| **A2. Surf — hero 'Surf hoje' ao vivo + secções refeitas + fix moldura AVIF do mapa** (`docs/commit-2026-10-07-surf-hero.txt`, backups `docs/_backup-surf-hero-20261007/`, `docs/_backup-avif-20261007/`) | **não (por fazer commit)** | **não** | local, CSP real, 1280/375/320, PT+EN, sem Open-Meteo |
| A2. Surf hero + secções (`898f6bb`) + fix GYG | sim | **sim, 07/10** | produção (Chrome: GYG 495 px) |
| A3. Surf — lotes 1a+1b (08/10): 23 → 38 spots (+Ericeira/Peniche/Cascais/Sintra/Almada), 14 fotos Commons, link 'Webcam ao vivo' em 33 cartões (SURF_CAM), pontos do mapa por qualidade, paginação em /en/surf, textos de alertas honestos, Odeceixe → Algarve (lista `docs/commit-files-2026-10-08-surf-1a.txt`, backup `docs/_backup-surf-lote1-20261008/`) | **não (por fazer commit)** | **não** | local, CSP real, 1280/375, PT+EN, Open-Meteo sintético |
| P. Pesca v2 (`47d8c86`) | sim | **sim, 07/10** (Ricardo: "Feito") | local; produção por confirmar no Chrome |
| **W. Webcams v2 — 'Portugal ao vivo'**: 172 câmaras (MEO só link + 13 diretos YouTube incorporáveis), hero 'ecrã em direto' (sem mapa) com canais e pesquisa, painel da câmara com planear (hotéis/atividades/carro/planeador), regresso do separador MEO, pedido de câmara (submit-contact), diretório e FAQ (`docs/commit-2026-10-07-webcams.txt`, backup `docs/_backup-webcams-20261007/`, dados `_scripts/build_webcams_data.py`) | sim (`f4337b2`) | **sim, 07/10** | local, CSP real, 1280/375/320, PT+EN, sem Open-Meteo, funcionais |
| **W2. Fotos nas webcams (144 + 13 diretos), créditos discretos no site todo, /planear com navbar e rodapé do site, geolocation=(self)** (`docs/commit-2026-10-07-creditos-planear.txt`, lista de ficheiros `docs/commit-files-2026-10-07-creditos.txt`, backups `docs/_backup-creditos-20261007/`, `docs/_backup-planear-20261007/`) | sim (`557223f`) | **sim, 07/10** | local, CSP real, 1280/375/320, planeador até aos resultados |
| F. /planear: barra 'Próximo' abria o parceiro errado + logotipo escuro (`f0ab61a`) | sim | **sim, 07/10** | local (3 cliques abrem Stay22/DiscoverCars/GYG certos) + produção |
| HANDOFF.md + `preview.ps1` + `serve-local.ps1` | sim (checkpoint 2) | não se publica (excluído do deploy) | — |

**Redesign publicado em `2c888ed`:**
- cartões de praia v2 + filtros v2 em /beaches;
- 62 fotos de praias corrigidas (Commons, créditos em `docs/FOTOS-CREDITOS.md`);
- 25 fotos na pesca;
- hero dos Guias;
- rodapé v2 em 231 páginas;
- hero v3 do início;
- hero v4 de /beaches (mapa em relevo do Ricardo, sem créditos).

**Velocidade, guardada mas não publicada:**
- /beaches: mapa em AVIF via `<picture>`, com webp como reserva, e máscara de 5 KB;
- início: o título deixa de ter fade de opacidade;
- versões dos ficheiros: CSS `?v=20261007p`;
- cópia de segurança em `docs/_backup-perf-20261007/`.

## Validações executadas
- **Antes do deploy (local, CSP real):**
  - 250 páginas a 1280 e 375 px, mais 320 px nas páginas principais;
  - 0 erros JS novos, 0 violações CSP, 0 scroll horizontal;
  - funcionais de /beaches (pontos, tooltip, "Ver mais", filtro, Stay22 → `aid=kaptarstudio`), início, pesca e guias.
- **Produção (07/10):** o mesmo crawl a 1280 e 375 px, sem problemas.
- **PageSpeed no telemóvel:**
  - /beaches: nota 57, LCP 10,6 s (antes 16,6 s);
  - início: nota 59, LCP 14,8 s → é a causa da correção de velocidade.
- **Correção de velocidade:**
  - Lighthouse local: /beaches LCP 3,9 → 2,9 s; início 3,8–6,9 → 2,3 s;
  - diferença de píxeis ≈ 0;
  - funcionais de /beaches e início sem erros;
  - **por medir em produção.**

## Erros e pendentes conhecidos

Já existiam antes deste trabalho:
- `supabase is not defined` nas páginas `praias/*`.
- `db is not defined` em parceiro.html e reset.html.
- /en/404 pede `/en/js/nav.js`, que não existe.
- CLS de 0,23 em /guias.
- A foto do guia de surf (Unsplash `photo-1502680390548`) dá 404, tanto no guia como no cartão em `js/webcams-guias-data.js`.

Novos ou por decidir:
- Ficheiros públicos por engano, que o `deploy.ps1` não exclui:
  - PNGs de outros clientes na raiz (beautymed*, dra-mariana*, glow-*, jhe-*, patricia-*, santiclinic-*);
  - capturas de ecrã: homepage-*, review-0*, southportugal-*;
  - ficheiros de 0 bytes;
  - as pastas `social-media/` (com vídeos) e `tools/`.

  **Decisão do Ricardo.** Proposta: exclusões no `deploy.ps1`.
- Preloader do início (ecrã azul, 1,4–2,2 s em cada visita) atrasa a página. Decisão estética do Ricardo.
- `supabase.min.js` síncrono em /beaches e /surf (55 KB).
- Falta a atribuição do Open-Meteo, que saiu do hero.
- A BD ainda tem as fotos antigas das praias, por isso beach.html continua a mostrá-las.
- Praias duplicadas na BD: Buarcos, Alvor, Armação de Pêra.
- A marca visível ainda diz "Portugal Travel Hub".

## Ficheiros relevantes
- **Praias:**
  - `beaches.html`, `en/beaches.html`;
  - `css/beach-card-v2.css`, `js/beach-card-v2.js`;
  - `css/beach-filters-v2.css`, `js/beaches-filters.js`;
  - `css/beaches-hero-v4.css`, `js/beaches-hero-v4.js`;
  - `js/live-coast.js`;
  - `images/beaches/`, `images/map/`.
- **Surf e pesca:**
  - `surf.html`, `en/surf.html`, `pesca.html`, `en/pesca.html`;
  - `escolas-de-surf.html`, `en/surf-schools.html`;
  - `js/surf-pesca-data.js`, `js/surf-pesca-page.js` (o modelo das fotos da pesca é `FISH_PHOTO` + `fishPhotoHtml`);
  - `css/surf-pesca-page.css`, `images/spots/`.
- **Webcams:**
  - `webcams.html`, `en/webcams.html`;
  - v2 (07/10): `js/webcams-cams.js` (GERADO por `_scripts/build_webcams_data.py` a partir de `_data/meo-livecams-20261007.json` + `_data/beaches-db-20261007.json` + `docs/FOTOS-CREDITOS.md`; o mesmo script reescreve o diretório entre `<!-- WCAM-DIR:START -->` e `END` nas duas páginas), `js/webcams-v2.js`, `css/webcams-v2.css`;
  - `js/webcams-guias-data.js`, `js/webcams-guias-page.js`, `css/webcams-guias-page.css` continuam a servir só /guias;
  - página de spot `webcam-praia-da-luz.html` (gerador `_scripts/gen_spot.py`).
- **Planear:** `planear.html`, `en/planear.html`, `css/planner-v3.css`.
- **Páginas com filtros:** beaches, surf, pesca, webcams, escolas-de-surf (PT e EN), dashboard.
- **Rodapé:** `css/footer-v2.css`, `_scripts/footer_v2.py`.
- **Deploy:** `deploy.ps1`, `preview.ps1 -Branch <nome>`, `serve-local.ps1`.

## Regras (resumo; detalhe em CLAUDE.md)
- **Commits, push e deploy só pelo Ricardo, no PowerShell.**
  - Na VM usar sempre `git --no-optional-locks`: o git normal deixa um `.git/index.lock` que bloqueia o Windows.
- **Parceiros:** só links que faturam — Stay22 `aid=kaptarstudio`, GYG `0WTBHZE`, DiscoverCars `a_aid=portalturismoportugal`, BookSurfCamps `aid=11861`.
  - Não instalar o Travelpayouts Drive.
  - Câmaras MEO só por link, nunca embutidas.
- **Alterações visuais:** capturas antes/depois para aprovação.
- **Sem razão, não mexer** em auth, LemonSqueezy, GA4 nem CRM.
- **Ao alterar JS/CSS publicado:** subir o `?v=` e atualizar a watchlist.
- **Fotos:** só com origem e licença verificadas, com crédito quando a licença o exige.
- **Escrever na pasta pela VM:** usar ficheiro temporário + `os.replace`. Apagar não é permitido; mover para `docs/_to_delete/`.

## Estado 08/10 — Praias (ler primeiro: `claude/praias-correcao-e-ampliacao-2026-10.md`)
- **P0 escrito na BD**: coordenadas e qualidade da água oficiais (EEA 2025) em 99 praias; 3 duplicados desativados (ALIAS em beach-page.js). Ficheiros do site (mapa, alias, surf) por publicar.
- **B1**: 20 praias novas inseridas **INATIVAS**. Depois do deploy das fotos: `python3 _diag/praias/b1/activate.py` (ou pedir ao Claude).
- Commit único P0+B1: `docs/commit-files-2026-10-08-praias-b1.txt`.
- **B1 ativo** (128 praias públicas). **B2**: 18 praias inseridas **INATIVAS** (continente com câmara + Madeira). Depois do deploy: `python3 _diag/praias/b2/activate.py` → 146. Commit: (ver B3 abaixo).
- **B4**: 104 praias INATIVAS (Algarve 13, Oeste 10, Lisboa 7, Madeira 19, Açores 55). Testar antes com `.\testar-praias.ps1`.
- /webcams: 146 câmaras já ligam à página da praia ('Guia da praia'), eram 97.
- **B3**: 79 praias inseridas **INATIVAS** (25 Algarve, 22 continente, 7 Madeira, 25 Açores — região nova com filtro e cartão no mapa). Deploy único B2+B3+B4: `docs/commit-files-2026-10-08-praias-b2-b3-b4.txt` (usar `git add -f`, há um ficheiro em `_data/`). Depois: `python3 _diag/praias/b2/activate.py` e `python3 _diag/praias/b3/activate.py` e `python3 _diag/praias/b4/activate.py` → 329 praias.

## Estado 08/10 (sessão Surf/Pesca)
- Surf lotes 1a+1b prontos por publicar (ver tabela). Pendente: foto da Pedra Branca; próximos lotes de surf (Algarve/Sagres, Norte, Alentejo, Madeira, Açores — lista no fim de `claude/surf-spots-lote1-2026-10.md`).
- **Pesca lote P1 (08/10) pronto por publicar** (mesma lista de commit): 25 → 33 spots (+Foz do Arelho, Berlengas, Cabo Raso, Lagoa de Albufeira (mar), Milfontes, Ponta da Piedade, Ilha de Tavira, Alqueva); Lagoa dos Salgados → Galé–Armação de Pêra (decisão do Ricardo; a Praia Grande não tinha fontes de pesca); duplicado Açores → Horta (Faial); São Miguel → Ponta Delgada; avisos 'Regras:' (campo `aviso`) em Sagres, Porto Covo, Galé, Berlengas, Lagoa de Albufeira, Milfontes, Alqueva; /en/pesca com paginação. Backup `docs/_backup-pesca-p1-20261008/`.
- Pesca: pesquisa feita em `claude/pesca-pesquisa-spots-2026-10.md` (40 candidatos com fontes + licenças DGRM/ICNF). Correções urgentes: Porto Covo (Ilha do Pessegueiro interdita), Sagres (Martinhal e 100 m das Pedras das Gaivotas/Gigante interditos), Açores big game = Ponta Delgada/Horta (não Ribeira Grande), Lagoa dos Salgados SEM reserva criada e dentro do PNM Pedra do Valado (autorização ICNF).
- Scripts novos: `_scripts/surf_commons.py` (geosearch Commons + folhas de contacto) e `_scripts/spots_fetch.py` (recorte 3:2 → images/spots). O Commons só aceita miniaturas de largura-padrão (1280).

## (HISTÓRICO — feito a 08/10) Ampliar Praias, Surf e Pesca
Pedido do Ricardo (07/10): "na próxima sessão iremos ampliar praias, surf, pesca". Detalhe e números em `claude/handoff-proximos-4-2026-10.md` (projeto Claude).

**Antes de começar:** ler este ficheiro, `CLAUDE.md`, `docs/REGRESSION-WATCHLIST.md`; confirmar `git log -3` e diff real; perguntar ao Ricardo a ordem (proposta: Surf → Pesca → Praias) e o tamanho de cada lote.

1. **Surf: 23 → ~60 spots, por lotes.**
   - Lote 1 já pesquisado com fontes: `claude/surf-spots-lote1-2026-10.md` (14 spots: Ribeira d'Ilhas, Coxos, Foz do Lizandro, São Lourenço, Pedra Branca, Baleal, Lagide, Consolação, Molhe Leste, Carcavelos, São Pedro do Estoril/Bafureira, Praia Grande, Praia das Maçãs, Fonte da Telha).
   - Onde: `js/surf-pesca-data.js` (`SURF_SPOTS` PT/EN: id, name, region, location, levelKey, levels, type, season, best_swell, best_wind, desc, tags, quality; `SURF_GEO`), `js/surf-pesca-page.js` (`SURF_PHOTO` créditos, `SURF_BEACH`, `SURF_PLAN_R`/`_ID`, `SURF_DB_REGION`), `js/surf-hero.js` (`XY` posição no mapa — ou deixa projetar por `SURF_GEO`).
   - Fotos: Commons no device (`_scripts/commons_photos.py` é o modelo: geosearch + licença + revisão visual em folhas de contacto em `_diag/`) → `images/spots/surf-<id>-{480,800}.webp` + `docs/FOTOS-CREDITOS.md`. Muitas câmaras das webcams já têm foto (`images/webcams/`) e coordenadas (`_data/meo-livecams-20261007.json`).
   - Ligar cada spot à webcam MEO mais perto (há 172 em `js/webcams-cams.js`) = valor novo para o surfista.
   - Decisões em aberto: Odeceixe (Alentejo vs Aljezur/Algarve); promessa "alertas toda a sexta" no surf (não há email semanal).
2. **Pesca: 25 spots → ampliar.**
   - Onde: `js/surf-pesca-data.js` (`FISH_SPOTS`: id, name, region, location, tipoKey, tipos, levelKey, season, especies, tecnica, desc, tags, quality; `FISH_GEO`), `js/surf-pesca-page.js` (`FISH_PHOTO`, `FISH_PLAN_R`, `FISH_INLAND`, `FISH_LEVELS`), `js/pesca-hero.js`, `js/pesca-live.js`.
   - Decisões do Ricardo em aberto: juntar Açores duplicados (`acores-sao-miguel` vs `ribeira-grande-acores-mar`)? Pesca permitida na Lagoa dos Salgados? Os "alertas de maré/lua/vento" do Pro existem mesmo?
   - Licenças: DGRM (bmar.pt) para mar, ICNF para águas interiores — não inventar regras.
3. **Praias: ampliar.**
   - Hoje: 114 praias na BD (`beaches`, Supabase) com foto em `images/beaches/<id>-{480,800}.webp`; 60 páginas estáticas `praias/<slug>/` + `en/praias/<slug>/`.
   - Opções a decidir com o Ricardo: mais praias na BD (há 172 câmaras MEO com coordenadas = lista pronta de praias com procura) e/ou mais páginas estáticas (SEO); páginas regionais "Mapa das praias do Algarve/Centro/Norte" (GSC: 8 400 impressões "mapa praias", CTR 0,5%).
   - Atenção: duplicados na BD (Buarcos, Alvor, Armação de Pêra); fotos antigas na BD usadas por `beach.html`.

Regras que se mantêm: cada página com design próprio (não repetir o mapa de relevo — já está em /beaches, /surf, /pesca); hero sempre o elemento principal; créditos de foto quase invisíveis; só fotos com licença verificada; capturas antes/depois; testar 1280/375/320 com a CSP real; Ricardo faz commit/push/deploy.

Outros pendentes (não urgentes):
- Webcams: aprovar/rever a lista de diretos YouTube (IDs mudam — verificar com oEmbed antes de cada deploy; se o da Nazaré mudar o hero fica sem imagem inicial); páginas por câmara (Porto, Matosinhos, Supertubos, Nazaré, Póvoa→Caxinas); 18 câmaras sem foto.
- Open-Meteo gratuito é para uso não comercial — ver termos/plano pago (site tem afiliados).
- Medir ~14/10 e ~04/11: CTR de /en/webcams no GSC (antes 3,5%, pos. 7), eventos GA4 `webcam_action` e `affiliate_click`, Stay22 por campanha, GYG por `cmp`.
- B (filtros uniformes) e D (monetização nos cartões de surf/pesca/praias) do plano A–E continuam por fazer.
- Limpeza de ficheiros públicos por engano (ver acima) — decisão do Ricardo.

## Estado 08/10 (fim da tarde) — Praias lote B5 (mar Norte/Centro/Alentejo)
- **42 praias novas inseridas INATIVAS** (Norte 30, Centro 8, Alentejo 4). BD pública continua com 329 até à ativação.
- Fora: Pedras Negras (retirada da lista de águas balneares 2026), Jardim Oudinot (interdita desde 22/07/2026 sem levantamento publicado), Frente Urbana Sul de Vila do Conde (troço sem nome, perto das Caxinas).
- Póvoa de Varzim = 1 cartão (Zona Urbana Norte/Sul I/II + Lagoa + Fragosa). "Marbelo" da EEA tem coordenada em S. Félix da Marinha → cartão "Praia de São Félix da Marinha".
- Fotos: 34 com foto Commons verificada; 8 sem foto (NO_PHOTO): Rodanho, Amorosa, Rio de Moinhos, Ramalha, Paimó, Quião, Pedras Brancas, Francelos.
- Commit: `docs/commit-files-2026-10-08-praias-b5.txt` (usar `git add -f`, tem `_data/`). Os ficheiros partilhados `docs/FOTOS-CREDITOS.md`, `docs/REGRESSION-WATCHLIST.md` e `HANDOFF.md` têm também linhas da sessão surf/pesca — ficam fora desta lista (não são publicados).
- **ATIVO desde 08/10 ~19h10: 371 praias públicas.** Os ficheiros do B5 foram publicados com o deploy do Surf S2 (da50d2a); confirmado em produção: 371 cartões PT/EN 1280/375, 252 pontos, calmo+moderado+agitado = 371, 34/34 fotos novas, 0 erros, 0 CSP. **Falta o commit** da lista `docs/commit-files-2026-10-08-praias-b5.txt` (o git está atrás da produção).
- Próximo: praias fluviais (159 distintas) — decisões em aberto: região (distrito/concelho), filtro "Fluviais" vs etiqueta, pontos no mapa, tamanho dos lotes; cartões/contadores do mar têm de lidar com praias sem dados de mar (também as 7 de ria/estuário do B5 e a Armona).

## Estado 08/10 (noite) — Praias FLUVIAIS (lote B6)
- **151 praias fluviais inseridas INATIVAS** (beach_type='fluvial', tag 'fluvial'; região pelo concelho: Norte 31, Centro 104, Alentejo 14, Algarve 2; concelho em `subregion`). Fora: 8 que não são águas balneares em 2026. 9 com água Má em 2025 ficam (designadas em 2026) com aviso no texto. 81 com foto, 70 sem foto.
- Código: as fluviais nunca pedem dados de mar (live-coast.js), cartão com etiqueta "Praia fluvial" e sem selo do mar, pontos azul-acinzentados no mapa do /beaches, página de praia sem "Mar e ondulação" nem marés, chip "Fluviais"/"River beaches". Calmo+moderado+agitado = só praias de mar (371).
- Commit: `docs/commit-files-2026-10-08-praias-fluviais.txt` (`git add -f`). Partilhados fora da lista: FOTOS-CREDITOS.md, REGRESSION-WATCHLIST.md, HANDOFF.md.
- **ATIVO desde 08/10 ~20h20 (commit 0b422d0): 522 praias públicas.** Verificado em produção: 522 cartões PT/EN 1280/375, 151 fluviais sem selo do mar, 403 pontos (151 neutros), calmo+moderado+agitado = 371, pedido marine com 371 pontos, filtro Fluviais 151, 81/81 fotos, 0 erros, 0 CSP.
- Pendentes: Fraga da Pegada (Azibo) e Merelim S. Paio (Braga) são águas balneares 2026 separadas, não incluídas; câmara "Praia Fluvial Lago Azul" não ligou à praia; home/planear/preços ainda dizem "mais de 300 praias".

## >>> PRÓXIMA SESSÃO (definida pelo Ricardo a 08/10, 22h): LOTE A da auditoria funcional
Ler: este bloco, `claude/auditoria-funcional-2026-10.md` (projeto) e os relatórios em `docs/auditoria-funcional-20261008/` (praia-detalhe, praias-lista, inicio-navegacao, planeador, conta-comercial). Ordem depois: Lote B (EN + telemóvel), por fim Lote C (credibilidade).
Estado de partida: tudo publicado; último commit `0b422d0` (praias fluviais). 522 praias públicas.

Lote A — tarefas e onde mexer (confirmar no código antes):
1. Links de hotel sem ID de afiliado (P0, receita). Construir o href já como Stay22 Allez em vez de depender da reescrita tardia do LetMeAllez: `https://www.stay22.com/allez/booking?aid=kaptarstudio&address=<nome, Portugal>&campaign=<pagina>` (padrão que o planeador já usa; ver watchlist "Stay22 LinkSwap descarta datas"). Sítios: `js/home-hero-v3.js` l.~70 (cartão "Hoje na costa"), `index.html` l.~1386 e EN ("Hotéis costeiros · via Booking", booking.com/country sem aid), `js/beach-card-v2.js` l.~562 (cartões /beaches), `js/webcams-v2.js` l.~551 (painel). Medir: evento GA4 affiliate_click continua a disparar (affiliate.js reconhece stay22).
2. `/en/contact` não entrega mensagens (P0): `en/contact.html` l.~772 usa `db.from('contact_messages').insert([data]).catch(...)` — o builder do supabase-js não tem .catch → usar await/then e só mostrar "enviado" com sucesso; comparar com `contact.html` (PT) que funciona; acrescentar Turnstile como no PT. Testar sem gravar lixo (ou gravar 1 teste marcado e avisar o Ricardo).
3. "Mar & Ondulação" nunca aparece nas fichas (P0): `js/beach-renderer.js` tem a chave `surf:` DUPLICADA no objeto pt (l.128 secção da praia e l.379 i18n da página /surf) e no en (l.611 e l.860) → a segunda apaga a primeira → TypeError em `scoreInfo` (js/beach-page.js l.~626) engolido. Renomear a segunda (ex. `surfPage`) e atualizar quem a usa (grep `.surf.spotCount`, `emptyTitle`… em surf-pesca-page.js e outros). Depois testar a ficha de mar (secção aparece, paywall Pro e formulário de alertas) e a página /surf + /pesca (usam o mesmo ficheiro).
4. Marés (decisão do Ricardo 08/10): usar fonte real gratuita se existir; senão mostrar como ESTIMATIVA. Hoje `calcAstronomicalTides` (js/beach-page.js l.~831) dá horas erradas (Alvor: 04:19 vs 02:01 real) e o EN atribui ao "Instituto Hidrográfico" (falso). Proposta: usar o Open-Meteo Marine `sea_level_height_msl` (horário, já usado nas webcams e na pesca) para achar preia-mar/baixa-mar, rotular "Estimativa (modelo Open-Meteo) — confirme na tabela oficial do Instituto Hidrográfico" com link; tirar o "±30 min" e a atribuição falsa. Pesquisar antes se há API gratuita oficial (IH/hidrografico.pt não tem API pública conhecida — confirmar; WorldTides/Stormglass são pagos). Corrigir também a lógica "a encher/a vazar" perto do extremo no painel das webcams (js/webcams-v2.js l.~621; relatório webcams W01). Lembrar: termos do Open-Meteo gratuito são para uso não comercial (pendente antigo).
5. Canonical das fichas PT aponta para /praias/<slug> que dá 404 em 472/522 (P0 SEO): js/beach-page.js l.~945–964 → usar `https://www.portalturismoportugal.com/beach?id=<id>` (só /praias/<slug>/ quando a página estática existir — há lista em _scripts/build_webcams_data.py PRAIA_PAGE); EN sem `.html` e com www; hreflang com id.
6. Planeador só carrega 300 praias (P0): `js/planner-v3.js` l.~260 `limit=300` → 1000 (ou paginar). Depois testar ?beach= com uma fluvial, Açores e Madeira; destinos errados (Porto→Viana, Tomar→Nazaré, Loriga→Costa de Prata) são do Lote B/C (mapa de regiões do planeador).
7. A confirmar com fonte: atum-rabilho na pesca (relatório surf-pesca SP-02) — se for proibido na lúdica, corrigir FAQ e cartão Açores–Pico.
Regras: capturas antes/depois em tudo o que for visual; ?v= e watchlist; commit/deploy só pelo Ricardo; uma lista docs/commit-files-<data>-lote-a.txt.

## >>> LOTE A — FEITO 08/10 (noite), POR PUBLICAR. PRÓXIMA SESSÃO: LOTE B (EN + telemóvel)
Commit/deploy pelo Ricardo: `git add -f (Get-Content docs/commit-files-2026-10-08-lote-a.txt)` → commit → `deploy.ps1 -DryRun` → `deploy.ps1` → smoke test. Todos os JS/CSS alterados com `?v=20261008la`. Watchlist: 7 linhas novas "LOTE A …".
1. Links de alojamento já nascem Stay22 Allez (`aid=kaptarstudio`, campanhas `portalturismoportugal-[en-]home|home-parceiros|beaches|beaches-faixa|webcams|beach`): home "Hoje na costa" + "Hotéis costeiros", cartões /beaches (+ faixa "Encontrar alojamento" e renderBeaches antigo com `aid=XXXXXXX`), painel das webcams, ficha sem página "onde ficar" (Açores). `affiliate.js` passou a carregar na home → `affiliate_click` também lá. Teste: Stay22 → booking `aid=1607597&label=kaptarstudio-<campanha>`; o Booking limpa o URL a seguir (igual com o LetMeAllez) — confirmar cliques por campanha no painel Stay22.
2. /en/contact: Edge Function `submit-contact` + Turnstile (igual ao PT); sucesso só com resposta OK. Testado com a rota intercetada (500 → erro visível e formulário fica; 200 → sucesso). Nada gravado na BD. **Ricardo: enviar 1 mensagem real em /en/contact depois do deploy.**
3. "Mar & Ondulação" volta às fichas: 2.ª chave `surf` de `js/beach-renderer.js` → `surfPage` (+ `js/surf-pesca-page.js`). Ficha Alvor PT/EN: secção, paywall e alertas visíveis; /surf 126, /pesca 117, 7 FAQ. Novo `_scripts/dupkeys.cjs` (chaves duplicadas em JS).
4. Marés: não há API oficial gratuita (a tabela do IH 2026 é PDF © IH). Agora estimativa Open-Meteo (`sea_level_height_msl`, 15 min) com rótulo "Estimativa por modelo (Open-Meteo) — não é a tabela oficial", "≈", alturas vs. nível médio, link hidrografico.pt; Açores na hora local. Medido 09/10: ~30–40 min mais cedo que a tabela oficial (Lagos, Ponta Delgada). Painel das webcams (W01) corrigido. **Decisão do Ricardo:** pedir autorização ao IH para usar a tabela oficial (carregar 1×/ano na tabela `tides` com `_scripts/seed-tides-template.js`).
5. Canonical/og/hreflang das fichas = `https://www.portalturismoportugal.com/[en/]beach?id=<id>` (antes 404 em 472/522).
6. Planeador carrega as 522 praias (`limit=1000`, cache `pth_v3_beaches_v2`). Praia fluvial de Monsaraz agora abre no passo 3 com destino… "Costa Alentejana" (errado para o interior → Lote B, mapa de regiões).
7. Atum-rabilho fora das espécies-alvo (FAQ PT/EN + JSON-LD, Açores—Pico e São Miguel); EN FAQ "grouper" → "comber". Regra regional dos Açores para o rabilho não confirmada.
Não feito / a saber: `docs/tools/` (pasta vazia criada por engano — apagar), `_diag/lote-a-20261008/site-snapshot.tgz` (cópia de teste, ignorada pelo git e pelo deploy). Com Open-Meteo em 429 (IP partilhado) a secção "Mar & Ondulação" continua escondida — pendente antigo de limitar pedidos.
Lote B (ordem da auditoria `claude/auditoria-funcional-2026-10.md`): banner de cookies EN, hambúrguer EN invisível/320 px, CSP vs GA4 `www.google.com/g/collect`, números contraditórios, pesquisa sem acentos/por vila, destinos errados do planeador, nomes de espécies EN, chips EN→PT, telemóvel (Samoqueira, escolas, "Percebi"), webcams (Voltar, Porto 2024, cache "sem dados"). Depois Lote C.


## >>> LOTE A2 — FEITO 09/10 (madrugada), POR PUBLICAR (junto com o Lote A). PRÓXIMA SESSÃO: LOTE B
Decisões do Ricardo (09/10, 00h): usar as tabelas oficiais do IH; **não pagar o Open-Meteo por agora** (rever quando houver receita de afiliados) → reduzir pedidos.
Publicar os dois lotes num só commit: `git add -f (Get-Content docs/commit-files-2026-10-08-lote-a.txt) (Get-Content docs/commit-files-2026-10-09-lote-a2.txt)` → commit → `deploy.ps1 -DryRun` → `deploy.ps1` → smoke test. `?v=20261009a2` nos ficheiros do A2.
1. Marés oficiais: `data/mares/2026/<porto>.json` (18 portos + Lisboa, do PDF do IH, `_scripts/mares_ih_extract.py`) + `js/mares-ih.js`. Ficha de praia: porto de referência mais próximo, hora legal, alturas acima do ZH, "Fonte: Instituto Hidrográfico". Painel das webcams também. Fallback = estimativa Open-Meteo. **Todos os anos (quando o IH publicar a tabela do ano seguinte, normalmente nov/dez): correr o script para o ano novo** — está na watchlist.
2. Open-Meteo: `js/om-pool.js` + `data/om-cells.json` (`_scripts/om_cells.py`). Sessão típica 1 195 → 389 pontos (−67 %); 2.ª visita em 45 min = 0 pedidos; pausa de 2 min depois de um 429; webcams já não ficam 30 min "sem dados" (W04). Temperatura da água pode variar ~1 °C (outra grelha). Ao acrescentar praias/spots/webcams: `python3 _scripts/om_cells.py`.
Testado: Playwright com CSP real, PT/EN, 1280/375, Open-Meteo simulado (o IP do contentor está em 429); 0 erros de JS; capturas das marés antes/depois.

## >>> LOTE H — Página inicial v4 (09/10, manhã), POR PUBLICAR
Pedido do Ricardo depois do deploy A+A2 (a81f4e2): números errados, atalhos desalinhados, cartões datados, GYG perdido no fim. Feito em index.html + en/index.html + NOVO css/home-v4.css (+ home-hero-v3 css/js `?v=20261009h`): sem preloader; kicker "522 praias · N com mar calmo agora"; 6 atalhos 3x2; "170+ webcams"; faixa "Reserve a viagem" logo após o hero (Stay22, GYG com widget de preços, DiscoverCars, BookSurfCamps, Amazon texto); "Explore a costa" (6 mosaicos); "Praias em destaque" (8 praias, fotos verificadas, "Hotéis perto"). Removidos scripts Amazon mortos e secções escondidas/duplicadas. Backup em docs/_backup-home-v4-20261009/.
Publicar: `git add -f (Get-Content docs/commit-files-2026-10-09-lote-h.txt)` → commit → deploy.ps1 -DryRun → deploy.ps1.
Medir: GA4 `affiliate_click` com page_path "/" e campanhas Stay22 `-home-reservar`/`-home-destaque`, GYG `pthhomept`/`pthhomeen`.

## >>> LOTE H2 — Home (balcão de reservas), app em todo o site, contacto, planeador (09/10, manhã), POR PUBLICAR
Pedido do Ricardo (10:15 + 10:17) depois de publicar o Lote H. Lista: `docs/commit-files-2026-10-09-lote-h2.txt` (253 ficheiros — 236 são só as 4 linhas da app no <head>).
Publicar: `git add -f (Get-Content docs/commit-files-2026-10-09-lote-h2.txt)` → commit → `deploy.ps1 -DryRun` → `deploy.ps1` → `npx supabase functions deploy submit-contact --project-ref glupdjvdvunogkqgxoui`.
1. "Reservar a viagem": foto da Nazaré + balcão com separadores Estadia/Carro/Passeios/Surf camp e campos reais; o JS monta o link do parceiro (CSP `form-action 'self'` impede submeter) e abre noutro separador. GYG "mais reservados" continua por baixo.
2. Cartão largo "Planear viagem": sem foto (era de baixa resolução) → bilhete escuro com botão dourado. Surf: foto Supertubos.
3. "Praias em destaque": 19 praias (água Excelente + foto verificada) em 8 zonas, uma por zona, roda todos os dias; mar calmo (≤0,6 m, cache LiveCoast) primeiro com etiqueta.
4. Contacto: `submit-contact` agora envia email (Resend, reply-to = visitante) para `CONTACT_NOTIFY_TO` ou ola@. **Precisa de deploy da função.** A mensagem do teste do Ricardo deve estar em `contact_messages`.
5. Planeador: carro na localização DiscoverCars mais perto da vila-base (DC_TOWN) e datas no texto (a DiscoverCars não aceita datas no link — confirmado). Stay22/GYG já levavam as datas (testado).
6. DiscoverCars `chan` + `data1` em todos os links (affiliate.js). **Ricardo: criar no painel (Promoção > Ad channels) os canais home, webcams, planear, praias, praia, onde-ficar, guia-carro, surf, pesca, guias, outras.**
7. /webcams PT/EN: cada cartão tem "O que fazer em <vila>" → GYG `cmp=wcard-<id>`.
8. App em todo o site: js/pwa.js + manifests PT/EN + sw.js v12 (ver watchlist). Botão no rodapé, barra discreta, instruções no iPhone.
Testado: Playwright, CSP real, PT/EN, 1280/375, Open-Meteo simulado; 0 erros de JS; links dos 4 separadores verificados; prompt de instalação simulado (Chrome) e folha iOS; sem scroll horizontal.
Medir: GA4 `home_desk_search` (partner), `affiliate_click` page_path "/", `pwa_install_click`/`pwa_installed`; Stay22 `-home-reservar`; PAP por canal.

## >>> LOTE B — EN + telemóvel (09/10, manhã), POR PUBLICAR. PRÓXIMA SESSÃO: LOTE C
H2 publicado (2fc37c1). Lista: `docs/commit-files-2026-10-09-lote-b.txt` (265 ficheiros — a maioria são páginas com `?v=` novo do style.css/cookie-consent.js e o botão do menu EN). Publicar: `git add -f (Get-Content docs/commit-files-2026-10-09-lote-b.txt)` → commit → `deploy.ps1 -DryRun` → `deploy.ps1`.
1. Cookies: banner PT/EN, link certo, estilos próprios no /planear (css/cookie-consent.css), banner nas 5 páginas sem ele; /guias/praias-perto-lisboa tinha GA4 sem consentimento por omissão → corrigido.
2. Menu: hambúrguer EN visível (43 páginas), cabe a 320 px.
3. CSP: `www.google.com` no connect-src (hits GA4 /g/collect deixam de ser bloqueados).
4. Números: /surf 126 (automático), /precos /parceiros /planear 500+, /en/guides 7.
5. /beaches: pesquisa sem acentos, por vila (≤12 km), EN (Azores, Lisbon); filtros no URL e repostos no Voltar; "1 praia"; modal Pro em EN.
6. Planeador: região nova "Praias fluviais" (15 vilas do interior), Porto/Aveiro/Figueira/Tavira/ilhas como bases, carro e passeios pela vila, Açores com página DiscoverCars de Ponta Delgada, máximo 30 noites com aviso, folha iOS acima da barra.
7. EN: espécies em inglês nos cartões de pesca, garoupa = comber, chips de guias da home EN → páginas EN.
8. Telemóvel: Samoqueira (/escondidas), escolas de surf (cartão aberto), webcams (Voltar fecha o painel, X sempre visível).
9. Webcams: direto "Ribeira · Douro" retirado (fotograma de 2024) — 171 cartões.
Testado: Playwright, CSP real, PT/EN, 1280/375/320, Open-Meteo simulado, capturas antes/depois (`b_before_*` / `b_after_*`); 0 erros de JS; sem scroll horizontal.
Fica para depois: "Ver mais" do /beaches não é reposto no Voltar; páginas antigas planear-v3/planear-legacy ainda públicas (Lote D); marca "Portugal Travel Hub" no cabeçalho (decisão do Ricardo).


## >>> LOTE C — credibilidade e dados (09/10, tarde), PUBLICADO (0f0f8d8; SQL e funções aplicados)
Lote B publicado (73f321d). Decisões do Ricardo (09/10 12:24): Pro "em desenvolvimento"; entidade = empresa da esposa (como a Kaptar: Renata Garutti, empresária em nome individual, NIF 293753610 — tirado de kaptar.studio/termos); testemunho "João Silva" é real (fica); marca = Portal Turismo Portugal.
Publicar: `git add -f (Get-Content docs/commit-files-2026-10-09-lote-c.txt)` → commit → `deploy.ps1 -DryRun` → `deploy.ps1` → funções: `npx supabase functions deploy check-alerts send-partner-alert send-plan-confirm send-welcome --project-ref glupdjvdvunogkqgxoui` → SQL `supabase/migrations/20261009120000_lote_c_regiao_lisboa_setubal.sql` no SQL Editor.
1. Marca em todo o site e nos emails.
2. Pro em desenvolvimento: sem preços nem promessas (alertas, HD, API, equipa) em /precos, login, /pesca, fichas, termos e reembolsos.
3. Rodapé com identificação legal e Livro de Reclamações; termos/privacidade com responsável, NIF, RAL.
4. /parceiros e /media-kit coerentes com /precos; formulário PT validado; texto falso "nenhum dado é enviado" corrigido.
5. Fichas: inativas = erro + noindex; crédito das fotos Commons; fluviais sem textos de mar; "Família" não aparece em praias não recomendadas para crianças.
6. BD: 10 praias de Cascais/Sintra/Setúbal deixam de ser "Oeste" (SQL).
7. SEO: 3 páginas antigas + planear-legacy com 301 reais; sitemap 205 URLs.
Fica: morada completa no rodapé/termos (falta o dado); /conta e o login continuam sem nada para utilizadores grátis (CC-02); "Registar" no cabeçalho.

## >>> LOTE E — /beaches: tudo o que vem depois da lista (09/10, tarde), PUBLICADO
Pedido do Ricardo (13:09): remodelar a parte de baixo de /beaches (GYG perdido, guias por região mal aproveitados, "Como escolher a praia certa" feio).
Publicar: `git add -f (Get-Content docs/commit-files-2026-10-09-lote-e.txt)` → commit → `deploy.ps1 -DryRun` → `deploy.ps1`.
Nova ordem (PT e EN, gerada por `_diag/lote-a-20261008/bb_build.py`): 1) Que praia procura? (5 perfis com foto e contagem real; clicar filtra a lista) 2) Depois da praia (GetYourGuide a toda a largura + chips de destino) 3) Guias por região (6) + por tema (8) 4) Antes de ir (webcams/surf/pesca/planear) 5) Onde dormir (Stay22 com datas).
Ficheiros: beaches.html, en/beaches.html, NOVOS css/beaches-bottom.css e js/beaches-bottom.js (?v=20261009e). css/gyg-block.css fica (usado noutras páginas). Cópias antigas: docs/_backup-lote-e-20261009/.
Fica por fazer: morada completa no rodapé/termos (falta o dado); "Registar" no cabeçalho; Lote D.

## >>> LOTE F — Preços, Escolas de surf, Para o seu negócio + correções no site inteiro (09/10, tarde), POR PUBLICAR
Pedido do Ricardo (13:35): reestruturar as 3 páginas com foco em faturação, captação de email, tecnologia, design e psicologia de venda. Feito com agentes (estudo de preços, estratégia/copy, auditoria técnica, 3 construtores, correções do site, media kit, revisão independente).
Publicar: `git add -f (Get-Content docs/commit-files-2026-10-09-lote-f.txt)` → commit → `deploy.ps1 -DryRun` → `deploy.ps1`. Sem SQL nem funções. Cópias antigas: docs/_backup-lote-f-20261009/.
Depois do deploy: 1 pedido real em /parceiros e 1 em /en/parceiros (confirmar que chegam a partner_leads e apagar), 1 email na lista do Pro (surf_subscribers, source precos-pro-lista:*).
Decisões do Ricardo: grelha Base grátis / Parceiro Local 149 €/ano ou 19 €/mês / Fundador da Zona 290 €/ano (1 por zona); BookSurfCamps (faliu) → GetYourGuide; IVA não mencionado; menu "Escolas de surf"; pagamento decide-se com o 1.º interessado.
Emails novos: surf_subscribers.source = precos-pro-lista:<interesse>, escolas-viajante-regiao:<zona> (EN com prefixo en-). Leads B2B: partner_leads.mensagem começa por [origem: …] [plano: …] [zona: …].
Por confirmar pelo Ricardo: se a verificação das 7 escolas (registo, certificações, praias, avaliações; "maio de 2026") foi mesmo feita como a página diz; datas das notas Tripadvisor/Google.
Pendentes: quadro de zonas e ordem do diretório ao 1.º parceiro; bloco GYG das páginas ("verificadas por nós / selecionamos pessoalmente") a rever; títulos do media-kit >60; logótipo cortado a 320 px (style.css global); erro "supabase is not defined" nas páginas praias/* (antigo); morada completa no rodapé; Lote D.
