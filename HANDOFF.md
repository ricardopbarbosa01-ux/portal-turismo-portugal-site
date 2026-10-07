# HANDOFF — Portal Turismo Portugal (atualizado 07/10/2026)

Ler isto primeiro, depois `CLAUDE.md` e `docs/REGRESSION-WATCHLIST.md`. Cópia no projeto Claude: `claude/handoff-proximos-4-2026-10.md`.

## Repositório
- Branch: `main`. Último commit: `a4eb7b6` (HANDOFF + scripts); antes `511ee73` (velocidade) e `2c888ed` (redesign).
- `main` = `origin/main` (push feito, confirmado 07/10 às 11h).
- Há ficheiros "modificados" que são só diferença de fim de linha (CRLF na VM vs LF no HEAD). Para ver diferenças reais: `git --no-optional-locks diff --ignore-cr-at-eol --numstat HEAD`.
- Ver também a secção "Pendentes" (ficheiros soltos na raiz, que não entram em commit).

## Estado real

| Trabalho | Guardado | Publicado | Testado |
|---|---|---|---|
| Redesign (lista abaixo), commit `2c888ed` | sim | **sim, 07/10** | local + produção |
| Velocidade dos heroes (`511ee73`) | sim | **sim** (produção serve `?v=20261007p` + AVIF, confirmado 07/10) | local; **PageSpeed em produção por medir** |
| A. Surf — cartão v2 + fotos (`d6d1e77`) | sim | **sim, 07/10** | local + produção |
| **A2. Surf — hero 'Surf hoje' ao vivo + secções refeitas + fix moldura AVIF do mapa** (`docs/commit-2026-10-07-surf-hero.txt`, backups `docs/_backup-surf-hero-20261007/`, `docs/_backup-avif-20261007/`) | **não (por fazer commit)** | **não** | local, CSP real, 1280/375/320, PT+EN, sem Open-Meteo |
| A2. Surf hero + secções (`898f6bb`) + fix GYG | sim | **sim, 07/10** | produção (Chrome: GYG 495 px) |
| A3. Surf — 23 → ~60 spots por lotes | lote 1 pesquisado (`claude/surf-spots-lote1-2026-10.md`) | — | por escrever no site |
| P. Pesca v2 (`47d8c86`) | sim | **sim, 07/10** (Ricardo: "Feito") | local; produção por confirmar no Chrome |
| **W. Webcams v2 — 'Portugal ao vivo'**: 172 câmaras (MEO só link + 13 diretos YouTube incorporáveis), hero 'ecrã em direto' (sem mapa) com canais e pesquisa, painel da câmara com planear (hotéis/atividades/carro/planeador), regresso do separador MEO, pedido de câmara (submit-contact), diretório e FAQ (`docs/commit-2026-10-07-webcams.txt`, backup `docs/_backup-webcams-20261007/`, dados `_scripts/build_webcams_data.py`) | sim (`f4337b2`) | **sim, 07/10** | local, CSP real, 1280/375/320, PT+EN, sem Open-Meteo, funcionais |
| **W2. Fotos nas webcams (144 + 13 diretos), créditos discretos no site todo, /planear com navbar e rodapé do site, geolocation=(self)** (`docs/commit-2026-10-07-creditos-planear.txt`, lista de ficheiros `docs/commit-files-2026-10-07-creditos.txt`, backups `docs/_backup-creditos-20261007/`, `docs/_backup-planear-20261007/`) | **não (por fazer commit)** | **não** | local, CSP real, 1280/375/320, planeador até aos resultados |
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

## Próximo passo
**A. Surf: feito localmente em 07/10** (falta commit + deploy pelo Ricardo). Seguinte, por esta ordem:
- B. filtros uniformes, com /beaches como padrão (no surf os filtros já ficam colados aos resultados);
- C. webcams;
- D. monetização dos cartões;
- E. Planear com o header, footer e linguagem visual do site.

Pendentes do surf (A):
- Odeceixe está como região Alentejo mas a localização diz Aljezur (a praia fica do lado do Algarve) — decidir.
- /en/surf não tem paginação (mostra os 23) — já era assim.
- Bloco GYG do surf desceu para depois dos spots (no telemóvel ~12 000 px): GYG no surf tem ~0 cliques (GA4), mas medir.
- CSP bloqueia `https://www.google.com/g/collect` (GA4 user_engagement) em todas as páginas — já existia; GA4 não se toca sem razão: decidir.
- Monetização nos cartões de surf (aulas GYG, alojamento) fica para a etapa D.
