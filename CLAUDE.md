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

When introducing a new Quick Task, scan this watchlist for overlap and re-test those scenarios.

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
