---
phase: quick
plan: 260420-j7h
subsystem: SEO
tags: [sitemap, 404, hreflang, seo]
key-files:
  created:
    - 404.html
  modified:
    - sitemap.xml
decisions:
  - "No hreflang changes needed on guias.html — tags already correct (pt + x-default only)"
  - "404.html uses noindex/nofollow — correct for error pages, should not be indexed"
metrics:
  duration: "~10 minutes"
  completed: "2026-04-20"
  tasks: 3
  files_changed: 2
---

# Quick Plan 260420-j7h: SEO — Sitemap, 404 page, hreflang verification

**One-liner:** Added 6 guias URLs to sitemap, created branded 404 page with noindex, confirmed guias.html hreflang is correct.

## Tasks Completed

| # | Task | Status | Commit |
|---|------|--------|--------|
| 1 | Add 6 guias URLs to sitemap.xml | Done | `9d6fed5` |
| 2 | Create branded 404.html page | Done | `a165c0c` |
| 3 | Verify hreflang on guias.html | Done (no changes needed) | — |

## Files Changed

### sitemap.xml
- Added `<!-- ── Guias ── -->` comment block after the "SEO content pages" section (line 103)
- Inserted 6 new `<url>` entries:
  - `https://portalturismoportugal.com/guias.html`
  - `https://portalturismoportugal.com/guias/melhores-praias-algarve.html`
  - `https://portalturismoportugal.com/guias/pesca-portugal.html`
  - `https://portalturismoportugal.com/guias/praias-perto-lisboa.html`
  - `https://portalturismoportugal.com/guias/quando-visitar-portugal.html`
  - `https://portalturismoportugal.com/guias/surf-portugal-iniciantes.html`
- All entries: `lastmod 2026-04-18`, `changefreq monthly`, `priority 0.8`

### 404.html (new file)
- Full branded page matching site visual style (navy gradient hero, Inter/Bodoni Moda fonts)
- `<meta name="robots" content="noindex, nofollow">` — correct for error pages
- `<link rel="canonical" href="https://portalturismoportugal.com/404.html">`
- No hreflang tags — correct for error pages
- Large "404" visual element in Bodoni Moda gold (opacity 0.25) above the H1
- H1: "Página não encontrada"
- P: "A página que procura não existe ou foi movida."
- Two CTA buttons: "Voltar à página inicial" (`href="/"`) and "Explorar praias" (`href="/beaches.html"`)
- Exact nav and footer structure copied from contact.html
- GA4 Consent Mode v2 snippet, nav.js, config.js, cookie-consent.js loaded

## Task 3 — hreflang Verification (no changes)

Confirmed `guias.html` hreflang tags are correct:
- `hreflang="pt"` pointing to `https://portalturismoportugal.com/guias.html` — present
- `hreflang="x-default"` pointing to `https://portalturismoportugal.com/guias.html` — present
- `hreflang="en"` — NOT present (correct: EN version does not exist)

No file changes were made. No commit needed.

## Deviations from Plan

None — plan executed exactly as written.

## Deploy

- **Deploy URL:** https://16893662.portal-turismo-portugal-site.pages.dev
- **Production:** https://portalturismoportugal.com

## Self-Check

- [x] `sitemap.xml` contains exactly 6 "guias" occurrences (verified via grep count)
- [x] `404.html` exists and passes automated check: noindex, 404, Página, beaches.html, cookie-consent
- [x] `guias.html` hreflang verification PASS — no bogus EN hreflang
- [x] Commit `9d6fed5` exists — sitemap
- [x] Commit `a165c0c` exists — 404.html
- [x] Deploy successful at https://16893662.portal-turismo-portugal-site.pages.dev

## Self-Check: PASSED
