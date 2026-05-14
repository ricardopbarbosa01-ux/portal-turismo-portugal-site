# Portal Turismo Site

## Project identity
- Project: portal-turismo-site
- Local path: C:\Users\Powerpc\Portal-turismo-site
- Deploy command:
  npx wrangler pages deploy . --project-name portal-turismo-portugal-site --commit-dirty=true

## Product priorities
Prioritize in this order unless the user says otherwise:
1. Fix real bugs with commercial impact
2. Mobile-first UX
3. Perceived performance
4. Stable funnels
5. Real CRM/commercial operations
6. Monetization clarity
7. SEO/content expansion
8. Premium polish after core flows are stable

## Current strategic priorities
- English translation across the main commercial pages
- Correct B2B pricing and commercial clarity
- Automatic planning instead of any delayed-manual planning promise
- SEO content pages with real keyword intent
- PWA and push notifications later, not before core funnel/content work
- Fix critical bugs from prior audits
- Improve performance/loading
- Strengthen sales copy page by page
- Improve Media Kit and future partner/investor deck

## Token-efficiency rules
- Do not do repo-wide discovery unless file location is truly unknown
- If the target file is already known, go straight to implementation
- Read only the minimum blocks needed
- Avoid re-auditing already validated areas
- Prefer small, high-impact batches
- Avoid global refactors unless there is proven need
- Reuse existing patterns instead of inventing architecture
- For larger batches, prefer a fresh Claude Code session

## Model routing
- Haiku: only for cheap discovery when file location is uncertain
- Sonnet: default for implementation and normal debugging
- Opus: only for serious structural ambiguity or hard blockers

## Known high-value files
- index.html
- planear.html
- precos.html
- login.html
- dashboard.html
- parceiros.html
- media-kit.html
- contact.html
- beaches.html
- beach.html
- surf.html
- pesca.html
- webcams.html

## Fase 6C — Imagens e Curadoria Editorial

### Fase 6C-A → ✅ card persuasivo homepage (2026-05-06)
- Card `hero-secondary` adicionado a index.html e en/index.html com headline "As 10 praias que ninguém no Booking encontra"
- Páginas placeholder criadas: /escondidas.html e /en/hidden-beaches.html (noindex, em curadoria)
- Foto Praia da Ursa hardcoded de Wikimedia Commons (URL: `c/c8/Nature's_canvas.jpg`, 1920px thumb)

### Fase 6C-B → ✅ redesign editorial cinemático do hero-secondary (2026-05-06)
- Skill frontend-design invocada — direção estética magazine editorial comprometida
- Layout 2-coluna 60/40 (desktop): coluna texto + foto vertical Praia da Ursa
- Foto migrada de Wikimedia (CSP block) para Supabase Storage (UUID `a0529d77-b688-4293-ba11-8f023a69e4cf`)
- Número "10" como âncora visual: Fraunces 300 clamp(108px→210px), ouro opacity 0.9
- Hierarquia: kicker IBM Plex Mono → número+headline → linha dourada → sub → CTA
- Background: `#07152A` (navy profundo) em vez de fullscreen photo overlay
- CTA: padding generoso 16×36px, hover lift + gold glow + arrow slide
- Foto: sombra dramática + vinheta radial via ::after pseudo-element
- Animação: IntersectionObserver threshold 0.25, staggered fade-in-up 5 elementos
- Fraunces + IBM Plex Mono adicionadas ao Google Fonts (index.html + en/index.html)
- CSS cache bumped para `?v=20260506-6cb`

### Fase 6C-C → ✅ refinamentos AI-modern do hero-secondary (2026-05-06)
- Foto: border-radius assimétrico `4px 64px 4px 64px` (desktop) / `4px 40px 4px 40px` (mobile) — clipping orgânico nos cantos opostos
- Divider: `border-top` substituído por `linear-gradient` com fade transparent → dourado → transparent (80px, sem opacidade fixa)
- Background: SVG noise overlay via `::before` (mix-blend: overlay, opacity 0.4) + gradient diagonal `#07152A → #0B1B2B → #0F2235` — warmth subtilíssimo no canto superior direito
- Número "10": gradient text dourado→âmbar 135deg, `drop-shadow` filter, `breathe` animation 6s ease-in-out infinite (scale 1.0→1.015→1.0)
- Cursor-reactive parallax: divider (4px max) + foto (6px max) via requestAnimationFrame, EASE 0.08 — suave e GPU-only (transform único). `hover:none` → skip, `prefers-reduced-motion` → skip
- CSS cache bumped para `?v=20260506-6cc`

### Fase 6C-D → ✅ hero wrapper border-radius + restructure homepage 10→7 secções (2026-05-06)
- Hero wrapper (`hero__right`): border-radius assimétrico `4px 64px 4px 64px` (desktop) / `4px 40px 4px 40px` (mobile), box-shadow profundidade. Consistência visual com hero-secondary "10 praias". Zero alteração ao `<video>` element ou URLs CDN.
- Restructure homepage 10→7 secções: NEW `#what-youll-find` com 3-card grid (Condições do mar, Webcams ao vivo, Surf e Pesca). `planear-cta` agora inclui sub-banda de guides (idx-guides-band fundida). Secções `#conditions`, `#webcams`, `#surf-pesca`, `.idx-guides-band` escondidas via CSS (`display:none`) — HTML preservado para reversibilidade.
- CSS cache bumped para `?v=20260506-6cd`.

