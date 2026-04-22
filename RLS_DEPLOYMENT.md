# RLS Deployment Checklist — Partner Portal

**Migrations aplicadas:**
- `supabase/migrations/20260422000000_partner_rls.sql`
- `supabase/migrations/20260422000100_plan_requests_source_tracking.sql`

**Status:** CONCLUÍDO — migrations aplicadas, testes T1–T3 passaram

---

## Schema real validado

> Validado diretamente no Supabase — usar como fonte de verdade para INSERTs e futuros testes.

### Tabela `partners`

| Coluna | Tipo | Notas |
|--------|------|-------|
| `email_contacto` | text | **NOT NULL** — obrigatório em todos os INSERTs |
| `tipo` | text | CHECK constraint — valores permitidos: `surf`, `alojamento`, `pesca`, `restauracao`, `atividades`, `outro` |

### Tabela `plan_requests` — 20 colunas (schema completo)

| Coluna | Tipo | Notas |
|--------|------|-------|
| `id` | uuid | PK, default `gen_random_uuid()` |
| `created_at` | timestamptz | default `now()` — **auto, não enviar no payload** |
| `user_id` | uuid | FK → auth.users, nullable |
| `full_name` | text | |
| `email` | text | |
| `regiao` | text | |
| `interesses` | text | ⚠️ era `interesse` (typo corrigido em fix anterior) |
| `data_inicio` | text | |
| `data_fim` | text | |
| `notas` | text | |
| `source_page` | text | adicionada via migration 20260422000100 |
| `source_beach` | text | adicionada via migration 20260422000100 |
| `source_region` | text | adicionada via migration 20260422000100 |
| `source_partner_type` | text | adicionada via migration 20260422000100 |
| `source_partner_name` | text | adicionada via migration 20260422000100 |
| `source_vertical` | text | adicionada via migration 20260422000100 |
| `intent_type` | text | adicionada via migration 20260422000100 |
| `page_url` | text | adicionada via migration 20260422000100 |
| *(+ colunas internas Supabase)* | | `updated_at`, etc. |

### Verificar CHECK constraints antes de inserir

```sql
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'public.partners'::regclass
  AND contype = 'c';
```

---

## Bugs pré-existentes descobertos em T3

Os testes de integração revelaram dois bugs no payload do frontend que foram corrigidos:

| Bug | Coluna afetada | Problema | Correção |
|-----|---------------|---------|---------|
| Typo de coluna | `interesses` | Frontend enviava `interesse` (sem s) — INSERT silencioso falha por RLS | Corrigido em `fix(planear): corrigir coluna 'interesse' → 'interesses'` |
| Coluna inexistente | `timestamp` | Frontend enviava `timestamp` — coluna nunca existiu; `created_at` é auto | Removida de todos os 5 handlers em `planear.html` e `en/planear.html` |
| Colunas em falta | `source_*`, `intent_type`, `page_url` | 8 colunas de source tracking referenciadas no payload mas inexistentes na tabela | Criadas via migration `20260422000100_plan_requests_source_tracking.sql` |

---

## Resultados dos Testes

| Teste | Descrição | Resultado |
|-------|-----------|-----------|
| T1 | Anon pode inserir em `plan_requests` | ✅ PASS |
| T2 | Anon não consegue fazer SELECT em `plan_requests` | ✅ PASS |
| T3 | Parceiro vê apenas leads da sua região | ✅ PASS — revelou bugs pré-existentes (ver acima) |
| T4 | Parceiro não consegue ler outras regiões | pendente |
| T5 | Parceiro consegue ler o próprio perfil | pendente |
| T6 | Não-admin não acessa `lead_meta` | pendente |

---

## Pre-flight

- [x] Confirm no existing RLS policies on `plan_requests`, `partners`, `partner_leads`
- [x] Confirm `crm_operators_all` policy exists on `lead_meta` (substituída)

---

## Setup Steps

### 1 — Create test user in Supabase Auth Dashboard

- Go to: Authentication → Users → Invite User
- Email: `parceiro-teste-algarve@portalturismoportugal.com`
- Set a temporary password manually after creation

### 2 — Copy the UUID

- Click the new user in the Users list
- Copy the UUID from the user detail panel

### 3 — Replace placeholder in test-rls-setup.sql

Open `_scripts/test-rls-setup.sql` and replace `<UUID-PARCEIRO-TESTE>` with the real UUID.

> ⚠️ `_scripts/test-rls-setup.sql` está no `.gitignore` — contém UUID real e dados de teste, nunca deve ir para produção.

### 4 — Run test data setup

In Supabase Dashboard → SQL Editor:

```sql
-- Paste contents of _scripts/test-rls-setup.sql
```

### 5 — Run the migrations (já aplicadas)

```sql
-- 20260422000000_partner_rls.sql        ✅ aplicada
-- 20260422000100_plan_requests_source_tracking.sql  ✅ aplicada
```

---

## Tests (run in order)

### T1 — Anon can insert into plan_requests
```sql
-- As anon (no JWT): verify insert returns no RLS error
-- Expected: INSERT succeeds
-- Result: ✅ PASS
```

### T2 — Anon cannot select from plan_requests
```sql
-- As anon: select * from plan_requests
-- Expected: 0 rows (RLS filters all rows)
-- Result: ✅ PASS
```

### T3 — Partner sees only own-region leads
```sql
-- Authenticated as parceiro-teste-algarve@portalturismoportugal.com
select * from plan_requests;
-- Expected: 1 row (algarve only), alentejo and oeste rows NOT returned
-- Result: ✅ PASS — revelou bugs pré-existentes no payload do frontend
```

### T4 — Partner cannot read other regions
```sql
-- Authenticated as partner, try to filter by regiao = 'alentejo'
select * from plan_requests where regiao = 'alentejo';
-- Expected: 0 rows
```

### T5 — Partner can read own profile
```sql
-- Authenticated as partner
select * from partners where user_id = auth.uid();
-- Expected: 1 row (own profile)
```

### T6 — Non-admin cannot access lead_meta
```sql
-- Authenticated as partner (no admin role in app_metadata)
select * from lead_meta;
-- Expected: 0 rows or RLS policy error
```

---

## Outcome

| Result | Action |
|--------|--------|
| All 6 tests PASS | Deploy concluído |
| Any test FAILS | Run rollback SQL below, investigate, adjust migration, re-test |

---

## Rollback SQL

```sql
DROP POLICY IF EXISTS "anon_insert_plan_request"        ON public.plan_requests;
DROP POLICY IF EXISTS "partner_select_own_region"       ON public.plan_requests;
DROP POLICY IF EXISTS "admin_all_plan_requests"         ON public.plan_requests;
DROP POLICY IF EXISTS "partner_select_own_profile"      ON public.partners;
DROP POLICY IF EXISTS "partner_update_own_profile"      ON public.partners;
DROP POLICY IF EXISTS "admin_all_partners"              ON public.partners;
DROP POLICY IF EXISTS "anon_insert_partner_application" ON public.partner_leads;
DROP POLICY IF EXISTS "admin_select_partner_leads"      ON public.partner_leads;
DROP POLICY IF EXISTS "admin_all_lead_meta"             ON public.lead_meta;

-- Restore original lead_meta policy
CREATE POLICY "crm_operators_all"
  ON public.lead_meta FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Clean up test data
DELETE FROM public.partners      WHERE email = 'parceiro-teste-algarve@portalturismoportugal.com';
DELETE FROM public.plan_requests WHERE email LIKE 'test-%@example.com';
```
