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

When introducing a new Quick Task, scan this watchlist for overlap and re-test those scenarios.

## Important note
This repository is optimized by doing the smallest commercially meaningful next step, not by broad exploration.