### Fase 6C-E → ✅ redesign cinemático do hero principal (2026-05-06)
- SVG clip-path em onda fluida vertical (`#hero-wave-clip`, `clipPathUnits="objectBoundingBox"`) — vídeo dentro de shape orgânico em Chrome/Firefox; border-radius assimétrico como fallback universal
- Tipografia outline+solid mix: "O/Portugal/que/nos" em `-webkit-text-stroke 1.5px` navy vazado, "não/aparece" e "sites de reservas" solid navy
- "sites de reservas" agora navy com underline dourado animado L→R — resolve bug crítico (texto branco sobre fundo areia = 1:1 contraste)
- Animação entrada staggered ~2.5s: kicker (0.2s) → 9 palavras (0.4–1.2s) → sub (1.8s) → CTAs (2.0s) → underline grow (1.6s)
- Cursor-reactive parallax: `.hero__media` (6px) + `.hero__text` counter-move (3px), EASE 0.06, `hover:none` skip, `prefers-reduced-motion` skip
- Setinha down (`.hero-scroll`) removida — era não-funcional
- Mobile fallback: `clip-path: none; border-radius: 4px 60px 4px 60px` via `@media (max-width: 768px)` (iOS Safari não suporta `clip-path: url()` em HTML)
- `prefers-reduced-motion`: `animation: none; opacity: 1; transform: none` em todos os elementos animados
- CSS cache bumped para `?v=20260506-6ce`

### Fase 6C-G → ✅ heroes pesca/surf/webcams — estilo cinemático Alt 3 (2026-05-06)
- 6 ficheiros afetados: pesca.html, surf.html, webcams.html (PT) + en/pesca.html, en/surf.html, en/webcams.html (EN)
- Novo componente CSS reutilizável `.page-hero` em css/style.css — reusa keyframes heroMediaReveal/heroWordReveal/heroFadeUp do hero principal
- SVG `#hero-wave-clip` adicionado inline antes de `<main>` em cada página
- Fraunces + IBM Plex Mono adicionados via Google Fonts (substituindo DM Sans)
- Fotos próprias do Storage: PESCA (bda7327b), SURF (7f6e2b93 · Wikimedia Sergey Mysovskiy), WEBCAMS (ec40e481)
- Cursor parallax (EASE 0.06, hover:none + prefers-reduced-motion guarded) em todas as 6 páginas
- CSS cache bumped para `?v=20260506-6cg`
- 85 → 82 ficheiros restantes com Unsplash hardcoded

### TODOs
- Páginas escondidas.html e en/hidden-beaches.html: produzir conteúdo editorial real (10 praias verificadas + fotos + texto)
- Fase 6C-H (futuro): substituir Unsplash hardcoded nos 82 ficheiros restantes

## Hard guardrails
- Do not touch auth logic without proven reason
- Do not touch LemonSqueezy flow without proven reason
- Do not touch GA4 tracking without proven reason
- Do not reopen CRM foundations without proven reason
- Do not refactor large stable areas for style only
- Do not change validated commercial flows casually

## Preferred execution style
When implementing:
1. State the exact next batch
2. Target only the needed files
3. Make localized changes
4. Validate the affected flow
5. Deploy at the end
6. Return:
   - files changed
   - what changed
   - regressions avoided
   - deploy URL

## Prompt format preference
Use this structure when preparing execution:
- Objective
- Models to use
- Files
- Change
- Test
- Deploy
- Delivery

## Current rule for tool stack
Use the right tooling in this order:
1. Official LSP for the stack
2. Project-specific skill and hook to reduce rediscovery/log noise
3. Only after that consider design/media MCPs like Stitch, 21st.dev, or Nano Banana 2

## Auditoria

Single source of truth for pre-launch audit findings: [`docs/AUDIT-MASTER.md`](docs/AUDIT-MASTER.md).

- Consolidates 9 source audit documents (security, RLS, SEO, content, bugs, brand, performance, accessibility, GDPR, LemonSqueezy, EN/PT parity).
- Status RESOLVED requires inline code evidence; default is UNKNOWN.
- Before opening a new audit, search AUDIT-MASTER.md by category ID prefix (SEC-, RLS-, BUG-, EN-, LS-, etc.) to avoid re-reporting known issues.
- Source docs in `docs/audit-*.md`, `docs/BUG_AUDIT.md`, and `docs/audits/` remain for historical detail; do not edit them — write new findings into AUDIT-MASTER.md.

## Pre-deploy ritual (mandatory for any HTML/CSS/JS change)

Before approving any deploy that touches HTML/CSS/JS:

