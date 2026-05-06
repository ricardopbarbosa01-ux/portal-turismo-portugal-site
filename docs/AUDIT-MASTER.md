# AUDIT MASTER — Portugal Travel Hub

> Single consolidated ledger of all pre-launch audit findings.
> Generated 2026-05-04 from 9 source documents (see Source Documents Index).
> Status RESOLVED requires inline code/commit evidence; otherwise UNKNOWN.

## Executive Summary

### By Severity

| Severity | Count |
|----------|-------|
| Critical | 11    |
| High     | 16    |
| Medium   | 18    |
| Low      | 10    |
| Info     | 3     |
| **Total**| **58**|

### By Status

| Status           | Count |
|------------------|-------|
| RESOLVED         | 30    |
| OPEN             | 16    |
| BLOCKED EXTERNAL | 1     |
| UNKNOWN          | 12    |
| WONTFIX          | 0     |

---

## Issues by Category

### Security (SEC)

| ID | Severity | Status | Title | Source |
|----|----------|--------|-------|--------|
| SEC-01 | Critical | RESOLVED | Email relay open: send-welcome/send-plan-confirm/send-partner-alert accept anonymous POST without auth. **Evidence**: Edge Functions submit-plan-request, submit-partner-lead, submit-contact, submit-surf all migrated to Turnstile + verify_jwt false; anon_insert policies on contact_messages and surf_subscribers dropped (commits 260504-l95, 260504-m9v) | audit-security-2026-04-29.md:59-110 |
| SEC-02 | High | RESOLVED | Privilege escalation via user_metadata.plan in 5 /guias/ pages — replaced with profiles.plan (DB source of truth, RLS-protected). Cosmetic dashboard.html Pro badge also aligned. **Evidence**: guias/melhores-praias-algarve.html, guias/pesca-portugal.html, guias/praias-perto-lisboa.html, guias/quando-visitar-portugal.html, guias/surf-portugal-iniciantes.html + dashboard.html — branch fix/sec-02-privilege-escalation (session 05/05/2026) | audit-security-2026-04-29.md:114-145; audit-rls-2026-04.md:300-315 |
| SEC-03 | High | OPEN | ls-webhook: verifySignature() is fail-open when WEBHOOK_SECRET is empty | audit-security-2026-04-29.md:150-193 |
| SEC-04 | High | OPEN | conta.html: free user can access Pro UI via ?activated=1 without timeout redirect | audit-security-2026-04-29.md:199-227 |
| SEC-05 | Medium | OPEN | HSTS header absent from _headers — HTTP downgrade attack possible on untrusted networks | audit-security-2026-04-29.md:234-255 |
| SEC-06 | Medium | OPEN | Ingest/check functions (ingest-tides, ingest-waves, check-alerts) accept unauthenticated invocation | audit-security-2026-04-29.md:261-295 |
| SEC-07 | Medium | OPEN | CSP has unsafe-inline and unsafe-eval — XSS mitigation weakened | audit-security-2026-04-29.md:299-317 |
| SEC-08 | Low | OPEN | SRI hash absent on jsDelivr Supabase SDK CDN load — supply chain risk | audit-security-2026-04-29.md:322-344 |
| SEC-09 | Low | OPEN | admin HTML emails in send-plan-confirm and send-partner-alert interpolate user fields without HTML escaping | audit-security-2026-04-29.md:350-380 |
| SEC-10 | Low | UNKNOWN | Email enumeration via password-reset timing side-channel (Supabase Auth behaviour) | audit-security-2026-04-29.md:420-428 |
| SEC-11 | Medium | UNKNOWN | Parceiro approved could access plan_requests with regiao IS NULL — policy gap needs verification | audit-security-2026-04-29.md:431-441 |

### RLS (RLS)

