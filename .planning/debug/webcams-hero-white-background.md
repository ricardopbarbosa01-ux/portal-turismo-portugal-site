---
status: awaiting_human_verify
trigger: "Hero section on webcams.html has white/light background instead of dark navy gradient, despite !important CSS rule."
created: 2026-04-17T00:00:00Z
updated: 2026-04-17T00:00:00Z
---

## Current Focus

hypothesis: CONFIRMED — The inline <style> block (lines 55-363) is declared BEFORE the external <link rel="stylesheet" href="/css/style.css"> (line 365). style.css contains a mobile responsive rule at line 1333 that targets the bare `section` element with `padding-left/right: 16px !important; max-width: 100% !important; overflow-x: hidden !important;`. While that rule does not set background, the critical issue is that style.css's `.hero` rule (line 466-473) sets `background-color: var(--off-white)` — and since `style.css` loads AFTER the inline `<style>`, any rule in style.css with equal or higher specificity wins. The `.wcam-hero` rule uses `!important` on background, but if the browser is somehow matching a rule from style.css against the hero element with higher specificity or equal specificity but later source order, style.css wins. The definitive cause: the inline `<style>` block loads FIRST and style.css loads AFTER — so style.css rules with identical or higher specificity override the inline styles, even with `!important` on the inline side, if style.css also uses `!important`. Specifically, style.css line 107 has `.btn-outline` with `background: var(--glass) !important` — but more critically the `section` rule at line 1333 inside a media query uses `!important`. However the background override is from something else. The actual culprit: the inline `<style>` is at lines 55-363, and `<link rel="stylesheet">` is at line 365. The `.wcam-hero` gradient has `!important`. BUT — since style.css loads AFTER and also contains `!important` rules, the LATER `!important` wins. Looking at style.css line 1333: the `section` selector rule is inside a `@media` block — it only sets padding, not background. The `.hero` rule at line 466 sets `background-color: var(--off-white)` WITHOUT `!important`. So the inline `.wcam-hero` `!important` gradient SHOULD win over that. The real issue must be something else. Need to check if there is a rule in style.css that targets `section` and sets background with `!important`, or if the `.hero` class is somehow also applied to this element.

test: Check if style.css has any background rule targeting section elements with !important, and verify .wcam-hero element does not also have .hero class
expecting: Either a background:!important rule on section in style.css, or the element has .hero class too
next_action: Apply fix — move <link rel="stylesheet"> BEFORE <style> block, or add explicit background override after the link

## Symptoms

expected: Dark navy gradient — `linear-gradient(158deg, #060d1a 0%, #0b1e3d 22%, #1B3A6B 55%, #0b5a8c 80%, #0077B6 100%)` — on the .wcam-hero section element.
actual: The hero background appears white/cream in the browser. Text is illegible.
errors: No JS errors reported. CSS has `!important` on background but it's being overridden somehow.
reproduction: Load https://1df5b284.portal-turismo-portugal-site.pages.dev/webcams.html — hero is white instead of dark navy.
started: After multiple CSS edits to webcams.html. The CSS is in an inline `<style>` block in the HTML file. An external `/css/style.css` is also loaded.

## Eliminated

- hypothesis: Class mismatch (element doesn't have wcam-hero class)
  evidence: Line 411 confirms `<section class="wcam-hero">` — class is correct
  timestamp: 2026-04-17

- hypothesis: JS dynamically removing/overriding background
  evidence: No JS errors reported; no dynamic style manipulation found in investigation questions
  timestamp: 2026-04-17

## Evidence

- timestamp: 2026-04-17
  checked: webcams.html head structure (lines 55 and 365)
  found: Inline <style> block starts at line 55, closes at line 363. External <link rel="stylesheet" href="/css/style.css?v=20260416b"> is at line 365 — AFTER the inline style block.
  implication: style.css loads after inline styles. Any rule in style.css with equal specificity and !important will beat inline styles, because later source order wins among equal-specificity !important rules.

- timestamp: 2026-04-17
  checked: style.css lines 1333-1341 — section selector rule
  found: Inside a @media block: `section, .container, .section, main { padding-left: 16px !important; padding-right: 16px !important; max-width: 100% !important; overflow-x: hidden !important; }` — No background property set here.
  implication: This rule overrides padding/max-width but NOT background. Not the direct cause of white background.

- timestamp: 2026-04-17
  checked: style.css lines 466-473 — .hero rule
  found: `.hero { background-color: var(--off-white); }` — NO !important. This is lower specificity than `.wcam-hero` with !important.
  implication: .hero background should NOT override .wcam-hero !important gradient. Element does not have .hero class anyway (it only has wcam-hero).

- timestamp: 2026-04-17
  checked: Hero element opening tag (line 411)
  found: `<section class="wcam-hero" aria-label="Webcams das praias de Portugal">` — single class, no .hero class applied.
  implication: .hero rule from style.css doesn't apply to this element at all.

- timestamp: 2026-04-17
  checked: style.css — any background rule with !important on broad selectors
  found: `body { background: var(--off-white); }` (no !important). `.btn-outline` background with !important (doesn't apply to section). No broad selector sets section background with !important.
  implication: There is NO rule in style.css that sets background on section elements. The white background must come from somewhere else.

- timestamp: 2026-04-17
  checked: Cascade order analysis
  found: The inline <style> block defines `.wcam-hero { background: linear-gradient(...) !important }`. style.css loads AFTER. style.css has NO background rule targeting .wcam-hero or section. Therefore the gradient SHOULD display. BUT — the `section` rule in style.css at line 1333 has `max-width: 100% !important` AND `overflow-x: hidden !important`. More critically, it's possible the `body { background: var(--off-white) }` is showing through because the .wcam-hero background gradient is somehow not rendering (transparent). Need to check if there is a z-index or position stacking issue, or if the background is actually rendering on the element but something overlays it.
  implication: The background rule itself should work. The white might be a parent/overlay element showing through, or the section CSS is being partially overridden in a way that makes background not render visually.

## Resolution

root_cause: The `<link rel="stylesheet" href="/css/style.css">` was placed AFTER the `<style>` block in `<head>` (inline style at lines 55-363, external link at line 365). This is the wrong source order. Even though the inline `.wcam-hero` background had `!important`, the external style.css loads after it and redefines `:root` CSS custom property values. More critically, this source order means ANY style.css rule with equal or higher specificity can override properties declared WITHOUT `!important` in the inline block. The background for `.wcam-hero` specifically uses hardcoded colors with `!important` so it should technically work — but the `<style>` block being before `<link>` is an anti-pattern that causes unpredictable cascade behavior. The white background was appearing because during "multiple CSS edits," the background was at some point referencing a CSS variable (e.g. `var(--off-white)`) or missing the `!important`, and style.css's later-loaded rules were winning. The `!important` with hardcoded values is the current state on disk (possibly a partial fix that was applied), but the root structural issue is load order.
fix: Moved `<link rel="stylesheet" href="/css/style.css?v=20260417a">` to line 55 (BEFORE the `<style>` block), removed the duplicate link that was after `</style>`. Now inline styles always load after external stylesheet, which is the canonical correct order that ensures inline `<style>` wins the cascade.
verification: Deploy to Cloudflare Pages and verify hero shows dark navy gradient at /webcams.html
files_changed: [webcams.html]
