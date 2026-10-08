# Auditoria funcional — portalturismoportugal.com (08/10/2026)

You are a QA tester checking the LIVE site https://www.portalturismoportugal.com as a real visitor would. Goal: find problems real users can hit (broken flows, errors, wrong links, layout that breaks on phone, wrong/missing text, links to partners that don't earn money, dead ends). You only TEST and REPORT — you never change the site or any repository file.

## Hard rules
- READ-ONLY. Never submit any form that creates data (contact, newsletter, alerts, leads, sign-up, login, password reset, webcam suggestion, planner with email). You may fill fields and test client-side validation, but do NOT press the final submit/send. Never buy anything; for checkout links only check where they point (href) or open the page without paying.
- Use Playwright (Python) in this container: `from playwright.async_api import async_playwright`; Chromium is preinstalled (do NOT run `playwright install`). Always `browser.new_context(viewport=..., service_workers='block')`. Test 1280x900 (desktop) and 375x812 (phone); use 320x640 for key screens. Wait for dynamic content (6–10 s) — many sections load from Supabase and Open-Meteo.
- Accept/close the cookie banner when it gets in the way, but also note if it blocks key actions on phone.
- Be efficient: write one Python script per page group that collects everything, then look at screenshots for the visual checks. Keep screenshots in /mnt/user-data/outputs/audit/shots/<your-area>/.
- Don't hammer the site: sequential page loads, no load testing.

## What to collect on every page you test
- `pageerror` exceptions and console errors (filter noise like favicon), CSP violations ("Content Security Policy" in console), failed requests (status >= 400, or requestfailed) — list URL + status.
- Broken images (img.complete && naturalWidth===0), horizontal scroll (documentElement.scrollWidth > innerWidth), elements cut off or overlapping on 375/320, tap targets hidden under the fixed bottom bar or cookie banner.
- Links: every <a href> on the page — internal ones must not 404 (HEAD/GET them, dedupe, max ~150 per area), external partner links must carry the earning IDs: Stay22 `aid=kaptarstudio` (or booking.com links that the Stay22 script rewrites — check the href after a mousedown), GetYourGuide `partner_id=0WTBHZE`, DiscoverCars `a_aid=portalturismoportugal`, BookSurfCamps `aid=11861`. A partner link without its ID = lost revenue (report it). MEO webcam links are link-only (beachcam.meo.pt) and that is intended.
- Language: on /en/ pages any Portuguese text visible to the user is a bug (and English on PT pages). Note mixed-language labels.
- Content sanity: placeholder text, "undefined", "null", "NaN", "[object Object]", empty sections, counters that don't add up, "Loading…" that never resolves, dates in the past presented as upcoming, promises of features that don't exist.
- Interactions: every button/filter/tab/accordion/menu on the page must do something visible; back button behaviour; deep links (query params) that should pre-select something.

## Already known (mark "conhecido" if you see them, don't spend time on them)
- `supabase is not defined` on static pages praias/<slug>/; `db is not defined` on parceiro.html and reset.html; /en/404 requests /en/js/nav.js (404); CLS on /guias; surf guide photo (Unsplash photo-1502680390548) 404; region banner never appears on /en/beaches; visible brand still says "Portugal Travel Hub" in header/footer; Open-Meteo attribution missing in hero; home preloader 1.4–2.2 s; files public by mistake (PNG of other clients in site root, /social-media/, /tools/).

## Report
Write /mnt/user-data/outputs/audit/<your-area>.md in Portuguese (pt-PT), with:
1. A table of findings: id | severidade | página/URL | ecrã (1280/375/320) | o que o utilizador vê | como reproduzir | evidência (screenshot path / console line / status code).
   Severity: **P0** = bloqueia uma tarefa principal ou perde receita (link de parceiro sem ID, checkout partido, página principal com erro, conteúdo errado/perigoso); **P1** = problema visível que confunde ou afasta o utilizador; **P2** = polimento.
2. A short list of what you tested and found OK (so we know coverage).
Only report what you actually reproduced. No speculation, no generic advice. If unsure, say "a confirmar" and why.
Final message: the findings table only (id | sev | URL | problema curto), plus the path of your report.