| ID | Severity | Status | Title | Source |
|----|----------|--------|-------|--------|
| RLS-01 | Critical | RESOLVED | alerts table has no RLS in code — cross-user read/delete/insert of alerts. **Evidence**: `pg_policies` has `user_own_alerts` ALL for authenticated — audit was outdated (verified 04/05/2026) | audit-rls-2026-04.md:185-209; audit-security-2026-04-29.md:259-268 |
| RLS-02 | Critical | RESOLVED | favorites table has no RLS in code — cross-user read/modify of favorites. **Evidence**: `user_own_favorites` ALL + `favorites.user_id NOT NULL` applied 04/05/2026 | audit-rls-2026-04.md:158-181; audit-security-2026-04-29.md:271-280 |
| RLS-03 | High | UNKNOWN | beaches table has no RLS in code — createBeach/updateBeach/deleteBeach exposed via anon key (dead code, unverified in Dashboard) | audit-rls-2026-04.md:138-155; audit-security-2026-04-29.md:283-293 |
| RLS-04 | Medium | UNKNOWN | profiles table has no RLS in code — future frontend reads would expose plan/ls_subscription_id to all authenticated users | audit-rls-2026-04.md:213-231 |
| RLS-05 | Low | UNKNOWN | reference_ports table has no RLS in code (public static data, low risk) | audit-rls-2026-04.md:235-249 |
| RLS-06 | Medium | UNKNOWN | tides and waves RLS defined in _scripts/ not migrations/ — may not have been applied via supabase db push | audit-rls-2026-04.md:117-134 |
| RLS-07 | Medium | UNKNOWN | partners table: no INSERT policy for authenticated non-admin — may block partner self-registration flow | audit-rls-2026-04.md:76-80; audit-rls-2026-04.md:351 |
| RLS-08 | Medium | UNKNOWN | plan_requests and partner_leads: anon INSERT WITH CHECK (true) — no DB-level field validation, spam/flood possible | audit-rls-2026-04.md:55-57; audit-rls-2026-04.md:95-98 |
| RLS-09 | High | RESOLVED | lead_meta: overly permissive crm_operators_all policy replaced by admin_all_lead_meta in migration | audit-rls-2026-04.md:33-37; audit-security-2026-04-29.md:20 |
| RLS-10 | High | RESOLVED | auth read partner_leads and auth read plan_requests had using_clause=true — any authenticated user could read all entries; both policies dropped. "partner reads matching leads" also dropped (semantic duplicate of partner_select_own_region) | session 04/05/2026 |
| RLS-11 | Medium | RESOLVED | 7 duplicate policy pairs (alerts, favorites, partners ×2, partner_leads, plan_requests, profiles) cleaned up | session 04/05/2026 |

### SEO (SEO)

| ID | Severity | Status | Title | Source |
|----|----------|--------|-------|--------|
| SEO-01 | Critical | RESOLVED | Canonical and hreflang on all HTMLs pointed to wrong domain (770 occurrences) | BUG_AUDIT.md:13-17, 170-191 |
| SEO-02 | High | RESOLVED | Sitemap missing, 404 page absent, hreflang inconsistencies — fixed in 260420-j7h | BUG_AUDIT.md (260420-j7h in STATE.md commit 82d7049) |
| SEO-03 | Medium | UNKNOWN | Title tags: duplicates across subpages — audit via grep not confirmed exhaustively | BUG_AUDIT.md:372-376 |

### Content (CONTENT)

| ID | Severity | Status | Title | Source |
|----|----------|--------|-------|--------|
| CONTENT-01 | Info | OPEN | 85 of 108 HTML pages reference Unsplash images (236 total references, 38 unique URLs) — licensing and ToS risk if Unsplash terms change | audit-unsplash-2026-04.md:7-21 |
| CONTENT-02 | Low | OPEN | Single Unsplash photo (photo-1507525428034-b723cf961d3e) used as OG image on 62 pages — brand uniformity issue | audit-unsplash-2026-04.md:675-681 |
| CONTENT-03 | Medium | RESOLVED | guias.html and en/guides.html missing skip-link — fixed in commit 1c7ba89 (260429-nn0) | audit-navbar-content-2026-04-29.md:35-43; STATE.md 260429-nn0 commit 6d2233d |
| CONTENT-04 | Medium | UNKNOWN | /sobre.html has minimal content and no confirmed EN equivalent at /en/about.html | BUG_AUDIT.md:383-388 |

