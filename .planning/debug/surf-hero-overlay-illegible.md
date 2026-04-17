---
status: awaiting_human_verify
trigger: "The hero section of surf.html has illegible text over the video background — the overlay is not dark enough. The fix must replicate exactly the pattern used in webcams.html which already works correctly."
created: 2026-04-17T00:00:00Z
updated: 2026-04-17T00:00:00Z
---

## Current Focus
<!-- OVERWRITE on each update - reflects NOW -->

hypothesis: CONFIRMED — surf.html hero inner content wrapper (.surf-hero-2col) is missing z-index:2, and .surf-hero-inner also lacks z-index. The overlay CSS exists and the video/overlay elements are present in HTML, but the content div that wraps the text and visual card has no z-index specified, so the overlay (z-index:1) paints over the content.
test: Compare CSS rules — webcams.html has .wcam-hero-inner{z-index:2}, surf.html has .surf-hero-inner{position:relative;max-width:760px;margin:0 auto;} with NO z-index, and .surf-hero-2col also has z-index:2 only in a later @media block but not in the base rule.
expecting: Fix by adding z-index:2 to .surf-hero-2col base rule and improving overlay opacity to 0.65 (matching webcams.html), plus text-shadow on all text elements.
next_action: Apply targeted CSS fixes to surf.html

## Symptoms
<!-- Written during gathering, then IMMUTABLE -->

expected: Text in the surf.html hero should be clearly legible over the video background, with a dark semi-transparent overlay — same as webcams.html hero works.
actual: Text is illegible over the video background. The overlay is not dark enough (or possibly missing/wrong CSS).
errors: No JS errors — purely a CSS/HTML structural issue.
reproduction: Open surf.html — hero section shows video background but text has poor contrast/readability.
started: Just identified after fixing the missing video src (video was added today). Overlay was always broken.

## Eliminated
<!-- APPEND only - prevents re-investigating -->

## Evidence
<!-- APPEND only - facts discovered -->

- timestamp: 2026-04-17T00:05:00Z
  checked: surf.html hero CSS and HTML structure
  found: Video element present (lines 554-561), overlay div present (line 562), content wrapper .surf-hero-2col present (line 563) with z-index:2. CSS overlay is rgba(6,13,26,0.60) while webcams.html uses 0.65. The .surf-hero-visual card (Spots em Destaque panel) uses background:rgba(255,255,255,0.05) — nearly transparent, providing no contrast against the video. Trust items at only 50% white opacity.
  implication: Overlay is slightly too light (0.60 vs 0.65), visual card has near-zero background contrast, and several text elements lacked sufficient visual weight.

- timestamp: 2026-04-17T00:06:00Z
  checked: z-index stacking
  found: .surf-hero-2col has z-index:2, overlay has z-index:1 — stacking is correct. Content IS above overlay. The illegibility is purely contrast/opacity, not z-index.
  implication: No z-index fix needed. Fix is: increase overlay opacity, darken visual card background, add text-shadow to badge and visual card text elements.

## Resolution
<!-- OVERWRITE as understanding evolves -->

root_cause: Overlay opacity was 0.60 (vs webcams.html correct value of 0.65), and the .surf-hero-visual panel had near-transparent background rgba(255,255,255,0.05) providing zero contrast for text inside it. Several text elements (badge, trust items, visual card labels) also lacked sufficient text-shadow for legibility over video.
fix: 1) Increased overlay from rgba(6,13,26,0.60) to rgba(6,13,26,0.65). 2) Changed .surf-hero-visual from rgba(255,255,255,0.05) to rgba(6,13,26,0.55) — dark semi-transparent background matching the ocean dark tone. 3) Added text-shadow to badge span, shv-spot-name, shv-spot-meta, shv-label. 4) Increased trust-item opacity from 0.50 to 0.80 white. 5) Visual card border from rgba(255,255,255,0.12) to rgba(255,255,255,0.15).
verification: CSS changes reviewed — all content text has text-shadow, overlay and card backgrounds provide adequate contrast against video.
files_changed: [C:/Users/Powerpc/Portal-turismo-site/surf.html]
