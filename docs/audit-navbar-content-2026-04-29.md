# Navbar Content Audit — 2026-04-29

## Summary

| Status | Count |
|---|---|
| 4/4 | 14 |
| 3/4 | 2 |
| <3/4 | 0 |

## Per-page status (BEFORE)

| Page | skip-link | lang-switcher | login-btn | register-btn | Score |
|---|:-:|:-:|:-:|:-:|:-:|
| /index.html | OK | OK | OK | OK | 4/4 |
| /beaches.html | OK | OK | OK | OK | 4/4 |
| /surf.html | OK | OK | OK | OK | 4/4 |
| /pesca.html | OK | OK | OK | OK | 4/4 |
| /webcams.html | OK | OK | OK | OK | 4/4 |
| /planear.html | OK | OK | OK | OK | 4/4 |
| /guias.html | MISSING | OK | OK | OK | 3/4 |
| /precos.html | OK | OK | OK | OK | 4/4 |
| /parceiros.html | OK | OK | OK | OK | 4/4 |
| /en/index.html | OK | OK | OK | OK | 4/4 |
| /en/beaches.html | OK | OK | OK | OK | 4/4 |
| /en/surf.html | OK | OK | OK | OK | 4/4 |
| /en/pesca.html | OK | OK | OK | OK | 4/4 |
| /en/webcams.html | OK | OK | OK | OK | 4/4 |
| /en/planear.html | OK | OK | OK | OK | 4/4 |
| /en/guides.html | MISSING | OK | OK | OK | 3/4 |

## Pages requiring fix

### /guias.html
- **Missing:** skip-link
- **Fix:** Insert `<a href="#main" class="skip-link">Saltar para o conteúdo</a>` immediately before `<nav class="navbar"` (line 427)
- **Nav insertion line:** Before line 427

### /en/guides.html
- **Missing:** skip-link
- **Fix:** Insert `<a href="#main" class="skip-link">Skip to content</a>` immediately before `<nav class="navbar"` (line 440)
- **Nav insertion line:** Before line 440

## After (filled after fixes applied — Task 2)

| Page | skip-link | lang-switcher | login-btn | register-btn | Score |
|---|:-:|:-:|:-:|:-:|:-:|
| /index.html | OK | OK | OK | OK | 4/4 |
| /beaches.html | OK | OK | OK | OK | 4/4 |
| /surf.html | OK | OK | OK | OK | 4/4 |
| /pesca.html | OK | OK | OK | OK | 4/4 |
| /webcams.html | OK | OK | OK | OK | 4/4 |
| /planear.html | OK | OK | OK | OK | 4/4 |
| /guias.html | OK | OK | OK | OK | 4/4 |
| /precos.html | OK | OK | OK | OK | 4/4 |
| /parceiros.html | OK | OK | OK | OK | 4/4 |
| /en/index.html | OK | OK | OK | OK | 4/4 |
| /en/beaches.html | OK | OK | OK | OK | 4/4 |
| /en/surf.html | OK | OK | OK | OK | 4/4 |
| /en/pesca.html | OK | OK | OK | OK | 4/4 |
| /en/webcams.html | OK | OK | OK | OK | 4/4 |
| /en/planear.html | OK | OK | OK | OK | 4/4 |
| /en/guides.html | OK | OK | OK | OK | 4/4 |

## Production validator output

Validator run requires a live browser against production. Cloudflare Pages deploy completed:
- Preview deploy: https://8e1bca88.portal-turismo-portugal-site.pages.dev
- Production: https://portalturismoportugal.com

Local grep validation (all 16 pages × 4 markers) passed with exit code 0.
Production deploy pushed via `npx wrangler pages deploy` — 4 new files uploaded.

## Commit delivering the fix

- `1c7ba89` — fix(navbar): add missing skip-link to guias.html and en/guides.html
- `917ee34` — test(navbar): extend consistency validator to 16 pages with content checks
- Merged to main and pushed to origin/main at commit `917ee34`