### Bugs (BUG)

| ID | Severity | Status | Title | Source |
|----|----------|--------|-------|--------|
| BUG-01 | Critical | RESOLVED | EN nav links pointed to PT pages (all /en/ pages) — fixed in Batch 1 (260418-t0c/t1d) | BUG_AUDIT.md:13-17; STATE.md commits 228ac96, b4eb103 |
| BUG-02 | Critical | RESOLVED | EN hero CTAs pointed to /planear.html (PT) — fixed in Batch 1 | BUG_AUDIT.md:13-17; STATE.md commits 228ac96, b4eb103 |
| BUG-03 | High | RESOLVED | Unsplash preload on login.html caused ERR_BLOCKED_BY_ORB — preload + CSS removed | BUG_AUDIT.md:196-221, 542-543 |
| BUG-04 | High | RESOLVED | Form B2B (parceiros.html) had no success/error visual feedback — fixed in Batch 2 | BUG_AUDIT.md:48-58 |
| BUG-05 | High | RESOLVED | Planner form insert failed silently (.catch(()=>{}) pattern) — fixed in Batch 2/3 | BUG_AUDIT.md:48-58; STATE.md commit 239c550 |
| BUG-06 | Medium | RESOLVED | Social buttons in footer used javascript:void(0) — hidden/removed in Batch 3 | BUG_AUDIT.md:86-93 |
| BUG-07 | Medium | UNKNOWN | EN nav uses absolute paths without /en/ prefix on some destination pages — partially overlaps BUG-01 (BUG-011 in source) | BUG_AUDIT.md:348-363 |
| BUG-08 | Medium | UNKNOWN | /onde-ficar-*.html (7 files): booking links use href="#" with JS population — no fallback if JS fails | BUG_AUDIT.md:415-428 |
| BUG-09 | Low | RESOLVED | PWA install banner on index.html had EN text — translated to PT in Batch 3A | BUG_AUDIT.md:441-494 |
| BUG-10 | Medium | RESOLVED | dashboard.html: db not defined — DOMContentLoaded wrapper + typeof guard | STATE.md 260504-hcc commit f401bd5 |
| BUG-11 | Medium | RESOLVED | Silent catch blocks in contact forms and planear/parceiros — user-facing errors added | STATE.md 260420-gxm commit 239c550 |
| BUG-12 | High | RESOLVED | beach.html XSS via innerHTML — escapeHtml() added to 14 call sites | STATE.md 260418-u0y commit 184ce4c |
| BUG-13 | High | RESOLVED | crossorigin="anonymous" missing on video elements — added to beaches.html, surf.html, webcams.html | STATE.md 260421-j9v commit 7f4c926 |
| BUG-VIS-01 | High | OPEN | surf.html newsletter form: Turnstile widget squeezes email input — email input width reduced, breaking form UX and conversion | session 04/05/2026 |
| BUG-VIS-02 | Medium | OPEN | Hero CTAs ("Explorar Spots", "Planear Escapada de Surf") fall below viewport at 100% browser zoom on 1080p and 1440p screens | session 04/05/2026 |
| BUG-CONTACT-01 | Low | OPEN | contact.html shows success state even if INSERT fails — optimistic UX masks backend errors from user | session 04/05/2026 |
| BUG-CMSG-01 | Low | OPEN | contact_messages table has `timestamp` column as text (not timestamptz) and all payload fields are nullable — schema cleanup needed | session 04/05/2026 |
| BUG-IMG-FETCH-STORE | Medium | EM CURSO | Substituir autofix on-demand Pexels por fetch-and-store em Supabase Storage. Supersedes BUG-IMG-AUTOFIX (safety net mantido até Fase 6). ~110 praias + 41 cards estáticos + 3 heroes = ~154 imagens. Fase 1 (schema + bucket docs + RLS policies + verify script) concluída 2026-05-06, pendente apply manual. Fase 2 entregue: Edge Function pexels-fetch-and-store criada (idempotente, beach-only, sem optimização — fica para Fase 3). Fase 3 entregue: script Node populate-images.js (dry-run default, --apply opcional, sharp + WebP, relatório HTML grelha). Próximo: install deps + dry-run + apply. Fase 3.5 entregue: Edge Function v2 com diversification (3 intervenções: paginação aleatória posição 3-12, exclude_pexels_ids opt-in, rotação de sufixos visuais). Resolve problema de fotos repetidas detectado no dry-run de 2026-05-06. Fase 4 entregue: Edge Function v3 multi-source (Wikipedia infobox > Wikimedia geo-search > Wikimedia text search > Pexels fallback). 4 camadas com filtragem positive/negative keywords. v2 paralela mantida. Pendente: deploy + 5-praia gate test + populate completo. Fase 5 entregue: sistema híbrido (Edge Function v4 + override manual via image_curated_*). v4 simplifica para 3 caminhos: manual → Wikipedia infobox → Pexels. Camadas Wikimedia geo/text descartadas após teste real (apanharam Madeira_west_coast_forest e Fajã da Ribeira da Areia Açores quando se queria Fajã da Areia Madeira). v2 e v3 mantidas em paralelo até v4 validada com 109 praias. Fase 5.5 entregue: filtro anti-P&B em v4 Pexels. Detectada foto P&B no teste Fajã da Areia (Madeira) — ajuste in-place com 2 critérios combinados (keyword match no alt + saturação HSL calculada do avg_color hex). Threshold 0.10 conservador. Fase 6A entregue: documento `docs/editorial/curadoria-2026-05-06.md` com worksheet de 21 praias (UUIDs reais, links Wikimedia, SQL batch template). Fase 6B entregue: caption discreta + tooltip on hover nas 4 páginas públicas (beach.html, beaches.html, en/beach.html, en/beaches.html). Compliance CC BY-SA: atribuição visível (11px, opacidade 0.6, link clicável para source_url). Conta.html e dashboard.html não tocados (páginas privadas). CSS `?v=20260506-6b` em todos os 4 ficheiros. Fase 6B.1 entregue: switch para Padrão B (caption não-clicável, tooltip mantém link). Decisão tomada após preview revelar conflito UX entre caption e click no card. source_url preservada em data-source-url no figcaption. CSS `?v=20260506-6b1`. | session 06/05/2026 |

