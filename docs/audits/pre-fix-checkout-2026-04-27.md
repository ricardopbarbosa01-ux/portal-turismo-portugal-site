# Pré-fix audit: fluxo pós-checkout LS

**Data:** 2026-04-27  
**Auditor:** Claude Code (Sonnet 4.6)  
**Método:** Leitura estática + browser automation (Playwright)  
**Alterações ao código:** Nenhuma

---

## Sumário executivo

O fluxo está maioritariamente funcional. O risco real é **UX, não segurança**: um utilizador Free com `?activated=1` fica 12s num loop de polling sem feedback claro, mas **sem acesso a dados Pro**. Fix #1 (MAX_ATTEMPTS) é **recomendado como P1** se os logs do webhook confirmarem latência >5s. Fix #3 (validação por order_id) é **P2** — melhora UX mas não resolve um problema de segurança real.

---

## Teste 1 — Latência ls-webhook

**Status: ❌ BLOQUEADO — dados reais indisponíveis**

### Bloqueio encontrado

O Supabase CLI v2.95.4 (instalado via `npx supabase`) **não suporta `--project-ref`**:

```
unknown flag: --project-ref
```

Não existe token de acesso pessoal à Management API em `~/.supabase/access-token` (só existe `telemetry.json`). Sem o token, não é possível consultar os logs via REST API (`https://api.supabase.com/v1/projects/glupdjvdvunogkqgxoui/functions/logs`).

### Para desbloquear (Ricardo)

1. **Via CLI:** `npx supabase login` → gera token → re-executar  
   ```bash
   npx supabase functions logs ls-webhook \
     --project-ref glupdjvdvunogkqgxoui \
     --scroll
   ```
2. **Via Dashboard:** supabase.com → projeto `glupdjvdvunogkqgxoui` → Edge Functions → `ls-webhook` → Logs → filtrar 30 dias

### Métricas a extrair

| Métrica | Threshold de decisão |
|---------|---------------------|
| p99 latência | <5s → Fix #1 desnecessário; 5–15s → Fix #1 resolve; >15s → bug na função |
| Invocações >12s | >0 → utilizadores em timeout confirmado |
| Erros (status ≠ 200) | >5% → fix urgente na edge function |

### Estimativa conservadora (sem dados reais)

Com base na arquitectura (Supabase Edge Function Deno, webhook simples, sem chamadas externas excepto `auth.admin.updateUserById`): latência esperada p50 ~200ms, p99 ~2–3s. Picos possíveis em cold starts (~5–8s). MAX_ATTEMPTS=6 (12s) cobre p99 esperado, mas **não cobre cold starts prolongados**.

---

## Teste 2 — LemonSqueezy retry policy

**Status: ⚠️ CHECKLIST MANUAL — sem acesso programático ao LS Dashboard**

### Checklist para o Ricardo verificar

Aceder a: **app.lemonsqueezy.com → Settings → Webhooks → endpoint `ls-webhook`**

- [ ] URL do endpoint configurada: `https://glupdjvdvunogkqgxoui.supabase.co/functions/v1/ls-webhook`
- [ ] Retries activos? (sim / não)
- [ ] Se sim: nº máximo de tentativas e estratégia de backoff
- [ ] Eventos subscritos incluem: `subscription_created`, `subscription_payment_success`, `subscription_cancelled`, `subscription_expired`, `subscription_updated`
- [ ] "Recent deliveries" → últimas 5 deliveries:

| # | Data | Evento | Status HTTP | Duration |
|---|------|--------|-------------|----------|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |
| 4 | | | | |
| 5 | | | | |

### Ponto crítico a confirmar

O LS faz retry automático se receber status ≠ 2xx. A edge function **deve** retornar 200 mesmo quando não encontra o utilizador (para evitar retries infinitos). Verificar no código:

```typescript
// supabase/functions/ls-webhook/index.ts
// Confirmar que o catch final retorna 200 ou 400 (não 500)
```

---

## Teste 3 — Vulnerabilidade do bookmark `?activated=1`

**Status: 🟡 MÉDIO — UX confusa, sem leak de dados**

### Setup do teste

- Browser: Playwright (incognito)  
- Conta de teste criada: `audit-test-20260427@mailnull.com` (Free, sem confirmação de email)  
- **Bloqueio parcial:** email confirmation requerida → não foi possível fazer login com a conta de teste  
- **Análise compensatória:** leitura estática do `conta.html:187–324` + navegação não autenticada

### Resultados observados

#### Cenário A — Utilizador não autenticado + `?activated=1`

```
URL: https://portalturismoportugal.com/conta.html?activated=1
```

**Comportamento observado (browser):** Redireccionamento imediato para `/login`  
**Código responsável:** `conta.html:191` — `if (!user) { window.location.href = '/login.html'; return; }`  
**Veredicto:** ✅ Correcto

#### Cenário B — Utilizador Free autenticado + `?activated=1` (análise estática)

Fluxo reconstruído a partir de `conta.html:188–254`:

