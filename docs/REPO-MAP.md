# Repo Map — Portugal Travel Hub

> Mapa de 1 pagina para o Claude Code se orientar SEM ler o repo inteiro. Le isto + CLAUDE.md ao inicio; depois explora SO o ficheiro que precisas.
> Stack: HTML/CSS/JS estatico · Cloudflare Pages · Supabase (auth/DB/Edge Functions) · GA4.
> Deploy: `powershell -ExecutionPolicy Bypass -File .\deploy.ps1`

## Paginas comerciais (nucleo de receita)
- `index.html` / `en/index.html` — homepage (hero video + card "10 praias escondidas" + bandas)
- `precos.html` / `en/precos.html` — planos (Gratis / Pro EUR4,99 "em breve" / B2B Essential EUR49 / Founder EUR149)
- `parceiros.html` / `en/parceiros.html` — funil B2B (form de candidatura)
- `planear.html` / `en/planear.html` — planner (lead capture -> Edge Function submit-plan-request)
- `media-kit.html`, `partner-demo.html`, `parceiro.html` — material B2B
- `escolas-de-surf.html` — diretorio de parceiros verificados (MODELO a replicar)

## Sistema de praias
- `beaches.html` / `en/beaches.html` — listagem (filtros + paginacao via beaches-paginate.js)
- `beach.html` / `en/beach.html` — detalhe dinamico (SPA, ?id=UUID, le Supabase)
- `praias/<slug>/index.html` — 60 paginas estaticas pre-renderizadas (PT) + `en/praias/` (60 EN)
- `escondidas.html` + `escondidas/<slug>.html` — hub "10 praias escondidas" + paginas (EN: `en/hidden-beaches*`)

## Conteudo / SEO (root .html)
- `guias/*.html` — 5 guias editoriais (melhores-praias-algarve, pesca-portugal, praias-perto-lisboa, quando-visitar-portugal, surf-portugal-iniciantes)
- `praias-*.html` — guias regionais (algarve, norte, centro, madeira, alentejo, calmas, familias, secretas, criancas...)
- `onde-ficar-*.html` — 7 guias de alojamento por regiao
- `surf.html` / `surf-algarve.html` / `surf-portugal.html`, `pesca.html`, `webcams.html`

## Atividades (render dinamico)
- surf/pesca: `js/surf-pesca-page.js` + `js/surf-pesca-data.js` (window.SurfPescaData / SurfPescaPage)
- webcams: `js/webcams-guias-page.js` + `js/webcams-guias-data.js` (links Beachcam by MEO = EXTERNOS, nao proprios)

## JS (js/) — ordem de load: config.js -> libs -> page (todos defer)
- `config.js` — Supabase client (window.db), anon key `sb_publishable_`. Scripts que usam `db` DEVEM estar em DOMContentLoaded + guard `typeof db`
- `nav.js` / `nav-dropdown.js` — navbar, dropdown "Parceiros Verificados", auth state, lang switcher
- `beach-renderer.js` — render de cards + i18n (partilhado por listagens)
- `beaches-filters.js` / `beaches-paginate.js` — filtros + paginacao
- `planear.js` / `parceiros.js` — submit de leads (estado de sucesso persistente; endpoints functions/v1)
- `login.js` / `favorites.js` / `alertas-manager.js` — auth / Pro
- `image-autofix.js` — fallback de imagens (legado; ver IMG-FETCH-STORE no historico)
- outros: lang-switcher, cookie-consent, animations, lazy-video, chips-fade

## CSS (css/)
- `style.css` — global, grande, cache-bust `?v=`. Heroes, nav, footer, `.hero-secondary` (numero "10" = Montserrat 300)
- `*-page.css` — por pagina: beach-page, planear-page, parceiros-page, partners-directory, partners-page, surf-pesca-page, webcams-guias-page, monet-v2, gyg-block

## Backend (Supabase — supabase/functions/)
- Leads: `submit-plan-request`, `submit-partner-lead`, `submit-contact`, `submit-surf` (Turnstile, verify_jwt false)
- Email: `send-welcome`, `send-plan-confirm`, `send-partner-alert`
- Cron/dados: `ingest-tides`, `ingest-waves`, `check-alerts` (CRON_SECRET bearer)
- Imagens: `pexels-fetch-and-store` (+v3/v4), `pexels-search`
- Pagamentos: `ls-webhook` (LemonSqueezy — BLOQUEADO, ver AUDIT-MASTER LS-02)
- Tabelas-chave: `beaches`, `profiles` (coluna `plan`), `favorites`, `alerts`, `plan_requests`, `partner_leads`, `partners`

## Config / infra
- `_redirects` — 301s (bloqueio de internos no TOPO: .env, .mcp.json, docs/, etc.) + legados
- `robots.txt`, `sitemap.xml` (~204 URLs), `_headers` (HSTS)
- `docs/AUDIT-MASTER.md` — registo unico de auditorias (prefixos SEC- RLS- BUG- LS- EN- ...)
- `docs/REGRESSION-WATCHLIST.md` — o que partiu e o que vigiar (consultar antes de tocar)
- `docs/smoke-test.md` — 5 URLs pos-deploy

## Onde procurar X (em vez de explorar tudo)
- "form nao submete" -> `js/<page>.js` + ordem de load do config.js + Turnstile
- "praia nao carrega" -> inline script de beach.html + beach-renderer.js + colunas REAIS da tabela beaches
- "hero/estilo partido" -> css/style.css (`.page-hero` / `.hero-secondary`) + bump do cache `?v=`
- "link interno" -> grep direto ao ficheiro. NAO confiar no codegraph (deu resultados errados em 2026-06)
- "o que ja partiu nesta pagina" -> docs/REGRESSION-WATCHLIST.md