### Brand (BRAND)

| ID | Severity | Status | Title | Source |
|----|----------|--------|-------|--------|
| BRAND-01 | High | RESOLVED | EN mobile menu auth labels were "Entrar/Registar" (PT) instead of "Sign In/Sign Up" (EN) on 7 of 8 EN pages — systematic nav.js i18n gap | AUDITORIA_EN.md:39, 85-93 |
| BRAND-02 | High | RESOLVED | Logo (.nav-logo) in EN pages pointed to PT root (/) instead of /en/ on planear, precos, parceiros | AUDITORIA_EN.md:280-290; STATE.md 260427-p01 commit dfd589c |
| BRAND-03 | Medium | UNKNOWN | Filter chips bar (chips-bar) has no visual scroll indicator at 375px — UX degraded on iPhone SE | AUDITORIA_EN.md:91-93, 143-144 |
| BRAND-04 | Low | RESOLVED | nav.js fires faq-item open class as side effect when hamburger is clicked on surf.html | AUDITORIA_EN.md:138-140 |

### Performance (PERF)

| ID | Severity | Status | Title | Source |
|----|----------|--------|-------|--------|
| PERF-01 | Critical | RESOLVED | Hero video (5.2MB) not lazy-loaded on mobile — lazy-load + defer added | STATE.md 260424-emo commit 1dd8d58 |
| PERF-02 | High | RESOLVED | CSS duplicated/fonts not display=optional + scripts not deferred (99 files) — fixed | STATE.md 260420-jw9 commit ba5e141 |
| PERF-03 | High | UNKNOWN | Core Web Vitals not re-validated after performance fixes — 13 issues flagged pre-fix, no post-fix report | STATE.md 260420-jl7 audit commit 04be809 |

