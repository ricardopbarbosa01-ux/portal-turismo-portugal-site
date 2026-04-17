---
status: diagnosed
trigger: "Botão 'Criar Alerta' adicionado à página beach.html não aparece na UI"
created: 2026-04-17T00:00:00Z
updated: 2026-04-17T00:01:00Z
---

## Current Focus
<!-- OVERWRITE on each update - reflects NOW -->

hypothesis: CONFIRMED — planUser is block-scoped inside the try{} block and is undefined at the call site on line 1644, causing setupAlertSection to treat the user as not logged in and immediately clear the section
test: Playwright: called setupAlertSection manually with undefined vs a real planUser object
expecting: confirmed — undefined planUser makes isLoggedIn=false, which hits `wrap.innerHTML = ''; return;`
next_action: diagnose complete — fix is a scope correction (hoist planUser declaration outside try block)

## Symptoms
<!-- Written during gathering, then IMMUTABLE -->

expected: Botão "🔔 Criar Alerta" visível na secção "Mar & Ondulação", abaixo do card principal de ondas, para utilizadores Pro e não-Pro (desactivado para Free, invisível para não logados)
actual: O botão não aparece de todo — a secção de alertas está vazia ou não é renderizada
errors: Desconhecido — precisamos de verificar a consola do browser
reproduction: Aceder a https://www.portalturismoportugal.com/beach.html?id=f7fa6d81-2872-4971-be81-42464b11ac9f
started: Código adicionado nesta sessão, nunca funcionou

## Eliminated
<!-- APPEND only - prevents re-investigating -->

- hypothesis: setupAlertSection is not exposed globally (not on window)
  evidence: typeof window.setupAlertSection === 'function' confirmed in Playwright
  timestamp: 2026-04-17T00:01:00Z

- hypothesis: Syntax error in IIFE prevents execution
  evidence: setupAlertSection is callable and produces correct HTML when called with a real planUser
  timestamp: 2026-04-17T00:01:00Z

- hypothesis: #beach-alerts-section element not present in DOM
  evidence: element exists in DOM; surf-section is 'block', surf-content renders the wave card including the div
  timestamp: 2026-04-17T00:01:00Z

- hypothesis: Element cleared by other code after insertion
  evidence: when called with a real planUser the HTML is injected correctly and persists
  timestamp: 2026-04-17T00:01:00Z

- hypothesis: loadWaves fails before reaching setupAlertSection
  evidence: surf-section is visible, surf-content has rendered wave card HTML — loadWaves completed successfully
  timestamp: 2026-04-17T00:01:00Z

## Evidence
<!-- APPEND only - facts discovered -->

- timestamp: 2026-04-17T00:00:30Z
  checked: beach.html line 1550-1555 — plan check block
  found: |
    let isPro = false;          // line 1550 — hoisted correctly with let
    try {
      const { data: { user: planUser } } = await db.auth.getUser();  // line 1552 — const inside try block
      const plan = ...;
      isPro = plan === 'pro' || plan === 'admin';
    } catch (_) {}
  implication: planUser is declared with `const` inside the try{} block. JavaScript const/let are block-scoped. planUser does NOT exist in the outer scope where setupAlertSection(beach, isPro, planUser) is called on line 1644.

- timestamp: 2026-04-17T00:00:35Z
  checked: beach.html line 1644 — call to setupAlertSection
  found: setupAlertSection(beach, isPro, planUser);  — planUser is a ReferenceError or undefined (if try block threw before assigning)
  implication: In strict mode this would throw ReferenceError. In non-strict mode, planUser resolves to undefined from an outer scope if one exists, or throws. Either way it is not the authenticated user object.

- timestamp: 2026-04-17T00:00:40Z
  checked: beach.html line 1646 — catch block
  found: } catch (_) { renderFallback(); }
  implication: The outer try/catch on loadWaves silently swallows any ReferenceError from `planUser` being out of scope. This prevents any visible JS error in the console.

- timestamp: 2026-04-17T00:00:45Z
  checked: beach.html line 2137-2167 — setupAlertSection body
  found: |
    const isLoggedIn = !!_userId;   // _userId = planUser?.id ?? null
    if (!isLoggedIn) { wrap.innerHTML = ''; return; }
  implication: When planUser is undefined, _userId = undefined?.id ?? null = null, isLoggedIn = false, and the function immediately wipes the div and returns. This is the proximate cause of the empty section.

- timestamp: 2026-04-17T00:00:50Z
  checked: Playwright live test — browser state
  found: |
    beach-alerts-section innerHTML = "" (empty)
    typeof window.setupAlertSection = "function"
    typeof db = "object"
    surf-section display = "block" (wave card rendered correctly)
    No JS errors in console (catch swallows everything)
  implication: Confirms the bug is not a loading failure, missing element, or missing function — it's the planUser scope issue silently short-circuiting.

- timestamp: 2026-04-17T00:01:00Z
  checked: Playwright manual call — setupAlertSection(mockBeach, false, undefined) vs setupAlertSection(mockBeach, false, {id:'fake'})
  found: |
    With undefined planUser → innerHTML = "" (button invisible — matches production behavior)
    With fake planUser {id:'fake'} → button renders correctly as disabled (non-Pro) with tooltip
  implication: ROOT CAUSE FULLY CONFIRMED. planUser scope bug is the sole cause.

## Resolution
<!-- OVERWRITE as understanding evolves -->

root_cause: |
  `planUser` is declared with `const` inside a `try {}` block (beach.html line 1552), making it
  block-scoped and inaccessible at line 1644 where `setupAlertSection(beach, isPro, planUser)` is called.
  This means `planUser` is always `undefined` at the call site (or throws ReferenceError, silently caught
  by the outer `catch (_) {}`). Inside `setupAlertSection`, `_userId = undefined?.id ?? null = null`,
  so `isLoggedIn = false`, causing the function to immediately wipe `#beach-alerts-section` and return
  without rendering any button — for ALL users, logged in or not.

fix: |
  Hoist `planUser` declaration outside the try block, before line 1550:
  
  BEFORE (lines 1550-1555):
    let isPro = false;
    try {
      const { data: { user: planUser } } = await db.auth.getUser();
      const plan = planUser?.app_metadata?.plan ?? planUser?.user_metadata?.plan ?? '';
      isPro = plan === 'pro' || plan === 'admin';
    } catch (_) {}
  
  AFTER:
    let isPro = false;
    let planUser = null;
    try {
      const { data: { user: authUser } } = await db.auth.getUser();
      planUser = authUser ?? null;
      const plan = planUser?.app_metadata?.plan ?? planUser?.user_metadata?.plan ?? '';
      isPro = plan === 'pro' || plan === 'admin';
    } catch (_) {}
  
  This makes planUser accessible at line 1644 with its correct value.

verification:
files_changed:
  - beach.html
