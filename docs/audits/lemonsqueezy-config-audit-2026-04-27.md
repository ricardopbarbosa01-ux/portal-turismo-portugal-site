# Auditoria de Configuração LemonSqueezy — Transição Test → Live

**Data:** 2026-04-27  
**Auditor:** Claude Code (Playwright browser automation)  
**Método:** Leitura visual do LS Dashboard — zero alterações efectuadas  
**Scope:** Test mode → Live mode readiness

---

## ⚠️ AVISO CRÍTICO — Ler antes do sumário

O webhook está **completamente inoperacional** em test mode. Todas as 20+ deliveries observadas retornam `401 UNAUTHORIZED_NO_AUTH_HEADER`. As 7 subscrições de teste **nunca activaram o plano Pro** no PTH. Este bug existe em produção desde o início dos testes.

---

## Secção 1 — Modo da Conta

| Campo | Valor |
|-------|-------|
| Modo atual | **Test mode** (toggle laranja activo) |
| Banner de confirmação | "Test mode: These webhooks will only work with test mode data." |
| Live mode disponível? | **NÃO** — store não activada para live sales |
| Indicação de aprovação live | Nenhuma — "Activate your store to accept live sales" em Settings → General |

---

## Secção 2 — Store

| Campo | Valor |
|-------|-------|
| Nome | Portugal Travel Hub |
| Store ID | **#333117** |
| URL LS | `portalturismoportugal.lemonsqueezy.com` |
| Email de contacto | `ola@portalturismoportugal.com` |
| Moeda | EUR |
| Status | Activa (em test mode) — **não activada para live** |

---

## Secção 3 — Webhooks (CRÍTICO)

### Webhook configurado (Test mode)

| Campo | Valor |
|-------|-------|
| URL | `https://glupdjvdvunogkqgxoui.supabase.co/functions/v1/ls-webhook` |
| Webhook ID | `a1929de7-8cbe-45f3-86c5-8fec0c9a5826` |
| Modo | **Test mode apenas** — nenhum webhook em live mode configurado |
| Eventos subscritos (3) | `subscription_created`, `subscription_payment_success`, `subscription_updated` |
| Eventos em falta | `subscription_cancelled`, `subscription_expired` (tratados no código mas **não subscritos no LS**) |
| Signing secret | **Existe** (não reproduzido neste relatório — visível na screenshot) |
| Retries | Não configurável na UI actual do LS — sem informação visível |

### ❌ BUG CRÍTICO P0 — 100% de falha nas deliveries

**Todas as deliveries retornam:**
```
HTTP 401
{"code":"UNAUTHORIZED_NO_AUTH_HEADER","message":"Missing authorization header"}
```

**Causa raiz:** A Supabase Edge Function `ls-webhook` foi deployada **sem** o flag `--no-verify-jwt`. O gateway da Supabase rejeita o request do LemonSqueezy antes de este chegar ao código da função — o LS não envia um JWT de autorização Supabase, pelo que o request é bloqueado ao nível do proxy.

A verificação HMAC-SHA256 com o `x-signature` header (implementada dentro da função) **nunca é executada** — o request não chega sequer ao código.

### Recent Deliveries (últimas 20 visíveis — todas com ×)

| # | Evento | Data | Status HTTP |
|---|--------|------|-------------|
| 1 | `subscription_created` | 18 Abr, 11:14 | **401** |
| 2 | `subscription_payment_success` | 18 Abr, 11:13 | **401** |
| 3 | `subscription_payment_success` | 18 Abr, 11:09 | **401** |
| 4 | `subscription_payment_success` | 18 Abr, 10:56 | **401** |
| 5 | `subscription_updated` | 18 Abr, 10:56 | **401** |
| 6 | `subscription_created` | 18 Abr, 10:55 | **401** |
| 7 | `subscription_updated` | 17 Abr, 13:35 | **401** |
| 8 | `subscription_payment_success` | 17 Abr, 13:34 | **401** |
| 9 | `subscription_created` | 17 Abr, 13:34 | **401** |
| 10 | `subscription_created` | 16 Abr, 12:00 | **401** |
| … | … | … | **401** |

> Taxa de sucesso: **0%** — sem uma única delivery bem-sucedida observada.

---

## Secção 4 — Produtos

| Campo | Valor |
|-------|-------|
| Nome | Portugal Travel Hub Pro |
| Product ID | 938728 |
| Status | **Published** |
| Modo | Test mode (único produto, sem versão live separada) |
| Redirect URL no produto | **Não configurada** — gerida via `checkout[success_url]` no código |

### Variants

| # | Nome | Variant ID | Preço |
|---|------|-----------|-------|
| 1 | Pro Annual | — (não exposto na payload) | €44.88 / ano |
| 2 | Pro Monthly | **1475549** | €4.99 / mês |

> Variant ID `1475549` confirmado via payload do webhook.  
> Nota: apenas Pro Monthly tem vendas em test mode; Pro Annual tem 0 vendas.

### Redirect URL (como configurada no código PTH)

Gerida em `precos.html` via query param no URL de checkout:
```
checkout[success_url]=https://portalturismoportugal.com/conta.html?activated=1
```
**Não existe redirect URL configurada a nível do produto no LS.** Esta abordagem é válida mas frágil (depende do código JS do cliente).

---

## Secção 5 — API Keys

| Modo | Nº de Keys |
|------|-----------|
| Test mode | **0** — nenhuma key criada |
| Live mode | Não verificável (toggle não responsivo ao JS) |