1. Take screenshot of the production page BEFORE the change (use https://www.portalturismoportugal.com/...)
2. Apply change locally
3. Take screenshot AFTER the change in same viewport (mobile 375px AND desktop 1280px)
4. Side-by-side compare. Look for:
   - Elements that disappeared
   - Layout shifts (flex/grid broke)
   - Z-index conflicts
   - Forms with elements squeezed
   - CTAs out of viewport
5. Only then deploy
6. **After deploy** — Run the 5-URL smoke test from /docs/smoke-test.md. If any test fails, run `git revert HEAD` and redeploy immediately.

This ritual exists because automated functional tests (11/11 checks pass) do NOT catch visual regressions. A widget can be functionally working and visually broken at the same time.

## Regression watchlist

Pages/components with history of breaking. Re-validate visually after ANY change touching them or their shared CSS/JS:

| Page/component | Last broke | Why | Watch for |
|---|---|---|---|
| surf.html newsletter form | 04/05/2026 | Turnstile widget added inside inline form, squeezes email input | Email input width, widget layout, success state visibility |
| home/hero CTAs (any page with hero) | 04/05/2026 | At 100% browser zoom, CTAs ("Explorar Spots", "Planear Escapada") fall below viewport on hero | Test 100% zoom on 1080p and 1440p |
| dashboard.html admin role check | 04/05/2026 | Line 887 uses user.app_metadata.role !== 'admin' redirect — works only if app_metadata.role is set; profiles.plan column is the source of truth for Pro/free, not for admin | If admin redirect fails: check raw_user_meta_data vs app_metadata |
| welcome.html JS scope | 04/05/2026 | const db top-level in config.js does NOT become window.db; any inline script using db must be wrapped in DOMContentLoaded with typeof db check | TDZ errors, "db is not defined" |
| All forms with Turnstile | ongoing | Site key 0x4AAAAAADFrwvqNt1FGaqkB does not work on localhost — only production. For local tests use 1x00000000000000000000AA (always-pass) | Form submits returning 403 in local but 200 in prod = Turnstile config issue |
| /beach.html (and /en/beach.html) | 05/05/2026 | Entire inline beach-loading script (1362 lines PT / 981 lines EN) accidentally deleted by navbar CSS cleanup commit 2abc649 — also needs DOMContentLoaded wrap because config.js uses defer | Test loading state with valid beach id; verify spinner disappears and content renders; verify error fallback shown if id missing or DB error |
| /en/beaches.html, /en/pesca.html, /en/surf.html, /en/webcams.html | 05/05/2026 | Listing JS handlers (~300 lines each) deleted by commit 2abc649 "navbar cleanup" — same root cause as BUG-BEACH-01. Pattern: navbar cleanup script over-matched and deleted unrelated `<script>` blocks containing listing handlers | After ANY navbar/cleanup task touching multiple files: smoke test ALL EN pages with dynamic listings (beaches, pesca, surf, webcams). Run line-count diff PT vs EN — ratio < 75% suggests deletion |
| /en/beach.html, /beach.html | 05/05/2026 | (1) English possessive apostrophes (Porto's) inside JS single-quote strings broke the entire inline script with SyntaxError — fixed ecd0022 by escaping to Porto\'s. (2) .select() on both main and related-beaches queries requested subregion, beach_type, is_surf_spot — columns that never existed in the beaches table; Supabase returned HTTP 400, JS showed "Beach not found" for every valid ID — fixed ecd0022/06807bb by removing non-existent columns (Caminho C: all remaining JS usages handle undefined safely) | After ANY PT→EN translation of strings with English possessives: grep for unescaped apostrophes inside single-quoted JS strings. After ANY .select() change: verify each requested column exists in the actual DB schema |
| /guias/*.html (5 files), dashboard.html | 05/05/2026 | user.user_metadata.plan was used for paywall isPro detection in 5 /guias/ pages — exploitable via db.auth.updateUser({data:{plan:'pro'}}) in browser console (SEC-02). Fixed by reading profiles.plan from DB (RLS-protected). dashboard.html Pro badge also aligned. | After ANY new gated/Pro feature: NEVER read role/plan from user_metadata. Use profiles.plan via DB query (.from('profiles').select('plan').eq('id', user.id).maybeSingle()). |
| /guias/*.html paywall IIFE | 05/05/2026 | Inline `<script>` IIFE ran before defer'd config.js loaded → db was undefined → ReferenceError caught silently → paywall visible to Pro users. Fixed (commit e191734) by wrapping in DOMContentLoaded + typeof db guard (same pattern as welcome.html, dashboard.html). | After ANY new inline `<script>` using db: wrap in DOMContentLoaded with typeof db check. Defer scripts run BEFORE DOMContentLoaded fires, so this guarantees db is ready. |
| pesca.html, surf.html, en/pesca.html, en/surf.html hero | 05/05/2026 | Orphan `}` in inline `<style>` (PT: missing `@media(max-width:768px){` wrapper around nav-mobile-open block; EN: entire nav mobile block deleted leaving bare `}`). CSS parser invalidated, `.pesca-hero`/`.surf-hero` `background:linear-gradient(...)` did not apply on desktop — hero appeared with white page background, text/badges illegible. Fixed bb9945d by balancing braces. | After ANY copy-paste or deletion of CSS blocks: count `{` vs `}` in `<style>…</style>` before commit (opens must equal closes). |
| pesca/surf hero (PT+EN) trust block spacing | 05/05/2026 | Desktop rule had `padding-bottom:0` → trust block (last child of hero 2-col) appeared flush at the hero's bottom edge, overlapping the wave SVG in surf.html (real −63px overlap) and cramped in pesca.html (no wave SVG). Fixed 9dadadd by adding `padding-bottom:80px` to desktop rule (wave is 64px tall; 80px gives 16px buffer). Late `@media(max-width:540px)` overrides (`88px 4vw 48px`) already present keep mobile safe. | After ANY hero CSS edit on these 4 pages: visually check trust block at desktop (1280px) AND mobile (540px). Trust bottom must not touch or overlap the wave/hero edge. |
| All card `<img>` PT+EN (BUG-IMG-AUTOFIX) | 05/05/2026 | Cards used hardcoded Unsplash URLs — many were 404 (invented/mistyped photo IDs). Auto-healing system installed (commits e5d4b91, 91babd3, 7e9db21): `onerror` calls `pexels-search` Edge Function with keyword fallback → 30-day cache in `image_cache` table + localStorage. Fallback final: CSS gradient. Confirmed 404: `guias/surf-portugal-iniciantes.html` hero (`photo-1502680390548-bdbac40e4ce3`). | After ANY new card with `<img>`: add `onerror="autoFixImage(this)"` + `data-fallback-keyword="english keywords"`. Add `<script src="/js/image-autofix.js" defer></script>` to page if not already present. Keywords must be in EN (Pexels API has better EN coverage). TODO: add Pexels photographer attribution tooltip to UI. |
| beaches.html body padding (1A) | 07/05/2026 | `.mobile-bottom-nav` pages (beaches, pesca, surf, webcams) were NOT covered by the global `body:has(.bottom-nav)` CSS rule — different class name. Inline `body { padding-bottom }` on each page needed separate fix (60px → 80px). | After ANY new page with `.mobile-bottom-nav`: add inline `body { padding-bottom: calc(80px + env(safe-area-inset-bottom, 0px)); }` to its inline `<style>`. Do NOT rely on the global CSS rule. |
| mob-menu-btn all listing pages (1C) | 07/05/2026 | `mob-menu-btn.click()` → `nav-toggle.click()` → menu opens → original click event bubbles to `document` → `nav.js` document-level handler closes menu immediately (race condition). Fix: `e.stopPropagation()` on ALL mob-menu-btn handlers across 13 files. | After adding ANY new page with `.mobile-bottom-nav` + mob-menu-btn: confirm its handler has `e.stopPropagation()`. Without it, MENU button appears broken on mobile. |
| Filter pill containers scroll affordance (1D) | 07/05/2026 | `.chips-bar` / `.region-chips-bar` had `overflow-x: auto` but no visual affordance — rightmost pills were unreachable because no scroll indicator. Fixed with `mask-image: linear-gradient(to right, black calc(100% - 28px), transparent 100%)`. | After adding any new scrollable pill container: add both `-webkit-mask-image` and `mask-image` fade gradient. Test on 375px viewport that all pills are reachable. |
| beaches/pesca/surf pagination (1E) | 07/05/2026, 11/05/2026 | All 114+ cards rendered at once on mobile — no pagination. PT fixed with `js/beaches-paginate.js`. EN was missing the script tag entirely — added 11/05/2026 (commit 6552b2e). | After ANY change to `renderBeaches()` or `renderSpots()` that alters grid innerHTML replacement: verify paginator fires on BOTH PT and EN. Script must be loaded in **both** beaches.html and en/beaches.html. |
| en/beaches.html hero z-index (EN overlay) | 11/05/2026 | Hero text (page-tag, h1, p, CTAs, stats) was missing `.page-header-inner` wrapper (position:relative; z-index:2). Text was painted in normal flow at z-index step 3, overlaid by `.page-header-overlay` at z-index:1 step 7 — text barely visible through 65% dark overlay. Fixed 11/05/2026 (commit 6552b2e): added CSS rule + HTML wrapper div. | After ANY copy of PT hero structure to EN: verify `.page-header-inner` wrapper present with z-index:2. Without it, text is hidden under overlay. |
| /beach.html + /en/beach.html accordions (HF-1A) | 07/05/2026 | `toggleAcc` defined inside `DOMContentLoaded` callback → inaccessible from inline `onclick="toggleAcc(...)"` attributes (inline handlers look up window scope only). Root cause: commit `0bd3a18` restore wrapped entire script in DOMContentLoaded. Fix: `window.toggleAcc = function toggleAcc(...)` — exposes globally while keeping it inside DOMContentLoaded. | After ANY change that moves beach.html/en/beach.html script into a new closure scope (IIFE, DOMContentLoaded, module): verify all inline `onclick`-referenced functions are on `window`. |
| /beach.html + /en/beach.html mob-menu-btn (HF-1A addendum) | 07/05/2026 | `mob-menu-btn` handler in beach.html/en/beach.html was missing `e.stopPropagation()` — same race condition fixed in 1C for 13 other pages, but beach pages were inadvertently skipped. Regression watchlist 1C entry said "no change needed" but only referred to handler registration timing, not the stopPropagation race. | Regression watchlist 1C entry updated. After ANY new page with mob-menu-btn, confirm `e.stopPropagation()` is present. |
| en/planear.html, en/surf.html, js/nav.js TrustedHTML (hotfix 11/05/2026) | 11/05/2026 | `innerHTML = htmlString` calls triggered TrustedTypes violations in Chromium headless (QA audit). Pages with `require-trusted-types-for` or GTM policy active will block bare innerHTML. Fixed with `_setHTML()` helper (trustedTypes.createPolicy('pth-html')) in planear/surf; nav.js switched to createElement + cloneNode. | After adding ANY new `innerHTML = dynamicHtml` call to first-party JS: wrap with `_setHTML(el, html)` pattern or use createElement. GTM-sourced TrustedScript/TrustedScriptURL violations remain (third-party, unfixable). Commit: 6163e21. |
| login.html, en/login.html — login.js defer + DOMContentLoaded | 12/05/2026 | login.js loaded without `defer` on login.html → ran synchronously before config.js (defer) → ReferenceError: db is not defined at login.js:45. en/login.html inline script called db.auth.getUser() before DOMContentLoaded, same race. Fixed: added `defer` to login.html script tag; wrapped db call in DOMContentLoaded + typeof db guard in en/login.html. Commit: 956486d. | After ANY new external JS file that uses db/showToast/track: add `defer` attribute. After ANY new inline script using db: wrap in DOMContentLoaded with `typeof db === 'undefined'` guard. Defer scripts run BEFORE DOMContentLoaded — this guarantees db is ready. |
| console-network.spec.ts — Turnstile console filter | 12/05/2026 | Cloudflare Turnstile challenge iframe emits console.error messages (TrustedHTML/TrustedScript/TrustedScriptURL assignment blocked, xr-spatial-tracking, CSP unsafe-eval via srcdoc, PAT endpoint 401, fingerprint canary `%c%d font-size:0;color:transparent NaN`) — none were filtered by isIgnorableConsoleMsg() → 5 false failures. Fixed: added challenges.cloudflare.com to isThirdParty(); added 7 Turnstile-specific patterns to isIgnorableConsoleMsg(). Commit: 956486d. | After adding Turnstile to ANY new page: re-run console-network.spec.ts to confirm all Turnstile error patterns are covered. If new Turnstile error appears, add its text pattern to isIgnorableConsoleMsg() — do NOT add the page URL to the critical-pages list without first verifying the filter covers all its third-party noise. |
| conta.html PT — auth IIFE DOMContentLoaded race | 12/05/2026 | Inline `(async () => {...})()` ran before defer'd config.js → window.db undefined → SEC-04 plan check + db.auth.getUser() failed silently in some browser timings. en/conta.html already had correct pattern (reference). | Qualquer script inline em página behind-auth que toque window.db, window.auth ou supabase client DEVE estar dentro de DOMContentLoaded handler. Scripts externos que dependem do mesmo DEVEM ter atributo defer. Padrão validado em commits 956486d (login.js, en/login.html) e no commit que acompanha os alertas. Páginas afectadas: login.html, en/login.html, conta.html, en/conta.html. Verificar antes de qualquer novo deploy que toque essas páginas. |
| B2B form (#b2b-success/#b2b-pending) + Planner form (#form-success/#rec-status) persistent state | 12/05/2026 | Lead capture forms must show persistent success/pending UI state after submit — never revert to toast-only. Root causes: (1) parceiros.js and planear.js showed toasts without toggling div visibility; (2) en/planear.html catch block returned early without showing #form-success; (3) Playwright mocks used rest/v1 patterns instead of functions/v1 (Edge Function migration); (4) Turnstile async script overwrote injected fake token — fixed by blocking CDN in tests + DOMContentLoaded injection. Commits: 6605f67. | After ANY refactor of parceiros.js or planear.js submit handler: verify #b2b-success.vis and #form-success.visible are shown on both success and error paths. NEVER use toast-only for lead capture forms — persistent state prevents double-submit and lost leads on mobile. tests/forms.spec.ts uses `**/functions/v1/<function-name>**` route patterns (Edge Functions, not PostgREST). Turnstile CDN blocked in test setup via page.route('**/challenges.cloudflare.com/turnstile/**') — do NOT bypass Turnstile guard in production code. |
| js/nav.js buildMobileMenu — same role co-existence bug risk | 12/05/2026 | initNavAuth had rigid if/else assuming 1 user = 1 role; fixed (commit eef0a9c). buildMobileMenu clones .nav-links before auth resolves — may not reflect dual-link state | Verify admin+Pro sees /conta.html in mobile menu before next mobile sprint |
| parceiros.html + en/parceiros.html Media Kit CTA opacity | 12/05/2026 | Inline style `color:rgba(255,255,255,0.38)` made link near-invisible on mobile/sunlight. Fixed commit fd0aff1: raised to 0.85, hover to 1.0. | After any hero copy/paste that includes the trust-bar paragraph: check Media Kit link opacity — inline styles survive copy-paste and may reset |
| partner-demo.html + en/partner-demo.html CTA label truncation | 12/05/2026 | `.partner-cta-label` text ended abruptly ("O seu negócio assim" / "Your business like this") — looked broken. Fixed commit 5d92667: added complemento reinforcing Nunca Leiloado USP. | After any copy of the partner CTA card block: verify the label has complete copy, not a truncated placeholder |
| media-kit.html mediakit-cta-button font fallback | 12/05/2026 | `.mediakit-cta-button` used IBM Plex Mono (not loaded in media-kit.html) → fell back to system Courier New. Fixed commit efda79a: changed to Inter. | If IBM Plex Mono is ever added to media-kit.html's Google Fonts, revert button font to IBM Plex Mono for brand consistency |
| index.html + en/index.html hero headline mobile overflow | 12/05/2026 | `clamp(24px,10vw,40px)` at 375px = 37.5px caused "reservas." (3rd word of line 3) to wrap to a 4th line. Fixed commit e787466: reduced to `clamp(20px,8vw,34px)` → 30px at 375px. | After any hero CSS edit on `.hero__headline` for ≤480px: test at 375px that "sites de reservas." fits on one `.hero__line` block |
| surf.html, pesca.html, en/surf.html, en/pesca.html — shared modules i18n refactor | 13/05/2026 | Inline CSS (~340–370 lines each) and inline SPOTS+FAQS+render JS (~430 lines each) extracted to 3 shared modules: beach-renderer.js (extended with i18n strings), surf-pesca-data.js (window.SurfPescaData), surf-pesca-page.js (window.SurfPescaPage). Inline scripts removed. DOMContentLoaded bootstrap calls SurfPescaPage.renderAll('surf'\|'fishing'). Commits: 27a24a2, 3a8419e, 08d895a, 9f0ff2c, d35c5f2, 57b0895, a2ad5b0, 04dcc89. Introduced 4 mobile regressions (fixed same day — see rows below). | After ANY change to beach-renderer.js i18n strings: test both PT and EN surf/pesca pages. After ANY change to surf-pesca-page.js renderAll: verify spots render, filters work, FAQs open. After ANY change to surf-pesca-data.js: check all 25 surf + 25 fish spots still render and filter correctly. Script load order must be: config.js → beach-renderer.js → surf-pesca-data.js → surf-pesca-page.js (all defer). SurfPescaPage depends on BeachRenderer.getT() — do NOT use window.BeachRenderer before DOMContentLoaded. |
| All pages — mobile lang switcher PT/EN hidden | 13/05/2026 | style.css line 1603 had `.lang-switcher { display: none; }` in @media ≤768px — made PT/EN switcher accessible only via hamburger menu, not directly visible in navbar. Fixed commit 491bade: removed that rule. `.mobile-lang` clone in nav.js still provides access inside hamburger menu. | After ANY edit to the @media(max-width:768px) block in style.css: verify PT/EN switcher visible alongside hamburger on 375px. |
| surf.html + pesca.html — blank white sections (reveal-sec invisible) | 13/05/2026 | IntersectionObserver removed from surf.html (commit d35c5f2) and pesca.html (commit 57b0895) inline scripts, not ported to surf-pesca-page.js. Sections with .reveal-sec started at opacity:0 and never received .visible class. Fixed commit 5b8aeb1: added IntersectionObserver to end of renderAll() in surf-pesca-page.js (threshold:0.07, same as original). | After ANY change to surf-pesca-page.js renderAll() or addition of .reveal-sec sections: verify all .reveal-sec become visible on scroll (or immediately if above fold). Test both surf and pesca, both PT and EN. |
| pesca.html — footer giant vertical list + giant SVG icons | 13/05/2026 | commit 57b0895 removed 793 lines from pesca.html inline `<style>` claiming CSS was "now in surf-pesca-page.css" — it was not. Missing: .estilo-*, .licenca-*, .destino-*, .pp-card-*, .pp-badge-*, .pesca-plan-band, .ppb-btn-*, .pesca-pro-upsell-*, .pesca-footer-* (all pesca-specific). SVG icons in .licenca-block-icon, .pp-card-icon rendered at browser default ~300×150px as solid black shapes. Footer stacked in single column. Fixed commit 395c5ea: added all 135 missing CSS lines to surf-pesca-page.css. | When extracting inline CSS from any page to a shared file: always run `git diff --stat` on BOTH the source page (confirm deleted lines) AND the destination CSS file (confirm inserted lines). A mismatch means CSS was silently dropped. |
| webcams.html + en/webcams.html — section#webcams invisible (Bug 5+6) | 13/05/2026 | style.css:2634 adds `#webcams{display:none}` to hide a homepage section as part of Fase 6C-D restructure. The same ID `webcams` is used on the grid section in webcams.html → grid hidden, CTA click barely scrolled (33px vs expected 1267px). Fixed commits 4c06ac9: added `section.wcam-section#webcams{display:block}` to webcams-guias-page.css (higher specificity override). | After ANY new `display:none` CSS rule using an element ID in style.css: check if that ID is also used on non-homepage pages. ID-based hiding rules are global — always use page-scoped selectors (e.g. `.page-home #id`) or override in page-specific CSS. |
| surf.html + pesca.html (PT+EN) — footer 1100px+ on mobile (Bug 7) | 13/05/2026 | surf-footer and pesca-footer CSS had `padding:60px 5vw 32px` + no mobile column-hiding. At 375px the 4 columns stacked to single column = 1126px/1147px (≈5.9x baseline). Standard .footer hides .footer-col at ≤768px (style.css:2758) but surf/pesca custom footers didn't. Fixed commit f829f7a: added `@media(max-width:768px)` block to surf-pesca-page.css hiding cols, reducing padding. Result: 204px/225px (1.1x baseline). | After ANY new custom footer class (not .footer): add ≤768px mobile-collapse block hiding nav columns. Verify at 375px that height ≤ 2x .footer baseline (194px). Essential links must remain in footer-bottom bar. |

| GYG integration — 39 files (surf/pesca/beaches/guias + 26 articles) | 14/05/2026 | GetYourGuide affiliate widgets installed site-wide. partner-id 0WTBHZE. 6 campaign labels: pthsurf (EN surf), pthsurfpt (PT surf), pthpesca (EN fishing), pthpescapt (PT fishing), pthalgarveen (EN Algarve), pthalgarvept (PT Algarve). Analytics: pa.umd.production.min.js in `<head>` once per page. CSS: gyg-block.css (new file). Legacy surf-gyg-* removed from surf-pesca-page.css. Commits: fd69ee1, 1c331f5, 7a7ac74, 51e8677. | NEVER duplicate pa.umd.production.min.js (max 1 per page). NEVER change campaign labels — they map to GYG dashboard Statistics filters. NEVER add GYG script to auth pages (login, conta, dashboard, parceiros) or legal pages. gyg-block.css must be linked on any page that uses .gyg-block. Widget position: surf/pesca = before spots grid (~30%); beaches/guias/articles = before </main> or before last CTA section. |

When introducing a new Quick Task, scan this watchlist for overlap and re-test those scenarios.

### IMG-FETCH-STORE (em curso — Fase 1 concluída 2026-05-06)

**Sistema:** Substituição do autofix on-demand Pexels por fetch-and-store em Supabase Storage.

**Estado por fase:**
- Fase 1 — DB schema + Storage bucket: ✅ migrations + docs criados, pendente apply manual
- Fase 2 — Edge Function pexels-fetch-and-store: ✅ código criado, pendente deploy + teste
- Fase 3 — Script populate-images.js (Node): ✅ script criado, pendente dry-run + apply
- Fase 3.5 → ✅ Edge Function v2 com diversification (paginação aleatória posição 3-12, exclude_pexels_ids opt-in tracking, rotação de sufixos visuais). Resolve fotos repetidas detectadas no dry-run 2026-05-06. Pendente novo dry-run.
- Fase 4 → ✅ Edge Function v3 multi-source criada (Wikipedia/Wikimedia/Pexels), pendente deploy + 5-test gate validation + apply to 109. **Nota:** v2 mantida em paralelo durante validação. NÃO apagar até v3 validada com 5 praias-teste.
- Fase 5 → ✅ Sistema híbrido (Edge Function v4 simplificada + override manual via image_curated_*), pendente deploy + curadoria editorial
- Fase 5.5 → ✅ v4 ajustada com filtro anti-P&B na Camada Pexels (keyword + avg_color saturation < 0.10), pendente re-teste Fajã da Areia
- Fase 6A → ✅ Documento de curadoria editorial criado (`docs/editorial/curadoria-2026-05-06.md`). Worksheet com 21 praias (UUIDs reais da BD, links Wikimedia Category + Search por praia, 3 campos vazios por praia, SQL UPDATE batch template). Fase 6B (preenchimento manual + execução SQL + populate-images.js) pendente.
- Fase 6B → ✅ Atribuição visível (caption + tooltip) em beach.html, beaches.html, en/beach.html, en/beaches.html. CC BY-SA compliance. Caption discreta abaixo da imagem (11px, opacidade 0.6) com link clicável para source_url. Tooltip on hover/tap mostra autor · licença. Conta.html, dashboard.html, pro/welcome.html, index.html NÃO tocados.
- Fase 6B.1 → ✅ caption agora não-clicável (Padrão B), tooltip on hover mantém link. CC BY-SA compliance preservada via texto visível + tooltip + data-source-url.
- Fase 6C-E → ✅ redesign cinemático do hero principal: SVG clip-path em onda fluida vertical, tipografia outline+solid mix, underline dourado animado em "sites de reservas" (resolve bug branco invisível), entrada staggered ~2.5s, cursor-reactive parallax, setinha down removida. Fallback border-radius assimétrico para iOS Safari.
- Fase 6C-F (EXPERIMENTAL na branch `feature/hero-alt3-experiment`) → hero Alt 3 com video intercept + mix-blend-mode: difference. Headline Fraunces 600 clamp(48px–112px) atravessa o vídeo — texto quasi-preto sobre areia, inverte onde cruza pixels escuros do vídeo. Fallback @supports e mobile (<1024px) colapsa para layout sem intercept. Parallax: apenas hero__media move-se (hero__content excluído para preservar stacking context correcto). Decisão de merge para feature/fetch-and-store-phase-1 depende de validação visual do utilizador.
- Fase 6C-G → ✅ heroes pesca/surf/webcams (PT+EN, 6 ficheiros) com estilo cinemático Alt 3 (.page-hero CSS reutilizável). Fotos próprias do Storage. SVG clip-path onda + Fraunces + mix-blend-mode: difference. Cursor parallax. CSS cache `?v=20260506-6cg`. 85→82 ficheiros restantes com Unsplash.
- Fase 4.5 — Adapter HTML/CSS: pendente
- Fase 6 — Atribuição Pexels: ✅ entregue em Fase 6B
- Fase 7 — Validação produção: pendente

**Decisões arquiteturais (não re-discutir):**
- Cards estáticos de guias + heroes CSS → hardcode no HTML/CSS, sem tabela auxiliar
- Optimização (resize 1600px + WebP) → no script Node, não na Edge Function
- Curadoria → tudo automático, com dry-run + relatório HTML revisável antes de UPDATEs
- Vídeos hero (cdn.portalturismoportugal.com/*.mp4) → NÃO TOCAR
- Camadas Wikimedia geo-search e text-search abandonadas — provaram apanhar ficheiros irrelevantes (florestas, homónimos noutras regiões como Fajã da Ribeira da Areia Açores quando se queria Madeira).
- v4 substitui funcionalmente a v2 e v3 mas mantém ambas vivas durante validação. Apagar quando v4 confirmada com 109 praias.
- Override manual via image_curated_url/author/source_url tem prioridade absoluta sobre Wikipedia e Pexels. image_curated_* são campos de input editorial e nunca são escritos pela Edge Function.

**NÃO fazer:**
- Não criar tabela `card_images` (decisão do conselho 2026-05-05: hardcode é a escolha certa para conteúdo estático)
- Não popular `beaches.image_url` com URLs Pexels diretas — sempre Storage URLs
- Não correr populate sem dry-run primeiro
- Não tocar em /pro/welcome.html, /index.html, .claude/worktrees/*

### Mandatory rule for closing any bug fix

When fixing ANY bug (visual, functional, security, data), the closing checklist MUST include:

1. Add an entry to the Regression watchlist table above with: page/component, date, root cause one-liner, what to watch
2. If the bug class is new, add a new row. If it matches an existing row, append the date to the "Last broke" cell as comma-separated dates (e.g., "04/05/2026, 12/06/2026")
3. The pre-deploy ritual screenshot pair (before/after) is mandatory — no exception for "trivial" fixes
4. Reference the fix commit hash in the SUMMARY.md so future audits can git blame back

Failing to add a watchlist entry means the bug WILL regress. Treat this rule as non-skippable.

## Task scope contracts (mandatory before any code change)

Before writing code for ANY task, the agent MUST declare in writing:

1. **Files in scope**: explicit list of files this task may modify (e.g., "Files: surf.html, en/surf.html").
2. **Lines/sections in scope** when known (e.g., "Lines 489-510 .surf-alerts-form CSS rule").
3. **Out of scope**: anything not declared above is OFF-LIMITS for modification.

When the user gives a task framed as "cleanup X across multiple files" (e.g., "remove navbar CSS from all pages"), the agent MUST:

- Declare an EXPLICIT pattern that defines what is being removed (e.g., regex or string match).
- Confirm BEFORE running that the pattern only matches the intended content.
- Show a sample dry-run on 1-2 files first; user approves before scaling to all files.
- Never use broad delete operations like "remove inline scripts" or "clean up styles" without a precise selector.

Failing this rule produces incidents like BUG-BEACH-01 (commit 2abc649 deleted 2300+ JS lines in beach.html / en/beach.html during a "navbar cleanup" task).

## Pre-commit ritual (mandatory before every commit)

Before running `git commit`, the agent MUST:

1. Run `git diff --stat` and inspect the result.
2. Compare with the declared "Files in scope" from the Task scope contract.
3. If the diff touches files NOT declared in scope, ABORT the commit, report the unexpected files to the user, and ask for explicit confirmation.
4. If the diff touches lines or counts WAY OUT OF PROPORTION to what was declared (e.g., declared "alter ~3 lines" but diff shows "+1364 lines"), ABORT and confirm.
5. Only proceed with commit after the diff matches expectation.

This ritual exists because automated tests do not catch "wrong file modified" — they only catch "code is broken". A commit that silently deletes a working script will pass all unit tests because there are no unit tests covering that script.

## Important note
This repository is optimized by doing the smallest commercially meaningful next step, not by broad exploration.
