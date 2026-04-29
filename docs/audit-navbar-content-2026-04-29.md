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

To be added after deploy in Task 3.

## Commit delivering the fix

To be added after Task 2 commit.