> Sem API keys em test mode. Para live mode será necessário criar uma key live.

---

## Secção 6 — Tax / Compliance

| Campo | Valor |
|-------|-------|
| Identity verification | **❌ REJECTED** |
| Indicação de razão | Não visível na UI sem clicar em "Verify your identity" |
| Conta bancária | ✅ Ligada — Bank Account `**** 0105` (EUR) |
| PayPal | Não ligado |
| W-8BEN / Tax forms | Não visível como secção separada — provavelmente parte da identity verification |
| Payout pendente | 14 Mai 2026 — `**** 0105` — Pending — $0.00 |

> **Contradição detectada:** Setup page mostra step 3 "Verify your identity" com ✅ verde, mas Settings → General mostra status **"Rejected"**. O setup considera o passo "feito" (formulário submetido) mesmo que tenha sido rejeitado posteriormente.

---

## Secção 7 — Recent Activity

### Test mode (período 28 Mar – 27 Abr 2026)

| Métrica | Valor |
|---------|-------|
| Total subscriptions | 7 |
| New subscriptions | 7 |
| Active subscriptions | 7 |
| All revenue | €34.90 |
| Avg. order revenue | €4.99 |
| MRR (test) | €34.93 |
| Refunds | 0 |
| Subscription churn | 0% |

### Subscrições de teste (todas Pro Monthly, todas Active)

| Order # | Data | Cliente | Produto |
|---------|------|---------|---------|
| #3331177 | 18 Abr | Teste20 | Pro Monthly |
| #3331176 | 17 Abr | ascscSDSDVC | Pro Monthly |
| #3331175 | 16 Abr | ascscSDSDVC | Pro Monthly |
| #3331174 | 15 Abr | Teste10 | Pro Monthly |
| #3331173 | 1 Abr | teste | Pro Monthly |
| #3331172 | 1 Abr | teste | Pro Monthly |
| #3331171 | 1 Abr | ascscSDSDVC | Pro Monthly |

> ⚠️ Nenhuma destas subscrições activou o plano Pro no PTH — o webhook falhou em todas.

### Live mode

| Métrica | Valor |
|---------|-------|
| Total orders | **0** |
| Total revenue | **€0.00** |
| Subscriptions | **0** |

> A store nunca recebeu uma transação real. Live mode virgem.

---

## Sumário

### ✅ Pronto para live mode

- Produto "Portugal Travel Hub Pro" publicado com 2 variants (Monthly/Annual)
- Conta bancária EUR ligada e activa
- Signing secret configurado no webhook
- Redirect URL funcional (via `checkout[success_url]` no código PTH)
- Store URL `portalturismoportugal.lemonsqueezy.com` configurada

### ⚠️ Falta configurar / replicar

- **Webhook live mode:** Não existe — apenas test mode. Criar webhook idêntico em live mode após resolver o 401
- **API Key live:** Nenhuma criada — necessária para chamadas programáticas à API LS em live
- **Eventos em falta:** `subscription_cancelled` e `subscription_expired` não subscritos (código trata-os mas LS não os envia)
- **Redirect URL ao nível do produto:** Actualmente só via código JS — considerar configurar também no LS como fallback

### ❌ Bloqueadores reais

| # | Bloqueador | Impacto | Prioridade |
|---|-----------|---------|-----------|
| 1 | **Webhook 401** — `ls-webhook` deployada sem `--no-verify-jwt` | Pro activation 100% quebrada em test e live | **P0 — corrigir antes de qualquer outro passo** |
| 2 | **Identity verification REJECTED** | Impede activação do live mode e payouts reais | **P0 — contactar LS support** |
| 3 | **Nenhum webhook em live mode** | Após live mode activado, Pro activation não funciona em real | P1 — criar após resolver #1 e #2 |
| 4 | **0 API keys** | Sem capacidade de debug ou chamadas server-side à API LS | P1 |

---

## Próximos passos sugeridos (por prioridade)

**P0 — Esta semana (bloqueiam tudo)**

1. **Resolver identity verification rejected:**
   - Ir a Settings → General → "Verify your identity" → ver razão da rejeição
   - Submeter novamente com documentação correcta
   - Contactar support@lemonsqueezy.com se motivo não for claro

2. **Re-deployar `ls-webhook` com `--no-verify-jwt`:**
   ```bash
   cd Portal-turismo-site
   npx supabase functions deploy ls-webhook \
     --project-ref glupdjvdvunogkqgxoui \
     --no-verify-jwt
   ```
   Depois usar o botão "Resend" no LS Dashboard para re-testar a última delivery.

**P1 — Após P0 resolvido**

3. **Verificar webhook funcionando:** Usar "Resend" numa delivery recente e confirmar HTTP 200
4. **Adicionar eventos em falta ao webhook:** `subscription_cancelled`, `subscription_expired`
5. **Criar API key em live mode** (após live mode activado)
6. **Criar webhook em live mode** com mesma URL, mesmos eventos, mesmo signing secret

**P2 — Antes de primeiros clientes reais**

7. **Validar fluxo completo E2E** em test mode após fix do 401:
   - Checkout test → webhook → `app_metadata.plan='pro'` → conta.html confirma Pro
8. **Aumentar `MAX_ATTEMPTS`** em `conta.html:237` de 6 → 10 (ver audit anterior)

---

*Relatório gerado por leitura visual via Playwright. Nenhum ficheiro ou configuração foi alterado durante esta auditoria.*
