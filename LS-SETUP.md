# LS-SETUP.md — LemonSqueezy Checkout Configuration

**Store:** `#333117` — portalturismoportugal  
**Domain:** `https://portalturismoportugal.com`  
**Last updated:** 2026-05-04

This document is the single source of truth for configuring and maintaining
the LemonSqueezy checkout flow for the Portugal Travel Hub Pro subscription.

---

## Table of Contents

1. [Current checkout URLs (before)](#1-current-checkout-urls-before)
2. [Target checkout URLs (after)](#2-target-checkout-urls-after)
3. [Exact before/after diffs](#3-exact-beforeafter-diffs)
4. [LemonSqueezy Dashboard — step-by-step](#4-lemonsqueezy-dashboard--step-by-step)
5. [Deploy commands](#5-deploy-commands)
6. [Validation checklist](#6-validation-checklist)
7. [Rollback plan](#7-rollback-plan)

---

## 1. Current checkout URLs (before)

These are the URLs currently live in both `precos.html` and `en/precos.html`.

### JavaScript object `LS_CHECKOUT` (lines 1240-1243 of `precos.html`)

```
pro_monthly: 'https://portalturismoportugal.lemonsqueezy.com/checkout/buy/2d56d759-3e65-46cb-9210-ea7c0fce2cb3?enabled=1475549&checkout[success_url]=https%3A%2F%2Fportalturismoportugal.com%2Fconta.html%3Factivated%3D1'

pro_annual:  'https://portalturismoportugal.lemonsqueezy.com/checkout/buy/5cc5346d-1dfa-4cdf-9632-45effbf8d943?checkout[success_url]=https%3A%2F%2Fportalturismoportugal.com%2Fconta.html%3Factivated%3D1'
```

### HTML fallback CTA href (line 795 of `precos.html`, line 791 of `en/precos.html`)

```
login.html?redirect=https%3A%2F%2Fportalturismoportugal.lemonsqueezy.com%2Fcheckout%2Fbuy%2F2d56d759-3e65-46cb-9210-ea7c0fce2cb3%3Fenabled%3D1475549%26checkout%5Bsuccess_url%5D%3Dhttps%3A%2F%2Fportalturismoportugal.com%2Fconta.html%3Factivated%3D1#register
```

**Current redirect target:** `/conta.html?activated=1`

---

## 2. Target checkout URLs (after)

After the `pro/welcome.html` page is deployed and verified in production, update
all checkout `success_url` references to point to the new onboarding page.

### JavaScript object `LS_CHECKOUT` (target)

```
pro_monthly: 'https://portalturismoportugal.lemonsqueezy.com/checkout/buy/2d56d759-3e65-46cb-9210-ea7c0fce2cb3?enabled=1475549&checkout[success_url]=https%3A%2F%2Fportalturismoportugal.com%2Fpro%2Fwelcome.html'

pro_annual:  'https://portalturismoportugal.lemonsqueezy.com/checkout/buy/5cc5346d-1dfa-4cdf-9632-45effbf8d943?checkout[success_url]=https%3A%2F%2Fportalturismoportugal.com%2Fpro%2Fwelcome.html'
```

### HTML fallback CTA href (target)

```
login.html?redirect=https%3A%2F%2Fportalturismoportugal.lemonsqueezy.com%2Fcheckout%2Fbuy%2F2d56d759-3e65-46cb-9210-ea7c0fce2cb3%3Fenabled%3D1475549%26checkout%5Bsuccess_url%5D%3Dhttps%3A%2F%2Fportalturismoportugal.com%2Fpro%2Fwelcome.html#register
```

**New redirect target:** `/pro/welcome.html`

> Note: The `ls_order={order_id}` query param is injected by the LS Dashboard
> redirect URL setting (not the `success_url` param). If the dashboard redirect
> is set, it takes precedence over `success_url`. Keep both in sync.

---

## 3. Exact before/after diffs

### 3a. `precos.html` — LS_CHECKOUT object (line ~1241-1242)

**BEFORE:**
```javascript
const LS_CHECKOUT = {
  pro_monthly: 'https://portalturismoportugal.lemonsqueezy.com/checkout/buy/2d56d759-3e65-46cb-9210-ea7c0fce2cb3?enabled=1475549&checkout[success_url]=https%3A%2F%2Fportalturismoportugal.com%2Fconta.html%3Factivated%3D1',
  pro_annual:  'https://portalturismoportugal.lemonsqueezy.com/checkout/buy/5cc5346d-1dfa-4cdf-9632-45effbf8d943?checkout[success_url]=https%3A%2F%2Fportalturismoportugal.com%2Fconta.html%3Factivated%3D1',
};
```

**AFTER:**
```javascript
const LS_CHECKOUT = {
  pro_monthly: 'https://portalturismoportugal.lemonsqueezy.com/checkout/buy/2d56d759-3e65-46cb-9210-ea7c0fce2cb3?enabled=1475549&checkout[success_url]=https%3A%2F%2Fportalturismoportugal.com%2Fpro%2Fwelcome.html',
  pro_annual:  'https://portalturismoportugal.lemonsqueezy.com/checkout/buy/5cc5346d-1dfa-4cdf-9632-45effbf8d943?checkout[success_url]=https%3A%2F%2Fportalturismoportugal.com%2Fpro%2Fwelcome.html',
};
```

---

### 3b. `precos.html` — HTML fallback CTA href (line ~795)

**BEFORE:**
```html
<a href="login.html?redirect=https%3A%2F%2Fportalturismoportugal.lemonsqueezy.com%2Fcheckout%2Fbuy%2F2d56d759-3e65-46cb-9210-ea7c0fce2cb3%3Fenabled%3D1475549%26checkout%5Bsuccess_url%5D%3Dhttps%3A%2F%2Fportalturismoportugal.com%2Fconta.html%3Factivated%3D1#register"
```

**AFTER:**
```html
<a href="login.html?redirect=https%3A%2F%2Fportalturismoportugal.lemonsqueezy.com%2Fcheckout%2Fbuy%2F2d56d759-3e65-46cb-9210-ea7c0fce2cb3%3Fenabled%3D1475549%26checkout%5Bsuccess_url%5D%3Dhttps%3A%2F%2Fportalturismoportugal.com%2Fpro%2Fwelcome.html#register"
```

---

### 3c. `en/precos.html` — LS_CHECKOUT object (line ~1260-1261)

Same diff as 3a above — identical JS object, same replacement.

---

### 3d. `en/precos.html` — HTML fallback CTA href (line ~791)

Same diff as 3b above — identical href, same replacement.

---

### 3e. LemonSqueezy Dashboard — Product redirect URL

**BEFORE (current setting):**
```
https://portalturismoportugal.com/conta.html?activated=1
```
(or empty — if empty, `success_url` param in the checkout link takes effect)

**AFTER:**
```
https://portalturismoportugal.com/pro/welcome.html?ls_order={order_id}
```

The `{order_id}` template variable is substituted by LemonSqueezy at redirect time.
The `pro/welcome.html` page reads it via `new URLSearchParams(location.search).get('ls_order')`.

---

## 4. LemonSqueezy Dashboard — step-by-step

### Prerequisites
- Admin access to https://app.lemonsqueezy.com
- Store `#333117` (portalturismoportugal) selected

### Step 1 — Navigate to the monthly Pro product

1. Go to https://app.lemonsqueezy.com
2. In the left sidebar, click **Store** → **Products**
3. Find the product **"Pro — €4,99/mês"** (or equivalent monthly variant)
4. Click the product name to open its detail page
5. Click the **Variants** tab (or scroll to the Variants section)
6. Click the **monthly variant** to open its settings

### Step 2 — Update redirect URL for monthly variant

1. Scroll to the **"Redirect URL after purchase"** field  
   (also labelled "Thank-you redirect URL" in some dashboard versions)
2. Clear the current value
3. Enter:
   ```
   https://portalturismoportugal.com/pro/welcome.html?ls_order={order_id}
   ```
4. Click **Save** (or **Update variant**)

### Step 3 — Repeat for the annual Pro variant

1. Return to the **Variants** tab of the same product
2. Click the **annual variant** to open its settings
3. Repeat Step 2 — same redirect URL:
   ```
   https://portalturismoportugal.com/pro/welcome.html?ls_order={order_id}
   ```
4. Click **Save**

### Step 4 — Verify webhook configuration

The `pro/welcome.html` page polls the Supabase `profiles` table to detect when
the LS webhook has set `plan = 'pro'`. Confirm the webhook is active:

1. In LS Dashboard → **Store** → **Webhooks**
2. Confirm webhook URL is set to the Supabase Edge Function:
   ```
   https://[supabase-project-ref].supabase.co/functions/v1/ls-webhook
   ```
3. Confirm **"Subscription Created"** and **"Order Created"** events are enabled
4. Note the webhook signing secret — it must match `LS_WEBHOOK_SECRET` in the
   Supabase Edge Function environment

---

## 5. Deploy commands

After updating `precos.html` and `en/precos.html` in the local repo:

### Commit the changes
```bash
cd "C:/Users/Powerpc/Portal-turismo-site"
git add precos.html en/precos.html
git commit -m "feat: update checkout success_url to /pro/welcome.html"
```

### Deploy to Cloudflare Pages (production)
```bash
cd "C:/Users/Powerpc/Portal-turismo-site"
npx wrangler pages deploy . --project-name portal-turismo-portugal-site --commit-dirty=true
```

Expected output:
```
Deploying your files to Cloudflare Pages. This might take a moment.
Success! Your site was deployed to https://portal-turismo-portugal-site.pages.dev
```

The custom domain `https://portalturismoportugal.com` propagates from Cloudflare
Pages automatically — no additional DNS changes needed.

---

## 6. Validation checklist

Run these checks after deploying, in order.

### 6a. Pre-deploy smoke (staging URL)

- [ ] Open https://portal-turismo-portugal-site.pages.dev/precos.html
- [ ] Inspect page source or DevTools → confirm `success_url` contains `/pro/welcome.html`
- [ ] Inspect JS `LS_CHECKOUT.pro_monthly` in console — confirm no `conta.html` reference
- [ ] Inspect JS `LS_CHECKOUT.pro_annual` in console — confirm no `conta.html` reference

### 6b. Test-mode checkout (LemonSqueezy test mode)

1. In LS Dashboard, toggle **Test Mode** ON (top-right switch)
2. Open https://portalturismoportugal.com/precos.html in an incognito window
3. Click **Ativar Pro** → go through checkout with test card:
   ```
   Card number: 4242 4242 4242 4242
   Expiry: any future date
   CVC: any 3 digits
   ```
4. Confirm browser redirects to `/pro/welcome.html?ls_order=...`
5. Confirm the page shows the **"Processing"** state initially (webhook pending)
6. Within 10 seconds, confirm page transitions to **"Pro confirmado"** state
   (requires webhook to fire and update `profiles.plan = 'pro'`)
7. Toggle Test Mode OFF after validation

### 6c. Dashboard redirect URL confirmation

- [ ] LS Dashboard → Products → Pro monthly variant → Redirect URL field shows:
  `https://portalturismoportugal.com/pro/welcome.html?ls_order={order_id}`
- [ ] LS Dashboard → Products → Pro annual variant → Redirect URL field shows:
  `https://portalturismoportugal.com/pro/welcome.html?ls_order={order_id}`

### 6d. No regressions

- [ ] `conta.html?activated=1` is no longer reachable via any checkout path
  (old bookmarks still load `conta.html` directly — that is acceptable)
- [ ] `en/precos.html` "Activate Pro" button uses `/pro/welcome.html` (not `conta.html`)
- [ ] Anonymous user clicking "Ativar Pro" is routed through `login.html?redirect=...`
  and after auth lands on LS checkout → `/pro/welcome.html`

---

## 7. Rollback plan

If the `pro/welcome.html` page has a critical bug in production:

### Option A — Revert checkout URLs in code (preferred)

1. In `precos.html` and `en/precos.html`, revert `LS_CHECKOUT` and HTML fallback
   href to original values (use git):
   ```bash
   cd "C:/Users/Powerpc/Portal-turismo-site"
   git revert HEAD
   npx wrangler pages deploy . --project-name portal-turismo-portugal-site --commit-dirty=true
   ```

### Option B — Override via LS Dashboard only (faster, no code deploy)

1. LS Dashboard → Products → Pro monthly variant → Redirect URL
2. Replace with:
   ```
   https://portalturismoportugal.com/conta.html?activated=1
   ```
3. Repeat for annual variant
4. This is effective immediately — no code deploy needed
5. The `success_url` param in the checkout link still points to `welcome.html`
   but the LS Dashboard redirect URL takes precedence, so users land on `conta.html`

### Option C — Emergency: remove redirect URL from LS Dashboard

1. LS Dashboard → clear the "Redirect URL after purchase" field entirely for both variants
2. LemonSqueezy then falls back to the `checkout[success_url]` param in the link
3. If step 2 from rollback Option A was done concurrently, users land on `conta.html`

---

## Quick reference — product/variant IDs

| Variant        | Checkout UUID                            | Price        |
|----------------|------------------------------------------|--------------|
| Pro Monthly    | `2d56d759-3e65-46cb-9210-ea7c0fce2cb3`  | €4,99/mês    |
| Pro Annual     | `5cc5346d-1dfa-4cdf-9632-45effbf8d943`  | €44,88/ano   |

Checkout base URL pattern:
```
https://portalturismoportugal.lemonsqueezy.com/checkout/buy/{UUID}
```

---

*This file lives at `Portal-turismo-site/LS-SETUP.md` and is the authoritative
reference for all LemonSqueezy configuration. Update it whenever checkout URLs,
variants, or webhook settings change.*