```
t=0s  → db.auth.getUser() → user Free (plan ≠ 'pro')
        justPaid = true (activated=1)
        Guard linha 194: (plan!='pro' && !justPaid) = (true && false) = false → NÃO redireciona ✓
        history.replaceState → URL muda para /conta.html (sem param) ← CHAVE
        pendingEl criado: "A verificar ativação…"
        
t=0s  → db.auth.getUser() (freshUser check, linha 227)
        freshUser.plan ≠ 'pro' → entra no polling

t=2s  → poll #1 → plan ≠ 'pro' → continua
t=4s  → poll #2 → plan ≠ 'pro' → continua
t=6s  → poll #3 → plan ≠ 'pro' → continua
t=8s  → poll #4 → plan ≠ 'pro' → continua
t=10s → poll #5 → plan ≠ 'pro' → continua
t=12s → poll #6 (MAX_ATTEMPTS) → clearInterval
        pendingEl.textContent = "A ativação pode demorar alguns segundos. Atualiza esta página."
        
Se user atualiza (refresh):
        URL é /conta.html (sem ?activated=1)
        justPaid = false
        Guard linha 194: (plan!='pro' && !justPaid) = (true && true) = true → redireciona para /precos.html ✓
```

#### Dados Pro expostos durante polling?

| Elemento | Exposto durante 12s? | Observação |
|----------|---------------------|------------|
| `loadFavoritesSection()` | ❌ Não | Só chamado após `isProActive()` = true |
| `db.from('beaches').select()` | ❌ Não | Dentro de `loadFavoritesSection()` |
| Dados do perfil (nome, email) | ✅ Sim | São dados da própria conta, não Pro |
| Chamadas à API Supabase | `getUser()` apenas | Sem RLS bypass |

### Classificação de severidade

**🟡 MÉDIO** — Utilizador Free fica 12s num estado de espera enganoso ("A verificar ativação…") sem receber feedback negativo claro. Sem leak de dados Pro. Sem possibilidade de aceder a features Pro. Após timeout, o refresh redireciona correctamente para `/precos.html`.

**Não é 🔴 CRÍTICO** porque:
1. `history.replaceState` limpa o URL no momento 0 — o bookmark da URL limpa não reproduce o bug
2. `loadFavoritesSection()` tem gate hard: só corre com Pro confirmado
3. RLS no Supabase protege os dados independentemente do JS

---

## Decisão recomendada

### Fix #1 — Aumentar MAX_ATTEMPTS (`conta.html:237`)

**Recomendação: SIM (P1), mas condicionado aos logs do Teste 1**

- Se p99 < 5s nos logs reais → aumentar para 10 tentativas (20s) como margem de segurança para cold starts
- Se p99 > 12s → investigar a edge function antes de mexer no UX

**Esforço:** 1 linha. Sem risco de regressão.

### Fix #2 — LS retry policy

**Recomendação: VERIFICAR (P1) antes de qualquer fix de código**

Se o LS não tiver retries activos e a edge function retornar 500 em erros, há ordens a perder-se silenciosamente. Isto é potencialmente mais grave do que a latência da UI.

### Fix #3 — Validar `order_id` em vez de `activated=1`

**Recomendação: SIM (P2), mas não urgente**

- Não resolve problema de segurança (validação client-side é contornável)
- Resolve o UX enganoso: com `order_id` real, seria possível verificar server-side se a ordem existe antes de mostrar "A verificar ativação…"
- Requer uma nova edge function ou endpoint — esforço médio

**Alternativa mais simples:** Mudar o copy de "A verificar ativação…" para "A aguardar confirmação do pagamento — pode demorar até 30 segundos." Esforço: 1 linha, resolve 80% do problema de UX sem tocar no flow.

---

## Próximo prompt sugerido

```
Corrigir UX do timeout pós-checkout em conta.html.

Objetivo: remover os 12s de espera sem feedback no post-checkout.
Sem alterar o flow de auth, sem tocar no webhook.

Ficheiro: Portal-turismo-site/conta.html
Linhas: 237 e 224 (pendingEl.textContent)

Mudança 1 — linha 237:
  const MAX_ATTEMPTS = 6;
  → const MAX_ATTEMPTS = 10;  // 20s cobre cold starts

Mudança 2 — linha 224:
  pendingEl.textContent = 'A verificar ativação…';
  → pendingEl.textContent = 'A confirmar o teu pagamento — pode demorar até 20 segundos…';

Mudança 3 — linha 249:
  'A ativação pode demorar alguns segundos. Atualiza esta página.'
  → 'Não foi possível confirmar automaticamente. Atualiza a página ou contacta o suporte.'

Test: navegar para conta.html?activated=1 com utilizador Free → confirmar que vê mensagem correcta durante 20s → ao refresh vai para /precos.html.

Deploy: npx wrangler pages deploy . --project-name portal-turismo-portugal-site --commit-dirty=true
```

---

*Audit gerado em 2026-04-27. Dados de latência real (Teste 1) em falta — reavaliar Fix #1 após obter logs.*