### Accessibility (A11Y)

| ID | Severity | Status | Title | Source |
|----|----------|--------|-------|--------|
| A11Y-01 | High | RESOLVED | guias.html and en/guides.html missing skip-link — added in commit 6d2233d (260429-nn0) | audit-navbar-content-2026-04-29.md:35-43; STATE.md |
| A11Y-02 | Medium | RESOLVED | pesca.html hero section had insufficient WCAG AA contrast — text-shadow + opacity fix | STATE.md 260423-epo commit 1ee5782 |
| A11Y-03 | Medium | UNKNOWN | Axe-core scan results (4 pages × 3 zooms) from 260423-g1g not fully documented — which pages passed/failed | STATE.md 260423-g1g commit 2d7379a |
| A11Y-04 | Low | OPEN | EN pages: mobile menu language switcher absent from hamburger menu — EN mobile users cannot switch to PT via menu | AUDITORIA_EN.md:93-94 |

### GDPR (GDPR)

| ID | Severity | Status | Title | Source |
|----|----------|--------|-------|--------|
| GDPR-01 | High | RESOLVED | en/cookies.html missing nav.js, lang-switcher.js, cookie-consent.js — users trapped without navigation | AUDITORIA_EN_FINAL.md:25-36; AUDITORIA_EN_FINAL_v2.md:43 |
| GDPR-02 | High | RESOLVED | en/guides.html missing cookie-consent.js — consent banner absent, GA4 permanently blocked | AUDITORIA_EN_FINAL.md:61-72; AUDITORIA_EN_FINAL_v2.md:44 |
| GDPR-03 | Medium | OPEN | alerts table: no RLS — user_id/beach_id/threshold exposed; INSERT with arbitrary user_id possible — GDPR violation | audit-rls-2026-04.md:196-203; audit-security-2026-04-29.md:264-268 |
| GDPR-04 | Medium | OPEN | favorites table: no RLS — behavior/preference data of all Pro users exposed | audit-rls-2026-04.md:168-174; audit-security-2026-04-29.md:275-279 |

### LemonSqueezy (LS)

| ID | Severity | Status | Title | Source |
|----|----------|--------|-------|--------|
| LS-01 | Critical | UNKNOWN | ls-webhook deployed without --no-verify-jwt — all deliveries returned 401, Pro activation broken (may be fixed, needs verification) | lemonsqueezy-config-audit-2026-04-27.md:54-84 |
| LS-02 | Critical | BLOCKED EXTERNAL | LemonSqueezy identity verification REJECTED — live mode and payouts blocked. Not a technical bug — commercial blocker pending LS support response or direct Stripe migration | lemonsqueezy-config-audit-2026-04-27.md:130-138, 200-206 |
| LS-03 | High | OPEN | No webhook configured for live mode — Pro activation will not work in production after live mode activated | lemonsqueezy-config-audit-2026-04-27.md:195-196 |
| LS-04 | High | OPEN | subscription_cancelled and subscription_expired events not subscribed in LS webhook — code handles them but LS never sends them | lemonsqueezy-config-audit-2026-04-27.md:50-51, 197 |
| LS-05 | Medium | OPEN | No LemonSqueezy API keys created (neither test nor live) — no server-side API calls or debug capability | lemonsqueezy-config-audit-2026-04-27.md:119-123, 207 |
| LS-06 | Medium | OPEN | checkout success_url set only via client-side JS query param — no fallback at LS product level | lemonsqueezy-config-audit-2026-04-27.md:106-113, 197 |
| LS-07 | Low | UNKNOWN | MAX_ATTEMPTS in conta.html for Pro polling set to 6 (12s) — may be too short for slow webhook delivery; recommended increase to 10 | lemonsqueezy-config-audit-2026-04-27.md:241 |

