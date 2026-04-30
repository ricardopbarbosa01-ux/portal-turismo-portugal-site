---
phase: quick-260430-h2h
plan: "01"
subsystem: content/pages
tags: [manifesto, conversion, b2b, partner-funnel, godin]
dependency_graph:
  requires: []
  provides: [porque-pth.html]
  affects: [footer-links, partner-funnel, consumer-trust]
tech_stack:
  added: []
  patterns: [sobre.html-structure, inline-style-block, skip-link, breadcrumb]
key_files:
  created:
    - porque-pth.html
  modified: []
decisions:
  - "Used /og-image.png for OG/Twitter images (not Unsplash) — corrects sobre.html bug"
  - "config.js loaded with defer attribute — corrects sobre.html bug"
  - "EN language switcher points to /en/porque-pth.html (consistent with site pattern)"
  - "Omitted .values-grid, .value-card, .stats-strip, .stat-* selectors from inline style block"
metrics:
  duration: "~10 minutes"
  completed: "2026-04-30"
  tasks_completed: 1
  tasks_total: 1
  files_changed: 1
---

# Quick 260430-h2h: Create porque-pth.html — Manifesto Page Summary

## One-liner

Godin-style manifesto page exposing OTA commission model and positioning PTH as verified editorial alternative, wired to partner CTA and homepage final action.

## What Was Built

Created `porque-pth.html` in the project root — a new standalone manifesto page implementing a 5-section Godin reveal sequence:

1. **A Pergunta** — Hotels ranked by commission paid, not quality
2. **A Dúvida** — The math: 15-25% commissions degrade guest experience
3. **O Mecanismo** — Small independents lose the auction to chains
4. **A Inversão** — PTH's fixed-fee verification model with Bodoni blockquote
5. **Para parceiros** — B2B pitch with CTA to parceiros.html
6. **Chamada para acção** — Final consumer CTA to homepage

All copy is verbatim from the pre-approved plan spec. No paraphrasing applied.

## Automated Verification

All 14 checks from the plan's `<verify>` block printed `OK`:
- og:image and twitter:image both point to `/og-image.png` (not Unsplash)
- config.js script tag has `defer` attribute
- canonical and og:url both match `https://portalturismoportugal.com/porque-pth.html`
- All 5 narrative sections + CTA present with correct `aria-label` values
- No Unsplash URLs anywhere in the file
- No `.values-grid` or `.stats-strip` CSS selectors in `<style>` block

## Deviations from Plan

None — plan executed exactly as written.

Two deliberate corrections applied (documented in plan as bugs to fix, not deviations):
- og:image/twitter:image use `/og-image.png` (sobre.html incorrectly used Unsplash URL)
- config.js loads with `defer` (sobre.html was missing this attribute)

## Known Stubs

None. Page has no data-driven sections — all content is static editorial copy.

## Self-Check

- [x] `C:\Users\Powerpc\Portal-turismo-site\porque-pth.html` exists (created by Write tool)
- [x] All 14 automated checks passed (node verification script exited 0)
- [x] No existing files modified
- [x] No commit created (per constraints — human reviews first)
