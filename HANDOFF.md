# HANDOFF — Portal Turismo Portugal (atualizado 07/10/2026)

Ler isto primeiro, depois `CLAUDE.md` e `docs/REGRESSION-WATCHLIST.md`. Cópia no projeto Claude: `claude/handoff-proximos-4-2026-10.md`.

## Repositório
- Branch: `main`. Último commit: `f0ab61a` (fix planear, 07/10 17:48); antes `557223f` (fotos webcams + créditos + planear com navbar), `f4337b2` (webcams v2), `47d8c86` (pesca v2).
- `main` = `origin/main`; **tudo publicado e confirmado em produção a 07/10 ~18h** (`/planear` com `planner-v3.js?v=20261007s` e `site-chrome.css?v=20261007b`; header `geolocation=(self)`).
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

## Estado 08/10 (sessão Surf/Pesca)
- Surf lotes 1a+1b prontos por publicar (ver tabela). Pendente: foto da Pedra Branca; próximos lotes de surf (Algarve/Sagres, Norte, Alentejo, Madeira, Açores — lista no fim de `claude/surf-spots-lote1-2026-10.md`).
- **Pesca lote P1 (08/10) pronto por publicar** (mesma lista de commit): 25 → 33 spots (+Foz do Arelho, Berlengas, Cabo Raso, Lagoa de Albufeira (mar), Milfontes, Ponta da Piedade, Ilha de Tavira, Alqueva); Lagoa dos Salgados → Galé–Armação de Pêra (decisão do Ricardo; a Praia Grande não tinha fontes de pesca); duplicado Açores → Horta (Faial); São Miguel → Ponta Delgada; avisos 'Regras:' (campo `aviso`) em Sagres, Porto Covo, Galé, Berlengas, Lagoa de Albufeira, Milfontes, Alqueva; /en/pesca com paginação. Backup `docs/_backup-pesca-p1-20261008/`.
- Pesca: pesquisa feita em `claude/pesca-pesquisa-spots-2026-10.md` (40 candidatos com fontes + licenças DGRM/ICNF). Correções urgentes: Porto Covo (Ilha do Pessegueiro interdita), Sagres (Martinhal e 100 m das Pedras das Gaivotas/Gigante interditos), Açores big game = Ponta Delgada/Horta (não Ribeira Grande), Lagoa dos Salgados SEM reserva criada e dentro do PNM Pedra do Valado (autorização ICNF).
- Scripts novos: `_scripts/surf_commons.py` (geosearch Commons + folhas de contacto) e `_scripts/spots_fetch.py` (recorte 3:2 → images/spots). O Commons só aceita miniaturas de largura-padrão (1280).

## Próximo passo — PRÓXIMA SESSÃO: ampliar Praias, Surf e Pesca
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