### Bilingual EN/PT (EN)

| ID | Severity | Status | Title | Source |
|----|----------|--------|-------|--------|
| EN-01 | Critical | RESOLVED | en/guides.html did not load nav.js — navbar overflowed at 375px, no mobile menu | AUDITORIA_EN.md:323-336; STATE.md 260427-p01 commit dfd589c |
| EN-02 | High | RESOLVED | en/surfing-portugal.html: PT lang switcher pointed to /en/surf.html instead of /surf.html | AUDITORIA_EN_FINAL.md:41-49; AUDITORIA_EN_FINAL_v2.md:42 |
| EN-03 | High | RESOLVED | 37+ pages: 11 CRITICAL + 25 MAJOR EN/PT parity divergences — fixed in 260424-fjz | STATE.md 260424-fjz commit bbac31c |
| EN-04 | Medium | UNKNOWN | lang-switcher failure on 24 pages (systemic) — flagged in 260424-gxf; partially addressed in 260427 sprints; full re-audit not confirmed | STATE.md 260424-gxf commit 0469f60 |
| EN-05 | Medium | UNKNOWN | 3 EN 404s detected in 260424-gxf — not observed in subsequent 8-page audit; unclear if resolved | AUDITORIA_EN.md:465-467; STATE.md 260424-gxf |
| EN-06 | Low | RESOLVED | nav.js loaded with defer on EN pages — skill rule "no defer" was outdated, confirmed functional by 20/20 nav-i18n tests | AUDITORIA_EN_FINAL.md:91-93; AUDITORIA_EN_FINAL_v2.md:49-51 |
| EN-07 | Info | RESOLVED | docs/KNOWN-ISSUES-EN.md created to document nav.js PT-header debt on EN pages | STATE.md 260504-fup commit b63020a |

---

## Top Priority OPEN Issues

(Critical + High with status OPEN, sorted by severity then ID)

| ID | Severity | Title | Source |
|----|----------|-------|--------|
| SEC-03 | High | ls-webhook fail-open: missing WEBHOOK_SECRET → any unauthenticated POST activates Pro | audit-security-2026-04-29.md:150-193 |
| SEC-04 | High | conta.html: free user sees Pro UI indefinitely via ?activated=1 — no timeout redirect | audit-security-2026-04-29.md:199-227 |
| LS-03 | High | No live mode webhook configured — Pro activation broken in production | lemonsqueezy-config-audit-2026-04-27.md:195-196 |
| LS-04 | High | subscription_cancelled + subscription_expired not subscribed in LS — cancellation not processed | lemonsqueezy-config-audit-2026-04-27.md:50-51 |
| BUG-VIS-01 | High | surf.html newsletter form: Turnstile widget squeezes email input — email input width reduced, breaking form UX | session 04/05/2026 |
| SEC-05 | Medium | HSTS absent from _headers — SSL-strip possible on untrusted networks | audit-security-2026-04-29.md:234-255 |
| SEC-06 | Medium | ingest-tides, ingest-waves, check-alerts accept unauthenticated invocation | audit-security-2026-04-29.md:261-295 |
| SEC-07 | Medium | CSP has unsafe-inline + unsafe-eval — weakened XSS protection | audit-security-2026-04-29.md:299-317 |
| GDPR-03 | Medium | alerts table no RLS — GDPR violation (user PII exposed) | audit-rls-2026-04.md:196-203 |
| GDPR-04 | Medium | favorites table no RLS — GDPR violation (behavior data exposed) | audit-rls-2026-04.md:168-174 |
| LS-05 | Medium | No LemonSqueezy API keys — no server-side debug or API calls possible | lemonsqueezy-config-audit-2026-04-27.md:119-123 |
| LS-06 | Medium | checkout success_url only in client-side JS — no product-level fallback in LS | lemonsqueezy-config-audit-2026-04-27.md:106-113 |
| BUG-VIS-02 | Medium | Hero CTAs ("Explorar Spots", "Planear Escapada de Surf") fall below viewport at 100% browser zoom on 1080p and 1440p | session 04/05/2026 |

---

## UNKNOWN — Needs Manual Inspection

(All UNKNOWN rows grouped by category, with verification command or manual step)

| ID | Title | How to Verify |
|----|-------|---------------|
| SEC-10 | Email enumeration via password-reset timing | `curl -s -w "%{time_total}" -o /dev/null -X POST [supabase-auth-reset]` with known and unknown emails; compare times |
| SEC-11 | Parceiro accessing plan_requests with regiao IS NULL | In Supabase Dashboard SQL: `SELECT * FROM plan_requests WHERE regiao IS NULL;` — check if RLS policy has bypass for NULLs |
| RLS-03 | beaches table: no RLS in code | Supabase Dashboard → Table Editor → beaches → RLS tab. Confirm RLS enabled and write policies exist |
| RLS-04 | profiles table: no RLS in code | Supabase Dashboard → Table Editor → profiles → RLS tab. Confirm SELECT policy for own row |
| RLS-05 | reference_ports: no RLS in code | Supabase Dashboard → Table Editor → reference_ports → RLS tab. Low priority |
| RLS-06 | tides/waves RLS in _scripts/ not migrations/ | Supabase Dashboard → Table Editor → tides/waves → RLS tab. Confirm policies applied |
| RLS-07 | partners: no INSERT for authenticated non-admin | Check onboarding flow: does a partner ever INSERT directly to partners table? If yes, policy gap is blocking |
| RLS-08 | plan_requests + partner_leads: no DB-level validation | Check if frontend validates email/regiao before insert. Consider adding CHECK constraints in migration |
| SEO-03 | Title tag duplicates across subpages | `grep -rn '<title>' Portal-turismo-site/*.html Portal-turismo-site/en/*.html \| sort \| uniq -d` |
| BRAND-03 | Filter chips bar: no scroll indicator at 375px | Open https://portalturismoportugal.com/en/beaches.html at 375px in DevTools; scroll chips-bar and confirm no gradient fade indicator |
| A11Y-03 | axe-core scan results from 260423-g1g not documented | Run `npx playwright test tests/contrast-audit.spec.mjs` and review axe-report.json |
| CONTENT-04 | /sobre.html minimal content, /en/about.html parity | Open both pages, compare word count and content sections |
| BUG-07 | EN nav: some pages may still have absolute paths without /en/ prefix | `grep -rn 'href="/beaches.html\|href="/surf.html\|href="/pesca.html' Portal-turismo-site/en/` |
| BUG-08 | /onde-ficar-*.html booking links href="#" — no JS fallback | Open any onde-ficar page with JS disabled; confirm booking link has useful fallback |
| EN-04 | lang-switcher failure on 24 pages — full re-audit not confirmed | Run `npx playwright test tests/navigation.spec.ts` and manually check 24 pages identified in 260424-gxf |
| EN-05 | 3 EN 404s from 260424-gxf — status unclear | Check STATE.md 260424-gxf audit commit 0469f60 report for which 3 pages; `curl -I https://portalturismoportugal.com/en/[page]` |
| LS-01 | ls-webhook 401 bug — may have been fixed after check-alerts deploy | Check Supabase Dashboard → Edge Functions → ls-webhook → Logs for recent delivery success; or trigger a test webhook resend |
| LS-07 | MAX_ATTEMPTS for Pro polling in conta.html set to 6 (12s) | `grep -n "MAX_ATTEMPTS" Portal-turismo-site/conta.html` — verify current value; test slow webhook scenario |
| PERF-03 | Core Web Vitals not re-validated after performance fixes | Run Lighthouse on https://portalturismoportugal.com for mobile; compare to pre-fix 13-issue report |

---

## Source Documents Index

| Doc | Path | Lines | Category Focus |
|-----|------|-------|----------------|
| Audit EN (canonical) | AUDITORIA_EN.md | 496 | EN/BRAND |
| Audit EN Final | AUDITORIA_EN_FINAL.md | 110 | EN/GDPR |
| Audit EN Final v2 | AUDITORIA_EN_FINAL_v2.md | 66 | EN |
| Navbar Content | docs/audit-navbar-content-2026-04-29.md | 78 | CONTENT/A11Y |
| RLS | docs/audit-rls-2026-04.md | 392 | RLS/SEC |
| Security | docs/audit-security-2026-04-29.md | 463 | SEC/GDPR |
| Unsplash | docs/audit-unsplash-2026-04.md | 807 | CONTENT |
| Bugs | docs/BUG_AUDIT.md | 636 | BUG/SEO/EN |
| LemonSqueezy | docs/audits/lemonsqueezy-config-audit-2026-04-27.md | 244 | LS |

---

## Methodology

- Issues extracted verbatim from source docs; no inventions.
- Severity mapped from source language to {Critical, High, Medium, Low, Info}: P0/Critico → Critical; P1/Alto/High → High; P2/Medio/Medium → Medium; P3/Baixo/Low → Low; INFO/Nota → Info.
- Status RESOLVED requires inline code evidence (commit hash from STATE.md or grep hit). Default UNKNOWN.
- Cross-doc duplicates merged into one ID with all sources cited.
- The 3 `AUDITORIA_EN_*` files at project root were superseded by this document and deleted (see git log).
- STATE.md Quick Tasks Completed table used as primary evidence for RESOLVED status.

## Fase 6C-A — Entregue 2026-05-06

Fase 6C-A entregue: card persuasivo homepage + páginas /escondidas placeholder. Headline `As 10 praias que ninguém no Booking encontra`. Foto Wikimedia Praia da Ursa hardcoded (futuro: migrar para Storage). 85 ficheiros restantes com Unsplash são fase 6C-C (não hoje).

## Fase 6C-B — Entregue 2026-05-06

Redesign editorial cinemático do hero-secondary (skill frontend-design invocada). Layout 2-coluna 60/40 com número "10" como âncora visual (Fraunces 300, clamp 108px–210px). Foto Praia da Ursa migrada de Wikimedia (CSP block) para Supabase Storage (UUID a0529d77-b688-4293-ba11-8f023a69e4cf). Background navy sólido `#07152A` em vez de fullscreen photo overlay. Animação fade-in-up staggered via IntersectionObserver (threshold 0.25). Fraunces + IBM Plex Mono carregadas via Google Fonts. CSS cache `?v=20260506-6cb`. CSP problem do 6C-A resolvido — imagem agora servida a partir de supabase.co (já na allowlist).

## Fase 6C-C — Entregue 2026-05-06

Fase 6C-C entregue: refinamentos AI-modern aplicados ao hero-secondary (gradient text no número, breathing animation 6s, divider com gradient fade, foto com border-radius assimétrico, background com SVG noise overlay + gradient diagonal, cursor-reactive parallax via requestAnimationFrame). Acessibilidade: prefers-reduced-motion respeitado, hover:none detectado para mobile. CSS cache bumped para `?v=20260506-6cc`. Ficheiros modificados: `css/style.css`, `index.html`, `en/index.html`, `CLAUDE.md`, `docs/AUDIT-MASTER.md`.
